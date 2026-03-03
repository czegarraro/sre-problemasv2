import * as fs from 'fs';
import * as path from 'path';

const dataPath = path.join(__dirname, 'problem_dump.json');
const fileContent = fs.readFileSync(dataPath, 'utf8');

try {
    const data = JSON.parse(fileContent);
    console.log('Root Type:', Array.isArray(data) ? 'Array' : typeof data);
    
    if (Array.isArray(data)) {
        console.log('Array length:', data.length);
        if (data.length > 0) {
            console.log('Keys of first element:', Object.keys(data[0]));
        }
    } else {
        console.log('Root keys:', Object.keys(data));
        for (const key of Object.keys(data)) {
            if (Array.isArray(data[key])) {
                console.log(`Array at key "${key}", length:`, data[key].length);
            }
        }
    }
} catch (e: any) {
    console.log('JSON.parse failed as expected for concatenated objects or invalid JSON.');
    console.log('Error:', e.message);
    
    // Fallback: try to split by }\n{ or just count occurrences
    const occurrences = (fileContent.match(/\"problemId\"/g) || []).length;
    console.log('Occurrences of "problemId":', occurrences);
    
    // Try to find the first few and last few chars of the file
    console.log('Start of file:', fileContent.substring(0, 100));
    console.log('End of file:', fileContent.substring(fileContent.length - 100));
}
