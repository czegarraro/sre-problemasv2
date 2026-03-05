import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function listCollections() {
  const uri = process.env.MONGODB_URI || '';
  const dbName = process.env.MONGODB_DB_NAME || 'problemas-dynatrace-dos';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    for (const coll of collections) {
        const count = await db.collection(coll.name).countDocuments();
        console.log(`Count for ${coll.name}: ${count}`);
        const sample = await db.collection(coll.name).findOne({});
        console.log(`Sample Keys for ${coll.name}:`, Object.keys(sample || {}));
    }

  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await client.close();
  }
}

listCollections();
