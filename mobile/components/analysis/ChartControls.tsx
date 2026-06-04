import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

export type ChartType = "pie" | "bar";

type Props = {
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
};

export default function ChartControls({ chartType, onChartTypeChange }: Props) {
  return (
    <View className="flex-row bg-gray-100 rounded-xl overflow-hidden">
      <TouchableOpacity
        onPress={() => onChartTypeChange("pie")}
        className={`px-3 py-2 ${chartType === "pie" ? "bg-black" : ""}`}
      >
        <Feather
          name="pie-chart"
          size={16}
          color={chartType === "pie" ? "#fff" : "#6b7280"}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onChartTypeChange("bar")}
        className={`px-3 py-2 ${chartType === "bar" ? "bg-black" : ""}`}
      >
        <Feather
          name="bar-chart-2"
          size={16}
          color={chartType === "bar" ? "#fff" : "#6b7280"}
        />
      </TouchableOpacity>
    </View>
  );
}
