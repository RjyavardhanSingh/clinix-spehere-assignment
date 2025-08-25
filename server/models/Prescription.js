import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    symptoms: { type: String, required: true },
    diagnosis: { type: String, required: true },
    medicines: [{ name: String, dosage: String, duration: String }],
    additionalNotes: { type: String }
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;