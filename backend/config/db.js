const mongoose = require('mongoose');

// Suppress Mongoose deprecation warning
mongoose.set('strictQuery', true);

const connectDB = async () => {
  try {
const conn = await mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s
  family: 4 // Force IPv4 for broad compatibility
});

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
