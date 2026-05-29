import React from "react";
import { View, Text, ScrollView } from "react-native";

export type TimeBucket = "daily" | "weekly" | "monthly" | "yearly";

type Transaction = {
  amount_minor: number;
  date: string | null;
  [key: string]: any;
};

type Props = {
  transactions: Transaction[];
  timeBucket: TimeBucket;
  currency?: string;
  mode?: "both" | "income" | "expense";
};

function getBucketKey(date: Date, bucket: TimeBucket): string {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();

  switch (bucket) {
    case "daily":
      return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    case "weekly": {
      const jan1 = new Date(y, 0, 1);
      const days = Math.floor(
        (date.getTime() - jan1.getTime()) / (24 * 60 * 60 * 1000),
      );
      const week = Math.ceil((days + jan1.getDay() + 1) / 7);
      return `${y}-W${String(week).padStart(2, "0")}`;
    }
    case "monthly":
      return `${y}-${String(m + 1).padStart(2, "0")}`;
    case "yearly":
      return `${y}`;
  }
}

function getBucketLabel(key: string, bucket: TimeBucket): string {
  switch (bucket) {
    case "daily": {
      const parts = key.split("-");
      return `${parts[2]}/${parts[1]}`;
    }
    case "weekly": {
      return key.replace("-W", " W");
    }
    case "monthly": {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const parts = key.split("-");
      return months[parseInt(parts[1], 10) - 1] || key;
    }
    case "yearly":
      return key;
  }
}

type BucketData = {
  key: string;
  label: string;
  income: number;
  expense: number;
};

function bucketize(
  transactions: Transaction[],
  bucket: TimeBucket,
): BucketData[] {
  const map: Record<string, { income: number; expense: number }> = {};

  for (const tx of transactions) {
    if (!tx.date) continue;
    const date = new Date(tx.date);
    if (isNaN(date.getTime())) continue;
    const key = getBucketKey(date, bucket);
    if (!map[key]) map[key] = { income: 0, expense: 0 };
    if (tx.amount_minor >= 0) {
      map[key].income += tx.amount_minor;
    } else {
      map[key].expense += Math.abs(tx.amount_minor);
    }
  }

  return Object.entries(map)
    .map(([key, val]) => ({
      key,
      label: getBucketLabel(key, bucket),
      ...val,
    }))
    .sort((a, b) => a.key.localeCompare(b.key));
}

export default function BarChart({
  transactions,
  timeBucket,
  currency = "\u20ac",
  mode = "both",
}: Props) {
  const buckets = bucketize(transactions, timeBucket);

  if (buckets.length === 0) {
    return (
      <View className="items-center justify-center py-10">
        <Text className="text-gray-400">No data for this period</Text>
      </View>
    );
  }

  const maxValue = Math.max(
    ...buckets.map((b) => {
      if (mode === "income") return b.income;
      if (mode === "expense") return b.expense;
      return Math.max(b.income, b.expense);
    }),
  );
  const chartHeight = 160;

  const formatAmount = (v: number) => {
    const val = v / 100;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return val.toFixed(0);
  };

  return (
    <View className="w-full">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 8,
          alignItems: "flex-end",
          minWidth: "100%",
          justifyContent: buckets.length <= 6 ? "space-evenly" : "flex-start",
        }}
      >
        {buckets.map((b) => {
          const incomeH =
            maxValue > 0 ? (b.income / maxValue) * chartHeight : 0;
          const expenseH =
            maxValue > 0 ? (b.expense / maxValue) * chartHeight : 0;
          const showIncome = mode === "both" || mode === "income";
          const showExpense = mode === "both" || mode === "expense";

          return (
            <View
              key={b.key}
              className="items-center mx-1"
              style={{ minWidth: 40 }}
            >
              <View
                style={{
                  height: chartHeight,
                  flexDirection: "row",
                  alignItems: "flex-end",
                  gap: mode === "both" ? 2 : 0,
                }}
              >
                {showIncome && b.income > 0 && (
                  <View className="items-center">
                    <Text
                      style={{
                        fontSize: 9,
                        color: "#6b7280",
                        marginBottom: 2,
                      }}
                    >
                      {formatAmount(b.income)}
                    </Text>
                    <View
                      style={{
                        width: mode === "both" ? 14 : 24,
                        height: Math.max(incomeH, 4),
                        backgroundColor: "#22c55e",
                        borderRadius: 4,
                      }}
                    />
                  </View>
                )}
                {showExpense && b.expense > 0 && (
                  <View className="items-center">
                    <Text
                      style={{
                        fontSize: 9,
                        color: "#6b7280",
                        marginBottom: 2,
                      }}
                    >
                      {formatAmount(b.expense)}
                    </Text>
                    <View
                      style={{
                        width: mode === "both" ? 14 : 24,
                        height: Math.max(expenseH, 4),
                        backgroundColor: "#ef4444",
                        borderRadius: 4,
                      }}
                    />
                  </View>
                )}
                {showIncome &&
                  !showExpense &&
                  b.income === 0 &&
                  b.expense === 0 && (
                    <View style={{ width: 24, height: 4 }} />
                  )}
                {showExpense &&
                  !showIncome &&
                  b.expense === 0 &&
                  b.income === 0 && (
                    <View style={{ width: 24, height: 4 }} />
                  )}
              </View>
              <Text
                style={{
                  fontSize: 10,
                  color: "#9ca3af",
                  marginTop: 4,
                }}
              >
                {b.label}
              </Text>
            </View>
          );
        })}
      </ScrollView>
      {maxValue > 0 && (
        <View className="flex-row justify-center mt-3 gap-4">
          {(mode === "both" || mode === "income") && (
            <View className="flex-row items-center">
              <View
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: "#22c55e",
                  borderRadius: 2,
                  marginRight: 4,
                }}
              />
              <Text style={{ fontSize: 11, color: "#6b7280" }}>Income</Text>
            </View>
          )}
          {(mode === "both" || mode === "expense") && (
            <View className="flex-row items-center">
              <View
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: "#ef4444",
                  borderRadius: 2,
                  marginRight: 4,
                }}
              />
              <Text style={{ fontSize: 11, color: "#6b7280" }}>Expenses</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
