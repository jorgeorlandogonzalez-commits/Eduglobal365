const fs = require('fs');
let code = fs.readFileSync('components/CampusMap.tsx', 'utf8');

code = code.replace(
  /<span>¿Necesitas hablar o desahogarte\?<\/span>/,
  '<span>Hola, ¿como estas?. Edu esta aca para escucharte y ayudarte en lo q necesites</span>'
);

fs.writeFileSync('components/CampusMap.tsx', code);
console.log("Done");
