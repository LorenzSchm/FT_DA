"use client";
import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import Svg, { Polyline } from "react-native-svg";

type Transaction = {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: "add" | "subtract";
};

type Props = {
  savingId: number;
  savingName: string;
  currentAmount: number;
  goalAmount: number;
  currency: string;
  onBack: () => void;
};

const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    description: "DCIP",
    amount: 12.99,
    date: "2025-11-15",
    type: "add",
  },
  {
    id: 2,
    description: "Monthly Savings",
    amount: 50.0,
    date: "2025-11-10",
    type: "add",
  },
  {
    id: 3,
    description: "Withdrawal",
    amount: 20.0,
    date: "2025-11-05",
    type: "subtract",
  },
];

export default function SavingsDetailView({
  savingId,
  savingName,
  currentAmount,
  goalAmount,
  currency,
  onBack,
}: Props) {
  // Simple line chart data points
  const chartPoints = "0,80 50,60 100,50 150,40 200,35 250,30";
  const progress = (currentAmount / goalAmount) * 100;

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-7 pt-16 pb-4 flex-row items-center">
        <TouchableOpacity onPress={onBack} className="mr-4">
          <ArrowLeft color="#000" size={24} />
        </TouchableOpacity>
        <Text className="text-2xl font-bold">{savingName}</Text>
      </View>

      <ScrollView className="flex-1 px-7">
        {/* Chart Section */}
        <View className="mb-6 bg-neutral-50 rounded-2xl p-6">
          <View className="mb-4">
            <Text className="text-3xl font-bold">
              {currency}
              {(currentAmount / 100).toFixed(2)}
            </Text>
            <Text className="text-neutral-500 mt-1">
              of {currency}
              {(goalAmount / 100).toFixed(2)} ({progress.toFixed(0)}%)
            </Text>
          </View>

          {/* Simple Line Chart */}
          <View className="h-[150px] bg-white rounded-xl p-4">
            <Svg width="100%" height="100%" viewBox="0 0 250 100">
              {/* Grid lines */}
              <Polyline
                points="0,20 250,20"
                fill="none"
                stroke="#F1F1F2"
                strokeWidth="1"
              />
              <Polyline
                points="0,40 250,40"
                fill="none"
                stroke="#F1F1F2"
                strokeWidth="1"
              />
              <Polyline
                points="0,60 250,60"
                fill="none"
                stroke="#F1F1F2"
                strokeWidth="1"
              />
              <Polyline
                points="0,80 250,80"
                fill="none"
                stroke="#F1F1F2"
                strokeWidth="1"
              />

              {/* Line chart */}
              <Polyline
                points={chartPoints}
                fill="none"
                stroke="#000000"
                strokeWidth="2"
              />
            </Svg>
          </View>
        </View>

        {/* Description Section */}
        <View className="mb-6">
          <Text className="text-xl font-bold mb-3">Description</Text>
          <View className="bg-neutral-100 rounded-2xl p-5">
            <Text className="text-neutral-700">
              Track your progress towards your {savingName.toLowerCase()} goal.
              Regular contributions will help you reach your target of {currency}
              {(goalAmount / 100).toFixed(2)}.
            </Text>
          </View>
        </View>

        {/* Transactions Section */}
        <View className="mb-20">
          <Text className="text-xl font-bold mb-3">Transactions</Text>
          {DEMO_TRANSACTIONS.map((transaction) => (
            <View
              key={transaction.id}
              className="bg-white border border-neutral-200 rounded-2xl p-4 mb-3 flex-row justify-between items-center"
            >
              <View>
                <Text className="text-base font-semibold">
                  {transaction.description}
                </Text>
                <Text className="text-neutral-500 text-sm">
                  {new Date(transaction.date).toLocaleDateString("de-DE")}
                </Text>
              </View>
              <Text
                className={`text-lg font-bold ${
                  transaction.type === "add" ? "text-green-600" : "text-red-600"
                }`}
              >
                {transaction.type === "add" ? "+" : "-"}
                {currency}
                {transaction.amount.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
