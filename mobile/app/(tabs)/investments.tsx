import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import AddInvestmentView from "@/components/Views/AddInvestmentView";
import SavingGoals from "@/components/saving-goals/SavingGoals";
import { SearchIcon } from "lucide-react-native";
import {InvestmentView} from "@/components/Views/InvestmentView";

export default function Investments() {
  const [activeTab, setActiveTab] = useState<"investments" | "savings">(
    "investments",
  );

  return (
    <View className="w-full h-full bg-white">
      <View className="px-7  pb-4">
        {/* Toggle Button */}
        <View className="flex-row justify-around items-center bg-[#F1F1F2] w-full h-[40px] rounded-full mb-4">
          <TouchableOpacity
            onPress={() => setActiveTab("investments")}
            className={`w-1/2 h-full flex justify-center items-center ${
              activeTab === "investments" ? "bg-black rounded-full" : ""
            }`}
          >
            <Text
              className={`text-xl ${
                activeTab === "investments" ? "text-white" : "text-neutral-500"
              }`}
            >
              Investments
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("savings")}
            className={`w-1/2 h-full flex justify-center items-center ${
              activeTab === "savings" ? "bg-black rounded-full" : ""
            }`}
          >
            <Text
              className={`text-xl ${
                activeTab === "savings" ? "text-white" : "text-neutral-500"
              }`}
            >
              Savings
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {activeTab === "investments" ? <InvestmentView /> : <SavingGoals />}
    </View>
  );
}
