import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = "mongodb+srv://mn3856902_db_user:7VJjPtaL1ZPDALwu@cluster0.hyqxoyj.mongodb.net/?appName=Cluster0";
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    // DO NOT exit process
  }
};

export default connectDB;
