
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME;

async function checkDuration() {
  const client = new MongoClient(MONGODB_URI!);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const problem = await db.collection('problems').findOne({});
    
    if (problem) {
      console.log('Sample Problem Duration:', problem.duration);
      console.log('Start Time:', problem.startTime);
      console.log('End Time:', problem.endTime);
      
      const start = new Date(problem.startTime).getTime();
      const end = new Date(problem.endTime).getTime();
      const calculatedMs = end - start;
      console.log('Calculated MS:', calculatedMs);
      
      if (problem.duration === calculatedMs) {
          console.log('VERDICT: Database duration is in MILLISECONDS');
      } else if (Math.abs(problem.duration - (calculatedMs / 60000)) < 1) {
          console.log('VERDICT: Database duration is in MINUTES');
      } else {
          console.log('VERDICT: Database duration unit is unclear or mismatched.');
      }
    } else {
      console.log('No problems found.');
    }
  } finally {
    await client.close();
  }
}

checkDuration();
