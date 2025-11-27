"use client";
import React, {useState, useEffect, useRef} from "react";
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
import {SafeAreaView} from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PhantomChart } from "../PhantomChart";

type Transaction = {
    id: number;
    description: string;
    amount: number;
    date: string;
    type: "add" | "subtract";
};

type Contribution = {
    id: string;
    amount_minor?: number;
    contributed_minor?: number;
    created_at: string;
    description?: string;
    note?: string;
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
    savingObject?: {
        contributions: Contribution[];
        created_at: string;
    };
};

// Timeframe keys used by PhantomChart
type TimeframeKey = "1D" | "1W" | "1M" | "1Y" | "ALL";

const parseBackendDate = (value: string): Date => {
    if (!value) return new Date();
    console.log(value)
    return new Date(value);
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
                                               savingObject,
                                           }: Props) {
    const [isModalVisible, setIsModalVisible] = useState(isVisible);
    const SCREEN_HEIGHT = Dimensions.get("window").height;
    const sheetPosition = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

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

    // Build data for PhantomChart: cumulative amounts within different timeframes
    const dataByTimeframe = React.useMemo(() => {
        const result: Record<TimeframeKey, { timestamp: number; value: number }[]> = {
            "1D": [],
            "1W": [],
            "1M": [],
            "1Y": [],
            "ALL": [],
        };

        if (!savingObject?.contributions || savingObject.contributions.length === 0) {
            return result;
        }

        const sorted = [...savingObject.contributions].sort(
            (a, b) => parseBackendDate(a.created_at).getTime() - parseBackendDate(b.created_at).getTime()
        );

        const now = Date.now();
        const ranges: Record<TimeframeKey, number> = {
            "1D": 24 * 60 * 60 * 1000,
            "1W": 7 * 24 * 60 * 60 * 1000,
            "1M": 30 * 24 * 60 * 60 * 1000,
            "1Y": 365 * 24 * 60 * 60 * 1000,
            "ALL": now - parseBackendDate(savingObject.created_at).getTime(),
        };

        (Object.keys(ranges) as TimeframeKey[]).forEach((key) => {
            const windowStart = key === "ALL" ? parseBackendDate(savingObject.created_at).getTime() : now - ranges[key];
            let cumulative = 0;
            const series: { timestamp: number; value: number }[] = [];

            series.push({ timestamp: windowStart, value: 0 });

            sorted.forEach((c) => {
                const ts = parseBackendDate(c.created_at).getTime();
                if (ts >= windowStart) {
                    const amount = c.amount_minor ?? c.contributed_minor ?? 0;
                    cumulative += amount / 100; // convert from minor to major for display alignment with PhantomChart
                    series.push({ timestamp: ts, value: cumulative });
                }
            });

            result[key] = series.length > 1 ? series : [];
        });

        return result;
    }, [savingObject?.contributions, savingObject?.created_at]);
    const progress = goalAmount > 0 ? (currentAmount / goalAmount) * 100 : 0;

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={handleClose}
        >
            <GestureHandlerRootView style={{flex: 1, justifyContent: "flex-end"}}>
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
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        minHeight: SCREEN_HEIGHT,
                    }}
                >
                    <SafeAreaView style={{flex: 1}}>
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
                                <View className={"bg-gray-400 w-[50px] h-[5px] rounded-full"}/>
                            </View>
                        </View>

                        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                            {/* Header */}
                            <View className="mb-6">
                                <Text className="text-2xl font-bold">{savingName}</Text>
                            </View>

                            {/* Chart Section */}
                            {/* Replaced custom SVG chart with reusable PhantomChart */}
                            <View className="mb-6">
                                <View className="mb-4">
                                    <Text className="text-3xl font-bold">
                                        {currency}
                                        {(currentAmount / 100).toFixed(2)}
                                    </Text>
                                    {goalAmount > 0 && (
                                        <Text className="text-neutral-500 mt-1">
                                            of {currency}
                                            {(goalAmount / 100).toFixed(2)} ({progress.toFixed(0)}%)
                                        </Text>
                                    )}
                                </View>
                                {/* Chart */}
                                <View className="rounded-2xl p-2" style={{minHeight: 180}}>
                                    <PhantomChart
                                        dataByTimeframe={dataByTimeframe}
                                        initialTimeframe={"1W"}
                                        height={180}
                                    />
                                </View>
                            </View>

                            {/* Description Section */}
                            <View className="mb-6">
                                <Text className="text-xl font-bold mb-3">Description</Text>
                                <TextInput
                                    className="text-neutral-600 text-base leading-6"
                                    placeholder="Add a description..."
                                    multiline
                                >
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                                    do eiusmod tempor incididunt ut labore et dolore magna
                                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                </TextInput>
                            </View>

                            {/* Transactions Section */}
                            <View className="mb-20">
                                <Text className="text-xl font-bold mb-3">Transactions</Text>
                                {!savingObject?.contributions ||
                                savingObject.contributions.length === 0 ? (
                                    <Text className="text-neutral-500 text-center py-8">
                                        No transactions yet
                                    </Text>
                                ) : (
                                    [...savingObject.contributions]
                                        .sort(
                                            (a, b) =>
                                                parseBackendDate(b.created_at).getTime() -
                                                parseBackendDate(a.created_at).getTime()
                                        )
                                        .map((contribution) => {
                                            const amount =
                                                contribution.amount_minor ??
                                                contribution.contributed_minor ??
                                                0;
                                            const date = parseBackendDate(
                                                contribution.created_at
                                            );
                                            const isValidDate = !isNaN(date.getTime());

                                            return (
                                                <View
                                                    key={contribution.id}
                                                    className="bg-white rounded-2xl p-4 mb-1 flex-row justify-between items-center"
                                                >
                                                    <View>
                                                        <Text className="text-base font-semibold">
                                                            {contribution.description ||
                                                                contribution.note ||
                                                                "Contribution"}
                                                        </Text>
                                                        <Text className="text-neutral-500 text-sm">
                                                            {date.toLocaleDateString(
                                                                "de-DE"
                                                            )
                                                            }
                                                        </Text>
                                                    </View>
                                                    <Text className="text-lg font-bold text-green-600">
                                                        +{currency}
                                                        {(amount / 100).toFixed(2)}
                                                    </Text>
                                                </View>
                                            );
                                        })
                                )}
                            </View>
                        </ScrollView>
                    </SafeAreaView>
                </Animated.View>
            </GestureHandlerRootView>
        </Modal>
    );
}
