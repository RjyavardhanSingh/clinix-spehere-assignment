import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  TextInput,
  Modal,
  Platform,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const API_URL = "http://192.168.0.12:5000";

export default function ProfileScreen() {
  const { user, setUser } = useContext(AuthContext);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [username, setUsername] = useState(user?.username || "");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    console.log("Logout button pressed");

    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          console.log("Logout confirmed");

          try {
            // Clear storage
            await AsyncStorage.removeItem("token");
            console.log("Token removed");
            await AsyncStorage.removeItem("user");
            console.log("User removed");

            // Clear context
            setUser(null);
            console.log("User context cleared");

            // Navigate
            console.log("Navigating to login");
            router.replace("/(auth)/login");
          } catch (error) {
            console.error("Logout error:", error);

            // Fallback - force navigation even if there's an error
            router.replace("/(auth)/login");
          }
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    setEditModalVisible(true);
    setUsername(user?.username || "");
  };

  const handleSaveProfile = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Username cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      // For a real implementation, update user profile on the server
      // For demonstration, we'll just update locally
      const updatedUser = { ...user, username };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      Alert.alert("Success", "Profile updated successfully");
      setEditModalVisible(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileIconContainer}>
          <FontAwesome name="user" size={48} color="#1a73e8" />
        </View>
        <Text style={styles.username}>{user?.username || "User"}</Text>
        <Text style={styles.role}>{user?.role || "Patient"}</Text>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleEditProfile}
          >
            <FontAwesome name="edit" size={18} color="#5f6368" />
            <Text style={styles.actionText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLogout}
            testID="logoutButton"
          >
            <FontAwesome name="sign-out" size={18} color="#5f6368" />
            <Text style={styles.actionText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={styles.closeButton}
              >
                <FontAwesome name="close" size={22} color="#5f6368" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Enter username"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>About the App</Text>
        <Text style={styles.infoText}>
          Clinix Sphere is a healthcare management system designed to streamline
          the interaction between patients and healthcare providers.
        </Text>
      </View>

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fc",
  },
  header: {
    padding: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#202124",
  },
  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 24,
    marginHorizontal: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  profileIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#e8f0fe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  username: {
    fontSize: 20,
    fontWeight: "600",
    color: "#202124",
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: "#5f6368",
    marginBottom: 24,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: "#f1f3f4",
    marginHorizontal: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#5f6368",
    marginLeft: 8,
  },
  infoSection: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#202124",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#5f6368",
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 16,
  },
  versionText: {
    fontSize: 12,
    color: "#9aa0a6",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginHorizontal: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
    color: "#202124",
  },
  closeButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#5f6368",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f1f3f4",
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    color: "#202124",
  },
  saveButton: {
    backgroundColor: "#1a73e8",
    borderRadius: 4,
    padding: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
});
