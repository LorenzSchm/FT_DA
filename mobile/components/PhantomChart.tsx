import React from "react";
import { View, Text, Pressable } from "react-native";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart } from "react-native-wagmi-charts";

type Point = {
  timestamp: number;
  value: number;
};

type TimeframeKey = "1D" | "1W" | "1M" | "1Y" | "ALL";

type Props = {
  dataByTimeframe: Record<TimeframeKey, Point[]>;
  initialTimeframe?: TimeframeKey;
  height?: number;
  positiveColor?: string;
  negativeColor?: string;
  backgroundColor?: string;
  loading?: boolean;
  emptyPlaceholder?: React.ReactNode;
};

const TIMEFRAMES: TimeframeKey[] = ["1D", "1W", "1M", "1Y", "ALL"];

export const PhantomChart: React.FC<Props> = ({
  dataByTimeframe,
  initialTimeframe = "1D",
  height = 220,
  positiveColor = "#16a34a",
  negativeColor = "#dc2626",
  backgroundColor = "#FFFFFF",
  loading = false,
  emptyPlaceholder,
}) => {
  const [timeframe, setTimeframe] =
    React.useState<TimeframeKey>(initialTimeframe);
  const [isCursorActive, setIsCursorActive] = React.useState(false);

  const activeData = React.useMemo(
    () => dataByTimeframe[timeframe] ?? [],
    [dataByTimeframe, timeframe],
  );

  const firstValue = activeData[0]?.value ?? 0;
  const lastValue = activeData[activeData.length - 1]?.value ?? firstValue;

  const [displayValue, setDisplayValue] = React.useState(lastValue);

  const diff = displayValue - firstValue;
  const diffPct = firstValue ? (diff / firstValue) * 100 : 0;
  const isUp = diff >= 0;

  React.useEffect(() => {
    if (!isCursorActive) setDisplayValue(lastValue);
  }, [lastValue, timeframe, isCursorActive]);

  if (loading || !activeData.length) {
    return (
      <View className={`rounded-3xl bg-[${backgroundColor}]`}>
        <View className="px-4 pt-4">
          <Skeleton className="h-6 w-40 mb-3 rounded-full" />
          <Skeleton className="w-full rounded-2xl" style={{ height }} />
        </View>
        <TimeframeRow active={timeframe} onChange={setTimeframe} />
        {emptyPlaceholder}
      </View>
    );
  }

  return (
    <View className={`rounded-full bg-[${backgroundColor}]`}>
      <View className="flex-row justify-between items-center px-8 pt-4">
        <Text className="text-2xl font-semibold text-black">
          ${displayValue.toFixed(2)}
        </Text>

        <View
          className={`rounded-full px-2 py-1 ${
            isUp ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              isUp ? "text-green-600" : "text-red-600"
            }`}
          >
            {isUp ? "+" : ""}
            {diff.toFixed(2)} ({isUp ? "+" : ""}
            {diffPct.toFixed(2)}%)
          </Text>
        </View>
      </View>

      <Text className="text-gray-500 text-xs px-8 mt-1">
        {timeframe} · {isUp ? "Performance" : "Loss"}
      </Text>
      <View className="px-2">
        <TimeframeRow active={timeframe} onChange={setTimeframe} />
      </View>

      <LineChart.Provider
        key={`${timeframe}-${activeData.length}`}
        data={activeData}
        onCurrentIndexChange={(index) => {
          if (index == null) return;
          const point = activeData[index];
          if (point) setDisplayValue(point.value);
        }}
      >
        <LineChart height={height} className="mt-6">
          <LineChart.Path
            color={
              isCursorActive ? "#000" : isUp ? positiveColor : negativeColor
            }
            width={2}
          />

          <LineChart.CursorCrosshair
            color="#000"
            onActivated={() => setIsCursorActive(true)}
            onEnded={() => setIsCursorActive(false)}
          >
            <LineChart.Tooltip
              position="bottom"
              cursorGutter={24}
              xGutter={16}
              yGutter={200}
              textStyle={{
                backgroundColor: "#000",
                color: "#fff",
                fontSize: 11,
                padding: 2,
                borderRadius: 2,
              }}
            >
              <LineChart.DatetimeText
                options={{
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "short",
                }}
              />
            </LineChart.Tooltip>
          </LineChart.CursorCrosshair>
        </LineChart>
      </LineChart.Provider>
    </View>
  );
};

const TimeframeRow = ({ active, onChange }: any) => (
  <View className="flex-row justify-between px-4 mt-6">
    {TIMEFRAMES.map((tf) => (
      <Pressable
        key={tf}
        onPress={() => onChange(tf)}
        className={`px-3 py-1 rounded-full ${active === tf ? "" : ""}`}
      >
        <Text
          className={`text-l font-bold ${
            active === tf ? " text-black" : "text-gray-400"
          }`}
        >
          {tf}
        </Text>
      </Pressable>
    ))}
  </View>
);
