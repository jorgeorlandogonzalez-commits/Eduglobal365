// src/App.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Message, Role, StudentProfile, AppView, SimulationState,
  SubjectModule, NotebookTool, CourseMaterial, UserRole
} from './config/types';
import { APP_NAME, SIMULATION_TRIGGER_MESSAGE } from './config/constants';
import { INTERACTION_POINTS } from './config/dbaSeedContent';
import { sendMessageToGemini } from './services/geminiService';
import { StorageService } from './services/storageService';
import { DownloadService } from './services/downloadService';
import { webLLMInstance as WebLLMService } from './services/webLLMService';
import { signInSilently, signInWithGoogle, logout, observeAuth } from './config/firebase';
import type { User } from 'firebase/auth';
import ChatBubble from './components/ChatBubble';
import CampusMap from './components/CampusMap';
import LandingPage, { Grade } from './components/LandingPage';
import TeacherPortal from './components/TeacherPortal';
import SubjectDashboard from './components/SubjectDashboard';
import ConstructorLab from './components/ConstructorLab';
import { RewardShop } from './components/RewardShop';
import { AchievementPopup, Achievement } from './components/AchievementPopup';
import { OfflineManager } from './components/OfflineManager';

// ============================================================================
// 🔧 HELPERS
// ============================================================================
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// ============================================================================
// 🚀 APP COMPONENT
// ============================================================================
const App: React.FC = () => {
  // --- STATE: App Core ---
  const [currentView, setCurrentView] = useState<AppView>(() => {
    const saved = StorageService.loadAppState();
    return saved?.currentView || 'LANDING';
  });

  const [activeSubject, setActiveSubject] = useState<string | null>(() => {
    const saved = StorageService.loadAppState();
    return saved?.activeSubject || null;
  });

  const [userRole, setUserRole] = useState<UserRole>(() => {
    const saved = StorageService.loadAppState();
    return saved?.userRole || 'student';
  });

  const [showOfflineManager, setShowOfflineManager] = useState(false);
  const [dataSaverMode, setDataSaverMode] = useState(false);

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = StorageService.loadAppState();
    const subject = saved?.activeSubject;
    const track = saved?.userRole || 'student';
    return StorageService.loadSubjectChat(subject, track);
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // --- STATE: WebLLM Local REAL (reemplaza simulador) ---
  const [forceGemmaLocal, setForceGemmaLocal] = useState(false);
  const [gemmaModelDownloading, setGemmaModelDownloading] = useState(false);
  const [gemmaProgress, setGemmaProgress] = useState(0);
  const [gemmaReady, setGemmaReady] = useState(false);

  // --- STATE: Firebase Auth (opcional, nunca bloqueante) ---
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  // --- STATE: Optimización audio Ping-Pong (useRef evita re-renders masivos) ---
  const lastCheckedSecond = useRef<number>(0);
  const [hasTriggeredPoint, setHasTriggeredPoint] = useState<Record<string, boolean>>({});

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
      } catch (e) {
        console.warn('localStorage not accessible for theme check');
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [simulationState, setSimulationState] = useState<SimulationState>({
    isActive: false,
    currentQuestion: 0,
    totalQuestions: 5
  });

  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [triggeredAchievements, setTriggeredAchievements] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [student, setStudent] = useState<StudentProfile>({
    name: "Estudiante",
    grade: "11°",
    location: "Necoclí, Urabá",
    level: 1,
    points: 1250,
    streak: 3,
    currentLevel: {
      "Matemáticas": "Intermedio",
      "Inglés": "Básico A2",
      "Sociales": "Avanzado"
    },
    progress: {
      completedModules: ["Matemáticas Básicas", "Lectura Crítica 1"],
      quizScores: {
        "Simulacro General ICFES": 85,
        "Matemáticas": 90,
      }
    }
  });

  const [currentMaterial, setCurrentMaterial] = useState<CourseMaterial | null>(null);

  // ==========================================================================
  // 🆕 EFFECT: FIREBASE AUTH SILENCIOSA (nunca bloquea la UI)
  // ==========================================================================
  useEffect(() => {
    signInSilently(); // Auth anónima en background
    const unsubscribe = observeAuth((user) => setFirebaseUser(user));
    return unsubscribe;
  }, []);

  // --- EFFECT: NETWORK MONITORING ---
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // --- EFFECT: DARK MODE ---
  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch (e) {
      console.warn('localStorage not accessible for theme save');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (dataSaverMode) {
      document.body.classList.add('data-saver');
    } else {
      document.body.classList.remove('data-saver');
    }
  }, [dataSaverMode]);

  // --- EFFECT: PERSISTENCE (APP STATE) ---
  useEffect(() => {
    StorageService.saveAppState(currentView, activeSubject, userRole);
  }, [currentView, activeSubject, userRole]);

  // --- EFFECT: PERSISTENCE (CHAT HISTORY) ---
  useEffect(() => {
    if (activeSubject && messages.length > 0) {
      StorageService.saveSubjectChat(activeSubject, messages, userRole);
    }
  }, [messages, activeSubject, userRole]);

  // --- EFFECT: AI RESPONSE ANALYSIS (SIMULATION DETECTOR + GAMIFICATION) ---
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === Role.MODEL) {
        const questionMatch = lastMsg.text.match(/Pregunta\s+(\d+)\s*(?:de|\/)\s*5/i);

        if (questionMatch) {
          setSimulationState({
            isActive: true,
            currentQuestion: parseInt(questionMatch[1]),
            totalQuestions: 5
          });
        }

        if (lastMsg.text.includes("REPORTE DE COMPETENCIAS") || lastMsg.text.includes("Mentores de Vereda")) {
          setSimulationState(prev => ({ ...prev, isActive: false }));
        }

        const scoreMatch = lastMsg.text.match(/\[\[SCORE:\s*(\d+)\/5\]\]/);
        if (scoreMatch) {
          const correctAnswers = parseInt(scoreMatch[1]);
          const scorePercentage = (correctAnswers / 5) * 100;
          const subjectKey = activeSubject || "Simulacro General";

          setStudent(prev => {
            const currentScores = prev.progress?.quizScores || {};
            const currentModules = prev.progress?.completedModules || [];

            if (currentScores[subjectKey] === scorePercentage) return prev;

            const newScores = { ...currentScores, [subjectKey]: scorePercentage };
            let newCompleted = [...currentModules];

            if (scorePercentage >= 60 && !newCompleted.includes(subjectKey)) {
              newCompleted.push(subjectKey);
            }

            return {
              ...prev,
              points: (prev.points || 0) + correctAnswers * 50,
              streak: scorePercentage === 100 ? (prev.streak || 0) + 1 : prev.streak,
              progress: {
                completedModules: newCompleted,
                quizScores: newScores
              }
            };
          });

          if (!triggeredAchievements.has(lastMsg.id)) {
            setTriggeredAchievements(prev => new Set(prev).add(lastMsg.id));
            if (scorePercentage >= 80) {
              setCurrentAchievement({
                id: generateUUID(),
                title: '¡Racha de Genio!',
                description: `Completaste ${subjectKey} con excelencia.`,
                points: correctAnswers * 50,
                icon: '🔥'
              });
            } else if (scorePercentage >= 60) {
              setCurrentAchievement({
                id: generateUUID(),
                title: '¡Módulo Superado!',
                description: `Has completado el reto de ${subjectKey}.`,
                points: correctAnswers * 50,
                icon: '🏆'
              });
            }
          }
        } else if (lastMsg.text.toLowerCase().includes('¡correcto!') || lastMsg.text.toLowerCase().includes('¡excelente!')) {
          if (!triggeredAchievements.has(lastMsg.id)) {
            setTriggeredAchievements(prev => new Set(prev).add(lastMsg.id));
            setCurrentAchievement({
              id: generateUUID(),
              title: '¡Buena respuesta!',
              description: `Continúa así, sumando puntos.`,
              points: 10,
              icon: '✨'
            });
            setStudent(prev => ({
              ...prev,
              points: (prev.points || 0) + 10
            }));
          }
        }
      }
    }
  }, [messages, activeSubject, triggeredAchievements]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (currentView === 'CLASSROOM') {
      scrollToBottom();
    }
  }, [messages, currentView]);

  // ==========================================================================
  // 🆕 HANDLER: Activar WebLLM REAL (reemplaza simulador con setInterval)
  // ==========================================================================
  const handleActivateGemmaLocal = async () => {
    if (gemmaReady) {
      // Desactivar modo local y liberar memoria GPU
      setForceGemmaLocal(false);
      setGemmaReady(false);
      (window as any).__forceLocalAI = false;
      try {
        await WebLLMService.unload();
      } catch (e) {
        console.warn('Error unloading WebLLM:', e);
      }
      return;
    }

    if (gemmaModelDownloading) return;

    setGemmaModelDownloading(true);
    setGemmaProgress(0);

    try {
      await WebLLMService.init((progress) => {
        setGemmaProgress(Math.round(progress * 100));
      });
      setGemmaReady(true);
      setForceGemmaLocal(true);
      (window as any).__forceLocalAI = true;
    } catch (e) {
      console.warn('Gemma Local Fallback:', e);
      alert('Tu navegador no soporta WebGPU o no pudo cargar el modelo. Usaremos el modo estático offline.');
      setForceGemmaLocal(false);
      setGemmaReady(false);
    } finally {
      setGemmaModelDownloading(false);
    }
  };

  // ==========================================================================
  // HANDLER: Send Message (Online → Gemini | Offline/Forzado → WebLLM)
  // ==========================================================================
  const handleSendMessage = async (text: string, isSystemTrigger = false) => {
    if ((!text.trim() && !isSystemTrigger) || isLoading || text.length > 500) return;

    const isGemmaMode = !isOnline || forceGemmaLocal;

    if (isGemmaMode) {
      if (!isSystemTrigger) {
        const userMsg: Message = {
          id: generateUUID(),
          role: Role.USER,
          text: text,
          timestamp: Date.now(),
          track: userRole
        };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
      }
      setIsLoading(true);

      try {
        const aiResponseText = await sendMessageToGemini(messages, text, activeSubject, userRole, userRole);
        const aiMsg: Message = {
          id: generateUUID(),
          role: Role.MODEL,
          text: aiResponseText,
          timestamp: Date.now(),
          track: userRole
        };
        setMessages(prev => [...prev, aiMsg]);
      } catch (error) {
        console.error("Error en modo offline:", error);
        const errorMsg: Message = {
          id: generateUUID(),
          role: Role.MODEL,
          text: "⚠️ Error en el motor local. Intenta recargar o conecta internet.",
          timestamp: Date.now(),
          track: userRole
        };
        setMessages(prev => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // MODO ONLINE
    const userMsg: Message = {
      id: generateUUID(),
      role: Role.USER,
      text: text,
      timestamp: Date.now(),
      track: userRole
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const aiResponseText = await sendMessageToGemini(messages, text, activeSubject, userRole, userRole);
      const aiMsg: Message = {
        id: generateUUID(),
        role: Role.MODEL,
        text: aiResponseText,
        timestamp: Date.now(),
        track: userRole
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      const errorMsg: Message = {
        id: generateUUID(),
        role: Role.MODEL,
        text: "⚠️ Error de conexión. Intenta activar el modo local (🤖) o revisa tu internet.",
        timestamp: Date.now(),
        track: userRole
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================================================
  // ACTIONS
  // ==========================================================================
  const handleStartSimulation = async () => {
    setSimulationState({ isActive: true, currentQuestion: 0, totalQuestions: 5 });
    setIsSidebarOpen(false);
    await handleSendMessage(SIMULATION_TRIGGER_MESSAGE, true);
  };

  const handleSmartDownload = () => {
    if (!activeSubject) return;
    const success = DownloadService.generateOfflinePackage(activeSubject, messages, userRole);
    if (success) {
      console.log("✅ Paquete 'Preparar para la Vereda' descargado correctamente.");
      const systemMsg: Message = {
        id: generateUUID(),
        role: Role.MODEL,
        text: "✅ **Paquete Offline Generado.** El contenido de este módulo ha sido descargado a tu dispositivo. Puedes acceder a él sin conexión a internet.",
        timestamp: Date.now(),
        track: userRole
      };
      setMessages(prev => [...prev, systemMsg]);
    }
  };

  const generatePDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const history = StorageService.loadSubjectChat(activeSubject || "General", userRole);

    printWindow.document.write(`
      <html>
        <head>
          <title>Guía de Estudio - Eduglobal365</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
            h1 { color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; }
            .message { margin-bottom: 20px; padding: 15px; border-radius: 8px; }
            .user { background-color: #f0f9ff; border-left: 4px solid #0ea5e9; }
            .model { background-color: #f8fafc; border-left: 4px solid #8b5cf6; }
            .role { font-weight: bold; margin-bottom: 5px; color: #1e40af; }
          </style>
        </head>
        <body>
          <h1>Guía de Estudio Offline - ${activeSubject || 'General'}</h1>
          <p><strong>Estudiante:</strong> ${student.name} | <strong>Grado:</strong> ${student.grade}</p>
          <p><em>Generado por Eduglobal365 - Modo Offline</em></p>
          <br/>
          ${history.length > 0 ? history.map(m => `
            <div class="message ${m.role}">
              <div class="role">${m.role === 'user' ? 'Estudiante' : 'Tutor Edú'}</div>
              <div>${m.text.replace(/\n/g, '<br/>')}</div>
            </div>
          `).join('') : '<p>No hay historial de conversación en este módulo aún.</p>'}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleEnterTool = async (tool: string) => {
    if (tool === "Generar Guía PDF") {
      generatePDF();
      return;
    }

    if (tool === "SIMULACRO") {
      await handleEnterSubject("Simulacro General ICFES");
      await handleStartSimulation();
      return;
    }

    const subjectContext = activeSubject || "General";

    if (!activeSubject) {
      setActiveSubject(subjectContext);
      const history = StorageService.loadSubjectChat(subjectContext, userRole);
      setMessages(history);
    }

    setCurrentView('CLASSROOM');
    setIsSidebarOpen(false);

    const toolMessage = tool === "Recursos Regionales"
      ? `Solicito recurso del sistema: ${tool}. (Contexto actual: ${subjectContext}, Región del estudiante: ${student.location})`
      : `Solicito recurso del sistema: ${tool}. (Contexto actual: ${subjectContext})`;
    await handleSendMessage(toolMessage);
  };

  const handleEnterSubject = async (subject: string) => {
    if (subject === "Simulacro General ICFES") {
      setActiveSubject(subject);
      setCurrentView('CLASSROOM');
      setIsSidebarOpen(false);
      setSimulationState({ isActive: true, currentQuestion: 1, totalQuestions: 5, score: 0 });
      setCurrentMaterial(null);

      setMessages([]);
      setIsLoading(true);

      try {
        const response = await sendMessageToGemini([], SIMULATION_TRIGGER_MESSAGE, "SIMULACRO ICFES", userRole, userRole);
        const aiMsg: Message = {
          id: generateUUID(),
          role: Role.MODEL,
          text: response,
          timestamp: Date.now(),
          track: userRole
        };
        setMessages([aiMsg]);
      } catch (error) {
        console.error("Error iniciando simulacro:", error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setActiveSubject(subject);
    setCurrentView('SUBJECT_DASHBOARD');
    setIsSidebarOpen(false);
    setSimulationState({ isActive: false, currentQuestion: 0, totalQuestions: 5 });
  };

  // ✅ CORREGIDO: Carga real de materiales con filtros de materia y grado
  const handleStartModuleTool = async (module: SubjectModule, tool: NotebookTool) => {
    setCurrentView('CLASSROOM');

    const materials = StorageService.getCourseMaterials(activeSubject || undefined, student.grade);
    const material = materials.find(m =>
      m.subject === activeSubject &&
      m.moduleId === module.id &&
      m.toolId === tool.id
    );
    setCurrentMaterial(material || null);

    const subjectHistory = StorageService.loadSubjectChat(activeSubject || "General", userRole);
    setMessages(subjectHistory);

    if (subjectHistory.length === 0) {
      setIsLoading(true);

      const entryText = `¡Hola Edú! Voy a estudiar el módulo "${module.title}" usando la herramienta: ${tool.label}. ¿Empezamos?`;

      const initialUserMsg: Message = {
        id: generateUUID(),
        role: Role.USER,
        text: entryText,
        timestamp: Date.now(),
        track: userRole
      };
      setMessages([initialUserMsg]);

      try {
        const response = await sendMessageToGemini([], entryText, activeSubject, userRole, userRole);
        const aiMsg: Message = {
          id: generateUUID(),
          role: Role.MODEL,
          text: response,
          timestamp: Date.now(),
          track: userRole
        };
        setMessages(prev => [...prev, aiMsg]);
      } catch (error) {
        console.error("Error iniciando módulo:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      const entryText = `[SISTEMA] El estudiante ha seleccionado el módulo "${module.title}" y la herramienta "${tool.label}". Guíalo en este formato.`;
      await handleSendMessage(entryText, true);
    }
  };

  const handleResetCampus = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('localStorage not accessible for clear');
    }
    setCurrentView('LANDING');
    setActiveSubject(null);
    setMessages([]);
    setSimulationState({ isActive: false, currentQuestion: 0, totalQuestions: 5 });
    setInputText('');
    setIsSidebarOpen(false);
  };

  const handleReturnToCampus = () => {
    setCurrentView('CAMPUS');
    setSimulationState(prev => ({ ...prev, isActive: false }));
    setActiveSubject(null);
    setMessages([]);
  };

  // ==========================================================================
  // RENDER: LANDING / TEACHER / REWARDS / CONSTRUCTOR
  // ==========================================================================
  if (currentView === 'LANDING') {
    return (
      <LandingPage
        onStart={() => {
          setUserRole('student');
          setCurrentView('CAMPUS');
        }}
        onTeacherAccess={() => {
          setUserRole('teacher');
          setCurrentView('TEACHER_PORTAL');
        }}
        onConstructorAccess={() => {
          setUserRole('builder');
          setCurrentView('CONSTRUCTOR_LAB');
        }}
        studentName={student.name}
        studentGrade={student.grade as Grade}
        onGradeChange={(grade) => setStudent(prev => ({ ...prev, grade }))}
      />
    );
  }

  if (currentView === 'TEACHER_PORTAL') {
    return <TeacherPortal onReturn={() => setCurrentView('LANDING')} />;
  }

  if (currentView === 'REWARDS') {
    return (
      <RewardShop
        student={student}
        onReturn={() => setCurrentView('CAMPUS')}
        onPurchase={(cost, itemName) => {
          setStudent(prev => ({ ...prev, points: (prev.points || 0) - cost }));
          setCurrentAchievement({
            id: generateUUID(),
            title: '¡Canje Exitoso!',
            description: `Has adquirido: ${itemName}.`,
            points: 0,
            icon: '🎁'
          });
        }}
      />
    );
  }

  if (currentView === 'CONSTRUCTOR_LAB') {
    return (
      <ConstructorLab
        onReturn={() => setCurrentView('LANDING')}
        onStartProject={(project) => {
          setActiveSubject(project.title);
          setCurrentView('CLASSROOM');
          setIsSidebarOpen(false);
          const history = StorageService.loadSubjectChat(project.title, 'builder');
          setMessages(history);
          if (history.length === 0) {
            const entryText = `¡Hola Asistente! Voy a trabajar en el proyecto "${project.title}". Mi métrica de impacto es: ${project.impactMetric}. ¿Por dónde empezamos?`;
            handleSendMessage(entryText, true);
          }
        }}
      />
    );
  }

  // ==========================================================================
  // RENDER: MAIN APP LAYOUT
  // ==========================================================================
  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 overflow-hidden">

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between shadow-sm z-10 sticky top-0 transition-colors duration-300">
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleReturnToCampus}>
          <div className="bg-blue-600 dark:bg-blue-500 p-1.5 rounded-lg text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-none">{APP_NAME}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentView === 'CAMPUS' ? 'Campus Virtual' : `Módulo: ${activeSubject || 'General'}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setDataSaverMode(!dataSaverMode)}
              className={`hidden md:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors border ${dataSaverMode ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'}`}
              title="Modo Ahorro de Datos (Desactiva animaciones y prefiere audio)"
            >
              <span>{dataSaverMode ? '🔋 Ahorro Activo' : '⚡ Normal'}</span>
            </button>

            <button
              onClick={() => setShowOfflineManager(true)}
              className="hidden md:flex items-center gap-1.5 text-xs font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 border border-green-200 dark:border-green-800 px-3 py-1.5 rounded-full transition-colors"
              title="Gestor Offline SAS BIC"
            >
              <span>📥 Paquetes Offline</span>
            </button>
          </div>

          {currentView === 'CLASSROOM' && (
            <div className="flex gap-2">
              <button
                onClick={handleSmartDownload}
                className="hidden md:flex items-center gap-2 text-xs font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 border border-green-200 dark:border-green-800 px-3 py-1.5 rounded-full transition-colors"
                title="Descargar paquete offline"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Preparar para la Vereda
              </button>
              <button
                onClick={handleReturnToCampus}
                className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 px-3 py-1.5 rounded-full transition-colors"
              >
                Mapa del Campus
              </button>
            </div>
          )}

          {/* 🆕 Botón WebLLM REAL (descarga genuina con progreso) */}
          <button
            onClick={handleActivateGemmaLocal}
            disabled={gemmaModelDownloading}
            className={`
              hidden md:flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border transition-all duration-300
              ${gemmaModelDownloading
                ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-300 animate-pulse'
                : gemmaReady
                  ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-purple-400 hover:text-purple-600'}
            `}
            title={gemmaReady ? "Operando en Gemma Local (Inferencia local activa)" : "Activar Inferencia Offline con Gemma 2B"}
          >
            <span className="text-[11px]">🤖</span>
            {gemmaModelDownloading
              ? `Descargando Gemma... ${gemmaProgress}%`
              : gemmaReady
                ? "Gemma Local Activo"
                : "Activar Gemma Local"
            }
          </button>

          {/* 🆕 Botón Firebase Sync (anónimo por defecto, Google opcional) */}
          {firebaseUser ? (
            <button
              onClick={logout}
              className="hidden md:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100 transition-colors"
              title={firebaseUser.isAnonymous
                ? 'Sesión local anónima (sync activo). Clic para salir.'
                : `Sesión con Google: ${firebaseUser.email || 'conectada'}. Clic para salir.`}
            >
              ☁️ {firebaseUser.isAnonymous ? 'Sync Anónimo' : 'Google Conectado'}
            </button>
          ) : (
            <button
              onClick={() => signInWithGoogle().catch((e) => console.warn('Google sign-in cancelado:', e))}
              className="hidden md:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors"
              title="Opcional: conecta tu cuenta Google para sincronizar entre dispositivos"
            >
              🔗 Conectar Google (opcional)
            </button>
          )}

          <div className={`
            hidden md:flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border transition-colors duration-300
            ${(isOnline && !forceGemmaLocal)
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
              : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'}
          `}>
            <span className={`w-2 h-2 rounded-full ${(isOnline && !forceGemmaLocal) ? 'bg-blue-500' : 'bg-green-500 animate-pulse'}`}></span>
            {(isOnline && !forceGemmaLocal) ? 'Sincronizado' : 'Inferencia Local Activa (Offline)'}
          </div>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
            title={isDarkMode ? "Modo Claro" : "Modo Oscuro"}
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full md:hidden transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Sidebar */}
        <aside className={`
          absolute md:static top-0 left-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-20 transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          overflow-y-auto
        `}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-yellow-800">
                {student.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-sm dark:text-slate-200">{student.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{student.location}</p>
              </div>
            </div>

            <button
              onClick={handleResetCampus}
              className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 py-1.5 rounded-lg transition-colors border border-red-100 dark:border-red-900/50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reiniciar Campus (Demo)
            </button>

            {(student.progress || student.currentLevel) && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tu Progreso</p>
                  <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full font-medium">Nivel {student.level}</span>
                </div>

                {student.currentLevel && (
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {Object.entries(student.currentLevel).map(([subject, level]) => (
                      <div key={subject} className="px-2 py-1 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded text-[10px]">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">{subject}:</span> <span className="text-slate-500 dark:text-slate-400">{level}</span>
                      </div>
                    ))}
                  </div>
                )}

                {student.progress && (
                  <>
                    <div className="space-y-1.5 mb-3">
                      {Object.entries(student.progress.quizScores).map(([subject, scoreValue]) => {
                        const score = scoreValue as number;
                        return (
                          <div key={subject} className="flex justify-between items-center text-xs group">
                            <span className="text-slate-600 dark:text-slate-400 truncate max-w-[140px]" title={subject}>{subject}</span>
                            <div className="flex items-center gap-1.5">
                              <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                  style={{ width: `${score}%` }}
                                ></div>
                              </div>
                              <span className={`font-bold w-6 text-right ${score >= 80 ? 'text-green-600 dark:text-green-400' : score >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                                {score}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-1">Módulos Completados</p>
                      <div className="flex flex-wrap gap-1">
                        {student.progress.completedModules.map(mod => (
                          <span key={mod} className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-medium rounded border border-blue-100 dark:border-blue-800 truncate max-w-full" title={mod}>
                            {mod}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <nav className="p-4 space-y-2">
            <button
              onClick={handleReturnToCampus}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left font-medium ${currentView === 'CAMPUS' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
            >
              <span className="text-lg">🗺️</span> Mapa del Campus
            </button>

            {currentView === 'CLASSROOM' && (
              <>
                <div className="pt-4 pb-2">
                  <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Silo: {activeSubject}</h3>
                </div>
                <button onClick={() => { setIsSidebarOpen(false); handleSmartDownload(); }} className="md:hidden w-full flex items-center gap-3 px-3 py-2 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-lg text-sm transition-colors text-left font-bold">
                  <span className="text-lg">💾</span> Preparar para la Vereda
                </button>

                <button onClick={() => { setIsSidebarOpen(false); handleStartSimulation(); }} className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg text-sm transition-colors text-left">
                  <span className="text-lg">⏱️</span> Iniciar Simulacro
                </button>
                <button onClick={() => { setIsSidebarOpen(false); handleEnterTool("Generar Guía PDF"); }} className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg text-sm transition-colors text-left">
                  <span className="text-lg">📄</span> Generar PDF
                </button>
                <button onClick={() => { setIsSidebarOpen(false); handleEnterTool("Recursos Regionales"); }} className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg text-sm transition-colors text-left">
                  <span className="text-lg">🌱</span> Recursos de mi Región
                </button>
              </>
            )}

            <div className="pt-4 pb-2">
              <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Acceso Rápido</h3>
            </div>
            <button onClick={() => handleEnterSubject("Matemáticas")} className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg text-sm transition-colors text-left">
              <span className="text-lg">📐</span> Matemáticas
            </button>
            <button onClick={() => handleEnterSubject("Inglés")} className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg text-sm transition-colors text-left">
              <span className="text-lg">🇺🇸</span> Inglés
            </button>
            <button onClick={() => handleEnterSubject("Sociales y Ciudadanas")} className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg text-sm transition-colors text-left">
              <span className="text-lg">🏛️</span> Sociales
            </button>
          </nav>
        </aside>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="absolute inset-0 bg-black/20 z-10 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* VIEW MANAGER SWITCH */}
        <AnimatePresence mode="wait">
          {currentView === 'CAMPUS' ? (
            <motion.div
              key="campus"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 overflow-hidden flex flex-col"
            >
              <CampusMap
                onSelectSubject={handleEnterSubject}
                onSelectTool={handleEnterTool}
                student={student}
                userRole={userRole}
                onSwitchTrack={() => setCurrentView('CONSTRUCTOR_LAB')}
                onOpenRewards={() => setCurrentView('REWARDS')}
              />
            </motion.div>
          ) : currentView === 'SUBJECT_DASHBOARD' ? (
            <motion.div
              key="subject_dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 overflow-hidden flex flex-col"
            >
              <SubjectDashboard
                subject={activeSubject || "General"}
                grade={student.grade}
                onBack={handleReturnToCampus}
                onStartTool={handleStartModuleTool}
              />
            </motion.div>
          ) : (
            /* CLASSROOM CHAT VIEW */
            <motion.div
              key="classroom"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col relative w-full"
            >

              {/* SIMULATION PROGRESS BAR */}
              {simulationState.isActive && (
                <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between shadow-md z-10">
                  <div className="flex items-center gap-2">
                    <span className="animate-pulse w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="font-bold text-sm uppercase tracking-wider">Modo Examen Estricto</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>Pregunta {simulationState.currentQuestion} de {simulationState.totalQuestions}</span>
                    <div className="w-24 bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(simulationState.currentQuestion / simulationState.totalQuestions) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 scroll-smooth">
                <div className="max-w-3xl mx-auto">

                  {/* MEDIA PLAYER (AUDIO/VIDEO) */}
                  {currentMaterial && currentMaterial.resourceUrl && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 p-5 rounded-2xl mb-8 shadow-md border border-slate-300 dark:border-slate-700 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-blue-500 opacity-10 rounded-full blur-2xl"></div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2 relative z-10">
                        {currentMaterial.toolId === 'video' ? (
                          <span className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full"><span className="text-lg">🎬</span> Video de la Clase</span>
                        ) : currentMaterial.toolId === 'audio' ? (
                          <span className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full"><span className="text-lg">🎧</span> Podcast de la Clase</span>
                        ) : (
                          <span className="flex items-center gap-2 bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-full"><span className="text-lg">📎</span> Recurso Adjunto</span>
                        )}
                      </h3>
                      <div className="relative z-10">
                        {currentMaterial.toolId === 'video' ? (
                          <>
                            <video controls className="w-full rounded-xl bg-black shadow-inner" src={currentMaterial.resourceUrl}>
                              Tu navegador no soporta el elemento de video.
                            </video>
                            {dataSaverMode && (
                              <div className="video-fallback hidden bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800 items-center gap-3">
                                <span className="text-2xl">🔋</span>
                                <p className="text-sm text-amber-800 dark:text-amber-300">
                                  <strong>Video Oculto:</strong> El modo Ahorro de Datos está activo. Desactívalo en la barra superior para ver videos pesados.
                                </p>
                              </div>
                            )}
                          </>
                        ) : currentMaterial.toolId === 'audio' ? (
                          <div className="bg-white dark:bg-slate-950 p-3 rounded-xl shadow-inner border border-slate-200 dark:border-slate-800">
                            <audio
                              controls
                              className="w-full"
                              src={currentMaterial.resourceUrl}
                              onTimeUpdate={(e) => {
                                // ✅ OPTIMIZACIÓN: useRef evita ejecutar lógica en cada milisegundo
                                const currentTime = Math.floor(e.currentTarget.currentTime);

                                if (currentTime !== lastCheckedSecond.current) {
                                  lastCheckedSecond.current = currentTime;

                                  const dbaCode = currentMaterial.dbaCode;
                                  const points = INTERACTION_POINTS[dbaCode];

                                  if (points) {
                                    const matchedPoint = points.find(p => p.timestamp === currentTime);
                                    if (matchedPoint) {
                                      const uniqueKey = `${dbaCode}_${currentTime}`;
                                      if (!hasTriggeredPoint[uniqueKey]) {
                                        setHasTriggeredPoint(prev => ({ ...prev, [uniqueKey]: true }));

                                        // Pausa automática (Ping-Pong Híbrido)
                                        e.currentTarget.pause();

                                        const interactionMsg: Message = {
                                          id: generateUUID(),
                                          role: Role.MODEL,
                                          text: matchedPoint.prompt,
                                          timestamp: Date.now(),
                                          track: 'student'
                                        };
                                        setMessages(prev => [...prev, interactionMsg]);
                                      }
                                    }
                                  }
                                }
                              }}
                            >
                              Tu navegador no soporta el elemento de audio.
                            </audio>
                          </div>
                        ) : (
                          <a href={currentMaterial.resourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-2 p-3 bg-white dark:bg-slate-950 rounded-xl inline-block">
                            <span>Abrir recurso externo</span>
                            <span className="text-xl">↗️</span>
                          </a>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {messages.length === 0 && !isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-slate-400 mt-10"
                    >
                      <p>Iniciando clase de {activeSubject}...</p>
                    </motion.div>
                  )}
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <ChatBubble key={msg.id} message={msg} onOptionSelect={(opt) => handleSendMessage(opt)} />
                    ))}
                  </AnimatePresence>
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex justify-start animate-pulse"
                    >
                      <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></span>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Sticky Input Area */}
              <div className="absolute bottom-0 left-0 w-full bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-3 md:p-4 z-10 transition-colors duration-300">
                <div className="max-w-3xl mx-auto flex flex-col gap-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                      placeholder={
                        isOnline
                          ? (simulationState.isActive ? "Responde A, B, C o D..." : `Pregunta algo al experto en ${activeSubject}...`)
                          : "Modo Offline: Escribe tu pregunta..."
                      }
                      maxLength={500}
                      className="flex-1 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm disabled:opacity-70 disabled:bg-slate-100 dark:disabled:bg-slate-800 placeholder-slate-400 dark:placeholder-slate-500"
                      disabled={isLoading}
                    />
                    <button
                      onClick={() => handleSendMessage(inputText)}
                      disabled={isLoading || !inputText.trim() || inputText.length > 500}
                      className={`
                        p-3 rounded-full flex items-center justify-center transition-all shadow-md
                        ${isLoading || !inputText.trim() || inputText.length > 500
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 active:scale-95'}
                      `}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-xs text-right text-slate-400 dark:text-slate-500 px-4">
                    {inputText.length}/500
                  </div>
                </div>
                <div className="max-w-3xl mx-auto mt-2 flex justify-center gap-4 text-[10px] uppercase tracking-widest font-semibold">
                  <button onClick={handleReturnToCampus} className="text-slate-400 hover:text-blue-600 transition-colors">⬅ Volver al Campus</button>
                  <span className={`flex items-center gap-1 ${isOnline ? 'text-blue-600' : 'text-green-600'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-blue-600' : 'bg-green-600'}`}></span>
                    {isOnline ? 'Cloud Sync On' : 'Datos Locales Seguros'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RENDER ACHIEVEMENT POPUP */}
      <AchievementPopup
        achievement={currentAchievement}
        onClose={() => setCurrentAchievement(null)}
      />

      {/* RENDER OFFLINE MANAGER */}
      <AnimatePresence>
        {showOfflineManager && (
          <OfflineManager onClose={() => setShowOfflineManager(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;