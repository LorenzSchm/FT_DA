"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Animated,
  Dimensions,
  PanResponder,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AddInvestmentView from "@/components/Views/AddInvestmentView";
import { GestureHandlerRootView } from "react-native-gesture-handler";

type Props = {
  isVisible: boolean;
  onClose: () => void;
};

export default function AddInvestmentModal({
  isVisible,
  onClose,
}: Props) {
  const [isModalVisible, setIsModalVisible] = useState(isVisible);
  const SCREEN_HEIGHT = Dimensions.get("window").height;
  const sheetPosition = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const iosShadow = {
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  };

  const shadowStyle = Platform.select({
    ios: iosShadow,
  });

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
  }, [isVisible, SCREEN_HEIGHT, sheetPosition]);

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
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            minHeight: SCREEN_HEIGHT,
            ...shadowStyle,
          }}
        >
          <SafeAreaView style={{ flex: 1 }} className={"rounded-2xl"}>
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
                <View className={"bg-gray-400 w-[50px] h-[5px] rounded-full"} />
              </View>
            </View>

            {/* Content */}
            <GestureHandlerRootView style={{ flex: 1 }}>
              <AddInvestmentView />
            </GestureHandlerRootView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

