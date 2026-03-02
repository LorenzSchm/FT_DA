import React from "react";
import { View, Text } from "react-native";
import { BaseToastProps } from "react-native-toast-message";
import { CheckCircle, XCircle, Info } from "lucide-react-native";

function SuccessToast({ text1, text2 }: BaseToastProps) {
    return (
        <View className="bg-black rounded-2xl mx-4 px-5 py-4 flex-row items-center shadow-lg" style={{ gap: 12 }}>
            <CheckCircle size={22} color="#4ade80" />
            <View className="flex-1">
                {text1 ? <Text className="text-white font-semibold text-[15px]">{text1}</Text> : null}
                {text2 ? <Text className="text-gray-400 text-[13px] mt-0.5">{text2}</Text> : null}
            </View>
        </View>
    );
}

function ErrorToast({ text1, text2 }: BaseToastProps) {
    return (
        <View className="bg-black rounded-2xl mx-4 px-5 py-4 flex-row items-center shadow-lg" style={{ gap: 12 }}>
            <XCircle size={22} color="#f87171" />
            <View className="flex-1">
                {text1 ? <Text className="text-white font-semibold text-[15px]">{text1}</Text> : null}
                {text2 ? <Text className="text-gray-400 text-[13px] mt-0.5">{text2}</Text> : null}
            </View>
        </View>
    );
}

function InfoToast({ text1, text2 }: BaseToastProps) {
    return (
        <View className="bg-black rounded-2xl mx-4 px-5 py-4 flex-row items-center shadow-lg" style={{ gap: 12 }}>
            <Info size={22} color="#60a5fa" />
            <View className="flex-1">
                {text1 ? <Text className="text-white font-semibold text-[15px]">{text1}</Text> : null}
                {text2 ? <Text className="text-gray-400 text-[13px] mt-0.5">{text2}</Text> : null}
            </View>
        </View>
    );
}

export const toastConfig = {
    success: (props: BaseToastProps) => <SuccessToast {...props} />,
    error: (props: BaseToastProps) => <ErrorToast {...props} />,
    info: (props: BaseToastProps) => <InfoToast {...props} />,
};
