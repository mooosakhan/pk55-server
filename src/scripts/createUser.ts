import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';

const createUser = async (username: string, password: string) => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log(`❌ User "${username}" already exists`);
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      username,
      password: hashedPassword
    });

    await user.save();
    
    console.log('✅ User created successfully!');
    console.log(`   Username: ${username}`);
    console.log(`   ID: ${user._id}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating user:', error);
    process.exit(1);
  }
};

// Get username and password from command line arguments
const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.log('Usage: pnpm create-user <username> <password>');
  console.log('Example: pnpm create-user admin admin123');
  process.exit(1);
}

createUser(username, password);
