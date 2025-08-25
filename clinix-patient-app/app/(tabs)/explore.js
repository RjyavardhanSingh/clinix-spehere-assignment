import { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Platform,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../../context/AuthContext";
import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";

// Update API URL to use your machine's IP address instead of 10.0.2.2
const API_URL = "http://192.168.0.12:5000";

export default function ExploreScreen() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("");
  const { user } = useContext(AuthContext);
  const router = useRouter();

  // Time slots available for booking
  const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      if (!user) {
        console.log("User is not available yet");
        setLoading(false);
        setDoctors([
          { _id: "1", username: "Dr. John Smith" },
          { _id: "2", username: "Dr. Sarah Johnson" },
          { _id: "3", username: "Dr. Michael Lee" },
        ]);
        return;
      }

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        setLoading(false);
        setDoctors([
          { _id: "1", username: "Dr. John Smith" },
          { _id: "2", username: "Dr. Sarah Johnson" },
          { _id: "3", username: "Dr. Michael Lee" },
        ]);
        return;
      }

      // Ensure token has "Bearer " prefix
      const authToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

      const response = await axios.get(`${API_URL}/appointments`, {
        headers: {
          Authorization: authToken,
        },
      });

      if (Array.isArray(response.data) && response.data.length > 0) {
        const doctorMap = {};
        response.data.forEach((appointment) => {
          if (appointment.doctorId && appointment.doctorId._id) {
            doctorMap[appointment.doctorId._id] = appointment.doctorId;
          }
        });

        const uniqueDoctors = Object.values(doctorMap);

        if (uniqueDoctors.length > 0) {
          setDoctors(uniqueDoctors);
          return;
        }
      }

      setDoctors([
        { _id: "1", username: "Dr. John Smith" },
        { _id: "2", username: "Dr. Sarah Johnson" },
        { _id: "3", username: "Dr. Michael Lee" },
      ]);
      Alert.alert("Notice", "Using sample doctor data for demonstration");
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setDoctors([
        { _id: "1", username: "Dr. John Smith" },
        { _id: "2", username: "Dr. Sarah Johnson" },
        { _id: "3", username: "Dr. Michael Lee" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Filter doctors based on search query
  const filteredDoctors = doctors.filter((doctor) =>
    doctor.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookAppointment = async () => {
    if (!time) {
      Alert.alert("Error", "Please select a time slot");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "You must be logged in to book an appointment");
        return;
      }

      const formattedDate = date.toISOString().split("T")[0];

      // Make sure we have the right user ID format
      const patientId = user.id || user._id;
      if (!patientId) {
        Alert.alert("Error", "User information is missing");
        return;
      }

      // Book the appointment
      const response = await axios.post(
        `${API_URL}/appointments`,
        {
          doctorId: selectedDoctor._id,
          patientId: patientId,
          date: formattedDate,
          time: time,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Appointment booked successfully:", response.data);

      // Only show success if we get here (no error was thrown)
      Alert.alert(
        "Success!",
        `Your appointment with ${selectedDoctor.username} on ${new Date(
          formattedDate
        ).toLocaleDateString()} at ${time} has been booked successfully.`,
        [
          {
            text: "View Appointments",
            onPress: () => {
              setModalVisible(false);
              // Navigate to appointments tab
              router.push("/(tabs)/");
            },
          },
          {
            text: "OK",
            onPress: () => setModalVisible(false),
          },
        ]
      );

      // Reset the time selection
      setTime("");

      // Notify the appointments page to refresh
      try {
        // We'll use a simpler approach that works on all platforms without using Platform
        setTimeout(() => {
          // This will trigger a refresh when user goes to the appointments tab
          AsyncStorage.setItem("appointmentBooked", new Date().toISOString());
        }, 500);
      } catch (eventError) {
        console.log(
          "Could not dispatch update event, but appointment was booked"
        );
      }
    } catch (error) {
      console.error("Error booking appointment:", error);

      // Show detailed error message
      const errorMessage =
        error.response?.data?.message || "Failed to book appointment";
      Alert.alert("Error", errorMessage);
    }
  };

  const renderDoctorItem = ({ item }) => (
    <TouchableOpacity
      style={styles.doctorCard}
      onPress={() => {
        setSelectedDoctor(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.doctorIconContainer}>
        <FontAwesome name="user-md" size={36} color="#1a73e8" />
      </View>
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>{item.username}</Text>
        <Text style={styles.doctorSpecialty}>
          {item.specialty || "General Physician"}
        </Text>
      </View>
      <FontAwesome name="chevron-right" size={16} color="#dadce0" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <FontAwesome
          name="search"
          size={18}
          color="#5f6368"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search doctors..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9aa0a6"
        />
      </View>

      <FlatList
        data={filteredDoctors}
        renderItem={renderDoctorItem}
        keyExtractor={(item) => item._id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="user-md" size={64} color="#dadce0" />
            <Text style={styles.emptyText}>No doctors found</Text>
          </View>
        }
      />

      {/* Book Appointment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Appointment</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <FontAwesome name="close" size={22} color="#5f6368" />
              </TouchableOpacity>
            </View>

            <Text style={styles.doctorNameModal}>
              {selectedDoctor?.username}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Select Date</Text>
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  const currentDate = selectedDate || date;
                  setDate(currentDate);
                }}
                minimumDate={new Date()}
                style={styles.datePicker}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Select Time</Text>
              <View style={styles.timeSlotContainer}>
                {timeSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      styles.timeSlot,
                      time === slot && styles.selectedTimeSlot,
                    ]}
                    onPress={() => setTime(slot)}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        time === slot && styles.selectedTimeSlotText,
                      ]}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.bookButton}
              onPress={handleBookAppointment}
            >
              <Text style={styles.bookButtonText}>Book Appointment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f9fc",
    paddingTop: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#202124",
  },
  listContainer: {
    padding: 16,
  },
  doctorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  doctorIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e8f0fe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#202124",
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: "#5f6368",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#5f6368",
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#202124",
  },
  closeButton: {
    padding: 4,
  },
  doctorNameModal: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1a73e8",
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#5f6368",
    marginBottom: 8,
  },
  datePicker: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    height: 50,
  },
  timeSlotContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  timeSlot: {
    width: "23%",
    margin: "1%",
    padding: 12,
    backgroundColor: "#f1f3f4",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#f1f3f4",
  },
  selectedTimeSlot: {
    backgroundColor: "#e8f0fe",
    borderColor: "#1a73e8",
  },
  timeSlotText: {
    color: "#5f6368",
    fontSize: 12,
    fontWeight: "500",
  },
  selectedTimeSlotText: {
    color: "#1a73e8",
  },
  bookButton: {
    backgroundColor: "#1a73e8",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  bookButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
});
