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
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const SCREEN_HEIGHT = Dimensions.get("window").height;
  const sheetPosition = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          sheetPosition.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 150 || gesture.vy > 0.5) {
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

      // Fetch real-time price
      if (selectedStock?.symbol) {
        fetchPrice(selectedStock.symbol);
      } else if (selectedStock?.ticker) {
        fetchPrice(selectedStock.ticker);
      }
    } else {
      Animated.timing(sheetPosition, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsModalVisible(false);
        setPrice(null);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, selectedStock?.symbol]);

  const fetchPrice = async (symbol: string) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:8000/stock/${symbol}/price`,
      );
      setPrice(res.data.price);
    } catch (error) {
      console.error("Failed to fetch price:", error);
    } finally {
      setLoading(false);
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
      <SafeAreaView className="flex-1 bg-black/50">
        {/* Overlay to close on press outside */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleClose}
          className="flex-1"
        />

        {/* Bottom sheet */}
        <Animated.View
          {...panResponder.panHandlers}
          style={{
            transform: [{ translateY: sheetPosition }],
            backgroundColor: "white",
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            paddingHorizontal: 20,
            paddingVertical: 20,
            minHeight: SCREEN_HEIGHT * 0.5,
          }}
        >
          {/* Drag handle */}
          <View className="items-center mb-6">
            <View className="w-12 h-1 bg-gray-300 rounded-full" />
          </View>

          {/* Stock Info */}
          {selectedStock && (
            <View className="gap-6">
              <View>
                <Text className="text-3xl font-bold text-black">
                  {selectedStock.symbol}
                </Text>
                <Text className="text-gray-500 text-base mt-2">
                  {selectedStock.display_name}
                </Text>
              </View>

              <View>
                <Text className="text-lg font-semibold text-gray-600 mb-2">
                  Current Price
                </Text>
                {loading ? (
                  <Skeleton
                    mode="light"
                    className="h-4 w-[50px]"
                    animated={true}
                  />
                ) : (
                  <Text className="text-4xl font-bold text-black">
                    ${price !== null ? price.toFixed(2) : "—"}
                  </Text>
                )}
              </View>
            </View>
          )}
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
}
