import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import { checkRole } from "../middlewares/roleCheck.js";
import {
  createPrescription,
  getPrescriptionsByAppointmentId,
} from "../controllers/prescriptionController.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Create a prescription (only doctors)
router.post("/", checkRole(["Doctor"]), createPrescription);

// Get prescriptions for a specific appointment
router.get("/:appointmentId", getPrescriptionsByAppointmentId);

export default router;
