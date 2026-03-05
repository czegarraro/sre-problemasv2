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

    const problems = await collection.find({}, {
      projection: {
        displayId: 1,
        title: 1,
        duration: 1,
        startTime: 1,
        endTime: 1,
        severityLevel: 1,
        status: 1
      }
    }).toArray();

    let csvContent = "DisplayID,Title,StartTime,EndTime,DurationMinutes,Severity,Status,FilteredByPilot(Duration<10m)\n";
    let groupACount = 0;

    for (const p of problems) {
      const title = p.title || 'Unknown';
      const duration = p.duration || 0;
      const severity = p.severityLevel || 'UNKNOWN';
      
      const startTimeStr = p.startTime || '';
      let isMaintenance = false;
      if (startTimeStr) {
        const date = new Date(startTimeStr);
        const hourUTC = date.getUTCHours();
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
        tLower.includes('Failure rate') || 
        tLower.includes('Response time') || 
        tLower.includes('JavaScript error') || 
        tLower.includes('Aumento') || 
        tLower.includes('Degradación') ||
        tLower.includes('Failure increase') ||
        tLower.includes('Unavailability') ||
        severity === 'PERFORMANCE'
      ) {
        category = 'APP_TOLERANCE_SENSITIVITY';
      }

      if (category === 'APP_TOLERANCE_SENSITIVITY') {
        groupACount++;
        // Safe CSV escaping
        const escapedTitle = `"${title.replace(/"/g, '""')}"`;
        // Proposed Pilot: Requires anomaly to be present for X mins before alerting. 
        // For services, the goal is often finding brief blips that auto-recover before pagering.
        const filtered = duration < 10 ? "YES (NOISE)" : "NO (STAYS AS PROBLEM)";
        const startTime = p.startTime ? new Date(p.startTime).toISOString() : '';
        const endTime = p.endTime ? new Date(p.endTime).toISOString() : '';
        
        csvContent += `${p.displayId || ''},${escapedTitle},${startTime},${endTime},${duration},${severity},${p.status || ''},${filtered}\n`;
      }
    }

    const outputPath = 'piloto_grupo_a_muestra.csv';
    fs.writeFileSync(outputPath, csvContent);
    console.log(`Exported ${groupACount} Group A problems to ${outputPath}`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

run();
