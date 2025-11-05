'use client';

import { View, Text, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import React, { useState } from "react";
import AddAccountModal from "@/components/modals/AddAccountModal";
import DashboardView from "@/components/Views/DashboardView";


enum STATE {
    DEFAULT = "DEFAULT",
    ADD_ACCOUNT = "ADD_ACCOUNT",
}


export default function Index() {
    const [state, setState] = useState(STATE.DEFAULT);
    const [expanded, setExpanded] = useState(false);

    const openAddAccountModal = () => {
        setState(STATE.ADD_ACCOUNT);
        setExpanded(false);
    }

    const handleModalClose = () => {
        setState(STATE.DEFAULT);
    }

    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    const handleOutsidePress = () => {
        setExpanded(false);
    };

  return (
        <View className="flex flex-1">
    <View className="flex-1 bg-white">
      <Text className="p-4">Home</Text>

      {/* Overlay to detect outside clicks - only visible when expanded */}
      {expanded && (
        <TouchableWithoutFeedback onPress={handleOutsidePress}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        </TouchableWithoutFeedback>
      )}

      {/* Floating Add button (copied from staticOptions) */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={toggleExpanded}
        className={`absolute bottom-24 right-5  ${
          expanded ? "bg-black w-64 py-6 rounded-[25px]" : "bg-black w-40 py-4 rounded-full"
        }`}
      >
        {!expanded ? (
          <View className="items-center justify-center">
            <Text className="text-white text-3xl font-semibold">Add  +</Text>
          </View>
        ) : (
          <View className="flex-col justify-center px-6 space-y-3">
            <TouchableOpacity
              className="flex-row justify-between items-center pb-3"
              onPress={openAddAccountModal}
            >
              <Text className="text-white text-3xl font-semibold">Account</Text>
              <Text className="text-white text-3xl">›</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row justify-between items-center" onPress={() => { /* TODO: Transaction action */ setExpanded(false); }}>
              <Text className="text-white text-3xl font-semibold">Transaction</Text>
              <Text className="text-white text-3xl">›</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

      {/* AddAccount modal */}
      <AddAccountModal isVisible={state === STATE.ADD_ACCOUNT} onClose={handleModalClose} />
        <DashboardView></DashboardView>
    </View>
  );
}
