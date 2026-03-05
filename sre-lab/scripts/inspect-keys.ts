import * as fs from 'fs';
import * as path from 'path';

const dataPath = path.join(__dirname, 'problem_dump.json');
const fileContent = fs.readFileSync(dataPath, 'utf8');

try {
    const data = JSON.parse(fileContent);
    console.log('Keys of the root object:', Object.keys(data));
    if (Array.isArray(data)) {
        console.log('Root is an array of size:', data.length);
    } else {
        for (const key of Object.keys(data)) {
            if (Array.isArray(data[key])) {
                console.log(`Key "${key}" is an array of size:`, data[key].length);
            }
        }
    }
} catch (e: any) {
    console.error('JSON.parse failed:', e.message);
    // Mostrar donde falló si es posible
    if (e.message.includes('at position')) {
        const pos = parseInt(e.message.match(/position (\d+)/)[1]);
        console.log('Context at position:', fileContent.substring(pos - 50, pos + 50));
    }
}
