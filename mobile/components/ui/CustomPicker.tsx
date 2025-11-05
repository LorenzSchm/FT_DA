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

  return (
    <View className={className}>
      <TouchableOpacity
        onPress={handleOpen}
        disabled={disabled}
        activeOpacity={0.7}
        className={`flex-row items-center justify-between h-[50px] border rounded-full px-4 ${"border-black"} ${disabled ? "opacity-50 bg-gray-100" : "bg-white"}`}
      >
        <Text
          className={`text-[20px] ${
            selectedOption ? "text-black" : "text-gray-400"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <ChevronDown size={24} color={"#000"} />
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
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
            />
          </Pressable>

          <Animated.View
            style={{
              transform: [{ translateY: slideAnim }],
            }}
            className="bg-white rounded-t-3xl max-h-[70%] shadow-2xl"
          >
            <View className="items-center py-3">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

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
