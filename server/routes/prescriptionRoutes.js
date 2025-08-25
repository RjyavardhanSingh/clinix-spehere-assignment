import express from "express"
import { createPrescription, getPrescriptions }  from '../controllers/prescriptionController.js';
import {verifyToken} from "../middlewares/auth.js"
import { checkRole }  from '../middlewares/roleCheck.js';
const router = express.Router();

// Middleware to verify token and check roles
router.use(verifyToken);
router.use(checkRole(['Doctor', 'Patient']));

// Route to create a prescription
router.post('/', checkRole(['Doctor']), createPrescription);

// Route to get prescriptions by appointment ID
router.get('/:appointmentId', getPrescriptions);

export default router;