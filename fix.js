import fs from 'fs';

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  content = content.replace(/crypto\.randomUUID\(\)/g, 'generateUUID()');
  fs.writeFileSync(filePath, content);
}

fixFile('src/App.tsx');
fixFile('src/components/TeacherPortal.tsx');
console.log('Fixed');
