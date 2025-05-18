import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useRouter } from 'expo-router';

export default function UserProfileForm() {
  const db = useSQLiteContext();
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: '',
    contact: '',
    bloodType: '',
    email: '',
    dob: '',
  });

  useEffect(() => {
    db.runAsync(`
      CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT,
        contact TEXT,
        bloodType TEXT,
        email TEXT,
        dob TEXT
      )
    `);
  }, []);

  interface FormState {
    fullName: string;
    contact: string;
    bloodType: string;
    email: string;
    dob: string;
  }

  const handleChange = (key: keyof FormState, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const isValidDate = (dateStr: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(dateStr);
  };

  const handleSave = async () => {
    const { fullName, contact, bloodType, email, dob } = form;
    if (!fullName || !contact || !bloodType || !email || !dob) {
      Alert.alert('Validation', 'Please fill in all fields');
      return;
    }

    if (!isValidDate(dob)) {
      Alert.alert('Validation', 'DOB must be in YYYY-MM-DD format');
      return;
    }

    try {
      await db.runAsync(
        `INSERT INTO user_profile (fullName, contact, bloodType, email, dob) VALUES (?, ?, ?, ?, ?)`,
        [fullName, contact, bloodType, email, dob]
      );
      Alert.alert('Success', 'User profile saved successfully', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/home') }
      ]);
    } catch (error) {
      console.error('DB Insert Error:', error);
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.headerTitle}>New Account</Text>

          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              value={form.fullName}
              onChangeText={(val) => handleChange('fullName', val)}
              keyboardType="name-phone-pad"
              autoCapitalize="words"
            />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="+61785254"
              value={form.contact}
              onChangeText={(val) => handleChange('contact', val)}
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Blood Type</Text>
            <TextInput
              style={styles.input}
              placeholder="A+"
              value={form.bloodType}
              onChangeText={(val) => handleChange('bloodType', val)}
            />

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="example@example.com"
              value={form.email}
              onChangeText={(val) => handleChange('email', val)}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Date of Birth (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="1990-01-01"
              value={form.dob}
              onChangeText={(val) => {
                let cleaned = val.replace(/[^0-9]/g, '');

                if (cleaned.length > 4 && cleaned.length <= 6) {
                  cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
                } else if (cleaned.length > 6) {
                  cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4, 6) + '-' + cleaned.slice(6, 8);
                }

                if (cleaned.length > 10) cleaned = cleaned.slice(0, 10);

                handleChange('dob', cleaned);
              }}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.loginButton} onPress={handleSave}>
              <Text style={styles.loginButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#2D7FF9",
    marginBottom: 30,
  },
  formContainer: {
    width: "100%",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#F0F5FF",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#2D7FF9",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  }
});
