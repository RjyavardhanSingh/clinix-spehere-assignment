import { useCallback, useEffect, useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../../context/AuthContext";
import PrescriptionView from "../../components/PrescriptionView";
import { API } from "../../config/api"; // Import the API config

export default function AppointmentsScreen() {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);

  // Fetch prescription by appointment ID
  const fetchPrescription = async (appointmentId) => {
    if (!appointmentId) {
      console.log("No appointment ID provided");
      return null;
    }

    try {
      setPrescriptionLoading(true);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        console.log("No token found");
        return null;
      }

      console.log(`Fetching prescription for appointment: ${appointmentId}`);

      const response = await axios.get(
        API.prescriptions.getByAppointment(appointmentId),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Prescription response:", response.status);

      if (response.data && response.data.length > 0) {
        console.log("Prescription found:", response.data[0]);
        return response.data[0];
      } else {
        console.log("No prescription found for this appointment");
        return null;
      }
    } catch (error) {
      console.error("Error fetching prescription:", error);
      return null;
    } finally {
      setPrescriptionLoading(false);
    }
  };

  // Update handleViewPrescription to fetch prescription
  const handleViewPrescription = async (appointment) => {
    try {
      console.log(
        "Trying to view prescription for appointment:",
        appointment._id
      );
      setSelectedAppointment(appointment);

      // Show loading indicator
      setPrescriptionLoading(true);

      // Fetch the prescription
      const prescription = await fetchPrescription(appointment._id);

      if (prescription) {
        console.log("Successfully fetched prescription:", prescription);
        setSelectedPrescription(prescription);
      } else {
        console.log("No prescription available");
        Alert.alert(
          "No Prescription",
          "No prescription has been added for this appointment yet.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error handling view prescription:", error);
      Alert.alert("Error", "Failed to load prescription details");
    } finally {
      setPrescriptionLoading(false);
    }
  };

  // Update the fetchAppointments function to handle null user
  const fetchAppointments = useCallback(async () => {
    try {
      if (!user) {
        console.log("User is not available yet");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Get the raw token
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.log("No token found in AsyncStorage");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Make sure to add "Bearer " prefix
      const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
      console.log("Using properly formatted token with Bearer prefix");

      try {
        // Make API call with properly formatted auth header
        const response = await axios.get(API.appointments.base, {
          headers: {
            Authorization: authToken,
          },
        });

        console.log("Response received, appointments:", response.data.length);

        // Filter appointments for current patient
        const patientAppointments = response.data.filter((appointment) => {
          // Check both ID and _ID fields in case backend is inconsistent
          const patientId =
            appointment.patientId.id || appointment.patientId._id;
          const userId = user.id || user._id;

          console.log("Comparing:", patientId, "vs", userId);
          return patientId === userId;
        });

        setAppointments(patientAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);

        // For demo purposes, generate sample appointments
        const sampleAppointments = [
          {
            _id: "1",
            doctorId: { _id: "1", username: "Dr. John Smith" },
            patientId: { _id: user.id, username: user.username },
            date: new Date().toISOString(),
            time: "10:00 AM",
            status: "Pending",
          },
          {
            _id: "2",
            doctorId: { _id: "2", username: "Dr. Sarah Johnson" },
            patientId: { _id: user.id, username: user.username },
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
            time: "02:30 PM",
            status: "Completed",
          },
        ];

        console.log("Using sample appointment data");
        setAppointments(sampleAppointments);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]); // Keep user in the dependency array

  useEffect(() => {
    if (user) {
      fetchAppointments();
    } else {
      console.log("Waiting for user data to be available...");
      setLoading(false);
    }
  }, [fetchAppointments, user]);

  // In the AppointmentsScreen component:

  // Add this effect to listen for appointment changes
  useEffect(() => {
    // Check for new appointments flag on focus
    const checkForNewAppointments = async () => {
      try {
        const lastBookedTime = await AsyncStorage.getItem("appointmentBooked");
        if (lastBookedTime) {
          console.log("New appointment detected, refreshing list");
          fetchAppointments();
          // Clear the flag after refreshing
          await AsyncStorage.removeItem("appointmentBooked");
        }
      } catch (error) {
        console.error("Error checking for new appointments:", error);
      }
    };

    // Run on component mount
    checkForNewAppointments();

    // Set up interval to check periodically
    const interval = setInterval(checkForNewAppointments, 5000);

    return () => clearInterval(interval);
  }, [fetchAppointments]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAppointments();
  }, [fetchAppointments]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#ffa000";
      case "Completed":
        return "#34a853";
      case "Cancelled":
        return "#d93025";
      default:
        return "#5f6368";
    }
  };

  const renderAppointmentItem = ({ item }) => {
    // Get doctor's name from the appointment
    const doctorName = item.doctorId?.username || "Unknown Doctor";

    return (
      <TouchableOpacity style={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <View style={styles.doctorInfo}>
            <FontAwesome name="user-md" size={24} color="#1a73e8" />
            <Text style={styles.doctorName}>{doctorName}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(item.status)}20` },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.appointmentDetails}>
          <View style={styles.detailRow}>
            <FontAwesome name="calendar" size={16} color="#5f6368" />
            <Text style={styles.detailText}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <FontAwesome name="clock-o" size={16} color="#5f6368" />
            <Text style={styles.detailText}>{item.time}</Text>
          </View>
        </View>

        {item.status === "Completed" && (
          <TouchableOpacity
            style={styles.prescriptionButton}
            onPress={() => handleViewPrescription(item)}
          >
            <FontAwesome name="file-text-o" size={16} color="#1a73e8" />
            <Text style={styles.prescriptionText}>View Prescription</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={appointments}
        renderItem={renderAppointmentItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="calendar-o" size={64} color="#dadce0" />
            <Text style={styles.emptyText}>No appointments found</Text>
            <Text style={styles.emptySubtext}>
              Book an appointment from the Explore tab
            </Text>
          </View>
        }
      />

      {/* Loading indicator for prescriptions */}
      {prescriptionLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text style={styles.loadingText}>Loading prescription...</Text>
        </View>
      )}

      {/* Prescription view modal */}
      {selectedPrescription && (
        <PrescriptionView
          isVisible={!!selectedPrescription}
          prescription={selectedPrescription}
          appointmentData={selectedAppointment}
          onClose={() => {
            setSelectedPrescription(null);
            setSelectedAppointment(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fc",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  appointmentCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  doctorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#202124",
    marginLeft: 10,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  appointmentDetails: {
    borderTopWidth: 1,
    borderTopColor: "#f1f3f4",
    paddingTop: 12,
    marginTop: 4,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#5f6368",
    marginLeft: 8,
  },
  prescriptionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f3f4",
  },
  prescriptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1a73e8",
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#5f6368",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#80868b",
    textAlign: "center",
    marginTop: 8,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
});
