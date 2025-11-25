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

  // Per-account cached data
  const [transactionsByAccount, setTransactionsByAccount] = useState<
    Record<number, any[]>
  >({});
  const [subscriptionsByAccount, setSubscriptionsByAccount] = useState<
    Record<number, any[]>
  >({});

  // Loading states
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

  const loadAccounts = async () => {
    if (!session?.access_token) return [];
    try {
      setIsFetchingAccounts(true);
      const data = await getAccounts(
        session.access_token,
        session.refresh_token,
      );
      const result = data.rows || data;
      setAccounts(result);
      return result;
    } catch (e: any) {
      console.error("Failed to load accounts:", e?.message || "Unknown error");
      return [];
    } finally {
      setIsFetchingAccounts(false);
    }
  };

  // Fetch transactions for a single account and cache them
  const loadTransactionsForAccount = async (accountId: number) => {
    if (!session?.access_token || !accountId) return;
    try {
      setLoadingTxByAccount((prev) => ({ ...prev, [accountId]: true }));
      const data = await getTransactions(
        session.access_token,
        session.refresh_token,
        accountId,
      );
      const list = (data.rows || data) as any[];
      const sorted = [...list].reverse();

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

  // Fetch subscriptions for a single account and cache them
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

  // Helper to compute balance from cached tx + subs
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

    // Assuming:
    // - transactions: income positive, expenses negative
    // - subscriptions: amount_minor is positive recurring cost ->
    //   we subtract them from balance
    return txTotal - subsTotal;
  };

  useEffect(() => {
    const init = async () => {
      const accs = await loadAccounts();
      if (accs.length > 0) {
        // set to first account and lazy-load its data
        setAccountIndex(0);
        const firstId = accs[0].id;
        await loadTransactionsForAccount(firstId);
        await loadSubscriptionsForAccount(firstId);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // Select newest/first account and load its data
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

  // When the selected account changes, lazily fetch its data if not cached
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
    // We intentionally don't add transactionsByAccount / subscriptionsByAccount
    // here to avoid re-fetch loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId]);

  // Recompute balance for the selected account whenever its data changes
  useEffect(() => {
    if (!selectedAccountId) return;

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
                // Skeleton list while loading current account's activity
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

                  return combined.map((item: any) => (
                    <View
                      key={item.id}
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
