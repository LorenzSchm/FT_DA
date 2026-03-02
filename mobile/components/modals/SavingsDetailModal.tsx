"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  PanResponder,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PhantomChart } from "../PhantomChart";
import { format, parseISO } from "date-fns";

type Transaction = {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: "add" | "subtract";
};

type Contribution = {
  id: string;
  amount_minor?: number;
  contributed_minor?: number;
  created_at?: string; // sometimes present
  contributed_at?: string; // THIS is the real transaction date
  description?: string;
  note?: string;
};

type Props = {
  isVisible: boolean;
  onClose: () => void;
  savingId: number;
  savingName: string;
  currentAmount: number;
  goalAmount: number;
  currency: string;
  transactions?: Transaction[];
  savingObject?: {
    contributions: Contribution[];
    created_at: string;
  };
};

type TimeframeKey = "1D" | "1W" | "1M" | "1Y" | "ALL";

/* -------------------------------------------------------------
   Robust date parser – works with both created_at & contributed_at
   and strips microseconds that sometimes break React Native
   ------------------------------------------------------------- */
const parseContributionDate = (contrib: Contribution): Date => {
  const raw = contrib.contributed_at ?? contrib.created_at;
  if (!raw) return new Date();

  // Remove microseconds (everything after the first 3 decimal places or the dot entirely)
  const cleanIso = raw.split(".")[0] + (raw.includes(".") ? "Z" : "");

  const parsed = parseISO(cleanIso);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const formatDateYMD = (contrib: Contribution): string => {
  const date = parseContributionDate(contrib);
  return format(date, "yyyy-MM-dd");
};

export default function SavingsDetailModal({
  isVisible,
  onClose,
  savingId,
  savingName,
  currentAmount,
  goalAmount,
  currency,
  transactions = [],
  savingObject,
}: Props) {
  const [isModalVisible, setIsModalVisible] = useState(isVisible);
  const SCREEN_HEIGHT = Dimensions.get("window").height;
  const sheetPosition = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
          Math.abs(gestureState.dy) > 2
        );
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          sheetPosition.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          handleClose();
        } else {
          Animated.spring(sheetPosition, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (isVisible) {
      setIsModalVisible(true);
      Animated.spring(sheetPosition, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(sheetPosition, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setIsModalVisible(false));
    }
  }, [isVisible]);

  const handleClose = () => {
    Animated.timing(sheetPosition, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
      onClose();
    });
  };

  /* -------------------------- Chart Data -------------------------- */
  const dataByTimeframe = React.useMemo(() => {
    const result: Record<TimeframeKey, { timestamp: number; value: number }[]> =
      {
        "1D": [],
        "1W": [],
        "1M": [],
        "1Y": [],
        ALL: [],
      };

    if (
      !savingObject?.contributions ||
      savingObject.contributions.length === 0
    ) {
      return result;
    }

    const sorted = [...savingObject.contributions].sort(
      (a, b) =>
        parseContributionDate(a).getTime() - parseContributionDate(b).getTime(),
    );

    const now = Date.now();
    const ranges: Record<TimeframeKey, number> = {
      "1D": 24 * 60 * 60 * 1000,
      "1W": 7 * 24 * 60 * 60 * 1000,
      "1M": 30 * 24 * 60 * 60 * 1000,
      "1Y": 365 * 24 * 60 * 60 * 1000,
      ALL:
        now - parseISO(savingObject.created_at.split(".")[0] + "Z").getTime(),
    };

    (Object.keys(ranges) as TimeframeKey[]).forEach((key) => {
      const windowStart =
        key === "ALL"
          ? parseISO(savingObject.created_at.split(".")[0] + "Z").getTime()
          : now - ranges[key];
      let cumulative = 0;
      const series: { timestamp: number; value: number }[] = [
        { timestamp: windowStart, value: 0 },
      ];

      sorted.forEach((c) => {
        const ts = parseContributionDate(c).getTime();
        if (ts >= windowStart) {
          const amount = (c.amount_minor ?? c.contributed_minor ?? 0) / 100;
          cumulative += amount;
          series.push({ timestamp: ts, value: cumulative });
        }
      });

      result[key] = series.length > 1 ? series : [];
    });
    console.log(savingObject);

    return result;
  }, [savingObject]);

  const progress = goalAmount > 0 ? (currentAmount / goalAmount) * 100 : 0;

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={handleClose}
    >
      <GestureHandlerRootView style={{ flex: 1, justifyContent: "flex-end" }}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }}
          activeOpacity={1}
          onPress={handleClose}
        />
        <Animated.View
          style={{
            transform: [{ translateY: sheetPosition }],
            backgroundColor: "white",
            padding: 24,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            minHeight: SCREEN_HEIGHT,
          }}
        >
          <SafeAreaView style={{ flex: 1 }}>
            {/* Drag Handle */}
            <View className="flex items-center">
              <View
                {...panResponder.panHandlers}
                style={{
                  height: 40,
                  marginTop: 30,
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View className="bg-gray-400 w-[50px] h-[5px] rounded-full" />
              </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View className="mb-4">
                <Text className="text-4xl font-bold">{savingName}</Text>
              </View>

              {/* Chart Section */}
              <View className="mb-6">
                <View>
                  <Text className="text-3xl font-bold">
                    {currency}
                    {(currentAmount / 100).toFixed(2)}
                  </Text>
                  {goalAmount > 0 && (
                    <Text className="text-neutral-500 mt-1">
                      of {currency}
                      {(goalAmount / 100).toFixed(2)} ({progress.toFixed(0)}%)
                    </Text>
                  )}
                </View>

                <View className="rounded-2xl " style={{ minHeight: 180 }}>
                  <PhantomChart
                    dataByTimeframe={dataByTimeframe}
                    initialTimeframe="ALL"
                    height={200}
                    lineColor={"#22c55e"}
                    showAmount={false}
                  />
                </View>
              </View>

              {/* Transactions Section */}
              <View className="mb-20">
                <Text className="text-xl font-bold mb-3">Transactions</Text>

                {!savingObject?.contributions ||
                savingObject.contributions.length === 0 ? (
                  <Text className="text-neutral-500 text-center py-8">
                    No transactions yet
                  </Text>
                ) : (
                  [...savingObject.contributions]
                    .sort(
                      (a, b) =>
                        parseContributionDate(b).getTime() -
                        parseContributionDate(a).getTime(),
                    )
                    .map((contribution) => {
                      const amount =
                        (contribution.amount_minor ??
                          contribution.contributed_minor ??
                          0) / 100;
                      const displayDate = formatDateYMD(contribution);
                      const isPositive = amount >= 0;
                      const formattedAmount = Math.abs(amount).toFixed(2);

                      return (
                        <View
                          key={contribution.id}
                          className="bg-white p-4 mb-1 flex-row justify-between items-center"
                        >
                          <View>
                            <Text className="text-base font-semibold">
                              {contribution.description ||
                                contribution.note ||
                                "Contribution"}
                            </Text>
                            <Text className="text-neutral-500 text-sm">
                              {displayDate}
                            </Text>
                          </View>
                          <Text
                            className={`text-lg font-bold ${
                              isPositive ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {isPositive ? "+" : "-"}
                            {currency}
                            {formattedAmount}
                          </Text>
                        </View>
                      );
                    })
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}
