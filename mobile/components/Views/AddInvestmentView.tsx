import React, {useEffect, useState, useCallback, useRef} from "react";
import {View, Text, ScrollView, TextInput, Pressable, Image, TouchableOpacity, useWindowDimensions} from "react-native";
import axios from "axios";
import {Skeleton} from "@/components/ui/skeleton";
import StockModal from "@/components/modals/StockModal";
import {useAuthStore} from "@/utils/authStore";
import {getInvestments} from "@/utils/db/invest/invest";
import {Search, X} from "lucide-react-native";
import {GestureHandlerRootView} from "react-native-gesture-handler";

export default function AddInvestmentView() {
    const [trending, setTrending] = useState<any[]>([]);
    const [prices, setPrices] = useState<Record<string, number>>({});
    const [changes, setChanges] = useState<Record<string, number>>({});
    const [selectedStock, setSelectedStock] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [positions, setPositions] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const {session} = useAuthStore();

    const logoCache = useRef<Record<string, string>>({});

    const inputRef = useRef<TextInput | null>(null);
    const { width } = useWindowDimensions();
    const expandedWidth = width - 32; // match NavBar spacing

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

    const fetchStockData = async (symbol: string) => {
        try {
            const res = await axios.get(`http://localhost:8000/stock/${symbol}/price`);
            const {price, weekly_change, domain, longname} = res.data;
            let logo = logoCache.current[symbol];
            if (!logo && domain) {
                try {
                    const brandResp = await axios.get(`https://api.brandfetch.io/v2/search/${domain}`);
                    const best = brandResp.data.find((b: any) => b.verified) || brandResp.data[0];
                    if (best?.icon) {
                        logo = best.icon;
                        logoCache.current[symbol] = logo;
                    }
                } catch {
                }
            }

            return {price, weekly_change, logo, longname};
        } catch {
            return {price: undefined, weekly_change: undefined, logo: undefined, longname: undefined};
        }
    };

    // Initial load
    useEffect(() => {
        const load = async () => {
            // Trending
            const trendResp = await axios.get("https://query1.finance.yahoo.com/v1/finance/trending/US");
            const quotes = trendResp.data.finance?.result?.[0]?.quotes.slice(0, 10) || [];

            const trendData = await Promise.all(
                quotes.map(async (q: any) => {
                    const {price, weekly_change, logo, longname} = await fetchStockData(q.symbol);
                    return {...q, price, weekly_change, logo, longname};
                })
            );
            setTrending(trendData);

            // Positions
            const pos = await getInvestments(session?.access_token, session?.refresh_token);
            const posData = await Promise.all(
                (pos?.positions || []).map(async (p: any) => {
                    const {price, weekly_change, logo, longname} = await fetchStockData(p.ticker);
                    return {...p, price, weekly_change, logo, longname};
                })
            );
            setPositions(posData);
        };
        load();
    }, []);

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
            const resp = await axios.get(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}`);
            const quotes = resp.data?.quotes ?? [];
            const limited = quotes.filter((q: any) => q.symbol).slice(0, 10);

            const results = await Promise.all(
                limited.map(async (item: any) => {
                    const {price, weekly_change, logo, longname} = await fetchStockData(item.symbol);
                    return {...item, price, weekly_change, logo, longname};
                })
            );
            if (active) setSearchResults(results);
            setSearchLoading(false);
        };
        const t = setTimeout(search, 400);
        return () => {
            clearTimeout(t);
            active = false;
        };
    }, [searchQuery]);

    const isSearching = searchQuery.trim().length > 0;

    // Logo renderer
    const Logo = ({symbol}: { symbol: string }) => {
        const logo = logoCache.current[symbol];
        return (
            <View className="w-10 h-10 rounded-2xl  items-center justify-center mr-4 overflow-hidden ">
                {logo ? (
                    <Image source={{uri: logo}} className="w-full h-full" resizeMode="contain"/>
                ) : (
                    <Text className="text-3xl font-bold text-orange-600">{symbol[0]}</Text>
                )}
            </View>
        );
    };

    return (
        <ScrollView className="flex-1 bg-white p-7">
            {/* Search Bar (fixed expanded width) */}
            <View
                style={{ width: expandedWidth, alignSelf: 'center' }}
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

            {isSearching ? (
                <View>
                    <Text className="text-2xl font-bold mb-5">
                        Results ({searchResults.length})
                    </Text>
                    {searchLoading ? (
                        <Text className="text-gray-500 text-center py-10">Searching...</Text>
                    ) : searchResults.length === 0 ? (
                        <Text className="text-gray-500 text-center py-10">No results found</Text>
                    ) : (
                        <View className="gap-5">
                            {searchResults.map((item) => (
                                <Pressable key={item.symbol} onPress={() => openModal(item)}>
                                    <View className="flex-row items-center justify-between py-2">
                                        <View className="flex-row items-center">
                                            <Logo symbol={item.symbol}/>
                                            <View>
                                                <Text
                                                    className="text-lg font-bold">{item.longname || item.shortname || "Stock"}</Text>
                                                <Text className="text-sm text-gray-500">
                                                    {item.symbol}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text
                                            className={`font-bold text-lg ${
                                                (item.weekly_change ?? 0) > 0 ? "text-green-600" : "text-red-600"
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
                        {positions.length === 0 ? (
                            <Text className="text-gray-500">No investments found</Text>
                        ) : (
                            <View>
                                {positions.map((item) => (
                                    <Pressable key={item.ticker} onPress={() => openModal(item)}>
                                        <View className="flex-row items-center justify-between py-3">
                                            <View className="flex-row items-center">
                                                <Logo symbol={item.ticker} />
                                                <View>
                                                    <Text className="text-lg font-bold">{item.ticker}</Text>
                                                    {item.price != null && (
                                                        <Text className="text-gray-500 ml-2">${item.price.toFixed(2)}</Text>
                                                    )}
                                                </View>
                                            </View>
                                            {item.weekly_change != null && (
                                                <Text
                                                    className={`font-bold text-lg ${
                                                        item.weekly_change > 0 ? "text-green-600" : "text-red-600"
                                                    }`}
                                                >
                                                    {Math.abs(item.weekly_change).toFixed(2)}%
                                                </Text>
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
                        {trending.map((item) => (
                            <Pressable key={item.symbol} onPress={() => openModal(item)}>
                                <View className="flex-row items-center justify-between py-3">
                                    <View className="flex-row items-center">
                                        <Logo symbol={item.symbol}/>
                                        <View>
                                            <Text className="text-lg font-bold">{item.symbol}</Text>
                                            {item.price != null && (
                                                <Text className="text-gray-500 ml-2">
                                                    ${item.price.toFixed(2)}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                    {item.weekly_change != null && (
                                        <Text
                                            className={`font-bold text-lg ${
                                                item.weekly_change > 0 ? "text-green-600" : "text-red-600"
                                            }`}
                                        >
                                            {Math.abs(item.weekly_change).toFixed(2)}%
                                        </Text>
                                    )}
                                </View>
                            </Pressable>
                        ))}
                    </View>
                </>
            )}

            <GestureHandlerRootView style={{flex: 1}}>
                <StockModal
                    isVisible={modalVisible}
                    onClose={closeModal}
                    selectedStock={selectedStock}
                />
            </GestureHandlerRootView>
        </ScrollView>
    );
}