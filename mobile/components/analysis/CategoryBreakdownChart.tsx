import React, { useState } from "react";
import { View, Text } from "react-native";
import Svg, { Path } from "react-native-svg";

type CategoryDatum = {
  label: string;
  amount: number; // positive minor units
};

type Props = {
  data: CategoryDatum[];
  size?: number;
  strokeWidth?: number;
  currency?: string;
  title?: string;
  emptyLabel?: string;
  rangeLabel?: string;
};

const SHADES = [
  "#111827",
  "#1f2937",
  "#374151",
  "#4b5563",
  "#6b7280",
  "#9ca3af",
  "#d1d5db",
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

export default function CategoryBreakdownChart({
  data,
  size = 220,
  strokeWidth = 24,
  currency = "€",
  title = "This month",
  emptyLabel = "No data",
  rangeLabel,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const entries = data.filter((item) => item.amount > 0);
  const total = entries.reduce((sum, item) => sum + item.amount, 0);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const activeEntry =
    highlightedIndex !== null ? entries[highlightedIndex] : undefined;

  const formatAmount = (amount: number) =>
    `${(amount / 100).toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${currency}`;

  return (
    <View className="items-center w-full">
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
            <Path
              d={describeArc(center, center, radius, 0, 359.999)}
              stroke="#E5E7EB"
              strokeWidth={strokeWidth}
              fill="none"
            />
          ) : (
            (() => {
              let startAngle = 0;
              return entries.map((item, index) => {
                const sweep = (item.amount / total) * 360;
                const isLast = index === entries.length - 1;
                const endAngle = isLast
                  ? 359.999
                  : Math.min(startAngle + sweep, 359.999);
                const path = (
                  <Path
                    key={`${item.label}-${index}`}
                    d={describeArc(
                      center,
                      center,
                      radius,
                      startAngle,
                      endAngle,
                    )}
                    stroke={SHADES[index % SHADES.length]}
                    strokeWidth={strokeWidth}
                    fill="none"
                    onPressIn={() => setHighlightedIndex(index)}
                    onPressOut={() => setHighlightedIndex(null)}
                  />
                );
                startAngle = endAngle;
                return path;
              });
            })()
          )}
        </Svg>

        <View
          style={{
            position: "absolute",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text className="text-xs uppercase tracking-wide text-gray-400">
            {activeEntry ? activeEntry.label : title}
          </Text>
          <Text className="text-3xl font-bold text-gray-900">
            {activeEntry
              ? formatAmount(activeEntry.amount)
              : total === 0
                ? emptyLabel
                : formatAmount(total)}
          </Text>
        </View>
      </View>
      {rangeLabel ? (
        <Text className="text-sm text-gray-500 mt-3">{rangeLabel}</Text>
      ) : null}
    </View>
  );
}
