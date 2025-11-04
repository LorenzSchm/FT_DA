import {
  View,
  Text,
  useWindowDimensions,
  ScrollView,
  Pressable,
} from "react-native";
import Card from "./Card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/utils/authStore";
import { getAccounts, getTransactions } from "@/utils/db/finance/finance";

export default function DashBoard() {
  const { width, height } = useWindowDimensions();
  const [accountIndex, setAccountIndex] = useState(0);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const contentWidth = (width - 60) * 0.9;
  const maxListHeight = height * 0.45;

  const { user, session } = useAuthStore();

  const [accounts, setAccounts] = useState([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [accountsError, setAccountsError] = useState<string | null>(null);

  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  const loadAccounts = async () => {
    if (!session?.access_token) return;
    try {
      setAccountsError(null);
      setIsLoadingAccounts(true);
      const data = await getAccounts(session.access_token, session.refresh_token);
      setAccounts(data.rows);
    } catch (e: any) {
      setAccountsError(e?.message || "Failed to load accounts");
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const loadTransactions = async () => {
    if (!session?.access_token) return;
    try {
      setTransactionsError(null);
      setIsLoadingTransactions(true);
      const data = await getTransactions(session.access_token, session.refresh_token);
      setTransactions(data.rows);
    } catch (e: any) {
      setTransactionsError(e?.message || "Failed to load transactions");
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  useEffect(() => {
    loadAccounts();
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token]);

  return (
    <View className="flex-1 w-full flex-col">
      <View className="flex-1 items-center justify-center">
        <View className="gap-3 items-center">
          <Text className="text-center text-2xl font-bold">
            {isLoadingUser
              ? "Good morning!"
              : `Good morning ${
                  user?.user_metadata?.display_name ||
                  user?.display_name ||
                  "there"
                }!`}
          </Text>

          <View className="w-full">
            {isLoadingAccounts ? (
              <Text className="text-center text-lg text-gray-500">Loading accounts...</Text>
            ) : accountsError ? (
              <View className="items-center gap-2">
                <Text className="text-center text-red-500">{accountsError}</Text>
                <Pressable onPress={loadAccounts} className="bg-black px-4 py-2 rounded-full">
                  <Text className="text-white font-bold">Retry</Text>
                </Pressable>
              </View>
            ) : accounts.length === 0 ? (
              <Text className="text-center text-lg text-gray-500">No accounts yet</Text>
            ) : (
              <Carousel onIndexChange={setAccountIndex}>
                <CarouselContent>
                  {accounts.map((account) => (
                    <CarouselItem
                      key={account.id}
                      className="items-center justify-center"
                    >
                      <Card
                        kind={account.kind || "Account"}
                        amount={0}
                        currency={account.currency || "USD"}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            )}
          </View>
        </View>
      </View>

      <View className="flex-1 items-center justify-start w-full pt-2">
        <View className="gap-5" style={{ width: contentWidth }}>
          <Text className="text-xl font-bold">Transactions</Text>

          {isLoadingTransactions ? (
            <Text className="text-center text-lg text-gray-500">Loading transactions...</Text>
          ) : transactionsError ? (
            <View className="items-center gap-2">
              <Text className="text-center text-red-500">{transactionsError}</Text>
              <Pressable onPress={loadTransactions} className="bg-black px-4 py-2 rounded-full">
                <Text className="text-white font-bold">Retry</Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView
              style={{ maxHeight: maxListHeight }}
              showsVerticalScrollIndicator={false}
            >
              <View className="gap-5 pb-5">
                {transactions
                  .filter(
                    (txn) => txn.account_id === accounts[accountIndex]?.id
                  )
                  .map((txn) => (
                    <View
                      key={txn.id}
                      className="flex flex-row justify-between"
                      style={{ width: contentWidth }}
                    >
                      <View>
                        <Text className="text-xl font-bold">{txn.description}</Text>
                        <Text className="text-gray-400 text-lg">{txn.category_id}</Text>
                      </View>
                      <Text
                        className={`self-center font-bold ${
                          txn.amount_minor < 0 ? "text-red-500" : "text-green-500"
                        }`}
                      >
                        {txn.amount_minor < 0 ? "" : "+"}
                        {(txn.amount_minor / 100).toFixed(2)}{" "}
                        {txn.currency === "USD" ? "$" : "€"}
                      </Text>
                    </View>
                  ))}
              </View>
            </ScrollView>
          )}
        </View>
      </View>

      <Pressable
        className="bg-black absolute bottom-20 right-10 w-32 h-16 rounded-full items-center justify-center shadow-lg"
      >
        <Text className="text-white font-bold text-xl">Add +</Text>
      </Pressable>
    </View>
  );
}
