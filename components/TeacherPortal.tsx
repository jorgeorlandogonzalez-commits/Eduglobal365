// src/components/TeacherPortal.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CourseMaterial } from '../config/types';
import { StorageService } from '../services/storageService';
import { getModulesForSubject, NOTEBOOK_TOOLS } from '../config/constants';
import { autoGenerateMaterial } from '../services/geminiService';

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

interface TeacherPortalProps {
  onReturn: () => void;
}

const TeacherPortal: React.FC<TeacherPortalProps> = ({ onReturn }) => {
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form State
  const [grade, setGrade] = useState('11°');
  const [subject, setSubject] = useState('Matemáticas');
  const [moduleId, setModuleId] = useState('');
  const [toolId, setToolId] = useState('audio');
  const [textContent, setTextContent] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');

  // Derived state
  const availableModules = getModulesForSubject(subject, grade);

  // AI Content Generator States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationIdea, setGenerationIdea] = useState('');
  const [generationSuccess, setGenerationSuccess] = useState<string | null>(null);

  const handleAutoGenerate = async () => {
    if (!moduleId) return;
    setIsGenerating(true);
    setGenerationSuccess(null);
    
    const selectedModule = availableModules.find(m => m.id === moduleId);
    const moduleTitle = selectedModule ? selectedModule.title : 'Módulo General';

    try {
      const result = await autoGenerateMaterial(grade, subject, moduleTitle, toolId, generationIdea);
      setTextContent(result.textContent);
      setResourceUrl(result.resourceUrl);
      setGenerationSuccess(`¡Éxito! Clase auto-generada y alineada con el DBA: ${result.dbaCode}`);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setGenerationSuccess(null), 5000);
    } catch (error) {
      console.error("Auto generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Auto-select first module when subject/grade changes
  useEffect(() => {
    if (availableModules.length > 0) {
      setModuleId(availableModules[0].id);
    }
  }, [subject, grade]);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = () => {
    setMaterials(StorageService.getCourseMaterials());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleId || (!textContent.trim() && !resourceUrl.trim())) return;

    setIsUploading(true);
    const selectedModule = availableModules.find(m => m.id === moduleId);
    const topicName = selectedModule ? selectedModule.title : 'Módulo General';

    // Simulate network delay for upload
    setTimeout(() => {
      // ✅ CORREGIDO: CourseMaterial con todos los campos requeridos por types.ts
      const newMaterial: CourseMaterial = {
        id: generateUUID(),  // ✅ IDs únicos globales (no Date.now())
        grade,
        subject,
        moduleId,
        toolId,
        topic: topicName,
        textContent,
        resourceUrl,
        hasAudio: toolId === 'audio', // Keep for backward compatibility
        timestamp: Date.now(),
        dbaCode: selectedModule?.dbaCode || `${subject.substring(0, 3).toUpperCase()}-GEN-DBA-01`  // ✅ CRÍTICO: Alineación MEN
      };

      StorageService.saveCourseMaterial(newMaterial);
      loadMaterials();
      
      // Reset form
      setTextContent('');
      setResourceUrl('');
      setIsUploading(false);
    }, 1500);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este material?')) {
      StorageService.deleteCourseMaterial(id);
      loadMaterials();
    }
  };

  // ✅ FILTRO: Mostrar solo herramientas MVP (Audio-First para Fase 1)
  const availableTools = NOTEBOOK_TOOLS.filter(tool => 
    tool.id !== 'video' // 🔄 Video es Fase 2: Google Vids integration
  );

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Header */}
      <header className="bg-indigo-900 text-white px-6 py-4 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-800 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-xl leading-none">Centro de Control AI - Agentes Docentes</h1>
            <p className="text-indigo-300 text-xs mt-1">Fábrica de Currículos Autónomos (MEN)</p>
          </div>
        </div>
        <button 
          onClick={onReturn}
          className="flex items-center gap-2 text-sm font-medium bg-indigo-800 hover:bg-indigo-700 px-4 py-2 rounded-full transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a la App
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Upload Form */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Analíticas Híbridas (NUEVO) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl shadow-lg border border-indigo-700 p-6 text-white"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span> Panel de Analíticas Híbridas
              </h2>
              <p className="text-indigo-200 text-sm mb-6">
                Datos sincronizados de estudiantes en zonas rurales (Modo Offline-First). La última sincronización fue hace 2 horas.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <div className="text-indigo-200 text-xs font-bold uppercase mb-1">Estudiantes Activos</div>
                  <div className="text-3xl font-black">42</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <div className="text-green-300 text-xs font-bold uppercase mb-1">En Racha 🔥</div>
                  <div className="text-3xl font-black text-green-400">18</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <div className="text-amber-200 text-xs font-bold uppercase mb-1">Alertas (Refuerzo)</div>
                  <div className="text-3xl font-black text-amber-400">3</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <div className="text-purple-200 text-xs font-bold uppercase mb-1">Puntos XP Totales</div>
                  <div className="text-3xl font-black text-purple-300">14.5K</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6"
            >
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                Fábrica Autónoma de Clases (Agente Gemini)
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                No necesitas conocimientos técnicos. Selecciona la materia y el grado, y nuestro Agente AI generará automáticamente los recursos alineados con los Derechos Básicos de Aprendizaje (DBA) del MEN.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Grado</label>
                    <select 
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="8°">8° Grado</option>
                      <option value="9°">9° Grado</option>
                      <option value="10°">10° Grado</option>
                      <option value="11°">11° Grado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Materia</label>
                    <select 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="Matemáticas">Matemáticas</option>
                      <option value="Humanidades y Lengua Castellana">Humanidades y Lengua Castellana</option>
                      <option value="Ciencias Naturales">Ciencias Naturales</option>
                      <option value="Ciencias Sociales">Ciencias Sociales</option>
                      <option value="Idioma Extranjero">Idioma Extranjero</option>
                      <option value="Tecnología e Informática">Tecnología e Informática</option>
                      <option value="Educación Ética y Valores">Educación Ética y Valores</option>
                      <option value="Educación Artística">Educación Artística</option>
                      <option value="Educación Física">Educación Física</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Módulo</label>
                    <select 
                      value={moduleId}
                      onChange={(e) => setModuleId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    >
                      {availableModules.map(mod => (
                        <option key={mod.id} value={mod.id}>{mod.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Herramienta NotebookLM</label>
                    <select 
                      value={toolId}
                      onChange={(e) => setToolId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {/* ✅ FILTRO: Solo herramientas MVP (Audio-First) */}
                      {availableTools.map(tool => (
                        <option key={tool.id} value={tool.id}>{tool.icon} {tool.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Resource URL (for audio/video) */}
                {(toolId === 'audio' || toolId === 'presentacion') && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">URL del Recurso (Audio/Presentación)</label>
                    <input 
                      type="url" 
                      value={resourceUrl}
                      onChange={(e) => setResourceUrl(e.target.value)}
                      placeholder="https://ejemplo.com/recurso.mp3"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-text"
                    />
                  </div>
                )}

                {/* 🪄 AGENTE VIRTUAL DE AUTO-GENERACIÓN CURRICULAR (MEN) */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-xl p-5 my-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🧠</span>
                    <div>
                      <h3 className="font-bold text-indigo-900 dark:text-indigo-300 text-base">
                        Agente AI: Creador de Contenidos MEN
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Genera automáticamente la teoría, retos regionales y estructura de la clase basándose en el DBA oficial.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1">
                        Contexto Regional o Enfoque Específico (Opcional)
                      </label>
                      <input 
                        type="text"
                        value={generationIdea}
                        onChange={(e) => setGenerationIdea(e.target.value)}
                        placeholder="Ej: Suma de fracciones usando recolección de café en el Eje Cafetero..."
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none cursor-text"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                      <button 
                        type="button"
                        onClick={handleAutoGenerate}
                        disabled={isGenerating || !moduleId}
                        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white transition-all ${
                          isGenerating || !moduleId 
                            ? 'bg-indigo-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md hover:shadow-lg'
                        }`}
                      >
                        {isGenerating ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Construyendo Módulo Educativo...
                          </>
                        ) : (
                          <>
                            <span>⚡</span> Generar Currículo con Agente AI
                          </>
                        )}
                      </button>

                      {generationSuccess && (
                        <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-pulse">
                          <span>✅</span> {generationSuccess}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {textContent && (
                  <div className="animate-in fade-in slide-in-from-bottom-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                      <span className="text-indigo-500">📄</span> Vista Previa del Contenido Generado (Contexto RAG)
                    </label>
                    <textarea 
                      value={textContent}
                      readOnly
                      rows={6}
                      className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none font-mono text-sm opacity-80"
                    ></textarea>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button 
                    type="submit"
                    disabled={isUploading || !moduleId || (!textContent.trim() && !resourceUrl.trim())}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-all ${isUploading || !moduleId || (!textContent.trim() && !resourceUrl.trim()) ? 'bg-emerald-300 dark:bg-emerald-900/50 cursor-not-allowed text-emerald-100' : 'bg-emerald-600 hover:bg-emerald-500 shadow-lg hover:shadow-xl'}`}
                  >
                    {isUploading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Desplegando...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Aprobar y Desplegar en Campus Virtual
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Uploaded Materials List */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 h-full"
            >
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Materiales Activos
              </h2>

              {materials.length === 0 ? (
                <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-sm">No hay materiales subidos aún.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {materials.map((mat) => (
                    <div key={mat.id} className="p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 group">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                          {mat.subject}
                        </span>
                        <button 
                          onClick={() => handleDelete(mat.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          title="Eliminar material"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200 leading-tight mb-2">{mat.topic}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          {mat.grade}
                        </span>
                        {/* ✅ NUEVO: Mostrar DBA para trazabilidad curricular */}
                        <span className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded" title="Derecho Básico de Aprendizaje">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          DBA: {mat.dbaCode}
                        </span>
                        {mat.toolId && (
                          <span className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                            {availableTools.find(t => t.id === mat.toolId)?.icon || '📄'} {availableTools.find(t => t.id === mat.toolId)?.label || mat.toolId}
                          </span>
                        )}
                        {mat.resourceUrl && (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            Link
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TeacherPortal;