import {
    View,
    Text,
    useWindowDimensions,
    ScrollView,
    Pressable,
} from "react-native";
import Card from "./Card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import {useEffect, useState} from "react";
import {useAuthStore} from "@/utils/authStore";
import { financeService, type FinanceAccount } from "@/utils/db/finance/finance";

export default function DashBoard() {
    const {width, height} = useWindowDimensions();
    const [accountIndex, setAccountIndex] = useState(0);
    const [isLoadingUser, setIsLoadingUser] = useState(false);
    const contentWidth = (width - 60) * 0.9;
    const maxListHeight = height * 0.45;

    const {user, session} = useAuthStore()

    const [accounts, setAccounts] = useState<FinanceAccount[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
    const [accountsError, setAccountsError] = useState<string | null>(null);

    const loadAccounts = async () => {
        if (!session?.access_token) return;
        try {
            setAccountsError(null);
            setIsLoadingAccounts(true);
            const rows = await financeService.getAccounts();
            setAccounts(rows);
        } catch (e: any) {
            setAccountsError(e?.message || "Failed to load accounts");
        } finally {
            setIsLoadingAccounts(false);
        }
    };

    useEffect(() => {
        // Load accounts when the screen mounts or when session changes
        loadAccounts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.access_token]);

    const transactions = {
        data: [
            {
                id: 1,
                user_id: 1,
                account_id: 2,
                txn_date: "2023-10-01",
                posted_at: "2023-10-01",
                amount_minor: -5000,
                currency: "USD",
                description: "Kino LOL",
                category_id: 1,
            },
            {
                id: 2,
                user_id: 1,
                account_id: 1,
                txn_date: "2023-10-02",
                posted_at: "2023-10-02",
                amount_minor: 12500,
                currency: "USD",
                description: "Grocery Store",
                category_id: "Food",
            },
            {
                id: 3,
                user_id: 1,
                account_id: 2,
                txn_date: "2023-10-03",
                posted_at: "2023-10-03",
                amount_minor: 3200,
                currency: "USD",
                description: "Coffee Shop",
                category_id: 3,
            },
            {
                id: 4,
                user_id: 1,
                account_id: 3,
                txn_date: "2023-10-04",
                posted_at: "2023-10-04",
                amount_minor: 45000,
                currency: "USD",
                description: "Monthly Rent",
                category_id: 4,
            },
            {
                id: 5,
                user_id: 1,
                account_id: 1,
                txn_date: "2023-10-05",
                posted_at: "2023-10-05",
                amount_minor: 8900,
                currency: "USD",
                description: "Gas Station",
                category_id: "Food",
            },
            {
                id: 6,
                user_id: 1,
                account_id: 4,
                txn_date: "2023-10-06",
                posted_at: "2023-10-06",
                amount_minor: 2500,
                currency: "USD",
                description: "Restaurant Dinner",
                category_id: 6,
            },
            {
                id: 7,
                user_id: 1,
                account_id: 4,
                txn_date: "2023-10-06",
                posted_at: "2023-10-06",
                amount_minor: 2500,
                currency: "USD",
                description: "Restaurant Dinner",
                category_id: 6,
            },
            {
                id: 8,
                user_id: 1,
                account_id: 4,
                txn_date: "2023-10-06",
                posted_at: "2023-10-06",
                amount_minor: 2500,
                currency: "USD",
                description: "Restaurant Dinner",
                category_id: 6,
            },
            {
                id: 9,
                user_id: 1,
                account_id: 4,
                txn_date: "2023-10-06",
                posted_at: "2023-10-06",
                amount_minor: 2500,
                currency: "USD",
                description: "Restaurant Dinner",
                category_id: 6,
            },
            {
                id: 10,
                user_id: 1,
                account_id: 4,
                txn_date: "2023-10-06",
                posted_at: "2023-10-06",
                amount_minor: 2500,
                currency: "USD",
                description: "Restaurant Dinner",
                category_id: 6,
            },
            {
                id: 11,
                user_id: 1,
                account_id: 4,
                txn_date: "2023-10-06",
                posted_at: "2023-10-06",
                amount_minor: 2500,
                currency: "USD",
                description: "Restaurant Dinner",
                category_id: 6,
            },
            {
                id: 12,
                user_id: 1,
                account_id: 4,
                txn_date: "2023-10-06",
                posted_at: "2023-10-06",
                amount_minor: 2500,
                currency: "USD",
                description: "Restaurant Dinner",
                category_id: 6,
            },
            {
                id: 13,
                user_id: 1,
                account_id: 4,
                txn_date: "2023-10-06",
                posted_at: "2023-10-06",
                amount_minor: 2500,
                currency: "USD",
                description: "Restaurant Dinner",
                category_id: 6,
            },
        ],
    };

    return (
        <View className="flex-1 w-full flex-col">
            <View className="flex-1 items-center justify-center">
                <View className="gap-3 items-center">
                    <Text className="text-center text-2xl font-bold">
                        {isLoadingUser ? "Good morning!" : `Good morning ${
                            user?.user_metadata?.display_name || user?.display_name || "there"
                        }!`}
                    </Text>

                    <View className="w-full">
                        {isLoadingAccounts ? (
                            <Text className="text-center text-lg text-gray-500">Loading accounts...</Text>
                        ) : accountsError ? (
                            <View className="items-center gap-2">
                                <Text className="text-center text-red-500">{accountsError}</Text>
                                <Pressable onPress={loadAccounts} className="bg-black px-4 py-2 rounded-full">
                                    <Text className="text-white font-bold">Retry</Text>
                                </Pressable>
                            </View>
                        ) : accounts.length === 0 ? (
                            <Text className="text-center text-lg text-gray-500">No accounts yet</Text>
                        ) : (
                            <Carousel onIndexChange={setAccountIndex}>
                                <CarouselContent>
                                    {accounts.map((account) => (
                                        <CarouselItem
                                            key={account.id}
                                            className="items-center justify-center"
                                        >
                                            <Card
                                                kind={account.kind || "Account"}
                                                amount={0}
                                                currency={account.currency || "USD"}
                                            />
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                            </Carousel>
                        )}
                    </View>
                </View>
            </View>

            <View className="flex-1 items-center justify-start w-full pt-2">
                <View className="gap-5" style={{width: contentWidth}}>
                    <Text className="text-xl font-bold">Transactions</Text>

                    <ScrollView
                        style={{maxHeight: maxListHeight}}
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="gap-5 pb-5">
                            {transactions.data
                                .filter(
                                    (txn) => txn.account_id === (accounts[accountIndex]?.id as any),
                                )
                                .map((txn) => (
                                    <View
                                        key={txn.id}
                                        className="flex flex-row justify-between"
                                        style={{width: contentWidth}}
                                    >
                                        <View>
                                            <Text className="text-xl font-bold">
                                                {txn.description}
                                            </Text>
                                            <Text className="text-gray-400 text-lg">
                                                {txn.category_id}
                                            </Text>
                                        </View>
                                        <Text
                                            className={`self-center font-bold ${
                                                txn.amount_minor < 0 ? "text-red-500" : "text-green-500"
                                            }`}
                                        >
                                            {txn.amount_minor < 0 ? "" : "+"}
                                            {(txn.amount_minor / 100).toFixed(2)}{" "}
                                            {txn.currency === "USD" ? "$" : "€"}
                                        </Text>
                                    </View>
                                ))}
                        </View>
                    </ScrollView>
                </View>
            </View>
            <Pressable
                className="bg-black absolute bottom-20 right-10 w-32 h-16 rounded-full items-center justify-center shadow-lg">
                <Text className="text-white font-bold text-xl">Add +</Text>
            </Pressable>
        </View>
    );
}
