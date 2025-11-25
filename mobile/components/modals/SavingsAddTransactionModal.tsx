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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronDown } from "lucide-react-native";

type SavingsAccount = {
  id: number;
  name: string;
  goalAmount: number;
  currentAmount: number;
  currency: string;
  provider: string;
};

type Props = {
  isVisible: boolean;
  onClose: () => void;
  selectedSavingId?: number | null;
  onSave?: (
    savingId: number,
    type: "add" | "subtract",
    name: string,
    amount: string,
  ) => void;
  savings?: SavingsAccount[];
};

export default function SavingsAddTransactionModal({
  isVisible,
  onClose,
  selectedSavingId,
  onSave,
  savings = [],
}: Props) {
  const [isModalVisible, setIsModalVisible] = useState(isVisible);
  const [transactionType, setTransactionType] = useState<"add" | "subtract">(
    "add",
  );
  const [selectedAccount, setSelectedAccount] = useState<number>(
    selectedSavingId || 1,
  );
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [showAccountPicker, setShowAccountPicker] = useState(false);

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
    }),
  ).current;

  useEffect(() => {
    if (isVisible) {
      setIsModalVisible(true);
      if (selectedSavingId) {
        setSelectedAccount(selectedSavingId);
      }
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
      // Reset form
      setName("");
      setAmount("");
      setTransactionType("add");
      onClose();
    });
  };

  const handleSave = async () => {
    if (onSave) {
      try {
        await onSave(selectedAccount, transactionType, name, amount);
      } catch (error) {
        console.error("Error saving transaction:", error);
        return; // Don't close if there was an error
      }
    } else {
      console.log("Saving Savings Transaction:", {
        savingId: selectedAccount,
        type: transactionType,
        name,
        amount,
        provider: "FT",
      });
    }
    handleClose();
  };

  const selectedAccountName =
    savings.find((acc) => acc.id === selectedAccount)?.name || "Select Account";

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

            {/* Title */}
            <Text className="text-3xl font-extrabold text-black mb-6">
              Saving Transaction
            </Text>

            {/* Type Toggle */}
            <Text className="text-lg font-semibold text-black mb-2">Type</Text>
            <View className="flex-row justify-around items-center bg-[#F1F1F2] w-full h-[40px] rounded-full mb-6">
              <TouchableOpacity
                onPress={() => setTransactionType("add")}
                className={`w-1/2 h-full flex justify-center items-center ${
                  transactionType === "add" ? "bg-black rounded-full" : ""
                }`}
              >
                <Text
                  className={`text-xl ${
                    transactionType === "add"
                      ? "text-white"
                      : "text-neutral-500"
                  }`}
                >
                  +
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setTransactionType("subtract")}
                className={`w-1/2 h-full flex justify-center items-center ${
                  transactionType === "subtract" ? "bg-black rounded-full" : ""
                }`}
              >
                <Text
                  className={`text-xl ${
                    transactionType === "subtract"
                      ? "text-white"
                      : "text-neutral-500"
                  }`}
                >
                  -
                </Text>
              </TouchableOpacity>
            </View>

            {/* Account Selector */}
            <Text className="text-lg font-semibold text-black mb-2">
              Account
            </Text>
            <TouchableOpacity
              className="bg-neutral-100 rounded-full px-5 py-4 mb-4 flex-row justify-between items-center"
              onPress={() => setShowAccountPicker(!showAccountPicker)}
            >
              <Text className="text-black">{selectedAccountName}</Text>
              <ChevronDown color="#000" size={20} />
            </TouchableOpacity>

            {/* Account Picker Dropdown */}
            {showAccountPicker && (
              <View className="bg-white border border-neutral-200 rounded-2xl mb-4 overflow-hidden">
                {savings.map((account) => (
                  <TouchableOpacity
                    key={account.id}
                    className="px-5 py-4 border-b border-neutral-100"
                    onPress={() => {
                      setSelectedAccount(account.id);
                      setShowAccountPicker(false);
                    }}
                  >
                    <Text className="text-black font-medium">
                      {account.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Name Field */}
            <Text className="text-lg font-semibold text-black mb-2">Name</Text>
            <View className="bg-neutral-100 rounded-full px-5 py-4 mb-4">
              <TextInput
                className="text-black"
                placeholder="e.g. DCIP"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Amount Field */}
            <Text className="text-lg font-semibold text-black mb-2">
              Amount
            </Text>
            <View className="bg-neutral-100 rounded-full px-5 py-4 mb-8">
              <TextInput
                className="text-black"
                placeholder="e.g. € 100.00"
                keyboardType="numbers-and-punctuation"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              className="bg-black rounded-full py-4"
              onPress={handleSave}
            >
              <Text className="text-center text-white font-semibold text-lg">
                Add Entry
              </Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}
