import * as React from "react";
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "~/components/ui/text";
import { Image } from "expo-image";
import { Link } from "expo-router";

export default function Screen() {
	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.contentContainer}>
				<View style={styles.logoContainer}>
					<Image source={require("../assets/images/logo.png")} style={styles.logo} />
					<Text style={styles.logoText}>CKD</Text>
					<Text style={styles.appDescription}>App For Chronically Ill CKD Patients</Text>
				</View>

				<Text style={styles.welcomeText}>We are so excited to have you here. If you haven't already, create an account to get start.</Text>

				<View style={styles.buttonContainer}>
					<Link href="/login" asChild>
						<TouchableOpacity style={styles.primaryButton}>
							<Text style={styles.primaryButtonText}>Log In</Text>
						</TouchableOpacity>
					</Link>

					<Link href="/register" asChild>
						<TouchableOpacity style={styles.secondaryButton}>
							<Text style={styles.secondaryButtonText}>Sign Up</Text>
						</TouchableOpacity>
					</Link>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	contentContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 30,
	},
	logoContainer: {
		alignItems: "center",
		marginBottom: 40,
	},
	logo: {
		width: 100,
		height: 100,
		paddingBottom: 50,
	},
	logoText: {
		color: "#2D7FF9",
		fontSize: 28,
		fontWeight: "bold",
		paddingTop: 20,
	},
	appDescription: {
		color: "#2D7FF9",
		fontSize: 14,
		marginTop: 5,
		textAlign: "center",
	},
	welcomeText: {
		fontSize: 14,
		color: "#333",
		textAlign: "center",
		marginBottom: 40,
	},
	buttonContainer: {
		width: "100%",
	},
	primaryButton: {
		backgroundColor: "#2D7FF9",
		borderRadius: 25,
		height: 50,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 15,
	},
	primaryButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
	},
	secondaryButton: {
		backgroundColor: "#E8F1FF",
		borderRadius: 25,
		height: 50,
		justifyContent: "center",
		alignItems: "center",
	},
	secondaryButtonText: {
		color: "#2D7FF9",
		fontSize: 16,
		fontWeight: "600",
	},
	// Login Screen specific styles
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 15,
		paddingTop: 10,
		height: 50,
	},
	backButton: {
		padding: 5,
	},
	headerTitle: {
		flex: 1,
		textAlign: "center",
		fontSize: 18,
		fontWeight: "600",
		color: "#2D7FF9",
		marginRight: 30, // To offset the back button and center the title
	},
	loginContentContainer: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	loginWelcomeTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#333",
		marginBottom: 10,
	},
	loginWelcomeText: {
		fontSize: 14,
		color: "#666",
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
	passwordContainer: {
		flexDirection: "row",
		backgroundColor: "#F0F5FF",
		borderRadius: 10,
		marginBottom: 5,
		alignItems: "center",
	},
	passwordInput: {
		flex: 1,
		padding: 15,
		fontSize: 16,
	},
	eyeIcon: {
		padding: 15,
	},
	forgotPasswordButton: {
		alignSelf: "flex-end",
		marginBottom: 20,
	},
	forgotPasswordText: {
		color: "#2D7FF9",
		fontSize: 14,
	},
	loginButton: {
		backgroundColor: "#2D7FF9",
		borderRadius: 25,
		height: 50,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 20,
	},
	loginButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
	},
	orSignUpText: {
		textAlign: "center",
		color: "#666",
		marginBottom: 20,
	},
	socialButtonsContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginBottom: 30,
	},
	socialButton: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: "#F0F5FF",
		justifyContent: "center",
		alignItems: "center",
		marginHorizontal: 10,
	},
	socialIcon: {
		width: 24,
		height: 24,
	},
	noAccountContainer: {
		flexDirection: "row",
		justifyContent: "center",
	},
	noAccountText: {
		color: "#666",
	},
	signUpLink: {
		color: "#2D7FF9",
		fontWeight: "600",
	},
});
