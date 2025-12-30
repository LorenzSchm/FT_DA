import {
  View,
  Text,
  useWindowDimensions,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { useState, useEffect } from "react";
import Card from "./Card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import AddAccountModal from "@/components/modals/AddAccountModal";
import AddTransactionModal from "@/components/modals/AddTransactionModal";
import AddSubscriptionModal from "@/components/modals/AddSubscriptionModal";
import { useAuthStore } from "@/utils/authStore";
import { getAccounts, getTransactions } from "@/utils/db/finance/finance";
import { getSubscriptions } from "@/utils/db/finance/subscriptions/subscriptions";
import { Skeleton } from "@/components/ui/skeleton";
import { getData } from "@/utils/db/connect_accounts/connectAccounts";

enum STATE {
  DEFAULT = "DEFAULT",
  ADD_ACCOUNT = "ADD_ACCOUNT",
  ADD_TRANSACTION = "ADD_TRANSACTION",
  ADD_SUBSCRIPTION = "ADD_SUBSCRIPTION",
}

export default function DashBoard() {
  const { width, height } = useWindowDimensions();
  const [accountIndex, setAccountIndex] = useState(0);
  const [state, setState] = useState<STATE>(STATE.DEFAULT);
  const [expanded, setExpanded] = useState(false);

  const [accounts, setAccounts] = useState<any[]>([]);

  const [transactionsByAccount, setTransactionsByAccount] = useState<
    Record<number, any[]>
  >({});
  const [subscriptionsByAccount, setSubscriptionsByAccount] = useState<
    Record<number, any[]>
  >({});

  const [isFetchingAccounts, setIsFetchingAccounts] = useState<boolean>(true);
  const [loadingTxByAccount, setLoadingTxByAccount] = useState<
    Record<number, boolean>
  >({});
  const [loadingSubsByAccount, setLoadingSubsByAccount] = useState<
    Record<number, boolean>
  >({});

  const contentWidth = (width - 60) * 0.9;
  const maxListHeight = height * 0.35;

  const { user, session } = useAuthStore();

  const fetchConnectBalanceMinor = async () => {
    if (!session?.access_token) return 0;
    const connectData = await getData(
      session.access_token,
      session.refresh_token,
    );
    const available = Number(connectData?.balance?.[0]?.available ?? 0);
    return Math.round(available * 100);
  };

  // Normalize transactions from different backends into a consistent shape
  const normalizeTransactions = (list?: any[]) => {
    if (!Array.isArray(list)) return [];
    return list.map((t: any, index: number) => {
      const amountMinor =
        t.amount_minor !== undefined
          ? Number(t.amount_minor)
          : t.amount !== undefined
            ? Math.round(Number(t.amount) * 100)
            : 0;

      return {
        id:
          t.id ??
          t.transaction_id ??
          `${amountMinor}_${t.date ?? t.timestamp ?? ""}_${index}`,
        description:
          t.description ||
          t.merchant ||
          t.name ||
          t.merchant_name ||
          "Transaction",
        category_id:
          t.category ||
          t.category_id ||
          t.category_name ||
          t.categoryLabel ||
          "Other",
        amount_minor: Number(amountMinor || 0),
        currency: t.currency || t.currency_code || "USD",
        date: t.date || t.timestamp || t.created_at || null,
        // preserve original payload for debugging if needed
        __raw: t,
      };
    });
  };

  const loadAccounts = async () => {
    if (!session?.access_token) return [];
    try {
      setIsFetchingAccounts(true);
      const data = await getAccounts(
        session.access_token,
        session.refresh_token,
      );
      let result = data.rows || data;

      const hasConnected = result.some((acc: any) => acc.kind === "connect");
      if (hasConnected) {
        const availableCents = await fetchConnectBalanceMinor();

        result = result.map((acc: any) =>
          acc.kind !== "connect"
            ? acc
            : {
                ...acc,
                balance_minor: availableCents,
              },
        );
      }

      setAccounts(result);
      return result;
    } catch (e: any) {
      console.error("Failed to load accounts:", e?.message || "Unknown error");
      return [];
    } finally {
      setIsFetchingAccounts(false);
    }
  };

  const loadTransactionsForAccount = async (
    accountId: number,
    accountObj?: any,
  ) => {
    if (!session?.access_token || !accountId) return;
    try {
      setLoadingTxByAccount((prev) => ({ ...prev, [accountId]: true }));
      const matchingAccount =
        accountObj ?? accounts.find((acc) => acc.id === accountId);

      if (matchingAccount?.kind === "connect") {
        const availableCents = await fetchConnectBalanceMinor();
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.id !== accountId
              ? acc
              : {
                  ...acc,
                  balance_minor: availableCents,
                },
          ),
        );

        const txDataConnected = await getData(
          session.access_token,
          session.refresh_token,
        );
        const rawTx = txDataConnected?.transactions || [];
        const normalized = normalizeTransactions(rawTx);
        // prefer sorting by date if present, fallback to array order reversed
        const sorted = normalized.sort((a: any, b: any) => {
          if (a.date && b.date) return Date.parse(b.date) - Date.parse(a.date);
          return 0;
        });

        setTransactionsByAccount((prev) => ({
          ...prev,
          [accountId]: sorted,
        }));

        return;
      }

      const data = await getTransactions(
        session.access_token,
        session.refresh_token,
        accountId,
      );
      const list = (data.rows || data) as any[];
      const normalized = normalizeTransactions(list);
      const sorted = normalized.sort((a: any, b: any) => {
        if (a.date && b.date) return Date.parse(b.date) - Date.parse(a.date);
        return 0;
      });
      setTransactionsByAccount((prev) => ({
        ...prev,
        [accountId]: sorted,
      }));
    } catch (e: any) {
      console.error(
        "Failed to load transactions:",
        e?.message || "Unknown error",
      );
    } finally {
      setLoadingTxByAccount((prev) => ({ ...prev, [accountId]: false }));
    }
  };

  const loadSubscriptionsForAccount = async (accountId: number) => {
    if (!session?.access_token || !accountId) return;
    try {
      setLoadingSubsByAccount((prev) => ({ ...prev, [accountId]: true }));
      const data = await getSubscriptions(
        session.access_token,
        session.refresh_token,
        accountId,
      );
      const list = (data.rows || data) as any[];
      const sorted = [...list].reverse();

      setSubscriptionsByAccount((prev) => ({
        ...prev,
        [accountId]: sorted,
      }));
    } catch (e: any) {
      console.error(
        "Failed to load subscriptions:",
        e?.message || "Unknown error",
      );
    } finally {
      setLoadingSubsByAccount((prev) => ({ ...prev, [accountId]: false }));
    }
  };

  const computeAccountBalance = (
    accountId: number,
    txByAcc: Record<number, any[]>,
    subsByAcc: Record<number, any[]>,
  ) => {
    const tx = txByAcc[accountId] || [];
    const subs = subsByAcc[accountId] || [];

    const txTotal = tx.reduce((sum, t) => sum + (t.amount_minor || 0), 0);
    const subsTotal = subs
      .filter((s) => s.active)
      .reduce((sum, s) => sum + (s.amount_minor || 0), 0);

    return txTotal - subsTotal;
  };

  useEffect(() => {
    const init = async () => {
      const accs = await loadAccounts();
      if (accs.length > 0) {
        setAccountIndex(0);
        // pass the freshly fetched account object to avoid race with setAccounts
        const firstId = accs[0].id;
        await loadTransactionsForAccount(firstId, accs[0]);
        await loadSubscriptionsForAccount(firstId);
      }
    };
    init();
  }, [session?.access_token]);

  const openAddAccountModal = () => {
    setState(STATE.ADD_ACCOUNT);
    setExpanded(false);
  };

  const openAddTransactionModal = () => {
    setState(STATE.ADD_TRANSACTION);
    setExpanded(false);
  };

  const openAddSubscriptionModal = () => {
    setState(STATE.ADD_SUBSCRIPTION);
    setExpanded(false);
  };

  const handleModalClose = () => {
    setState(STATE.DEFAULT);
  };

  const handleTransactionAdded = async () => {
    const accId = accounts[accountIndex]?.id;
    if (accId) await loadTransactionsForAccount(accId);
  };

  const handleSubscriptionAdded = async () => {
    const accId = accounts[accountIndex]?.id;
    if (accId) await loadSubscriptionsForAccount(accId);
  };

  const handleAccountAdded = async () => {
    const result = await loadAccounts();
    if (result.length > 0) {
      setAccountIndex(0);
      const id = result[0].id;
      await loadTransactionsForAccount(id);
      await loadSubscriptionsForAccount(id);
    }
  };

  const toggleExpanded = () => setExpanded(!expanded);
  const handleOutsidePress = () => setExpanded(false);

  const selectedAccountId = accounts[accountIndex]?.id;
  const filteredTransactions = selectedAccountId
    ? transactionsByAccount[selectedAccountId] || []
    : [];
  const activeSubscriptions = selectedAccountId
    ? (subscriptionsByAccount[selectedAccountId] || []).filter((s) => s.active)
    : [];
  const isLoadingSelectedAccount = selectedAccountId
    ? !!loadingTxByAccount[selectedAccountId] ||
      !!loadingSubsByAccount[selectedAccountId]
    : false;

  useEffect(() => {
    if (!selectedAccountId) return;
    const hasTx = !!transactionsByAccount[selectedAccountId];
    const hasSubs = !!subscriptionsByAccount[selectedAccountId];

    if (!hasTx) {
      loadTransactionsForAccount(selectedAccountId);
    }
    if (!hasSubs) {
      loadSubscriptionsForAccount(selectedAccountId);
    }
  }, [selectedAccountId]);

  useEffect(() => {
    if (!selectedAccountId) return;
    const selectedAccount = accounts.find(
      (acc) => acc.id === selectedAccountId,
    );
    if (selectedAccount?.kind === "connect") return;

    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id !== selectedAccountId
          ? acc
          : {
              ...acc,
              balance_minor: computeAccountBalance(
                selectedAccountId,
                transactionsByAccount,
                subscriptionsByAccount,
              ),
            },
      ),
    );
  }, [selectedAccountId, transactionsByAccount, subscriptionsByAccount]);

  return (
    <View className="flex-1 w-full bg-white mt-5">
      <View className="items-center justify-center">
        <View className="gap-3 items-center">
          <Text className="text-center text-2xl font-bold">
            {`Good morning ${user?.user_metadata?.display_name || "there"}!`}
          </Text>

          {/* Accounts Carousel */}
          <View className="w-full">
            {isFetchingAccounts ? (
              <View className="items-center justify-center">
                {/* Accounts skeletons */}
                <View className="w-full items-center">
                  <View className="items-center justify-center">
                    <View className="bg-white rounded-3xl p-6 w-[85%]">
                      <Skeleton
                        mode="light"
                        className="h-6 w-40 mb-3"
                        animated
                      />
                      <Skeleton
                        mode="light"
                        className="h-8 w-56 mb-2"
                        animated
                      />
                      <Skeleton mode="light" className="h-4 w-24" animated />
                    </View>
                  </View>
                </View>
              </View>
            ) : accounts.length === 0 ? (
              <Text className="text-center text-lg text-gray-500">
                No accounts yet
              </Text>
            ) : (
              <Carousel onIndexChange={setAccountIndex}>
                <CarouselContent>
                  {accounts.map((account: any) => (
                    <CarouselItem
                      key={account.id}
                      className="items-center justify-center"
                    >
                      <Card
                        provider={account.institution}
                        name={account.name}
                        kind={account.kind}
                        amount={parseFloat(
                          (account.balance_minor / 100).toFixed(2),
                        )}
                        currency={account.currency}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {/* Pagination dots */}
                <View className="flex-row mt-4 gap-1 justify-center">
                  {(() => {
                    const total = accounts.length;
                    const maxDots = 5;

                    let start = 0;
                    let end = total;

                    if (total > maxDots) {
                      if (accountIndex <= 2) {
                        start = 0;
                        end = maxDots;
                      } else if (accountIndex >= total - 3) {
                        start = total - maxDots;
                        end = total;
                      } else {
                        start = accountIndex - 2;
                        end = accountIndex + 3;
                      }
                    }

                    return accounts.slice(start, end).map((_, i) => {
                      const realIndex = i + start;

                      return (
                        <View
                          key={realIndex}
                          className={`w-2 h-2 rounded-full ${
                            realIndex === accountIndex
                              ? "bg-black"
                              : "bg-gray-300"
                          }`}
                        />
                      );
                    });
                  })()}
                </View>
              </Carousel>
            )}
          </View>
        </View>
      </View>

      {/* Transactions + Subscriptions */}
      <View className="flex-1 items-center justify-start w-full pt-2">
        <View className="gap-5" style={{ width: contentWidth }}>
          <Text className="text-xl font-bold">Transactions</Text>

          <ScrollView
            style={{ maxHeight: maxListHeight }}
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-5 pb-5">
              {isLoadingSelectedAccount ? (
                <View className="gap-4">
                  {[...Array(4)].map((_, idx) => (
                    <View
                      key={idx}
                      className="flex-row justify-between"
                      style={{ width: contentWidth }}
                    >
                      <View>
                        <Skeleton
                          mode="light"
                          className="h-5 w-44 mb-2"
                          animated
                        />
                        <Skeleton mode="light" className="h-4 w-24" animated />
                      </View>
                      <Skeleton mode="light" className="h-5 w-16" animated />
                    </View>
                  ))}
                </View>
              ) : (
                (() => {
                  const combined = filteredTransactions
                    .concat(
                      activeSubscriptions.map((sub) => ({
                        id: `sub-${sub.id}`,
                        description: sub.merchant,
                        category_id: "Subscription",
                        amount_minor: -sub.amount_minor,
                        currency: sub.currency,
                      })),
                    )
                    .sort((a: any, b: any) =>
                      `${b.id}`.localeCompare(`${a.id}`),
                    );

                  if (combined.length === 0) {
                    return (
                      <Text className="text-center text-neutral-500">
                        No transactions found
                      </Text>
                    );
                  }

                  return combined.map((item: any, index: number) => (
                    <View
                      key={`${selectedAccountId || 'acc'}-tx-${index}`}
                      className="flex flex-row justify-between"
                      style={{ width: contentWidth }}
                    >
                      <View>
                        <Text className="text-xl font-bold">
                          {item.description}
                        </Text>
                        <Text className="text-gray-400 text-lg">
                          {item.category_id}
                        </Text>
                      </View>

                      <Text
                        className={`self-center font-bold ${
                          item.amount_minor < 0
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {item.amount_minor < 0 ? "" : "+"}
                        {(item.amount_minor / 100).toFixed(2)}{" "}
                        {item.currency === "USD" ? "$" : "€"}
                      </Text>
                    </View>
                  ));
                })()
              )}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Floating Add Button */}
      <View className="absolute bottom-12 right-5">
        {expanded && (
          <TouchableWithoutFeedback onPress={handleOutsidePress}>
            <View className="absolute inset-0" />
          </TouchableWithoutFeedback>
        )}

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={toggleExpanded}
          className={`${
            expanded
              ? "bg-black w-64 py-6 rounded-[25px]"
              : "bg-black w-40 py-4 rounded-full"
          }`}
        >
          {!expanded ? (
            <View className="items-center justify-center">
              <Text className="text-white text-3xl font-semibold">Add +</Text>
            </View>
          ) : (
            <View className="flex-col justify-center px-6 space-y-3">
              <TouchableOpacity
                className="flex-row justify-between items-center pb-3"
                onPress={openAddAccountModal}
              >
                <Text className="text-white text-3xl font-semibold">
                  Account
                </Text>
                <Text className="text-white text-3xl">›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row justify-between items-center pb-3"
                onPress={openAddTransactionModal}
              >
                <Text className="text-white text-3xl font-semibold">
                  Transaction
                </Text>
                <Text className="text-white text-3xl">›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row justify-between items-center"
                onPress={openAddSubscriptionModal}
              >
                <Text className="text-white text-3xl font-semibold">
                  Subscription
                </Text>
                <Text className="text-white text-3xl">›</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <AddAccountModal
        isVisible={state === STATE.ADD_ACCOUNT}
        onClose={handleModalClose}
        onAccountAdded={handleAccountAdded}
      />

      <AddTransactionModal
        isVisible={state === STATE.ADD_TRANSACTION}
        onClose={handleModalClose}
        accounts={accounts}
        selectedAccountId={accounts[accountIndex]?.id}
        onTransactionAdded={handleTransactionAdded}
      />

      <AddSubscriptionModal
        isVisible={state === STATE.ADD_SUBSCRIPTION}
        onClose={handleModalClose}
        accounts={accounts}
        selectedAccountId={accounts[accountIndex]?.id}
        onSubscriptionAdded={handleSubscriptionAdded}
      />
    </View>
  );
}
