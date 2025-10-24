import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import Logo from "../assets/icons/icon.svg";
import { useRouter } from "expo-router";
import SignInModal from "@/components/modals/SignInModal";
import { useState } from "react";
import CreateAccountModal from "@/components/modals/CreateAccountModal";

enum STATE {
  "DEFAULT",
  "LOG_IN",
  "CREATE_ACCOUNT",
}

export default function AppScreen() {
  const router = useRouter();
  const [state, setState] = useState(STATE.DEFAULT);

  const redirectToLogin = () => {
    setState(STATE.LOG_IN);
  };

  const redirectToSignUp = () => {
    setState(STATE.CREATE_ACCOUNT);
  };

  const handleModalClose = () => {
    setState(STATE.DEFAULT);
  };

  return (
    <ImageBackground
      source={require("../assets/images/london_small.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <View
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.09)" }}
      />
      <View className={"h-screen w-screen"}>
        <View
          className={
            "flex flex-col items-center justify-center gap-4 mt-[140px]"
          }
        >
          <Logo width={40} height={40} />
          <Text className={"text-white text-[20px] font-bold"}>
            Welcome to the
          </Text>
          <Text className={"text-white text-5xl font-bold"}>
            Finance Tracker
          </Text>
        </View>
        <View className={"flex items-center justify-center gap-8 mt-[400px]"}>
          <TouchableOpacity
            className={
              "bg-white flex items-center justify-center p-4 w-4/5 rounded-full"
            }
            onPress={redirectToSignUp}
            activeOpacity={0.9}
          >
            <Text className={"font-bold text-xl"}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={
              "bg-black flex items-center justify-center p-4 w-4/5 rounded-full"
            }
            onPress={redirectToLogin}
            activeOpacity={0.9}
          >
            <Text className={"text-white font-bold text-xl"}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
      <SignInModal
        isVisible={state === STATE.LOG_IN}
        onClose={handleModalClose}
      />
      <CreateAccountModal
        isVisible={state === STATE.CREATE_ACCOUNT}
        onClose={handleModalClose}
      />
    </ImageBackground>
  );
}
