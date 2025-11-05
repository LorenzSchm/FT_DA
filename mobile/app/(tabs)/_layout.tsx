import { Stack, Tabs } from "expo-router";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}
