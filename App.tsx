// src/App.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, Role, StudentProfile, AppView, SimulationState, SubjectModule, NotebookTool, CourseMaterial, UserRole } from './config/types';
import { getInitialUserMessage, APP_NAME, SIMULATION_TRIGGER_MESSAGE } from './config/constants';
import { INTERACTION_POINTS } from './config/dbaSeedContent';
import { sendMessageToGemini } from './services/geminiService';
import { StorageService } from './services/storageService';
import { DownloadService } from './services/downloadService';
import ChatBubble from './components/ChatBubble';
import CampusMap from './components/CampusMap';
import LandingPage, { Grade } from './components/LandingPage';
import TeacherPortal from './components/TeacherPortal';
import SubjectDashboard from './components/SubjectDashboard';
import ConstructorLab from './components/ConstructorLab';

// Polyfill UUID seguro
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

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(() => StorageService.loadAppState()?.currentView || 'LANDING');
  const [activeSubject, setActiveSubject] = useState<string | null>(() => StorageService.loadAppState()?.activeSubject || null);
  const [userRole, setUserRole] = useState<UserRole>(() => StorageService.loadAppState()?.userRole || 'student');
  
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = StorageService.loadAppState();
    return StorageService.loadSubjectChat(saved?.activeSubject || null, saved?.userRole || 'student');
  });

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dataSaverMode, setDataSaverMode] = useState(false);
  
  // Optimización para Ping-Pong Híbrido (evita re-renders masivos)
  const lastCheckedSecond = useRef<number>(0);
  const [hasTriggeredPoint, setHasTriggeredPoint] = useState<Record<string, boolean>>({});

  const [simulationState, setSimulationState] = useState<SimulationState>({ isActive: false, currentQuestion: 0, totalQuestions: 5 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [student, setStudent] = useState<StudentProfile>({
    name: "Estudiante", grade: "11°", location: "Necoclí, Urabá", level: 1, points: 0, streak: 0,
    currentLevel: { "Matemáticas": "Intermedio", "Inglés": "Básico A2", "Sociales": "Avanzado" },
    progress: { completedModules: [], quizScores: {} }
  });

  const [currentMaterial, setCurrentMaterial] = useState<CourseMaterial | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    StorageService.saveAppState(currentView, activeSubject, userRole);
  }, [currentView, activeSubject, userRole]);

  useEffect(() => {
    if (activeSubject && messages.length > 0) {
      StorageService.saveSubjectChat(activeSubject, messages, userRole);
    }
  }, [messages, activeSubject, userRole]);

  useEffect(() => {
    if (currentView === 'CLASSROOM') messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentView]);

  const handleSendMessage = async (text: string, isSystemTrigger = false) => {
    if ((!text.trim() && !isSystemTrigger) || isLoading || text.length > 500) return;

    const userMsg: Message = { id: generateUUID(), role: Role.USER, text, timestamp: Date.now(), track: userRole };
    if (!isSystemTrigger) {
      setMessages(prev => [...prev, userMsg]);
      setInputText('');
    }
    setIsLoading(true);

    try {
      const aiResponseText = await sendMessageToGemini(messages, text, activeSubject, userRole, userRole);
      const aiMsg: Message = { id: generateUUID(), role: Role.MODEL, text: aiResponseText, timestamp: Date.now(), track: userRole };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Error IA:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSimulation = async () => {
    setSimulationState({ isActive: true, currentQuestion: 0, totalQuestions: 5 });
    setIsSidebarOpen(false);
    await handleSendMessage(SIMULATION_TRIGGER_MESSAGE, true);
  };

  const handleSmartDownload = () => {
    if (!activeSubject) return;
    const success = DownloadService.generateOfflinePackage(activeSubject, messages, userRole);
    if (success) {
      setMessages(prev => [...prev, { id: generateUUID(), role: Role.MODEL, text: "✅ **Paquete Offline Generado.**", timestamp: Date.now(), track: userRole }]);
    }
  };

  const handleEnterSubject = async (subject: string) => {
    if (subject === "Simulacro General ICFES") {
      setActiveSubject(subject);
      setCurrentView('CLASSROOM');
      setSimulationState({ isActive: true, currentQuestion: 1, totalQuestions: 5, score: 0 });
      setCurrentMaterial(null);
      setMessages([]);
      setIsLoading(true);
      const response = await sendMessageToGemini([], SIMULATION_TRIGGER_MESSAGE, "SIMULACRO ICFES", userRole, userRole);
      setMessages([{ id: generateUUID(), role: Role.MODEL, text: response, timestamp: Date.now(), track: userRole }]);
      setIsLoading(false);
      return;
    }
    setActiveSubject(subject);
    setCurrentView('SUBJECT_DASHBOARD');
    setIsSidebarOpen(false);
    setSimulationState({ isActive: false, currentQuestion: 0, totalQuestions: 5 });
  };

  const handleStartModuleTool = async (module: SubjectModule, tool: NotebookTool) => {
    setCurrentView('CLASSROOM');
    const materials = StorageService.getCourseMaterials(activeSubject || undefined, student.grade);
    const material = materials.find(m => m.subject === activeSubject && m.moduleId === module.id && m.toolId === tool.id);
    setCurrentMaterial(material || null);
    
    const subjectHistory = StorageService.loadSubjectChat(activeSubject || "General", userRole);
    setMessages(subjectHistory);

    if (subjectHistory.length === 0) {
      setIsLoading(true);
      const entryText = `¡Hola Edú! Voy a estudiar el módulo "${module.title}" usando la herramienta: ${tool.label}. ¿Empezamos?`;
      setMessages([{ id: generateUUID(), role: Role.USER, text: entryText, timestamp: Date.now(), track: userRole }]);
      const response = await sendMessageToGemini([], entryText, activeSubject, userRole, userRole);
      setMessages(prev => [...prev, { id: generateUUID(), role: Role.MODEL, text: response, timestamp: Date.now(), track: userRole }]);
      setIsLoading(false);
    }
  };

  const handleResetCampus = () => {
    localStorage.clear();
    setCurrentView('LANDING');
    setActiveSubject(null);
    setMessages([]);
    setSimulationState({ isActive: false, currentQuestion: 0, totalQuestions: 5 });
  };

  const handleReturnToCampus = () => {
    setCurrentView('CAMPUS');
    setSimulationState(prev => ({...prev, isActive: false}));
    setActiveSubject(null);
    setMessages([]);
  };

  if (currentView === 'LANDING') {
    return <LandingPage onStart={() => { setUserRole('student'); setCurrentView('CAMPUS'); }} onTeacherAccess={() => { setUserRole('teacher'); setCurrentView('TEACHER_PORTAL'); }} onConstructorAccess={() => { setUserRole('builder'); setCurrentView('CONSTRUCTOR_LAB'); }} studentName={student.name} studentGrade={student.grade as Grade} onGradeChange={(grade) => setStudent(prev => ({ ...prev, grade }))} />;
  }
  if (currentView === 'TEACHER_PORTAL') return <TeacherPortal onReturn={() => setCurrentView('LANDING')} />;
  if (currentView === 'CONSTRUCTOR_LAB') {
    return <ConstructorLab onReturn={() => setCurrentView('LANDING')} onStartProject={(project) => { setActiveSubject(project.title); setCurrentView('CLASSROOM'); const history = StorageService.loadSubjectChat(project.title, 'builder'); setMessages(history); if (history.length === 0) handleSendMessage(`¡Hola Asistente! Voy a trabajar en el proyecto "${project.title}".`, true); }} />;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 overflow-hidden">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between shadow-sm z-10 sticky top-0">
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleReturnToCampus}>
          <div className="bg-blue-600 dark:bg-blue-500 p-1.5 rounded-lg text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-none">{APP_NAME}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{currentView === 'CAMPUS' ? 'Campus Virtual' : `Módulo: ${activeSubject || 'General'}`}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setDataSaverMode(!dataSaverMode)} className={`hidden md:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors border ${dataSaverMode ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 border-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 border-slate-200'}`} title="Modo Ahorro de Datos">
            <span>{dataSaverMode ? '🔋 Ahorro Activo' : '⚡ Normal'}</span>
          </button>
          <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${isOnline ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 border-blue-200' : 'bg-green-50 dark:bg-green-900/30 text-green-700 border-green-200'}`}>
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-blue-500' : 'bg-green-500 animate-pulse'}`}></span>
            {isOnline ? 'Sincronizado' : 'Modo Offline'}
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
            {isDarkMode ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <aside className={`absolute md:static top-0 left-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-20 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} overflow-y-auto`}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-full bg-yellow-400 flex items-center justify-center font-bold text-yellow-800">{student.name.charAt(0)}</div>
              <div>
                <p className="font-semibold text-sm dark:text-slate-200">{student.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{student.location}</p>
              </div>
            </div>
            <button onClick={handleResetCampus} className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 py-1.5 rounded-lg transition-colors border border-red-100 dark:border-red-900/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Reiniciar Campus
            </button>
          </div>
          <nav className="p-4 space-y-2">
            <button onClick={handleReturnToCampus} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left font-medium ${currentView === 'CAMPUS' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
              <span className="text-lg">🗺️</span> Mapa del Campus
            </button>
            {currentView === 'CLASSROOM' && (
              <>
                <button onClick={() => { setIsSidebarOpen(false); handleSmartDownload(); }} className="w-full flex items-center gap-3 px-3 py-2 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded-lg text-sm transition-colors text-left font-bold">
                  <span className="text-lg">💾</span> Preparar para la Vereda
                </button>
                <button onClick={() => { setIsSidebarOpen(false); handleStartSimulation(); }} className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg text-sm transition-colors text-left">
                  <span className="text-lg">⏱️</span> Iniciar Simulacro
                </button>
              </>
            )}
            <div className="pt-4 pb-2"><h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Acceso Rápido</h3></div>
            <button onClick={() => handleEnterSubject("Matemáticas")} className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg text-sm transition-colors text-left"><span className="text-lg">📐</span> Matemáticas</button>
            <button onClick={() => handleEnterSubject("Inglés")} className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg text-sm transition-colors text-left"><span className="text-lg">🇺🇸</span> Inglés</button>
            <button onClick={() => handleEnterSubject("Sociales y Ciudadanas")} className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg text-sm transition-colors text-left"><span className="text-lg">🏛️</span> Sociales</button>
          </nav>
        </aside>

        {isSidebarOpen && <div className="absolute inset-0 bg-black/20 z-10 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

        <AnimatePresence mode="wait">
          {currentView === 'CAMPUS' ? (
            <motion.div key="campus" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="flex-1 overflow-hidden flex flex-col">
              <CampusMap onSelectSubject={handleEnterSubject} onSelectTool={(tool) => { setCurrentView('CLASSROOM'); handleSendMessage(`Solicito: ${tool}`, true); }} student={student} userRole={userRole} onSwitchTrack={() => setCurrentView('CONSTRUCTOR_LAB')} />
            </motion.div>
          ) : currentView === 'SUBJECT_DASHBOARD' ? (
            <motion.div key="subject_dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="flex-1 overflow-hidden flex flex-col">
              <SubjectDashboard subject={activeSubject || "General"} grade={student.grade} onBack={handleReturnToCampus} onStartTool={handleStartModuleTool} />
            </motion.div>
          ) : (
            <motion.div key="classroom" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="flex-1 flex flex-col relative w-full">
              {simulationState.isActive && (
                <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between shadow-md z-10">
                  <span className="font-bold text-sm uppercase tracking-wider">Modo Examen Estricto</span>
                  <span className="text-sm">Pregunta {simulationState.currentQuestion} de {simulationState.totalQuestions}</span>
                </div>
              )}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 scroll-smooth">
                <div className="max-w-3xl mx-auto">
                  {currentMaterial && currentMaterial.resourceUrl && (
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl mb-6 shadow-sm border border-slate-200 dark:border-slate-700">
                      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                        {currentMaterial.toolId === 'audio' ? '🎧 Podcast de la Clase' : '📎 Recurso Adjunto'}
                      </h3>
                      {currentMaterial.toolId === 'audio' ? (
                        <audio
                          controls
                          className="w-full"
                          src={currentMaterial.resourceUrl}
                          onTimeUpdate={(e) => {
                            const currentTime = Math.floor(e.currentTarget.currentTime);
                            if (currentTime !== lastCheckedSecond.current) {
                              lastCheckedSecond.current = currentTime;
                              const points = INTERACTION_POINTS[currentMaterial.dbaCode];
                              if (points) {
                                const matchedPoint = points.find(p => p.timestamp === currentTime);
                                if (matchedPoint) {
                                  const uniqueKey = `${currentMaterial.dbaCode}_${currentTime}`;
                                  if (!hasTriggeredPoint[uniqueKey]) {
                                    setHasTriggeredPoint(prev => ({ ...prev, [uniqueKey]: true }));
                                    e.currentTarget.pause(); // Ping-Pong Híbrido
                                    const interactionMsg: Message = { id: generateUUID(), role: Role.MODEL, text: matchedPoint.prompt, timestamp: Date.now(), track: 'student' };
                                    setMessages(prev => [...prev, interactionMsg]);
                                  }
                                }
                              }
                            }
                          }}
                        >
                          Tu navegador no soporta el elemento de audio.
                        </audio>
                      ) : (
                        <a href={currentMaterial.resourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-2">
                          <span>Abrir recurso externo</span><span className="text-xl">↗️</span>
                        </a>
                      )}
                    </div>
                  )}
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => <ChatBubble key={msg.id} message={msg} onOptionSelect={(opt) => handleSendMessage(opt)} />)}
                  </AnimatePresence>
                  {isLoading && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start animate-pulse">
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
              <div className="absolute bottom-0 left-0 w-full bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-3 md:p-4 z-10">
                <div className="max-w-3xl mx-auto flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                    placeholder={isOnline ? `Pregunta algo al experto en ${activeSubject}...` : "Modo Offline: Solo lectura"}
                    maxLength={500}
                    className="flex-1 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
                    disabled={isLoading}
                  />
                  <button onClick={() => handleSendMessage(inputText)} disabled={isLoading || !inputText.trim()} className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:cursor-not-allowed transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;