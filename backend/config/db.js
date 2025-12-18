const mongoose = require('mongoose');

// Suppress Mongoose deprecation warning
mongoose.set('strictQuery', true);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
<<<<<<< HEAD
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
      family: 4 // Force IPv4 for broad compatibility
=======
      serverSelectionTimeoutMS: 5002, // Timeout after 5s
      useUnifiedTopology: true,
      Family: 4
>>>>>>> bb070d24c55c951e2f7f359ffbfe6135b7e0627c
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
