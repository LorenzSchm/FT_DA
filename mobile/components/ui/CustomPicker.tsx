import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";
import { ChevronDown, Check } from "lucide-react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const CustomPicker = ({
  placeholder = "Select an option",
  value,
  onValueChange,
  options = [],
  disabled = false,
  className = "",
  // variant controls visual style of the closed trigger to match different input styles
  // - "default": white background with black border (current default)
  // - "input": matches rounded-full neutral input fields used in forms
  variant = "default",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const selectedScaleAnim = useRef(new Animated.Value(1)).current;

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [isOpen, slideAnim, fadeAnim, rotateAnim]);

  const handleOpen = () => {
    if (!disabled) {
      setModalVisible(true);
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSelect = (option) => {
    Animated.sequence([
      Animated.timing(selectedScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(selectedScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onValueChange(option.value);
    setTimeout(() => handleClose(), 300);
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const isInput = variant === "input";

  // Trigger container styles vary by variant to integrate with different form aesthetics
  const triggerClass = `${
    isInput
      ? "bg-neutral-100 rounded-full px-5 py-4 h-fit"
      : "bg-white border border-black rounded-full px-4 h-[50px]"
  } flex-row items-center justify-between ${disabled ? "opacity-50" : ""}`;

  // Text colors for placeholder vs selected, adapt per variant
  const textClass = isInput
    ? `text-[20px] ${selectedOption ? "text-black" : "text-[#9FA1A4] font-bold"}`
    : `text-[20px] ${selectedOption ? "text-black" : "text-gray-400"}`;

  // Chevron color per variant
  const chevronColor = isInput ? "#9FA1A4" : "#000";

  return (
    <View className={className}>
      <TouchableOpacity
        onPress={handleOpen}
        disabled={disabled}
        activeOpacity={0.7}
        className={triggerClass}
      >
        <Text className={textClass}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <ChevronDown size={24} color={chevronColor} />
        </Animated.View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <View className="flex-1">
          <Pressable onPress={handleClose} className="flex-1">
            <Animated.View
              style={{
                opacity: fadeAnim,
                flex: 1,
              }}
            />
          </Pressable>

          <Animated.View
            style={{
              transform: [{ translateY: slideAnim }],
            }}
            className="bg-white rounded-t-3xl max-h-[70%] shadow-2xl"
          >
            <TouchableOpacity className="items-center py-3" onPress={handleClose} activeOpacity={0.6}>
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </TouchableOpacity>

            <View className="px-6 py-4">
              <Text className="text-[22px] font-semibold text-black">
                {placeholder}
              </Text>
            </View>

            <ScrollView
              className="px-4"
              showsVerticalScrollIndicator={false}
              bounces={true}
            >
              {options.map((option, index) => {
                const isSelected = option.value === value;
                return (
                  <Animated.View
                    key={option.value}
                    style={{
                      transform: [
                        {
                          scale: isSelected ? selectedScaleAnim : 1,
                        },
                      ],
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => handleSelect(option)}
                      activeOpacity={0.6}
                      className={`flex-row items-center justify-between py-4 px-4 my-1 rounded-full ${
                        isSelected ? "bg-black" : "bg-gray-50"
                      }`}
                    >
                      <Text
                        className={`text-[18px] ${
                          isSelected ? "text-white font-semibold" : "text-black"
                        }`}
                      >
                        {option.label}
                      </Text>
                      {isSelected && (
                        <Animated.View
                          style={{
                            transform: [{ scale: selectedScaleAnim }],
                          }}
                        >
                          <Check size={24} color="white" strokeWidth={2} />
                        </Animated.View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
              <View className="h-6" />
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default CustomPicker;
