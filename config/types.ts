// src/config/types.ts

export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: number;  // ✅ CORREGIDO: number en lugar de Date (portable para localStorage)
  isOfflineReady?: boolean;
  track?: UserRole;   // ✅ AGREGADO: Para Dual-Track isolation (student/builder)
}

export enum StudyMode {
  REPASO = 'repaso',
  TALLER = 'taller',
  SIMULACRO = 'simulacro',
  NONE = 'none'
}

export type AppView = 'LANDING' | 'CAMPUS' | 'SUBJECT_DASHBOARD' | 'CLASSROOM' | 'TEACHER_PORTAL' | 'CONSTRUCTOR_LAB' | 'REWARDS';

// ✅ CORREGIDO: lowercase + 'admin' agregado (alineado con ARQUITECTURA_v3.0.md)
export type UserRole = 'student' | 'teacher' | 'builder' | 'admin';

export interface BuilderProfile {
  name: string;
  focusArea: string; // e.g., "Desarrollo Web", "Impacto Social"
  level: number;
  projectsCompleted: number;
}

export interface BuilderProject {
  id: string;
  title: string;
  description: string;
  status: 'IDEA' | 'IN_PROGRESS' | 'COMPLETED';
  techStack: string[];
  impactMetric: string; // MVP: texto libre
  offlineCapable?: boolean; // ✅ Compatible con modo offline
  // impactMetrics?: { usersReached?: number; offlinePerformance?: string; communityImpact?: string; }; // 🔄 Fase 2
  linkedSubjectId?: string; // For Cross-Track Synergy
  createdAt: number;
  updatedAt: number;
}

export interface NotebookTool {
  id: string;
  label: string;
  icon: string;
  color: string;
}

// ✅ CORREGIDO: Agregado dbaCode (CRÍTICO para alineación MEN)
export interface SubjectModule {
  id: string;
  title: string;
  description: string;
  dbaCode: string;  // 🆕 AGREGADO: Alineación con Derechos Básicos de Aprendizaje del MEN
}

export interface CourseMaterial {
  id: string;
  grade: string;
  subject: string;
  topic: string; // We'll keep this as a fallback or module title
  textContent: string; // We'll keep this for text content
  hasAudio: boolean; // We'll keep this for backward compatibility
  timestamp: number;
  moduleId?: string;
  toolId?: string;
  resourceUrl?: string;
  dbaCode: string;  // ✅ AGREGADO: CRÍTICO - Alineación con Derechos Básicos de Aprendizaje del MEN
}

export interface StudentProfile {
  name: string;
  grade: string;
  location: string; // e.g., "Necoclí, Urabá"
  level: number; // For "Mentores de Vereda" progression
  points?: number; // Gamification points
  streak?: number; // Gamification daily streak
  currentLevel?: Record<string, string>; // e.g. { "Matemáticas": "Intermedio", "Inglés": "Básico" }
  progress?: {
    completedModules: string[];
    quizScores: Record<string, number>;
  };
}

export interface SimulationState {
  isActive: boolean;
  currentQuestion: number;
  totalQuestions: number;
  score?: number;
}