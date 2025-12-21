import mongoose from 'mongoose';

// Suppress Mongoose deprecation warning
mongoose.set('strictQuery', true);

const connectDB = async () => {
  try {
const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      family: 4, // Force Mongoose to use IPv4
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
