import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TextInput, Pressable } from "react-native";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import StockModal from "@/components/modals/StockModal";
import { useAuthStore } from "@/utils/authStore";
import { getInvestments } from "@/utils/db/invest/invest";
import { SearchIcon, X } from "lucide-react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function AddInvestmentView() {
  const [trending, setTrending] = useState<any[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [changes, setChanges] = useState<Record<string, number>>({});
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [positions, setPositions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, session } = useAuthStore();

  const openModal = (item: any) => {
    setSelectedStock(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedStock(null);
  };

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const resp = await axios.get(
          "https://query1.finance.yahoo.com/v1/finance/trending/US",
        );
        const quotes =
          resp.data.finance?.result?.[0]?.quotes.slice(0, 10) || [];
        setTrending(quotes);
        const symbols = quotes.map((q: any) => q.symbol);

        const priceResponses = await Promise.all(
          symbols.map((symbol: string) =>
            axios
              .get(`http://localhost:8000/stock/${symbol}/price`)
              .then((res) => ({
                symbol,
                price: res.data.price,
                weekly_change: res.data.weekly_change,
              })),
          ),
        );

        const priceMap = priceResponses.reduce(
          (acc, { symbol, price }) => {
            acc[symbol] = price;
            return acc;
          },
          {} as Record<string, number>,
        );

        const changeMap = priceResponses.reduce(
          (acc, { symbol, weekly_change }) => {
            acc[symbol] = weekly_change;
            return acc;
          },
          {} as Record<string, number>,
        );

        setChanges(changeMap);
        setPrices(priceMap);
      } catch (err) {
        console.error("Error fetching trending stocks:", err);
      }
    };
    const fetchpositions = async () => {
      try {
        const data = await getInvestments(
          session?.access_token,
          session?.refresh_token,
        ).then((res) => res.positions);
        setPositions(data || []);
      } catch (error) {
        console.error("Error fetching positions:", error);
      }
    };
    fetchTrending();
    fetchpositions();
  }, []);

  return (
    <ScrollView className="p-7 bg-white ">
      <View className="bg-[#F1F1F2] mb-4 h-[42px] rounded-full flex items-center justify-around flex-row gap-2 px-2">
        <SearchIcon width={24} height={24} color="#9FA1A4" />
        <View className={"flex-1 flex items-start justify-center"}>
          <TextInput
            placeholder="Search investments"
            className={"text-[20px] "}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        {searchQuery.length > 0 && positions.length > 0 && (
          <X width={24} height={24} onPress={() => setSearchQuery("")} />
        )}
      </View>

      <View>
        <Text className="text-2xl font-bold mb-2">Your investments</Text>
        {positions.length === 0 ? (
          <Text>No investments found</Text>
        ) : (
          <View>
            {positions.map((item) => (
              <Pressable key={item.ticker} onPress={() => openModal(item)}>
                <View className="flex-row justify-between items-center py-2">
                  <View>
                    <Text className="text-lg font-bold">{item.ticker}</Text>
                    <Text className="text-gray-400 font-bold text-xs">
                      {item.avg_entry_price != null
                        ? item.avg_entry_price.toFixed(2)
                        : "—"}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View className="mt-4">
        <Text className="text-2xl font-bold mb-2">Trending</Text>

        {trending.length === 0 ? (
          <Text>Loading trending stocks...</Text>
        ) : (
          <View>
            {trending.map((item) => (
              <Pressable key={item.symbol} onPress={() => openModal(item)}>
                <View className="flex-row justify-between items-center py-2">
                  <View>
                    <Text className="text-lg font-bold">{item.symbol}</Text>
                    <Text className="text-gray-400 font-bold text-xs">
                      {prices[item.symbol] != null ? (
                        `$${prices[item.symbol].toFixed(2)}`
                      ) : (
                        <Skeleton
                          mode="light"
                          className="h-4 w-[50px]"
                          animated={true}
                        />
                      )}
                    </Text>
                  </View>

                  <Text
                    className={`font-bold text-base ${
                      changes[item.symbol] > 0
                        ? "text-green-500"
                        : changes[item.symbol] < 0
                          ? "text-red-500"
                          : "text-gray-500"
                    }`}
                  >
                    {changes[item.symbol] != null
                      ? `${changes[item.symbol].toFixed(2)}%`
                      : "—"}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StockModal
          isVisible={modalVisible}
          onClose={closeModal}
          selectedStock={selectedStock}
        />
      </GestureHandlerRootView>
    </ScrollView>
  );
}
