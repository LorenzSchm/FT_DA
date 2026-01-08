import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { getTransactions } from "@/utils/db/finance/finance";
import { getSubscriptions } from "@/utils/db/finance/subscriptions/subscriptions";
import { useAuthStore } from "@/utils/authStore";
import { getData } from "@/utils/db/connect_accounts/connectAccounts";
import SpendingChart from "@/components/analysis/SpendingChart";
import { Skeleton } from "@/components/ui/skeleton";
import { Feather } from "@expo/vector-icons";
import FilterModal from "./FilterModal";

type Props = {
  account: string | number | null;
  accounts: any[];
};

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
      __raw: t,
    };
  });
};

export default function Overview({ account, accounts }: Props) {
  const { session } = useAuthStore();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectBalance, setConnectBalance] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    };
  });

  const handleCloseModal = () => setModalOpen(false);
  const handleApplyDateRange = (range: { start: Date; end: Date }) => {
    setDateRange({ start: new Date(range.start), end: new Date(range.end) });
    setModalOpen(false);
  };

  const fetchConnectBalanceMinor = async () => {
    if (!session?.access_token) return 0;
    const connectData = await getData(
      session.access_token,
      session.refresh_token,
    );
    const available = Number(connectData?.balance?.[0]?.available ?? 0);
    setConnectBalance(Math.round(available * 100));
    return Math.round(available * 100);
  };

  const loadTransactions = async (accountId: number) => {
    if (!session?.access_token || !accountId) return;
    try {
      setIsLoading(true);
      const matchingAccount = accounts?.find((acc) => acc.id === accountId);

      if (matchingAccount?.kind === "connect") {
        const availableCents =
          connectBalance ?? (await fetchConnectBalanceMinor());
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
        setTransactions(sorted);
        setConnectBalance(availableCents);
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
      setTransactions(sorted);
    } catch (e: any) {
      console.error(
        "Failed to load transactions:",
        e?.message || "Unknown error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubscriptions = async () => {
    if (!session?.access_token || !account) return;
    try {
      const data = await getSubscriptions(
        session.access_token,
        session.refresh_token,
        account,
      );
      const list = (data.rows || data) as any[];
      setSubscriptions(list.filter((s: any) => s.active));
    } catch (e: any) {
      console.error(
        "Failed to load subscriptions:",
        e?.message || "Unknown error",
      );
    }
  };

  useEffect(() => {
    if (account) {
      loadTransactions(Number(account));
      loadSubscriptions();
    }
  }, [account, session?.access_token, accounts, connectBalance]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx: any) => {
      if (!tx.date) return false;
      const txDate = new Date(tx.date);
      return txDate >= dateRange.start && txDate <= dateRange.end;
    });
  }, [transactions, dateRange.start, dateRange.end]);

  const monthlyIncome = filteredTransactions
    .filter((tx: any) => tx.amount_minor > 0)
    .reduce((sum: number, tx: any) => sum + tx.amount_minor, 0);

  const monthlyExpenses = filteredTransactions
    .filter((tx: any) => tx.amount_minor < 0)
    .reduce((sum: number, tx: any) => sum + Math.abs(tx.amount_minor), 0);

  const subscriptionCosts = subscriptions.reduce(
    (sum: number, sub: any) => sum + (sub.amount_minor || 0),
    0,
  );

  const totalExpenses = monthlyExpenses + subscriptionCosts;
  const netIncome = monthlyIncome - totalExpenses;
  const totalFlow = monthlyIncome + totalExpenses;
  const spendingPercentage =
    totalFlow > 0 ? (totalExpenses / totalFlow) * 100 : 0;

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${day}. ${monthNames[date.getMonth()]}`;
  };

  const rangeLabel = `${formatDate(dateRange.start)} - ${formatDate(
    dateRange.end,
  )}.`;

  const getCurrencySymbol = (code?: string) => (code === "USD" ? "$" : "€");
  const currency = transactions[0]?.currency || "EUR";
  const currencySymbol = getCurrencySymbol(currency);

  const recentTransactions = filteredTransactions.slice(0, 5);
  const subscriptionEntries = subscriptions.map((sub: any, index: number) => ({
    id: `sub-${sub.id ?? index}`,
    description: sub.merchant || sub.name || "Subscription",
    category_id: "Subscription",
    amount_minor: -(sub.amount_minor || 0),
    currency: sub.currency || currency,
  }));

  const combinedEntries = [...recentTransactions, ...subscriptionEntries];

  const getSuggestion = () => {
    if (netIncome > 0) {
      return {
        icon: "🎉",
        message:
          "Great job — you earned more than you spent this month! 🎉 Keep it up and consider saving or investing the extra.",
      };
    } else if (spendingPercentage > 80) {
      return {
        icon: "⚠️",
        message:
          "You're spending close to your income. Consider reviewing your expenses to maintain a healthy budget.",
      };
    } else {
      return {
        icon: "💡",
        message:
          "You're managing your budget well. Keep tracking your expenses to maintain financial health.",
      };
    }
  };

  const suggestion = getSuggestion();
  const [showSuggestion, setShowSuggestion] = useState(true);

  if (!account) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-500 text-lg">Please select an account</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      showsVerticalScrollIndicator={false}
    >
      <View className="px-4 py-6">
        <View className="mb-6 flex items-center">
          <View className="mb-6 flex flex-row">
            <SpendingChart
              size={200}
              strokeWidth={20}
              income={monthlyIncome}
              expenses={totalExpenses}
              currency={currencySymbol}
              label="Monthly standing"
              dateRange={rangeLabel}
            />
            <TouchableOpacity onPress={() => setModalOpen(true)}>
              <Feather name={"more-vertical"} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {showSuggestion && (
          <View className="bg-gray-100 rounded-2xl p-4 mb-6 flex-row items-start">
            <Text className="text-2xl mr-3">{suggestion.icon}</Text>
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Text className="font-semibold text-gray-800 mr-2">
                  Suggestion
                </Text>
              </View>
              <Text className="text-gray-700 text-sm leading-5">
                {suggestion.message}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowSuggestion(false)}
              className="ml-2"
            >
              <Text className="text-gray-500 text-lg">×</Text>
            </TouchableOpacity>
          </View>
        )}

        <View>
          <Text className="text-xl font-bold mb-4">Transactions</Text>
          {isLoading ? (
            <View className="gap-4">
              {[...Array(3)].map((_, idx) => (
                <View key={idx} className="flex-row justify-between">
                  <View>
                    <Skeleton mode="light" className="h-5 w-44 mb-2" animated />
                    <Skeleton mode="light" className="h-4 w-24" animated />
                  </View>
                  <Skeleton mode="light" className="h-5 w-16" animated />
                </View>
              ))}
            </View>
          ) : combinedEntries.length === 0 ? (
            <Text className="text-center text-gray-500 py-8">
              No transactions found
            </Text>
          ) : (
            <View className="gap-4">
              {combinedEntries.map((item: any, index: number) => (
                <View
                  key={`${item.id ?? "entry"}-${index}`}
                  className="flex-row justify-between items-center"
                >
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-black">
                      {item.description}
                    </Text>
                    <Text className="text-gray-400 text-base">
                      {item.category_id}
                    </Text>
                  </View>
                  <Text
                    className={`text-lg font-bold ${
                      item.amount_minor < 0 ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {item.amount_minor < 0 ? "" : "+"}
                    {(item.amount_minor / 100).toFixed(2)}{" "}
                    {getCurrencySymbol(item.currency || currency)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
      <FilterModal
        isOpen={modalOpen}
        startDate={dateRange.start}
        endDate={dateRange.end}
        onClose={handleCloseModal}
        onApply={handleApplyDateRange}
      />
    </ScrollView>
  );
}
