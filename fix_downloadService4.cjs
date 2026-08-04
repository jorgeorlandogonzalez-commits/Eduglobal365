const fs = require('fs');
let content = fs.readFileSync('services/downloadService.ts', 'utf8');

content = content.replace('import { COLOMBIA_REGIONS } from "../config/regions";', 'import { REGIONS, getRegionContext } from "../config/regions";');

// In generateJSONBackup:
content = content.replace(/const regionId = studentProfile\?\.region \|\| 'bogota';\s*const regionConfig = COLOMBIA_REGIONS\[regionId\] \|\| COLOMBIA_REGIONS\['bogota'\];/g, `const regionId = studentProfile?.region || 'urbano';
      const regionConfig = getRegionContext(regionId) || REGIONS.find(r => r.id === 'urbano');`);

// In generatePlainTextGuide:
content = content.replace(/const region = profile\?\.region \? COLOMBIA_REGIONS\[profile\.region\]\?\.name : 'Colombia';/g, `const regionConfig = profile?.region ? getRegionContext(profile.region) : null;
    const region = regionConfig?.name || 'Colombia';`);

fs.writeFileSync('services/downloadService.ts', content);
