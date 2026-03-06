import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  Image,
  ScrollView,
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
import axios from "axios";

// Base URL for backend API
const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

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
        } catch { }
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
          const { price, weekly_change, logo, longname } =
            await fetchStockData(p.ticker);
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

            if (hasContribution && Number.isFinite(totalValue) && totalValue > 0) {
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

  const Logo = ({ symbol }: { symbol: string }) => {
    const logo = logoCache.current[symbol];
    return (
      <View className="w-10 h-10 items-center justify-center mr-4 overflow-hidden ">
        {logo ? (
          <Image
            source={{ uri: logo }}
            className="w-full h-full"
            resizeMode="contain"
          />
        ) : (
          <Text className="text-3xl font-bold text-orange-600">
            {symbol[0]}
          </Text>
        )}
      </View>
    );
  };
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="pt-4">
        {chartLoading ? (
          <View className="px-8">
            <Skeleton className="h-[220px] w-full rounded-2xl" />
          </View>
        ) : portfolioHistory ? (
          <PhantomChart dataByTimeframe={portfolioHistory as any} />
        ) : (
          <View className="px-8">
            <Skeleton className="h-[220px] w-full rounded-2xl" />
          </View>
        )}
      </View>
      <View className="px-8">
        <View>
          <Text className="text-2xl font-bold mb-2">Investments</Text>
          {positionsLoading ? (
            <View className="gap-3">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </View>
          ) : positions.length === 0 ? (
            <View className="items-center py-6">
              <Text className="text-gray-400">No investments yet</Text>
            </View>
          ) : (
            <ScrollView className=" h-60" showsVerticalScrollIndicator={false}>
              {positions.map((item) => (
                <Pressable key={item.ticker} onPress={() => openModal(item)}>
                  <View className="flex-row justify-between items-center py-3">
                    <View className="flex-row items-center">
                      <Logo symbol={item.ticker} />
                      <View>
                        <Text className="text-lg font-bold">{item.ticker}</Text>
                        <Text className="font-semibold text-gray-500">
                          $
                          {(() => {
                            const found = positionValues.find(
                              (v) => v.ticker === item.ticker,
                            );
                            const val = found?.value ?? 0;
                            return Number(val).toFixed(2);
                          })()}
                        </Text>
                      </View>
                    </View>
                    {/* Unrealized P/L */}
                    <View className="items-end">
                      <Text
                        className={`text-lg font-bold ${(item.unrealized_pl ?? 0) >= 0
                          ? "text-green-500"
                          : "text-red-500"
                          }`}
                      >
                        {(item.unrealized_pl ?? 0) >= 0 ? "+" : "-"}$
                        {Math.abs(Number(item.unrealized_pl ?? 0)).toFixed(2)}
                      </Text>
                      <Text
                        className={`font-semibold ${(item.unrealized_pl_pct ?? 0) >= 0
                          ? "text-green-500"
                          : "text-red-500"
                          }`}
                      >
                        {(item.unrealized_pl_pct ?? 0) >= 0 ? "+" : ""}
                        {Number(item.unrealized_pl_pct ?? 0).toFixed(2)}%
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
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
      <View className="absolute bottom-12 right-5">
        <TouchableOpacity
          onPress={() => setShowAddInvestmentModal(true)}
          activeOpacity={0.9}
          className={`${"bg-black w-40 py-4 rounded-full"}`}
        >
          <View className="items-center justify-center">
            <Text className="text-white text-3xl font-semibold">Add +</Text>
          </View>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
}
