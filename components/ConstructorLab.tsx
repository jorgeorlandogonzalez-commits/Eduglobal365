// src/components/ConstructorLab.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BuilderProject, BuilderProfile } from '../config/types';
import { StorageService } from '../services/storageService';
import { FirestoreService } from '../services/firestoreService';
import { getBuilderResources } from '../config/constants';

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

interface ConstructorLabProps {
  onStartProject: (project: BuilderProject) => void;
  onReturn: () => void;
}

const ConstructorLab: React.FC<ConstructorLabProps> = ({ onStartProject, onReturn }) => {
  const [profile, setProfile] = useState<BuilderProfile | null>(null);
  const [projects, setProjects] = useState<BuilderProject[]>([]);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null); // ✅ AGREGADO: Soporte para edición
  const [newProject, setNewProject] = useState({ title: '', description: '', impactMetric: '' });

  useEffect(() => {
    const loadedProfile = StorageService.loadBuilderProfile() || {
      name: 'Constructor',
      focusArea: 'Desarrollo Web',
      level: 1,
      projectsCompleted: 0
    };
    setProfile(loadedProfile);
    setProjects(StorageService.getBuilderProjects());
  }, []);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    
    const project: BuilderProject = {
      id: editingProjectId || generateUUID(), // ✅ CORREGIDO: crypto.randomUUID() para IDs únicos
      title: newProject.title,
      description: newProject.description,
      status: editingProjectId ? projects.find(p => p.id === editingProjectId)?.status || 'IDEA' : 'IDEA',
      techStack: ['React', 'Vite', 'Tailwind'],
      impactMetric: newProject.impactMetric,
      offlineCapable: true,  // ✅ AGREGADO: MVP - todos los proyectos son offline-first por diseño
      linkedSubjectId: undefined,  // ✅ AGREGADO: Habilita Cross-Track Synergy (vincular a módulo educativo)
      createdAt: editingProjectId ? projects.find(p => p.id === editingProjectId)?.createdAt || Date.now() : Date.now(),
      updatedAt: Date.now()
    };

    if (editingProjectId) {
      // Actualizar proyecto existente
      const updatedProjects = projects.map(p => p.id === editingProjectId ? project : p);
      setProjects(updatedProjects);
      FirestoreService.saveBuilderProject(project);
      setEditingProjectId(null);
    } else {
      // Crear nuevo proyecto
      FirestoreService.saveBuilderProject(project);
      setProjects([...projects, project]);
    }
    
    setShowNewProjectModal(false);
    setNewProject({ title: '', description: '', impactMetric: '' });
  };

  const handleEditProject = (project: BuilderProject) => {
    setEditingProjectId(project.id);
    setNewProject({
      title: project.title,
      description: project.description,
      impactMetric: project.impactMetric
    });
    setShowNewProjectModal(true);
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('¿Estás seguro de eliminar este proyecto?')) {
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      // TODO: Implement actual delete in FirestoreService. For now update local state
      const allProjects = projects.filter(p => p.id !== projectId);
    try {
      localStorage.setItem('eduglobal_builder_projects', JSON.stringify(allProjects));
    } catch (e) {
      console.warn('localStorage not accessible for project save');
    }
    }
  };

  // ✅ AGREGADO: Función para guardar cambios en el perfil (preventivo para Fase 2)
  const saveProfile = (updatedProfile: BuilderProfile) => {
    FirestoreService.saveBuilderProfile(updatedProfile);
    setProfile(updatedProfile);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-8">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={onReturn}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Volver al Inicio
        </button>

        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-white mb-2">Constructor Lab 🛠️</h1>
            <p className="text-slate-400">Metodología "Build with Purpose" - Impacto Social</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Nivel {profile?.level}</p>
            <p className="font-bold text-emerald-400">{profile?.focusArea}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Proyectos */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Mis Proyectos</h2>
              <button 
                onClick={() => {
                  setEditingProjectId(null);
                  setNewProject({ title: '', description: '', impactMetric: '' });
                  setShowNewProjectModal(true);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold transition-colors"
              >
                + Nuevo Proyecto
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.length === 0 ? (
                <div className="col-span-2 bg-slate-800 p-8 rounded-xl border border-slate-700 text-center">
                  <p className="text-slate-400 mb-4">Aún no tienes proyectos. ¡Empieza a construir con propósito!</p>
                </div>
              ) : (
                projects.map(project => (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    key={project.id} 
                    className="bg-slate-800 p-6 rounded-xl border border-slate-700 cursor-pointer group"
                    onClick={() => onStartProject(project)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg text-white">{project.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        project.status === 'IDEA' ? 'bg-slate-700 text-slate-300' :
                        project.status === 'IN_PROGRESS' ? 'bg-blue-900/50 text-blue-300' :
                        'bg-emerald-900/50 text-emerald-300'
                      }`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.techStack.map(tech => (
                        <span key={tech} className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Métrica: {project.impactMetric}</span>
                      {project.offlineCapable && (
                        <span className="flex items-center gap-1 text-emerald-400" title="Funciona sin internet">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          Offline
                        </span>
                      )}
                    </div>
                    
                    {/* Visual Business Canvas Progress */}
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <div className="flex justify-between items-center mb-1 text-xs font-medium text-slate-400">
                        <span>Progreso del Canvas</span>
                        <span className="text-emerald-400">
                          {project.status === 'IDEA' ? '25%' : project.status === 'IN_PROGRESS' ? '65%' : '100%'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${project.status === 'IDEA' ? 'bg-amber-400 w-1/4' : project.status === 'IN_PROGRESS' ? 'bg-blue-400 w-2/3' : 'bg-emerald-400 w-full'}`}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                        <span className={project.status !== 'COMPLETED' ? 'text-amber-400/70' : ''}>Ideación</span>
                        <span className={project.status === 'IN_PROGRESS' || project.status === 'COMPLETED' ? 'text-blue-400/70' : ''}>Desarrollo</span>
                        <span className={project.status === 'COMPLETED' ? 'text-emerald-400/70' : ''}>Lanzamiento</span>
                      </div>
                    </div>
                    
                    {/* Botones de acción (visibles al hover) */}
                    <div className="mt-4 pt-4 border-t border-slate-700 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEditProject(project); }}
                        className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-slate-700"
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }}
                        className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-slate-700"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Recursos */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Recursos Técnicos</h2>
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              {getBuilderResources().map((res, idx) => (
                <a 
                  key={res.id} 
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block p-4 hover:bg-slate-700 transition-colors ${idx !== 0 ? 'border-t border-slate-700' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-200">{res.title}</h4>
                      <span className="text-xs text-slate-400">{res.type}</span>
                    </div>
                    <span className="text-slate-500">↗</span>
                  </div>
                </a>
              ))}
            </div>
            
            {/* Cross-Track Synergy Hint */}
            <div className="mt-6 bg-emerald-900/20 border border-emerald-800 rounded-xl p-4">
              <h3 className="font-bold text-emerald-400 text-sm mb-2">💡 Cross-Track Synergy</h3>
              <p className="text-xs text-slate-400">
                ¿Tienes un proyecto que puede ayudar a estudiantes? Vincúlalo a un módulo educativo y genera impacto real.
              </p>
              <button className="mt-3 text-xs text-emerald-300 hover:text-emerald-200 font-medium">
                Explorar módulos educativos →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nuevo/Editar Proyecto */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingProjectId ? 'Editar Proyecto' : 'Nuevo Proyecto'}
            </h2>
            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-1">Título del Proyecto</label>
                <input 
                  required
                  type="text" 
                  value={newProject.title}
                  onChange={e => setNewProject({...newProject, title: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  placeholder="Ej: App educativa para caficultores"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-1">Descripción y Propósito</label>
                <textarea 
                  required
                  value={newProject.description}
                  onChange={e => setNewProject({...newProject, description: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none h-24"
                  placeholder="¿Qué problema resuelve y para quién?"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-1">Métrica de Impacto</label>
                <input 
                  required
                  type="text" 
                  value={newProject.impactMetric}
                  onChange={e => setNewProject({...newProject, impactMetric: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  placeholder="Ej: 500 estudiantes beneficiados, 30% reducción de costos"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button 
                  type="button"
                  onClick={() => {
                    setShowNewProjectModal(false);
                    setEditingProjectId(null);
                    setNewProject({ title: '', description: '', impactMetric: '' });
                  }}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold transition-colors"
                >
                  {editingProjectId ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstructorLab;