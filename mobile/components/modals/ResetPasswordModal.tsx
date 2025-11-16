import { Modal, Text, TextInput, TouchableOpacity, View, Animated } from "react-native";
import { useEffect, useState, useRef } from "react";
import ResetPasswordForm from "@/components/reset-password/ResetPasswordForm";
import SetNewPasswordForm from "@/components/reset-password/SetNewPasswordForm";

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

type Props = {
  isVisible: boolean;
  onClose: () => void;
};

export default function ResetPasswordModal({ isVisible, onClose }: Props) {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(isVisible);
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [step, setStep] = useState<"email" | "otp" | "setPassword">("email");

  const modalContentAnim = useRef(new Animated.Value(0)).current;
  const formContentAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setIsModalVisible(isVisible);
    if (isVisible) {
      modalContentAnim.setValue(0);
      formContentAnim.setValue(1);
      setStep("email");
      setEmail("");
      setEmailError("");
    }
  }, [isVisible, modalContentAnim, formContentAnim]);

  const formIsVisible = step !== "email";

  useEffect(() => {
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
  }, [formIsVisible, modalContentAnim, formContentAnim]);

  const handleClose = () => {
    setIsModalVisible(false);
    setStep("email");
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
    setStep("otp");
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      setEmailError("");
    }
  };

  const handleVerify = async (otp: string) => {
    console.log("Received OTP:", otp);
    setStep("setPassword");
  };

  const handleResend = () => {
    console.log("Resend requested for:", email);
  };

  const handleResetComplete = () => {
    setIsModalVisible(false);
    setStep("email");
    setEmail("");
    setEmailError("");
    onClose();
  };

  if (!isModalVisible) return null;

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
          <Text className="text-2xl text-gray-400">Reset your password</Text>
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
                  <Text className="text-red-500 text-sm ml-4">{emailError}</Text>
                ) : null}
                <TouchableOpacity
                  className="bg-black shadow-md rounded-full h-[50px] mt-[20px] flex items-center justify-center"
                  activeOpacity={0.85}
                  onPress={handleFormOpen}
                >
                  <Text className="text-white font-bold text-[15px]">Send</Text>
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
              {step === "otp" && (
                <ResetPasswordForm
                  isVisible={true}
                  email={email}
                  onVerify={handleVerify}
                  onResend={handleResend}
                />
              )}

              {step === "setPassword" && (
                <SetNewPasswordForm
                  isVisible={true}
                  email={email}
                  onResetComplete={handleResetComplete}
                />
              )}
            </Animated.View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
