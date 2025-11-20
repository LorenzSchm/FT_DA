import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import Toast from "react-native-toast-message";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

type Props = {
  isVisible: boolean;
  email: string;
  session?: { access_token: string; refresh_token: string } | null;
  onResetComplete: () => void;
};

type Errors = {
  password?: string;
  repeatPassword?: string;
};

export default function SetNewPasswordForm({
  isVisible,
  email,
  session,
  onResetComplete,
}: Props) {
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const validatePassword = (password: string): string | undefined => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password))
      return "Password must contain an uppercase letter";
    if (!/[0-9]/.test(password))
      return "Password must contain a number";
    return undefined;
  };

  const validateRepeatPassword = (
    password: string,
    repeat: string
  ): string | undefined => {
    if (!repeat) return "Please repeat your password";
    if (password !== repeat) return "Passwords do not match";
    return undefined;
  };

  const handleSubmit = async () => {
    const passwordErr = validatePassword(password);
    const repeatErr = validateRepeatPassword(password, repeatPassword);

    const newErrors: Errors = {
      password: passwordErr,
      repeatPassword: repeatErr,
    };
    setErrors(newErrors);

    if (passwordErr || repeatErr) return;

    try {
      if (!session) {
        throw new Error("No session available. Please try again.");
      }

      // Call API for password reset
      await axios.post(
        `${API_URL}/auth/reset-password`,
        { password },
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "X-Refresh-Token": session.refresh_token
          }
        }
      );

      Toast.show({
        type: "success",
        text1: "Password updated!",
        text2: "You can now log in with your new password.",
      });

      onResetComplete();

      setPassword("");
      setRepeatPassword("");
      setErrors({});
    } catch (err: any) {
      console.error("Password reset failed:", err.response?.data?.detail || err.message);
      Toast.show({
        type: "error",
        text1: "Something went wrong",
        text2: err.response?.data?.detail || "Could not reset your password.",
      });
    }
  };

  if (!isVisible) return null;

  return (
    <View className="flex flex-col gap-[25px] mt-4">
      <View className="mt-[30px]">
        <TextInput
          className={`text-black text-[20px] border rounded-full h-[50px] px-4 ${
            errors.password ? "border-red-500" : "border-black"
          }`}
          placeholder="New password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrors((prev) => ({
              ...prev,
              password: validatePassword(text),
              repeatPassword: validateRepeatPassword(text, repeatPassword),
            }));
          }}
        />
        {errors.password && (
          <Text className="text-red-500 text-[14px] mt-1">{errors.password}</Text>
        )}
      </View>

      <View>
        <TextInput
          className={`text-black text-[20px] border rounded-full h-[50px] px-4 ${
            errors.repeatPassword ? "border-red-500" : "border-black"
          }`}
          placeholder="Repeat new password"
          placeholderTextColor="#999"
          secureTextEntry
          value={repeatPassword}
          onChangeText={(text) => {
            setRepeatPassword(text);
            setErrors((prev) => ({
              ...prev,
              repeatPassword: validateRepeatPassword(password, text),
            }));
          }}
        />
        {errors.repeatPassword && (
          <Text className="text-red-500 text-[14px] mt-1">
            {errors.repeatPassword}
          </Text>
        )}
      </View>

      <TouchableOpacity
        className="bg-black shadow-md rounded-full h-[50px] flex items-center justify-center mt-[30px]"
        activeOpacity={0.85}
        onPress={handleSubmit}
      >
        <Text className="text-white font-bold text-[15px]">Reset Password</Text>
      </TouchableOpacity>
    </View>
  );
}
