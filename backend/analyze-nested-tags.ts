import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB_NAME || 'problemas-dynatrace-dos';

async function analyzeNestedTags() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const problems = db.collection('problems');

    console.log('Fetching problems and analyzing nested tags...');
    
    // We can use an aggregation to find unique values of tn-squad
    const pipeline = [
      // Desenvolver la lista de evidenceDetails.details
      { $unwind: "$evidenceDetails.details" },
      // Desenvolver la lista de entityTags dentro de data
      { $unwind: "$evidenceDetails.details.data.entityTags" },
      // Filtrar solo los tags con key "tn-squad"
      { $match: { "evidenceDetails.details.data.entityTags.key": "tn-squad" } },
      // Agrupar por el valor del tag
      { $group: { _id: "$evidenceDetails.details.data.entityTags.value", count: { $sum: 1 } } }
    ];

    const results = await problems.aggregate(pipeline).toArray();
    console.log('Unique tn-squad values found in nested evidenceDetails:');
    console.log(JSON.stringify(results, null, 2));
    
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await client.close();
  }
}

analyzeNestedTags();
