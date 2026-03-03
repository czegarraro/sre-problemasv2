import { MongoClient } from 'mongodb';
import fs from 'fs';

const URI = "mongodb+srv://czegarra_db_user:NF2dkcE5VlBCDNVM@cluster0.rkm5mgr.mongodb.net/?appName=Cluster0&retryWrites=true&w=majority";
const DB_NAME = "problemas-dynatrace-dos";
const COLLECTION_NAME = "problems";

async function run() {
  const client = new MongoClient(URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const problem = await db.collection(COLLECTION_NAME).findOne({ title: { $regex: /response time/i } });
  
  if (problem) {
      fs.writeFileSync('problem_dump.json', JSON.stringify(problem, null, 2), 'utf8');
      console.log('Dumped to problem_dump.json');
  } else {
      console.log('No problem found');
  }
  
  await client.close();
}

run();
