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
import Svg, { Polyline } from "react-native-svg";

type Transaction = {
  id: number;
  description: string;
  amount: number;
  date: string;
  type: "add" | "subtract";
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
}: Props) {
  const [isModalVisible, setIsModalVisible] = useState(isVisible);
  const SCREEN_HEIGHT = Dimensions.get("window").height;
  const sheetPosition = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const iosShadow = {
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  };

  const shadowStyle = Platform.select({
    ios: iosShadow,
  });

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
    })
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
      }).start(() => {
        setIsModalVisible(false);
      });
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

  const chartPoints = "0,80 50,60 100,50 150,40 200,35 250,30";
  const progress = (currentAmount / goalAmount) * 100;

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
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
            ...shadowStyle,
          }}
        >
          <SafeAreaView style={{ flex: 1 }}>
            {/* Drag Handle */}
            <View className={"flex items-center"}>
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
                <View className={"bg-gray-400 w-[50px] h-[5px] rounded-full"} />
              </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View className="mb-6">
                <Text className="text-2xl font-bold">{savingName}</Text>
              </View>

              {/* Chart Section */}
              <View className="mb-6">
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

                {/* Time Period Selector */}
                <View className="flex-row justify-around mb-4">
                  {["1D", "1W", "1M", "1Y", "MAX"].map((period, index) => (
                    <TouchableOpacity
                      key={period}
                      className={`px-3 py-1 ${index === 1 ? "border-b-2 border-black" : ""}`}
                    >
                      <Text
                        className={`${index === 1 ? "font-bold" : "text-neutral-500"}`}
                      >
                        {period}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

              </View>

              {/* Description Section */}
              <View className="mb-6">
                <Text className="text-xl font-bold mb-3">Description</Text>
                <TextInput className="text-neutral-600 text-base leading-6" placeholder="Add a description...">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </TextInput>
              </View>

              {/* Transactions Section */}
              <View className="mb-20">
                <Text className="text-xl font-bold mb-3">Transactions</Text>
                {transactions.length === 0 ? (
                  <Text className="text-neutral-500 text-center py-8">
                    No transactions yet
                  </Text>
                ) : (
                  transactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((transaction) => (
                      <View
                        key={transaction.id}
                        className="bg-white rounded-2xl p-4 mb-1 flex-row justify-between items-center"
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
                            transaction.type === "add"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "add" ? "+" : "-"}
                          {currency}
                          {(transaction.amount / 100).toFixed(2)}
                        </Text>
                      </View>
                    ))
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}
