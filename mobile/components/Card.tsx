import { View, Text, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Logo from "../assets/icons/icon.svg";
import { Skeleton } from "@/components/ui/skeleton";

export default function Card({
  kind,
  amount,
  currency,
  name,
  provider,
  isLoading,
}: {
  kind: string;
  amount: number;
  currency: string;
  name: string;
  provider: string;
  isLoading?: boolean;
}) {
  const showLoading = isLoading || isNaN(amount);
  const isPositive = amount >= 0;
  const currencySymbol = currency === "USD" ? "$" : "€";

  const formattedAmount = `${currencySymbol}${Math.abs(amount).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;

  return (
    <View
      style={{
        width: 317,
        height: 190,
        borderRadius: 22,
        margin: 14,
        ...Platform.select({
          android: { elevation: 10 },
        }),
      }}
    >
      <LinearGradient
        colors={["#0a0a0a", "#111111", "#0d0d0d"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          borderRadius: 22,
          padding: 22,
          justifyContent: "space-between",
          overflow: "hidden" as const,
          borderWidth: 0.5,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        {/* Subtle accent glow top-right */}
        <View
          style={{
            position: "absolute",
            top: -50,
            right: -30,
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: "rgba(255,255,255,0.015)",
          }}
        />
        {/* Subtle accent glow bottom-left */}
        <View
          style={{
            position: "absolute",
            bottom: -60,
            left: -40,
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: "rgba(255,255,255,0.01)",
          }}
        />

        {/* Top: Account kind + Logo */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: 10,
                fontWeight: "700",
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              {kind || "Account"}
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.9)",
                fontSize: 16,
                fontWeight: "600",
              }}
              numberOfLines={1}
            >
              {name}
            </Text>
          </View>
          {provider === "FT" && (
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                borderRadius: 10,
                padding: 6,
                borderWidth: 0.5,
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              <Logo width={22} height={22} />
            </View>
          )}
        </View>

        {/* Bottom: Balance */}
        <View>
          <Text
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: 10,
              fontWeight: "600",
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 5,
            }}
          >
            Balance
          </Text>
          {showLoading ? (
            <Skeleton mode="dark" className="h-8 w-44 rounded-lg" animated />
          ) : (
            <Text
              style={{
                fontSize: 26,
                fontWeight: "700",
                color: isPositive ? "#34d399" : "#fb7185",
                letterSpacing: -0.5,
              }}
            >
              {amount < 0 ? "−" : ""}
              {formattedAmount}
            </Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}
