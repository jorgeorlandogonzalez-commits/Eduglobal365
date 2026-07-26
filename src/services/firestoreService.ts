import { collection, doc, setDoc, getDocs, getDoc, query, where, orderBy, deleteDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Message, AppView, CourseMaterial, BuilderProject, BuilderProfile, UserRole } from '../config/types';
import { DBA_SEED_CONTENT, isSeedMaterial } from '../config/dbaSeedContent';

const getUserId = () => auth.currentUser?.uid;

export const FirestoreService = {
  // --- STATE MANAGEMENT ---
  saveAppState: async (currentView: AppView, activeSubject: string | null, userRole: UserRole = 'student') => {
    const userId = getUserId();
    if (!userId) return;
    try {
      await setDoc(doc(db, 'users', userId, 'state', 'appState'), {
        currentView,
        activeSubject,
        userRole,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error("Error saving app state to Firestore:", error);
    }
  },

  loadAppState: async (): Promise<{ currentView: AppView, activeSubject: string | null, userRole?: UserRole } | null> => {
    const userId = getUserId();
    if (!userId) return null;
    try {
      const docSnap = await getDoc(doc(db, 'users', userId, 'state', 'appState'));
      if (docSnap.exists()) {
        return docSnap.data() as any;
      }
      return null;
    } catch (error) {
      console.error("Error loading app state from Firestore:", error);
      return null;
    }
  },

  // --- CHAT MANAGEMENT ---
  saveMessage: async (subject: string, message: Message, track?: UserRole) => {
    const userId = getUserId();
    if (!userId || !subject) return;
    try {
      const messageId = message.id || Date.now().toString();
      await setDoc(doc(db, 'users', userId, 'messages', messageId), {
        ...message,
        subject,
        track: track || message.track || null,
        syncTimestamp: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error saving message for ${subject}:`, error);
    }
  },

  loadSubjectChat: async (subject: string | null, track?: UserRole): Promise<Message[]> => {
    const userId = getUserId();
    if (!userId || !subject) return [];
    try {
      const q = query(
        collection(db, 'users', userId, 'messages'),
        where('subject', '==', subject),
        orderBy('timestamp', 'asc')
      );
      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map(doc => doc.data() as Message);
      return track ? messages.filter(m => !m.track || m.track === track) : messages;
    } catch (error) {
      console.error(`Error loading chat for ${subject}:`, error);
      return [];
    }
  },

  // --- TEACHER PORTAL (MATERIALS) ---
  saveCourseMaterial: async (material: CourseMaterial) => {
    try {
      const materialId = material.id || Date.now().toString();
      await setDoc(doc(db, 'materials', materialId), {
        ...material,
        id: materialId,
        authorId: getUserId() || 'anonymous',
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Error saving course material:", error);
      return false;
    }
  },

  getCourseMaterials: async (subject?: string, grade?: string): Promise<CourseMaterial[]> => {
    try {
      const materialsRef = collection(db, 'materials');
      let q = query(materialsRef);
      if (grade) {
        q = query(materialsRef, where('grade', '==', grade));
      }
      const snapshot = await getDocs(q);
      const dbMaterials = snapshot.docs.map(doc => doc.data() as CourseMaterial);
      
      const combined = [...dbMaterials];
      DBA_SEED_CONTENT.forEach(seed => {
        if (grade && seed.grade !== grade) return;
        const exists = combined.some(m => m.dbaCode === seed.dbaCode);
        if (!exists) {
          combined.push(seed);
        }
      });
      
      if (subject) {
        const normSubject = subject.toLowerCase().trim();
        return combined.filter(m => {
          const mSubject = m.subject.toLowerCase().trim();
          return mSubject === normSubject || mSubject.includes(normSubject) || normSubject.includes(mSubject);
        });
      }
      return combined;
    } catch (error) {
      console.error("Error loading course materials:", error);
      return DBA_SEED_CONTENT;
    }
  },

  deleteCourseMaterial: async (id: string) => {
    try {
      await deleteDoc(doc(db, 'materials', id));
      return true;
    } catch (error) {
      console.error("Error deleting course material:", error);
      return false;
    }
  },

  // --- BUILDER TRACK MANAGEMENT ---
  saveBuilderProject: async (project: BuilderProject) => {
    const userId = getUserId();
    if (!userId) return false;
    try {
      const projectId = project.id || Date.now().toString();
      await setDoc(doc(db, 'users', userId, 'projects', projectId), {
        ...project,
        id: projectId,
        authorId: userId,
        updatedAt: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (error) {
      console.error("Error saving builder project:", error);
      return false;
    }
  },

  getBuilderProjects: async (): Promise<BuilderProject[]> => {
    const userId = getUserId();
    if (!userId) return [];
    try {
      const snapshot = await getDocs(collection(db, 'users', userId, 'projects'));
      return snapshot.docs.map(doc => doc.data() as BuilderProject);
    } catch (error) {
      console.error("Error loading builder projects:", error);
      return [];
    }
  },

  getBuilderProjectsBySubject: async (subjectId: string): Promise<BuilderProject[]> => {
    const userId = getUserId();
    if (!userId) return [];
    try {
      const q = query(collection(db, 'users', userId, 'projects'), where('linkedSubjectId', '==', subjectId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as BuilderProject);
    } catch (error) {
      console.error("Error loading builder projects by subject:", error);
      return [];
    }
  },

  saveBuilderProfile: async (profile: BuilderProfile) => {
    const userId = getUserId();
    if (!userId) return false;
    try {
      await setDoc(doc(db, 'users', userId, 'profile', 'builder'), profile, { merge: true });
      return true;
    } catch (error) {
      console.error("Error saving builder profile:", error);
      return false;
    }
  },

  loadBuilderProfile: async (): Promise<BuilderProfile | null> => {
    const userId = getUserId();
    if (!userId) return null;
    try {
      const docSnap = await getDoc(doc(db, 'users', userId, 'profile', 'builder'));
      if (docSnap.exists()) {
        return docSnap.data() as BuilderProfile;
      }
      return null;
    } catch (error) {
      console.error("Error loading builder profile:", error);
      return null;
    }
  }
};
