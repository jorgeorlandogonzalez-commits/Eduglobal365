const fs = require('fs');
let content = fs.readFileSync('config/firebase.ts', 'utf8');

// Replace imports
content = content.replace(
  "  enableIndexedDbPersistence,", 
  "  initializeFirestore,\n  persistentLocalCache,\n  persistentMultipleTabManager,"
);

// Replace db init
const oldDbInit = 'export const db: Firestore | null = isFirebaseConfigured ? getFirestore(app as FirebaseApp, config.firestoreDatabaseId) : null;';
const newDbInit = `export const db: Firestore | null = isFirebaseConfigured ? initializeFirestore(app as FirebaseApp, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
}, config.firestoreDatabaseId) : null;`;
content = content.replace(oldDbInit, newDbInit);

// Replace enableFirestoreOffline
const oldOffline = `export const enableFirestoreOffline = async (): Promise<boolean> => {
  if (!db) return false;
  try {
    await enableIndexedDbPersistence(db);
    console.log("✅ Firestore offline persistence habilitado");
    return true;
  } catch (err: any) {
    if (err.code === 'failed-precondition') {
      console.warn('⚠️ Firestore persistence: Múltiples pestañas abiertas. Solo una puede tener persistencia.');
    } else if (err.code === 'unimplemented') {
      console.warn('⚠️ Firestore persistence: Navegador no soporta IndexedDB.');
    }
    return false;
  }
};`;

const newOffline = `export const enableFirestoreOffline = async (): Promise<boolean> => {
  if (!db) return false;
  // Offline persistence is now enabled at initialization via persistentLocalCache
  console.log("✅ Firestore offline persistence habilitado (vía persistentLocalCache)");
  return true;
};`;

content = content.replace(oldOffline, newOffline);

fs.writeFileSync('config/firebase.ts', content);
