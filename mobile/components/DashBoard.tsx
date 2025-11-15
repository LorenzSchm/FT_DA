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
import { useAuthStore } from "@/utils/authStore";
import { getAccounts, getTransactions } from "@/utils/db/finance/finance";

// Mock data for development removed - using real data from API

enum STATE {
  DEFAULT = "DEFAULT",
  ADD_ACCOUNT = "ADD_ACCOUNT",
  ADD_TRANSACTION = "ADD_TRANSACTION",
}

export default function DashBoard() {
  const { width, height } = useWindowDimensions();
  const [accountIndex, setAccountIndex] = useState(0);
  const [state, setState] = useState(STATE.DEFAULT);
  const [expanded, setExpanded] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  const contentWidth = (width - 60) * 0.9;
  const maxListHeight = height * 0.45;

  const { user, session } = useAuthStore();

  const loadAccounts = async () => {
    if (!session?.access_token) return;
    try {
      const data = await getAccounts(session.access_token, session.refresh_token);
      setAccounts(data.rows || data);
      return data.rows || data;
    } catch (e: any) {
      console.error("Failed to load accounts:", e?.message || "Unknown error");
      return [];
    }
  };

  const loadTransactions = async (accounts: any[]) => {
    if (!session?.access_token || !accounts.length) return;
    try {
      const allTransactions: any[] = [];
      for (const account of accounts) {
        const data = await getTransactions(session.access_token, session.refresh_token, account.id);
        const transactions = data.rows || data;
        allTransactions.push(...transactions);
      }
      setTransactions(allTransactions);
    } catch (e: any) {
      console.error("Failed to load transactions:", e?.message || "Unknown error");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const loadedAccounts = await loadAccounts();
      if (loadedAccounts && loadedAccounts.length > 0) {
        await loadTransactions(loadedAccounts);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token]);
  const openAddAccountModal = () => {
    setState(STATE.ADD_ACCOUNT);
    setExpanded(false);
  };

  const openAddTransactionModal = () => {
    setState(STATE.ADD_TRANSACTION);
    setExpanded(false);
  }

  const handleModalClose = () => {
    setState(STATE.DEFAULT);
  };

  const handleTransactionAdded = async () => {
    // Reload transactions after a new one is added
    if (accounts.length > 0) {
      await loadTransactions(accounts);
    }
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleOutsidePress = () => {
    setExpanded(false);
  };

  const filteredTransactions = transactions.filter(
    (txn) => txn.account_id === accounts[accountIndex]?.id,
  );

  return (
    <View className="flex-1 mt-20 w-full bg-white">
      {/* Greeting and Accounts Section */}
      <View className="flex-1 items-center justify-center">
        <View className="gap-3 items-center">
          <Text className="text-center text-2xl font-bold">
            {`Good morning ${user?.display_name || "there"}!`}
          </Text>

          {/* Accounts Carousel */}
          <View className="w-full">
            {accounts.length === 0 ? (
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
                        kind={account.kind || "Account"}
                        amount={parseFloat((account.balance_minor / 100).toFixed(2))}
                        currency={account.currency || "EUR"}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {/* Pagination Dots */}
                <View className="flex-row mt-4 gap-1 justify-center">
                  {accounts.map((_: any, index: number) => (
                    <View
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === accountIndex ? "bg-black" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </View>
              </Carousel>
            )}
          </View>
        </View>
      </View>

      {/* Transactions Section */}
      <View className="flex-1 items-center justify-start w-full pt-2">
        <View className="gap-5" style={{ width: contentWidth }}>
          <Text className="text-xl font-bold">Transactions</Text>

          <ScrollView
            style={{ maxHeight: maxListHeight }}
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-5 pb-5">
              {filteredTransactions.map((txn) => (
                <View
                  key={txn.id}
                  className="flex flex-row justify-between"
                  style={{ width: contentWidth }}
                >
                  <View>
                    <Text className="text-xl font-bold">{txn.description}</Text>
                    <Text className="text-gray-400 text-lg">
                      {txn.category_id}
                    </Text>
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
        </View>
      </View>

      {/* Floating Add Button */}
      <View className="absolute bottom-24 right-5">
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
                className="flex-row justify-between items-center"
                onPress={openAddTransactionModal}
              >
                <Text className="text-white text-3xl font-semibold">
                  Transaction
                </Text>
                <Text className="text-white text-3xl">›</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <AddAccountModal
        isVisible={state === STATE.ADD_ACCOUNT}
        onClose={handleModalClose}
      />

      <AddTransactionModal
        isVisible={state === STATE.ADD_TRANSACTION}
        onClose={handleModalClose}
        accounts={accounts}
        selectedAccountId={accounts[accountIndex]?.id}
        onTransactionAdded={handleTransactionAdded}
      />
    </View>
  );
}
