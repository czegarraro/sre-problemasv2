
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load env from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env');
  process.exit(1);
}

async function createAdminUser() {
  const client = new MongoClient(MONGODB_URI!);

  try {
    console.log(`Connecting to ${DB_NAME}...`);
    await client.connect();
    const db = client.db(DB_NAME);
    const users = db.collection('users');

    const email = 'admin@dynatrace.com';
    const password = 'admin'; // Simple password for initial access
    
    // Check if user exists
    const existing = await users.findOne({ email });
    if (existing) {
      console.log('⚠️ Admin user already exists. resetting password...');
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      await users.updateOne(
        { email }, 
        { $set: { password: hashedPassword, role: 'admin' } }
      );
      console.log('✅ Password reset for admin@dynatrace.com');
    } else {
      console.log('Creating new admin user...');
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      await users.insertOne({
        email,
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: null
      });
      console.log('✅ Admin user created successfully');
    }
    
    console.log('');
    console.log('👉 LOGIN CREDENTIALS:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await client.close();
  }
}

createAdminUser();
