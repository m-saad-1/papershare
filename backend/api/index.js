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
import authRoutes from "../../routes/auth.js";
import userRoutes from "../../routes/userRoutes.js";
import paperRoutes from "../../routes/paperRoutes.js";
import adminRoutes from "../../routes/admin.js";
import messageRoutes from "../../routes/messages.js";

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/papers", paperRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);

export default app;
