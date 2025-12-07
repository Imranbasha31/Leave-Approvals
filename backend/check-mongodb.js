import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkMongoDB() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    console.log('MongoDB URI:', process.env.MONGODB_URI?.substring(0, 50) + '...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB Atlas successfully\n');

    // Get the database
    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`  - ${col.name}`));

    // Count users
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`\n✓ Total users in MongoDB: ${userCount}`);

    // Get all users
    const users = await usersCollection.find().project({ password: 0 }).toArray();
    console.log('\n=== All Users in MongoDB Atlas ===');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Department: ${user.department || 'N/A'}`);
      console.log();
    });

    await mongoose.connection.close();
    console.log('✓ Connection closed');
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

checkMongoDB();
