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

    let csvContent = "DisplayID,Title,StartTime,EndTime,DurationMinutes,Severity,Status,FilteredByPilot(Duration<15m)\n";
    let groupBCount = 0;

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
      }

      if (category === 'INFRA_FLAPPING') {
        groupBCount++;
        // Safe CSV escaping
        const escapedTitle = `"${title.replace(/"/g, '""')}"`;
        const filtered = duration < 15 ? "YES (NOISE)" : "NO (PAGER)";
        const startTime = p.startTime ? new Date(p.startTime).toISOString() : '';
        const endTime = p.endTime ? new Date(p.endTime).toISOString() : '';
        
        csvContent += `${p.displayId || ''},${escapedTitle},${startTime},${endTime},${duration},${severity},${p.status || ''},${filtered}\n`;
      }
    }

    const outputPath = 'piloto_grupo_b_muestra.csv';
    fs.writeFileSync(outputPath, csvContent);
    console.log(`Exported ${groupBCount} Group B problems to ${outputPath}`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

run();
