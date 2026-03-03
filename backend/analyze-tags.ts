import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function analyzeTags() {
  const uri = process.env.MONGODB_URI || '';
  const dbName = process.env.MONGODB_DB_NAME || 'problemas-dynatrace-dos';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const problems = db.collection('problems');
    
    const countHasTags = await problems.countDocuments({ entityTags: { $exists: true, $not: { $size: 0 } } });
    console.log(`Problems with entityTags: ${countHasTags}`);

    if (countHasTags > 0) {
        // Obtenemos una muestra y listamos todas las keys encontradas
        const sample = await problems.find({ entityTags: { $exists: true, $not: { $size: 0 } } }).limit(100).toArray();
        const allKeys = new Set();
        sample.forEach(p => {
            p.entityTags.forEach((t:any) => allKeys.add(t.key));
        });
        console.log('Sample keys found:', Array.from(allKeys));
        
        const countTnSquad = await problems.countDocuments({ 'entityTags.key': 'tn-squad' });
        console.log(`Problems with tn-squad tag key: ${countTnSquad}`);
    }

  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await client.close();
  }
}

analyzeTags();
