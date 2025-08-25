import Prescription from "../models/Prescription.js";

// Create a new prescription
export const createPrescription = async (req, res) => {
  try {
    const { appointmentId, symptoms, diagnosis, medicines, additionalNotes } =
      req.body;

    const prescription = new Prescription({
      appointmentId,
      symptoms,
      diagnosis,
      medicines,
      additionalNotes,
    });

    await prescription.save();

    res
      .status(201)
      .json({ message: "Prescription created successfully", prescription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get prescriptions by appointment ID
export const getPrescriptionsByAppointmentId = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Find prescriptions for this appointment
    const prescriptions = await Prescription.find({ appointmentId });

    res.status(200).json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// You can add more prescription-related controller functions here
