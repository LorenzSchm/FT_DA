import { View, Text, ScrollView } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/utils/authStore";
import { getTransactions } from "@/utils/db/finance/finance";
import CategoryBreakdownChart from "@/components/analysis/CategoryBreakdownChart";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
    account: string | number | null;
};

const normalizeTransactions = (list?: any[]) => {
    if (!Array.isArray(list)) return [];
    return list.map((t: any, index: number) => {
        const amountMinor =
            t.amount_minor !== undefined
                ? Number(t.amount_minor)
                : t.amount !== undefined
                    ? Math.round(Number(t.amount) * 100)
                    : 0;

        return {
            id:
                t.id ??
                t.transaction_id ??
                `${amountMinor}_${t.date ?? t.timestamp ?? ""}_${index}`,
            description:
                t.description ||
                t.merchant ||
                t.name ||
                t.merchant_name ||
                "Transaction",
            category_id:
                t.category ||
                t.category_id ||
                t.category_name ||
                t.categoryLabel ||
                "Other",
            amount_minor: Number(amountMinor || 0),
            currency: t.currency || t.currency_code || "USD",
            date: t.date || t.timestamp || t.created_at || null,
            __raw: t,
        };
    });
};

export default function Incomes({ account }: Props) {
    const { session } = useAuthStore();
    const [incomes, setIncomes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const getCurrencySymbol = (code?: string) => {
        if (!code) return "€";
        if (code === "USD") return "$";
        if (code === "GBP") return "£";
        return code;
    };

    const loadTransactions = async () => {
        if (!session?.access_token || !account) return;
        try {
            setIsLoading(true);
            const data = await getTransactions(
                session.access_token,
                session.refresh_token,
                account,
            );
            const list = (data.rows || data) as any[];
            const normalized = normalizeTransactions(list);
            const sorted = normalized.sort((a: any, b: any) => {
                if (a.date && b.date) return Date.parse(b.date) - Date.parse(a.date);
                return 0;
            });
            const filtered = sorted.filter((t: any) => t.amount_minor > 0);
            setIncomes(filtered);
        } catch (e: any) {
            console.error("Failed to load incomes:", e?.message || "Unknown error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (account) {
            loadTransactions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [account, session?.access_token]);

    const { startOfMonth, endOfMonth } = useMemo(() => {
        const now = new Date();
        return {
            startOfMonth: new Date(now.getFullYear(), now.getMonth(), 1),
            endOfMonth: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        };
    }, []);

    const monthlyIncomes = useMemo(() => {
        return incomes.filter((tx: any) => {
            if (!tx.date) return false;
            const txDate = new Date(tx.date);
            return txDate >= startOfMonth && txDate <= endOfMonth;
        });
    }, [incomes, startOfMonth, endOfMonth]);

    const categoryData = useMemo(() => {
        const map = monthlyIncomes.reduce<Record<string, number>>((acc, tx: any) => {
            const key = tx.category_id || "Other";
            acc[key] = (acc[key] || 0) + tx.amount_minor;
            return acc;
        }, {});
        return Object.entries(map)
            .map(([label, amount]) => ({ label, amount }))
            .sort((a, b) => b.amount - a.amount);
    }, [monthlyIncomes]);

    const currency = monthlyIncomes[0]?.currency || "EUR";
    const currencySymbol = getCurrencySymbol(currency);

    if (!account) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text className="text-gray-500 text-lg">Please select an account</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
            <View className="px-4 py-6">
                <View className="mb-8">
                    <CategoryBreakdownChart
                        data={categoryData}
                        currency={currencySymbol}
                        title="Income"
                        emptyLabel="No income"
                    />
                </View>

                <View>
                    <Text className="text-xl font-bold mb-4">Recent earnings</Text>
                    {isLoading ? (
                        <View className="gap-4">
                            {[...Array(3)].map((_, idx) => (
                                <View key={idx} className="flex-row justify-between items-center">
                                    <View className="flex-1">
                                        <Skeleton mode="light" className="h-5 w-44 mb-2" animated />
                                        <Skeleton mode="light" className="h-4 w-24" animated />
                                    </View>
                                    <Skeleton mode="light" className="h-5 w-16" animated />
                                </View>
                            ))}
                        </View>
                    ) : monthlyIncomes.length === 0 ? (
                        <Text className="text-center text-gray-400 py-8">
                            No income recorded this month
                        </Text>
                    ) : (
                        <View className="gap-4">
                            {monthlyIncomes.map((item: any) => (
                                <View
                                    key={item.id}
                                    className="flex-row justify-between items-center"
                                >
                                    <View className="flex-1">
                                        <Text className="text-lg font-semibold text-black">
                                            {item.description}
                                        </Text>
                                        <Text className="text-gray-400 text-sm">
                                            {item.category_id || "Other"}
                                        </Text>
                                    </View>
                                    <Text className="text-lg font-bold text-green-500">
                                        +{(item.amount_minor / 100).toFixed(2)} {getCurrencySymbol(item.currency || currency)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}
