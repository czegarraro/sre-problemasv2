
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

// Load env from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME;

if (!MONGODB_URI) {
  process.exit(1);
}

async function checkData() {
  const client = new MongoClient(MONGODB_URI!);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const problems = db.collection('problems');

    const count = await problems.countDocuments();
    console.log(`Problem count: ${count}`);

    if (count === 0) {
      console.log('Collection is empty.');
    } else {
      console.log('Data exists.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkData();
