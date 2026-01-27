import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function audit() {
  console.log('--- STARTING AUDIT ---');
  
  // 1. Check Env Vars
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME;
  
  console.log(`Env DB Name: ${dbName}`);
  
  if (!uri) {
    console.error('CRITICAL: MONGODB_URI not found in .env');
    process.exit(1);
  }

  // 2. Connect DB
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('✅ MongoDB Connected');
    
    const db = client.db(dbName);
    
    // 3. Count Problems
    const problemCount = await db.collection('problems').countDocuments();
    console.log(`📊 Total Problems: ${problemCount}`);
    
    if (problemCount > 9000) {
      console.log('✅ Confirmed ~10k records present.');
    } else {
      console.warn(`⚠️ Warning: Expected ~10k records, found ${problemCount}.`);
    }

    // 4. Check recent ingestion
    const lastProblem = await db.collection('problems').find().sort({ $natural: -1 }).limit(1).next();
    // @ts-ignore
    if (lastProblem) {
       // @ts-ignore
      console.log(`🕒 Latest Record ID: ${lastProblem._id}`);
       // @ts-ignore
      if (lastProblem.lastSyncAt) console.log(`🔄 Last Sync: ${lastProblem.lastSyncAt}`);
    } else {
      console.warn('⚠️ No problems found.');
    }

    // 5. Check Users (Auth)
    const userCount = await db.collection('users').countDocuments();
    console.log(`👤 User Count: ${userCount}`);
     if (userCount === 0) {
      console.error('❌ CRITICAL: No users found. Login will fail.');
    } else {
      console.log('✅ Users table populated.');
    }

  } catch (err) {
    console.error('❌ Audit Failed:', err);
  } finally {
    await client.close();
    process.exit(0);
  }
}

audit();
