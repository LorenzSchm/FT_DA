"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { PhantomChart } from "@/components/PhantomChart";

type Props = {
  isVisible: boolean;
  onClose: () => void;
  selectedStock: any;
};

export default function StockModal({
  isVisible,
  onClose,
  selectedStock,
}: Props) {
  const [isModalVisible, setIsModalVisible] = useState(isVisible);
  const [history, setHistory] = useState<any | null>(null);
  const [chartLoading, setChartLoading] = useState(false);

  const SCREEN_HEIGHT = Dimensions.get("window").height;
  const sheetPosition = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          sheetPosition.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
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

      if (selectedStock?.symbol || selectedStock?.ticker) {
        const sym = selectedStock.symbol ?? selectedStock.ticker;
        fetchHistory(sym);
      }
    } else {
      Animated.timing(sheetPosition, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsModalVisible(false);
        setHistory(null);
      });
    }
  }, [isVisible, selectedStock]);

  const fetchHistory = async (symbol: string) => {
    try {
      setChartLoading(true);

      const res = await axios.get(
        `http://localhost:8000/stock/${symbol}/history`,
      );

      setHistory({
        "1D": res.data["1D"] ?? [],
        "1W": res.data["1W"] ?? [],
        "1M": res.data["1M"] ?? [],
        "1Y": res.data["1Y"] ?? [],
        ALL: res.data["ALL"] ?? [],
      });
    } catch (err) {
      console.error("Chart fetch error:", err);
    } finally {
      setChartLoading(false);
    }
  };

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

  if (!isModalVisible) return null;

  return (
    <Modal visible={isModalVisible} transparent animationType="none">
      <View className="flex-1 justify-end bg-black/40">
        {/* Tap outside to close */}
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={handleClose}
        />

        {/* Bottom sheet */}
        <Animated.View
          style={{
            transform: [{ translateY: sheetPosition }],
            backgroundColor: "white",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            minHeight: SCREEN_HEIGHT,
            paddingBottom: 24,
          }}
        >
          <SafeAreaView className="flex-1 ">
            {/* Drag handle */}
            <View
              {...panResponder.panHandlers}
              className="w-full h-12 flex items-center justify-center"
            >
              <View className="w-14 h-1.5 bg-gray-300 rounded-full" />
            </View>

            {/* Header */}
            {selectedStock && (
              <View className="mb-4">
                <Text className="text-3xl font-bold text-black">
                  {selectedStock.symbol}
                </Text>
                <Text className="text-gray-500 text-base mt-1">
                  {selectedStock.display_name}
                </Text>
              </View>
            )}

            {/* Chart */}
            {chartLoading ? (
              <Skeleton className="h-[260px] w-full rounded-2xl" />
            ) : history ? (
              <View className="">
                <PhantomChart dataByTimeframe={history} />
              </View>
            ) : (
              <Text className="text-center text-gray-500 mt-10">
                No chart data
              </Text>
            )}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}
