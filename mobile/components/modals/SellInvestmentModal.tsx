"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import axios from "axios";
import { useAuthStore } from "@/utils/authStore";
import { getAccounts } from "@/utils/db/finance/finance";
import { invalidateCache } from "@/utils/db/cache";

type Props = {
  isVisible: boolean;
  onClose: () => void;
  selectedStock?: any;
  myPosition?: {
    shares: number;
    total: number;
    pl: number;
    returnPct: number;
    currency: string;
  } | null;
  onSold?: () => void | Promise<void>;
};

type FormErrors = {
  quantity?: string;
  account?: string;
};

export default function SellInvestmentModal({
  isVisible,
  onClose,
  selectedStock,
  myPosition,
  onSold,
}: Props) {
  const [isModalVisible, setIsModalVisible] = useState(isVisible);
  const SCREEN_HEIGHT = Dimensions.get("window").height;
  const sheetPosition = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const [quantity, setQuantity] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Account picker
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );

  const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";
  const { session } = useAuthStore();

  const ticker = (
    selectedStock?.symbol ||
    selectedStock?.ticker ||
    ""
  ).toUpperCase();

  const currentPrice =
    selectedStock?.current_price ?? selectedStock?.price ?? 0;

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

      fetchAccounts();
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

  const fetchAccounts = async () => {
    if (!session?.access_token) return;
    try {
      setLoadingAccounts(true);
      const data = await getAccounts(
        session.access_token,
        session.refresh_token,
      );
      const rows = data?.rows || [];
      setAccounts(rows);
      if (rows.length > 0 && !selectedAccountId) {
        setSelectedAccountId(rows[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const resetForm = () => {
    setQuantity("");
    setErrors({});
    setSelectedAccountId(null);
  };

  const handleClose = () => {
    return new Promise<void>((resolve) => {
      Animated.timing(sheetPosition, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsModalVisible(false);
        resetForm();
        onClose();
        resolve();
      });
    });
  };

  const maxShares = myPosition?.shares ?? 0;

  const validate = () => {
    const newErrors: FormErrors = {};
    const q = Number(String(quantity).replace(/,/g, "."));
    if (!quantity || Number.isNaN(q) || q <= 0) {
      newErrors.quantity = "Enter a valid quantity";
    } else if (q > maxShares + 1e-9) {
      newErrors.quantity = `You only own ${maxShares} shares`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSell = async () => {
    if (submitting) return;
    if (!session?.access_token) {
      Toast.show({ type: "error", text1: "Please sign in" });
      return;
    }
    if (!validate()) {
      Toast.show({ type: "error", text1: "Fix form errors" });
      return;
    }
    try {
      setSubmitting(true);
      const q = Number(String(quantity).replace(/,/g, "."));
      const payload: any = {
        ticker,
        quantity: q,
      };
      if (selectedAccountId) {
        payload.account_id = selectedAccountId;
      }
      const response = await axios.post(
        `${API_BASE}/investments/sell`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            "x-refresh-token": session.refresh_token ?? "",
          },
        },
      );

      // Invalidate caches so fresh data is loaded
      invalidateCache("/investments/");
      invalidateCache("/finance/");

      // Close sell modal immediately
      await handleClose();

      // Show appropriate toast
      if (response.data?.deposit_error) {
        Toast.show({
          type: "info",
          text1: "Shares sold",
          text2: "But deposit to account failed. Check your account.",
        });
      } else {
        Toast.show({ type: "success", text1: "Shares sold successfully" });
      }

      // Navigate back to InvestmentView & reload
      if (onSold) await onSold();
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail || err?.message || "Unknown error";
      Toast.show({
        type: "error",
        text1: "Failed to sell",
        text2: detail,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const sellQty = (() => {
    const q = Number(String(quantity).replace(/,/g, "."));
    return Number.isFinite(q) && q > 0 ? q : 0;
  })();

  const totalProceeds = sellQty * currentPrice;

  const isButtonDisabled = submitting || !quantity.trim();

  if (!isModalVisible) return null;

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

            <View style={{ flex: 1, justifyContent: "space-between" }}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="gap-5">
                  <Text className="text-3xl font-extrabold text-black mb-2">
                    Sell {ticker}
                  </Text>

                  {/* Position info */}
                  {myPosition && (
                    <View className="bg-neutral-50 rounded-2xl p-4 mb-2">
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-500 font-medium">
                          Your Shares
                        </Text>
                        <Text className="text-black font-bold">
                          {myPosition.shares}
                        </Text>
                      </View>
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-500 font-medium">
                          Current Price
                        </Text>
                        <Text className="text-black font-bold">
                          ${currentPrice.toFixed(2)}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-gray-500 font-medium">
                          Total Value
                        </Text>
                        <Text className="text-black font-bold">
                          ${myPosition.total.toFixed(2)} {myPosition.currency}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Quantity */}
                  <View>
                    <Text className="font-bold text-black mb-2 text-[20px]">
                      Quantity to Sell
                    </Text>
                    <View className="bg-neutral-100 rounded-full px-5 py-4 h-fit">
                      <TextInput
                        className="text-black text-[20px]"
                        value={quantity}
                        onChangeText={(text) => {
                          setQuantity(text);
                          if (errors.quantity) {
                            setErrors((prev) => ({
                              ...prev,
                              quantity: undefined,
                            }));
                          }
                        }}
                        keyboardType="decimal-pad"
                        placeholder={`Max ${maxShares}`}
                      />
                    </View>
                    {errors.quantity && (
                      <Text className="text-red-500 mb-1 text-sm mt-1">
                        {errors.quantity}
                      </Text>
                    )}
                    {/* Sell all shortcut */}
                    <TouchableOpacity
                      onPress={() => setQuantity(String(maxShares))}
                      className="mt-2"
                    >
                      <Text className="text-blue-600 font-semibold text-sm">
                        Sell all ({maxShares} shares)
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Deposit Account */}
                  <View>
                    <Text className="font-bold text-black mb-2 text-[20px]">
                      Deposit Proceeds To
                    </Text>
                    {loadingAccounts ? (
                      <View className="items-center py-4">
                        <ActivityIndicator size="small" color="#000" />
                      </View>
                    ) : accounts.length === 0 ? (
                      <View className="bg-neutral-100 rounded-2xl px-5 py-4">
                        <Text className="text-gray-400 text-base">
                          No accounts found. Proceeds won't be deposited.
                        </Text>
                      </View>
                    ) : (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 10 }}
                      >
                        {accounts.map((acc) => {
                          const isSelected = selectedAccountId === acc.id;
                          return (
                            <TouchableOpacity
                              key={acc.id}
                              onPress={() => setSelectedAccountId(acc.id)}
                              style={{
                                backgroundColor: isSelected
                                  ? "#000"
                                  : "#f5f5f5",
                                borderRadius: 16,
                                paddingHorizontal: 20,
                                paddingVertical: 14,
                                minWidth: 120,
                              }}
                            >
                              <Text
                                style={{
                                  color: isSelected ? "#fff" : "#111",
                                  fontWeight: "700",
                                  fontSize: 15,
                                }}
                                numberOfLines={1}
                              >
                                {acc.name}
                              </Text>
                              <Text
                                style={{
                                  color: isSelected
                                    ? "rgba(255,255,255,0.6)"
                                    : "#9ca3af",
                                  fontSize: 12,
                                  fontWeight: "500",
                                  marginTop: 2,
                                }}
                                numberOfLines={1}
                              >
                                {acc.institution || acc.kind || ""}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    )}
                    <Text className="text-gray-500 text-sm mt-2">
                      Select an account to receive the sale proceeds
                    </Text>
                  </View>
                </View>
              </ScrollView>

              {/* Bottom summary + button */}
              <View className="mb-16">
                <View className="flex justify-between flex-row mb-4">
                  <Text className="font-bold text-black text-[20px]">
                    Proceeds
                  </Text>
                  <Text className="text-black font-bold text-[20px]">
                    {totalProceeds > 0
                      ? `${totalProceeds.toFixed(2)} ${myPosition?.currency || "USD"}`
                      : "—"}
                  </Text>
                </View>
                <TouchableOpacity
                  className={`bg-red-600 rounded-full py-4 ${
                    isButtonDisabled ? "opacity-60" : ""
                  }`}
                  onPress={handleSell}
                  disabled={isButtonDisabled}
                >
                  <Text className="text-center text-white font-bold text-lg">
                    {submitting ? "Selling..." : "Sell Shares"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}
