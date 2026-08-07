const fs = require('fs');
let code = fs.readFileSync('components/ChatBubble.tsx', 'utf8');

// Remove the one I added:
const rxAdded = /\n\s*const hasArchitectureTip = mainContent\.includes\('\[ARCHITECTURE_TIP\]'\);\n\s*mainContent = mainContent\.replace\(\/\\\[ARCHITECTURE_TIP\\\]\/gi, ''\)\.trim\(\);/;
code = code.replace(rxAdded, '');

fs.writeFileSync('components/ChatBubble.tsx', code);
console.log("Success");
