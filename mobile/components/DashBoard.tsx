import {
  View,
  Text,
  useWindowDimensions,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  RefreshControl,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
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
import {
  getAccounts,
  getTransactions,
  getCategories,
  exportTransactionsToCSV,
} from "@/utils/db/finance/finance";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Download } from "lucide-react-native";
import { getSubscriptions } from "@/utils/db/finance/subscriptions/subscriptions";
import { Skeleton } from "@/components/ui/skeleton";
import { getData } from "@/utils/db/connect_accounts/connectAccounts";
import { invalidateCache } from "@/utils/db/cache";
import { CarouselPaginationDots } from "@/components/ui/PaginationDots";
import type { Category } from "@/utils/categoryMatcher";

enum STATE {
  DEFAULT = "DEFAULT",
  ADD_ACCOUNT = "ADD_ACCOUNT",
  ADD_TRANSACTION = "ADD_TRANSACTION",
  ADD_SUBSCRIPTION = "ADD_SUBSCRIPTION",
}

type FilterType = "all" | "expense" | "income";

export default function DashBoard() {
  const { width, height } = useWindowDimensions();
  const [accountIndex, setAccountIndex] = useState(0);
  const [state, setState] = useState<STATE>(STATE.DEFAULT);
  const [expanded, setExpanded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

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

  // Filter state
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const contentWidth = (width - 60) * 0.9;
  const maxListHeight = height * 0.38;

  const { user, session } = useAuthStore();

  // Category lookup map
  const categoryMap = categories.reduce<Record<string, Category>>((acc, c) => {
    acc[c.id] = c;
    return acc;
  }, {});

  const fetchConnectBalanceMinor = async () => {
    if (!session?.access_token) return 0;
    const connectData = await getData(
      session.access_token,
      session.refresh_token,
    );
    const available = Number(connectData?.balance?.[0]?.available ?? 0);
    return Math.round(available * 100);
  };

  const normalizeTransactions = (list?: any[]) => {
    if (!Array.isArray(list)) return [];
    return list.map((t: any, index: number) => {
      let amountMinor =
        t.amount_minor !== undefined
          ? Number(t.amount_minor)
          : t.amount !== undefined
            ? Math.round(Number(t.amount) * 100)
            : 0;

      if (t.type === "EXPENSE") {
        amountMinor = -Math.abs(amountMinor);
      }

      // category object may be embedded by the API or can be resolved from the map
      const categoryObj: Category | null =
        t.category ?? (t.category_id ? categoryMap[t.category_id] ?? null : null);

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
        category_id: t.category_id || null,
        category_name: categoryObj?.name ?? t.category_name ?? t.categoryLabel ?? null,
        category_icon: categoryObj?.icon ?? null,
        amount_minor: Number(amountMinor || 0),
        currency: t.currency || t.currency_code || "USD",
        date: t.date || t.timestamp || t.created_at || null,
        type: t.type || (amountMinor < 0 ? "expense" : "income"),
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
            : { ...acc, balance_minor: availableCents },
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

  const loadCategories = async () => {
    if (!session?.access_token) return;
    try {
      const data = await getCategories(
        session.access_token,
        session.refresh_token,
      );
      setCategories(data.rows || []);
    } catch (e: any) {
      console.error("Failed to load categories:", e?.message || "Unknown error");
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
              : { ...acc, balance_minor: availableCents },
          ),
        );

        const txDataConnected = await getData(
          session.access_token,
          session.refresh_token,
        );
        const rawTx = txDataConnected?.transactions || [];
        const normalized = normalizeTransactions(rawTx);
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
      await loadCategories();
      const accs = await loadAccounts();
      if (accs.length > 0) {
        setAccountIndex(0);
        const firstId = accs[0].id;
        await loadTransactionsForAccount(firstId, accs[0]);
        await loadSubscriptionsForAccount(firstId);
      }
    };
    init();
  }, [session?.access_token]);

  const openAddAccountModal = () => { setState(STATE.ADD_ACCOUNT); setExpanded(false); };
  const openAddTransactionModal = () => { setState(STATE.ADD_TRANSACTION); setExpanded(false); };
  const openAddSubscriptionModal = () => { setState(STATE.ADD_SUBSCRIPTION); setExpanded(false); };
  const handleModalClose = () => setState(STATE.DEFAULT);

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

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    invalidateCache();
    try {
      await loadCategories();
      const accs = await loadAccounts();
      const accId = accs[accountIndex]?.id;
      if (accId) {
        await Promise.all([
          loadTransactionsForAccount(accId, accs[accountIndex]),
          loadSubscriptionsForAccount(accId),
        ]);
      }
    } finally {
      setRefreshing(false);
    }
  }, [accountIndex]);

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
    if (!hasTx) loadTransactionsForAccount(selectedAccountId);
    if (!hasSubs) loadSubscriptionsForAccount(selectedAccountId);
  }, [selectedAccountId]);

  useEffect(() => {
    if (!selectedAccountId) return;
    const selectedAccount = accounts.find((acc) => acc.id === selectedAccountId);
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

  // ── Build combined list ──────────────────────────────────────────────
  const combinedRaw = filteredTransactions
    .concat(
      activeSubscriptions.map((sub) => ({
        id: `sub-${sub.id}`,
        description: sub.merchant,
        category_id: null,
        category_name: "Subscription",
        category_icon: "📅",
        amount_minor: -sub.amount_minor,
        currency: sub.currency,
        type: "expense",
        date: null,
      })),
    )
    .sort((a: any, b: any) => {
      if (a.date && b.date) return Date.parse(b.date) - Date.parse(a.date);
      if (a.date) return -1;
      if (b.date) return 1;
      return `${b.id}`.localeCompare(`${a.id}`);
    });

  // ── Apply filters ────────────────────────────────────────────────────
  const combined = combinedRaw.filter((item: any) => {
    if (typeFilter === "expense" && item.amount_minor >= 0) return false;
    if (typeFilter === "income" && item.amount_minor < 0) return false;
    if (categoryFilter && item.category_id !== categoryFilter) return false;
    return true;
  });

  // Unique categories used in the current account's transactions for filter chips
  const usedCategories = Array.from(
    new Map(
      filteredTransactions
        .filter((t: any) => t.category_id && t.category_name)
        .map((t: any) => [t.category_id, { id: t.category_id, name: t.category_name, icon: t.category_icon }])
    ).values()
  );

  return (
    <View className="flex-1 w-full bg-white mt-5">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" />
        }
      >
        <View className="items-center justify-center w-full">
          <View className="gap-3 items-center w-full">
            <View className="w-full relative justify-center items-center px-5 mt-2">
              <Text className="text-center text-2xl font-bold">
                {`Good morning ${user?.user_metadata?.display_name || "there"}!`}
              </Text>
            </View>

            {/* Accounts Carousel */}
            <View className="w-full">
              {isFetchingAccounts ? (
                <View className="items-center justify-center">
                  <View className="w-full items-center">
                    <View className="items-center justify-center">
                      <View className="bg-white rounded-3xl p-6 w-[85%]">
                        <Skeleton mode="light" className="h-6 w-40 mb-3" animated />
                        <Skeleton mode="light" className="h-8 w-56 mb-2" animated />
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
                          amount={parseFloat((account.balance_minor / 100).toFixed(2))}
                          currency={account.currency}
                          isLoading={
                            !!loadingTxByAccount[account.id] ||
                            !!loadingSubsByAccount[account.id]
                          }
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPaginationDots />
                </Carousel>
              )}
            </View>
          </View>
        </View>

        {/* Transactions + Filters */}
        <View className="flex-1 items-center justify-start w-full pt-2">
          <View className="gap-3" style={{ width: contentWidth }}>
            <Text className="text-xl font-bold">Transactions</Text>

            {/* Type filter pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
              bounces={false}
            >
              {(["all", "expense", "income"] as FilterType[]).map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setTypeFilter(f)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 7,
                    borderRadius: 9999,
                    backgroundColor: typeFilter === f ? "#000" : "#f4f4f5",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: typeFilter === f ? "700" : "500",
                      color: typeFilter === f ? "#fff" : "#6b7280",
                      textTransform: "capitalize",
                    }}
                  >
                    {f === "all" ? "All" : f === "expense" ? "Expenses" : "Income"}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Category filter chips — only show if there are categorised transactions */}
              {usedCategories.length > 0 && (
                <View
                  style={{
                    width: 1,
                    backgroundColor: "#e5e7eb",
                    marginHorizontal: 4,
                    borderRadius: 1,
                  }}
                />
              )}
              {usedCategories.map((cat: any) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() =>
                    setCategoryFilter(categoryFilter === cat.id ? null : cat.id)
                  }
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 7,
                    borderRadius: 9999,
                    backgroundColor:
                      categoryFilter === cat.id ? "#000" : "#f4f4f5",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Text style={{ fontSize: 13 }}>{cat.icon}</Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: categoryFilter === cat.id ? "700" : "500",
                      color: categoryFilter === cat.id ? "#fff" : "#6b7280",
                    }}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Transaction list */}
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
                          <Skeleton mode="light" className="h-5 w-44 mb-2" animated />
                          <Skeleton mode="light" className="h-4 w-24" animated />
                        </View>
                        <Skeleton mode="light" className="h-5 w-16" animated />
                      </View>
                    ))}
                  </View>
                ) : combined.length === 0 ? (
                  <Text className="text-center text-neutral-500">
                    No transactions found
                  </Text>
                ) : (
                  combined.map((item: any, index: number) => (
                    <View
                      key={`${selectedAccountId || "acc"}-tx-${index}`}
                      className="flex flex-row justify-between"
                      style={{ width: contentWidth }}
                    >
                      <View style={{ flex: 1, marginRight: 12 }}>
                        <Text
                          className="text-xl font-bold"
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {item.description}
                        </Text>
                        <Text
                          className="text-gray-400 text-base"
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {item.category_icon
                            ? `${item.category_icon} ${item.category_name}`
                            : item.category_name || "—"}
                        </Text>
                      </View>

                      <Text
                        style={{ flexShrink: 0 }}
                        className={`self-center font-bold ${
                          item.amount_minor < 0 ? "text-red-500" : "text-green-500"
                        }`}
                      >
                        {item.amount_minor < 0 ? "" : "+"}
                        {(item.amount_minor / 100).toFixed(2)}{" "}
                        {(
                          {
                            USD: "$",
                            EUR: "€",
                            GBP: "£",
                            CHF: "CHF",
                          } as Record<string, string>
                        )[item.currency] ?? item.currency}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      {expanded && (
        <TouchableWithoutFeedback onPress={handleOutsidePress}>
          <View className="absolute inset-0" />
        </TouchableWithoutFeedback>
      )}

      <View className="absolute bottom-12 right-5">
        {!expanded ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={toggleExpanded}
            style={{
              width: 160,
              paddingVertical: 16,
              borderRadius: 999,
              backgroundColor: "#000",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text className="text-white text-3xl font-semibold">Add +</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={toggleExpanded}
            style={{
              width: 256,
              paddingVertical: 24,
              borderRadius: 25,
              backgroundColor: "#000",
              alignItems: "stretch",
              justifyContent: "center",
            }}
          >
            <View className="flex-col justify-center px-6 space-y-3 w-full">
              <TouchableOpacity
                className="flex-row justify-between items-center pb-3"
                onPress={openAddAccountModal}
              >
                <Text className="text-white text-3xl font-semibold">Account</Text>
                <Text className="text-white text-3xl">›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row justify-between items-center pb-3"
                onPress={openAddTransactionModal}
              >
                <Text className="text-white text-3xl font-semibold">Transaction</Text>
                <Text className="text-white text-3xl">›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row justify-between items-center"
                onPress={openAddSubscriptionModal}
              >
                <Text className="text-white text-3xl font-semibold">Subscription</Text>
                <Text className="text-white text-3xl">›</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
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
