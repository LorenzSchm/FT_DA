import React from "react";
import { View, Text, Pressable } from "react-native";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart } from "react-native-wagmi-charts";
import { useAuthStore } from "@/utils/authStore";

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
  hideHeader?: boolean;
  onTimeframeChange?: (tf: TimeframeKey) => void;
  onCursorChange?: (value: number | null, active: boolean) => void;
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
  hideHeader = false,
  onTimeframeChange,
  onCursorChange,
}) => {
  const [timeframe, setTimeframe] =
    React.useState<TimeframeKey>(initialTimeframe);
  const [isCursorActive, setIsCursorActive] = React.useState(false);

  const handleTimeframeChange = React.useCallback(
    (tf: TimeframeKey) => {
      setTimeframe(tf);
      onTimeframeChange?.(tf);
    },
    [onTimeframeChange],
  );
  const cursorValueRef = React.useRef<number | null>(null);
  const [, forceRender] = React.useState(0);
  const { user, session } = useAuthStore();
  console.log(user);
  const userCurrency = (user?.user_metadata?.currency as string) || "EUR";
  const currencySymbolMap: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    CHF: "CHF",
  };
  const currencySymbol = currencySymbolMap[userCurrency] || "€";

  const formatCurrencyValue = React.useCallback(
    (value: number, options: { absolute?: boolean } = {}) => {
      const { absolute = false } = options;
      const numeric = absolute ? Math.abs(value) : value;
      const sign = !absolute && numeric < 0 ? "-" : "";
      const absValue = Math.abs(numeric).toFixed(2);
      const needsSpace = currencySymbol.length > 1 && /[A-Za-z]/.test(currencySymbol);
      const symbolWithSpacing = needsSpace
        ? `${currencySymbol} `
        : currencySymbol;
      return `${sign}${symbolWithSpacing}${absValue}`;
    },
    [currencySymbol],
  );

  const activeData = React.useMemo(
    () => dataByTimeframe[timeframe] ?? [],
    [dataByTimeframe, timeframe],
  );

  const firstValue = activeData[0]?.value ?? 0;
  const lastValue = activeData[activeData.length - 1]?.value ?? firstValue;

  // displayValue is always derived — never stale
  const displayValue =
    isCursorActive && cursorValueRef.current != null
      ? cursorValueRef.current
      : lastValue;

  const diff = displayValue - firstValue;
  const diffPct = firstValue ? (diff / firstValue) * 100 : 0;
  const isUp = diff >= 0;

  if (loading || !activeData.length) {
    return (
      <View className={`rounded-3xl bg-[${backgroundColor}]`}>
        <View className="px-4 pt-4">
          <Skeleton className="h-6 w-40 mb-3 rounded-full" />
          <View className={`h-[${height}]`}>
            <Skeleton className="w-full h-[220px] rounded-2xl" />
          </View>
        </View>
        <TimeframeRow active={timeframe} onChange={handleTimeframeChange} />
        {emptyPlaceholder}
      </View>
    );
  }

  return (
    <View className={`rounded-full bg-[${backgroundColor}]`}>
      {/* ─── Value header ─── */}
      {!hideHeader && (
        <View
          style={{
            paddingHorizontal: 28,
            paddingTop: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <Text
            style={{
              fontSize: 34,
              fontWeight: "800",
              color: "#111827",
              letterSpacing: -1.2,
            }}
          >
            {formatCurrencyValue(displayValue)}
          </Text>

          <View style={{ alignItems: "flex-end" }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: isUp ? "#34d399" : "#fb7185",
                letterSpacing: -0.2,
              }}
            >
              {isUp ? "▲" : "▼"} {isUp ? "+" : ""}
              {formatCurrencyValue(diff, { absolute: true })} ({isUp ? "+" : ""}
              {diffPct.toFixed(2)}%)
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "500",
                color: "#9ca3af",
                marginTop: 2,
              }}
            >
              {timeframe === "ALL" ? "All time" : timeframe}
            </Text>
          </View>
        </View>
      )}

      <View className="px-2">
        <TimeframeRow active={timeframe} onChange={handleTimeframeChange} />
      </View>

      <LineChart.Provider
        key={`${timeframe}-${activeData.length}`}
        data={activeData}
        onCurrentIndexChange={(index) => {
          if (index == null) return;
          const point = activeData[index];
          if (point) {
            cursorValueRef.current = point.value;
            onCursorChange?.(point.value, true);
            forceRender((n) => n + 1);
          }
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
            onActivated={() => {
              setIsCursorActive(true);
              onCursorChange?.(cursorValueRef.current, true);
            }}
            onEnded={() => {
              setIsCursorActive(false);
              cursorValueRef.current = null;
              onCursorChange?.(null, false);
            }}
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
          className={`text-l font-bold ${active === tf ? " text-black" : "text-gray-400"
            }`}
        >
          {tf}
        </Text>
      </Pressable>
    ))}
  </View>
);
