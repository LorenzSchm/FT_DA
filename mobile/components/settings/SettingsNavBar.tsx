import React from "react";
import {View, TouchableOpacity, Text} from "react-native";
import {User, Edit2, X, Check} from "lucide-react-native";
import { useRouter } from "expo-router";

type SettingsNavBarProps = {
  isEditing: boolean;
  onEditToggle: () => void;
  onSave?: () => void;
  onCancel?: () => void;
};

export default function SettingsNavBar({ isEditing, onEditToggle, onSave, onCancel }: SettingsNavBarProps) {
  const router = useRouter();

  return (
    <View className="bg-white flex-row justify-between items-center pt-20 p-4">
      <TouchableOpacity onPress={() => router.back()}>
        <View
          className={
            "bg-[#F1F1F2] rounded-full p-2 w-[40px] h-[40px] flex justify-center items-center"
          }
        >
          <User />
        </View>
      </TouchableOpacity>

      <View>
        <Text className="text-lg font-semibold">Settings</Text>
      </View>

      {isEditing ? (
        <View className="flex-row">
          <TouchableOpacity onPress={onCancel} className="mr-2">
            <View
              className={
                "bg-[#F1F1F2] rounded-full p-2 w-[40px] h-[40px] flex justify-center items-center"
              }
            >
              <X />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSave}>
            <View
              className={
                "bg-[#F1F1F2] rounded-full p-2 w-[40px] h-[40px] flex justify-center items-center"
              }
            >
              <Check />
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={onEditToggle}>
          <View
            className={
              "bg-[#F1F1F2] rounded-full p-2 w-[40px] h-[40px] flex justify-center items-center"
            }
          >
            <Edit2 />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}
