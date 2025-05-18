// MedicationScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Modal,
  ScrollView, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Calendar } from 'react-native-calendars';
import {
  Phone, PlusCircle, Trash2, Pencil,
  Smile, Droplet, Activity, Thermometer,
  Settings, Search, Pill, Home, User
} from "lucide-react-native";

export default function MedicationScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const [medications, setMedications] = useState<any[]>([]);
  const [selectedMed, setSelectedMed] = useState<any | null>(null);
  const [takenEntries, setTakenEntries] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  useEffect(() => {
    db.runAsync(`
      CREATE TABLE IF NOT EXISTS medications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        amount TEXT,
        times TEXT,
        period TEXT,
        color TEXT
      )
    `);
    db.runAsync(`
      CREATE TABLE IF NOT EXISTS medication_taken (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        medication_id INTEGER,
        time_taken TEXT,
        date TEXT,
        status TEXT
      )
    `);
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    const meds = await db.getAllAsync('SELECT * FROM medications');
    setMedications(meds);
    const entries = await db.getAllAsync('SELECT * FROM medication_taken WHERE date = ?', todayStr);
    setTakenEntries(entries);
  };

  const addTimeTaken = async (medId: number, time: string) => {
    await db.runAsync('INSERT INTO medication_taken (medication_id, time_taken, date, status) VALUES (?, ?, ?, ?)', medId, time, todayStr, 'done');
    fetchMedications();
  };

  const deleteEntry = async (entryId: number) => {
    await db.runAsync('DELETE FROM medication_taken WHERE id = ?', entryId);
    fetchMedications();
  };

  const updateEntry = async (entryId: number, newStatus: string) => {
    await db.runAsync('UPDATE medication_taken SET status = ? WHERE id = ?', newStatus, entryId);
    fetchMedications();
  };

  const getMarkedDates = () => {
    const marked: any = {};
    medications.forEach((med) => {
      const [start, end] = med.period.split(' to ');
      const startDate = new Date(start);
      const endDate = new Date(end);
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (!marked[dateStr]) marked[dateStr] = { dots: [] };
        marked[dateStr].dots.push({ key: `${med.id}`, color: med.color });
      }
    });
    return marked;
  };

  const medsOnSelectedDate = medications.filter((med) => {
    const [start, end] = med.period.split(' to ');
    return selectedDate >= start && selectedDate <= end;
  });

  const generatePDF = async () => {
    const entries = await db.getAllAsync(`
      SELECT m.name, m.amount, m.times, m.period, t.time_taken, t.date, t.status
      FROM medication_taken t
      JOIN medications m ON m.id = t.medication_id
      ORDER BY t.date DESC
    `);
    const rows = entries.map((entry: any, i: number) => `
      <tr style="background:${i % 2 === 0 ? '#f9f9f9' : '#fff'}">
        <td>${entry.name}</td>
        <td>${entry.amount} mg</td>
        <td>${entry.times}</td>
        <td>${entry.period}</td>
        <td>${entry.time_taken}</td>
        <td>${entry.date}</td>
        <td>${entry.status}</td>
      </tr>
    `).join('');

    const html = `
      <html><head><style>
        h1 { text-align: center; color: #2196F3; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #2196F3; color: white; }
      </style></head><body>
      <h1>Taken Medication Report</h1>
      <table><thead><tr><th>Name</th><th>Amount</th><th>Times</th><th>Period</th><th>Time Taken</th><th>Date</th><th>Status</th></tr></thead>
      <tbody>${rows}</tbody></table></body></html>
    `;
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  return (
    <SafeAreaView style={styles.container}>
    <Text style={styles.sectionTitle}>Medication Calendar</Text>
    <Calendar
      markingType="multi-dot"
      markedDates={{
        ...getMarkedDates(),
        [selectedDate]: { ...(getMarkedDates()[selectedDate] || {}), selected: true }
      }}
      onDayPress={(day: { dateString: string; day: number; month: number; year: number }) => setSelectedDate(day.dateString)}
    />

      <Text style={styles.sectionTitle}>Medications on {selectedDate}</Text>
      {medsOnSelectedDate.length === 0 ? (
        <Text style={{ textAlign: 'center', color: '#888' }}>No medications for selected date.</Text>
      ) : (
        <ScrollView style={{ maxHeight: 200 }}>
          {medsOnSelectedDate.map((med) => (
            <TouchableOpacity key={med.id} onPress={() => { setSelectedMed(med); setModalVisible(true); }}>
              <View style={[styles.medItem, { borderLeftColor: med.color }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.medDetail}>Amount: {med.amount} mg</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.addButton} onPress={generatePDF}>
        <Text style={styles.addButtonText}>Download Taken Meds PDF</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.addButton} onPress={() => router.replace('/(tabs)/medications')}>
        <Text style={styles.addButtonText}>Go to All Medications</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedMed && (
              <>
                <Text style={styles.medName}>{selectedMed.name}</Text>
                <Text style={styles.medDetail}>Amount: {selectedMed.amount} mg</Text>
                <Text style={styles.medDetail}>Period: {selectedMed.period}</Text>
                {selectedMed.times.split(', ').map((time: string) => (
                  <TouchableOpacity
                    key={time}
                    onPress={() => addTimeTaken(selectedMed.id, time)}
                    style={{ padding: 10, marginVertical: 2, backgroundColor: '#4CAF50', borderRadius: 4 }}>
                    <Text style={{ color: '#fff' }}>{time} - Take</Text>
                  </TouchableOpacity>
                ))}
                <Text style={styles.sectionTitle}>Taken Entries</Text>
                <ScrollView style={{ maxHeight: 200 }}>
                  {takenEntries.filter(e => e.medication_id === selectedMed?.id).map(entry => (
                    <View key={entry.id} style={{ padding: 6, backgroundColor: '#eee', marginVertical: 4, borderRadius: 4 }}>
                      <Text>{entry.date} - {entry.time_taken} - {entry.status}</Text>
                      <View style={{ flexDirection: 'row', marginTop: 4 }}>
                        <TouchableOpacity onPress={async () => {
                          await updateEntry(entry.id, 'done');
                          const refreshed = await db.getAllAsync('SELECT * FROM medication_taken WHERE date = ?', todayStr);
                          setTakenEntries(refreshed);
                        }} style={{ marginRight: 10 }}>
                          {/* <Text style={{ color: 'green' }}>Mark Done</Text> */}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={async () => {
                          await deleteEntry(entry.id);
                          const refreshed = await db.getAllAsync('SELECT * FROM medication_taken WHERE date = ?', todayStr);
                          setTakenEntries(refreshed);
                        }}>
                          <Text style={{ color: 'red' }}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/(tabs)/home")}>
          <Home size={24} color="white" /><Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/(tabs)/contacts")}>
          <Phone size={24} color="white" /><Text style={styles.navText}>Contact</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/(tabs)/medications")}>
          <Pill size={24} color="white" /><Text style={styles.navText}>Meds</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/(tabs)/profile")}>
          <User size={24} color="white" /><Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    paddingTop: '7%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  medItem: {
    flexDirection: 'row',
    borderLeftWidth: 5,
    padding: 12,
    marginVertical: 8,
    backgroundColor: '#f0f4f8',
    borderRadius: 8,
    alignItems: 'center',
  },
  medName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  medDetail: {
    fontSize: 14,
    color: '#555',
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
  },
  closeButton: {
    marginTop: 12,
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  navButton: {
    alignItems: 'center',
  },
  navText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  }
});
