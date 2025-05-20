import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity,
  TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, Modal, FlatList
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

  const [bloodModalVisible, setBloodModalVisible] = useState(false);
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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

  interface UserProfileFormState {
    fullName: string;
    contact: string;
    bloodType: string;
    email: string;
    dob: string;
  }

  type UserProfileFormKey = keyof UserProfileFormState;

  const handleChange = (key: UserProfileFormKey, value: string) => {
    setForm({ ...form, [key]: value });
  };

  const handleSave = async () => {
    const { fullName, contact, bloodType, email, dob } = form;

    const nameRegex = /^[A-Za-z\s]+$/;
    const phoneRegex = /^[0-9+\s()-]{8,}$/;
    const bloodTypeRegex = /^(A|B|AB|O)[+-]$/i;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!fullName || !contact || !bloodType || !email || !dob) {
      Alert.alert('Validation', 'Please fill in all fields');
      return;
    }

    if (!nameRegex.test(fullName)) {
      Alert.alert('Validation', 'Full Name should only contain letters and spaces');
      return;
    }

    if (!phoneRegex.test(contact)) {
      Alert.alert('Validation', 'Please enter a valid phone number');
      return;
    }

    if (!bloodTypeRegex.test(bloodType)) {
      Alert.alert('Validation', 'Blood Type should be one of A+, B-, O+, etc.');
      return;
    }

    if (!emailRegex.test(email)) {
      Alert.alert('Validation', 'Please enter a valid email address');
      return;
    }

    if (!dobRegex.test(dob)) {
      Alert.alert('Validation', 'Date of Birth must be in YYYY-MM-DD format');
      return;
    }

    try {
      await db.runAsync(
        `INSERT INTO user_profile (fullName, contact, bloodType, email, dob) VALUES (?, ?, ?, ?, ?)`,
        [fullName, contact, bloodType.toUpperCase(), email.toLowerCase(), dob]
      );
      Alert.alert('Success', 'User profile saved successfully', [
        { text: 'OK', onPress: () => router.replace('/tab/home') }
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
              keyboardType="default"
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
            <TouchableOpacity
              style={styles.input}
              onPress={() => setBloodModalVisible(true)}
            >
              <Text style={{ fontSize: 16 }}>
                {form.bloodType || 'Select Blood Type'}
              </Text>
            </TouchableOpacity>

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

      {/* Blood Type Modal */}
      <Modal
        visible={bloodModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBloodModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Blood Type</Text>
            <FlatList
              data={bloodTypes}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    handleChange('bloodType', item);
                    setBloodModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
    marginTop: 10,
    marginBottom: 20,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    width: '80%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  modalItemText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
