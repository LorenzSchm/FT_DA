import React from "react";
import { Pressable, View } from "react-native";
import BarIcon from "@/assets/icons/bar.svg";
import PieIcon from "@/assets/icons/pie-chart.svg";
import SpeechIcon from "@/assets/icons/chat.svg";
import HomeIcon from "@/assets/icons/home.svg";

type IconKey = "home" | "bar" | "pie" | "chat";

export default function NavBar({ active }: { active?: IconKey }) {
  const activeColor = "#000";
  const inactiveColor = "#9CA3AF";

  return (
    <View className="flex-row justify-around items-center py-2">
      <Pressable className="flex-col items-center p-2">
        <HomeIcon
          width={20}
          height={20}
          stroke={active === "home" ? activeColor : inactiveColor}
        />
      </Pressable>
      <Pressable className="flex-col items-center p-2">
        <BarIcon
          width={20}
          height={20}
          stroke={active === "bar" ? activeColor : inactiveColor}
        />
      </Pressable>
      <Pressable className="flex-col items-center p-2">
        <PieIcon
          width={20}
          height={20}
          stroke={active === "pie" ? activeColor : inactiveColor}
        />
      </Pressable>
      <Pressable className="flex-col items-center p-2">
        <SpeechIcon
          width={20}
          height={20}
          stroke={active === "chat" ? activeColor : inactiveColor}
        />
      </Pressable>
    </View>
  );
}
