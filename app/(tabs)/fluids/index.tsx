import { Calendar } from "react-native-calendars";
import { useRouter } from "expo-router";
import { LineChart } from "react-native-chart-kit";
import { Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import { Button } from "~/components/ui/button";

const screenWidth = Dimensions.get("window").width;

export default function IntakeScreen() {
	const chartRef = useRef(null);
	const [data, setData] = useState<number[]>([]);

	const [selectedDate, setSelectedDate] = useState(new Date().toDateString());

	function generateData() {
		return [Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100, Math.random() * 100];
	}

	useEffect(() => {
		const data = generateData();
		setData(data);
	}, []);

	const generatePDF = async () => {
		try {
			const chartUri = await captureRef(chartRef, {
				format: "png",
				quality: 1,
			});

			const html = `
			<html>
			  <body style="font-family: sans-serif;">
				<h1>Fluid Intake Report</h1>
				<p>Date: 2025-04-15</p>
				<img src="${chartUri}" width="100%" />
			  </body>
			</html>
		  `;

			const { uri } = await Print.printToFileAsync({ html });

			await Sharing.shareAsync(uri);
		} catch (error) {
			console.error("PDF generation failed:", error);
		}
	};

	const router = useRouter();

	const onDayPress = (day: any) => {
		setSelectedDate(new Date(day.dateString).toDateString());
		if (new Date(day.dateString) > new Date()) {
			console.log("df");

			setData([0, 0, 0, 0, 0, 0]);
			return;
		}

		const data = generateData();
		setData(data);
		// router.push(`/intake/${day.dateString}`); // Go to chart screen
	};

	return (
		<SafeAreaView style={styles.container}>
			<Text style={styles.headerTitle}>Fluid Tracker</Text>
			<View style={styles.iconContainer}>
				<TouchableOpacity>{/* <Ionicons name="notifications-outline" size={24} color="#2196F3" style={styles.headerIcon} /> */}</TouchableOpacity>
				<TouchableOpacity>{/* <Ionicons name="settings-outline" size={24} color="#2196F3" /> */}</TouchableOpacity>
			</View>
			<Calendar
				onDayPress={onDayPress}
				markedDates={{
					"2025-04-14": { marked: true, dotColor: "blue" },
					"2025-04-15": { marked: true, dotColor: "green" },
				}}
			/>

			<View style={{ flex: 1, padding: 16 }}>
				<Text style={{ fontSize: 20, marginBottom: 10 }}>Fluid intake on {selectedDate}</Text>
				<View ref={chartRef} style={{ height: 200, flexDirection: "row" }} collapsable={false}>
					<LineChart
						data={{
							labels: ["8AM", "10AM", "12PM", "2PM", "4PM", "6PM"],
							datasets: [
								{
									data: [ 8, 10, 12, 11, 0, 0],
								},
							],
						}}
						width={300} // Set the width of the chart
						height={200} // Set the height of the chart
						chartConfig={{
							backgroundColor: "#e26a00",
							backgroundGradientFrom: "#fb8c00",
							backgroundGradientTo: "#ffa726",
							decimalPlaces: 2, // optional, defaults to 2dp
							color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
							labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
							style: {
								borderRadius: 16,
							},
							propsForDots: {
								r: "6",
								strokeWidth: "2",
								stroke: "#ffa726",
							},
						}}
					/>
				</View>
				<View style={{ marginTop: 24 }}>
					<Button onPress={generatePDF}>
						<Text>Download Report</Text>
					</Button>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
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
});
