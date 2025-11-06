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
    Dimensions, Platform,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {ChevronDown} from "lucide-react-native";

type Props = {
    isVisible: boolean;
    onClose: () => void;
};

export default function AddAccountModal({isVisible, onClose}: Props) {
    const [isModalVisible, setIsModalVisible] = useState(isVisible);
    const [state, setState] = useState("manual");

    const SCREEN_HEIGHT = Dimensions.get("window").height;
    const MODAL_HEIGHT = SCREEN_HEIGHT * (2 / 3);
    const modalAnim = useRef(new Animated.Value(0)).current; // start at 0 height

    const iosShadow = {
        shadowColor: "#000",
        shadowOffset: {width: 1, height: 1},
        shadowOpacity: 0.50,
        shadowRadius: 5,
    };
    const androidShadow = {
        elevation: 6,
        marginRight: 10,
        marginBottom: 10,
    };

    const shadowStyle = Platform.select({
        ios: iosShadow,
        android: androidShadow,
        default: {},
    });

    useEffect(() => {
        if (isVisible) {
            setIsModalVisible(true);
            Animated.timing(modalAnim, {
                toValue: MODAL_HEIGHT,
                duration: 200,
                useNativeDriver: false,
            }).start();
        } else {
            Animated.timing(modalAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }).start(() => {
                setIsModalVisible(false);
            });
        }
    }, [isVisible, MODAL_HEIGHT]);

    const handleClose = () => {
        Animated.timing(modalAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start(() => {
            setIsModalVisible(false);
            onClose();
        });
    };

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
            <View style={{flex: 1}}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={handleClose}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.35)",
                    }}
                />

                <Animated.View
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: modalAnim,
                        overflow: 'hidden',
                        backgroundColor: "white",
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        padding: 24,
                    }}
                >
                    <SafeAreaView style={{flex: 1}}>
                        <ScrollView contentContainerStyle={{paddingBottom: 32}}>
                            <Text className="text-3xl font-extrabold text-black mb-6">
                                Account
                            </Text>

                            {/* Type toggle */}
                            <Text className="text-lg font-semibold text-black mb-3">
                                Type
                            </Text>
                            <View
                                className="flex-row justify-around items-center mb-6  bg-[#F1F1F2] w-full h-[40px] rounded-full">
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

                            <Text className="text-lg font-semibold text-black mb-2">
                                Name
                            </Text>
                            <View className="bg-neutral-100 rounded-2xl px-5 py-4 mb-4">
                                <TextInput className="text-black" placeholder="e.g. Savings"/>
                            </View>

                            {state === "manual" ? (
                                <>
                                    <Text className="text-lg font-semibold text-black mb-2">
                                        Provider
                                    </Text>
                                    <View
                                        className="bg-neutral-100 rounded-2xl px-5 py-4 mb-4 flex-row justify-between items-center">
                                        <Text className="text-neutral-900">FT</Text>
                                        <ChevronDown className="text-neutral-500"/>
                                    </View>

                                    <Text className="text-lg font-semibold text-black mb-2">
                                        Initial Amount
                                    </Text>
                                    <View className="bg-neutral-100 rounded-2xl px-5 py-4 mb-8">
                                        <TextInput
                                            className="text-black"
                                            placeholder="e.g. € 0.00"
                                            keyboardType="numbers-and-punctuation"
                                        />
                                    </View>

                                    <TouchableOpacity className="bg-black rounded-full py-4" onPress={handleClose}>
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

                                    <TouchableOpacity className="bg-black  rounded-full py-4" onPress={handleClose}>
                                        <Text className="text-center text-white font-semibold text-lg">
                                            Add Connection
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </ScrollView>
                    </SafeAreaView>
                </Animated.View>
            </View>
        </Modal>
    );
}