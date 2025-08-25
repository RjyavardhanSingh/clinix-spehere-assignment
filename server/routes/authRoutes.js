import express from "express";
import { register, login } from "../controllers/authController.js";

const router = express.Router();

// Make sure these routes are properly formatted
router.post("/register", register);
router.post("/login", login);

export default router;
