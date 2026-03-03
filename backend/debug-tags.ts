import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

async function debug() {
  const uri = process.env.MONGODB_URI || '';
  const dbName = process.env.MONGODB_DB_NAME || 'problemas-dynatrace-dos';
  const client = new MongoClient(uri);

  try {
    console.log('Connecting to:', uri.split('@')[1] || uri);
    await client.connect();
    const db = client.db(dbName);
    const problems = db.collection('problems');
    
    // Buscar un problema que tenga el tag tn-squad
    const problem = await problems.findOne({ 'entityTags.key': 'tn-squad' });
    
    if (problem) {
      console.log('FOUND_TAGS:', JSON.stringify(problem.entityTags, null, 2));
    } else {
      console.log('NO_SQUAD_TAG_FOUND');
      // Buscar cualquier problema para ver la estructura
      const anyProblem = await problems.findOne({});
      console.log('ANY_TAGS:', JSON.stringify(anyProblem?.entityTags, null, 2));
    }
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await client.close();
  }
}

debug();
