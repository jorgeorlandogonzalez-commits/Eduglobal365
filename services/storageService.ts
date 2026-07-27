import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Message, StudentProfile, BuilderProject, BuilderProfile, AppView, UserRole, SyncQueueItem, CourseMaterial } from '../config/types';

interface EduGlobalDB extends DBSchema {
  appState: {
    key: string;
    value: { currentView: AppView; activeSubject: string | null; userRole: UserRole };
  };
  messages: {
    key: string;
    value: { id: string; subject: string; role: UserRole; messages: Message[] };
    indexes: { 'by-subject-role': string };
  };
  materials: {
    key: string;
    value: CourseMaterial;
    indexes: { 'by-subject': string };
  };
  syncQueue: {
    key: string;
    value: SyncQueueItem;
  };
  studentProfile: {
    key: string;
    value: StudentProfile;
  };
  builderProfile: {
    key: string;
    value: BuilderProfile;
  };
  builderProjects: {
    key: string;
    value: BuilderProject;
  };
}

const DB_NAME = 'eduglobal365-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<EduGlobalDB>> | null = null;

async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<EduGlobalDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('appState');
        
        const messagesStore = db.createObjectStore('messages', { keyPath: 'id' });
        messagesStore.createIndex('by-subject-role', 'subject'); // Simplification for indexing

        const materialsStore = db.createObjectStore('materials', { keyPath: 'id' });
        materialsStore.createIndex('by-subject', 'subject');

        db.createObjectStore('syncQueue', { keyPath: 'id' });
        db.createObjectStore('studentProfile');
        db.createObjectStore('builderProfile');
        db.createObjectStore('builderProjects', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}

export const StorageService = {
  // App State
  async saveAppState(currentView: AppView, activeSubject: string | null, userRole: UserRole): Promise<void> {
    const db = await getDB();
    await db.put('appState', { currentView, activeSubject, userRole }, 'currentState');
  },

  async loadAppState(): Promise<{ currentView: AppView; activeSubject: string | null; userRole: UserRole } | null> {
    const db = await getDB();
    const state = await db.get('appState', 'currentState');
    return state || null;
  },

  // Messages
  async saveSubjectChat(subject: string | null, messages: Message[], role: UserRole): Promise<void> {
    if (!subject) return;
    const db = await getDB();
    const id = `\${role}_\${subject}`;
    await db.put('messages', { id, subject, role, messages });
  },

  async loadSubjectChat(subject: string | null, role: UserRole): Promise<Message[]> {
    if (!subject) return [];
    const db = await getDB();
    const id = `\${role}_\${subject}`;
    const data = await db.get('messages', id);
    return data ? data.messages : [];
  },

  async clearChat(subject: string | null, role: UserRole): Promise<void> {
    if (!subject) return;
    const db = await getDB();
    const id = `\${role}_\${subject}`;
    await db.delete('messages', id);
  },

  // Student Profile
  async saveStudentProfile(profile: StudentProfile): Promise<void> {
    const db = await getDB();
    await db.put('studentProfile', profile, 'currentProfile');
  },

  async getStudentProfile(): Promise<StudentProfile | null> {
    const db = await getDB();
    return await db.get('studentProfile', 'currentProfile') || null;
  },

  // Builder Profile
  async saveBuilderProfile(profile: BuilderProfile): Promise<void> {
    const db = await getDB();
    await db.put('builderProfile', profile, 'currentBuilder');
  },

  async loadBuilderProfile(): Promise<BuilderProfile | null> {
    const db = await getDB();
    return await db.get('builderProfile', 'currentBuilder') || null;
  },

  // Builder Projects
  async saveBuilderProject(project: BuilderProject): Promise<void> {
    const db = await getDB();
    await db.put('builderProjects', project);
  },

  async getBuilderProjects(): Promise<BuilderProject[]> {
    const db = await getDB();
    return await db.getAll('builderProjects');
  },

  async deleteBuilderProject(projectId: string): Promise<void> {
    const db = await getDB();
    await db.delete('builderProjects', projectId);
  },

  // Sync Queue
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'retryCount' | 'timestamp'>): Promise<void> {
    const db = await getDB();
    const fullItem: SyncQueueItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retryCount: 0
    };
    await db.put('syncQueue', fullItem);
  },

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const db = await getDB();
    return await db.getAll('syncQueue');
  },
  
  async removeFromSyncQueue(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('syncQueue', id);
  },

  async clearSyncQueue(): Promise<void> {
    const db = await getDB();
    await db.clear('syncQueue');
  }
};
