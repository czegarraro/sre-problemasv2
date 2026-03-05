import * as fs from 'fs';
import * as path from 'path';

const dataPath = path.join(__dirname, 'problem_dump.json');
const fileContent = fs.readFileSync(dataPath, 'utf8');

// Buscar la primera vez que termina un objeto y empieza otro
const match = fileContent.match(/\}\n\{/);
if (match) {
    console.log('Found junction }\\n{ at index:', match.index);
    console.log('Context:', fileContent.substring(match.index! - 20, match.index! + 20));
} else {
    // Probar con \r\n
    const match2 = fileContent.match(/\}\r\n\{/);
    if (match2) {
        console.log('Found junction }\\r\\n{ at index:', match2.index);
        console.log('Context:', fileContent.substring(match2.index! - 20, match2.index! + 20));
    } else {
        console.log('No junction found using }\\n{ or }\\r\\n{');
        // Mostrar los últimos 100 caracteres por si acaso
        console.log('End of file:', fileContent.substring(fileContent.length - 100));
    }
}
