import React from "react";
import { View, Text, Pressable } from "react-native";
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
  lineColor?: string;
  showAmount?: boolean;
};

const TIMEFRAMES: TimeframeKey[] = ["1D", "1W", "1M", "1Y", "ALL"];

export const PhantomChart: React.FC<Props> = ({
  dataByTimeframe,
  initialTimeframe = "ALL",
  height = 220,
  positiveColor = "#16a34a",
  negativeColor = "#dc2626",
  backgroundColor = "#FFFFFF",
  lineColor = "#000000",
  showAmount = true,
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

  if (!activeData.length) {
    return (
      <View className={`rounded-3xl bg-[${backgroundColor}]`}>
        <Text className="text-gray-400 text-sm text-center py-4">
          No data for {timeframe}
        </Text>
        <TimeframeRow active={timeframe} onChange={setTimeframe} />
      </View>
    );
  }

  return (
    <View className={`rounded-full bg-[${backgroundColor}]`}>
      {showAmount && (
        <View>
          <View className="flex-row justify-between items-center px-4 pt-4">
            <Text className="text-2xl font-semibold text-black">
              {displayValue.toFixed(2)} €
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

          <Text className="text-gray-500 text-xs px-4 mt-1">
            {timeframe} · {isUp ? "Performance" : "Loss"}
          </Text>
        </View>
      )}

      <TimeframeRow active={timeframe} onChange={setTimeframe} />

      <LineChart.Provider
        data={activeData}
        onCurrentIndexChange={(index) => {
          if (index == null) return;
          const point = activeData[index];
          if (point) setDisplayValue(point.value);
        }}
      >
        <LineChart height={height} className="mt-6">
          <LineChart.Path color={lineColor} width={2} />

          <LineChart.CursorCrosshair
            color={lineColor}
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
