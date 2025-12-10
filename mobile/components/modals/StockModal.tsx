"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { PhantomChart } from "@/components/PhantomChart";
import { useAuthStore } from "@/utils/authStore";
import { getInvestments } from "@/utils/db/invest/invest";
import AddInvestmentModal from "@/components/modals/AddInvestmentModal";
import { ChevronDown } from "lucide-react-native";

type Props = {
  isVisible: boolean;
  onClose: () => void;
  selectedStock: any;
};

export default function StockModal({
  isVisible,
  onClose,
  selectedStock,
}: Props) {
  const [isModalVisible, setIsModalVisible] = useState(isVisible);
  const [history, setHistory] = useState<any | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [myPosition, setMyPosition] = useState<any | null>(null);
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";
  const { session } = useAuthStore();

  const logoCache = useRef<Record<string, string>>({});

  const SCREEN_HEIGHT = Dimensions.get("window").height;
  const sheetPosition = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const iosShadow = {
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  };

  const shadowStyle = Platform.select({
    ios: iosShadow,
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
          Math.abs(gestureState.dy) > 2
        );
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          sheetPosition.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          handleClose();
        } else {
          Animated.spring(sheetPosition, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (isVisible) {
      setIsModalVisible(true);

      Animated.spring(sheetPosition, {
        toValue: 0,
        useNativeDriver: true,
      }).start();

      if (selectedStock?.symbol || selectedStock?.ticker) {
        const sym = selectedStock.symbol ?? selectedStock.ticker;
        fetchHistory(sym);
        fetchMyPosition(sym);
        fetchLogo(sym);
      }
    } else {
      Animated.timing(sheetPosition, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsModalVisible(false);
        setHistory(null);
        setMyPosition(null);
        setLogo(null);
      });
    }
  }, [isVisible, selectedStock]);

  const fetchLogo = async (symbol: string) => {
    try {
      // Check cache first
      if (logoCache.current[symbol]) {
        setLogo(logoCache.current[symbol]);
        return;
      }

      // Fetch price data which includes domain
      const res = await axios.get(`${API_BASE}/stock/${symbol}/price`);
      const domain = res.data?.domain;

      if (domain) {
        const brandResp = await axios.get(
          `https://api.brandfetch.io/v2/search/${domain}`,
        );
        const best =
          brandResp.data.find((b: any) => b.verified) || brandResp.data[0];
        if (best?.icon) {
          logoCache.current[symbol] = best.icon;
          setLogo(best.icon);
        }
      }
    } catch (err) {
      console.error("Logo fetch error:", err);
    }
  };

  const fetchHistory = async (symbol: string) => {
    try {
      setChartLoading(true);

      const res = await axios.get(`${API_BASE}/stock/${symbol}/history`);

      setHistory({
        "1D": res.data["1D"] ?? [],
        "1W": res.data["1W"] ?? [],
        "1M": res.data["1M"] ?? [],
        "1Y": res.data["1Y"] ?? [],
        ALL: res.data["ALL"] ?? [],
      });
    } catch (err) {
      console.error("Chart fetch error:", err);
    } finally {
      setChartLoading(false);
    }
  };

  const fetchMyPosition = async (symbol: string) => {
    try {
      const sym = String(symbol).toUpperCase();
      if (!session?.access_token) return;
      const data = await getInvestments(
        session.access_token,
        session.refresh_token,
      );
      const positions = data?.positions || [];
      const pos = positions.find(
        (p: any) => String(p?.ticker).toUpperCase() === sym,
      );
      if (!pos) {
        setMyPosition(null);
        return;
      }
      const ds = pos?.dates || [];
      const last = ds.length ? ds[ds.length - 1] : null;
      if (!last) {
        setMyPosition(null);
        return;
      }
      setMyPosition({
        shares: Number(last.position_quantity ?? 0),
        total: Number(last.market_value ?? 0),
        pl: Number(last.unrealized_pl ?? 0),
        returnPct: Number(last.unrealized_pl_pct ?? 0),
        currency: pos.currency,
      });
    } catch (e) {
      console.error("fetchMyPosition error", e);
      setMyPosition(null);
    }
  };

  const handleClose = () => {
    Animated.timing(sheetPosition, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
      setShowAddInvestment(false);
      onClose();
    });
  };

  if (!isModalVisible) return null;

  return (
    <>
      <Modal
        animationType="none"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={handleClose}
      >
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }}
            activeOpacity={1}
            onPress={handleClose}
          />

          <Animated.View
            style={{
              transform: [{ translateY: sheetPosition }],
              backgroundColor: "white",
              paddingTop: 24,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              minHeight: SCREEN_HEIGHT,
              ...shadowStyle,
            }}
          >
            <View className={"flex items-center"}>
              <View
                {...panResponder.panHandlers}
                style={{
                  height: 40,
                  marginTop: 30,
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View className={"bg-gray-400 w-[50px] h-[5px] rounded-full"} />
              </View>
            </View>

            <SafeAreaView style={{ flex: 1 }}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                scrollEnabled={true}
              >
                <View>
                  {selectedStock && (
                    <View className="p-4 flex-row items-center">
                      <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4 overflow-hidden">
                        {logo ? (
                          <Image
                            source={{ uri: logo }}
                            className="w-full h-full"
                            resizeMode="contain"
                          />
                        ) : (
                          <Text className="text-3xl font-bold text-orange-600">
                            {
                              (selectedStock.symbol ||
                                selectedStock.ticker ||
                                "?")[0]
                            }
                          </Text>
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="text-2xl font-bold text-black">
                          {selectedStock.longname ||
                            selectedStock.display_name ||
                            selectedStock.symbol}
                        </Text>
                        <Text className="text-gray-500 text-base">
                          {selectedStock.symbol || selectedStock.ticker}
                        </Text>
                      </View>
                    </View>
                  )}

                  {chartLoading ? (
                    <Skeleton className="h-[260px] w-full rounded-2xl" />
                  ) : history ? (
                    <View className="">
                      <PhantomChart dataByTimeframe={history} />
                    </View>
                  ) : (
                    <Text className="text-center text-gray-500 mt-10">
                      No chart data
                    </Text>
                  )}

                  {myPosition && (
                    <View className="px-8 mt-6">
                      <Text className="text-xl font-semibold text-black mb-3">
                        My position
                      </Text>
                      <View className="">
                        <View className="flex-row justify-between mb-3">
                          <Text className=" font-semibold text-gray-500">
                            Total
                          </Text>
                          <Text className="text-black font-extrabold">
                            {myPosition.total.toFixed(2)} {myPosition.currency}
                          </Text>
                        </View>
                        <View className="flex-row justify-between mb-3">
                          <Text className="font-semibold text-gray-500">
                            Return
                          </Text>
                          <Text
                            className={
                              (myPosition.returnPct >= 0
                                ? "text-green-600"
                                : "text-red-600") + " font-semibold"
                            }
                          >
                            {myPosition.returnPct.toFixed(2)}%
                          </Text>
                        </View>
                        <View className="flex-row justify-between mb-3">
                          <Text className="font-semibold text-gray-500">
                            P/L
                          </Text>
                          <Text
                            className={
                              (myPosition.pl >= 0
                                ? "text-green-600"
                                : "text-red-600") + " font-semibold"
                            }
                          >
                            {myPosition.pl.toFixed(2)} {myPosition.currency}
                          </Text>
                        </View>
                        <View className="flex-row justify-between">
                          <Text className="font-semibold text-gray-500">
                            Shares
                          </Text>
                          <Text className="text-black font-medium">
                            {myPosition.shares}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              </ScrollView>
            </SafeAreaView>
            <View
              style={{ position: "absolute", bottom: 50, right: 20 }}
              pointerEvents="box-none"
            >
              <TouchableOpacity
                onPress={() => {
                  setShowAddInvestment(true);
                }}
                activeOpacity={0.9}
                style={{
                  backgroundColor: "black",
                  width: 160,
                  paddingVertical: 16,
                  borderRadius: 9999,
                }}
              >
                <View
                  style={{ alignItems: "center", justifyContent: "center" }}
                >
                  <Text
                    style={{ color: "white", fontSize: 24, fontWeight: "600" }}
                  >
                    Add +
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>
          <AddInvestmentModal
            isVisible={showAddInvestment}
            onClose={() => setShowAddInvestment(false)}
            selectedStock={selectedStock}
          />
        </View>
      </Modal>
    </>
  );
}
