// src/config/firebase.ts
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  query,
  where,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  onSnapshot,
  writeBatch,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { StorageService } from '../services/storageService';
import { SyncQueueItem, StudentProfile, UserRole } from './types';


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
export const db: Firestore | null = isFirebaseConfigured ? initializeFirestore(app as FirebaseApp, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
}, config.firestoreDatabaseId) : null;


// ============================================================================
// 🆕 CONFIGURACIÓN OFFLINE-FIRST: Firestore como ESPEJO, no fuente de verdad
// ============================================================================

/**
 * Habilita persistencia offline de Firestore (cache local en el navegador).
 * Esto permite que Firestore funcione como "espejo" incluso sin internet.
 * 
 * ⚠️ IMPORTANTE: La fuente de verdad SIGUE siendo IndexedDB (StorageService).
 * Firestore solo se usa para:
 *   1. Backup en la nube
 *   2. Sincronización multi-dispositivo
 *   3. Autenticación
 */
export const enableFirestoreOffline = async (): Promise<boolean> => {
  if (!db) return false;
  // Offline persistence is now enabled at initialization via persistentLocalCache
  console.log("✅ Firestore offline persistence habilitado (vía persistentLocalCache)");
  return true;
};

// ============================================================================
// 🆕 AUTH SERVICE - Con manejo offline
// ============================================================================

export const FirebaseAuthService = {
  /**
   * Inicia sesión anónima (para estudiantes que no quieren/registrarse).
   * Funciona offline si ya se autenticó antes.
   */
  signInAnonymous: async (): Promise<FirebaseUser | null> => {
    if (!auth) return null;
    try {
      const result = await signInAnonymously(auth);
      console.log("✅ Auth anónima exitosa:", result.user.uid);
      return result.user;
    } catch (error: any) {
      console.warn("⚠️ No se pudo iniciar sesión anónima (puede estar deshabilitado en Firebase):", error.message);
      return null;
    }
  },

  /**
   * Inicia sesión con Google.
   */
  signInWithGoogle: async (): Promise<FirebaseUser | null> => {
    if (!auth) return null;
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log("✅ Auth con Google exitosa:", result.user.uid);
      return result.user;
    } catch (error) {
      console.error("❌ Error auth con Google:", error);
      return null;
    }
  },

  /**
   * Obtiene el usuario actual (sincrónicamente).
   */
  getCurrentUser: (): FirebaseUser | null => {
    if (!auth) return null;
    return auth.currentUser;
  },

  /**
   * Escucha cambios de autenticación.
   */
  onAuthChange: (callback: (user: FirebaseUser | null) => void) => {
    if (!auth) return () => {};
    return onAuthStateChanged(auth, callback);
  }
};

// ============================================================================
// 🆕 SYNC SERVICE - Sincronización IndexedDB ↔ Firestore
// ============================================================================

/**
 * Sincroniza la cola de cambios pendientes (SyncQueue) con Firestore.
 * Se ejecuta automáticamente cuando detecta conexión a internet.
 */
export const FirebaseSyncService = {
  /**
   * Procesa TODOS los items pendientes en la cola de sincronización.
   * Los sube a Firestore y los elimina de la cola local.
   */
  processSyncQueue: async (): Promise<{ success: number; failed: number }> => {
    if (!db) return { success: 0, failed: 0 };
    const queue = await StorageService.getSyncQueue();
    if (queue.length === 0) return { success: 0, failed: 0 };

    console.log(`🔄 Procesando ${queue.length} items de sincronización...`);
    let success = 0;
    let failed = 0;

    for (const item of queue) {
      try {
        await FirebaseSyncService.syncItem(item);
        await StorageService.removeFromSyncQueue(item.id);
        success++;
      } catch (error) {
        console.error(`❌ Error sincronizando item ${item.id}:`, error);
        failed++;
        // Si falla más de 3 veces, eliminar para no bloquear la cola
        if (item.retryCount >= 3) {
          await StorageService.removeFromSyncQueue(item.id);
        }
      }
    }

    console.log(`✅ Sincronización completada: ${success} éxitos, ${failed} fallos`);
    return { success, failed };
  },

  /**
   * Sincroniza un item individual a Firestore.
   */
  syncItem: async (item: SyncQueueItem): Promise<void> => {
    if (!db) throw new Error("Firebase no está configurado");
    const user = FirebaseAuthService.getCurrentUser();
    if (!user) throw new Error("No hay usuario autenticado");

    const userRef = doc(db, 'users', user.uid);
    const syncRef = doc(collection(db, 'users', user.uid, 'syncQueue'), item.id);

    switch (item.type) {
      case 'message':
        await setDoc(syncRef, {
          ...item.payload,
          syncedAt: Timestamp.now(),
          userId: user.uid
        });
        break;
      
      case 'progress':
        await setDoc(doc(db, 'users', user.uid, 'progress', item.payload.subject || 'general'), {
          ...item.payload,
          syncedAt: Timestamp.now(),
          userId: user.uid
        });
        break;

      case 'material':
        await setDoc(doc(collection(db, 'users', user.uid, 'materials'), item.payload.id || generateSyncId()), {
          ...item.payload,
          syncedAt: Timestamp.now(),
          userId: user.uid
        });
        break;

      default:
        throw new Error(`Tipo de sync no soportado: ${item.type}`);
    }
  },

  /**
   * Sube el perfil del estudiante a Firestore (backup en la nube).
   */
  syncStudentProfile: async (profile: StudentProfile): Promise<void> => {
    if (!db) return;
    const user = FirebaseAuthService.getCurrentUser();
    if (!user) {
      console.warn("⚠️ No hay usuario autenticado. Perfil guardado solo localmente.");
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        profile: {
          ...profile,
          lastSync: Timestamp.now()
        },
        userId: user.uid,
        updatedAt: Timestamp.now()
      }, { merge: true });
      console.log("✅ Perfil sincronizado en la nube");
    } catch (error) {
      console.error("❌ Error sincronizando perfil:", error);
      // Agregar a cola para reintentar después
      await StorageService.addToSyncQueue({
        type: 'progress',
        payload: { profile, timestamp: Date.now() }
      });
    }
  },

  /**
   * Descarga el perfil del estudiante desde Firestore (para multi-dispositivo).
   */
  fetchStudentProfile: async (): Promise<StudentProfile | null> => {
    if (!db) return null;
    const user = FirebaseAuthService.getCurrentUser();
    if (!user) return null;

    try {
      const userRef = doc(db, 'users', user.uid);
      const snapshot = await getDoc(userRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        return data.profile as StudentProfile;
      }
      return null;
    } catch (error) {
      console.error("❌ Error descargando perfil:", error);
      return null;
    }
  },

  /**
   * Sincronización masiva: sube TODO el progreso local a Firestore.
   * Útil para backup manual o antes de cerrar sesión.
   */
  fullBackup: async (): Promise<boolean> => {
    if (!db) return false;
    const user = FirebaseAuthService.getCurrentUser();
    if (!user) {
      console.warn("⚠️ Backup cancelado: no hay usuario autenticado");
      return false;
    }

    try {
      const batch = writeBatch(db);
      const userRef = doc(db, 'users', user.uid);

      // 1. Backup perfil
      const profile = await StorageService.getStudentProfile();
      if (profile) {
        batch.set(userRef, { profile, lastBackup: Timestamp.now() }, { merge: true });
      }

      // 2. Backup progreso de módulos
      const appState = await StorageService.loadAppState();
      if (appState?.activeSubject) {
        const chatHistory = await StorageService.loadSubjectChat(appState.activeSubject, appState.userRole);
        const progressRef = doc(db, 'users', user.uid, 'progress', appState.activeSubject);
        batch.set(progressRef, {
          messages: chatHistory.slice(-20), // Solo últimos 20 mensajes
          subject: appState.activeSubject,
          role: appState.userRole,
          backedUpAt: Timestamp.now()
        });
      }

      await batch.commit();
      console.log("✅ Backup completo exitoso");
      return true;
    } catch (error) {
      console.error("❌ Error en backup completo:", error);
      return false;
    }
  }
};

// ============================================================================
// 🆕 AUTO-SYNC: Escucha cambios de conectividad y sincroniza automáticamente
// ============================================================================

/**
 * Inicia el listener de conectividad.
 * Cuando vuelve el internet, procesa la cola de sincronización automáticamente.
 */
export const startAutoSync = (): void => {
  if (typeof window !== "undefined") {
    window.addEventListener('online', async () => {
      console.log("🌐 Conexión restaurada. Iniciando sincronización automática...");
      
      // Asegurar que hay un usuario autenticado
      if (FirebaseAuthService.getCurrentUser()) {
        await FirebaseSyncService.processSyncQueue();
        
        // Backup del perfil
        const profile = await StorageService.getStudentProfile();
        if (profile) {
          await FirebaseSyncService.syncStudentProfile(profile);
        }
      }
    });

    // Intentar auth anónima al cargar (para tener UID desde el inicio)
    // if (!FirebaseAuthService.getCurrentUser()) {
    //   FirebaseAuthService.signInAnonymous();
    // }
  }
};

// ============================================================================
// 🆕 REPORTING SERVICE - Métricas de impacto para B2G (MinEducación)
// ============================================================================

/**
 * Genera reportes de trazabilidad DBA para presentar ante el Ministerio.
 * Los datos se agregan desde Firestore (nube) para reportes institucionales.
 */
export const FirebaseReportingService = {
  /**
   * Obtiene métricas agregadas de un estudiante (para dashboard admin).
   */
  getStudentMetrics: async (userId: string) => {
    if (!db) return null;
    try {
      const progressRef = collection(db, 'users', userId, 'progress');
      const snapshot = await getDocs(progressRef);
      
      const metrics = {
        totalSubjects: 0,
        completedModules: [] as string[],
        averageScore: 0,
        totalInteractions: 0,
        lastActive: null as Date | null
      };

      let totalScore = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        metrics.totalSubjects++;
        if (data.score) totalScore += data.score;
        if (data.messages) metrics.totalInteractions += data.messages.length;
        if (data.backedUpAt) metrics.lastActive = data.backedUpAt.toDate();
      });

      metrics.averageScore = metrics.totalSubjects > 0 ? totalScore / metrics.totalSubjects : 0;
      return metrics;
    } catch (error) {
      console.error("Error obteniendo métricas:", error);
      return null;
    }
  },

  /**
   * Obtiene reporte de cobertura DBA (qué códigos se han trabajado).
   */
  getDBACoverageReport: async (userId: string): Promise<string[]> => {
    if (!db) return [];
    try {
      const materialsRef = collection(db, 'users', userId, 'materials');
      const snapshot = await getDocs(materialsRef);
      
      const dbaCodes = new Set<string>();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.dbaCode) dbaCodes.add(data.dbaCode);
      });
      
      return Array.from(dbaCodes);
    } catch (error) {
      console.error("Error obteniendo cobertura DBA:", error);
      return [];
    }
  }
};

// ============================================================================
// 🔧 UTILS
// ============================================================================

const generateSyncId = (): string => {
  return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// ============================================================================
// 🚀 INICIALIZACIÓN AUTOMÁTICA
// ============================================================================

// Habilitar persistencia offline de Firestore al cargar
enableFirestoreOffline();

// Exportar todo como objeto único para imports limpios
export const FirebaseService = {
  app,
  auth,
  db,
  authService: FirebaseAuthService,
  syncService: FirebaseSyncService,
  reportingService: FirebaseReportingService,
  startAutoSync,
  enableFirestoreOffline
};

// Top level aliases for App.tsx
export const signInSilently = FirebaseAuthService.signInAnonymous;
export const signInWithGoogle = FirebaseAuthService.signInWithGoogle;
export const observeAuth = FirebaseAuthService.onAuthChange;
export const logout = async () => {
  if (auth) {
    await signOut(auth);
  }
};

export default FirebaseService;
