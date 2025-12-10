import React from "react";
import { View, Text } from "react-native";
import Svg, { Path } from "react-native-svg";

type Saving = {
  id: number;
  contributed_minor?: number;
  target_minor?: number;
};

type Props = {
  size?: number;
  strokeWidth?: number;
  savings: Saving[];
  totalAmount: number;
  currency?: string;
};

const COLORS = [
  "#AFBACC",
  "#213D65",
  "#425989",
  "#000000",
  "#35609f",
  "#38475e",
  "#3d6eb3",
  "#1b5cb3",
  "#435671",
  "#4B5563",
];

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(x, y, radius, startAngle);
  const end = polarToCartesian(x, y, radius, endAngle);
  const sweep = endAngle - startAngle;

  const largeArcFlag = sweep <= 180 ? "0" : "1";

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

export default function CircularProgress({
  size = 250,
  strokeWidth = 25,
  savings,
  totalAmount,
  currency = "€",
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  // Filter out savings with no contributions
  const savingsWithContributions = savings.filter(
    (s) => (s.contributed_minor || 0) > 0,
  );

  // Calculate total contributions
  const total = savingsWithContributions.reduce(
    (sum, s) => sum + (s.contributed_minor || 0),
    0,
  );

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size} height={size}>
        {total === 0 ? (
          // Show gray circle if no contributions
          <Path
            d={describeArc(center, center, radius, 0, 359.999)}
            stroke="#F1F1F2"
            strokeWidth={strokeWidth}
            fill="none"
          />
        ) : (
          // Draw pie chart segments
          savingsWithContributions.map((saving, index) => {
            const contributed = saving.contributed_minor || 0;
            const percentage = contributed / total;
            const segmentAngle = 360 * percentage;

            // Calculate cumulative angle (where this segment starts)
            let cumulativeAngle = 0;
            for (let i = 0; i < index; i++) {
              const prevContributed =
                savingsWithContributions[i].contributed_minor || 0;
              const prevPercentage = prevContributed / total;
              cumulativeAngle += 360 * prevPercentage;
            }

            const startAngle = cumulativeAngle;
            const endAngle = startAngle + segmentAngle;

            const d = describeArc(center, center, radius, startAngle, endAngle);
            const color = COLORS[index % COLORS.length];

            return (
              <Path
                key={saving.id}
                d={d}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="none"
              />
            );
          })
        )}
      </Svg>

      <View
        style={{
          position: "absolute",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text className="text-[32px] font-bold text-green-500">
          {currency}
          {(totalAmount / 100).toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>
    </View>
  );
}
