import React, { useEffect } from "react";
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "../components/ui/text";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

export default function Screen() {
  const db = useSQLiteContext();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      await db.runAsync(`CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT,
        contact TEXT,
        bloodType TEXT,
        email TEXT,
        dob TEXT
      )`);

      const existing = await db.getAllAsync('SELECT * FROM user_profile LIMIT 1');
      if (existing.length > 0) {
        router.replace("/(tabs)/home");
      }
    };
    checkUser();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <Image source={require("../assets/images/logo.png")} style={styles.logo} />
          <Text style={styles.logoText}>CKD</Text>
          <Text style={styles.appDescription}>App For Chronically Ill CKD Patients</Text>
        </View>

        <Text style={styles.welcomeText}>We are so excited to have you here. If you haven't already, create an account to get start.</Text>

        <View style={styles.buttonContainer}>
          {/* <Link href="/login" asChild>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Log In</Text>
            </TouchableOpacity>
          </Link> */}

          <Link href="/login" asChild>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    paddingBottom: 50,
  },
  logoText: {
    color: "#2D7FF9",
    fontSize: 28,
    fontWeight: "bold",
    paddingTop: 20,
  },
  appDescription: {
    color: "#2D7FF9",
    fontSize: 14,
    marginTop: 5,
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    marginBottom: 40,
  },
  buttonContainer: {
    width: "100%",
  },
  primaryButton: {
    backgroundColor: "#2D7FF9",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#E8F1FF",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#2D7FF9",
    fontSize: 16,
    fontWeight: "600",
  }
});