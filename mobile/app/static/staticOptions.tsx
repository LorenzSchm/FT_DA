import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

const StaticOptions: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="flex-1 bg-white">
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setExpanded(!expanded)}
        className={`absolute bottom-24 right-5  ${
          expanded ? "bg-black w-64 py-6 rounded-[25px]" : "bg-black w-40 py-4 rounded-full"
        }`}
      >
        {!expanded ? (
          <View className="items-center justify-center">
            <Text className="text-white text-3xl font-semibold">Add  +</Text>
          </View>
        ) : (
          <View className="flex-col justify-center px-6 space-y-3">
            <TouchableOpacity className="flex-row justify-between items-center pb-3">
              <Text className="text-white text-3xl font-semibold">Account</Text>
              <Text className="text-white text-3xl">›</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row justify-between items-center">
              <Text className="text-white text-3xl font-semibold">Transaction</Text>
              <Text className="text-white text-3xl">›</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default StaticOptions;
