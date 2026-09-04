const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const originalImport = "import admin from 'firebase-admin';";
const modularImports = `import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const admin = {
  get apps() { return getApps(); },
  initializeApp: (opts: any) => initializeApp(opts),
  credential: { cert },
  firestore: (opts?: any) => opts && opts.databaseId ? getFirestore(undefined, opts.databaseId) : getFirestore()
};`;

content = content.replace(originalImport, modularImports);
fs.writeFileSync('server.ts', content);
