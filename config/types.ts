// src/config/types.ts
export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  isOfflineReady?: boolean;
  track?: UserRole;
}

export enum StudyMode {
  REPASO = 'repaso',
  TALLER = 'taller',
  SIMULACRO = 'simulacro',
  NONE = 'none'
}

export type AppView = 'LANDING' | 'CAMPUS' | 'SUBJECT_DASHBOARD' | 'CLASSROOM' | 'TEACHER_PORTAL' | 'CONSTRUCTOR_LAB' | 'REWARDS';

export type UserRole = 'student' | 'teacher' | 'builder' | 'admin';

export interface BuilderProfile {
  name: string;
  focusArea: string;
  level: number;
  projectsCompleted: number;
}

export interface BuilderProject {
  id: string;
  title: string;
  description: string;
  status: 'IDEA' | 'IN_PROGRESS' | 'COMPLETED';
  techStack: string[];
  impactMetric: string;
  offlineCapable?: boolean;
  linkedSubjectId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface NotebookTool {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface SubjectModule {
  id: string;
  title: string;
  description: string;
  dbaCode: string;
}

export interface CourseMaterial {
  id: string;
  grade: string;
  subject: string;
  topic: string;
  textContent: string;
  hasAudio: boolean;
  timestamp: number;
  moduleId?: string;
  toolId?: string;
  resourceUrl?: string;
  dbaCode: string;
}

export interface StudentProfile {
  name: string;
  grade: string;
  location: string;
  level: number;
  points?: number;
  streak?: number;
  currentLevel?: Record<string, string>;
  progress?: {
    completedModules: string[];
    quizScores: Record<string, number>;
  };
}

export type UserZPDLevel = 'basic' | 'intermediate' | 'advanced';

export interface UserZPD {
  level: UserZPDLevel;
  consecutiveSuccesses: number;
  consecutiveFailures: number;
}

export interface GamificationState {
  points: number;
  streak: number;
  badges: string[];
  lastActive: number;
}

export interface RegionConfig {
  id: string;
  name: string;
  keywords: string[];
  contextExample: string;
}

export interface SyncQueueItem {
  id: string;
  type: 'message' | 'progress' | 'profile' | 'project';
  payload: any;
  timestamp: number;
  retryCount: number;
}

export interface SimulationState {
  isActive: boolean;
  currentQuestion: number;
  totalQuestions: number;
  score?: number;
}