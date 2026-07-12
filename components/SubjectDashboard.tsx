// src/components/SubjectDashboard.tsx
import React, { useState } from 'react';
import { getModulesForSubject, NOTEBOOK_TOOLS } from '../config/constants';
import { SubjectModule, NotebookTool } from '../config/types';

interface SubjectDashboardProps {
  subject: string;
  grade: string;
  onBack: () => void;
  onStartTool: (module: SubjectModule, tool: NotebookTool) => void;
}

const SubjectDashboard: React.FC<SubjectDashboardProps> = ({ subject, grade, onBack, onStartTool }) => {
  const modules = getModulesForSubject(subject, grade);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(modules[0]?.id || null);

  // ✅ FILTRO: Solo herramientas MVP (Audio-First para Fase 1)
  // 🔄 Video es Fase 2: Google Vids integration (actualmente offline-unfriendly para zonas rurales)
  const availableTools = NOTEBOOK_TOOLS.filter(tool => 
    tool.id !== 'video'
  );

  const toggleModule = (id: string) => {
    setExpandedModuleId(prev => prev === id ? null : id);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 md:p-8 animate-fade-in transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onBack}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
            aria-label="Volver al Campus Virtual"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{subject}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Ruta de aprendizaje para {grade}</p>
          </div>
        </div>

        {/* Modules List */}
        <div className="space-y-4">
          {modules.map((mod, index) => {
            const isExpanded = expandedModuleId === mod.id;
            
            return (
              <div 
                key={mod.id} 
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all"
                role="region"
                aria-expanded={isExpanded}
              >
                {/* Module Header (Clickable) */}
                <button 
                  onClick={() => toggleModule(mod.id)}
                  className="w-full text-left p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                  aria-controls={`module-content-${mod.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      {/* ✅ NUEVO: Badge DBA para trazabilidad curricular MEN */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{mod.title}</h3>
                        <span 
                          className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded font-medium"
                          title={`Derecho Básico de Aprendizaje: ${mod.dbaCode}`}
                        >
                          DBA: {mod.dbaCode}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{mod.description}</p>
                    </div>
                  </div>
                  <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* NotebookLM Tools Grid (Expanded State) */}
                {isExpanded && (
                  <div 
                    id={`module-content-${mod.id}`}
                    className="p-6 pt-0 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50"
                  >
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 mt-4">Estudio Interactivo</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {/* ✅ FILTRO: Usar availableTools en lugar de NOTEBOOK_TOOLS completo */}
                      {availableTools.map(tool => (
                        <button
                          key={tool.id}
                          onClick={() => onStartTool(mod, tool)}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${tool.color} dark:bg-opacity-10 dark:border-opacity-20`}
                          aria-label={`Estudiar ${mod.title} con ${tool.label}`}
                        >
                          <span className="text-xl" aria-hidden="true">{tool.icon}</span>
                          <span className="text-sm font-medium text-left leading-tight">{tool.label}</span>
                        </button>
                      ))}
                    </div>
                    
                    {/* ✅ Hint Audio-First para claridad del usuario */}
                    <p className="text-[10px] text-slate-400 mt-3 italic">
                      💡 Contenido optimizado para conexiones rurales (Audio-First). Videos disponibles en Fase 2.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default SubjectDashboard;