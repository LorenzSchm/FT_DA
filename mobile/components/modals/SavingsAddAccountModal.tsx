"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  PanResponder,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  isVisible: boolean;
  onClose: () => void;
  onSave?: (name: string, initialAmount: string) => void;
};

export default function SavingsAddAccountModal({ isVisible, onClose, onSave }: Props) {
  const [isModalVisible, setIsModalVisible] = useState(isVisible);
  const [name, setName] = useState("");
  const [initialAmount, setInitialAmount] = useState("");

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
      // Reset form
      setName("");
      setInitialAmount("");
      onClose();
    });
  };

  const handleSave = () => {
    console.log("handleSave called", { name, initialAmount, hasOnSave: !!onSave });
    if (!name.trim() || !initialAmount.trim()) {
      console.log("Form validation failed - empty fields");
      return; // Don't save if fields are empty
    }
    if (onSave) {
      console.log("Calling onSave with:", { name, initialAmount });
      try {
        onSave(name, initialAmount);
        console.log("onSave completed successfully");
      } catch (error) {
        console.error("Error in onSave:", error);
        return; // Don't close if there was an error
      }
    } else {
      console.log("No onSave handler provided. Saving Savings Account:", {
        name,
        initialAmount,
        provider: "FT",
      });
    }
    // Reset form before closing
    setName("");
    setInitialAmount("");
    handleClose();
  };

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

            {/* Title */}
            <Text className="text-3xl font-extrabold text-black mb-6">
              Account
            </Text>

            {/* Name Field */}
            <Text className="text-lg font-semibold text-black mb-2">Name</Text>
            <View className="bg-neutral-100 rounded-full px-5 py-4 mb-4">
              <TextInput
                className="text-black"
                placeholder="e.g. Emergency Fund"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Provider (Static) */}
            <Text className="text-lg font-semibold text-black mb-2">
              Provider
            </Text>
            <View className="bg-neutral-100 rounded-full px-5 py-4 mb-4">
              <Text className="text-neutral-900">FT</Text>
            </View>

            {/* Initial Amount Field */}
            <Text className="text-lg font-semibold text-black mb-2">
              Initial Amount
            </Text>
            <View className="bg-neutral-100 rounded-full px-5 py-4 mb-8">
              <TextInput
                className="text-black"
                placeholder="e.g. € 0.00"
                keyboardType="numbers-and-punctuation"
                value={initialAmount}
                onChangeText={setInitialAmount}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              className="bg-black rounded-full py-4"
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text className="text-center text-white font-semibold text-lg">
                Add Account
              </Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}
