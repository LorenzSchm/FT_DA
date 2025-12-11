"use client";
import React, {useState, useEffect, useRef} from "react";
import {
    Modal,
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Animated,
    Dimensions,
    Platform,
    PanResponder,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {ChevronDown} from "lucide-react-native";
import {addAccount} from "@/utils/db/account/account";
import {useAuthStore} from "@/utils/authStore";
import Toast from "react-native-toast-message";
import {TrueLayerPaymentsSDKWrapper, ResultType, Environment} from "rn-truelayer-payments-sdk";
import {generateToken} from "@/utils/db/connect_accounts/connectAccounts";
import * as WebBrowser from 'expo-web-browser';

type Props = {
    isVisible: boolean;
    onClose: () => void;
    onAccountAdded?: () => Promise<void> | void;
};

type FormState = "manual" | "connect";

type FormErrors = {
    name?: string;
    initialAmount?: string;
};

export default function AddAccountModal({
                                            isVisible,
                                            onClose,
                                            onAccountAdded,
                                        }: Props) {
    const [isModalVisible, setIsModalVisible] = useState(isVisible);
    const [state, setState] = useState<FormState>("manual");
    const SCREEN_HEIGHT = Dimensions.get("window").height;
    const sheetPosition = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const [name, setName] = useState("");
    const [provider] = useState("FT");
    const [initialAmount, setInitialAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const {user, session} = useAuthStore();

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
            }).start(() => {
                setIsModalVisible(false);
            });
        }
    }, [isVisible]);

    const resetForm = () => {
        setName("");
        setInitialAmount("");
        setState("manual");
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

    const validateForm = () => {
        const newErrors: FormErrors = {};

        if (!name.trim()) {
            newErrors.name = "Account name is required";
        }

        if (state === "manual") {
            const value = initialAmount.trim();
            if (!value) {
                newErrors.initialAmount = "Initial amount is required";
            } else {
                const normalized = value.replace(/[^0-9,.\-]+/g, "").replace(",", ".");
                const numeric = Number(normalized);

                if (Number.isNaN(numeric)) {
                    newErrors.initialAmount = "Initial amount must be a number";
                } else if (numeric < 0) {
                    newErrors.initialAmount = "Initial amount cannot be negative";
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddAccount = async () => {
        if (isSubmitting) return;

        if (!session?.access_token || !user?.id) {
            Toast.show({
                type: "error",
                text1: "Unable to add account",
                text2: "Missing session information",
                visibilityTime: 3000,
            });
            return;
        }

        const isValid = validateForm();
        if (!isValid) {
            Toast.show({
                type: "error",
                text1: "Please fix the errors in the form",
                visibilityTime: 3000,
            });
            return;
        }

        setIsSubmitting(true);

        try {
            await addAccount(
                session.access_token,
                session.refresh_token ?? "",
                user.id,
                name.trim(),
                provider,
                "EUR",
                state,
                initialAmount,
            );
            await handleClose();
            Toast.show({
                type: "success",
                text1: "Account added successfully",
                visibilityTime: 3000,
            });

            if (onAccountAdded) {
                await onAccountAdded();
            }
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Failed to add account",
                text2: error instanceof Error ? error.message : undefined,
                visibilityTime: 3000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConnect = async () => {
        try {
            if (isSubmitting || !name.trim()) return;

            if (!session?.access_token || !user?.id) {
                Toast.show({type: "error", text1: "Missing session", visibilityTime: 3000});
                return;
            }

            setIsSubmitting(true);

            const result = await WebBrowser.openAuthSessionAsync("https://auth.truelayer-sandbox.com/?response_type=code&client_id=sandbox-financetracker-ff71fc&scope=accounts%20balance%20cards%20direct_debits%20info%20offline_access%20standing_orders%20transactions&redirect_uri=exp%3A%2F%2F--&providers=uk-cs-mock%20uk-ob-all%20uk-oauth-all");


            if (result.type === 'success' && result.url) {
                const url = new URL(result.url);
                const code = url.searchParams.get('code');
                console.log(code)

                if (!code) {
                    throw new Error('No authorization code received');
                }

                const res = await generateToken(session.access_token, session.refresh_token, code, name)

                await handleClose();
                Toast.show({type: "success", text1: "Account connected successfully!", visibilityTime: 3000});

                if (onAccountAdded) await onAccountAdded();
            } else if (result.type === 'cancel' || result.type === 'dismiss') {
                Toast.show({type: "info", text1: "Connection cancelled", visibilityTime: 2000});
            } else {
                throw new Error(`Auth failed: ${result.type}`);
            }
        } catch (error) {
            console.error('Connect error:', error);
            Toast.show({
                type: "error",
                text1: "Failed to connect account",
                text2: error instanceof Error ? error.message : undefined,
                visibilityTime: 4000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const setManual = () => {
        setState("manual");
        setErrors((prev) => ({...prev, initialAmount: undefined}));
    };

    const setConnect = () => {
        setState("connect");
        setErrors((prev) => ({...prev, initialAmount: undefined}));
    };

    const isButtonDisabled =
        isSubmitting ||
        !name.trim() ||
        (state === "manual" && !initialAmount.trim());

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
                        <Text className="text-3xl font-extrabold text-black mb-6">
                            Account
                        </Text>
                        <Text className="text-lg font-semibold text-black mb-3">Type</Text>
                        <View
                            className="flex-row justify-around items-center mb-6 bg-[#F1F1F2] w-full h-[40px] rounded-full">
                            <TouchableOpacity
                                onPress={setManual}
                                className={`w-1/2 h-full flex justify-center items-center ${
                                    state === "manual" ? "bg-black rounded-full" : ""
                                }`}
                            >
                                <Text
                                    className={`text-xl ${
                                        state === "manual" ? "text-white" : "text-neutral-500"
                                    }`}
                                >
                                    Manual
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={setConnect}
                                className={`w-1/2 h-full flex justify-center items-center ${
                                    state === "connect" ? "bg-black rounded-full" : ""
                                }`}
                            >
                                <Text
                                    className={`text-xl ${
                                        state === "connect" ? "text-white" : "text-neutral-500"
                                    }`}
                                >
                                    Connect
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* NAME */}
                        <Text className="font-semibold text-black mb-2 text-[20px]">
                            Name
                        </Text>
                        <View className="bg-neutral-100 rounded-full px-5 py-4 mb-1 h-fit">
                            <TextInput
                                className="text-black text-[20px]"
                                placeholder="e.g. Savings"
                                value={name}
                                onChangeText={(text) => {
                                    setName(text);
                                    if (errors.name) {
                                        setErrors((prev) => ({...prev, name: undefined}));
                                    }
                                }}
                            />
                        </View>
                        {errors.name && (
                            <Text className="text-red-500 mb-3 text-sm">{errors.name}</Text>
                        )}

                        {state === "manual" ? (
                            <>
                                {/* PROVIDER */}
                                <Text className="font-semibold text-black mb-2 text-[20px]">
                                    Provider
                                </Text>
                                <View
                                    className="bg-neutral-100 rounded-full px-5 py-4 mb-4 flex-row justify-between items-center h-fit">
                                    <Text className="text-[#9FA1A4] font-bold text-[20px]">
                                        FT
                                    </Text>
                                    <ChevronDown className="text-[#9FA1A4]"/>
                                </View>

                                {/* INITIAL AMOUNT */}
                                <Text className="text-[20px] font-semibold text-black mb-2">
                                    Initial Amount
                                </Text>
                                <View className="bg-neutral-100 rounded-full px-5 py-4 mb-1 h-fit">
                                    <TextInput
                                        className="text-black text-[20px]"
                                        placeholder="e.g. € 0.00"
                                        keyboardType="numbers-and-punctuation"
                                        value={initialAmount}
                                        onChangeText={(text) => {
                                            setInitialAmount(text);
                                            if (errors.initialAmount) {
                                                setErrors((prev) => ({
                                                    ...prev,
                                                    initialAmount: undefined,
                                                }));
                                            }
                                        }}
                                    />
                                </View>
                                {errors.initialAmount && (
                                    <Text className="text-red-500 mb-3 text-sm">
                                        {errors.initialAmount}
                                    </Text>
                                )}

                                <TouchableOpacity
                                    className={`bg-black rounded-full py-4 mt-2 ${
                                        isButtonDisabled ? "opacity-60" : ""
                                    }`}
                                    onPress={handleAddAccount}
                                    disabled={isButtonDisabled}
                                >
                                    <Text className="text-center text-white font-semibold text-lg">
                                        {isSubmitting ? "Adding..." : "Add Account"}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <View>
                                <TouchableOpacity
                                    className={`bg-black rounded-full py-4 mt-2 ${
                                        isButtonDisabled ? "opacity-60" : ""
                                    }`}
                                    onPress={handleConnect}
                                    disabled={isButtonDisabled}
                                >
                                    <Text className="text-center text-white font-semibold text-lg">
                                        {isSubmitting ? "Adding..." : "Add Connection"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </SafeAreaView>
                </Animated.View>
            </View>
        </Modal>
    );
}
