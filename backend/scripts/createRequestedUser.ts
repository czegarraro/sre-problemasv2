
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

async function createRequestedUser() {
  const client = new MongoClient(MONGODB_URI!);

  try {
    console.log(`Connecting to ${DB_NAME}...`);
    await client.connect();
    const db = client.db(DB_NAME);
    const users = db.collection('users');

    const email = 'czegarra@dynatrace.com'; // Assuming email format based on username
    const username = 'czegarra';
    const password = 'czegarra';
    
    // Check if user exists by email OR username (if schema supports username)
    // The auth controller checks: email || req.body.username
    // But the auth service login checks: findOne({ email })
    // Wait, let's check auth.service.ts again.
    
    // Validating auth logic from previous view_file:
    // AuthController: const loginIdentifier = email || req.body.username;
    // AuthService.login(email, password): const user = await this.collection.findOne({ email });
    // This implies the system might STRICTLY require email for login lookup if AuthService ONLY queries by email.
    // However, if the frontend sends `username: czegarra`, and backend passes that as `email` to `login`, 
    // then we need a user where `email` field IS 'czegarra' OR we need to adjust logic.
    // Let's look at the AuthService again to be sure.
    // It said: async login(email: string, password: string) ... findOne({ email })
    // So if the user types "czegarra" in the username field, the backend receives { username: "czegarra" }.
    // Controller calls login("czegarra", password).
    // Service calls findOne({ email: "czegarra" }).
    // So we must create a user where the `email` field is literally "czegarra" OR "czegarra@..." and hope the user enters the email.
    // BUT the prompt says "usuario: czegarra". 
    // Configure 'email' field as 'czegarra' to support username login, strictly following the code logic.

    const targetDoc = {
      email: username, // Storing username in email field to support username login via current AuthService implementation
      name: 'Cesar Zegarra',
      role: 'admin'
    };

    const existing = await users.findOne({ email: username });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (existing) {
      console.log(`⚠️ User '${username}' already exists. Resetting password...`);
      await users.updateOne(
        { email: username }, 
        { $set: { password: hashedPassword, role: 'admin' } }
      );
      console.log(`✅ Password reset for '${username}'`);
    } else {
      console.log(`Creating new user '${username}'...`);
      await users.insertOne({
        ...targetDoc,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: null
      });
      console.log(`✅ User '${username}' created successfully`);
    }

  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await client.close();
  }
}

createRequestedUser();
