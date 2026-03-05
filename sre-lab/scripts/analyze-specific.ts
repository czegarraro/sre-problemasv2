import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.join(__dirname, '.env') });

const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB_NAME || 'problemas-dynatrace-dos';

async function analyzeSpecific() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const problems = db.collection('problems');

    const p = await problems.findOne({ dynatraceId: "8603906740944662007_1769405220018V2" });
    if (p) {
        fs.writeFileSync(path.join(__dirname, 'specific_problem.json'), JSON.stringify(p, null, 2));
        console.log('Saved to specific_problem.json');
    } else {
        console.log('Problem not found in DB.');
    }
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await client.close();
  }
}

analyzeSpecific();
