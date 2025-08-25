import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";

dotenv.config();

const app = express();
app.get("/", (req, res) => {
  res.json("Clinix backend is now responding");
});
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      "https://clinix-spehere-assignment.vercel.app",
      "http://localhost:3000", // For local development
      "http://localhost:5173", // For Vite's default port
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Database connection
connectDB();

// Routes
app.use("/auth", authRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/prescriptions", prescriptionRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
