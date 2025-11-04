import React, {useState} from 'react';
import {View, Text, TouchableOpacity, ScrollView, TextInput} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ChevronDown} from "lucide-react-native";

export default function AddAccountScreen() {
    const [state, setState] = useState<'manual' | 'connect'>('manual');

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{paddingBottom: 32}}>
                <View className="h-10"/>
                <View className="px-6">
                    <Text className="text-3xl font-extrabold text-black mb-6">Account</Text>

                    <Text className="text-lg font-semibold text-black mb-3">Type</Text>
                    <View
                        className="flex-row justify-around items-center mb-6 bg-[#F1F1F2] w-full h-[40px] rounded-full">
                        <TouchableOpacity onPress={() => setState('manual')} className={`w-1/2 h-full flex justify-center items-center ${state === 'manual' ? 'bg-black shadow-md flex items-center rounded-full' : ''}`}>
                            <Text className={`text-xl ${state === 'manual' ? 'text-white' : 'text-neutral-500'}`}>
                                Manual
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setState('connect')} className={`w-1/2 h-full flex justify-center items-center ${state === 'connect' ? 'bg-black shadow-md flex items-center rounded-full' : ''}`}>
                            <Text className={`text-xl ${state === 'connect' ? 'text-white' : 'text-neutral-500'}`}>
                                Connect
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text className="text-lg font-semibold text-black mb-2">Name</Text>
                    <View className="bg-neutral-100 rounded-2xl px-5 py-4 mb-4">
                        <TextInput
                            className="text-black"
                            placeholder={"e.g. Savings"}
                        />
                    </View>

                    <Text className="text-lg font-semibold text-black mb-2">Provider</Text>
                    <View className="bg-neutral-100 rounded-2xl px-5 py-4 mb-4 flex-row justify-between items-center">
                        <Text className="text-neutral-900">FT</Text>
                        <ChevronDown className="text-neutral-500"/>
                    </View>

                    <Text className="text-lg font-semibold text-black mb-2">Initial Amount</Text>
                    <View className="bg-neutral-100 rounded-2xl px-5 py-4 mb-8">
                        <TextInput
                            className="text-black"
                            placeholder={"e.g. € 0.00"}
                            keyboardType={"numbers-and-punctuation"}
                        />
                    </View>

                    <TouchableOpacity className="bg-black shadow-md rounded-full py-4">
                        <Text className="text-center text-white font-semibold text-lg">Add Account</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
