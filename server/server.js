import express from "express";
import mongoose from "mongoose";
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from "./config/db.js";
import authRoutes from './routes/authRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Database connection
connectDB();

// Routes
app.use('/auth', authRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/prescriptions', prescriptionRoutes);

app.get('/',()=>{
  'Clinix backend is responding'
})

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});