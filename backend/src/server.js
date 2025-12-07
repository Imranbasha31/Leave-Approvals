import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { LeaveRequest } from './models/LeaveRequest.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Mock users for seeding
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
    studentId: 'ADV2024001',
  },
  {
    name: 'Dr. Michael HOD',
    email: 'hod@college.edu',
    password: 'password123',
    role: 'hod',
    department: 'Computer Science',
    studentId: 'HOD2024001',
  },
  {
    name: 'Prof. Elizabeth Principal',
    email: 'principal@college.edu',
    password: 'password123',
    role: 'principal',
    studentId: 'PRIN2024001',
  },
  {
    name: 'Admin User',
    email: 'admin@college.edu',
    password: 'password123',
    role: 'admin',
    studentId: 'ADMIN2024001',
  },
];

// Seed database function - only seeds if database is completely empty
async function initializeDatabase() {
  try {
    console.log('Checking database...');

    // Check if users already exist
    const existingUsers = await User.countDocuments();
    
    if (existingUsers === 0) {
      console.log('Database is empty. Seeding initial data...');
      
      // Hash passwords and insert seed users
      const usersWithHashedPasswords = await Promise.all(
        MOCK_USERS.map(async (user) => ({
          ...user,
          password: await bcrypt.hash(user.password, 10),
        }))
      );

      await User.insertMany(usersWithHashedPasswords);
      console.log(`✓ Initialized database with ${MOCK_USERS.length} seed users`);
    } else {
      console.log(`✓ Database already contains ${existingUsers} users`);
      console.log('✓ Using existing data - no automatic modifications');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leave-approval';

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');
    // Initialize database (only seeds if empty, never deletes existing data)
    await initializeDatabase();
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leave', leaveRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
