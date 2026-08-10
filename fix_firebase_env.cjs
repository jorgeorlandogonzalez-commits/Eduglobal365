const fs = require('fs');
let code = fs.readFileSync('config/firebase.ts', 'utf8');

const replacement = `
// ============================================================================
// 🔥 INICIALIZACIÓN FIREBASE
// ============================================================================

// Soporte para variables de entorno (VITE_FIREBASE_*) o fallback al JSON
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || firebaseConfig.firestoreDatabaseId || "(default)"
};

const isFirebaseConfigured = config && config.apiKey && config.apiKey !== "";
const app: FirebaseApp | null = isFirebaseConfigured ? initializeApp(config) : null;

// Initialize Firebase services
export const auth: Auth | null = isFirebaseConfigured ? getAuth(app as FirebaseApp) : null;
export const db: Firestore | null = isFirebaseConfigured ? getFirestore(app as FirebaseApp, config.firestoreDatabaseId) : null;
`;

code = code.replace(/\/\/ ============================================================================\n\/\/ 🔥 INICIALIZACIÓN FIREBASE\n\/\/ ============================================================================\n[\s\S]*?\/\/ Initialize Firebase services\nexport const auth: Auth \| null = isFirebaseConfigured \? getAuth\(app as FirebaseApp\) : null;\nexport const db: Firestore \| null = isFirebaseConfigured \? getFirestore\(app as FirebaseApp, firebaseConfig\.firestoreDatabaseId\) : null;/m, replacement);

fs.writeFileSync('config/firebase.ts', code);
console.log("Done");
