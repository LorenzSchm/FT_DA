import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import InvestmentView from "@/components/Views/InvestmentView";
import SavingGoals from "@/components/saving-goals/SavingGoals";
import { SearchIcon } from "lucide-react-native";

export default function Investments() {
  const [activeTab, setActiveTab] = useState<"investments" | "savings">(
    "investments",
  );

  return (
    <View className="w-full h-full bg-white">
      {/* Search and Toggle Container */}
      <View className="px-7 pt-20 pb-4">
        {/* Search Bar */}
        <View className="bg-[#F1F1F2] mb-4 h-[42px] rounded-full flex items-center justify-start flex-row gap-2 pl-2 pb-1">
          <SearchIcon width={24} height={24} color="#9FA1A4" />
          <TextInput placeholder="Search" className={"text-[20px] "} />
        </View>

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
