import * as dotenv from 'dotenv';
dotenv.config();
import { database } from './src/config/database';
import * as fs from 'fs';

async function run() {
  try {
    console.log('Connecting to database...');
    await database.connect();
    const db = database.getDb();
    const collection = db.collection('problems');

    console.log('Fetching all problems...');
    // We only need a few fields to optimize memory
    const problems = await collection.find({}, {
      projection: {
        title: 1,
        duration: 1,
        startTime: 1,
        severityLevel: 1,
        status: 1,
        'affectedEntities.entityId.type': 1,
        'affectedEntities.name': 1
      }
    }).toArray();

    console.log(`Analyzing ${problems.length} problems...`);

    const groups: Record<string, any> = {
      'INFRA_FLAPPING': { count: 0, avgDuration: 0, items: {} },
      'RESOURCE_CONTENTION': { count: 0, avgDuration: 0, items: {} },
      'APP_TOLERANCE_SENSITIVITY': { count: 0, avgDuration: 0, items: {} },
      'MAINTENANCE_WINDOW': { count: 0, avgDuration: 0, items: {} },
      'OTHER': { count: 0, avgDuration: 0, items: {} }
    };

    let totalDuration = 0;

    for (const p of problems) {
      const title = p.title || 'Unknown';
      const duration = p.duration || 0;
      const severity = p.severityLevel || 'UNKNOWN';
      
      const startTimeStr = p.startTime || '';
      let isMaintenance = false;
      if (startTimeStr) {
        const date = new Date(startTimeStr);
        const hourUTC = date.getUTCHours();
        // Maintenance 02:00-05:00 America/Lima (UTC-5), which is 07:00-10:00 UTC
        if (hourUTC >= 7 && hourUTC < 10) {
          isMaintenance = true;
        }
      }

      const tLower = title.toLowerCase();

      let category = 'OTHER';

      if (isMaintenance && duration < 60) {
        category = 'MAINTENANCE_WINDOW';
      } else if (
        tLower.includes('restart') || 
        tLower.includes('eviction') || 
        tLower.includes('not ready') || 
        tLower.includes('unavailable') || 
        tLower.includes('shutdown') || 
        tLower.includes('node condition') ||
        tLower.includes('pod')
      ) {
        category = 'INFRA_FLAPPING';
      } else if (
        tLower.includes('cpu') || 
        tLower.includes('memory') || 
        tLower.includes('storage') || 
        tLower.includes('exhausted') || 
        tLower.includes('saturation') ||
        tLower.includes('close to limits') ||
        severity === 'RESOURCE_CONTENTION'
      ) {
        category = 'RESOURCE_CONTENTION';
      } else if (
        tLower.includes('failure rate') || 
        tLower.includes('response time') || 
        tLower.includes('javascript error') || 
        tLower.includes('aumento') || 
        tLower.includes('degradación') ||
        tLower.includes('failure increase') ||
        tLower.includes('unavailability') ||
        severity === 'PERFORMANCE'
      ) {
        category = 'APP_TOLERANCE_SENSITIVITY';
      }

      const grp = groups[category];
      grp.count++;
      grp.avgDuration += duration;
      
      if (!grp.items[title]) {
        grp.items[title] = { count: 0, avgDuration: 0, shortDurationCount: 0 };
      }
      grp.items[title].count++;
      grp.items[title].avgDuration += duration;
      if (duration < 15) {
        grp.items[title].shortDurationCount++;
      }
    }

    // Finalize averages and sort
    for (const key of Object.keys(groups)) {
      const grp = groups[key];
      if (grp.count > 0) {
        grp.avgDuration = grp.avgDuration / grp.count;
      }
      
      const sortedItems = Object.entries(grp.items)
        .map(([title, data]: [string, any]) => {
          data.avgDuration = data.avgDuration / data.count;
          return { title, ...data };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Top 20 per group
        
      grp.items = sortedItems;
    }

    fs.writeFileSync('deep_analysis_results.json', JSON.stringify(groups, null, 2));
    console.log('Deep analysis complete. Results saved to deep_analysis_results.json');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

run();
