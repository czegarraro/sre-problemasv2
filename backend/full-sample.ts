import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function fullSample() {
  const uri = process.env.MONGODB_URI || '';
  const dbName = process.env.MONGODB_DB_NAME || 'problemas-dynatrace-dos';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const problems = db.collection('problems');
    
    const sample = await problems.findOne({});
    console.log('--- FULL SAMPLE ---');
    console.log(JSON.stringify(sample, null, 2));

  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await client.close();
  }
}

fullSample();
