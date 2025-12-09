"use client";
import React, {useEffect, useRef, useState} from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Animated,
    Dimensions,
    PanResponder,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import axios from "axios";
import {useAuthStore} from "@/utils/authStore";

type Props = {
    isVisible: boolean;
    onClose: () => void;
    selectedStock?: any;
    onAdded?: () => void | Promise<void>;
};

type FormErrors = {
    quantity?: string;
    tradeDate?: string;
};

export default function AddInvestmentModal({
                                               isVisible,
                                               onClose,
                                               selectedStock,
                                               onAdded,
                                           }: Props) {
    const [isModalVisible, setIsModalVisible] = useState(isVisible);
    const SCREEN_HEIGHT = Dimensions.get("window").height;
    const sheetPosition = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    const [symbol, setSymbol] = useState("");
    const [quantity, setQuantity] = useState<string>("");
    const [tradeDate, setTradeDate] = useState<string>(new Date().toISOString().slice(0, 10));
    const [price, setPrice] = useState<number | null>(null);
    const [loadingPrice, setLoadingPrice] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";
    const {session} = useAuthStore();

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

            const sym = (selectedStock?.symbol || selectedStock?.ticker || "").toUpperCase();
            setSymbol(sym);
            if (sym) {
                fetchPrice(sym);
            } else {
                setPrice(null);
            }
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

    const resetForm = () => {
        setQuantity("");
        setTradeDate(new Date().toISOString().slice(0, 10));
        setErrors({});
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

    const fetchPrice = async (sym: string) => {
        try {
            setLoadingPrice(true);
            const res = await axios.get(`${API_BASE}/stock/${sym}/price`);
            const p = Number(res.data?.price);
            setPrice(Number.isFinite(p) ? p : 0);
        } catch {
            setPrice(0);
        } finally {
            setLoadingPrice(false);
        }
    };

    const validate = () => {
        const newErrors: FormErrors = {};
        const q = Number(String(quantity).replace(/,/g, "."));
        if (!quantity || Number.isNaN(q) || q <= 0) {
            newErrors.quantity = "Enter a valid quantity";
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(tradeDate)) {
            newErrors.tradeDate = "Use YYYY-MM-DD";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAdd = async () => {
        if (submitting) return;
        if (!session?.access_token) {
            Toast.show({type: "error", text1: "Please sign in"});
            return;
        }
        if (!validate()) {
            Toast.show({type: "error", text1: "Fix form errors"});
            return;
        }
        try {
            setSubmitting(true);
            const q = Number(String(quantity).replace(/,/g, "."));
            const payload = {
                ticker: symbol,
                type: "buy",
                quantity: q,
                price: price ?? 0,
                fee: 0,
                trade_date: tradeDate,
            };
            await axios.post(`${API_BASE}/investments/`, payload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                    "x-refresh-token": session.refresh_token ?? "",
                },
            });
            await handleClose();
            Toast.show({type: "success", text1: "Investment added"});
            if (onAdded) await onAdded();
        } catch (err: any) {
            Toast.show({
                type: "error",
                text1: "Failed to add investment",
                text2: err?.response?.data?.detail || err?.message,
            });
        } finally {
            setSubmitting(false);
        }
    };

    const totalCost = (() => {
        const q = Number(String(quantity).replace(/,/g, "."));
        if (!price || Number.isNaN(q)) return 0;
        return (price || 0) * (q || 0);
    })();

    const isButtonDisabled = submitting || loadingPrice || !quantity.trim();

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={handleClose}
        >
            <View style={{flex: 1, justifyContent: "flex-end"}}>
                <TouchableOpacity
                    style={{flex: 1, backgroundColor: "rgba(0,0,0,0.3)"}}
                    activeOpacity={1}
                    onPress={handleClose}
                />
                <Animated.View
                    style={{
                        transform: [{translateY: sheetPosition}],
                        backgroundColor: "white",
                        padding: 24,
                        minHeight: SCREEN_HEIGHT,
                    }}
                >
                    <SafeAreaView style={{flex: 1}}>
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
                                <View className={"bg-gray-400 w-[50px] h-[5px] rounded-full"}/>
                            </View>
                        </View>

                        <View style={{ flex: 1, justifyContent: 'space-between' }}>
                            <View className="gap-5">
                                <Text className="text-3xl font-extrabold text-black mb-6">
                                    Investment
                                </Text>
                                <View>
                                    <Text className="font-bold text-black mb-2 text-[20px]">
                                        Security
                                    </Text>
                                    <View className="bg-neutral-100 rounded-full px-5 py-4 mb-4 h-fit">
                                        <TextInput
                                            className="text-black text-[20px]"
                                            value={symbol}
                                            onChangeText={setSymbol}
                                            placeholder="e.g. AAPL"
                                            autoCapitalize="characters"
                                        />
                                    </View>
                                </View>

                                <View>
                                    <Text className="font-bold text-black mb-2 text-[20px]">
                                        Quantity
                                    </Text>
                                    <View className="bg-neutral-100 rounded-full px-5 py-4  h-fit">
                                        <TextInput
                                            className="text-black text-[20px]"
                                            value={quantity}
                                            onChangeText={(text) => {
                                                setQuantity(text);
                                                if (errors.quantity) {
                                                    setErrors((prev) => ({...prev, quantity: undefined}));
                                                }
                                            }}
                                            keyboardType="decimal-pad"
                                            placeholder="e.g. 10"
                                        />
                                    </View>
                                    {errors.quantity && (
                                        <Text className="text-red-500 mb-3 text-sm">{errors.quantity}</Text>
                                    )}
                                </View>
                                {/* Transaction date */}
                                <View>
                                    <Text className="font-bold text-black mb-2 text-[20px]">
                                        Transaction Date
                                    </Text>
                                    <View className="bg-neutral-100 rounded-full px-5 py-4 h-fit">
                                        <TextInput
                                            className="text-black text-[20px]"
                                            value={tradeDate}
                                            onChangeText={(text) => {
                                                setTradeDate(text);
                                                if (errors.tradeDate) {
                                                    setErrors((prev) => ({...prev, tradeDate: undefined}));
                                                }
                                            }}
                                            placeholder="YYYY-MM-DD"
                                        />
                                    </View>
                                    {errors.tradeDate && (
                                        <Text className="text-red-500 mb-3 text-sm">{errors.tradeDate}</Text>
                                    )}
                                </View>
                            </View>

                            <View className="mb-16">
                                <View className="flex justify-between flex-row mb-4">
                                    <Text className="font-bold text-black text-[20px]">
                                        Amount
                                    </Text>
                                    <Text className="text-black font-bold text-[20px]">
                                        {loadingPrice ? "Fetching price…" : `${totalCost.toFixed(2)} USD`}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    className={`bg-black rounded-full py-4 ${
                                        isButtonDisabled ? "opacity-60" : ""
                                    }`}
                                    onPress={handleAdd}
                                    disabled={isButtonDisabled}
                                >
                                    <Text className="text-center text-white font-bold text-lg">
                                        {submitting ? "Adding..." : "Add Investment"}
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