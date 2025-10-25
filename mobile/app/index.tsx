import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Logo from "../assets/icons/icon.svg";
import { useRouter } from "expo-router";
import SignInModal from "@/components/modals/SignInModal";
import { useState, useEffect } from "react";
import CreateAccountModal from "@/components/modals/CreateAccountModal";
import NavBar from "@/components/NavBar";
import DashBoard from "@/components/DashBoard";
import TopBar from "@/components/TopBar";
import * as Font from "expo-font";

enum STATE {
  "DEFAULT",
  "LOG_IN",
  "CREATE_ACCOUNT",
}

export default function AppScreen() {
  const router = useRouter();
  const [state, setState] = useState(STATE.DEFAULT);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  const redirectToLogin = () => {
    setState(STATE.LOG_IN);
  };

  const redirectToSignUp = () => {
    setState(STATE.CREATE_ACCOUNT);
  };

  const handleModalClose = () => {
    setState(STATE.DEFAULT);
  };

  // Create a default text style with SpaceMono font
  const defaultTextStyle = {
    fontFamily: "SpaceMono",
  };

  return (
    <View className="flex h-full justify-end">
      <View className="flex items-center flex-col justify-between h-[93vh] ">
        <TopBar></TopBar>
        <DashBoard></DashBoard>
        <View className="w-full">
          <NavBar></NavBar>
        </View>
      </View>
    </View>
  );
}
