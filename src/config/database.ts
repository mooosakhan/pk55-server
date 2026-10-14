import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = "mongodb+srv://moosakhan3856902_db_user:JsjNssLLBXbiKA0T@cluster0.5ui7fhr.mongodb.net/?appName=Cluster0";
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    // DO NOT exit process
  }
};

export default connectDB;
