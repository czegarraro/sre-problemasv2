import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB_NAME || 'problemas-dynatrace-dos';

async function insertMockData() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const problems = db.collection('problems');

    console.log('Inserting mock problems with tn-squad tags...');
    
    // Update a few existing problems to have the tn-squad tag
    const p1 = await problems.findOneAndUpdate(
        {}, 
        { $set: { entityTags: [{ key: 'tn-squad', value: 'thewhitestripes', context: 'CONTEXTLESS', stringRepresentation: 'tn-squad:thewhitestripes' }] } },
        { sort: { startTime: -1 } }
    );
    
    const p2 = await problems.findOneAndUpdate(
        { _id: { $ne: p1?.value?._id } }, 
        { $set: { entityTags: [{ key: 'tn-squad', value: '6voltios', context: 'CONTEXTLESS', stringRepresentation: 'tn-squad:6voltios' }] } },
        { sort: { startTime: -1 } }
    );

    const p3 = await problems.findOneAndUpdate(
        { _id: { $nin: [p1?.value?._id, p2?.value?._id] } }, 
        { $set: { entityTags: [{ key: 'tn-squad', value: 'thewhitestripes', context: 'CONTEXTLESS', stringRepresentation: 'tn-squad:thewhitestripes' }] } },
        { sort: { startTime: -1 } }
    );

    console.log('✅ Mock data inserted successfully.');
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await client.close();
  }
}

insertMockData();
