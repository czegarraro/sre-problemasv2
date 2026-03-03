import { MongoClient } from 'mongodb';

const URI = "mongodb+srv://czegarra_db_user:NF2dkcE5VlBCDNVM@cluster0.rkm5mgr.mongodb.net/?appName=Cluster0&retryWrites=true&w=majority";
const DB_NAME = "problemas-dynatrace-dos";
const COLLECTION_NAME = "problems";

async function run() {
  const client = new MongoClient(URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const problems = await db.collection(COLLECTION_NAME).find({
      $or: [
          { title: { $regex: /response time/i } },
          { severityLevel: 'PERFORMANCE' }
      ]
  }).limit(20).toArray();

  console.log('Sample Performance Titles:');
  problems.forEach(p => console.log(`- ${p.title}`));
  
  await client.close();
}

run();
