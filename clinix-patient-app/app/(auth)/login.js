import React, { useState, useContext } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { AuthContext } from "../../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, setUser } = useContext(AuthContext); // Make sure AuthContext exposes setUser

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Username and password are required");
      return;
    }

    setIsLoading(true);
    console.log("Attempting login with:", { username });

    const apiUrl = "http://192.168.0.12:5000";

    try {
      console.log(`Attempting fetch to ${apiUrl}/auth/login`);

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      console.log("Response status:", response.status);

      const text = await response.text();
      console.log("Response text:", text);

      const data = JSON.parse(text);
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      const { token, user } = data;

      // Store token and user data
      console.log("Raw token stored:", token.substring(0, 10) + "...");
      await AsyncStorage.setItem("token", token);

      // Ensure user has both id and _id fields to prevent issues
      const normalizedUser = {
        ...user,
        _id: user.id || user._id, // Ensure _id exists
        id: user.id || user._id, // Ensure id exists
      };

      console.log("Storing normalized user:", normalizedUser);
      await AsyncStorage.setItem("user", JSON.stringify(normalizedUser));

      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Directly set user in context
      setUser(normalizedUser);

      // Short timeout to allow state to update
      setTimeout(() => {
        console.log("Navigation to tabs");
        router.replace("/(tabs)");
      }, 100);

      // Reset form
      setUsername("");
      setPassword("");
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Login Failed", error.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Clinix Sphere</Text>
          <Text style={styles.subtitle}>Patient App</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Sign In</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              testID="username-input"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              testID="password-input"
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={isLoading}
            testID="login-button"
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Register</Text>
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
    backgroundColor: "#f7f9fc",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#1a73e8",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#5f6368",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#202124",
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#5f6368",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#dadce0",
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    color: "#202124",
  },
  button: {
    backgroundColor: "#1a73e8",
    borderRadius: 4,
    padding: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: "#5f6368",
  },
  link: {
    fontSize: 14,
    color: "#1a73e8",
    fontWeight: "500",
  },
});
