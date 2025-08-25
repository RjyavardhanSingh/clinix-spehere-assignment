import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useSegments, useRouter } from "expo-router";

// Update API URL to use your machine's IP address
const API_URL = "http://192.168.0.12:5000";

// Create Context
export const AuthContext = createContext();

// Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // Check auth state
  useEffect(() => {
    checkAuth();
  }, []);

  // Handle routing based on auth state
  useEffect(() => {
    if (loading) return;

    console.log("Auth state changed, segments:", segments);
    console.log("User state:", user ? "User authenticated" : "No user");

    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      console.log("No user detected, redirecting to login");
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      console.log("User detected in auth group, redirecting to main app");
      router.replace("/(tabs)");
    }
  }, [user, loading, segments]);

  // Check if user is authenticated
  const checkAuth = async () => {
    try {
      console.log("Checking authentication...");
      const token = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");

      console.log("Token exists:", !!token);
      console.log("User exists:", !!storedUser);

      if (token && storedUser) {
        // Parse user data with error handling
        try {
          const userData = JSON.parse(storedUser);
          console.log("User data loaded:", userData.username);

          // Ensure user has both id and _id fields
          const normalizedUser = {
            ...userData,
            _id: userData.id || userData._id, // Ensure _id exists
            id: userData.id || userData._id, // Ensure id exists
          };

          setUser(normalizedUser);

          // Set axios default headers with proper token format
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          console.log("Auth header set with token");
        } catch (parseError) {
          console.error("Error parsing user data:", parseError);
          setUser(null);
        }
      } else {
        setUser(null);
        delete axios.defaults.headers.common["Authorization"];
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (username, password) => {
    try {
      console.log(`Attempting login to ${API_URL}/auth/login`);

      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
      });

      console.log("Login response received");

      if (response.data.token && response.data.user) {
        const { token, user } = response.data;

        // Check if user is a Patient
        if (user.role !== "Patient") {
          throw new Error("Only patients can access this app");
        }

        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("user", JSON.stringify(user));

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        setUser(user);
        return user;
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      throw (
        error.response?.data || { message: error.message || "Login failed" }
      );
    }
  };

  // Register function
  const register = async (username, password, confirmPassword, role) => {
    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const response = await axios.post(`${API_URL}/auth/register`, {
        username,
        password,
        role: "Patient", // Force role to be Patient for mobile app
      });

      return response.data;
    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data || error.message
      );
      throw (
        error.response?.data || {
          message: error.message || "Registration failed",
        }
      );
    }
  };

  // Logout function - updated for reliability
  const logout = async () => {
    console.log("AuthContext logout function called");

    try {
      // Clear async storage
      await AsyncStorage.removeItem("token");
      console.log("Token removed");
      await AsyncStorage.removeItem("user");
      console.log("User removed");

      // Clear axios headers
      delete axios.defaults.headers.common["Authorization"];
      console.log("Authorization header cleared");

      // Update state
      setUser(null);
      console.log("User state cleared");

      // Navigate to login screen
      router.replace("/(auth)/login");

      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser, // Expose setUser function
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
