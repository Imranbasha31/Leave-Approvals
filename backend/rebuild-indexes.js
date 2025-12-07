import mongoose from 'mongoose';
import { User } from './src/models/User.js';

const mongoUrl = process.env.MONGODB_URL || 'mongodb+srv://bashaimran021_db_user:Imran%407200@cluster0.sv5thvg.mongodb.net/leave-approval';

async function rebuildIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUrl);
    console.log('✓ Connected to MongoDB');

    console.log('\nChecking for null studentId values...');
    const nullStudentIds = await User.find({ studentId: null });
    if (nullStudentIds.length > 0) {
      console.log(`Found ${nullStudentIds.length} users with null studentId`);
      
      // Generate unique studentIds for users with null values
      for (let i = 0; i < nullStudentIds.length; i++) {
        const user = nullStudentIds[i];
        const uniqueId = `TEMP_${Date.now()}_${i}`;
        await User.findByIdAndUpdate(user._id, { studentId: uniqueId });
        console.log(`Updated ${user.email} with studentId: ${uniqueId}`);
      }
    }

    console.log('\nDropping existing indexes...');
    await User.collection.dropIndexes();
    console.log('✓ Dropped existing indexes');

    console.log('Rebuilding indexes from schema...');
    await User.syncIndexes();
    console.log('✓ Rebuilt indexes from schema');

    console.log('\nVerifying unique constraint on studentId...');
    const allUsers = await User.find();
    const studentIds = allUsers.map(u => u.studentId);
    const uniqueStudentIds = new Set(studentIds);
    console.log(`Total users: ${allUsers.length}`);
    console.log(`Unique studentIds: ${uniqueStudentIds.size}`);

    console.log('\nIndexes applied:');
    const indexes = await User.collection.getIndexes();
    console.log(JSON.stringify(indexes, null, 2));

    console.log('\n✓ Index rebuild complete - studentId is now unique');
    process.exit(0);
  } catch (error) {
    console.error('Error rebuilding indexes:', error.message);
    process.exit(1);
  }
}

rebuildIndexes();
