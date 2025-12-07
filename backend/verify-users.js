import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './src/models/User.js';

dotenv.config();

async function verifyUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    const users = await User.find().select('name email role department studentId');
    console.log('\n=== Users in Database ===');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Department: ${user.department || 'N/A'}`);
      console.log(`   Student ID: ${user.studentId || 'N/A'}`);
      console.log();
    });

    console.log(`Total users: ${users.length}`);
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verifyUsers();
