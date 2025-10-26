import {Image, Modal, Text, TextInput, TouchableOpacity, View} from "react-native";
import {useEffect, useMemo, useState} from "react";

const BRANDFETCH_CLIENT_ID = process.env.EXPO_PUBLIC_LOGO_API_KEY;

const getBrandfetchLogoUrl = (domain: string) => {
    if (!BRANDFETCH_CLIENT_ID) {
        return undefined;
    }

    return `https://cdn.brandfetch.io/${domain}/icon?c=${BRANDFETCH_CLIENT_ID}`;
};

type Props = {
    isVisible: boolean;
    onClose: () => void;
};

export default function CreateAccountModal({isVisible, onClose}: Props) {
    const [isModalVisible, setIsModalVisible] = useState<boolean>(isVisible);
    const [email, setEmail] = useState<string>("");


    useEffect(() => {
        setIsModalVisible(isVisible);
    }, [isVisible]);

    const handleClose = () => {
        setIsModalVisible(false);
        onClose();
    };

    const providers = useMemo(
        () => [
            {label: "Continue with Apple", domain: "apple.com"},
            {label: "Continue with Google", domain: "google.com"},
        ],
        [],
    );

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={handleClose}
        >
            <View className="flex-1 justify-end">
                <View className={"h-1/2"} onTouchEnd={handleClose}/>
                <View className="h-1/2 bg-white rounded-t-3xl p-6">
                    <Text className={"text-2xl text-gray-400"}>Sign Up</Text>
                    <View>
                        <View>
                            <TextInput
                                className={"text-black-400 text-[20px] border border-black rounded-full h-[50px] px-4 pb-1 mt-[60px]"}
                                placeholder={"Enter your Email"}
                                value={email}
                                onChangeText={setEmail}
                            />
                            <TouchableOpacity
                                className={"bg-black rounded-full h-[50px] mt-[20px] flex items-center justify-center"}
                                activeOpacity={0.85}
                            >
                                <Text className={"text-white font-bold text-[15px]"}>
                                    Continue
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View className={"flex items-center justify-center mt-[20px]"}>
                            <Text className={"font-bold text-xl"}>
                                OR
                            </Text>
                        </View>
                        <View className={"flex flex-col gap-[20px] mt-[20px]"}>
                            <TouchableOpacity
                                className={"flex flex-row items-center justify-center h-[50px] border border-black rounded-full px-5"}
                            >
                                <Image
                                    source={{uri: getBrandfetchLogoUrl("apple.com")}}
                                    style={{width: 40, height: 40}}
                                    resizeMode="contain"
                                />

                                <Text className={"font-bold text-[15px]"}>Continue with Apple</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className={"flex flex-row items-center justify-center h-[50px] border border-black rounded-full gap-3 px-5"}
                            >
                                <Image
                                    source={{uri: getBrandfetchLogoUrl("google.com")}}
                                    style={{width: 30, height: 30}}
                                    resizeMode="contain"
                                />

                                <Text className={"font-bold text-[15px]"}>Continue with Google</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
