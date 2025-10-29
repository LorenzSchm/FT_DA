import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Animated,
} from "react-native";
import Logo from "../assets/icons/icon.svg";
import { useRouter } from "expo-router";
import SignInModal from "@/components/modals/SignInModal";
import { useState, useRef, useEffect } from "react";
import CreateAccountModal from "@/components/modals/CreateAccountModal";
import NavBar from "@/components/NavBar";
import DashBoard from "@/components/DashBoard";
import TopBar from "@/components/TopBar";
import * as Font from "expo-font";
import InvestmentView from "@/components/Views/InvestmentView";
import {GestureHandlerRootView} from "react-native-gesture-handler";

enum STATE {
  DEFAULT = "DEFAULT",
  LOG_IN = "LOG_IN",
  CREATE_ACCOUNT = "CREATE_ACCOUNT",
}

export default function AppScreen() {
  const router = useRouter();
  const [state, setState] = useState(STATE.DEFAULT);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: state === STATE.DEFAULT ? 1 : 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [state]);

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
          <View className="flex-1 mt-20">


    <InvestmentView></InvestmentView>
              </View>
  );
}
