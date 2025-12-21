import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from 'dotenv'; // Import dotenv
import connectDB from '../config/db.js'; // Import connectDB

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

app.options("*", cors());

app.use(express.json());

// health check
app.get("/api", (req, res) => {
  res.json({ status: "API OK" });
});

// routes
import authRoutes from "../routes/auth.js"; // Changed path
import userRoutes from "../routes/userRoutes.js"; // Changed path
import paperRoutes from "../routes/paperRoutes.js"; // Changed path
import adminRoutes from "../routes/admin.js"; // Changed path
import messageRoutes from "../routes/messages.js"; // Changed path
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/papers", paperRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);

export default app;
