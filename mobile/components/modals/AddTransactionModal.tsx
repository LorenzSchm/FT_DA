"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
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
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { addTransaction, getCategories } from "@/utils/db/finance/finance";
import { useAuthStore } from "@/utils/authStore";
import CustomPicker from "@/components/ui/CustomPicker";
import {
  type Category,
  suggestCategory,
} from "@/utils/categoryMatcher";

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
  const [isLoading, setIsLoading] = useState(false);

  // Category state
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [suggestedCategory, setSuggestedCategory] = useState<Category | null>(null);

  const [errors, setErrors] = useState<{
    account?: string;
    amount?: string;
    merchant?: string;
    description?: string;
  }>({});

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
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
        Math.abs(gestureState.dy) > 2,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) sheetPosition.setValue(gestureState.dy);
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

  // Load categories once
  useEffect(() => {
    if (!session?.access_token) return;
    getCategories(session.access_token, session.refresh_token)
      .then((data: any) => setCategories(data.rows || []))
      .catch(() => {});
  }, [session?.access_token]);

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

  // Smart suggestion: re-run whenever merchant, description, or type changes
  useEffect(() => {
    if (!categories.length) return;
    const isIncome = state === "income";
    if (!merchant.trim() && !description.trim()) {
      setSuggestedCategory(null);
      return;
    }
    const suggestion = suggestCategory(merchant, description, isIncome, categories);
    setSuggestedCategory(suggestion);
    // Only auto-apply suggestion if user hasn't manually selected a category
    if (!selectedCategory && suggestion) {
      // Don't auto-select; just show the suggestion chip
    }
  }, [merchant, description, state, categories]);

  // When transaction type changes, clear the selected category
  const handleTypeChange = (newType: string) => {
    setState(newType);
    setSelectedCategory(null);
    setSuggestedCategory(null);
  };

  const handleClose = () => {
    Animated.timing(sheetPosition, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
      setAmount("");
      setMerchant("");
      setDescription("");
      setState("expense");
      setSelectedCategory(null);
      setSuggestedCategory(null);
      setErrors({});
      onTransactionAdded().then(() => onClose());
    });
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!selectedAccount) newErrors.account = "Please select an account";

    const parsed = parseFloat(String(amount).replace(/,/g, "."));
    if (!amount.trim()) {
      newErrors.amount = "Amount is required";
    } else if (Number.isNaN(parsed) || parsed <= 0) {
      newErrors.amount = "Enter a valid positive amount";
    }

    if (!merchant.trim()) {
      newErrors.merchant =
        state === "income" ? "Please enter a sender" : "Please enter a recipient";
    }

    if (!description.trim()) newErrors.description = "Please enter a usage description";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTransaction = async () => {
    if (!validate()) return;

    if (!session?.access_token) {
      Alert.alert("Error", "Not authenticated");
      return;
    }

    try {
      setIsLoading(true);
      const amountMinor = Math.round(parseFloat(amount) * 100);

      const transactionData: Record<string, any> = {
        type: state,
        amount_minor: state === "expense" ? -amountMinor : amountMinor,
        currency: accounts.find((acc: any) => acc.id === selectedAccount)?.currency,
        description: description,
        merchant: merchant,
      };

      // Attach selected category (prefer manual over suggestion)
      const categoryToUse = selectedCategory ?? suggestedCategory;
      if (categoryToUse) {
        transactionData.category_id = categoryToUse.id;
      }

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

  // Build picker options — only show categories matching the current type
  const isIncome = state === "income";
  const filteredCategories = categories.filter((c) => c.is_income === isIncome);
  const categoryOptions = filteredCategories.map((c) => ({
    label: `${c.icon} ${c.name}`,
    value: c.id,
  }));

  const activeCategory = selectedCategory ?? suggestedCategory;

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
            minHeight: SCREEN_HEIGHT,
          }}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Drag handle */}
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

              <Text className="text-3xl font-extrabold text-black mb-6">
                Transaction
              </Text>

              {/* Type toggle */}
              <Text className="text-lg font-semibold text-black mb-3">Type</Text>
              <View className="flex-row justify-around items-center mb-6 bg-[#F1F1F2] w-full h-[40px] rounded-full">
                <TouchableOpacity
                  onPress={() => handleTypeChange("expense")}
                  className={`w-1/2 h-full flex justify-center items-center ${state === "expense" ? "bg-black rounded-full" : ""}`}
                >
                  <Text className={`text-xl ${state === "expense" ? "text-white" : "text-neutral-500"}`}>
                    Expense
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleTypeChange("income")}
                  className={`w-1/2 h-full flex justify-center items-center ${state === "income" ? "bg-black rounded-full" : ""}`}
                >
                  <Text className={`text-xl ${state === "income" ? "text-white" : "text-neutral-500"}`}>
                    Income
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Account selection */}
              <Text className="font-semibold text-black mb-2 text-[20px]">Account</Text>
              <CustomPicker
                placeholder="Select Account"
                value={selectedAccount}
                onValueChange={(val) => {
                  setSelectedAccount(val);
                  if (errors.account) setErrors((p) => ({ ...p, account: undefined }));
                }}
                options={accounts.map((acc) => ({
                  label: `${acc.name} (${acc.currency})`,
                  value: acc.id,
                }))}
                className="mb-1"
                variant="input"
              />
              {errors.account ? (
                <Text className="text-red-500 text-sm mb-3">{errors.account}</Text>
              ) : (
                <View className="mb-3" />
              )}

              {/* Amount */}
              <Text className="font-semibold text-black mb-2 text-[20px]">Amount</Text>
              <View className="bg-neutral-100 rounded-full px-5 py-4 h-fit">
                <TextInput
                  className="text-black text-[20px]"
                  placeholder="e.g. € 0.00"
                  keyboardType="numbers-and-punctuation"
                  value={amount}
                  onChangeText={(text) => {
                    setAmount(text);
                    if (errors.amount) setErrors((p) => ({ ...p, amount: undefined }));
                  }}
                />
              </View>
              {errors.amount ? (
                <Text className="text-red-500 text-sm mb-3 mt-1">{errors.amount}</Text>
              ) : (
                <View className="mb-3" />
              )}

              {/* Merchant / Sender */}
              <Text className="font-semibold text-black mb-2 text-[20px]">
                {state === "income" ? "Sender" : "Recipient"}
              </Text>
              <View className="bg-neutral-100 rounded-full px-5 py-4 h-fit">
                <TextInput
                  className="text-black text-[20px]"
                  placeholder={state === "income" ? "e.g. Employer" : "e.g. Grocery Store"}
                  value={merchant}
                  onChangeText={(text) => {
                    setMerchant(text);
                    if (errors.merchant) setErrors((p) => ({ ...p, merchant: undefined }));
                  }}
                />
              </View>
              {errors.merchant ? (
                <Text className="text-red-500 text-sm mb-3 mt-1">{errors.merchant}</Text>
              ) : (
                <View className="mb-3" />
              )}

              {/* Description */}
              <Text className="font-semibold text-black mb-2 text-[20px]">Usage</Text>
              <View className="bg-neutral-100 rounded-full px-5 py-4 h-fit">
                <TextInput
                  className="text-black text-[20px]"
                  placeholder="e.g. Groceries, Rent, Salary..."
                  value={description}
                  onChangeText={(text) => {
                    setDescription(text);
                    if (errors.description)
                      setErrors((p) => ({ ...p, description: undefined }));
                  }}
                  maxLength={30}
                />
              </View>
              {errors.description ? (
                <Text className="text-red-500 text-sm mb-3 mt-1">{errors.description}</Text>
              ) : (
                <View className="mb-3" />
              )}

              {/* Category */}
              <Text className="font-semibold text-black mb-2 text-[20px]">Category</Text>

              {/* Smart suggestion chip */}
              {suggestedCategory && !selectedCategory && (
                <View className="flex-row items-center mb-2 gap-2">
                  <Text className="text-neutral-400 text-sm">Suggested:</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedCategory(suggestedCategory)}
                    className="flex-row items-center bg-neutral-100 border border-black rounded-full px-3 py-1"
                  >
                    <Text className="text-black text-sm font-semibold">
                      {suggestedCategory.icon} {suggestedCategory.name}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Active category display + picker */}
              {activeCategory ? (
                <View className="flex-row items-center gap-3 mb-1">
                  <View className="flex-1 bg-black rounded-full px-5 py-4 flex-row items-center justify-between">
                    <Text className="text-white text-[18px] font-semibold">
                      {activeCategory.icon} {activeCategory.name}
                    </Text>
                    <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                      <Text className="text-neutral-400 text-xl">✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}

              <CustomPicker
                placeholder={activeCategory ? "Change category" : "Select a category"}
                value={selectedCategory?.id}
                onValueChange={(val) => {
                  const found = categories.find((c) => c.id === val) ?? null;
                  setSelectedCategory(found);
                }}
                options={categoryOptions}
                variant="input"
              />
              <View className="mb-6" />

              <TouchableOpacity
                className="bg-black rounded-full py-4"
                onPress={handleAddTransaction}
                disabled={isLoading}
              >
                <Text className="text-center text-white font-semibold text-lg">
                  {isLoading ? "Adding..." : "Add Transaction"}
                </Text>
              </TouchableOpacity>
              <View className="mb-8" />
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}
