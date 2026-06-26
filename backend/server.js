import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
// import { initSocket } from './socket/socket.js'; // Assuming socket.js is ES module too
import path from 'path';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load env vars
dotenv.config({ path: './backend/.env' });

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
}));

// Handle preflight requests for all routes
app.options("*", cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Create HTTP server and initialize Socket.IO
// const http = require('http');
// const server = http.createServer(app);
// initSocket(server); // WebSocket functionality like Socket.IO is not supported in Vercel's standard serverless functions.

// Mount routers
import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoutes.js';
import paperRoutes from './routes/paperRoutes.js';
import adminRoutes from './routes/admin.js';
import messageRoutes from './routes/messages.js';
import paperRequestRoutes from './routes/paperRequests.js';
import universityRoutes from './routes/universities.js';
import notesRoutes from './routes/notes.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use((req, res, next) => {
  console.log("Request to:", req.path);
  next();
});
app.use('/api/papers', paperRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes); // Added for chat functionality
app.use('/api/requests', paperRequestRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/notes', notesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
