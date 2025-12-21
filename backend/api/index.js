import express from "express";
import cors from "cors";
import mongoose from "mongoose";

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
import authRoutes from "../../routes/auth.js"; // Adjusted path to authRoutes
app.use("/api/auth", authRoutes);

export default app;
