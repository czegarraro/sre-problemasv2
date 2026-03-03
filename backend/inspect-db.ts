import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function inspectCollections() {
  const uri = process.env.MONGODB_URI || '';
  const dbName = process.env.MONGODB_DB_NAME || 'problemas-dynatrace-dos';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    
    console.log('--- PROBLEMS COLLECTION ---');
    const problem = await db.collection('problems').findOne({ 'entityTags.key': 'tn-squad' });
    if (problem) {
      console.log('Sample Problem ID:', problem.problemId);
      console.log('Sample Problem Tag tn-squad:', problem.entityTags.find((t: any) => t.key === 'tn-squad'));
    } else {
        const anyProblem = await db.collection('problems').findOne();
        console.log('Any Problem Keys:', Object.keys(anyProblem || {}));
        if (anyProblem?.entityTags) {
            console.log('Any Problem Tags:', JSON.stringify(anyProblem.entityTags.slice(0, 2), null, 2));
        } else {
            console.log('Any Problem has NO entityTags field');
        }
    }

    console.log('\n--- SQUADS COLLECTION ---');
    const squads = await db.collection('squads').find().toArray();
    console.log(`Count: ${squads.length}`);
    console.log('Samples:', JSON.stringify(squads.slice(0, 3), null, 2));

  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await client.close();
  }
}

inspectCollections();
