import mongoose from 'mongoose';

// Module state survives between warm serverless invocations, so the in-flight
// connection promise is cached here. Without this, every request would open a
// new connection and quickly exhaust the Atlas connection limit.
let connecting: Promise<typeof mongoose> | null = null;

const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) return;

  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error('❌ MONGODB_URI is not set');
    return;
  }

  try {
    if (!connecting) {
      connecting = mongoose.connect(mongoURI, {
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
