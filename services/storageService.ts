// src/services/storageService.ts
import { Message, AppView, CourseMaterial, BuilderProject, BuilderProfile, UserRole } from "../config/types";
import { DBA_SEED_CONTENT, isSeedMaterial } from "../config/dbaSeedContent";

const KEYS = {
  APP_STATE: "eduglobal_app_state",
  COURSE_MATERIALS: "eduglobal_course_materials",
  BUILDER_PROJECTS: "eduglobal_builder_projects",
  BUILDER_PROFILE: "eduglobal_builder_profile",
  USER_ROLE: "eduglobal_user_role",
  // We no longer use a single CHAT_HISTORY key. 
  // We will generate keys dynamically: "eduglobal_chat_{SubjectName}"
};

interface PersistedState {
  currentView: AppView;
  activeSubject: string | null;
  userRole?: UserRole;
}

// ============================================================================
// 🔧 HELPERS INTERNOS
// ============================================================================

/**
 * Obtiene SOLO los materiales subidos por docentes (sin semillas).
 * Este helper es CRÍTICO para evitar que las semillas se guarden en localStorage.
 * Las semillas deben existir solo en memoria (inyectadas desde dbaSeedContent.ts).
 */
const getUserMaterialsOnly = (): CourseMaterial[] => {
  try {
    const stored = localStorage.getItem(KEYS.COURSE_MATERIALS);
    const materials: CourseMaterial[] = stored ? JSON.parse(stored) : [];
    // Filtrar semillas para no guardarlas en localStorage
    return materials.filter(m => !isSeedMaterial(m));
  } catch (error) {
    console.error("Error loading user materials:", error);
    return [];
  }
};

// ============================================================================
// 📦 STORAGE SERVICE
// ============================================================================

export const StorageService = {
  // --- STATE MANAGEMENT ---
  // ✅ CORREGIDO: Default 'student' en lowercase para alineación con types.ts
  saveAppState: (currentView: AppView, activeSubject: string | null, userRole: UserRole = 'student') => {
    try {
      const state: PersistedState = { currentView, activeSubject, userRole };
      localStorage.setItem(KEYS.APP_STATE, JSON.stringify(state));
    } catch (error) {
      console.error("Error saving app state:", error);
    }
  },

  loadAppState: (): PersistedState | null => {
    try {
      const stored = localStorage.getItem(KEYS.APP_STATE);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error loading app state:", error);
      return null;
    }
  },

  // --- SILO-BASED CHAT HISTORY MANAGEMENT ---
  
  // Helper to generate a safe key for each subject
  getSubjectKey: (subject: string) => `eduglobal_chat_${subject.replace(/\s+/g, '_')}`,

  // ✅ CORREGIDO: Agregado parámetro track opcional para Dual-Track isolation
  saveSubjectChat: (subject: string, messages: Message[], track?: UserRole) => {
    if (!subject) return;
    try {
      // Limit per subject to prevent quota issues
      const recentMessages = messages.slice(-50); 
      // Filtrar por track si se proporciona (Dual-Track isolation)
      const filteredMessages = track 
        ? recentMessages.filter(m => !m.track || m.track === track)
        : recentMessages;
      const key = StorageService.getSubjectKey(subject);
      localStorage.setItem(key, JSON.stringify(filteredMessages));
    } catch (error) {
      console.error(`Error saving chat for ${subject}:`, error);
    }
  },

  // ✅ CORREGIDO: Agregado parámetro track + timestamp como number (no Date)
  loadSubjectChat: (subject: string | null, track?: UserRole): Message[] => {
    if (!subject) return [];
    try {
      const key = StorageService.getSubjectKey(subject);
      const stored = localStorage.getItem(key);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      // ✅ CORREGIDO: timestamp ya es number, NO convertir a Date
      // Filtrar por track si se proporciona (Dual-Track isolation)
      const messages = parsed.map((msg: any) => ({
        ...msg
        // timestamp permanece como number (portable para localStorage)
      }));
      
      return track 
        ? messages.filter((m: Message) => !m.track || m.track === track)
        : messages;
    } catch (error) {
      console.error(`Error loading chat for ${subject}:`, error);
      return [];
    }
  },

  // --- TEACHER PORTAL MANAGEMENT ---
  
  /**
   * Guarda un material subido por docente.
   * ✅ CORREGIDO: Solo guarda materiales del usuario, NO semillas.
   * Las semillas se inyectan en memoria desde getCourseMaterials().
   */
  saveCourseMaterial: (material: CourseMaterial) => {
    try {
      // ✅ CRÍTICO: Usar getUserMaterialsOnly() para evitar guardar semillas
      const existing = getUserMaterialsOnly();
      existing.push(material);
      localStorage.setItem(KEYS.COURSE_MATERIALS, JSON.stringify(existing));
      return true;
    } catch (error) {
      console.error("Error saving course material:", error);
      return false;
    }
  },

  /**
   * Obtiene materiales educativos combinando:
   * 1. Materiales subidos por docentes (localStorage)
   * 2. Semillas pre-curadas (memoria, desde dbaSeedContent.ts)
   * 
   * Las semillas solo se inyectan si no existe un material con el mismo dbaCode.
   * Esto permite que los docentes sobrescriban las semillas con contenido personalizado.
   * 
   * @param subject - (Opcional) Filtrar por nombre de materia
   * @param grade - (Opcional) Filtrar por grado escolar (ej: "11°")
   * @returns Array de CourseMaterial combinado
   */
  getCourseMaterials: (subject?: string, grade?: string): CourseMaterial[] => {
    try {
      // ✅ CRÍTICO: Obtener SOLO materiales del usuario (sin semillas)
      const userMaterials = getUserMaterialsOnly();
      
      // Combinar materiales del usuario con semillas
      const combined = [...userMaterials];
      
      DBA_SEED_CONTENT.forEach(seed => {
        // ✅ NUEVO: Filtrar por grado si se proporciona
        if (grade && seed.grade !== grade) return;
        
        // Solo inyectar semilla si no existe material con mismo dbaCode
        const indexByDba = combined.findIndex(m => m && m.dbaCode === seed.dbaCode);
        if (indexByDba === -1) {
          combined.push(seed);
        }
      });

      if (subject) {
        // Normalize for standard subject comparison
        const normSubject = subject.toLowerCase().trim();
        return combined.filter(m => {
          const mSubject = m.subject.toLowerCase().trim();
          // Match exactly, or check substring (e.g. Inglés vs Idioma Extranjero/Inglés)
          return mSubject === normSubject || 
                 mSubject.includes(normSubject) || 
                 normSubject.includes(mSubject);
        });
      }
      return combined;
    } catch (error) {
      console.error("Error loading course materials:", error);
      return [];
    }
  },

  /**
   * Elimina un material subido por docente.
   * ✅ CORREGIDO: Solo elimina de materiales del usuario, NO afecta semillas.
   * Las semillas siempre estarán disponibles como fallback.
   */
  deleteCourseMaterial: (id: string) => {
    try {
      // ✅ CRÍTICO: Usar getUserMaterialsOnly() para evitar guardar semillas
      const existing = getUserMaterialsOnly();
      const filtered = existing.filter(m => m.id !== id);
      localStorage.setItem(KEYS.COURSE_MATERIALS, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error("Error deleting course material:", error);
      return false;
    }
  },

  // --- BUILDER TRACK MANAGEMENT ---
  saveBuilderProject: (project: BuilderProject) => {
    try {
      const existing = StorageService.getBuilderProjects();
      const index = existing.findIndex(p => p.id === project.id);
      if (index >= 0) {
        existing[index] = project;
      } else {
        existing.push(project);
      }
      localStorage.setItem(KEYS.BUILDER_PROJECTS, JSON.stringify(existing));
      return true;
    } catch (error) {
      console.error("Error saving builder project:", error);
      return false;
    }
  },

  getBuilderProjects: (): BuilderProject[] => {
    try {
      const stored = localStorage.getItem(KEYS.BUILDER_PROJECTS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading builder projects:", error);
      return [];
    }
  },

  // ✅ NUEVO: Método para obtener proyectos vinculados a un módulo del Track Estudiante (Cross-Track Synergy)
  getBuilderProjectsBySubject: (subjectId: string): BuilderProject[] => {
    try {
      const projects = StorageService.getBuilderProjects();
      return projects.filter(p => p.linkedSubjectId === subjectId);
    } catch (error) {
      console.error("Error loading builder projects by subject:", error);
      return [];
    }
  },

  saveBuilderProfile: (profile: BuilderProfile) => {
    try {
      localStorage.setItem(KEYS.BUILDER_PROFILE, JSON.stringify(profile));
      return true;
    } catch (error) {
      console.error("Error saving builder profile:", error);
      return false;
    }
  },

  loadBuilderProfile: (): BuilderProfile | null => {
    try {
      const stored = localStorage.getItem(KEYS.BUILDER_PROFILE);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error loading builder profile:", error);
      return null;
    }
  },

  // --- UTILS ---
  clearAllData: () => {
    localStorage.clear(); // Nuclear option for debugging
  }
};