import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    runOnJS,
    withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

type Props = {
    minValue: number;
    maxValue: number;
    initialMin?: number;
    initialMax?: number;
    onValueChange: (min: number, max: number) => void;
};

const THUMB_SIZE = 14;

export default function AmountSlider({
    minValue,
    maxValue,
    initialMin,
    initialMax,
    onValueChange,
}: Props) {
    const [width, setWidth] = useState(0);
    const [currentMin, setCurrentMin] = useState(initialMin ?? minValue);
    const [currentMax, setCurrentMax] = useState(initialMax ?? maxValue);
    const widthSV = useSharedValue(0);
    const minX = useSharedValue(0);
    const maxX = useSharedValue(0);
    const minOffset = useSharedValue(0);
    const maxOffset = useSharedValue(0);
    const minScale = useSharedValue(1);
    const maxScale = useSharedValue(1);

    // Helper to convert value to position
    const valueToPos = (val: number, maxW: number) => {
        return ((val - minValue) / (maxValue - minValue)) * maxW;
    };

    // Helper to convert position to value
    const posToValue = (pos: number, maxW: number) => {
        return Math.round((pos / maxW) * (maxValue - minValue) + minValue);
    };

    useEffect(() => {
        if (width > 0) {
            minX.value = valueToPos(initialMin ?? minValue, width);
            maxX.value = valueToPos(initialMax ?? maxValue, width);
        }
    }, [width, minValue, maxValue, initialMin, initialMax]);

    const updateValues = () => {
        const minVal = posToValue(minX.value, width);
        const maxVal = posToValue(maxX.value, width);
        setCurrentMin(minVal);
        setCurrentMax(maxVal);
        onValueChange(minVal, maxVal);
    };

    const minGesture = Gesture.Pan()
        .onBegin(() => {
            "worklet";
            minOffset.value = minX.value;
            minScale.value = withSpring(1.2);
        })
        .onUpdate((event) => {
            "worklet";
            let newPos = minOffset.value + event.translationX;
            newPos = Math.max(0, Math.min(newPos, maxX.value - THUMB_SIZE));
            minX.value = newPos;
            runOnJS(updateValues)();
        })
        .onFinalize(() => {
            "worklet";
            minScale.value = withSpring(1);
        });

    const maxGesture = Gesture.Pan()
        .onBegin(() => {
            "worklet";
            maxOffset.value = maxX.value;
            maxScale.value = withSpring(1.2);
        })
        .onUpdate((event) => {
            "worklet";
            let newPos = maxOffset.value + event.translationX;
            newPos = Math.max(minX.value + THUMB_SIZE, Math.min(newPos, widthSV.value));
            maxX.value = newPos;
            runOnJS(updateValues)();
        })
        .onFinalize(() => {
            "worklet";
            maxScale.value = withSpring(1);
        });

    const minThumbStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: minX.value },
            { scale: minScale.value },
        ],
    }));

    const maxThumbStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: maxX.value },
            { scale: maxScale.value },
        ],
    }));

    const trackStyle = useAnimatedStyle(() => ({
        left: minX.value + THUMB_SIZE / 2,
        width: maxX.value - minX.value,
    }));

    const minLabelStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: minX.value }],
    }));

    const maxLabelStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: maxX.value }],
    }));

    return (
        <View>
            <View>
                <Text className="text-xl font-extrabold text-black">Amount</Text>
            </View>
            <View
                className="h-12 justify-center"
                onLayout={(e) => {
                    const newWidth = e.nativeEvent.layout.width - THUMB_SIZE;
                    setWidth(newWidth);
                    widthSV.value = newWidth;
                }}
            >
                <View className="h-1 bg-gray-200 rounded-full w-full absolute" />
                <Animated.View
                    className="h-1 bg-black rounded-full absolute"
                    style={trackStyle}
                />
                <GestureDetector gesture={minGesture}>
                    <Animated.View
                        className="absolute bg-black border-2 border-black rounded-full shadow-sm"
                        style={[
                            {
                                width: THUMB_SIZE,
                                height: THUMB_SIZE,
                            },
                            minThumbStyle,
                        ]}
                    >
                        <Text>Min</Text>
                    </Animated.View>
                </GestureDetector>
                <GestureDetector gesture={maxGesture}>
                    <Animated.View
                        className="absolute bg-black border-2 border-black rounded-full shadow-sm"
                        style={[
                            {
                                width: THUMB_SIZE,
                                height: THUMB_SIZE,
                            },
                            maxThumbStyle,
                        ]}
                    >
                        <Text>
                            Max
                        </Text>
                    </Animated.View>
                </GestureDetector>

                <Animated.View
                    style={[
                        minLabelStyle,
                        {
                            position: "absolute",
                            top: 30,
                            width: 60,
                            left: -30 + THUMB_SIZE / 2,
                            alignItems: "center",
                        },
                    ]}
                >
                    <Text className="font-bold text-xs">{currentMin} €</Text>
                </Animated.View>

                <Animated.View
                    style={[
                        maxLabelStyle,
                        {
                            position: "absolute",
                            top: 30,
                            width: 60,
                            left: -30 + THUMB_SIZE / 2,
                            alignItems: "center",
                        },
                    ]}
                >
                    <Text className="font-bold text-xs">{currentMax} €</Text>
                </Animated.View>
            </View>
        </View>
    );
}