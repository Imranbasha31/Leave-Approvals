import mongoose from 'mongoose';
import { User } from './src/models/User.js';

const mongoUrl = process.env.MONGODB_URL || 'mongodb+srv://bashaimran021_db_user:Imran%407200@cluster0.sv5thvg.mongodb.net/leave-approval';

async function cleanupDuplicates() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUrl);
    console.log('✓ Connected to MongoDB');

    console.log('\nFetching all users...');
    const allUsers = await User.find().sort({ createdAt: 1 });
    console.log(`Total users: ${allUsers.length}\n`);
    
    console.log('Users in database:');
    allUsers.forEach(u => {
      console.log(`- ${u.name} (${u.email}): studentId=${u.studentId}`);
    });

    console.log('\n\nChecking for duplicate studentIds...');
    const studentIdMap = {};
    const duplicates = [];
    
    allUsers.forEach(user => {
      if (user.studentId) {
        if (studentIdMap[user.studentId]) {
          duplicates.push({
            existing: studentIdMap[user.studentId],
            duplicate: user
          });
        } else {
          studentIdMap[user.studentId] = user;
        }
      }
    });

    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} duplicate(s):`);
      duplicates.forEach(d => {
        console.log(`  - ${d.existing.email} and ${d.duplicate.email} both have studentId: ${d.existing.studentId}`);
      });
      
      console.log('\nRemoving duplicates...');
      for (const dup of duplicates) {
        await User.findByIdAndDelete(dup.duplicate._id);
        console.log(`Deleted: ${dup.duplicate.email}`);
      }
    } else {
      console.log('No duplicates found');
    }

    console.log('\n✓ Cleanup complete');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

cleanupDuplicates();
