import * as fs from 'fs';
import * as path from 'path';

const dataPath = path.join(__dirname, 'problem_dump.json');
const fd = fs.openSync(dataPath, 'r');
const buffer = Buffer.alloc(1000);
fs.readSync(fd, buffer, 0, 1000, 0);
console.log('--- START ---');
console.log(buffer.toString('utf8'));
console.log('--- END ---');
fs.closeSync(fd);
