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
import { useRouter } from "expo-router";
import * as FileSystem from 'expo-file-system';
 

const moodLevels = [
  { emoji: '😢', label: 'Sad' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '😊', label: 'Happy' },
  { emoji: '😄', label: 'Excited' },
];

type MoodEntry = {
  id: number;
  date: string;
  mood: string;
  comment: string;
};

export default function MoodScreen() {
  const db = useSQLiteContext();
    const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState('');
  const [comment, setComment] = useState('');
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MoodEntry | null>(null);

  useEffect(() => {
    db.runAsync(`
      CREATE TABLE IF NOT EXISTS mood_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        mood TEXT,
        comment TEXT
      )
    `).then(fetchMoods);
  }, []);

  const fetchMoods = async () => {
    const result = await db.getAllAsync<MoodEntry>('SELECT * FROM mood_log ORDER BY date DESC, id DESC');
    setEntries(result);
  };

  const onDayPress = (day: any) => {
    setSelectedDate(day.dateString);
  };

  const saveMood = async () => {
    if (!mood) {
      Alert.alert('Please select a mood');
      return;
    }

    if (editingEntry) {
      await db.runAsync(
        'UPDATE mood_log SET mood = ?, comment = ? WHERE id = ?',
        mood, comment, editingEntry.id
      );
    } else {
      await db.runAsync(
        'INSERT INTO mood_log (date, mood, comment) VALUES (?, ?, ?)',
        selectedDate, mood, comment
      );
    }

    resetModal();
    fetchMoods();
  };

  const resetModal = () => {
    setMood('');
    setComment('');
    setEditingEntry(null);
    setModalVisible(false);
  };

  const confirmDelete = () => {
    Alert.alert('Delete Mood', 'Are you sure you want to delete this mood entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: deleteMood }
    ]);
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
          table { width: 100%; border-collapse: collapse; font-size: 14px; }
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

  const { uri } = await Print.printToFileAsync({ html });

  // Rename the file to mood_tracker_report.pdf
  const newPath = FileSystem.documentDirectory + 'mood_tracker_report.pdf';
  await FileSystem.moveAsync({ from: uri, to: newPath });

  //Share the renamed file
  await Sharing.shareAsync(newPath);
};

  const markedDates = entries.reduce((acc, curr) => {
    acc[curr.date] = {
      marked: true,
      selected: curr.date === selectedDate,
      selectedColor: '#FFA500',
    };
    return acc;
  }, {} as Record<string, any>);

  const dailyMoods = entries.filter(e => e.date === selectedDate);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mood Tracker</Text>

      <Calendar
        onDayPress={onDayPress}
        maxDate={new Date().toISOString().split('T')[0]}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            ...(markedDates[selectedDate] || {}),
            selected: true,
            selectedColor: '#FFA500',
          },
        }}
      />

      <TouchableOpacity style={styles.pdfButton} onPress={generatePDF}>
        <Text style={styles.pdfButtonText}>Download Report</Text>
      </TouchableOpacity>

      <ScrollView style={styles.symptomScroll} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.symptomList}>
          {dailyMoods.map((entry) => (
            <View key={entry.id} style={styles.symptomItem}>
              <View style={styles.symptomTextContainer}>
                <Text style={styles.symptomDate}>{entry.date}</Text>
                <Text style={styles.symptomTitle}>{entry.mood}</Text>
                <Text style={styles.symptomDescription}>{entry.comment}</Text>
              </View>
              <View style={styles.iconActions}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedDate(entry.date);
                    setMood(entry.mood);
                    setComment(entry.comment);
                    setEditingEntry(entry);
                    setModalVisible(true);
                  }}
                >
                  <Feather name="edit" size={20} color="#FFA500" />
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

      <TouchableOpacity
        style={[styles.pdfButton, { backgroundColor: '#FFA500', marginBottom: '20%' }]}
        onPress={() => {
          setEditingEntry(null);
          setMood('');
          setComment('');
          setModalVisible(true);
        }}
      >
        <Text style={[styles.pdfButtonText, { color: 'white' }]}>Add Mood</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingEntry ? 'Edit Mood' : 'Add Mood'}
            </Text>

            <View style={styles.moodSelector}>
              {moodLevels.map(({ emoji, label }) => (
                <TouchableOpacity
                  key={label}
                  style={[styles.moodOption, mood === emoji && styles.selectedMood]}
                  onPress={() => setMood(emoji)}
                >
                  <Text style={styles.moodText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Comment (optional)"
              value={comment}
              onChangeText={setComment}
              multiline
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
            <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/tab/home")}>
              <Feather name="home" size={24} color="white" />
              <Text style={styles.navText}>Home</Text>
            </TouchableOpacity>
      
            <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/tab/contact")}>
              <Feather name="phone" size={24} color="white" />
              <Text style={styles.navText}>Contacts</Text>
            </TouchableOpacity>
      
            <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/tab/medication")}>
              <Feather name="activity" size={24} color="white" />
              <Text style={styles.navText}>Meds</Text>
            </TouchableOpacity>
      
            <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/tab/profile")}>
              <Feather name="user" size={24} color="white" />
              <Text style={styles.navText}>Profile</Text>
            </TouchableOpacity>
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
    color: '#FFA500',
    textAlign: 'center',
    paddingTop: "5%",
  },
  pdfButton: {
    backgroundColor: '#FFF3E0',
    margin: 16,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  pdfButtonText: {
    color: '#FFA500',
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
    backgroundColor: '#FFF8E1',
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
    color: '#FF6F00',
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
