import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MONGODB_URI found in .env');
    console.log('Current env:', process.env);
    process.exit(1);
  }

  console.log('Connecting to DB...');
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const dbName = process.env.MONGODB_DB_NAME || 'problemas-dynatrace-dos';
    const db = client.db(dbName);
    const collection = db.collection(process.env.MONGODB_COLLECTION_NAME || 'problems');
    
    console.log(`Connected to database: ${dbName}`);
    console.log(`Collection: ${collection.collectionName}`);

    // 1. Get total count
    const total = await collection.countDocuments();
    console.log(`Total documents: ${total}`);

    // 2. Sample one document
    const sample = await collection.findOne({ isFlapping: true }); // Try to find a flapping one
    if (sample) {
      console.log('\n--- Sample Document (Flapping) ---');
      console.log('startTime:', sample.startTime);
      console.log('title:', sample.title);
      console.log('isFlapping:', sample.isFlapping);
      console.log('classification:', sample.classification);
      console.log('score:', sample.falsePositiveScore);
      console.log('reasons:', sample.falsePositiveReason);
    } else {
      console.log('No flapping documents found in sample, checking normal doc...');
      const normal = await collection.findOne({});
       if (normal) {
          console.log('\n--- Sample Document (Normal) ---');
          console.log('isFlapping:', normal.isFlapping); // Should be false/undefined
          console.log('classification:', normal.classification);
       }
    }

    // 3. Check for documents in Jan 2026
    console.log('\n--- Checking Jan 2026 Data ---');
    // FIXED: Use Date objects as per new repository logic
    const janFilter = {
      startTime: {
        $gte: new Date('2026-01-01'), 
        $lte: new Date('2026-01-31')
      }
    };
    
    // Also try Timestamp format just in case (epoch)
    const janFilterTimestamp = {
      startTime: {
         $gte: 1767225600000, // 2026-01-01 ms
         $lte: 1769817600000  // 2026-01-31 ms
      }
    };

    const countString = await collection.countDocuments(janFilter);
    console.log(`Count with Date Object filter ('2026-01-01'): ${countString}`);

    // --- NEW: Comprehensive Field Audit ---
    console.log('\n--- Comprehensive Field Audit ---');
    
    const fieldsToCheck = [
      'impactLevel',
      'severityLevel',
      'status',
      'managementZones.name',
      'affectedEntities.entityId.type',
      'evidenceDetails.details.evidenceType'
    ];

    for (const field of fieldsToCheck) {
      const distinctValues = await collection.distinct(field);
      console.log(`\nDistinct values for [${field}]:`);
      console.log(distinctValues);
    }
    
    // Check Entity Tags specifically (often an array of objects)
    console.log('\nSample Entity Tags (first 5 docs):');
    const tagDocs = await collection.find({ 'entityTags': { $exists: true, $ne: [] } }).limit(5).project({ entityTags: 1 }).toArray();
    tagDocs.forEach((doc, i) => {
        console.log(`Doc ${i+1}:`, JSON.stringify(doc.entityTags, null, 2));
    });

    // Check Root Cause field structure
    console.log('\nRoot Cause Sample (first 3 with root cause):');
    const rcDocs = await collection.find({ 'rootCauseEntity': { $ne: null } }).limit(3).project({ rootCauseEntity: 1 }).toArray();
    console.log(JSON.stringify(rcDocs, null, 2));

    // Check Automation fields (Autoremediado / FuncionoAutoRemediacion)
    console.log('\nAutomation Fields:');
    const autoValues = await collection.distinct('Autoremediado');
    const funcAutoValues = await collection.distinct('FuncionoAutoRemediacion');
    console.log('Autoremediado values:', autoValues);
    console.log('FuncionoAutoRemediacion values:', funcAutoValues);


  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

run();
