import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://moosakhan3856902_db_user:ZkEuoV6vHkLYND2Q@cluster0.hyqxoyj.mongodb.net/?appName=Cluster0';
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📍 Database: ${mongoURI}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
