import { Link } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [mobile, setMobile] = useState("");
	const [dob, setDob] = useState("");

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="dark-content" />

			<View style={styles.header}>
				<TouchableOpacity style={styles.backButton}>{/* <Ionicons name="chevron-back" size={24} color="#2D7FF9" /> */}</TouchableOpacity>
				<Text style={styles.headerTitle}>New Account</Text>
			</View>

			<View style={styles.loginContentContainer}>
				{/* <Text style={styles.loginWelcomeTitle}>Welcome</Text>
				<Text style={styles.loginWelcomeText}>We are so excited to have you here. If you haven't already, create an account to get start.</Text> */}

				<View style={styles.formContainer}>
					<Text style={styles.inputLabel}>Full Name</Text>
					<TextInput style={styles.input} placeholder="John Doe" value={name} onChangeText={setName} keyboardType="name-phone-pad" autoCapitalize="words" />

					<Text style={styles.inputLabel}>Phone Number</Text>
					<TextInput style={styles.input} placeholder="+61785254" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" autoCapitalize="words" />

					<Text style={styles.inputLabel}>Email or Mobile Number</Text>
					<TextInput style={styles.input} placeholder="example@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

					<Text style={styles.inputLabel}>Password</Text>
					<View style={styles.passwordContainer}>
						<TextInput style={styles.passwordInput} placeholder="••••••••••••" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
						<TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
							{/* <Ionicons name={showPassword ? "eye" : "eye-off"} size={24} color="#A0A0A0" /> */}
						</TouchableOpacity>
					</View>

					{/* <TouchableOpacity style={styles.forgotPasswordButton}>
						<Text style={styles.forgotPasswordText}>Forgot Password</Text>
					</TouchableOpacity> */}

					<TouchableOpacity style={styles.loginButton}>
						<Text style={styles.loginButtonText}>Sign Up</Text>
					</TouchableOpacity>

					<Text style={styles.orSignUpText}>or sign up with</Text>

					<View style={styles.socialButtonsContainer}>
						<TouchableOpacity style={styles.socialButton}>
							<FontAwesome size={28} name="google" />
						</TouchableOpacity>

						<TouchableOpacity style={styles.socialButton}>
							<FontAwesome size={28} name="facebook" />
						</TouchableOpacity>

						<TouchableOpacity style={styles.socialButton}>
							<FontAwesome5 size={28} name="fingerprint" />
						</TouchableOpacity>
					</View>

					<View style={styles.noAccountContainer}>
						<Text style={styles.noAccountText}>Already have an account? </Text>
						<Link href="/login" asChild>
							<TouchableOpacity>
								<Text style={styles.signUpLink}>Log In</Text>
							</TouchableOpacity>
						</Link>
					</View>
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
