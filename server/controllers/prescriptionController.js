import Prescription from "../models/Prescription.js";

export const createPrescription = async (req, res) => {
    const { appointmentId, symptoms, diagnosis, medicines, additionalNotes } = req.body;

    try {
        const prescription = new Prescription({
            appointmentId,
            symptoms,
            diagnosis,
            medicines,
            additionalNotes
        });

        await prescription.save();
        res.status(201).json({ message: 'Prescription created successfully', prescription });
    } catch (error) {
        res.status(500).json({ message: 'Error creating prescription', error });
    }
};

export const getPrescriptions = async (req, res) => {
    const { appointmentId } = req.params;

    try {
        const prescriptions = await Prescription.find({ appointmentId });
        res.status(200).json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching prescriptions', error });
    }
};