import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function checkLatest() {
  const uri = process.env.MONGODB_URI || '';
  const dbName = process.env.MONGODB_DB_NAME || 'problemas-dynatrace-dos';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const problems = db.collection('problems');
    
    console.log('--- LATEST PROBLEM ---');
    const latest = await problems.findOne({}, { sort: { startTime: -1 } });
    if (latest) {
        console.log('ID:', latest.problemId);
        console.log('StartTime:', latest.startTime);
        console.log('EntityTags:', JSON.stringify(latest.entityTags, null, 2));
    } else {
        console.log('No problems found.');
    }

    console.log('\n--- RANDOM PROBLEM WITH tn-squad ---');
    const withSquad = await problems.findOne({ 'entityTags.key': 'tn-squad' });
    if (withSquad) {
        console.log('ID:', withSquad.problemId);
        console.log('EntityTags:', JSON.stringify(withSquad.entityTags.find((t:any) => t.key === 'tn-squad'), null, 2));
    } else {
        console.log('No problem found with tn-squad tag key.');
    }

  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await client.close();
  }
}

checkLatest();
