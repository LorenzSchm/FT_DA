import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { getInvestments } from "@/utils/db/invest/invest";
import { useAuthStore } from "@/utils/authStore";
import StockModal from "@/components/modals/StockModal";
import SearchInvestmentsModal from "@/components/modals/SearchInvestmentsModal";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Skeleton } from "@/components/ui/skeleton";
import { PhantomChart } from "@/components/PhantomChart";
import axios from "axios";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

export function InvestmentView() {
  const { session } = useAuthStore();
  const [positions, setPositions] = useState<any[]>([]);
  const [value, setValue] = useState("");
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

  useEffect(() => {
    const fetchpositions = async () => {
      try {
        setPositionsLoading(true);
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
        let total = 0;
        (posData || []).forEach((p: any) => {
          const ds = p?.dates || [];
          if (ds.length > 0) {
            const last = ds[ds.length - 1];
            total += Number(last.market_value ?? 0);
          }
        });
        setValue(total.toFixed(2));

        const vals = (posData || []).map((p: any) => {
          const ds = p?.dates || [];
          const last = ds.length ? ds[ds.length - 1] : null;
          // Prefer backend-provided market_value snapshot; fallback to price * quantity if needed
          const fallbackQty =
            Number(p?.quantity ?? last?.position_quantity ?? 0) || 0;
          const fallbackPrice =
            Number(p?.current_price ?? last?.current_price ?? 0) || 0;
          const currentValue = Number(
            (last?.market_value ?? fallbackQty * fallbackPrice) as number,
          );
          return {
            ticker: p.ticker,
            value: Number.isFinite(currentValue) ? currentValue : 0,
          };
        });
        setPositionValues(vals);
        try {
        } catch {}
      } catch (error) {
        console.error("Error fetching positions:", error);
      } finally {
        setPositionsLoading(false);
      }
    };
    fetchpositions();
  }, [session?.access_token, session?.refresh_token]);

  useEffect(() => {
    let active = true;
    const buildCombinedHistory = async () => {
      if (!positions || positions.length === 0) {
        setPortfolioHistory(null);
        return;
      }
      try {
        setChartLoading(true);
        type QtyStep = { ts: number; qty: number };
        const qtyStepsByTicker: Record<string, QtyStep[]> = {};
        const qtyStepsByTickerEOD: Record<string, QtyStep[]> = {};
        const firstTradeTsByTicker: Record<string, number> = {};
        const uniqueTickers = Array.from(
          new Set((positions || []).map((p: any) => p?.ticker)),
        );
        (positions || []).forEach((p: any) => {
          const ticker = p?.ticker;
          const ds: any[] = p?.dates || [];
          const steps: QtyStep[] = ds
            .filter((d) => d?.date)
            .map((d, idx) => {
              const base = Date.parse(`${d.date}T00:00:00Z`);
              const ts = isNaN(base) ? Date.now() : base + idx; // preserve order for same-day trades
              const qty = Number(d.position_quantity ?? 0);
              return { ts, qty };
            })
            .sort((a, b) => a.ts - b.ts);
          qtyStepsByTicker[ticker] = steps;
          if (steps.length > 0) firstTradeTsByTicker[ticker] = steps[0].ts;

          const stepsEOD: QtyStep[] = ds
            .filter((d) => d?.date)
            .map((d, idx) => {
              const base = Date.parse(`${d.date}T23:59:59Z`);
              const ts = isNaN(base) ? Date.now() : base + idx;
              const qty = Number(d.position_quantity ?? 0);
              return { ts, qty };
            })
            .sort((a, b) => a.ts - b.ts);
          qtyStepsByTickerEOD[ticker] = stepsEOD;
        });

        const qtyAt = (steps: QtyStep[], ts: number) => {
          if (!steps || steps.length === 0) return 0;
          let lo = 0,
            hi = steps.length - 1,
            ans = -1;
          while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            if (steps[mid].ts <= ts) {
              ans = mid;
              lo = mid + 1;
            } else hi = mid - 1;
          }
          return ans >= 0 ? Number(steps[ans].qty || 0) : 0;
        };

        type HistoryResp = Record<TimeframeKey, Point[]>;
        const historyByTicker: Record<string, HistoryResp> = {};
        await Promise.all(
          uniqueTickers.map(async (ticker) => {
            try {
              const res = await fetch(`${API_BASE}/stock/${ticker}/history`);
              if (!res.ok) return;
              const data = (await res.json()) as HistoryResp;
              historyByTicker[ticker] = data;
            } catch (e) {
              console.error(`History fetch failed for ${ticker}:`, e);
            }
          }),
        );

        const tfs: TimeframeKey[] = ["ALL", "1Y", "1M", "1W", "1D"];
        const combinedMaps: Record<TimeframeKey, Map<number, number>> = {
          ALL: new Map(),
          "1Y": new Map(),
          "1M": new Map(),
          "1W": new Map(),
          "1D": new Map(),
        };

        tfs.forEach((tf) => {
          const unionSet = new Set<number>();
          uniqueTickers.forEach((ticker) => {
            const hist = historyByTicker[ticker];
            if (!hist) return;
            for (const pt of hist[tf] || []) {
              unionSet.add(pt.timestamp);
            }
          });
          const unionTimestamps = Array.from(unionSet).sort((a, b) => a - b);

          const perTicker = uniqueTickers.map((ticker) => {
            const hist = historyByTicker[ticker];
            const list = hist && hist[tf] ? hist[tf] : [];
            const steps = qtyStepsByTicker[ticker] || [];
            const firstTs =
              firstTradeTsByTicker[ticker] ?? Number.POSITIVE_INFINITY;
            return {
              ticker,
              list,
              idx: 0,
              lastPrice: undefined as number | undefined,
              steps,
              firstTs,
            };
          });

          const out = combinedMaps[tf];
          for (const ts of unionTimestamps) {
            let sum = 0;
            let contributed = false;
            for (const state of perTicker) {
              const { list, steps, firstTs } = state;
              while (
                state.idx < list.length &&
                list[state.idx].timestamp <= ts
              ) {
                const v = list[state.idx].value;
                if (Number.isFinite(v as number)) state.lastPrice = Number(v);
                state.idx++;
              }
              if (!Number.isFinite(state.lastPrice as number)) continue;
              if (ts < firstTs) continue;
              const q = qtyAt(steps, ts);
              if (!q) continue;
              sum += (state.lastPrice as number) * q;
              contributed = true;
            }
            // Only record points where at least one ticker contributed a value
            if (contributed && Number.isFinite(sum)) out.set(ts, sum);
          }
        });

        const globalFirstTs = (() => {
          const vals = Object.values(firstTradeTsByTicker || {}).filter((v) =>
            Number.isFinite(v),
          ) as number[];
          if (!vals.length) return Number.POSITIVE_INFINITY;
          return Math.min(...vals);
        })();

        const toArray = (m: Map<number, number>): Point[] =>
          Array.from(m.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([timestamp, value]) => ({ timestamp, value }));

        const trimSeries = (arr: Point[]): Point[] => {
          if (!arr || arr.length === 0) return arr;
          let out = arr.filter((p) => p.timestamp >= globalFirstTs);
          let i = 0;
          while (
            i < out.length &&
            (!Number.isFinite(out[i].value) || out[i].value <= 0)
          ) {
            i++;
          }
          out = out.slice(i);
          return out;
        };

        const combined: HistoryMap = {
          ALL: trimSeries(toArray(combinedMaps.ALL)),
          "1Y": trimSeries(toArray(combinedMaps["1Y"])),
          "1M": trimSeries(toArray(combinedMaps["1M"])),
          "1W": trimSeries(toArray(combinedMaps["1W"])),
          "1D": trimSeries(toArray(combinedMaps["1D"])),
        };
        if (!active) return;
        setPortfolioHistory(combined);
      } catch (e) {
        console.error("Error building portfolio history:", e);
      } finally {
        if (!active) return;
        setChartLoading(false);
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
      <View>
        {chartLoading ? (
          <View className={"px-8"}>
            <Skeleton className="h-[260px] rounded-2xl" />
          </View>
        ) : portfolioHistory ? (
          <PhantomChart dataByTimeframe={portfolioHistory as any} />
        ) : (
          <View className={"px-8"}>
            <Skeleton className="h-[260px] rounded-2xl" />
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
      />
      <SearchInvestmentsModal
        isVisible={showAddInvestmentModal}
        onClose={() => setShowAddInvestmentModal(false)}
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
