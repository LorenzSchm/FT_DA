import {View, Text, useWindowDimensions, Platform, Image} from "react-native";
import Logo from "../assets/icons/icon.svg";


const iosShadow = {
    shadowColor: "#000",
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 0.5,
    shadowRadius: 5,
    overflow: "visible",
    margin: 14,
};
const androidShadow = {
    elevation: 6,
    marginRight: 10,
    marginBottom: 10,
};

export default function Card({
                                 kind,
                                 amount,
                                 currency,
                                 name,
                                 provider
                             }: {
    kind: string;
    amount: number;
    currency: string;
    name: string;
    provider: string;
}) {
    const {width} = useWindowDimensions();

    const shadowStyle = Platform.select({
        ios: iosShadow,
        android: androidShadow,
        default: {},
    });

    return (
        <View
            className="bg-black gap-2 rounded-[25px] p-5"
            style={[{width: 317, height: 181}, shadowStyle]}
        >
            <View className={" flex-row justify-between items-center"}>
                <View>
                    <Text className="text-white font-bold">{name}</Text>
                    <Text
                        className={`text-[24px] font-bold ${amount < 0 ? "text-red-500" : "text-green-500"}`}
                    >
                        {amount < 0 ? "-" : "+"}
                        {Math.abs(amount)} {currency === "USD" ? "$" : "€"}
                    </Text>
                </View>
                <View>
                    {provider === "FT" && (
                        <Logo width={30} height={30}/>
                    )}
                </View>
            </View>
        </View>
    );
}
