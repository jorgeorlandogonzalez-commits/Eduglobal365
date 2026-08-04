const fs = require('fs');
let content = fs.readFileSync('services/downloadService.ts', 'utf8');

content = content.replace(
  /const regionalExamples = regionConfig\?\.examples \? regionConfig\.examples\.slice\(0, 5\) : \[\];/g,
  `const regionalExamples = regionConfig?.contextExample ? [regionConfig.contextExample] : [];`
);

fs.writeFileSync('services/downloadService.ts', content);
