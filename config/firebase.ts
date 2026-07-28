import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const isFirebaseConfigured = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "";

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const auth = isFirebaseConfigured ? getAuth(app) : null;
export const db = isFirebaseConfigured ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId) : null;

// Activar persistencia offline (PWA)
if (db) {
  enableIndexedDbPersistence(db as any).catch((err) => {
    if (err.code == 'failed-precondition') {
      console.warn('Persistencia falló: Múltiples pestañas abiertas.');
    } else if (err.code == 'unimplemented') {
      console.warn('El navegador no soporta persistencia offline.');
    }
  });
}
