const fs = require('fs');

let config = fs.readFileSync('vite.config.ts', 'utf8');
if (!config.includes('empty-config.json')) {
  config = config.replace(
    /alias: \{/,
    "alias: {\n          '../firebase-applet-config.json': fs.existsSync(path.resolve(__dirname, 'firebase-applet-config.json')) ? path.resolve(__dirname, 'firebase-applet-config.json') : path.resolve(__dirname, 'empty-config.json'),"
  );
  config = "import fs from 'fs';\n" + config;
  fs.writeFileSync('vite.config.ts', config);
}
