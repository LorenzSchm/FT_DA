import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function InvestmentView() {
  const [trending, setTrending] = useState([]);
  const [prices, setPrices] = useState({});
  const [changes, setChanges] = useState({});

  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 150 || gesture.vy > 0.5) {
          closeModal();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const openModal = (item: any) => {
    setSelectedStock(item);
    setModalVisible(true);
    translateY.setValue(0);
  };

  const closeModal = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedStock(null);
    });
  };

  // ---- Data fetching (unchanged) ----
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

        const priceMap = priceResponses.reduce((acc, { symbol, price }) => {
          acc[symbol] = price;
          return acc;
        }, {});

        const changeMap = priceResponses.reduce(
          (acc, { symbol, weekly_change }) => {
            acc[symbol] = weekly_change;
            return acc;
          },
          {},
        );

        setChanges(changeMap);
        setPrices(priceMap);
      } catch (err) {
        console.error("Error fetching trending stocks:", err);
      }
    };

    fetchTrending();
  }, []);

  return (
    <View className="p-7 flex-1">
      <TextInput
        placeholder="Search investment"
        className="border border-black rounded-lg p-2 mb-4"
      />

      <View>
        <Text className="text-2xl font-bold mb-2">Your investments</Text>
      </View>

      <View className="mt-4 flex-1">
        <Text className="text-2xl font-bold mb-2">Trending</Text>

        {trending.length === 0 ? (
          <Text>Loading trending stocks...</Text>
        ) : (
          <FlatList
            data={trending}
            keyExtractor={(item) => item.symbol}
            ItemSeparatorComponent={() => <View className="h-1" />}
            renderItem={({ item }) => (
              <Pressable onPress={() => openModal(item)}>
                <View className="flex-row justify-between items-center py-2">
                  {/* Left side: stock info */}
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

                  {/* Right side: change value */}
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
            )}
          />
        )}
      </View>

      {/* ================== SWIPEABLE MODAL ================== */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <View className="flex-1  justify-end ">
          {/* Tap outside to close */}
          <Pressable className="flex-1" onPress={closeModal} />

          <Animated.View
            {...panResponder.panHandlers}
            style={{
              transform: [{ translateY }],
              backgroundColor: "white",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              paddingBottom: 40,
              minHeight: SCREEN_HEIGHT,
            }}
          >
            {/* Drag handle */}
            <View className="items-center mb-4 mt-20">
              <View className="w-12 h-1 bg-gray-400 rounded-full" />
            </View>

            {selectedStock && (
              <>
                <Text>Drag</Text>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
