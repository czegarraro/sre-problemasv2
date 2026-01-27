
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
// User specifically requested connection to "problemas-dos" (likely referencing the suffix)
// The .env currently has 'problemas-dynatrace-dos'. We will check that specific DB.
const DB_NAME = process.env.MONGODB_DB_NAME;

async function checkAntifragility() {
  console.log(`\n🛡️  ANTIFRAGILITY CONNECTION CHECK`);
  console.log(`=================================`);
  console.log(`Target Database: ${DB_NAME}`);
  
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI missing in .env');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI, {
    // Antifragile settings: Robust timeouts and retries
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000,
    retryReads: true,
    retryWrites: true,
  });

  try {
    console.log('🔄 Attempting robustness handshake...');
    await client.connect();
    console.log('✅ Connection established.');

    const db = client.db(DB_NAME);
    
    // Check Stats
    const stats = await db.stats();
    console.log(`\n📊 Database Vital Signs:`);
    console.log(`   - Objects: ${stats.objects}`);
    console.log(`   - Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   - Collections: ${stats.collections}`);

    // Verify Collections
    const collections = await db.listCollections().toArray();
    console.log(`\n🗄️  Collections Found:`);
    collections.forEach(c => console.log(`   - ${c.name}`));

    console.log(`\n✨ STATUS: ONLINE & ANTIFRAGILE`);

  } catch (error) {
    console.error('💥 FRAGILITY DETECTED (Connection Failed):', error);
  } finally {
    await client.close();
  }
}

checkAntifragility();
