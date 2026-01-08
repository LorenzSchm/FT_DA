import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import StockModal from "@/components/modals/StockModal";
import { useAuthStore } from "@/utils/authStore";
import { getInvestments } from "@/utils/db/invest/invest";
import { Search, Triangle, X } from "lucide-react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function AddInvestmentView() {
  const [trending, setTrending] = useState<any[]>([]);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [positions, setPositions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { session } = useAuthStore();
  const logoCache = useRef<Record<string, string>>({});
  const inputRef = useRef<TextInput | null>(null);
  const { width } = useWindowDimensions();
  const expandedWidth = width - 32;
  const FMP_API_KEY = process.env.EXPO_PUBLIC_FMP_API_KEY;

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleCloseSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    inputRef.current?.blur();
  };

  const openModal = (item: any) => {
    setSelectedStock(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedStock(null);
  };

  const fetchStockData = useCallback(
    async (symbol: string) => {
      try {
        const res = await axios.get(
          `http://localhost:8000/stock/${symbol}/price`,
        );

        let { price, weekly_change, domain, longname } = res.data;
        let logo = logoCache.current[symbol];

        if (!logo && domain) {
          try {
            // Try brandfetch API first
            const brandResp = await axios.get(
              `https://api.brandfetch.io/v2/search/${domain}`,
            );
            const best =
              brandResp.data.find((b: any) => b.verified) || brandResp.data[0];
            if (best?.icon) {
              logo = best.icon;
              logoCache.current[symbol] = logo;
            }
          } catch {
            // Fallback to FMP API if brandfetch fails
            try {
              if (FMP_API_KEY) {
                const fmpResp = await axios.get(
                  `https://financialmodelingprep.com/stable/profile?symbol=${symbol}&apikey=${FMP_API_KEY}`,
                );
                const brandInformation = fmpResp.data[0];
                if (brandInformation && brandInformation.image) {
                  logo = brandInformation.image;
                  logoCache.current[symbol] = logo;
                }
                if (
                  !longname &&
                  brandInformation &&
                  brandInformation.companyName
                ) {
                  longname = brandInformation.companyName;
                }
              }
            } catch (fmpError) {
              console.error(
                `Error fetching logo from FMP for ${symbol}:`,
                fmpError,
              );
            }
          }
        }

        return { price, weekly_change, logo, longname };
      } catch (error) {
        console.error(`Error fetching stock data for ${symbol}:`, error);
        return {
          price: undefined,
          weekly_change: undefined,
          logo: undefined,
          longname: undefined,
        };
      }
    },
    [FMP_API_KEY],
  );

  // Initial load
  useEffect(() => {
    const load = async () => {
      setInitialLoading(true);
      const trendResp = await axios.get(
        "https://query1.finance.yahoo.com/v1/finance/trending/US",
      );
      const quotes =
        trendResp.data.finance?.result?.[0]?.quotes.slice(0, 10) || [];
      console.log(trendResp.data.finance.result[0].quotes);
      const trendData = await Promise.all(
        quotes.map(async (q: any) => {
          const { price, weekly_change, logo, longname } = await fetchStockData(
            q.symbol,
          );
          return { ...q, price, weekly_change, logo, longname };
        }),
      );
      setTrending(trendData);
      // Positions
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
      setInitialLoading(false);
    };
    load();
  }, [session?.access_token, session?.refresh_token, fetchStockData]);

  // Search
  useEffect(() => {
    let active = true;
    const search = async () => {
      const q = searchQuery.trim();
      if (!q) {
        setSearchResults([]);
        return;
      }
      setSearchLoading(true);
      const resp = await axios.get(
        `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}`,
      );
      const quotes = resp.data?.quotes ?? [];
      const limited = quotes.filter((q: any) => q.symbol).slice(0, 10);
      const results = await Promise.all(
        limited.map(async (item: any) => {
          const { price, weekly_change, logo, longname } = await fetchStockData(
            item.symbol,
          );
          return { ...item, price, weekly_change, logo, longname };
        }),
      );
      if (active) setSearchResults(results);
      setSearchLoading(false);
    };
    const t = setTimeout(search, 400);
    return () => {
      clearTimeout(t);
      active = false;
    };
  }, [searchQuery, fetchStockData]);

  const isSearching = searchQuery.trim().length > 0;

  // Logo renderer
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
    <View className="flex-1">
      <View
        style={{ width: expandedWidth, alignSelf: "center" }}
        className="bg-[#F1F1F2] mb-6 h-[42px] rounded-full flex-row items-center px-4 self-center"
      >
        <Search size={20} color="#9FA1A4" />
        <TextInput
          ref={inputRef}
          placeholder="Search"
          className="bg-transparent ml-2 text-2xl text-black flex-1"
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={handleCloseSearch}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <X size={20} color="#9FA1A4" />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView className="flex-1 bg-white p-7">
        {isSearching ? (
          <View>
            <Text className="text-2xl font-bold mb-5">
              Results ({searchResults.length})
            </Text>
            {searchLoading ? (
              <View className="gap-4">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </View>
            ) : searchResults.length === 0 ? (
              <Text className="text-gray-500 text-center py-10">
                No results found
              </Text>
            ) : (
              <View className="gap-5">
                {searchResults.map((item) => (
                  <Pressable key={item.symbol} onPress={() => openModal(item)}>
                    <View className="flex-row items-center justify-between py-2">
                      <View className="flex-row items-center">
                        <Logo symbol={item.symbol} />
                        <View>
                          <Text className="text-lg font-bold">
                            {item.longname || item.shortname || "Stock"}
                          </Text>
                          <Text className="text-sm text-gray-500">
                            {item.longname}
                          </Text>
                        </View>
                      </View>
                      <Text
                        className={`font-bold text-lg ${
                          (item.weekly_change ?? 0) > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.weekly_change != null
                          ? `${Math.abs(item.weekly_change).toFixed(2)}%`
                          : item.price != null
                            ? `$${item.price.toFixed(2)}`
                            : "—"}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        ) : (
          <>
            {/* Your Investments */}
            <View className="mb-8">
              <Text className="text-2xl font-bold mb-4">Your investments</Text>
              {initialLoading ? (
                <View className="gap-3">
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                </View>
              ) : positions.length === 0 ? (
                <Text className="text-gray-500">No investments yet</Text>
              ) : (
                <View>
                  {positions.map((item) => (
                    <Pressable
                      key={item.ticker}
                      onPress={() => openModal(item)}
                    >
                      <View className="flex-row items-center justify-between py-3">
                        <View className="flex-row items-center">
                          <Logo symbol={item.ticker} />
                          <View>
                            <Text className="text-lg font-bold">
                              {item.ticker}
                            </Text>
                            {item.price != null && (
                              <Text className="text-gray-500">
                                ${item.price.toFixed(2)}
                              </Text>
                            )}
                          </View>
                        </View>
                        {item.weekly_change != null && (
                          <View className="flex flex-row gap-1">
                            <View className="flex justify-center">
                              {item.weekly_change > 0 ? (
                                <Triangle
                                  stroke={"none"}
                                  size="12px"
                                  fill={"#22C55E"}
                                />
                              ) : (
                                <View className="rotate-180">
                                  <Triangle
                                    className="rotate-180"
                                    stroke={"none"}
                                    size="12px"
                                    fill={"#EF4444"}
                                  />
                                </View>
                              )}
                            </View>
                            <Text
                              className={`font-bold text-lg ${
                                item.weekly_change > 0
                                  ? "text-[#22C55E]"
                                  : "text-[#EF4444]"
                              }`}
                            >
                              {Math.abs(item.weekly_change).toFixed(2)}%
                            </Text>
                          </View>
                        )}
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
            {/* Trending */}
            <View>
              <Text className="text-2xl font-bold mb-4">Trending</Text>
              {initialLoading ? (
                <View className="gap-3">
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                </View>
              ) : (
                trending.map((item) => (
                  <Pressable key={item.symbol} onPress={() => openModal(item)}>
                    <View className="flex-row items-center justify-between py-3">
                      <View className="flex-row items-center">
                        <Logo symbol={item.symbol} />
                        <View>
                          <Text className="text-lg font-bold">
                            {item.symbol}
                          </Text>
                          {item.price != null && (
                            <Text className="text-gray-500 ">
                              ${item.price.toFixed(2)}
                            </Text>
                          )}
                        </View>
                      </View>
                      {item.weekly_change != null && (
                        <View className="flex flex-row gap-1">
                          <View className="flex justify-center">
                            {item.weekly_change > 0 ? (
                              <Triangle
                                stroke={"none"}
                                size="12px"
                                fill={"#22C55E"}
                              />
                            ) : (
                              <View className="rotate-180">
                                <Triangle
                                  className="rotate-180"
                                  stroke={"none"}
                                  size="12px"
                                  fill={"#EF4444"}
                                />
                              </View>
                            )}
                          </View>
                          <Text
                            className={`font-bold text-lg ${
                              item.weekly_change > 0
                                ? "text-[#22C55E]"
                                : "text-[#EF4444]"
                            }`}
                          >
                            {Math.abs(item.weekly_change).toFixed(2)}%
                          </Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                ))
              )}
            </View>
          </>
        )}
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StockModal
            isVisible={modalVisible}
            onClose={closeModal}
            selectedStock={selectedStock}
          />
        </GestureHandlerRootView>
      </ScrollView>
    </View>
  );
}
