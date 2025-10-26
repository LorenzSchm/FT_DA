import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useRouter } from "expo-router";

export default function RegisterCardStepOne() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={require("../assets/images/LondonBG.png")}
        style={styles.headerImage}
        resizeMode="cover"
      />

      {/* Content Card */}
      <View style={styles.card}>
        <Text style={styles.heading}>Finance Tracker</Text>

        <Text style={styles.subTitle}>Sign Up</Text>

        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />

        <TextInput
          placeholder="Enter your password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          style={styles.input}
        />

        <TextInput
          placeholder="Repeat your password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          style={styles.input}
        />

        {/* Progress Indicator (Dots) */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDotActive} />
          <View style={styles.progressDot} />
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => router.push("/registerCardStepTwo")}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerImage: {
    width: "100%",
    height: 280,
  },
  card: {
    marginTop: -40,
    backgroundColor: "#fff",
    padding: 25,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    alignItems: "center",
  },
  heading: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 60,
    color: "#fff",
    position: "absolute",
    top: -230,
    textAlign: "center",
    width: "100%",
  },
  subTitle: {
    fontSize: 20,
    color: "#9CA3AF",
    marginBottom: 40,
    marginTop: 5,
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 25,
    padding: 14,
    paddingLeft: 20,
    marginBottom: 15,
    fontSize: 20,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginVertical: 10,
  },
  progressDotActive: {
    width: 10,
    height: 10,
    backgroundColor: "#111827",
    borderRadius: 5,
  },
  progressDot: {
    width: 10,
    height: 10,
    backgroundColor: "#D1D5DB",
    borderRadius: 5,
  },
  continueBtn: {
    backgroundColor: "#000",
    borderRadius: 25,
    paddingVertical: 14,
    width: "100%",
    marginTop: 15,
    alignItems: "center",
  },
  continueText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
