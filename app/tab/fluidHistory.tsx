// Full fixed version of the Fluid Tracker screen with enhanced logic for date restriction, chart, and PDF

import { Calendar } from "react-native-calendars";
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  Alert,
  FlatList,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useEffect, useRef, useState } from "react";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useSQLiteContext } from "expo-sqlite";
import { Feather } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system';
const screenWidth = Dimensions.get("window").width;

export default function IntakeScreen() {
  const db = useSQLiteContext();
  const chartRef = useRef(null);
  const router = useRouter();

  const [data, setData] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [markedDates, setMarkedDates] = useState<{ [date: string]: any }>({});
  const [rawEntries, setRawEntries] = useState<any[]>([]);
  const [popupVisible, setPopupVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [waterAmount, setWaterAmount] = useState("");
  const [timeInput, setTimeInput] = useState("12:00");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    fetchMarkedDates();
  }, []);

  const fetchMarkedDates = async () => {
    const all = await db.getAllAsync("SELECT * FROM water_intake");
    const dateMap: any = {};
    all.forEach((entry) => {
      const e = entry as { timestamp: string };
      const date = new Date(e.timestamp).toISOString().split("T")[0];
      dateMap[date] = { marked: true, dotColor: "blue" };
    });
    setMarkedDates(dateMap);
  };

  const fetchDataForDate = async (dateStr: string) => {
    try {
      const result = await db.getAllAsync("SELECT * FROM water_intake WHERE date(timestamp) = ?", dateStr);
      setRawEntries(result);
      setPopupVisible(false);
      setData([0, 0, 0, 0, 0, 0]);

      // Set data for editing
      setEditingId(null);
      setWaterAmount("");
      setTimeInput("12:00");

      const slotSums = [0, 0, 0, 0, 0, 0];
      const slots = [8, 10, 12, 14, 16, 18];

      result.forEach((entry) => {
        const e = entry as { timestamp: string; amount: string | number };
        const hour = new Date(e.timestamp).getHours();
        const index = slots.findIndex((slot) => hour >= slot && hour < slot + 2);
        if (index !== -1) {
          const numericAmount = parseFloat(e.amount as string);
          if (!isNaN(numericAmount)) {
            slotSums[index] += numericAmount;
          }
        }
      });

      setData(slotSums);
    } catch (e) {
      console.error("Chart data error:", e);
      setData([0, 0, 0, 0, 0, 0]);
    }
  };

  const onDayPress = (day: any) => {
    const today = new Date().toISOString().split("T")[0];
    if (day.dateString > today) {
      Alert.alert("Invalid Date", "You cannot add data for future dates.");
      return;
    }
    const dateStr = day.dateString;
    setSelectedDate(dateStr);
    fetchDataForDate(dateStr);
  };

  const handleDelete = (id: number) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await db.runAsync("DELETE FROM water_intake WHERE id = ?", [id]);
          fetchDataForDate(selectedDate);
          fetchMarkedDates();
        },
      },
    ]);
  };

  const handleEdit = (entry: any) => {
    const dt = new Date(entry.timestamp);
    const h = dt.getHours().toString().padStart(2, "0");
    const m = dt.getMinutes().toString().padStart(2, "0");
    setWaterAmount(String(entry.amount));
    setTimeInput(`${h}:${m}`);
    setEditingId(entry.id);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!waterAmount || !timeInput.match(/^([01]\d|2[0-3]):([0-5]\d)$/)) {
      Alert.alert("Invalid input", "Please enter a valid amount and time in HH:MM format.");
      return;
    }

    const [hour, minute] = timeInput.split(":").map(Number);
    const dateObj = new Date(selectedDate);
    dateObj.setHours(hour || 0, minute || 0, 0);
    const dateTime = dateObj.toISOString();

    if (editingId !== null) {
      await db.runAsync("UPDATE water_intake SET amount = ?, timestamp = ? WHERE id = ?", [
        waterAmount,
        dateTime,
        editingId,
      ]);
    } else {
      await db.runAsync("INSERT INTO water_intake (amount, timestamp) VALUES (?, ?)", [
        waterAmount,
        dateTime,
      ]);
    }

    setEditModalVisible(false);
    setEditingId(null);
    setWaterAmount("");
    setTimeInput("12:00");
    fetchDataForDate(selectedDate);
    fetchMarkedDates();
  };

 const generatePDF = async () => {
  const allData = await db.getAllAsync("SELECT * FROM water_intake ORDER BY timestamp DESC");
  const rows = allData
    .map((entry, i) => {
      const e = entry as { timestamp: string; amount: string | number };
      const dateTime = new Date(e.timestamp);
      const date = dateTime.toLocaleDateString();
      const time = dateTime.toLocaleTimeString();
      return `<tr style="background:${i % 2 === 0 ? '#f9f9f9' : '#ffffff'}"><td>${date}</td><td>${time}</td><td style='text-align:right;'>${e.amount} ml</td></tr>`;
    })
    .join("");

  const html = `
    <html><head><style>
      h1 { text-align: center; color: #2196F3; }
      table { width: 100%; border-collapse: collapse; font-size: 14px; }
      th { background-color: #2196F3; color: white; text-align: left; padding: 8px; }
      td { padding: 8px; border-bottom: 1px solid #ccc; }
    </style></head>
    <body><h1>Fluid Intake Report</h1>
    <table><thead><tr><th>Date</th><th>Time</th><th style='text-align:right;'>Amount</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`;

  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const newPath = `${FileSystem.documentDirectory}fluid_intake_report.pdf`;

  // Move and rename file
  await FileSystem.moveAsync({
    from: uri,
    to: newPath,
  });

  await Sharing.shareAsync(newPath, {
    mimeType: 'application/pdf',
    dialogTitle: 'Share Fluid Intake Report',
    UTI: 'com.adobe.pdf',
  });
};


  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Fluid Tracker</Text>

      {/* Edit/Add Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.popupContent}>
            <Text style={styles.popupTitle}>{editingId !== null ? "Edit Entry" : `Add Entry for ${selectedDate}`}</Text>
            <TextInput
              keyboardType="numeric"
              placeholder="Amount (ml)"
              style={styles.input}
              value={waterAmount}
              onChangeText={setWaterAmount}
            />

            <TouchableOpacity
              style={[styles.input, { justifyContent: 'center' }]}
              onPress={() => setShowTimePicker(true)}
            >
              <Text>{timeInput || 'Select Time'}</Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowTimePicker(false);
                  if (selectedDate) {
                    const hours = selectedDate.getHours().toString().padStart(2, '0');
                    const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
                    setTimeInput(`${hours}:${minutes}`);
                  }
                }}
              />
            )}

            <TouchableOpacity style={styles.buttonBlue} onPress={handleSaveEdit}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonCancel} onPress={() => setEditModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Calendar
        onDayPress={onDayPress}
        markedDates={{ ...markedDates, [selectedDate]: { selected: true, selectedColor: "blue", marked: true } }}
      />





      <View style={{ flex: 1, padding: 16,marginBottom: '20%', }}>
        <FlatList
          data={rawEntries}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.tileEntry}>
              <View>
                <Text style={styles.entryText}>{new Date(item.timestamp).toLocaleTimeString()} - {item.amount}ml</Text>
              </View>
              <View style={styles.tileActions}>
                <TouchableOpacity onPress={() => handleEdit(item)}>
                  <Feather name="edit" size={20} color="blue" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Feather name="trash" size={20} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
        {rawEntries.length === 0 && (
          <Text style={{ textAlign: 'center', marginVertical: 10 }}>There is no record for this day</Text>
        )}
        <TouchableOpacity
          style={styles.buttonBlue}
          onPress={() => {
            setEditingId(null);
            setWaterAmount("");
            setTimeInput("12:00");
            setEditModalVisible(true);
          }}
        >
          <Text style={styles.buttonText}>Add Fluid Intake for {selectedDate}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonBlue} onPress={() => setPopupVisible(true)}>
          <Text style={styles.buttonText}>View Chart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonBlue} onPress={generatePDF}>
          <Text style={styles.buttonText}>Download Report</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={popupVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.popupContent}>
            <Text style={styles.popupTitle}>Water Intake Chart - {selectedDate}</Text>
            {data.every((val) => val === 0) ? (
              <Text style={{ textAlign: 'center', marginVertical: 10 }}>There is no record for this day</Text>
            ) : (
              <LineChart
                data={{
                  labels: ["8AM", "10AM", "12PM", "2PM", "4PM", "6PM"],
                  datasets: [{ data }],
                }}
                width={screenWidth - 100}
                height={200}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: '#2196F3',
                  },
                }}
                bezier
              />
            )}
            <TouchableOpacity style={styles.buttonCancel} onPress={() => setPopupVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
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
  tileEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  tileActions: {
    flexDirection: 'row',
    gap: 16,
  },
  entryText: {
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    
  },
  popupContent: {
    backgroundColor: "white",
    padding: 20,
    width: "90%",
    borderRadius: 10,
    maxHeight: "85%",
  },
  popupTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderBottomWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginBottom: 10,
    borderColor: "#aaa",
  },
  buttonCancel: { backgroundColor: "gray", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 12 },
  container: { flex: 1, backgroundColor: "#fff" },
  headerTitle: { fontSize: 20, fontWeight: "bold", textAlign: "center", paddingTop: "10%", color: "#2196F3" },
  buttonBlue: { backgroundColor: "#2196F3", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 12,  },
  buttonText: { color: "white", fontWeight: "600", borderRadius: 8, },
    bottomNav: {
		position: 'absolute', bottom: 0, left: 0, right: 0, 
		backgroundColor: '#2196F3', flexDirection: 'row', justifyContent: 'space-around',
		paddingVertical: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16,
	  },
	  navButton: {
		alignItems: 'center',
	  },
	  navText: {
		color: 'white', fontSize: 12, marginTop: 4,
	  }
});
