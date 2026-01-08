import DashBoard from "@/components/DashBoard";
import { useAuthStore } from "@/utils/authStore";
import { Text, View, ScrollView, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { getAccounts } from "@/utils/db/finance/finance";
import { getData } from "@/utils/db/connect_accounts/connectAccounts";
import CustomPicker from "@/components/ui/CustomPicker";
import Overview from "@/components/analysis/Overview";
import Incomes from "@/components/analysis/Incomes";
import Expenses from "@/components/analysis/Expenses";
import Subscriptions from "@/components/analysis/Subscriptions";

const STATE = {
  OVERVIEW: "Overview",
  EXPENSES: "Expenses",
  INCOME: "Income",
  SUBSCRIPTIONS: "Subscriptions",
};

export default function Analysis() {
  const { session } = useAuthStore();
  const [selectedState, setSelectedState] = useState<string>(STATE.OVERVIEW);
  const [isfetchingAccounts, setIsFetchingAccounts] = useState<Boolean>(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<any>(null);

  const fetchConnectBalanceMinor = async () => {
    if (!session?.access_token) return 0;
    const connectData = await getData(
      session.access_token,
      session.refresh_token,
    );
    const available = Number(connectData?.balance?.[0]?.available ?? 0);
    return Math.round(available * 100);
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

  useEffect(() => {
    loadAccounts();
  }, [session?.access_token]);

  const states = Object.values(STATE);

  return (
    <View className="flex-1 bg-white">
      <View className="pt-4 pb-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        >
          {states.map((state) => (
            <TouchableOpacity
              key={state}
              onPress={() => setSelectedState(state)}
              className={`px-6 py-3 rounded-full ${
                selectedState === state ? "bg-black" : "bg-gray-100"
              }`}
            >
              <Text
                className={`text-base font-semibold ${
                  selectedState === state ? "text-white" : "text-gray-600"
                }`}
              >
                {state}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View className="px-4 py-1">
        <CustomPicker
          placeholder="Select an account"
          variant="input"
          value={selectedAccountId}
          onValueChange={setSelectedAccountId}
          options={
            accounts.map((acc: any) => ({
              label: `${acc?.name} (${acc.currency})`,
              value: acc.id,
            })) as any
          }
        />
      </View>
      <View className="flex-1">
        {selectedState === STATE.OVERVIEW && (
          <Overview accounts={accounts} account={selectedAccountId} />
        )}
        {selectedState === STATE.EXPENSES && (
          <Expenses account={selectedAccountId} />
        )}
        {selectedState === STATE.INCOME && (
          <Incomes account={selectedAccountId} />
        )}
        {selectedState === STATE.SUBSCRIPTIONS && (
          <Subscriptions account={selectedAccountId} />
        )}
      </View>
    </View>
  );
}
