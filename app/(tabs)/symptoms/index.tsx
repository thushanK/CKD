import React, { useEffect, useState } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Modal,
  TextInput, Alert, ScrollView
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useSQLiteContext } from 'expo-sqlite';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Feather } from '@expo/vector-icons';

import { useRouter } from "expo-router"; // <-- Add this for navigation

import {
	Smile, Droplet, Activity, Thermometer, Settings,
	Search, Phone, Pill, Home, User
  } from 'lucide-react-native';

type SymptomEntry = {
  id: number;
  date: string;
  symptom: string;
  description: string;
};

export default function SymptomsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [symptom, setSymptom] = useState('');
  const [description, setDescription] = useState('');
  const [entries, setEntries] = useState<SymptomEntry[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SymptomEntry | null>(null);

  useEffect(() => {
    db.runAsync(`
      CREATE TABLE IF NOT EXISTS symptom_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT UNIQUE,
        symptom TEXT,
        description TEXT
      )
    `).then(fetchSymptoms);
  }, []);

  const fetchSymptoms = async () => {
    const result = await db.getAllAsync<SymptomEntry>('SELECT * FROM symptom_log ORDER BY date DESC');
    setEntries(result);
  };

  const onDayPress = async (day: any) => {
    setSelectedDate(day.dateString);
    const result = await db.getAllAsync<SymptomEntry>('SELECT * FROM symptom_log WHERE date = ?', day.dateString);
    if (result.length > 0) {
      const entry = result[0];
      setEditingEntry(entry);
      setSymptom(entry.symptom);
      setDescription(entry.description);
    } else {
      setEditingEntry(null);
      setSymptom('');
      setDescription('');
    }
    setModalVisible(true);
  };

  const saveSymptom = async () => {
    if (!symptom) {
      Alert.alert('Please enter a symptom');
      return;
    }
    if (editingEntry) {
      await db.runAsync('UPDATE symptom_log SET symptom = ?, description = ? WHERE id = ?', symptom, description, editingEntry.id);
    } else {
      await db.runAsync('INSERT OR REPLACE INTO symptom_log (date, symptom, description) VALUES (?, ?, ?)', selectedDate, symptom, description);
    }
    resetModal();
    fetchSymptoms();
  };

  const resetModal = () => {
    setSymptom('');
    setDescription('');
    setEditingEntry(null);
    setModalVisible(false);
  };

  const confirmDelete = () => {
    Alert.alert('Delete Symptom', 'Are you sure you want to delete this symptom entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: deleteSymptom }
    ]);
  };

  const deleteSymptom = async () => {
    if (editingEntry) {
      await db.runAsync('DELETE FROM symptom_log WHERE id = ?', editingEntry.id);
      resetModal();
      fetchSymptoms();
    }
  };

  const generatePDF = async () => {
    const rows = entries.map((entry, i) => `
      <tr style="background:${i % 2 === 0 ? '#f9f9f9' : '#fff'}">
        <td>${entry.date}</td>
        <td>${entry.symptom}</td>
        <td>${entry.description}</td>
      </tr>
    `).join('');

    const html = `
      <html>
        <head>
          <style>
            h1 { text-align: center; color: #4caf50; }
            table { width: 100%; border-collapse: collapse; font-size: 14px; }
            th { background-color: #4caf50; color: white; padding: 8px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #ccc; }
          </style>
        </head>
        <body>
          <h1>Symptoms Report</h1>
          <table>
            <thead><tr><th>Date</th><th>Symptom</th><th>Description</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html, base64: false });
    await Sharing.shareAsync(uri);
  };

  const markedDates = entries.reduce((acc, curr) => {
    acc[curr.date] = {
      marked: true,
      selected: curr.date === selectedDate,
      selectedColor: '#4caf50',
    };
    return acc;
  }, {} as Record<string, any>);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Symptoms Tracker</Text>

      <Calendar
        onDayPress={onDayPress}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            ...(markedDates[selectedDate] || {}),
            selected: true,
            selectedColor: '#4caf50',
          },
        }}
      />

      <TouchableOpacity style={styles.pdfButton} onPress={generatePDF}>
        <Text style={styles.pdfButtonText}>Download Report</Text>
      </TouchableOpacity>

      <ScrollView style={styles.symptomScroll} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.symptomList}>
          {entries.map((entry) => (
            <View key={entry.id} style={styles.symptomItem}>
              <View style={styles.symptomTextContainer}>
                <Text style={styles.symptomDate}>{entry.date}</Text>
                <Text style={styles.symptomTitle}>{entry.symptom}</Text>
                <Text style={styles.symptomDescription}>{entry.description}</Text>
              </View>
              <View style={styles.iconActions}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedDate(entry.date);
                    setSymptom(entry.symptom);
                    setDescription(entry.description);
                    setEditingEntry(entry);
                    setModalVisible(true);
                  }}
                >
                  <Feather name="edit" size={20} color="#4caf50" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setEditingEntry(entry);
                    confirmDelete();
                  }}
                  style={{ marginLeft: 16 }}
                >
                  <Feather name="trash-2" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingEntry ? 'Edit Symptom' : 'Add Symptom'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Symptom (e.g., Headache)"
              value={symptom}
              onChangeText={setSymptom}
            />

            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveSymptom}>
              <Text style={styles.saveButtonText}>{editingEntry ? 'Update' : 'Save'}</Text>
            </TouchableOpacity>

            {editingEntry && (
              <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.cancelButton} onPress={resetModal}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
        <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/(tabs)/home")}>
                  <Home size={24} color="white" /><Text style={styles.navText}>Home</Text></TouchableOpacity>
        
                <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/(tabs)/symptoms")}>
                  <Thermometer size={24} color="white" /><Text style={styles.navText}>Symptoms</Text></TouchableOpacity>
        
                <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/(tabs)/medications")}>
                  <Pill size={24} color="white" /><Text style={styles.navText}>Meds</Text></TouchableOpacity>
                <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/(tabs)/profile")}>
                  <User size={24} color="white" /><Text style={styles.navText}>Profile</Text></TouchableOpacity>
               </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 16,
    color: '#4caf50',
    textAlign: 'center',
    paddingTop: "5%",
  },
  pdfButton: {
    backgroundColor: '#e8f5e9',
    margin: 16,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  pdfButtonText: {
    color: '#4caf50',
    fontWeight: '600',
    fontSize: 16,
  },
  symptomScroll: {
    flex: 1,
    marginTop: 8,
  },
  symptomList: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  symptomItem: {
    backgroundColor: '#f1f8e9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symptomTextContainer: {
    flex: 1,
  },
  symptomDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  symptomTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
  },
  symptomDescription: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  iconActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#bdbdbd',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  bottomNav: {
		position: 'absolute', bottom: 0, left: 0, right: 0,
		backgroundColor: '#4caf50', flexDirection: 'row', justifyContent: 'space-around',
		paddingVertical: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16,
	  },
	  navButton: {
		alignItems: 'center',
	  },
	  navText: {
		color: 'white', fontSize: 12, marginTop: 4,
	  }
});
