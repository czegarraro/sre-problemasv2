import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function analyzeFirst() {
  const uri = process.env.MONGODB_URI || '';
  const dbName = process.env.MONGODB_DB_NAME || 'problemas-dynatrace-dos';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const problems = db.collection('problems');
    
    console.log('Searching for ANY problem with entityTags...');
    const withTags = await problems.findOne({ entityTags: { $exists: true, $ne: [] } });
    if (withTags) {
        console.log('ID:', withTags.problemId);
        console.log('FULL entityTags:', JSON.stringify(withTags.entityTags, null, 2));
    } else {
        console.log('No problems found with entityTags.');
        console.log('Total problems in collection:', await problems.countDocuments());
    }

  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await client.close();
  }
}

analyzeFirst();
