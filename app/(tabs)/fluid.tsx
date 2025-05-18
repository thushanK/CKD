import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Modal, TextInput } from "react-native";
import { useRouter } from "expo-router";

import {
  Smile, Droplet, Activity, Thermometer, Settings,
  Search, Phone, Pill, Home, User
} from 'lucide-react-native';

export default function Tab() {
  const db = useSQLiteContext();
  const router = useRouter();

  const [waterIntake, setWaterIntake] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(5000); // Default value
  const [currentTime, setCurrentTime] = useState(new Date());
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [intakeModalVisible, setIntakeModalVisible] = useState(false);
  const [waterAmount, setWaterAmount] = useState("");

  useEffect(() => {
    async function setup() {
      const date = new Date().toISOString().split("T")[0];
      const result = await db.getAllAsync<{ amount: number }>("SELECT * FROM water_intake WHERE date(timestamp) = ?", date);
      const totalIntake = result.reduce((acc, curr) => acc + curr.amount, 0);
      setWaterIntake(totalIntake);

      const goal = await db.getAllAsync<{ amount: number }>("SELECT * FROM water_goal");
      if (goal.length > 0) {
        setDailyGoal(goal[0].amount);
      } else {
        setDailyGoal(5000); // Set default to 5000ml
        await db.runAsync("INSERT INTO water_goal (amount) VALUES (?)", 5000);
      }
    }
    setup();
  }, []);

  const setWaterGoal = async () => {
    try {
      const goalAmount = parseInt(waterAmount);
      setDailyGoal(goalAmount);
      const goal = await db.getAllAsync("SELECT * FROM water_goal");
      if (goal.length > 0) {
        await db.runAsync("UPDATE water_goal SET amount = ? WHERE id = 1", goalAmount);
      } else {
        await db.runAsync("INSERT INTO water_goal (amount) VALUES (?)", goalAmount);
      }
      setWaterAmount("");
      setGoalModalVisible(false);
    } catch (error) {
      console.log(error);
    }
  };

  const setWaterConsumption = async () => {
    try {
      const amount = parseInt(waterAmount);
      setWaterIntake((prev) => prev + amount);
      await db.runAsync("INSERT INTO water_intake (amount, timestamp) VALUES (?, ?)", amount, new Date().toISOString());
      setWaterAmount("");
      setIntakeModalVisible(false);
    } catch (error) {
      console.log(error);
    }
  };

  const percentage = Math.min(Math.round((waterIntake / dailyGoal) * 100), 100);
  const formattedTime = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fluid Tracker</Text>
        <View style={styles.iconContainer} />
      </View>

      <View style={styles.currentIntakeContainer}>
        <Text style={styles.timeLabel}>{formattedTime}</Text>
        <Text style={styles.intakeLabel}>
          {waterIntake}ml water ({Math.round(waterIntake / 200)} glasses)
        </Text>
      </View>

      <TouchableOpacity style={styles.goalButton} onPress={() => setGoalModalVisible(true)}>
        <Text style={styles.goalButtonText}>Add Your Goal</Text>
      </TouchableOpacity>

      <Modal animationType="slide" transparent visible={goalModalVisible} onRequestClose={() => setGoalModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>What is the water goal for today?</Text>
              <TouchableOpacity onPress={() => setGoalModalVisible(false)} />
            </View>
            <Text style={styles.inputLabel}>Water in ml</Text>
            <TextInput style={styles.input} placeholder="Enter goal" value={waterAmount} onChangeText={setWaterAmount} keyboardType="numeric" />
            <TouchableOpacity style={styles.saveButton} onPress={setWaterGoal}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.gaugeContainer}>
        <View style={styles.gaugeBackground}>
          <View style={[styles.gaugeFill, { height: `${percentage}%` }]} />
          <View style={styles.gaugeContent}>
            <Text style={styles.gaugeAmount}>{waterIntake}ml</Text>
            <Text style={styles.gaugeLabel}>/{dailyGoal}ml</Text>
            <Text style={styles.gaugePercent}>{percentage}%</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => router.push("/(tabs)/fluids")}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 14,
          marginHorizontal: 16,
          borderRadius: 24,
          backgroundColor: "#e3f2fd",
          marginBottom: 12,
        }}
      >
        <Text style={{ color: "#2196F3", fontSize: 16, fontWeight: "600", marginRight: 8 }}>View Report</Text>
        <Text style={{ fontSize: 18 }}>📊</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.addIntakeButton} onPress={() => setIntakeModalVisible(true)}>
        <Text style={styles.addIntakeButtonText}>Add</Text>
      </TouchableOpacity>

      <Modal animationType="slide" transparent visible={intakeModalVisible} onRequestClose={() => setIntakeModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Water Intake</Text>
              <TouchableOpacity onPress={() => setIntakeModalVisible(false)} />
            </View>
            <Text style={styles.inputLabel}>Water in ml</Text>
            <TextInput style={styles.input} placeholder="Enter amount" value={waterAmount} onChangeText={setWaterAmount} keyboardType="numeric" />
            <TouchableOpacity style={styles.saveButton} onPress={setWaterConsumption}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <StatusBar />

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/(tabs)/home")}>
          <Home size={24} color="white" /><Text style={styles.navText}>Home</Text></TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/fluid")}>
          <Droplet size={24} color="white" /><Text style={styles.navText}>Fluid</Text></TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/(tabs)/medications")}>
          <Pill size={24} color="white" /><Text style={styles.navText}>Meds</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/(tabs)/profile")}>
          <User size={24} color="white" /><Text style={styles.navText}>Profile</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: "5%",
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 16,
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 16,
    textAlign: 'center',
    color: "#2196F3",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  currentIntakeContainer: {
    padding: 16,
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 22,
    fontWeight: "bold",
  },
  intakeLabel: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  goalButton: {
    backgroundColor: "#e3f2fd",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginHorizontal: 16,
    alignItems: "center",
  },
  goalButtonText: {
    color: "#2196F3",
    fontSize: 16,
    fontWeight: "600",
  },
  gaugeContainer: {
    paddingTop: "30%",
    paddingBottom: "10%",
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
  },
  gaugeBackground: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 10,
    borderColor: "#e3f2fd",
    overflow: "hidden",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  gaugeFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#2196F3",
  },
  gaugeContent: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: "25%",
  },
  gaugeAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
  gaugeLabel: {
    fontSize: 18,
    color: "#666",
  },
  gaugePercent: {
    fontSize: 20,
    fontWeight: "600",
    color: "#666",
    marginTop: 8,
  },
  addIntakeButton: {
    backgroundColor: "#2196F3",
    borderRadius: 24,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: "25%",
    alignItems: "center",
  },
  addIntakeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#2196F3",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
