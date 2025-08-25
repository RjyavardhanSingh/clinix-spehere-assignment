import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const PrescriptionView = ({
  isVisible,
  prescription,
  onClose,
  appointmentData,
}) => {
  if (!prescription) return null;

  // Log the data to understand structure
  console.log("Rendering prescription:", prescription);
  console.log("Appointment data:", appointmentData);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {/* Header with close button */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Prescription Details</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <FontAwesome name="times" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView}>
              {/* Patient Information - Use appointmentData if available */}
              {appointmentData && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Patient Information</Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Patient:</Text>
                    <Text style={styles.infoValue}>
                      {appointmentData.patientId?.username || "Not available"}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Doctor:</Text>
                    <Text style={styles.infoValue}>
                      {appointmentData.doctorId?.username || "Not available"}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Date:</Text>
                    <Text style={styles.infoValue}>
                      {appointmentData.date
                        ? new Date(appointmentData.date).toLocaleDateString()
                        : "Not available"}
                    </Text>
                  </View>
                </View>
              )}

              {/* Medical Details */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Medical Details</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Symptoms:</Text>
                  <Text style={styles.infoValue}>
                    {prescription.symptoms || "None"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Diagnosis:</Text>
                  <Text style={styles.infoValue}>
                    {prescription.diagnosis || "None"}
                  </Text>
                </View>
              </View>

              {/* Medications */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Medications</Text>
                {prescription.medicines && prescription.medicines.length > 0 ? (
                  prescription.medicines.map((med, index) => (
                    <View key={index} style={styles.medicationItem}>
                      <Text style={styles.medicationName}>{med.name}</Text>
                      <Text style={styles.medicationDosage}>
                        Dosage: {med.dosage}
                      </Text>
                      <Text style={styles.medicationDuration}>
                        Duration: {med.duration}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDataText}>
                    No medications prescribed.
                  </Text>
                )}
              </View>

              {/* Notes */}
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Additional Notes</Text>
                <Text style={styles.notes}>
                  {prescription.additionalNotes ||
                    "No additional notes provided."}
                </Text>
              </View>
            </ScrollView>

            {/* Bottom close button */}
            <TouchableOpacity
              style={styles.bottomCloseButton}
              onPress={onClose}
            >
              <Text style={styles.bottomCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0,
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 15,
    width: "90%",
    maxHeight: "85%",
    padding: 0,
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  closeButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    maxHeight: "80%",
    paddingHorizontal: 16,
  },
  sectionContainer: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoLabel: {
    width: "30%",
    fontWeight: "500",
    color: "#666",
  },
  infoValue: {
    flex: 1,
    color: "#333",
  },
  medicationItem: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  medicationDuration: {
    fontSize: 14,
    color: "#666",
  },
  notes: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    color: "#444",
    lineHeight: 20,
  },
  noDataText: {
    fontStyle: "italic",
    color: "#888",
    padding: 12,
  },
  bottomCloseButton: {
    backgroundColor: "#1a73e8",
    borderRadius: 8,
    padding: 16,
    margin: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomCloseText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default PrescriptionView;
