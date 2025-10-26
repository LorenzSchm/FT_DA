import { Image } from "expo-image";
import { Platform, StyleSheet, View, Button } from "react-native";

import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import NavBar from "@/components/NavBar";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {/* Beispieltext zum Test */}
      <ThemedText>INDEX HOME</ThemedText>

      {/* Button führt zum Register-Screen */}
      <Button title="Go to Register" onPress={() => router.push("/register")} />

      {/* Vorher war hier nur die NavBar */}
      {/* return <NavBar active={"home"}></NavBar>; */}

      {/* NavBar bleibt sichtbar unten */}
      <NavBar active={"home"} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
