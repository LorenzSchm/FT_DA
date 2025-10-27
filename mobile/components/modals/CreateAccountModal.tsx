import {
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { useEffect, useMemo, useState, useRef } from "react";
import SignInForm from "@/components/sign-in/SignInForm";
import SignUpForm from "@/components/sign-up/SignUpForm";

const BRANDFETCH_CLIENT_ID = process.env.EXPO_PUBLIC_LOGO_API_KEY;

const getBrandfetchLogoUrl = (domain: string) => {
  if (!BRANDFETCH_CLIENT_ID) {
    return undefined;
  }

  return `https://cdn.brandfetch.io/${domain}/icon?c=${BRANDFETCH_CLIENT_ID}`;
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

type Props = {
  isVisible: boolean;
  onClose: () => void;
};

export default function SignInModal({ isVisible, onClose }: Props) {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(isVisible);
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [formIsVisible, setFormIsVisible] = useState<boolean>(false);

  const modalContentAnim = useRef(new Animated.Value(0)).current;
  const formContentAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setIsModalVisible(isVisible);
    if (isVisible) {
      modalContentAnim.setValue(0);
      formContentAnim.setValue(1);
      setFormIsVisible(false);
      setEmail("");
      setEmailError("");
    }
  }, [isVisible]);

  useEffect(() => {
    // Trigger animation when formIsVisible changes
    Animated.parallel([
      Animated.timing(modalContentAnim, {
        toValue: formIsVisible ? -1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(formContentAnim, {
        toValue: formIsVisible ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [formIsVisible]);

  const handleClose = () => {
    setIsModalVisible(false);
    onClose();
  };

  const handleFormOpen = () => {
    if (!email.trim()) {
      setEmailError("Please enter an email address");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setEmailError("");
    setFormIsVisible(true);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      setEmailError("");
    }
  };

  const providers = useMemo(
    () => [
      { label: "Continue with Apple", domain: "apple.com" },
      { label: "Continue with Google", domain: "google.com" },
    ],
    [],
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end">
        <View className="h-2/5" onTouchEnd={handleClose} />
        <View className="h-3/5 bg-white rounded-t-3xl p-6">
          <Text className="text-2xl text-gray-400">Sign Up</Text>
          <View>
            <Animated.View
              style={{
                transform: [
                  {
                    translateX: modalContentAnim.interpolate({
                      inputRange: [-1, 0],
                      outputRange: [-300, 0],
                    }),
                  },
                ],
                opacity: modalContentAnim.interpolate({
                  inputRange: [-1, 0],
                  outputRange: [0, 1],
                }),
              }}
            >
              <View>
                <TextInput
                  className={`text-black-400 text-[20px] border ${
                    emailError ? "border-red-500" : "border-black"
                  } rounded-full h-[50px] px-4 pb-1 mt-[60px]`}
                  placeholder="Enter your Email"
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {emailError ? (
                  <Text className="text-red-500 text-sm ml-4">
                    {emailError}
                  </Text>
                ) : null}
                <TouchableOpacity
                  className="bg-black shadow-md rounded-full h-[50px] mt-[20px] flex items-center justify-center"
                  activeOpacity={0.85}
                  onPress={handleFormOpen}
                >
                  <Text className="text-white font-bold text-[15px]">
                    Continue
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="flex flex-row items-center justify-around mt-[20px]">
                <View className={"bg-black h-[2px] w-[150px] rounded-full"} />
                <Text className="font-bold text-xl">OR</Text>
                <View className={"bg-black h-[2px] w-[150px] rounded-full"} />
              </View>
              <View className="flex flex-col gap-[20px] mt-[20px]">
                <TouchableOpacity className="flex flex-row items-center justify-center h-[50px] border border-black rounded-full px-5">
                  <Image
                    source={{ uri: getBrandfetchLogoUrl("apple.com") }}
                    style={{ width: 40, height: 40 }}
                    resizeMode="contain"
                  />
                  <Text className="font-bold text-[15px]">
                    Continue with Apple
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex flex-row items-center justify-center h-[50px] border border-black rounded-full gap-3 px-5">
                  <Image
                    source={{ uri: getBrandfetchLogoUrl("google.com") }}
                    style={{ width: 30, height: 30 }}
                    resizeMode="contain"
                  />
                  <Text className="font-bold text-[15px]">
                    Continue with Google
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
            <Animated.View
              style={{
                position: "absolute",
                width: "100%",
                transform: [
                  {
                    translateX: formContentAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 300],
                    }),
                  },
                ],
                opacity: formContentAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
              }}
            >
              <SignUpForm isVisible={formIsVisible} email={email} />
            </Animated.View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
