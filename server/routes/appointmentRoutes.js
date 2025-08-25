import express from "express";
import {
  bookAppointment,
  getAppointments,
  updateAppointmentStatus,
} from "../controllers/appointmentController.js";
import { verifyToken } from "../middlewares/auth.js";
import { checkRole } from "../middlewares/roleCheck.js";
const router = express.Router();

// Middleware to verify token and check role
router.use(verifyToken);
router.use(checkRole(["Doctor", "Patient"]));

// Routes for appointment management
router.post("/", checkRole(["Patient"]), bookAppointment); // Only Patients can book appointments

router.get("/", getAppointments); // Both Doctors and Patients can view appointments

router.patch("/:id", checkRole(["Doctor"]), updateAppointmentStatus); // Only Doctors can update appointment status

export default router;
