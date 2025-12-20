const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { initSocket } = require('./socket/socket.js');
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// CORS configuration
const allowedOrigins = ['https://papershareee.netlify.app', 'http://localhost:5173'];
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

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
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/userRoutes'));
app.use((req, res, next) => {
  console.log("Request to:", req.path);
  next();
});
app.use('/api/papers', require('./routes/paperRoutes'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/messages', require('./routes/messages')); // Added for chat functionality

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

// server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
module.exports = app;
