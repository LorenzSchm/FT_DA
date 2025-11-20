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

type Props = {
    isVisible: boolean;
    onClose: () => void;
};

export default function AddAccountModal({isVisible, onClose}: Props) {
    const [isModalVisible, setIsModalVisible] = useState(isVisible);
    const [state, setState] = useState("manual");
    const SCREEN_HEIGHT = Dimensions.get("window").height;
    const sheetPosition = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const [name, setName] = useState("");
    const [provider, setProvider] = useState("");
    const [initialAmount, setInitialAmount] = useState("");

    const {user, session} = useAuthStore()

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

    const handleAddAccount = async () => {
        const response = await addAccount(
            session?.access_token,
            session?.refresh_token,
            user?.id,
            name,
            provider,
            "EUR",
            state
        )

        if (response.status === 201) {
            handleClose();
            Toast.show({
                type: "success",
                text1: "Account added successfully",
                visibilityTime: 3000,
            });
        } else {
            Toast.show({
                type: "error",
                text1: "Failed to add account",
                visibilityTime: 3000,
            });
        }
    }

    const setManual = () => {
        setState("manual");
    };

    const setConnect = () => {
        setState("connect");
    };

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
                                    className={`text-xl ${state === "manual" ? "text-white" : "text-neutral-500"}`}
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
                                    className={`text-xl ${state === "connect" ? "text-white" : "text-neutral-500"}`}
                                >
                                    Connect
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Text className="font-semibold text-black mb-2 text-[20px]">Name</Text>
                        <View className="bg-neutral-100 rounded-full px-5 py-4 mb-4 h-fit">
                            <TextInput className="text-black text-[20px]" placeholder="e.g. Savings" value={name}
                                       onChangeText={setName}/>
                        </View>
                        {state === "manual" ? (
                            <>
                                <Text className="font-semibold text-black mb-2 text-[20px]">
                                    Provider
                                </Text>
                                <View
                                    className="bg-neutral-100 rounded-full px-5 py-4 mb-4 flex-row justify-between items-center h-fit">
                                    <Text className="text-[#9FA1A4] font-bold text-[20px]">FT</Text>
                                    <ChevronDown className="text-[#9FA1A4]"/>
                                </View>
                                <Text className="text-[20px] font-semibold text-black mb-2">
                                    Initial Amount
                                </Text>
                                <View className="bg-neutral-100 rounded-full px-5 py-4 mb-8 h-fit">
                                    <TextInput
                                        className="text-black text-[20px]"
                                        placeholder="e.g. € 0.00"
                                        keyboardType="numbers-and-punctuation"
                                        value={initialAmount}
                                        onChangeText={setInitialAmount}
                                    />
                                </View>
                                <TouchableOpacity
                                    className="bg-black rounded-full py-4"
                                    onPress={handleAddAccount}
                                >
                                    <Text className="text-center text-white font-semibold text-lg">
                                        Add Account
                                    </Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <View>
                                <Text className="text-lg font-semibold text-black mb-2">
                                    Connect your account
                                </Text>
                                <View className="bg-neutral-100 rounded-2xl px-5 py-4 mb-8">
                                    <TextInput
                                        className="text-black"
                                        placeholder="Search for provider..."
                                    />
                                </View>
                                <TouchableOpacity
                                    className="bg-black rounded-full py-4"
                                    onPress={handleClose}
                                >
                                    <Text className="text-center text-white font-semibold text-lg">
                                        Add Connection
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
