import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import axios from "axios";

export default function InvestmentView() {
  const [trending, setTrending] = useState([]);
  const [prices, setPrices] = useState({});

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const resp = await axios.get(
          "https://query1.finance.yahoo.com/v1/finance/trending/US",
        );
        const quotes = resp.data.finance?.result?.[0]?.quotes || [];
        setTrending(quotes);

        const symbols = quotes.map((q) => q.symbol);

        const priceResponses = await Promise.all(
          symbols.map((symbol) =>
            axios
              .get(`http://localhost:8000/stock/${symbol}/price`)
              .then((res) => ({ symbol, price: res.data.price })),
          ),
        );

        const priceMap = priceResponses.reduce((acc, { symbol, price }) => {
          acc[symbol] = price;
          return acc;
        }, {});

        setPrices(priceMap);
      } catch (err) {
        console.error("Error fetching trending stocks:", err);
      }
    };

    fetchTrending();
  }, []);

  return (
    <View>
      <Text>Investment View</Text>

      {trending.length === 0 ? (
        <Text>Loading trending stocks...</Text>
      ) : (
        <FlatList
          data={trending}
          keyExtractor={(item) => item.symbol}
          renderItem={({ item }) => (
            <View>
              <Text>{item.symbol}</Text>
              <Text>{item.shortName}</Text>
              <Text>Price: {prices[item.symbol] ?? "Loadg..."}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
