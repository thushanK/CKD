import React, { useEffect, useState } from 'react';
import {
  SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Modal,
  TextInput, Alert, ScrollView, Dimensions
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { BarChart } from 'react-native-chart-kit';
import { useSQLiteContext } from 'expo-sqlite';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {
  Smile, Droplet, Activity, Thermometer, Settings,
  Search, Phone, Pill, Home, User
} from 'lucide-react-native';
import { Link, useRouter } from "expo-router";


const moodLevels = [
  { emoji: '😢', label: 'Sad' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '😊', label: 'Happy' },
  { emoji: '😄', label: 'Excited' },
];

type MoodEntry = {
  id: number;
  mood: string;
  comment: string;
  date: string;
};

export default function MoodScreen() {
  const db = useSQLiteContext();
  const screenWidth = Dimensions.get('window').width;
 const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMood, setSelectedMood] = useState('');
  const [comment, setComment] = useState('');
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MoodEntry | null>(null);

  useEffect(() => {
    db.runAsync(`
      CREATE TABLE IF NOT EXISTS mood_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mood TEXT,
        comment TEXT,
        date TEXT UNIQUE
      )
    `).then(fetchMoods);
  }, []);

  const fetchMoods = async () => {
    const result = await db.getAllAsync<MoodEntry>('SELECT * FROM mood_log ORDER BY date');
    setEntries(result);
  };

  const saveMood = async () => {
    if (!selectedMood) {
      Alert.alert('Please select a mood');
      return;
    }

    if (editingEntry) {
      await db.runAsync('UPDATE mood_log SET mood = ?, comment = ? WHERE id = ?', selectedMood, comment, editingEntry.id);
    } else {
      await db.runAsync(
        'INSERT OR REPLACE INTO mood_log (mood, comment, date) VALUES (?, ?, ?)',
        selectedMood,
        comment,
        selectedDate
      );
    }

    resetModal();
    fetchMoods();
  };

  const onDayPress = async (day: any) => {
    setSelectedDate(day.dateString);
    const result = await db.getAllAsync<MoodEntry>('SELECT * FROM mood_log WHERE date = ?', day.dateString);

    if (result.length > 0) {
      setEditingEntry(result[0]);
      setSelectedMood(result[0].mood);
      setComment(result[0].comment);
    } else {
      setEditingEntry(null);
      setSelectedMood('');
      setComment('');
    }

    setModalVisible(true);
  };

  const resetModal = () => {
    setSelectedMood('');
    setComment('');
    setEditingEntry(null);
    setModalVisible(false);
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Mood',
      'Are you sure you want to delete this mood entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: deleteMood }
      ]
    );
  };

  const deleteMood = async () => {
    if (editingEntry) {
      await db.runAsync('DELETE FROM mood_log WHERE id = ?', editingEntry.id);
      resetModal();
      fetchMoods();
    }
  };

  const generatePDF = async () => {
    const rows = entries.map((entry, i) => `
      <tr style="background:${i % 2 === 0 ? '#f9f9f9' : '#fff'}">
        <td>${entry.date}</td>
        <td>${entry.mood}</td>
        <td>${entry.comment || ''}</td>
      </tr>
    `).join('');

    const html = `
      <html>
        <head>
          <style>
            h1 { text-align: center; color: #FFA500; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            th { background-color: #FFA500; color: white; padding: 8px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #ccc; }
          </style>
        </head>
        <body>
          <h1>Mood Report</h1>
          <table>
            <thead><tr><th>Date</th><th>Mood</th><th>Comment</th></tr></thead>
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
      selectedColor: '#FFA500',
    };
    return acc;
  }, {} as Record<string, any>);

  const chartData = (() => {
    const month = selectedDate.slice(0, 7);
    const moodMap: { [mood: string]: number } = {};
    entries.filter(e => e.date.startsWith(month)).forEach(e => {
      moodMap[e.mood] = (moodMap[e.mood] || 0) + 1;
    });

    return {
      labels: Object.keys(moodMap),
      datasets: [{ data: Object.values(moodMap) }]
    };
  })();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>Mood Tracker</Text>

        <Calendar
          onDayPress={onDayPress}
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              ...(markedDates[selectedDate] || {}),
              selected: true,
              selectedColor: '#FFA500',
            },
          }}
        />

        <Text style={styles.chartTitle}>Monthly Mood Summary</Text>

        {chartData.labels.length > 0 ? (
          <BarChart
            data={chartData}
            width={screenWidth - 32}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: '#FF9800',
              backgroundGradientFrom: '#FFB74D',
              backgroundGradientTo: '#FF9800',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            style={{ marginVertical: 8, borderRadius: 16, alignSelf: 'center' }}
          />
        ) : (
          <Text style={styles.noChart}>No mood data for this month</Text>
        )}

        <TouchableOpacity style={styles.pdfButton} onPress={generatePDF}>
          <Text style={styles.pdfButtonText}>Download PDF</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Mood</Text>
            <View style={styles.moodSelector}>
              {moodLevels.map(({ emoji, label }) => (
                <TouchableOpacity
                  key={label}
                  style={[
                    styles.moodOption,
                    selectedMood === emoji && styles.selectedMood
                  ]}
                  onPress={() => setSelectedMood(emoji)}
                >
                  <Text style={styles.moodText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Optional comment..."
              value={comment}
              onChangeText={setComment}
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveMood}>
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
  
          <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/(tabs)/moods")}>
            <Smile size={24} color="white" /><Text style={styles.navText}>Moods</Text></TouchableOpacity>
  
          <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/(tabs)/medications")}>
            <Pill size={24} color="white" /><Text style={styles.navText}>Meds</Text></TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/(tabs)/profile")}>
            <User size={24} color="white" /><Text style={styles.navText}>Profile</Text></TouchableOpacity>
         </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: "5%" },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 16,
    color: '#FFA500',
    textAlign: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9800',
    textAlign: 'center',
    marginTop: 16,
  },
  noChart: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginVertical: 16,
  },
  pdfButton: {
    backgroundColor: '#FFF3E0',
    margin: 16,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  pdfButtonText: {
    color: '#FF9800',
    fontWeight: '600',
    fontSize: 16,
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
  moodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  moodOption: {
    padding: 12,
    borderRadius: 8,
  },
  selectedMood: {
    backgroundColor: '#FFE0B2',
  },
  moodText: {
    fontSize: 28,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#FFA500',
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
    backgroundColor: '#EF4444',
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
    backgroundColor: '#BDBDBD',
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
    backgroundColor: '#FFA500', flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16,
  },
  navButton: {
    alignItems: 'center',
  },
  navText: {
    color: 'white', fontSize: 12, marginTop: 4,
  }
});
