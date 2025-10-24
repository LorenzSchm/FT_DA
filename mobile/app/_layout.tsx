import { useFonts } from "expo-font";
import "react-native-reanimated";
import "../global.css";
import { useColorScheme } from "@/hooks/useColorScheme";
import { StatusBar } from "react-native";
import React, { useEffect } from "react";
import { Stack } from "expo-router";

export default function RootLayout() {
  const isLoggedIn = false;
  const shouldCreateAccount = false;

  return (
    <React.Fragment>
      <StatusBar />
      <Stack>
        <Stack.Protected guard={isLoggedIn}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!isLoggedIn && !shouldCreateAccount}>
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
    </React.Fragment>
  );
}
