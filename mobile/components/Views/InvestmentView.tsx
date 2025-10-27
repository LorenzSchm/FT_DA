import React, { useEffect, useState } from "react";
import {View, Text, FlatList, ScrollView} from "react-native";
import axios from "axios";

export default function InvestmentView() {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    axios
      .get("https://query1.finance.yahoo.com/v1/finance/trending/US")
      .then((resp) => {
        const quotes = resp.data.finance?.result?.[0]?.quotes || [];
        setTrending(quotes);
      })
      .catch((err) => console.error("Error fetching trending stocks:", err));
  }, []);

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        Investment Vie
      </Text>

      {trending.length === 0 ? (
        <Text>Loading trending stocks...</Text>
      ) : (
        <FlatList
          data={trending}
          scrollEnabled={true}
          keyExtractor={(item) => item.symbol}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontWeight: "600" }}>{item.symbol}</Text>
              <Text>{item.shortName}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
