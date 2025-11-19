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
import { addTransaction } from "@/utils/db/finance/finance";
import { useAuthStore } from "@/utils/authStore";

type Props = {
  isVisible: boolean;
  onClose: () => void;
  accounts: {
    id: number;
    kind: string;
    currency: string;
    balance_minor: number;
    user_id: string;
  }[];
  selectedAccountId: number;
  onTransactionAdded: () => Promise<void>;
};

export default function AddTransactionModal({
  isVisible,
  onClose,
  accounts,
  selectedAccountId,
  onTransactionAdded,
}: Props) {
  const [isModalVisible, setIsModalVisible] = useState(isVisible);
  const [state, setState] = useState("expense");
  const [selectedAccount, setSelectedAccount] = useState(selectedAccountId);
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [description, setDescription] = useState("");
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const SCREEN_HEIGHT = Dimensions.get("window").height;
  const sheetPosition = useRef(new Animated.Value(SCREEN_HEIGHT)).current; // start hidden

  const { session } = useAuthStore();

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
    }),
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
      }).start(() => {
        setIsModalVisible(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, selectedAccountId]);

  const handleClose = () => {
    Animated.timing(sheetPosition, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
      // Reset form fields
      setAmount("");
      setMerchant("");
      setDescription("");
      setState("expense");
      onTransactionAdded().then(() => {
        onClose();
      });
    });
  };

  const handleAddTransaction = async () => {
    if (!amount || !merchant || !description) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!session?.access_token) {
      Alert.alert("Error", "Not authenticated");
      return;
    }

    if (!selectedAccount) {
      Alert.alert("Error", "Please select an account");
      return;
    }

    try {
      setIsLoading(true);
      const amountMinor = Math.round(parseFloat(amount) * 100);

      const transactionData = {
        type: state,
        amount_minor: state === "expense" ? -amountMinor : amountMinor,
        currency: accounts.find((acc: any) => acc.id === selectedAccount)
          ?.currency,
        description: description,
        merchant: merchant,
      };

      await addTransaction(
        session.access_token,
        session.refresh_token,
        transactionData,
        selectedAccount,
      );

      handleClose();
    } finally {
      setIsLoading(false);
    }
  };

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
          <SafeAreaView style={{ flex: 1 }} className={"rounded-2xl"}>
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
              Transaction
            </Text>
            {/* Type toggle */}
            <Text className="text-lg font-semibold text-black mb-3">Type</Text>
            <View className="flex-row justify-around items-center mb-6 bg-[#F1F1F2] w-full h-[40px] rounded-full">
              <TouchableOpacity
                onPress={() => setState("expense")}
                className={`w-1/2 h-full flex justify-center items-center ${
                  state === "expense" ? "bg-black rounded-full" : ""
                }`}
              >
                <Text
                  className={`text-xl ${state === "expense" ? "text-white" : "text-neutral-500"}`}
                >
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setState("income")}
                className={`w-1/2 h-full flex justify-center items-center ${
                  state === "income" ? "bg-black rounded-full" : ""
                }`}
              >
                <Text
                  className={`text-xl ${state === "income" ? "text-white" : "text-neutral-500"}`}
                >
                  Income
                </Text>
              </TouchableOpacity>
            </View>
            {/* Account selection */}
            <Text className="text-lg font-semibold text-black mb-2">
              Account
            </Text>
            <TouchableOpacity
              onPress={() => setShowAccountPicker(!showAccountPicker)}
              className="bg-neutral-100 rounded-2xl px-5 py-4 mb-4 flex-row justify-between items-center"
            >
              <Text className="text-neutral-500">
                {accounts.find((acc: any) => acc.id === selectedAccount)
                  ?.kind || "Select account"}
              </Text>
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: showAccountPicker ? "180deg" : "0deg",
                    },
                  ],
                }}
              >
                <ChevronDown className="text-neutral-500" />
              </Animated.View>
            </TouchableOpacity>

            {showAccountPicker && (
              <View className="bg-neutral-50 rounded-2xl px-5 py-3 mb-4 border border-neutral-200">
                {accounts.map((account: any) => (
                  <TouchableOpacity
                    key={account.id}
                    onPress={() => {
                      setSelectedAccount(account.id);
                      setShowAccountPicker(false);
                    }}
                    className={`py-3 px-3 rounded-lg ${
                      selectedAccount === account.id ? "" : ""
                    }`}
                  >
                    <Text
                      className={`${
                        selectedAccount === account.id
                          ? "text-gray font-semibold"
                          : "text-neutral-700"
                      }`}
                    >
                      {account.kind}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {/* Amount */}
            <Text className="text-lg font-semibold text-black mb-2">
              Amount
            </Text>
            <View className="bg-neutral-100 rounded-2xl px-5 py-4 mb-4">
              <TextInput
                className="text-black"
                placeholder="e.g. € 0.00"
                keyboardType="numbers-and-punctuation"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            <Text className="text-lg font-semibold text-black mb-2">
              {state === "income" ? "Sender" : "Recipient"}
            </Text>
            <View className="bg-neutral-100 rounded-2xl px-5 py-4 mb-4">
              <TextInput
                className="text-black"
                placeholder={
                  state === "income" ? "e.g. Employer" : "e.g. Grocery Store"
                }
                value={merchant}
                onChangeText={setMerchant}
              />
            </View>

            <Text className="text-lg font-semibold text-black mb-2">Usage</Text>
            <View className="bg-neutral-100 rounded-2xl px-5 py-4 mb-8">
              <TextInput
                className="text-black"
                placeholder="e.g. Groceries, Rent, Salary..."
                value={description}
                onChangeText={setDescription}
              />
            </View>
            <TouchableOpacity
              className="bg-black rounded-full py-4"
              onPress={handleAddTransaction}
              disabled={isLoading}
            >
              <Text className="text-center text-white font-semibold text-lg">
                {isLoading ? "Adding..." : "Add Transaction"}
              </Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}
