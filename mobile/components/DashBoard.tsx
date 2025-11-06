import {
  View,
  Text,
  useWindowDimensions,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { useState } from "react";
import Card from "./Card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import AddAccountModal from "@/components/modals/AddAccountModal";

// Mock data for development
const mockUser = {
  id: "user-001",
  email: "lorenz.schmidt01@icloud.com",
  display_name: "Lorenz",
  user_metadata: {
    display_name: "Lorenz Schmidt",
  },
};

const mockAccounts = [
  {
    id: 1,
    kind: "Checking Account",
    currency: "EUR",
    balance_minor: 325000, // 3250.00 EUR
    user_id: "user-001",
  },
  {
    id: 2,
    kind: "Savings Account",
    currency: "EUR",
    balance_minor: 1500000, // 15000.00 EUR
    user_id: "user-001",
  },
];

const mockTransactions = [
  {
    id: 101,
    account_id: 1,
    txn_date: "2025-10-29",
    amount_minor: -4599,
    currency: "EUR",
    description: "Coffee Shop",
    category_id: "Food",
  },
  {
    id: 102,
    account_id: 1,
    txn_date: "2025-10-28",
    amount_minor: -18900,
    currency: "EUR",
    description: "Groceries",
    category_id: "Supermarket",
  },
  {
    id: 103,
    account_id: 1,
    txn_date: "2025-10-26",
    amount_minor: 120000,
    currency: "EUR",
    description: "Salary Deposit",
    category_id: "Income",
  },
  {
    id: 201,
    account_id: 2,
    txn_date: "2025-10-01",
    amount_minor: 50000,
    currency: "EUR",
    description: "Monthly Transfer",
    category_id: "Savings",
  },
];

enum STATE {
  DEFAULT = "DEFAULT",
  ADD_ACCOUNT = "ADD_ACCOUNT",
}

export default function DashBoard() {
  const { width, height } = useWindowDimensions();
  const [accountIndex, setAccountIndex] = useState(0);
  const [state, setState] = useState(STATE.DEFAULT);
  const [expanded, setExpanded] = useState(false);

  const contentWidth = (width - 60) * 0.9;
  const maxListHeight = height * 0.45;

  // Using mock data
  const user = mockUser;
  const accounts = mockAccounts;
  const transactions = mockTransactions;

  const openAddAccountModal = () => {
    setState(STATE.ADD_ACCOUNT);
    setExpanded(false);
  };

  const handleModalClose = () => {
    setState(STATE.DEFAULT);
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleOutsidePress = () => {
    setExpanded(false);
  };

  const filteredTransactions = transactions.filter(
    (txn) => txn.account_id === accounts[accountIndex]?.id
  );

  return (
    <View className="flex-1 mt-20 w-full bg-white">
      {/* Greeting and Accounts Section */}
      <View className="flex-1 items-center justify-center">
        <View className="gap-3 items-center">
          <Text className="text-center text-2xl font-bold">
            {`Good morning ${
              user?.user_metadata?.display_name || user?.display_name || "there"
            }!`}
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
                  {accounts.map((account) => (
                    <CarouselItem
                      key={account.id}
                      className="items-center justify-center"
                    >
                      <Card
                        kind={account.kind || "Account"}
                        amount={(account.balance_minor / 100).toFixed(2)}
                        currency={account.currency || "EUR"}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {/* Pagination Dots */}
                <View className="flex-row mt-4 gap-1 justify-center">
                  {accounts.map((_, index) => (
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
                <Text className="text-white text-3xl font-semibold">Account</Text>
                <Text className="text-white text-3xl">›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row justify-between items-center"
                onPress={() => setExpanded(false)}
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

      {/* Add Account Modal */}
      <AddAccountModal
        isVisible={state === STATE.ADD_ACCOUNT}
        onClose={handleModalClose}
      />
    </View>
  );
}
