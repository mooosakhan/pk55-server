import mongoose from 'mongoose';
import { MONGODB_URI } from './config';

// Module state survives between warm serverless invocations, so the in-flight
// connection promise is cached here. Without this, every request would open a
// new connection and quickly exhaust the Atlas connection limit.
let connecting: Promise<typeof mongoose> | null = null;

const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) return;

  try {
    if (!connecting) {
      connecting = mongoose.connect(MONGODB_URI, {
        // Fail fast instead of letting a request hang for the default 30s.
        serverSelectionTimeoutMS: 10000
      });
    }
    await connecting;
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    // Clear the cache so the next request retries rather than awaiting a
    // promise that is already known to have rejected.
    connecting = null;
    console.error('❌ MongoDB connection error:', err);
    // DO NOT exit process
  }
};

export default connectDB;
