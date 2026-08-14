const fs = require('fs');
let content = fs.readFileSync('components/LandingPage.tsx', 'utf8');

content = content.replace("import { Grade } from '../types';\n", "export type Grade = '8°' | '9°' | '10°' | '11°';\n");

fs.writeFileSync('components/LandingPage.tsx', content);
