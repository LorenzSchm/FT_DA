
// `mobile/components/reset-password/ResetPasswordForm.tsx`
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState, useRef, useEffect } from "react";

type Props = {
  isVisible: boolean;
  email: string;
  onVerify: (otp: string) => void;
  onResend: () => void;
};

export default function ResetPasswordForm({
  isVisible,
  email,
  onVerify,
  onResend,
}: Props) {
  const [digits, setDigits] = useState(Array(6).fill(""));
  const inputRefs = useRef<TextInput[]>([]);

  const setRef = (index: number) => (ref: TextInput | null) => {
    if (ref) inputRefs.current[index] = ref;
  };

  useEffect(() => {
    const otp = digits.join("");
    if (otp.length === 6 && !digits.includes("")) {
      onVerify(otp);
    }
  }, [digits, onVerify]);

  const handleChange = (index: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const newDigits = [...digits];
      newDigits[index] = value;
      setDigits(newDigits);

      if (value !== "" && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  if (!isVisible) return null;

  return (
    <View className="px-6 pt-6">
      <View className="mb-4">
        <Text className="text-black font-bold text-2xl">You got Mail!</Text>
        <Text className="text-black text-2xl mt-1">Insert the code received</Text>
      </View>

      <View className="flex-row items-center justify-start mb-4">
        <View className="flex-row gap-2">
          {[0, 1, 2].map((i) => (
            <TextInput
              key={i}
              ref={setRef(i)}
              className="w-[45px] h-[50px] border border-gray-300 rounded-2xl text-center text-black text-[22px]"
              keyboardType="number-pad"
              maxLength={1}
              value={digits[i]}
              onChangeText={(text) => handleChange(i, text)}
            />
          ))}
        </View>

        <Text className="mx-4 text-[38px]">-</Text>

        <View className="flex-row gap-2">
          {[3, 4, 5].map((i) => (
            <TextInput
              key={i}
              ref={setRef(i)}
              className="w-[45px] h-[50px] border border-gray-300 rounded-2xl text-center text-black text-[22px]"
              keyboardType="number-pad"
              maxLength={1}
              value={digits[i]}
              onChangeText={(text) => handleChange(i, text)}
            />
          ))}
        </View>
      </View>

      <Text className="text-gray-400 text-xl leading-5 mb-3">
        Didn’t receive the email? Check your{"\n"}spam folder
      </Text>

      <TouchableOpacity onPress={onResend} className="mb-6">
        <Text className="text-black text-2xl font-semibold">Send again</Text>
      </TouchableOpacity>
    </View>
  );
}
