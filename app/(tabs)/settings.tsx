import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();

  const handleClearContacts = () => {
    Alert.alert(
      "Delete All Contacts",
      "Are you sure you want to permanently delete all contact data?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await db.runAsync("DROP TABLE IF EXISTS contacts");
              Alert.alert("Success", "All contacts have been deleted.");
            } catch (err) {
              console.log("Error deleting contacts table:", err);
              Alert.alert("Error", "Failed to delete contacts.");
            }
          },
        },
      ]
    );
  };

  const handleClearUserProfile = () => {
    Alert.alert(
      "Delete User Profile",
      "Are you sure you want to permanently delete user profile data?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await db.runAsync("DROP TABLE IF EXISTS user_profile");
              Alert.alert("Success", "User profile has been deleted.");
            } catch (err) {
              console.log("Error deleting user_profile table:", err);
              Alert.alert("Error", "Failed to delete user profile.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.warningText}>
        ⚠️ Warning: This page allows you to permanently delete all data.
      </Text>

      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity style={styles.clearButton} onPress={handleClearContacts}>
        <Text style={styles.clearButtonText}>Clear All Contacts</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.clearButton} onPress={handleClearUserProfile}>
        <Text style={styles.clearButtonText}>Clear User Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.homeButton} onPress={() => router.push("/home")}>
        <Text style={styles.homeButtonText}>Go to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  warningText: {
    color: "#d32f2f",
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 40,
    color: "#2196F3",
    fontWeight: "bold",
  },
  clearButton: {
    backgroundColor: "#f44336",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  homeButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  homeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
