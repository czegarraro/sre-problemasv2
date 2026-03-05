import * as fs from 'fs';
import * as path from 'path';

const dataPath = path.join(__dirname, 'problem_dump.json');
const fd = fs.openSync(dataPath, 'r');
const buffer = Buffer.alloc(5000);
fs.readSync(fd, buffer, 0, 5000, 0);
console.log('--- START 5000 ---');
console.log(buffer.toString('utf8'));
console.log('--- END 5000 ---');
fs.closeSync(fd);
