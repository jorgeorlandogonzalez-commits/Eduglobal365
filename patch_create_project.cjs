const fs = require('fs');
let content = fs.readFileSync('components/ConstructorLab.tsx', 'utf8');

content = content.replace(/FirestoreService\.saveBuilderProject/g, 'StorageService.saveBuilderProject');

fs.writeFileSync('components/ConstructorLab.tsx', content);
