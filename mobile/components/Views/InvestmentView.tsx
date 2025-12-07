import {View, Text, Pressable, TouchableOpacity} from "react-native";
import React, {useEffect, useState} from "react";
import {getInvestments} from "@/utils/db/invest/invest";
import {useAuthStore} from "@/utils/authStore";
import StockModal from "@/components/modals/StockModal";
import AddInvestmentModal from "@/components/modals/AddInvestmentModal";
import {GestureHandlerRootView} from "react-native-gesture-handler";


export function InvestmentView() {
    const {session} = useAuthStore();
    const [positions, setPositions] = useState<any[]>([]);
    const [value, setValue] = useState('');
    const [selectedStock, setSelectedStock] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [showAddInvestmentModal, setShowAddInvestmentModal] = useState(false);

    const openModal = (item: any) => {
        setSelectedStock(item);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedStock(null);
    };

    useEffect(() => {
        const fetchpositions = async () => {
            try {
                const data = await getInvestments(
                    session?.access_token,
                    session?.refresh_token,
                ).then((res) => res.positions);
                setPositions(data || []);
                let values = 0;
                (data || []).forEach((position: any) => {
                    values += position.current_price * position.quantity;
                });
                setValue(values.toFixed(2));
            } catch (error) {
                console.error("Error fetching positions:", error);
            }
        };
        fetchpositions();
    }, [session?.access_token, session?.refresh_token])
    console.log(value);
    console.log(positions);
    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <View>
                <Text>{value}</Text>
            </View>
            <View>
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
            </View>
            <StockModal
                isVisible={modalVisible}
                onClose={closeModal}
                selectedStock={selectedStock}
            />
            <AddInvestmentModal
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