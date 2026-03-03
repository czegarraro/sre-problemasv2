import { MongoClient } from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'problemas-dynatrace-dos';
const COLLECTION_NAME = process.env.MONGODB_COLLECTION_NAME || 'problems';

async function importData() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const dataPath = path.join(__dirname, '../../problem_dump.json');
    console.log(`Reading data from ${dataPath}...`);
    
    const fileContent = fs.readFileSync(dataPath, 'utf8');
    
    let problems: any[] = [];
    
    // Intentar parsear como array JSON
    if (fileContent.trim().startsWith('[')) {
        console.log('Detected JSON Array format.');
        problems = JSON.parse(fileContent);
    } else {
        // Intentar parsear como JSONL o objetos concatenados
        console.log('Detected potential JSONL or concatenated objects format.');
        // Un truco para objetos concatenados si no hay separadores claros es buscar }{
        // Pero primero probamos con split por nueva línea si están así
        const lines = fileContent.split('\n').filter(l => l.trim());
        if (lines.length > 1 && lines[0].trim().startsWith('{')) {
             problems = lines.map(line => {
                 try { return JSON.parse(line); } catch(e) { return null; }
             }).filter(p => p !== null);
        } else {
            // Si es un solo objeto gigante pero grep dice que hay muchos problemId, 
            // puede que sea un archivo con múltiples objetos pegados
            // Intentamos envolverlo en [] y poner comas entre }{
            const wrapped = '[' + fileContent.replace(/\}\s*\{/g, '},{') + ']';
            try {
                problems = JSON.parse(wrapped);
            } catch (e) {
                console.error('Failed to parse concatenated objects.');
            }
        }
    }

    if (problems.length === 0) {
        console.error('No problems parsed. Check file format.');
        return;
    }

    console.log(`Upserting ${problems.length} problems into ${COLLECTION_NAME}...`);
    
    let successCount = 0;
    for (const problem of problems) {
        const { _id, ...updateData } = problem;
        if (updateData.dynatraceId) {
            await collection.updateOne(
                { dynatraceId: updateData.dynatraceId },
                { $set: updateData },
                { upsert: true }
            );
            successCount++;
            if (successCount % 100 === 0) console.log(`Processed ${successCount}...`);
        }
    }

    console.log(`✅ Successfully upserted ${successCount} problems.`);

  } catch (err) {
    console.error('❌ Error importing data:', err);
  } finally {
    await client.close();
  }
}

importData();
