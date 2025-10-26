import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

export default function RegisterScreen() {
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

        <Text style={styles.subTitle}>Sign up</Text>

        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
        />

        <TouchableOpacity style={styles.continueBtn}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>

        {/* Divider Line */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.divider} />
        </View>

        {/* Google Button */}
        <TouchableOpacity style={styles.oauthBtn}>
          <Image
            source={require("../assets/images/GoogleLogo.png")}
            style={styles.oauthIcon}
          />
          <Text style={styles.oauthText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Apple Button */}
        <TouchableOpacity style={styles.oauthBtn}>
          <Image
            source={require("../assets/images/AppleLogo.png")}
            style={styles.oauthIcon}
          />
          <Text style={styles.oauthText}>Continue with Apple</Text>
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
    fontSize: 16,
  },
  continueBtn: {
    backgroundColor: "#000",
    borderRadius: 25,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
    elevation: 4, // leichte Schatten wie im Figma
  },
  continueText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
    width: "100%",
  },
  divider: {
    flex: 1,
    height: 2,
    backgroundColor: "#000000",
  },
  orText: {
    fontSize: 15,
    marginHorizontal: 10,
    color: "#6B7280",
    fontWeight: "500",
  },
  oauthBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 25,
    paddingVertical: 12,
    width: "100%",
    justifyContent: "center",
    marginBottom: 10,
  },
  oauthIcon: {
    width: 22,
    height: 22,
    marginRight: 10,
    resizeMode: "contain",
  },
  oauthText: {
    fontSize: 16,
  },
});
