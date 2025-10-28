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
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useState } from "react";

export default function DashBoard() {
  const { width, height } = useWindowDimensions();
  const [accountIndex, setAccountIndex] = useState(0);

  const cardWidth = (width - 60) * 0.9;
  const contentWidth = cardWidth;
  const maxListHeight = height * 0.45; // only allow scroll when transactions exceed this height

  const user = {
    id: 1,
    email: "john.doe@example.com",
    display_name: "John Doe",
    locale: "en-US",
    tz: "America/New_York",
  };

  const accounts = {
    data: [
      {
        id: 1,
        user_id: 1,
        name: "Checking Account",
        institution: "Bank of America",
        currency: "USD",
        kind: "Checking",
        amount: 3000,
      },
      {
        id: 2,
        user_id: 1,
        name: "Savings Account",
        institution: "Bank of America",
        currency: "USD",
        kind: "Savings",
        amount: 15000,
      },
      {
        id: 3,
        user_id: 1,
        name: "Investment Account",
        institution: "Fidelity",
        currency: "USD",
        kind: "Investment",
        amount: -20,
      },
      {
        id: 4,
        user_id: 1,
        name: "Credit Card",
        institution: "Chase",
        currency: "USD",
        kind: "Credit",
        amount: 30,
      },
    ],
  };

  const transactions = {
    data: [
      {
        id: 1,
        user_id: 1,
        account_id: 2,
        txn_date: "2023-10-01",
        posted_at: "2023-10-01",
        amount_minor: -5000,
        currency: "USD",
        description: "Kino LOL",
        category_id: 1,
      },
      {
        id: 2,
        user_id: 1,
        account_id: 1,
        txn_date: "2023-10-02",
        posted_at: "2023-10-02",
        amount_minor: 12500,
        currency: "USD",
        description: "Grocery Store",
        category_id: "Food",
      },
      {
        id: 3,
        user_id: 1,
        account_id: 2,
        txn_date: "2023-10-03",
        posted_at: "2023-10-03",
        amount_minor: 3200,
        currency: "USD",
        description: "Coffee Shop",
        category_id: 3,
      },
      {
        id: 4,
        user_id: 1,
        account_id: 3,
        txn_date: "2023-10-04",
        posted_at: "2023-10-04",
        amount_minor: 45000,
        currency: "USD",
        description: "Monthly Rent",
        category_id: 4,
      },
      {
        id: 5,
        user_id: 1,
        account_id: 1,
        txn_date: "2023-10-05",
        posted_at: "2023-10-05",
        amount_minor: 8900,
        currency: "USD",
        description: "Gas Station",
        category_id: "Food",
      },
      {
        id: 6,
        user_id: 1,
        account_id: 4,
        txn_date: "2023-10-06",
        posted_at: "2023-10-06",
        amount_minor: 2500,
        currency: "USD",
        description: "Restaurant Dinner",
        category_id: 6,
      },
      {
        id: 7,
        user_id: 1,
        account_id: 4,
        txn_date: "2023-10-06",
        posted_at: "2023-10-06",
        amount_minor: 2500,
        currency: "USD",
        description: "Restaurant Dinner",
        category_id: 6,
      },
      {
        id: 8,
        user_id: 1,
        account_id: 4,
        txn_date: "2023-10-06",
        posted_at: "2023-10-06",
        amount_minor: 2500,
        currency: "USD",
        description: "Restaurant Dinner",
        category_id: 6,
      },
      {
        id: 9,
        user_id: 1,
        account_id: 4,
        txn_date: "2023-10-06",
        posted_at: "2023-10-06",
        amount_minor: 2500,
        currency: "USD",
        description: "Restaurant Dinner",
        category_id: 6,
      },
      {
        id: 10,
        user_id: 1,
        account_id: 4,
        txn_date: "2023-10-06",
        posted_at: "2023-10-06",
        amount_minor: 2500,
        currency: "USD",
        description: "Restaurant Dinner",
        category_id: 6,
      },
      {
        id: 11,
        user_id: 1,
        account_id: 4,
        txn_date: "2023-10-06",
        posted_at: "2023-10-06",
        amount_minor: 2500,
        currency: "USD",
        description: "Restaurant Dinner",
        category_id: 6,
      },
      {
        id: 12,
        user_id: 1,
        account_id: 4,
        txn_date: "2023-10-06",
        posted_at: "2023-10-06",
        amount_minor: 2500,
        currency: "USD",
        description: "Restaurant Dinner",
        category_id: 6,
      },
      {
        id: 13,
        user_id: 1,
        account_id: 4,
        txn_date: "2023-10-06",
        posted_at: "2023-10-06",
        amount_minor: 2500,
        currency: "USD",
        description: "Restaurant Dinner",
        category_id: 6,
      },
    ],
  };

  return (
    <View className="flex-1 w-full flex-col">
      <View className="flex-1 items-center justify-center">
        <View className="gap-3 items-center">
          <Text className="text-center text-2xl font-bold">
            Good morning {user.display_name}!
          </Text>

          <View className="w-full">
            <Carousel onIndexChange={setAccountIndex}>
              <CarouselContent>
                {accounts.data.map((account) => (
                  <CarouselItem
                    key={account.id}
                    className="items-center justify-center"
                  >
                    <Card
                      kind={account.kind}
                      amount={account.amount}
                      currency={account.currency}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </View>
        </View>
      </View>

      <View className="flex-1 items-center justify-start w-full pt-2">
        <View className="gap-5" style={{ width: contentWidth }}>
          <Text className="text-xl font-bold">Transactions</Text>

          <ScrollView
            style={{ maxHeight: maxListHeight }}
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-5 pb-5">
              {transactions.data
                .filter(
                  (txn) => txn.account_id === accounts.data[accountIndex].id,
                )
                .map((txn) => (
                  <View
                    key={txn.id}
                    className="flex flex-row justify-between"
                    style={{ width: contentWidth }}
                  >
                    <View>
                      <Text className="text-xl font-bold">
                        {txn.description}
                      </Text>
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
      <Pressable className="bg-black absolute bottom-20 right-10 w-32 h-16 rounded-full items-center justify-center shadow-lg">
        <Text className="text-white font-bold text-xl">Add +</Text>
      </Pressable>
    </View>
  );
}
