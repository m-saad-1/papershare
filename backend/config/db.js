import mongoose from 'mongoose';

// Suppress Mongoose deprecation warning
mongoose.set('strictQuery', true);

const globalForMongoose = globalThis;
const connectionCache = globalForMongoose.__papershareMongoose || {
  conn: null,
  promise: null,
};

const connectDB = async () => {
  if (connectionCache.conn) {
    return connectionCache.conn;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set');
  }

  if (!connectionCache.promise) {
    connectionCache.promise = mongoose.connect(mongoUri);
  }

  connectionCache.conn = await connectionCache.promise;
  globalForMongoose.__papershareMongoose = connectionCache;

  console.log(`MongoDB Connected: ${connectionCache.conn.connection.host}`);
  return connectionCache.conn;
};

export default connectDB;
