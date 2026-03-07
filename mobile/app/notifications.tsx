import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Bell, BellOff } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";

function NotificationsNavBar() {
  const router = useRouter();

  return (
    <View className="bg-white flex-row justify-between items-center pt-20 p-4">
      <TouchableOpacity onPress={() => router.back()}>
        <View
          className={
            "bg-[#F1F1F2] rounded-full p-2 w-[40px] h-[40px] flex justify-center items-center"
          }
        >
          <Bell />
        </View>
      </TouchableOpacity>

      <View>
        <Text className="text-lg font-semibold">Notifications</Text>
      </View>

      <View className="w-[40px] h-[40px]" />
    </View>
  );
}

export default function NotificationsPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 bg-white">
        <NotificationsNavBar />
        <View className="flex-1 justify-center items-center px-10">
          <View className="bg-[#F1F1F2] rounded-full p-5 mb-4">
            <BellOff size={32} color="#9FA1A4" />
          </View>
          <Text className="text-lg font-bold mb-1">No notifications yet</Text>
          <Text className="text-gray-500 text-center">
            When you receive notifications, they'll appear here.
          </Text>
        </View>
      </View>
    </>
  );
}
