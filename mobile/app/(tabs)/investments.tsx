import { View, Text } from "react-native";
import InvestmentView from "@/components/Views/InvestmentView";

export default function Investments() {
  return (
    <View className="flex-1 mt-20 w-full justify-center bg-white ">
      <InvestmentView />
    </View>
  );
}
