const fs = require('fs');
let content = fs.readFileSync('components/LandingPage.tsx', 'utf8');

// Remove the import
content = content.replace("import { PRICING } from '../config/constants';\n", '');

// Add the constant inside the component
content = content.replace(
  'const [hasAdultConsent, setHasAdultConsent] = useState(false);',
  `const [hasAdultConsent, setHasAdultConsent] = useState(false);\n  const PRICING = { monthly: 49900, annual: 499000 };`
);

fs.writeFileSync('components/LandingPage.tsx', content);
