import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './src/models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leave-approval';

const MOCK_USERS = [
  {
    name: 'Imran Basha',
    email: 'bashaimran021@gmail.com',
    password: 'Imran@7200',
    role: 'student',
    department: 'Computer Science',
    studentId: 'CS2024001',
  },
  {
    name: 'Dr. Sarah Advisor',
    email: 'advisor@college.edu',
    password: 'password123',
    role: 'advisor',
    department: 'Computer Science',
  },
  {
    name: 'Dr. Michael HOD',
    email: 'hod@college.edu',
    password: 'password123',
    role: 'hod',
    department: 'Computer Science',
  },
  {
    name: 'Prof. Elizabeth Principal',
    email: 'principal@college.edu',
    password: 'password123',
    role: 'principal',
  },
  {
    name: 'Admin User',
    email: 'admin@college.edu',
    password: 'password123',
    role: 'admin',
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Hash passwords and insert users
    const usersWithHashedPasswords = await Promise.all(
      MOCK_USERS.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
      }))
    );

    await User.insertMany(usersWithHashedPasswords);
    console.log(`Seeded ${MOCK_USERS.length} users`);

    await mongoose.connection.close();
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
