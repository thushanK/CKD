import { useSQLiteContext } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Modal, TextInput } from "react-native";

export default function Tab() {
	const db = useSQLiteContext();
	const [waterIntake, setWaterIntake] = useState(0);
	const [dailyGoal, setDailyGoal] = useState(2000);
	const [currentTime, setCurrentTime] = useState(new Date());
	const [goalModalVisible, setGoalModalVisible] = useState(false);
	const [intakeModalVisible, setIntakeModalVisible] = useState(false);
	const [waterAmount, setWaterAmount] = useState("");
	const [result, setResult] = useState("");

	const setWaterGoal = async () => {
		setDailyGoal(parseInt(waterAmount));
		db.runAsync("INSERT INTO water_intake (amount) VALUES (?)", parseInt(waterAmount));
		setWaterAmount("");
		setGoalModalVisible(false);
	};

	useEffect(() => {
		async function getGoal() {
			const result = await db.getAllAsync<string>("SELECT * FROM water_intake");
			setResult(result[0]);
			console.log({ result });
		}
		getGoal();
	}, []);

	const setWaterConsumption = () => {
		setWaterIntake((state) => state + parseInt(waterAmount));
		setWaterAmount("");
		setIntakeModalVisible(false);
	};

	// Calculate percentage of daily goal
	const percentage = Math.min(Math.round((waterIntake / dailyGoal) * 100), 100);
	const formattedTime = currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				{/* <Ionicons name="chevron-back" size={24} color="#2196F3" /> */}
				<Text style={styles.headerTitle}>Fluid Tracker</Text>
				<View style={styles.iconContainer}>
					<TouchableOpacity>{/* <Ionicons name="notifications-outline" size={24} color="#2196F3" style={styles.headerIcon} /> */}</TouchableOpacity>
					<TouchableOpacity>{/* <Ionicons name="settings-outline" size={24} color="#2196F3" /> */}</TouchableOpacity>
				</View>
			</View>

			<View style={styles.currentIntakeContainer}>
				<Text style={styles.timeLabel}>{formattedTime}</Text>
				<Text style={styles.intakeLabel}>
					{waterIntake}ml water ({Math.round(waterIntake / 200)} glasses)
				</Text>
			</View>

			{/* <Link href="/(tabs)/input" asChild> */}
			<TouchableOpacity style={styles.goalButton} onPress={() => setGoalModalVisible(true)}>
				<Text style={styles.goalButtonText}>Add Your Goal</Text>
			</TouchableOpacity>
			{/* </Link> */}

			<Modal animationType="slide" transparent={true} visible={goalModalVisible} onRequestClose={() => setGoalModalVisible(false)}>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>What is the water goad for today?</Text>
							<TouchableOpacity onPress={() => setGoalModalVisible(false)}>{/* <Ionicons name="close" size={24} color="#000" /> */}</TouchableOpacity>
						</View>

						<Text style={styles.inputLabel}>water in ml</Text>
						<TextInput style={styles.input} placeholder="Enter your water goal here" value={waterAmount} onChangeText={setWaterAmount} keyboardType="numeric" />

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
					<View style={styles.gaugeControl}>
						<TouchableOpacity style={styles.addButton}>{/* <Ionicons name="add" size={24} color="white" /> */}</TouchableOpacity>
					</View>
				</View>
			</View>

			<TouchableOpacity style={styles.addIntakeButton} onPress={() => setIntakeModalVisible(true)}>
				<Text style={styles.addIntakeButtonText}>Add</Text>
			</TouchableOpacity>

			<Modal animationType="slide" transparent={true} visible={intakeModalVisible} onRequestClose={() => setIntakeModalVisible(false)}>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>What is the water goad for today?</Text>
							<TouchableOpacity onPress={() => setIntakeModalVisible(false)}>{/* <Ionicons name="close" size={24} color="#000" /> */}</TouchableOpacity>
						</View>

						<Text style={styles.inputLabel}>water in ml</Text>
						<TextInput style={styles.input} placeholder="Enter your water intake here" value={waterAmount} onChangeText={setWaterAmount} keyboardType="numeric" />

						<TouchableOpacity style={styles.saveButton} onPress={setWaterConsumption}>
							<Text style={styles.saveButtonText}>Save</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			<StatusBar />
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#2196F3",
	},
	iconContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	headerIcon: {
		marginRight: 16,
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
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 30,
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
		position: "absolute",
		alignItems: "center",
		justifyContent: "center",
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
	gaugeControl: {
		position: "absolute",
		alignItems: "center",
	},
	addButton: {
		backgroundColor: "#2196F3",
		width: 40,
		height: 40,
		borderRadius: 20,
		alignItems: "center",
		justifyContent: "center",
		position: "absolute",
		right: -20,
	},
	addIntakeButton: {
		backgroundColor: "#2196F3",
		borderRadius: 24,
		paddingVertical: 14,
		marginHorizontal: 16,
		marginBottom: 20,
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
});
