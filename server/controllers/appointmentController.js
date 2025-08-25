import Appointment from "../models/Appointment.js";

export const bookAppointment = async (req, res) => {
    const { patientId, doctorId, date, time } = req.body;

    try {
        const newAppointment = new Appointment({
            patientId,
            doctorId,
            date,
            time,
            status: 'Pending'
        });

        await newAppointment.save();
        res.status(201).json({ message: 'Appointment booked successfully', appointment: newAppointment });
    } catch (error) {
        res.status(500).json({ message: 'Error booking appointment', error });
    }
};

export const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find().populate('patientId doctorId');
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointments', error });
    }
};

export const updateAppointmentStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const updatedAppointment = await Appointment.findByIdAndUpdate(id, { status }, { new: true });
        if (!updatedAppointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.status(200).json({ message: 'Appointment status updated', appointment: updatedAppointment });
    } catch (error) {
        res.status(500).json({ message: 'Error updating appointment status', error });
    }
};