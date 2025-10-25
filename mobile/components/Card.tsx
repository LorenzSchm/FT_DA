import { View, Text, useWindowDimensions } from "react-native";

interface CardProps {
  kind: string;
  amount: number;
  currency: string;
}

export default function Card({ kind, amount, currency }: CardProps) {
  const { width } = useWindowDimensions();

  const cardWidth = (width-60) * 0.9;
    const cardHeight = cardWidth * (181 / 317);

  return (
    <View
      className="bg-black gap-2 rounded-3xl p-5 shadow-xl"
      style={{ width: cardWidth, height: cardHeight }}
    >
      <Text className="text-white font-bold">{kind}</Text>
      <Text
        className={`text-lg font-bold ${
          amount < 0 ? "text-red-500" : "text-green-500"
        }`}
      >
        {amount < 0 ? "-" : ""}{Math.abs(amount)} {currency === "USD" ? "$" : "€"}
      </Text>
    </View>
  );
}

