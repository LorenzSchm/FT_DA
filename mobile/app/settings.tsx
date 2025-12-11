import React from "react";
import SettingsScreen from "@/components/settings/settings";
import { Stack } from "expo-router";

export default function SettingsPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SettingsScreen />
    </>
  );
}
