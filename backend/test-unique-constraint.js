import mongoose from 'mongoose';
import { User } from './src/models/User.js';

const mongoUrl = process.env.MONGODB_URL || 'mongodb+srv://bashaimran021_db_user:Imran%407200@cluster0.sv5thvg.mongodb.net/leave-approval';

async function testUniqueConstraint() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUrl);
    console.log('✓ Connected to MongoDB\n');

    console.log('TEST 1: Verifying existing unique studentIds...');
    const allUsers = await User.find().select('email studentId');
    console.log('Current users:');
    allUsers.forEach(u => console.log(`  - ${u.email}: ${u.studentId}`));

    console.log('\nTEST 2: Attempting to create user with duplicate studentId...');
    try {
      const duplicateUser = new User({
        name: 'Test Duplicate',
        email: 'test.duplicate@test.com',
        password: 'hashedPassword123',
        role: 'student',
        studentId: 'CS2024001', // This already exists
      });
      await duplicateUser.save();
      console.log('✗ ERROR: Duplicate was allowed (should have been rejected)');
    } catch (error) {
      if (error.code === 11000) {
        console.log('✓ PASS: Duplicate studentId correctly rejected');
        console.log(`  Error: ${error.message}`);
      } else {
        console.log('✗ ERROR: Wrong error type:', error.message);
      }
    }

    console.log('\nTEST 3: Attempting to create user with unique studentId...');
    try {
      const newUser = new User({
        name: 'Test User',
        email: 'test.user@test.com',
        password: 'hashedPassword123',
        role: 'student',
        studentId: 'TEST2024001',
      });
      await newUser.save();
      console.log('✓ PASS: User with unique studentId created successfully');
      await User.findByIdAndDelete(newUser._id);
      console.log('  (User cleaned up after test)');
    } catch (error) {
      console.log('✗ ERROR:', error.message);
    }

    console.log('\n✓ All tests complete');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testUniqueConstraint();
