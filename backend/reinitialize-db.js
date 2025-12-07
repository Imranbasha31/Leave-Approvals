import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './src/models/User.js';

const mongoUrl = process.env.MONGODB_URL || 'mongodb+srv://bashaimran021_db_user:Imran%407200@cluster0.sv5thvg.mongodb.net/leave-approval';

async function reinitializeUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUrl);
    console.log('✓ Connected to MongoDB');

    console.log('\nDropping user collection and indexes...');
    await User.collection.drop();
    console.log('✓ Dropped user collection');

    console.log('Creating seed users with unique studentIds...');
    const seedUsers = [
      {
        name: 'Imran Basha',
        email: 'bashaimran021@gmail.com',
        password: 'Imran@7200',
        role: 'student',
        department: 'Bsc Computer Science',
        studentId: 'CS2024001',
      },
      {
        name: 'Dr. Sarah Advisor',
        email: 'advisor@college.edu',
        password: 'password123',
        role: 'advisor',
        department: 'Bsc Computer Science',
        studentId: 'ADV2024001',
      },
      {
        name: 'Dr. Michael HOD',
        email: 'hod@college.edu',
        password: 'password123',
        role: 'hod',
        department: 'Bsc Computer Science',
        studentId: 'HOD2024001',
      },
      {
        name: 'Prof. Elizabeth Principal',
        email: 'principal@college.edu',
        password: 'password123',
        role: 'principal',
        department: null,
        studentId: 'PRIN2024001',
      },
      {
        name: 'Admin User',
        email: 'admin@college.edu',
        password: 'password123',
        role: 'admin',
        department: null,
        studentId: 'ADMIN2024001',
      },
      {
        name: 'irfan basha',
        email: 'bashairfan518@gmail.com',
        password: 'Irfan@86101',
        role: 'student',
        department: 'Bsc Information Technology',
        studentId: '110121104028',
      },
    ];

    for (const userData of seedUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword,
      });
      await user.save();
      console.log(`✓ Created: ${user.email} with studentId: ${user.studentId}`);
    }

    console.log('\nRebuild indexes...');
    await User.syncIndexes();
    console.log('✓ Indexes rebuilt');

    console.log('\nVerifying data...');
    const allUsers = await User.find().select('-password');
    console.log(`Total users: ${allUsers.length}`);
    allUsers.forEach(u => {
      console.log(`- ${u.name}: ${u.studentId}`);
    });

    console.log('\n✓ Database reinitialized with unique studentIds');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

reinitializeUsers();
