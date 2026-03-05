import * as fs from 'fs';
import * as path from 'path';

const samplePath = path.join(__dirname, 'problem_sample.json');
try {
  let content = fs.readFileSync(samplePath);
  // Intentar decodificar como utf16le 
  let str = content.toString('utf16le');
  
  if (str.charCodeAt(0) === 0xFEFF) {
      str = str.slice(1);
  }
  
  const sample = JSON.parse(str);
  console.log('Sample format:', Array.isArray(sample) ? 'Array of ' + sample.length : typeof sample);
  if (Array.isArray(sample) && sample.length > 0) {
      console.log('Keys of first problem:', Object.keys(sample[0]));
  } else if (!Array.isArray(sample)) {
      console.log('Keys:', Object.keys(sample));
  }
} catch (e: any) {
  console.error('Error reading problem_sample.json:', e.message);
  
  // Ahora revisar problem_dump.json que parece ser UTF-16 también porque grep no funcionó bien
  const dumpPath = path.join(__dirname, 'problem_dump.json');
  try {
      const dumpContent = fs.readFileSync(dumpPath);    
      let dumpStr = dumpContent.toString('utf16le');
      if (dumpStr.charCodeAt(0) === 0xFEFF) dumpStr = dumpStr.slice(1);
      
      console.log('Dump start:', dumpStr.substring(0, 100));
      
      let parsed = JSON.parse(dumpStr);
      console.log('Dump format (UTF-16LE):', Array.isArray(parsed) ? 'Array of ' + parsed.length : typeof parsed);
  } catch (err: any) {
       console.error('Error with dump UTF-16:', err.message);
  }
}
