import { useAuthStore } from "@/utils/authStore";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useEffect, useState } from "react";
import { getAccounts } from "@/utils/db/finance/finance";
import { getData } from "@/utils/db/connect_accounts/connectAccounts";
import CustomPicker from "@/components/ui/CustomPicker";
import Overview from "@/components/analysis/Overview";
import Incomes from "@/components/analysis/Incomes";
import Expenses from "@/components/analysis/Expenses";
import Subscriptions from "@/components/analysis/Subscriptions";
import { Skeleton } from "@/components/ui/skeleton";

/* ─── Color tokens (matches InvestmentView) ─── */
const COLORS = {
  textPrimary: "#111827",
  textSecondary: "#6b7280",
  textTertiary: "#9ca3af",
  cardBg: "#ffffff",
  cardBorder: "rgba(0,0,0,0.04)",
  surface: "#f9fafb",
  pillActive: "#111827",
  pillActiveText: "#ffffff",
  pillInactive: "#f4f4f5",
  pillInactiveText: "#6b7280",
};

const STATE = {
  OVERVIEW: "Overview",
  EXPENSES: "Expenses",
  INCOME: "Income",
  SUBSCRIPTIONS: "Subscriptions",
} as const;

type StateKey = (typeof STATE)[keyof typeof STATE];

export default function Analysis() {
  const { session } = useAuthStore();
  const [selectedState, setSelectedState] = useState<StateKey>(STATE.OVERVIEW);
  const [isFetchingAccounts, setIsFetchingAccounts] = useState(false);
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

  useEffect(() => {
    loadAccounts();
  }, [session?.access_token]);

  const states = Object.values(STATE);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* ─── Sticky header: title + pills ─── */}
      <View
        style={{
          backgroundColor: "#fff",
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 8,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "800",
            color: COLORS.textPrimary,
            letterSpacing: -0.8,
            marginBottom: 16,
          }}
        >
          Analysis
        </Text>

        {/* ─── Tab pills ─── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          bounces={false}
        >
          {states.map((state) => {
            const isActive = selectedState === state;
            return (
              <TouchableOpacity
                key={state}
                onPress={() => setSelectedState(state)}
                activeOpacity={0.8}
              >
                <View
                  style={{
                    paddingHorizontal: 22,
                    paddingVertical: 11,
                    borderRadius: 9999,
                    backgroundColor: isActive ? "#000000" : "#f4f4f5",
                    ...(isActive
                      ? Platform.select({
                          ios: {
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 3 },
                            shadowOpacity: 0.2,
                            shadowRadius: 6,
                          },
                          android: { elevation: 4 },
                        })
                      : {}),
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: isActive ? "800" : "600",
                      color: isActive ? "#ffffff" : "#6b7280",
                      letterSpacing: -0.2,
                    }}
                  >
                    {state}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ─── Account picker ─── */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingVertical: 8,
        }}
      >
        {isFetchingAccounts ? (
          <Skeleton className="h-[52px] w-full rounded-full" />
        ) : (
          <View
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: 9999,
              borderWidth: 1,
              borderColor: COLORS.cardBorder,
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.03,
                  shadowRadius: 4,
                },
                android: { elevation: 1 },
              }),
            }}
          >
            <CustomPicker
              placeholder="Select an account"
              variant="input"
              value={selectedAccountId}
              onValueChange={setSelectedAccountId}
              options={accounts.map((acc: any) => ({
                label: `${acc?.name} (${acc.currency})`,
                value: acc.id,
              }))}
            />
          </View>
        )}
      </View>

      {/* ─── Tab content ─── */}
      <View style={{ flex: 1 }}>
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
