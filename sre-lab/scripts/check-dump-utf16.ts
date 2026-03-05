import * as fs from 'fs';
import * as path from 'path';

const dumpPath = path.join(__dirname, 'problem_dump.json');
try {
  let content = fs.readFileSync(dumpPath);
  let str = content.toString('utf16le');
  
  if (str.charCodeAt(0) === 0xFEFF) {
      str = str.slice(1);
  }
  
  console.log('Dump string length:', str.length);
  console.log('Start of string:', JSON.stringify(str.substring(0, 100)));
  
  // Try counting 'problemId' again now that it's decoded
  const occurrences = (str.match(/\"problemId\"/g) || []).length;
  console.log('Occurrences of "problemId" in UTF-16 decoded string:', occurrences);
  
  // Try split by \n
  const lines = str.split('\n').filter(l => l.trim().length > 0);
  console.log('Number of lines:', lines.length);
  if (lines.length > 5) {
      console.log('Looks like JSONL. Lines 0-2:');
      console.log(lines.slice(0, 3));
  }
} catch (e: any) {
  console.error('Error:', e.message);
}
