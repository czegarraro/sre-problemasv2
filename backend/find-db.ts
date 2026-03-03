import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function findDatabases() {
  const uri = process.env.MONGODB_URI || '';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const admin = client.db().admin();
    const dbs = await admin.listDatabases();
    console.log('Databases:', dbs.databases.map(db => db.name));
    
    for (const dbInfo of dbs.databases) {
        const db = client.db(dbInfo.name);
        if (dbInfo.name === 'local' || dbInfo.name === 'admin' || dbInfo.name === 'config') continue;
        const problems = await db.collection('problems').findOne({ entityTags: { $exists: true } });
        if (problems) {
            console.log(`Found problems with tags in DB: ${dbInfo.name}`);
            console.log('Sample Tags:', JSON.stringify(problems.entityTags.slice(0, 2), null, 2));
        } else {
            console.log(`No tags found in DB: ${dbInfo.name}`);
        }
    }

  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await client.close();
  }
}

findDatabases();
