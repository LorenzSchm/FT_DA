import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { getInvestments } from "@/utils/db/invest/invest";
import { useAuthStore } from "@/utils/authStore";
import StockModal from "@/components/modals/StockModal";
import SearchInvestmentsModal from "@/components/modals/SearchInvestmentsModal";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Skeleton } from "@/components/ui/skeleton";
import { PhantomChart } from "@/components/PhantomChart";
import { invalidateCache } from "@/utils/db/cache";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";

// Base URL for backend API
const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

/* ─── Color tokens ─── */
const COLORS = {
  positive: "#34d399",
  positiveMuted: "rgba(52,211,153,0.10)",
  negative: "#fb7185",
  negativeMuted: "rgba(251,113,133,0.10)",
  textPrimary: "#111827",
  textSecondary: "#6b7280",
  textTertiary: "#9ca3af",
  cardBg: "#ffffff",
  cardBorder: "rgba(0,0,0,0.04)",
  surface: "#f9fafb",
};

export function InvestmentView() {
  const { session } = useAuthStore();
  const [positions, setPositions] = useState<any[]>([]);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showAddInvestmentModal, setShowAddInvestmentModal] = useState(false);

  type Point = { timestamp: number; value: number };
  type TimeframeKey = "1D" | "1W" | "1M" | "1Y" | "ALL";
  type HistoryMap = Record<TimeframeKey, Point[]>;
  const [portfolioHistory, setPortfolioHistory] = useState<HistoryMap | null>(
    null,
  );
  const [chartLoading, setChartLoading] = useState(false);
  const [positionsLoading, setPositionsLoading] = useState(false);
  const [positionValues, setPositionValues] = useState<
    { ticker: string; value: number }[]
  >([]);

  const openModal = (item: any) => {
    setSelectedStock(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedStock(null);
  };
  const logoCache = useRef<Record<string, string>>({});

  const fetchStockData = async (symbol: string) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/stock/${symbol}/price`,
      );
      const { price, weekly_change, domain, longname } = res.data;
      let logo = logoCache.current[symbol];
      if (!logo && domain) {
        try {
          const brandResp = await axios.get(
            `https://api.brandfetch.io/v2/search/${domain}`,
          );
          const best =
            brandResp.data.find((b: any) => b.verified) || brandResp.data[0];
          if (best?.icon) {
            logo = best.icon;
            logoCache.current[symbol] = logo;
          }
        } catch {}
      }
      return { price, weekly_change, logo, longname };
    } catch {
      return {
        price: undefined,
        weekly_change: undefined,
        logo: undefined,
        longname: undefined,
      };
    }
  };

  const reloadPositions = useCallback(async () => {
    try {
      setPositionsLoading(true);
      invalidateCache("/investments/");
      const pos = await getInvestments(
        session?.access_token,
        session?.refresh_token,
      );
      const posData = await Promise.all(
        (pos?.positions || []).map(async (p: any) => {
          const { price, weekly_change, logo, longname } = await fetchStockData(
            p.ticker,
          );
          return { ...p, price, weekly_change, logo, longname };
        }),
      );
      setPositions(posData);

      const vals = (posData || []).map((p: any) => {
        const currentValue = Number(p?.market_value ?? 0);
        return {
          ticker: p.ticker,
          value: Number.isFinite(currentValue) ? currentValue : 0,
        };
      });
      setPositionValues(vals);
    } catch (error) {
      console.error("Error fetching positions:", error);
    } finally {
      setPositionsLoading(false);
    }
  }, [session?.access_token, session?.refresh_token]);

  useEffect(() => {
    reloadPositions();
  }, [reloadPositions]);

  useEffect(() => {
    let active = true;
    const buildCombinedHistory = async () => {
      if (!positions || positions.length === 0) {
        setPortfolioHistory(null);
        return;
      }
      try {
        setChartLoading(true);

        const uniqueTickers = Array.from(
          new Set((positions || []).map((p: any) => p?.ticker)),
        );

        // Build trade events per ticker: sorted list of { tsMs, runningQty, costBasis }
        const tradeInfoByTicker: Record<
          string,
          {
            firstTradeMs: number;
            events: { tsMs: number; runningQty: number; costBasis: number }[];
          }
        > = {};

        for (const p of positions) {
          const ticker = p?.ticker;
          const ds: any[] = p?.dates || [];
          const events = ds
            .filter((d: any) => d?.date)
            .map((d: any) => {
              const tsMs = Date.parse(`${d.date}T00:00:00Z`);
              return {
                tsMs: isNaN(tsMs) ? Date.now() : tsMs,
                runningQty: Math.max(Number(d.position_quantity ?? 0), 0),
                costBasis: Number(d.cost_basis ?? 0),
              };
            })
            .sort((a, b) => a.tsMs - b.tsMs);

          tradeInfoByTicker[ticker] = {
            firstTradeMs: events.length > 0 ? events[0].tsMs : Infinity,
            events,
          };
        }

        // Helper: get running quantity at a given timestamp for a ticker
        const getQtyAt = (ticker: string, tsMs: number): number => {
          const info = tradeInfoByTicker[ticker];
          if (!info || info.events.length === 0) return 0;
          if (tsMs < info.firstTradeMs) return 0;
          let qty = 0;
          for (const evt of info.events) {
            if (evt.tsMs <= tsMs) {
              qty = evt.runningQty;
            } else {
              break;
            }
          }
          return qty;
        };

        // Helper: get total cost basis across all tickers at their first trade
        const getTotalCostBasis = (): number => {
          let total = 0;
          for (const ticker of uniqueTickers) {
            const info = tradeInfoByTicker[ticker];
            if (!info || info.events.length === 0) continue;
            // Use the latest cost basis (after all trades)
            const lastEvent = info.events[info.events.length - 1];
            total += lastEvent.costBasis;
          }
          return total;
        };

        // Fetch stock price history for each ticker
        type HistoryResp = Record<TimeframeKey, Point[]>;
        const historyByTicker: Record<string, HistoryResp> = {};
        await Promise.all(
          uniqueTickers.map(async (ticker) => {
            try {
              const res = await fetch(`${API_BASE}/stock/${ticker}/history`);
              if (!res.ok) return;
              historyByTicker[ticker] = (await res.json()) as HistoryResp;
            } catch (e) {
              console.error(`History fetch failed for ${ticker}:`, e);
            }
          }),
        );

        const tfs: TimeframeKey[] = ["1D", "1W", "1M", "1Y", "ALL"];
        const combined: HistoryMap = {
          "1D": [],
          "1W": [],
          "1M": [],
          "1Y": [],
          ALL: [],
        };

        // Get earliest trade timestamp and total cost basis for the anchor point
        const earliestTradeMs = Math.min(
          ...uniqueTickers.map(
            (t) => tradeInfoByTicker[t]?.firstTradeMs ?? Infinity,
          ),
        );
        const totalCostBasis = getTotalCostBasis();

        for (const tf of tfs) {
          // Collect all unique timestamps across all tickers for this timeframe
          const allTimestamps = new Set<number>();
          for (const ticker of uniqueTickers) {
            const hist = historyByTicker[ticker];
            if (!hist || !hist[tf]) continue;
            for (const pt of hist[tf]) {
              allTimestamps.add(pt.timestamp);
            }
          }

          const sortedTimestamps = Array.from(allTimestamps).sort(
            (a, b) => a - b,
          );

          // For each ticker, build a map of timestamp -> price for quick lookup
          const priceMaps: Record<string, Map<number, number>> = {};
          const lastKnownPrice: Record<string, number> = {};

          for (const ticker of uniqueTickers) {
            const hist = historyByTicker[ticker];
            const map = new Map<number, number>();
            if (hist && hist[tf]) {
              for (const pt of hist[tf]) {
                if (Number.isFinite(pt.value)) {
                  map.set(pt.timestamp, pt.value);
                }
              }
            }
            priceMaps[ticker] = map;
            lastKnownPrice[ticker] = 0;
          }

          // Start with cost basis as the anchor/first point
          const points: Point[] = [];
          if (totalCostBasis > 0 && Number.isFinite(earliestTradeMs)) {
            points.push({
              timestamp: earliestTradeMs,
              value: Math.round(totalCostBasis * 100) / 100,
            });
          }

          // Walk through timestamps and compute portfolio value
          for (const ts of sortedTimestamps) {
            // Skip timestamps before the first trade
            if (ts < earliestTradeMs) continue;

            let totalValue = 0;
            let hasContribution = false;

            for (const ticker of uniqueTickers) {
              // Update last known price if this timestamp has a price
              const priceAtTs = priceMaps[ticker].get(ts);
              if (priceAtTs !== undefined) {
                lastKnownPrice[ticker] = priceAtTs;
              }

              const price = lastKnownPrice[ticker];
              if (!price) continue;

              const qty = getQtyAt(ticker, ts);
              if (qty <= 0) continue;

              totalValue += price * qty;
              hasContribution = true;
            }

            if (
              hasContribution &&
              Number.isFinite(totalValue) &&
              totalValue > 0
            ) {
              points.push({
                timestamp: ts,
                value: Math.round(totalValue * 100) / 100,
              });
            }
          }

          // Append current portfolio value as the final point
          const currentValue = (positions || []).reduce(
            (sum: number, p: any) => sum + Number(p?.market_value ?? 0),
            0,
          );
          if (currentValue > 0 && points.length > 0) {
            const now = Date.now();
            const lastTs = points[points.length - 1].timestamp;
            if (now > lastTs) {
              points.push({
                timestamp: now,
                value: Math.round(currentValue * 100) / 100,
              });
            } else {
              points[points.length - 1].value =
                Math.round(currentValue * 100) / 100;
            }
          } else if (currentValue > 0 && points.length === 0) {
            points.push({
              timestamp: Date.now(),
              value: Math.round(currentValue * 100) / 100,
            });
          }

          combined[tf] = points;
        }

        // Fallback: if a longer timeframe has ≤2 points, use data from shorter timeframe
        const fallbackOrder: TimeframeKey[] = ["1D", "1W", "1M", "1Y", "ALL"];
        for (let i = 1; i < fallbackOrder.length; i++) {
          const tf = fallbackOrder[i];
          if (combined[tf].length <= 2) {
            // Find the best shorter timeframe with enough data
            for (let j = i - 1; j >= 0; j--) {
              if (combined[fallbackOrder[j]].length > 2) {
                combined[tf] = combined[fallbackOrder[j]];
                break;
              }
            }
          }
        }

        if (!active) return;
        setPortfolioHistory(combined);
      } catch (e) {
        console.error("Error building portfolio history:", e);
      } finally {
        if (active) {
          setChartLoading(false);
        }
      }
    };
    buildCombinedHistory();
    return () => {
      active = false;
    };
  }, [positions]);

  /* ─── Computed portfolio aggregates ─── */
  const totalPortfolioValue = positionValues.reduce((s, v) => s + v.value, 0);
  const totalUnrealizedPl = positions.reduce(
    (s, p) => s + Number(p.unrealized_pl ?? 0),
    0,
  );
  const totalCostBasis = positions.reduce(
    (s, p) => s + Number(p.cost_basis ?? 0),
    0,
  );
  const totalPlPct =
    totalCostBasis > 0 ? (totalUnrealizedPl / totalCostBasis) * 100 : 0;
  const isPortfolioUp = totalUnrealizedPl >= 0;

  /* ─── Logo renderer ─── */
  const Logo = ({ symbol }: { symbol: string }) => {
    const logo = logoCache.current[symbol];
    return (
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: logo ? "#f4f4f5" : undefined,
          borderWidth: logo ? 0 : 0,
        }}
      >
        {logo ? (
          <Image
            source={{ uri: logo }}
            style={{ width: 44, height: 44 }}
            resizeMode="contain"
          />
        ) : (
          <LinearGradient
            colors={["#1e1e1e", "#2d2d2d"]}
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: "rgba(255,255,255,0.8)",
                letterSpacing: 0.5,
              }}
            >
              {symbol.slice(0, 2)}
            </Text>
          </LinearGradient>
        )}
      </View>
    );
  };

  /* ─── Position row skeleton ─── */
  const PositionSkeleton = () => (
    <View
      style={{
        backgroundColor: COLORS.cardBg,
        borderRadius: 18,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Skeleton className="w-11 h-11 rounded-[14px] mr-3" />
        <View style={{ flex: 1 }}>
          <Skeleton className="h-4 w-16 mb-2 rounded-md" />
          <Skeleton className="h-3 w-24 rounded-md" />
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Skeleton className="h-4 w-20 mb-2 rounded-md" />
          <Skeleton className="h-3 w-14 rounded-md" />
        </View>
      </View>
    </View>
  );

  const [chartAreaHeight, setChartAreaHeight] = useState(0);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        stickyHeaderIndices={[0, 2]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{
          paddingBottom: Math.max(chartAreaHeight, 120),
        }}
      >
        {/* ─── Sticky value header (index 0) ─── */}
        <View
          style={{
            backgroundColor: "#fff",
            paddingHorizontal: 28,
            paddingTop: 16,
            paddingBottom: 8,
          }}
        >
          {positionsLoading || chartLoading ? (
            <View>
              <Skeleton className="h-9 w-40 rounded-lg mb-2" />
              <Skeleton className="h-4 w-28 rounded-md" />
            </View>
          ) : (
            <>
              <Text
                style={{
                  fontSize: 34,
                  fontWeight: "800",
                  color: "#111827",
                  letterSpacing: -1.2,
                }}
              >
                ${totalPortfolioValue.toFixed(2)}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 4,
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: isPortfolioUp ? "#34d399" : "#fb7185",
                    letterSpacing: -0.2,
                  }}
                >
                  {isPortfolioUp ? "▲" : "▼"} {isPortfolioUp ? "+" : ""}
                  {totalUnrealizedPl.toFixed(2)} ({isPortfolioUp ? "+" : ""}
                  {totalPlPct.toFixed(2)}%)
                </Text>
                <Text
                  style={{ fontSize: 13, fontWeight: "500", color: "#9ca3af" }}
                >
                  Total return
                </Text>
              </View>
            </>
          )}
        </View>

        {/* ─── Chart area ─── */}
        <View onLayout={(e) => setChartAreaHeight(e.nativeEvent.layout.height)}>
          {chartLoading ? (
            <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
              <Skeleton className="h-[220px] w-full rounded-2xl" />
            </View>
          ) : portfolioHistory ? (
            <PhantomChart
              dataByTimeframe={portfolioHistory as any}
              hideHeader
            />
          ) : (
            <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
              <Skeleton className="h-[220px] w-full rounded-2xl" />
            </View>
          )}
        </View>

        {/* ─── Sticky holdings header (index 2) ─── */}
        <View
          style={{
            backgroundColor: "#fff",
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: COLORS.textPrimary,
              letterSpacing: -0.3,
            }}
          >
            Holdings
          </Text>
        </View>

        {/* ─── Holdings list (index 3) ─── */}
        <View style={{ paddingHorizontal: 24 }}>
          {/* Positions list (flat — no nested ScrollView) */}
          {positionsLoading ? (
            <View>
              <PositionSkeleton />
              <PositionSkeleton />
              <PositionSkeleton />
            </View>
          ) : positions.length === 0 ? (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 48,
              }}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: COLORS.surface,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 28 }}>📈</Text>
              </View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: COLORS.textSecondary,
                  marginBottom: 4,
                }}
              >
                No investments yet
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: COLORS.textTertiary,
                }}
              >
                Tap "Add +" to start tracking your portfolio
              </Text>
            </View>
          ) : (
            positions.map((item, index) => {
              const pl = Number(item.unrealized_pl ?? 0);
              const plPct = Number(item.unrealized_pl_pct ?? 0);
              const isUp = pl >= 0;
              const marketVal =
                positionValues.find((v) => v.ticker === item.ticker)?.value ??
                0;

              return (
                <Pressable
                  key={item.ticker}
                  onPress={() => openModal(item)}
                  style={({ pressed }) => ({
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                    opacity: pressed ? 0.85 : 1,
                  })}
                >
                  <View
                    style={{
                      backgroundColor: COLORS.cardBg,
                      borderRadius: 18,
                      padding: 14,
                      marginBottom: 10,
                      borderWidth: 1,
                      borderColor: COLORS.cardBorder,
                      flexDirection: "row",
                      alignItems: "center",
                      ...Platform.select({
                        ios: {
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.04,
                          shadowRadius: 8,
                        },
                        android: { elevation: 2 },
                      }),
                    }}
                  >
                    {/* Logo */}
                    <View style={{ marginRight: 12 }}>
                      <Logo symbol={item.ticker} />
                    </View>

                    {/* Ticker + Value */}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: COLORS.textPrimary,
                          letterSpacing: -0.2,
                        }}
                      >
                        {item.ticker}
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "500",
                          color: COLORS.textTertiary,
                          marginTop: 2,
                        }}
                        numberOfLines={1}
                      >
                        {item.longname || `$${Number(marketVal).toFixed(2)}`}
                      </Text>
                    </View>

                    {/* P/L column */}
                    <View style={{ alignItems: "flex-end" }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: isUp ? COLORS.positive : COLORS.negative,
                          letterSpacing: -0.2,
                        }}
                      >
                        {isUp ? "+" : "−"}${Math.abs(pl).toFixed(2)}
                      </Text>
                      <View
                        style={{
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 6,
                          marginTop: 3,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "700",
                            color: isUp ? COLORS.positive : COLORS.negative,
                          }}
                        >
                          {isUp ? "+" : ""}
                          {plPct.toFixed(2)}%
                        </Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* ─── Modals ─── */}
      <StockModal
        isVisible={modalVisible}
        onClose={closeModal}
        selectedStock={selectedStock}
        onInvestmentAdded={async () => {
          setModalVisible(false);
          setSelectedStock(null);
          setShowAddInvestmentModal(false);
          await reloadPositions();
        }}
      />
      <SearchInvestmentsModal
        isVisible={showAddInvestmentModal}
        onClose={() => setShowAddInvestmentModal(false)}
        onInvestmentAdded={async () => {
          setShowAddInvestmentModal(false);
          setModalVisible(false);
          setSelectedStock(null);
          await reloadPositions();
        }}
      />

      {/* ─── Floating Add button ─── */}
      <View style={{ position: "absolute", bottom: 48, right: 20 }}>
        <TouchableOpacity
          onPress={() => setShowAddInvestmentModal(true)}
          activeOpacity={0.9}
          style={{
            backgroundColor: "#000",
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 9999,
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
              },
              android: { elevation: 8 },
            }),
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "700",
              letterSpacing: -0.3,
            }}
          >
            Add +
          </Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
}
