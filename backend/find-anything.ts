import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function findAnything() {
  const uri = process.env.MONGODB_URI || '';
  const dbName = process.env.MONGODB_DB_NAME || 'problemas-dynatrace-dos';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const problems = db.collection('problems');
    
    const count = await problems.countDocuments();
    console.log('Total problems:', count);
    
    const withTags = await problems.countDocuments({ entityTags: { $exists: true, $ne: [] } });
    console.log('Problems with non-empty tags:', withTags);
    
    if (withTags > 0) {
        const sample = await problems.findOne({ entityTags: { $exists: true, $ne: [] } });
        console.log('Sample with tags:', JSON.stringify(sample?.entityTags, null, 2));
    } else {
        const sample = await problems.findOne();
        console.log('Sample keys:', Object.keys(sample || {}));
        console.log('Sample status:', sample?.status);
    }

  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await client.close();
  }
}

findAnything();
