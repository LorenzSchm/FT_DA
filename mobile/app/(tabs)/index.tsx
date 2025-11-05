'use client';

import {View, Text, TouchableOpacity, TouchableWithoutFeedback} from "react-native";
import React, {useState} from "react";
import AddAccountModal from "@/components/modals/AddAccountModal";
import DashboardView from "@/components/Views/DashboardView";

export default function Index() {
    return (
        <View className="flex flex-1 bg-white">
            <DashboardView/>
        </View>
    );
}
