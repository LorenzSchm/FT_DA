import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/utils/authStore";
import ResetPasswordModal from "@/components/modals/ResetPasswordModal";

type Props = {
  isVisible: boolean;
  email: string;
};

export default function SignInForm({ isVisible, email }: Props) {
  const [password, setPassword] = useState<string>("");
  const { signIn } = useAuthStore();
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [mail, setMail] = useState<string>(email);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setMail(email);
  }, [email]);

  const handleSubmit = async () => {
    setLoading(true);
    if (mail && password) {
      await signIn(mail, password)
        .then(() => {
          console.log("User signed in successfully");
        })
        .catch((error) => {
          console.error("Error signing in:", error);
        });
      setLoading(false);
    }
    setLoading(false);
  };

  return isVisible ? (
    <View>
      <ResetPasswordModal
        isVisible={showResetModal}
        onClose={() => setShowResetModal(false)}
      />
      <View className={"flex flex-col gap-[25px]"}>
        <View className={"flex flex-col gap-[20px]"}>
          <TextInput
            className={`text-black-400 text-[20px] border border-black rounded-full h-[50px] px-4 pb-1 mt-[60px]`}
            placeholder={"Enter your Email"}
            value={mail}
            onChangeText={setMail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View>
            <TextInput
              className={`text-black-400 text-[20px] border border-black  rounded-full h-[50px] px-4 pb-1`}
              placeholder={"Enter your Password"}
              value={password}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={true}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowResetModal(true)}>
              <Text className={"text-gray-400 text-[15px] pl-2 pt-1"}>
                Forgot your Password?
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          className={
            "bg-black shadow-md rounded-full h-[50px] flex items-center justify-center"
          }
          activeOpacity={0.85}
          onPress={handleSubmit}
        >
          {loading ? (
            <ActivityIndicator color={"white"} />
          ) : (
            <Text className={"text-white font-bold text-[15px]"}>Log In</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  ) : null;
}
