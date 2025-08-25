import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import { checkRole } from "../middlewares/roleCheck.js";
import {
  createPrescription,
  getPrescriptionsByAppointmentId,
} from "../controllers/prescriptionController.js";

const router = express.Router();

// Apply middlewares
router.use(verifyToken);

// Create a prescription - only doctors can create prescriptions
router.post("/", checkRole(["Doctor"]), createPrescription);

// Get prescriptions for a specific appointment
// FIX: Make sure the parameter name is provided after the colon
router.get("/:appointmentId", getPrescriptionsByAppointmentId);

export default router;
