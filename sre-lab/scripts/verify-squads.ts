import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function verify() {
  const uri = process.env.MONGODB_URI || '';
  const dbName = process.env.MONGODB_DB_NAME || 'problemas-dynatrace-dos';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const squads = await db.collection('squads').find().toArray();
    console.log(`Squads found: ${squads.length}`);
    squads.forEach(s => console.log(`- ${s.name} (${s.tagValue}) - Problems: ${s.problemCount || 0}`));
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

verify();
