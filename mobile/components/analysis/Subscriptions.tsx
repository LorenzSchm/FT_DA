import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/utils/authStore";
import { getSubscriptions } from "@/utils/db/finance/subscriptions/subscriptions";
import CategoryBreakdownChart from "@/components/analysis/CategoryBreakdownChart";
import { Skeleton } from "@/components/ui/skeleton";
import { Feather } from "@expo/vector-icons";
import FilterModal from "./FilterModal";

type Props = {
  account: string | number | null;
};

export default function Subscriptions({ account }: Props) {
  const { session } = useAuthStore();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  const getCurrencySymbol = (code?: string) => {
    if (!code) return "€";
    if (code === "USD") return "$";
    if (code === "GBP") return "£";
    return code;
  };

  const loadSubscriptions = async () => {
    if (!session?.access_token || !account) return;
    try {
      setIsLoading(true);
      const data = await getSubscriptions(
        session.access_token,
        session.refresh_token,
        account,
      );
      const list = (data.rows || data) as any[];
      setSubscriptions(list.filter((sub) => sub.active !== false));
    } catch (e: any) {
      console.error(
        "Failed to load subscriptions:",
        e?.message || "Unknown error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (account) {
      loadSubscriptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, session?.access_token]);

  const categoryData = useMemo(() => {
    const map = subscriptions.reduce<Record<string, number>>(
      (acc, sub: any) => {
        const key = sub.category || sub.merchant || sub.name || "Subscription";
        acc[key] = (acc[key] || 0) + (sub.amount_minor || 0);
        return acc;
      },
      {},
    );
    return Object.entries(map)
      .map(([label, amount]) => ({ label, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [subscriptions]);

  const currency = subscriptions[0]?.currency || "EUR";
  const currencySymbol = getCurrencySymbol(currency);

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
        <View className="mb-8 relative">
          <TouchableOpacity
            onPress={() => setModalOpen(true)}
            className="absolute top-0 right-0 z-10 p-2"
          >
            <Feather name={"more-vertical"} size={20} color="#000" />
          </TouchableOpacity>
          <CategoryBreakdownChart
            data={categoryData}
            currency={currencySymbol}
            title="Subscriptions"
            emptyLabel="No subscriptions"
          />
        </View>

        <View>
          <Text className="text-xl font-bold mb-4">Active subscriptions</Text>
          {isLoading ? (
            <View className="gap-4">
              {[...Array(3)].map((_, idx) => (
                <View
                  key={idx}
                  className="flex-row justify-between items-center"
                >
                  <View className="flex-1">
                    <Skeleton mode="light" className="h-5 w-44 mb-2" animated />
                    <Skeleton mode="light" className="h-4 w-24" animated />
                  </View>
                  <Skeleton mode="light" className="h-5 w-16" animated />
                </View>
              ))}
            </View>
          ) : subscriptions.length === 0 ? (
            <Text className="text-center text-gray-400 py-8">
              No subscriptions for this account
            </Text>
          ) : (
            <View className="gap-4">
              {subscriptions.map((sub: any) => (
                <View
                  key={sub.id}
                  className="flex-row justify-between items-center"
                >
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-black">
                      {sub.merchant || sub.name || "Subscription"}
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      {sub.category || "Recurring"}
                    </Text>
                  </View>
                  <Text className="text-lg font-bold text-red-500">
                    -{((sub.amount_minor || 0) / 100).toFixed(2)}{" "}
                    {getCurrencySymbol(sub.currency || currency)}
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
