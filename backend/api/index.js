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
import universitiesRoutes from "../routes/universities.js";
import paperRequestRoutes from "../routes/paperRequests.js";
import trendingRoutes from "../routes/trending.js";
import reportsRoutes from "../routes/reports.js";
import takedownRoutes from "../routes/takedown.js";
import certificatesRoutes from "../routes/certificates.js";
import notesRoutes from "../routes/notes.js";
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/papers", paperRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/universities", universitiesRoutes);
app.use("/api/requests", paperRequestRoutes);
app.use("/api/trending", trendingRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/takedown", takedownRoutes);
app.use("/api/certificates", certificatesRoutes);
app.use("/api/notes", notesRoutes);

export default app;
