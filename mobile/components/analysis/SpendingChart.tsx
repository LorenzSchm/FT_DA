import React from "react";
import { View, Text } from "react-native";
import Svg, { Path } from "react-native-svg";

type Props = {
    size?: number;
    strokeWidth?: number;
    income: number;
    expenses: number;
    currency?: string;
    label?: string;
    dateRange?: string;
};

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

export default function SpendingChart({
    size = 200,
    strokeWidth = 20,
    income,
    expenses,
    currency = "€",
    label = "This month",
    dateRange,
}: Props) {
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const totalFlow = Math.max(income, 0) + Math.max(expenses, 0);
    const segments = [
        { value: Math.max(income, 0), color: "#22c55e" },
        { value: Math.max(expenses, 0), color: "#ef4444" },
    ].filter((segment) => segment.value > 0);
    const hasData = totalFlow > 0;
    const net = income - expenses;
    const netColor = net >= 0 ? "text-green-500" : "text-red-500";
    const formattedNet = `${net >= 0 ? "+" : "-"}${(Math.abs(net) / 100).toLocaleString(
        "de-DE",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        },
    )}`;

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
                {!hasData ? (
                    <Path
                        d={describeArc(center, center, radius, 0, 359.999)}
                        stroke="#F1F1F2"
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                ) : (
                    (() => {
                        let startAngle = 0;
                        return segments.map((segment, index) => {
                            if (totalFlow === 0) return null;
                            const sweep = (segment.value / totalFlow) * 360;
                            const isLast = index === segments.length - 1;
                            const endAngle = isLast
                                ? 359.999
                                : Math.min(startAngle + sweep, 359.999);
                            const path = (
                                <Path
                                    key={`${segment.color}-${index}`}
                                    d={describeArc(center, center, radius, startAngle, endAngle)}
                                    stroke={segment.color}
                                    strokeWidth={strokeWidth}
                                    fill="none"
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
                <Text className="text-base font-semibold text-gray-600 mb-1">
                    {label}
                </Text>
                <Text className={`text-3xl font-bold ${netColor}`}>
                    {formattedNet} {currency}
                </Text>
                {dateRange && (
                    <Text className="text-sm text-gray-500 mt-1">{dateRange}</Text>
                )}
            </View>
        </View>
    );
}
