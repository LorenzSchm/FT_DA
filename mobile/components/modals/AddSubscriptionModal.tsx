"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  PanResponder,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronDown } from "lucide-react-native";
import { useAuthStore } from "@/utils/authStore";
import { addSubscription } from "@/utils/db/finance/subscriptions/subscriptions";

type Props = {
  isVisible: boolean;
  onClose: () => void;
  accounts: any[];
  selectedAccountId: number;
  onSubscriptionAdded: () => Promise<void>;
};

export default function AddSubscription({
  isVisible,
  onClose,
  accounts,
  selectedAccountId,
  onSubscriptionAdded,
}: Props) {
  const [isModalVisible, setIsModalVisible] = useState(isVisible);
  const [selectedAccount, setSelectedAccount] = useState(selectedAccountId);

  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [startDate, setStartDate] = useState("");

  const [unit, setUnit] = useState("month");
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const SCREEN_HEIGHT = Dimensions.get("window").height;
  const sheetPosition = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const { session } = useAuthStore();

  const iosShadow = {
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  };
  const shadowStyle = Platform.select({ ios: iosShadow });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dy) > Math.abs(g.dx) && Math.abs(g.dy) > 2,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) sheetPosition.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100 || g.vy > 0.5) handleClose();
        else
          Animated.spring(sheetPosition, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
      },
    })
  ).current;

  useEffect(() => {
    if (isVisible) {
      setIsModalVisible(true);
      setSelectedAccount(selectedAccountId);

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
  }, [isVisible, selectedAccountId]);

  const resetFields = () => {
    setMerchant("");
    setAmount("");
    setCurrency("EUR");
    setStartDate("");
    setUnit("month");
  };

  const handleClose = (skipCallback = false) => {
    Animated.timing(sheetPosition, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(async () => {
      setIsModalVisible(false);
      resetFields();
      if (!skipCallback) {
        await onSubscriptionAdded();
      }
      onClose();
    });
  };

  const handleAddSubscription = async () => {
    if (!merchant || !amount || !startDate) {
      Alert.alert("Error", "Please fill in merchant, amount, and start date.");
      return;
    }

    if (!session?.access_token) {
      Alert.alert("Error", "Not authenticated");
      return;
    }

    const amountMinor = Math.round(parseFloat(amount) * 100);

    try {
      setIsLoading(true);

      const subData = {
        merchant,
        amount_minor: amountMinor,
        currency,
        start_date: startDate,
        unit,

        // Default values (requested)
        every_n: 1,
        active: true,
        auto_detected: false,
      };

      await addSubscription(
        session.access_token,
        session.refresh_token,
        subData,
        selectedAccount
      );

      // Call onSubscriptionAdded first and wait for it to complete
      await onSubscriptionAdded();

      // Then close the modal, skipping the callback since we already called it
      handleClose(true);
    } catch (error) {
      console.error("Error adding subscription:", error);
      Alert.alert("Error", "Failed to add subscription. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      animationType="none"
      transparent
      visible={isModalVisible}
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }}
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
            <Text className="text-3xl font-extrabold text-black mb-6">
              Add Subscription
            </Text>

            <Text className="font-semibold text-black mb-2 text-[20px]">Account</Text>
            <TouchableOpacity
              onPress={() => setShowAccountPicker(!showAccountPicker)}
              className="bg-neutral-100 rounded-full px-5 py-4 mb-4 flex-row justify-between items-center"
            >
              <Text className="text-neutral-500 text-[20px]">
                {accounts.find(a => a.id === selectedAccount)?.kind ??
                  "Select account"}
              </Text>
              <ChevronDown className="text-neutral-500" />
            </TouchableOpacity>

            {showAccountPicker && (
              <View className="bg-neutral-50 rounded-full px-5 py-3 mb-4 border border-neutral-200">
                {accounts.map(acc => (
                  <TouchableOpacity
                    key={acc.id}
                    onPress={() => {
                      setSelectedAccount(acc.id);
                      setCurrency(acc.currency);
                      setShowAccountPicker(false);
                    }}
                    className="py-3"
                  >
                    <Text
                      className={
                        selectedAccount === acc.id
                          ? "font-semibold text-black text-[20px]"
                          : "text-neutral-700 text-[20px]"
                      }
                    >
                      {acc.kind}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text className="font-semibold text-black mb-2 text-[20px]">Merchant</Text>
            <View className="bg-neutral-100 rounded-full px-5 py-4 mb-4">
              <TextInput
                placeholder="e.g. Netflix"
                value={merchant}
                onChangeText={setMerchant}
                className="text-black text-[20px]"
              />
            </View>

            <Text className="font-semibold text-black mb-2 text-[20px]">Amount</Text>
            <View className="bg-neutral-100 rounded-full px-5 py-4 mb-4">
              <TextInput
                placeholder="e.g. 9.99"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                className="text-black text-[20px]"
              />
            </View>

            <Text className="font-semibold text-black mb-2 text-[20px]">Billing Period</Text>

            <TouchableOpacity
              onPress={() => setShowUnitPicker(!showUnitPicker)}
              className="bg-neutral-100 rounded-full px-5 py-4 mb-4 flex-row justify-between items-center"
            >
              <Text className="text-black capitalize text-[20px]">{unit}</Text>
              <ChevronDown className="text-neutral-500" />
            </TouchableOpacity>

            {showUnitPicker && (
              <View className="bg-neutral-50 rounded-full px-5 py-3 mb-4 border border-neutral-200">
                {["week", "month", "year"].map(u => (
                  <TouchableOpacity
                    key={u}
                    onPress={() => {
                      setUnit(u);
                      setShowUnitPicker(false);
                    }}
                    className="py-3"
                  >
                    <Text
                      className={unit === u ? "font-semibold text-black text-[20px]" : "text-neutral-700 text-[20px]"}
                    >
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text className="font-semibold text-black mb-2 text-[20px]">Start Date</Text>
            <View className="bg-neutral-100 rounded-full px-5 py-4 mb-4">
              <TextInput
                placeholder="YYYY-MM-DD"
                value={startDate}
                onChangeText={setStartDate}
                className="text-black text-[20px]"
              />
            </View>

            <TouchableOpacity
              className="bg-black rounded-full py-4 mt-4"
              onPress={handleAddSubscription}
              disabled={isLoading}
            >
              <Text className="text-center text-white font-semibold text-xl">
                {isLoading ? "Adding..." : "Add"}
              </Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}
