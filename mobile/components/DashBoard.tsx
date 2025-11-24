import {
  View,
  Text,
  useWindowDimensions,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { useState, useEffect } from "react";
import Card from "./Card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import AddAccountModal from "@/components/modals/AddAccountModal";
import AddTransactionModal from "@/components/modals/AddTransactionModal";
import AddSubscriptionModal from "@/components/modals/AddSubscriptionModal";
import { useAuthStore } from "@/utils/authStore";
import { getAccounts, getTransactions } from "@/utils/db/finance/finance";
import {getSubscriptions} from "@/utils/db/finance/subscriptions/subscriptions";

function calculateAccountBalances(
  accounts: any[],
  transactions: any[],
  subscriptions: any[]
) {
  const totals: Record<number, number> = {};

  accounts.forEach((acc) => {
    totals[acc.id] = 0;
  });

  transactions.forEach((txn) => {
    if (totals.hasOwnProperty(txn.account_id)) {
      totals[txn.account_id] += txn.amount_minor;
    }
  });

  subscriptions.forEach((sub) => {
    if (sub.active && totals.hasOwnProperty(sub.account_id)) {
      totals[sub.account_id] -= sub.amount_minor;
    }
  });

  return accounts.map((acc) => ({
    ...acc,
    balance_minor: totals[acc.id] ?? 0,
  }));
}


enum STATE {
  DEFAULT = "DEFAULT",
  ADD_ACCOUNT = "ADD_ACCOUNT",
  ADD_TRANSACTION = "ADD_TRANSACTION",
  ADD_SUBSCRIPTION = "ADD_SUBSCRIPTION",
}

export default function DashBoard() {
  const { width, height } = useWindowDimensions();
  const [accountIndex, setAccountIndex] = useState(0);
  const [state, setState] = useState(STATE.DEFAULT);
  const [expanded, setExpanded] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  const contentWidth = (width - 60) * 0.9;
  const maxListHeight = height * 0.35;

  const { user, session } = useAuthStore();

  const loadAccounts = async () => {
    if (!session?.access_token) return [];
    try {
      const data = await getAccounts(
        session.access_token,
        session.refresh_token,
      );
      const result = data.rows || data;
      setAccounts(result);
      return result;
    } catch (e: any) {
      console.error("Failed to load accounts:", e?.message || "Unknown error");
      return [];
    }
  };

  const loadTransactions = async (accs: any[]) => {
    if (!session?.access_token || !accs.length) return;

    try {
      const all: any[] = [];

      for (const acc of accs) {
        const data = await getTransactions(
          session.access_token,
          session.refresh_token,
          acc.id,
        );
        const t = data.rows || data;
        all.push(...t);
      }

      all.reverse();
      setTransactions(all);

      const updatedAccounts = calculateAccountBalances(accs, all, transactions);
      setAccounts(updatedAccounts);
    } catch (e: any) {}
  };

    const loadSubscriptions = async (accs: any[]) => {
    if (!session?.access_token || !accs.length) return;

    try {
      const all: any[] = [];

      for (const acc of accs) {
        const data = await getSubscriptions(
          session.access_token,
          session.refresh_token,
          acc.id,
        );
        const t = data.rows || data;
        all.push(...t);
      }

      all.reverse();
      setSubscriptions(all);

      const updatedAccounts = calculateAccountBalances(accs, all, subscriptions);
      setAccounts(updatedAccounts);
    } catch (e: any) {}
  };

  useEffect(() => {
    const loadAll = async () => {
      const accs = await loadAccounts();
      if (accs.length > 0) {
        await loadTransactions(accs);
      }
    };
    loadAll();
  }, [session?.access_token]);

  const openAddAccountModal = () => {
    setState(STATE.ADD_ACCOUNT);
    setExpanded(false);
  };

  const openAddTransactionModal = () => {
    setState(STATE.ADD_TRANSACTION);
    setExpanded(false);
  };
    const openAddSubscriptionModal = () => {
    setState(STATE.ADD_SUBSCRIPTION);
    }

  const handleModalClose = () => {
    setState(STATE.DEFAULT);
  };

  const handleTransactionAdded = async () => {
    if (accounts.length > 0) {
      await loadTransactions(accounts);
    }
  };
  const handleSubscriptionAdded = async () => {
    if (accounts.length > 0) {
      await loadSubscriptions(accounts);
    }
  };

  const handleAccountAdded = async () => {
    const result = await loadAccounts();
    if (result.length > 0) {
      await loadTransactions(result);
    }
  };

  const toggleExpanded = () => setExpanded(!expanded);
  const handleOutsidePress = () => setExpanded(false);

  const filteredTransactions = transactions.filter(
    (tx) => tx.account_id === accounts[accountIndex]?.id,
  );

  return (
    <View className="flex-1 w-full bg-white mt-5">
      <View className=" items-center justify-center">
        <View className="gap-3 items-center">
          <Text className="text-center text-2xl font-bold">
            {`Good morning ${user?.user_metadata?.display_name || "there"}!`}
          </Text>

          {/* Accounts Carousel */}
          <View className="w-full">
            {accounts.length === 0 ? (
              <Text className="text-center text-lg text-gray-500">
                No accounts yet
              </Text>
            ) : (
              <Carousel onIndexChange={setAccountIndex}>
                <CarouselContent>
                  {accounts.map((account: any) => (
                    <CarouselItem
                      key={account.id}
                      className="items-center justify-center"
                    >
                      <Card
                        provider={account.institution}
                        name={account.name}
                        kind={account.kind}
                        amount={parseFloat(
                          (account.balance_minor / 100).toFixed(2),
                        )}
                        currency={account.currency}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {/* Pagination dots */}
                <View className="flex-row mt-4 gap-1 justify-center">
                  {(() => {
                    const total = accounts.length;
                    const maxDots = 5;

                    let start = 0;
                    let end = total;

                    if (total > maxDots) {
                      if (accountIndex <= 2) {
                        start = 0;
                        end = maxDots;
                      } else if (accountIndex >= total - 3) {
                        start = total - maxDots;
                        end = total;
                      } else {
                        start = accountIndex - 2;
                        end = accountIndex + 3;
                      }
                    }

                    return accounts.slice(start, end).map((_, i) => {
                      const realIndex = i + start;

                      return (
                        <View
                          key={realIndex}
                          className={`w-2 h-2 rounded-full ${
                            realIndex === accountIndex
                              ? "bg-black"
                              : "bg-gray-300"
                          }`}
                        />
                      );
                    });
                  })()}
                </View>
              </Carousel>
            )}
          </View>
        </View>
      </View>

     {/* Transactions + Subscriptions */}
<View className="flex-1 items-center justify-start w-full pt-2">
  <View className="gap-5" style={{ width: contentWidth }}>
    <Text className="text-xl font-bold">Transactions</Text>

    <ScrollView
      style={{ maxHeight: maxListHeight }}
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-5 pb-5">
        {(filteredTransactions
          .concat(
            subscriptions
              .filter((sub) => sub.account_id === accounts[accountIndex]?.id && sub.active)
              .map((sub) => ({
                id: `sub-${sub.id}`, // unique key for subscription
                description: sub.merchant,
                category_id: "Subscription",
                amount_minor: -sub.amount_minor, // outgoing payment
                currency: sub.currency,
              }))
          )
          .sort((a, b) => b.id.localeCompare(a.id)) // optional: sort latest first
        ).map((item) => (
          <View
            key={item.id}
            className="flex flex-row justify-between"
            style={{ width: contentWidth }}
          >
            <View>
              <Text className="text-xl font-bold">{item.description}</Text>
              <Text className="text-gray-400 text-lg">{item.category_id}</Text>
            </View>

            <Text
              className={`self-center font-bold ${
                item.amount_minor < 0 ? "text-red-500" : "text-green-500"
              }`}
            >
              {item.amount_minor < 0 ? "" : "+"}
              {(item.amount_minor / 100).toFixed(2)}{" "}
              {item.currency === "USD" ? "$" : "€"}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  </View>
</View>


      {/* Floating Add Button */}
      <View className="absolute bottom-12 right-5">
        {expanded && (
          <TouchableWithoutFeedback onPress={handleOutsidePress}>
            <View className="absolute inset-0" />
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
                className="flex-row justify-between items-center pb-3"
                onPress={openAddTransactionModal}
              >
                <Text className="text-white text-3xl font-semibold">
                  Transaction
                </Text>
                <Text className="text-white text-3xl">›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row justify-between items-center"
                onPress={openAddSubscriptionModal}
              >
                <Text className="text-white text-3xl font-semibold">
                    Subscription
                </Text>
                <Text className="text-white text-3xl">›</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <AddAccountModal
        isVisible={state === STATE.ADD_ACCOUNT}
        onClose={handleModalClose}
        onAccountAdded={handleAccountAdded}
      />

      <AddTransactionModal
        isVisible={state === STATE.ADD_TRANSACTION}
        onClose={handleModalClose}
        accounts={accounts}
        selectedAccountId={accounts[accountIndex]?.id}
        onTransactionAdded={handleTransactionAdded}
      />
      <AddSubscriptionModal isVisible={state === STATE.ADD_SUBSCRIPTION} onClose={handleModalClose} accounts={accounts} selectedAccountId={accounts[accountIndex]?.id} onSubscriptionAdded={handleSubscriptionAdded} />

    </View>
  );
}
