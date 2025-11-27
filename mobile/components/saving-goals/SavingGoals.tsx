"use client";
import React, {useState, useEffect} from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Pressable,
    TouchableWithoutFeedback,
} from "react-native";
import SavingsAddAccountModal from "@/components/modals/SavingsAddAccountModal";
import SavingsAddTransactionModal from "@/components/modals/SavingsAddTransactionModal";
import CircularProgress from "@/components/saving-goals/CircularProgress";
import SavingsDetailModal from "@/components/modals/SavingsDetailModal";
import {useAuthStore} from "@/utils/authStore";
import {
    fetchSavingsAccounts,
    handleAddAccount,
    handleAddTransaction,
} from "@/utils/db/finance/saving-goals/saving-goals";
import {Skeleton} from "@/components/ui/skeleton";
import {ChevronRight} from "lucide-react-native";

const INITIAL_SAVINGS: any[] = [];

type Transaction = {
    id: number;
    savingId: number;
    description: string;
    amount: number; // in cents
    date: string;
    type: "add" | "subtract";
};

export default function SavingGoals() {
    const [savings, setSavings] = useState(INITIAL_SAVINGS);
    const [transactions] = useState<Transaction[]>([]);
    const [showAddAccountModal, setShowAddAccountModal] = useState(false);
    const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
    const [showDetailView, setShowDetailView] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [selectedSavingId, setSelectedSavingId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingAccounts, setIsFetchingAccounts] = useState(true);
    const {session} = useAuthStore();

    const handleSavingClick = (savingId: number) => {
        setSelectedSavingId(savingId);
        setShowDetailView(true);
    };

    const handleCloseDetailView = () => {
        setShowDetailView(false);
        setSelectedSavingId(null);
    };

    useEffect(() => {
        const fetchAccounts = async () => {
            setIsFetchingAccounts(true);
            try {
                const accounts = await fetchSavingsAccounts(session);
                if (accounts) {
                    setSavings(accounts);
                }
            } catch (e) {
                console.error("Failed to fetch savings accounts", e);
            } finally {
                setIsFetchingAccounts(false);
            }
        };
        fetchAccounts();
    }, [session]);

    useEffect(() => {
        console.log("Savings state updated:", savings.length, "accounts");
    }, [savings]);

    const totalAmount = savings.reduce(
        (sum: number, saving: any) => sum + (saving.contributed_minor || 0),
        0,
    );
    const totalGoal = savings.reduce(
        (sum: number, saving: any) => sum + (saving.target_minor || 0),
        0,
    );
    const overallProgress = totalGoal > 0 ? (totalAmount / totalGoal) * 100 : 0;

    const toggleExpanded = () => setExpanded(!expanded);

    const openAddAccountModal = () => {
        setShowAddAccountModal(true);
        setExpanded(false);
    };

    const openAddTransactionModal = () => {
        setShowAddTransactionModal(true);
        setExpanded(false);
    };

    const addAccount = async (accountName: string, initialAmount: string) => {
        setIsLoading(true);
        try {
            const newSavings = await handleAddAccount(
                accountName,
                initialAmount,
                session,
            );
            if (newSavings) {
                setSavings(newSavings);
            }
        } catch (error) {
            console.error("Error adding savings account:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const addTransaction = async (
        savingId: number,
        type: "add" | "subtract",
        description: string,
        amount: string,
    ) => {
        setIsLoading(true);
        try {
            const result = await handleAddTransaction(
                savingId,
                type,
                description,
                amount,
                session,
            );
            if (result && result.accounts) {
                setSavings(result.accounts);
            }
        } catch (error) {
            console.error("Error adding transaction:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1 px-7 pt-4">
                <View className="mb-8 items-center justify-center py-8">
                    <CircularProgress
                        savings={savings}
                        totalAmount={totalAmount}
                        currency="€"
                    />
                </View>

                {/* Savings Accounts List */}
                <View className="mb-20">
                    <Text className="text-2xl font-bold mb-4">Savings</Text>
                    {isFetchingAccounts ? (
                        <View className="gap-3">
                            {[...Array(3)].map((_, i) => (
                                <View key={i} className="mb-0.5 bg-white rounded-2xl p-4">
                                    <Skeleton mode="light" className="h-5 w-40 mb-2" animated/>
                                    <Skeleton mode="light" className="h-3 w-24" animated/>
                                </View>
                            ))}
                        </View>
                    ) : savings.length === 0 ? (
                        <View className="py-8 items-center">
                            <Text className="text-neutral-500 text-center">
                                No savings accounts yet.{"\n"}Create your first account to get
                                started!
                            </Text>
                        </View>
                    ) : (
                        savings.map((saving) => {
                            return (
                                <Pressable
                                    key={saving.id}
                                    onPress={() => handleSavingClick(saving.id)}
                                    className="mb-0.5 bg-white rounded-2xl p-4"
                                >
                                    {/* Header */}
                                    <View className="flex-row justify-between items-center">
                                        <View>
                                            <Text className="text-lg font-bold">{saving.name}</Text>
                                            <Text className="text-sm text-neutral-500 mt-1">
                                                {"FT"}
                                            </Text>
                                        </View>
                                        <View className="items-end">
                                            <ChevronRight size={20} />
                                            <Text className="text-lg font-bold text-green-500">
                                                {saving.currency || "€"}
                                                {((saving.contributed_minor || 0) / 100).toFixed(2)}
                                            </Text>
                                        </View>
                                    </View>
                                </Pressable>
                            );
                        })
                    )}
                </View>
            </ScrollView>

            {/* Floating Add Button */}
            <View className="absolute bottom-12 right-5">
                {expanded && (
                    <TouchableWithoutFeedback onPress={() => setExpanded(false)}>
                        <View className="absolute inset-0"/>
                    </TouchableWithoutFeedback>
                )}

                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={toggleExpanded}
                    className={`${
                        expanded
                            ? "bg-black w-64 py-6 rounded-[25px]"
                            : "bg-black w-40 py-4 rounded-full"
                    }`}
                >
                    {!expanded ? (
                        <View className="items-center justify-center">
                            <Text className="text-white text-3xl font-semibold">Add +</Text>
                        </View>
                    ) : (
                        <View className="flex-col justify-center px-6 space-y-3">
                            <TouchableOpacity
                                className="flex-row justify-between items-center pb-3"
                                onPress={openAddAccountModal}
                            >
                                <Text className="text-white text-3xl font-semibold">
                                    Account
                                </Text>
                                <Text className="text-white text-3xl">›</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-row justify-between items-center"
                                onPress={openAddTransactionModal}
                            >
                                <Text className="text-white text-3xl font-semibold">
                                    Transaction
                                </Text>
                                <Text className="text-white text-3xl">›</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Modals */}
            <SavingsAddAccountModal
                isVisible={showAddAccountModal}
                onClose={() => setShowAddAccountModal(false)}
                onSave={(name, initialAmount) => addAccount(name, initialAmount)}
            />

            <SavingsAddTransactionModal
                isVisible={showAddTransactionModal}
                onClose={() => {
                    setShowAddTransactionModal(false);
                    setSelectedSavingId(null);
                }}
                selectedSavingId={selectedSavingId}
                onSave={(savingId, type, description, amount) =>
                    addTransaction(savingId, type, description, amount)
                }
                savings={savings}
            />

            {/* Detail Modal */}
            {selectedSavingId && (
                <SavingsDetailModal
                    isVisible={showDetailView}
                    onClose={handleCloseDetailView}
                    savingId={selectedSavingId}
                    savingObject={savings.find((s) => s.id === selectedSavingId)}
                    savingName={
                        savings.find((s) => s.id === selectedSavingId)?.name ||
                        "Savings Account"
                    }
                    currentAmount={
                        savings.find((s) => s.id === selectedSavingId)?.contributed_minor ||
                        0
                    }
                    goalAmount={
                        savings.find((s) => s.id === selectedSavingId)?.target_minor || 0
                    }
                    currency={
                        savings.find((s) => s.id === selectedSavingId)?.currency || "€"
                    }
                    transactions={transactions.filter(
                        (t) => t.savingId === selectedSavingId,
                    )}
                />
            )}
        </View>
    );
}
