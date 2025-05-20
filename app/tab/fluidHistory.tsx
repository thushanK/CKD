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

const screenWidth = Dimensions.get("window").width;

type WaterIntake = {
  id: number;
  amount: number;
  timestamp: string;
};

export default function IntakeScreen() {
  const db = useSQLiteContext();
  const chartRef = useRef(null);
  const router = useRouter();

  const [data, setData] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [markedDates, setMarkedDates] = useState<{ [date: string]: any }>({});
  const [rawEntries, setRawEntries] = useState<WaterIntake[]>([]);
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
    const all = await db.getAllAsync<WaterIntake>("SELECT * FROM water_intake");
    const dateMap: any = {};
    all.forEach((entry) => {
      const date = new Date(entry.timestamp).toISOString().split("T")[0];
      dateMap[date] = { marked: true, dotColor: "blue" };
    });
    setMarkedDates(dateMap);
  };

  const fetchDataForDate = async (dateStr: string) => {
    const result = await db.getAllAsync<WaterIntake>(
      "SELECT * FROM water_intake WHERE date(timestamp) = ?",
      dateStr
    );
    setRawEntries(result);
    setPopupVisible(true);

    const slotSums = [0, 0, 0, 0, 0, 0];
    const slots = [8, 10, 12, 14, 16, 18];

    result.forEach((entry) => {
      const hour = new Date(entry.timestamp).getHours();
      const index = slots.findIndex((slot) => hour >= slot && hour < slot + 2);
      if (index !== -1) {
        const numericAmount = parseFloat(entry.amount as any);
        if (!isNaN(numericAmount)) {
          slotSums[index] += numericAmount;
        }
      }
    });

    setData([...slotSums]);
  };

  const onDayPress = (day: any) => {
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

  const handleEdit = (entry: WaterIntake) => {
    Alert.alert("Edit Entry", "Do you want to edit this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Edit",
        onPress: () => {
          const dt = new Date(entry.timestamp);
          const h = dt.getHours().toString().padStart(2, "0");
          const m = dt.getMinutes().toString().padStart(2, "0");
          setWaterAmount(String(entry.amount));
          setTimeInput(`${h}:${m}`);
          setEditingId(entry.id);
          setEditModalVisible(true);
        },
      },
    ]);
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
    const allData = await db.getAllAsync<WaterIntake>("SELECT * FROM water_intake ORDER BY timestamp DESC");
    const rows = allData
      .map((entry, i) => {
        const dateTime = new Date(entry.timestamp);
        const date = dateTime.toLocaleDateString();
        const time = dateTime.toLocaleTimeString();
        return `<tr style="background:${i % 2 === 0 ? '#f9f9f9' : '#ffffff'}"><td>${date}</td><td>${time}</td><td style='text-align:right;'>${entry.amount} ml</td></tr>`;
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

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Fluid Tracker</Text>

      <Calendar
        onDayPress={onDayPress}
        markedDates={{ ...markedDates, [selectedDate]: { selected: true, selectedColor: "blue", marked: true } }}
      />

      <View style={{ flex: 1, padding: 16 }}>
        <LineChart
          data={{
            labels: ["8AM", "10AM", "12PM", "2PM", "4PM", "6PM"],
            datasets: [{ data }],
          }}
          width={screenWidth - 32}
          height={200}
          chartConfig={{
            backgroundColor: "#2196F3",
            backgroundGradientFrom: "#64b5f6",
            backgroundGradientTo: "#2196F3",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
            labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
          }}
        />

        <TouchableOpacity style={styles.buttonBlue} onPress={generatePDF}>
          <Text style={styles.buttonText}>Download Report</Text>
        </TouchableOpacity>
      </View>

      {/* Popup Modal */}
      <Modal visible={popupVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.popupContent}>
            <Text style={styles.popupTitle}>Entries on {selectedDate}</Text>
            <FlatList
              data={rawEntries}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.entryRow}>
                  <Text>{new Date(item.timestamp).toLocaleTimeString()} - {item.amount}ml</Text>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <TouchableOpacity onPress={() => handleEdit(item)}>
                      <Text style={{ color: "blue" }}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                      <Text style={{ color: "red" }}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
            <TouchableOpacity
              style={styles.buttonBlue}
              onPress={() => {
                setEditingId(null);
                setWaterAmount("");
                setTimeInput("12:00");
                setEditModalVisible(true);
              }}
            >
              <Text style={styles.buttonText}>Add Water</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonCancel} onPress={() => setPopupVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.popupContent}>
            <Text style={styles.popupTitle}>{editingId !== null ? "Edit Entry" : "Add Entry"}</Text>
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

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/tab/home")}>
          <Feather name="home" size={24} color="white" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/tab/contact")}>
          <Feather name="phone" size={24} color="white" />
          <Text style={styles.navText}>Contacts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/tab/medicationToday")}>
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
  container: { flex: 1, backgroundColor: "#fff" },
  headerTitle: { fontSize: 20, fontWeight: "bold", textAlign: "center", paddingTop: "10%", color: "#2196F3" },
  buttonBlue: {
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  buttonCancel: {
    backgroundColor: "gray",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: { color: "white", fontWeight: "600" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  popupContent: {
    backgroundColor: "white",
    padding: 20,
    width: "85%",
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
  entryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
    borderRadius: 6,
    backgroundColor: "#f2f8ff",
    marginBottom: 6,
  },
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
