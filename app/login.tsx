import { useRouter } from "expo-router";
import { useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
} from "react-native";

export default function PINLoginScreen() {
  const [pin, setPin] = useState("");
  const router = useRouter();

  const login = () => {
    if (pin.length === 4) {
      setTimeout(() => {
        router.navigate("/(tabs)/home");
      }, 500);
    } else {
      alert("Please enter a 4-digit PIN");
    }
  };

const handleKeyPress = (value: string): void => {
	if (value === "del") {
		setPin(pin.slice(0, -1));
	} else if (pin.length < 4) {
		setPin(pin + value);
	}
};

  const renderPinDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i < pin.length ? "#2D7FF9" : "#ccc" },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderKeypad = () => {
    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];
    return (
      <View style={styles.keypad}>
        {keys.map((key, i) => (
          <Pressable
            key={i}
            style={styles.keypadKey}
            onPress={() => handleKeyPress(key)}
            disabled={key === ""}
          >
            <Text style={styles.keypadKeyText}>{key === "del" ? "←" : key}</Text>
          </Pressable>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Enter Passcode</Text>
      </View>

      <View style={styles.pinContainer}>{renderPinDots()}</View>

      {renderKeypad()}

      <TouchableOpacity style={styles.loginButton} onPress={login}>
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    padding: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#2D7FF9",
  },
  pinContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 20,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ccc",
  },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 40,
  },
  keypadKey: {
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 35,
  },
  keypadKeyText: {
    fontSize: 28,
    fontWeight: "600",
    color: "#333",
  },
  loginButton: {
    backgroundColor: "#2D7FF9",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});