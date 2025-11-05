
import "react-native-gesture-handler";
import "react-native-reanimated";
import { useFonts } from "expo-font";
import "../global.css";
import { useColorScheme } from "@/hooks/useColorScheme";
import { StatusBar } from "react-native";
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { useAuthStore } from "@/utils/authStore";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  const { isLoggedIn, _hasHydrated, signOut } = useAuthStore();

  const shouldCreateAccount = false;

  return (
    <React.Fragment>
      <StatusBar />
      <Stack>
        <Stack.Protected guard={isLoggedIn}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="sign-in" options={{ headerShown: false }} />
          <Stack.Protected guard={shouldCreateAccount}>
            <Stack.Screen
              name="create-account"
              options={{ headerShown: false }}
            />
          </Stack.Protected>
        </Stack.Protected>
      </Stack>
      <Toast topOffset={50} />
    </React.Fragment>
  );
}
