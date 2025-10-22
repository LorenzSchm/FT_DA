import { Tabs } from "expo-router";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
    return (
        <Tabs>
            <Tabs.Screen name="index" options={{ headerShown: false }} />
            <Tabs.Screen name="settings" options={{ headerShown: false }} />
        </Tabs>
    )
}