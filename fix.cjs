const fs = require('fs');
let code = fs.readFileSync('services/geminiService.ts', 'utf8');
code = code.replace(/throw new Error\(\\\`HTTP error! status: \\\${response.status}\\\`\);/g, 'throw new Error(`HTTP error! status: ${response.status}`);');
code = code.replace(/\\\`/g, '`');
code = code.replace(/\\\$/g, '$');
fs.writeFileSync('services/geminiService.ts', code);
