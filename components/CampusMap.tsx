// src/components/CampusMap.tsx
import React from 'react';
import { UserRole, StudentProfile } from '../config/types';
import { motion } from 'motion/react';

interface CampusMapProps {
  onSelectSubject: (subject: string) => void;
  onSelectTool: (tool: string) => void;
  student: StudentProfile;
  userRole: UserRole; // ✅ NUEVO: Para segmentación Dual-Track
   // ✅ NUEVO: Navegación condicional a ConstructorLab
  onOpenRewards?: () => void;
  onStartGeneralChat?: () => void;
}

const CampusMap: React.FC<CampusMapProps> = ({ 
  onSelectSubject, 
  onSelectTool, 
  student, 
  userRole, 
    onOpenRewards,
  onStartGeneralChat
}) => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 md:p-8 animate-fade-in transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        
        {/* Welcome Banner with Gamification HUD */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">¡Bienvenid@ al Campus, {student.name}!</h2>
              <p className="text-blue-100 max-w-2xl text-sm md:text-base">
                Selecciona un bloque académico para entrar a clase. Recuerda que puedes usar las herramientas de la biblioteca para crear material de estudio offline.
              </p>
            </div>
            
            {/* Gamification HUD */}
            <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
              <div className="flex flex-col items-center px-3 border-r border-white/20">
                <span className="text-xs text-blue-200 uppercase font-bold tracking-wider">Nivel</span>
                <span className="text-2xl font-black">{student.level}</span>
              </div>
              <div 
                className="flex flex-col items-center px-3 border-r border-white/20 cursor-pointer hover:scale-105 transition-transform"
                onClick={onOpenRewards}
                title="Ir a la Tienda de Recompensas"
              >
                <span className="text-xs text-amber-200 uppercase font-bold tracking-wider flex items-center gap-1">Puntos <span className="text-sm">🏪</span></span>
                <span className="text-2xl font-black text-amber-400">{student.points || 0}</span>
              </div>
              <div className="flex flex-col items-center px-3">
                <span className="text-xs text-rose-200 uppercase font-bold tracking-wider">Racha</span>
                <span className="text-2xl font-black text-rose-400 flex items-center gap-1">
                  🔥 {student.streak || 0}
                </span>
              </div>
            </div>

            
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-400 opacity-10 rounded-full blur-2xl"></div>
        </motion.div>

        {/* BLOQUE A: NÚCLEO COMÚN */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-8 h-1 bg-blue-600 rounded-full"></span>
            Bloque A: Fundamentos Académicos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => onSelectSubject("Matemáticas")} 
              className="group bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 text-left"
              aria-label="Entrar al módulo de Matemáticas: Álgebra, Geometría, Cálculo"
              role="button"
            >
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">📐</div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Matemáticas</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Álgebra, Geometría, Cálculo</p>
            </button>
            <button 
              onClick={() => onSelectSubject("Humanidades y Lengua Castellana")} 
              className="group bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 text-left"
              aria-label="Entrar al módulo de Humanidades y Lengua Castellana: Lectura crítica, Literatura"
              role="button"
            >
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">📚</div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Lengua Castellana</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Lectura crítica, Literatura</p>
            </button>
            <button 
              onClick={() => onSelectSubject("Ciencias Sociales")} 
              className="group bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 text-left"
              aria-label="Entrar al módulo de Ciencias Sociales: Historia, Geografía, Constitución"
              role="button"
            >
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🏛️</div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Ciencias Sociales</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Historia, Geografía, Constitución</p>
            </button>
          </div>
        </div>

        {/* BLOQUE B: CIENCIAS NATURALES */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-8 h-1 bg-green-600 rounded-full"></span>
            Bloque B: Ciencias y Tecnología
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => onSelectSubject("Ciencias Naturales")} 
              className="group bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 text-left"
              aria-label="Entrar al módulo de Ciencias Naturales: Biología, Física, Química"
              role="button"
            >
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🧬</div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Ciencias Naturales</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Biología, Física, Química</p>
            </button>
            <button 
              onClick={() => onSelectSubject("Tecnología e Informática")} 
              className="group bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 text-left"
              aria-label="Entrar al módulo de Tecnología e Informática: Informática, Sistemas"
              role="button"
            >
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">💻</div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Tecnología</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Informática, Sistemas</p>
            </button>
            <button 
              onClick={() => onSelectSubject("Educación Física")} 
              className="group bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 text-left"
              aria-label="Entrar al módulo de Educación Física: Deportes, Recreación"
              role="button"
            >
              <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">⚽</div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Educación Física</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Deportes, Recreación</p>
            </button>
          </div>
        </div>

        {/* BLOQUE C: IDIOMAS */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-8 h-1 bg-violet-600 rounded-full"></span>
            Bloque C: Idiomas y Desarrollo Humano
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => onSelectSubject("Idioma Extranjero")} 
              className="group bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 text-left relative overflow-hidden"
              aria-label="Entrar al módulo de Idioma Extranjero: Inglés"
              role="button"
            >
               <div className="absolute top-0 right-0 bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-300 text-[10px] px-2 py-1 font-bold rounded-bl-lg">Más Popular</div>
              <div className="w-12 h-12 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🇺</div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Inglés</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Idioma Extranjero</p>
            </button>
            <button 
              onClick={() => onSelectSubject("Educación Ética y Valores")} 
              className="group bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 text-left"
              aria-label="Entrar al módulo de Educación Ética y Valores: Desarrollo Humano"
              role="button"
            >
              <div className="w-12 h-12 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🤝</div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Ética y Valores</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Desarrollo Humano</p>
            </button>
            <button 
              onClick={() => onSelectSubject("Educación Artística")} 
              className="group bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 text-left"
              aria-label="Entrar al módulo de Educación Artística"
              role="button"
            >
              <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🎨</div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Artes</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Educación Artística</p>
            </button>
          </div>
        </div>

        {/* BLOQUE D: HABILIDADES PARA LA VIDA */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-8 h-1 bg-emerald-600 rounded-full"></span>
            Bloque D: Habilidades para la Vida
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => onSelectSubject("Habilidades para la Vida")} 
              className="group bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 text-left"
              aria-label="Entrar a Habilidades para la Vida: finanzas, emprendimiento, comunicación y digital"
            >
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🌱</div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Habilidades para la Vida</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Finanzas, emprendimiento, comunicación, digital · Con certificado</p>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* ZONA DE ENTRENAMIENTO */}
            <div>
                 <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-8 h-1 bg-slate-800 rounded-full"></span>
                    Coliseo de Pruebas
                </h3>
                <button 
                  onClick={() => onSelectSubject("Simulacro General ICFES")} 
                  className="w-full group bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-left flex items-center justify-between"
                  aria-label="Iniciar Simulacro General ICFES: Modo examen cronometrado"
                  role="button"
                >
                    <div>
                        <h4 className="font-bold text-white text-xl">Simulacro Total ICFES</h4>
                        <p className="text-xs text-slate-400 mt-1">Modo examen cronometrado</p>
                    </div>
                    <div className="text-4xl group-hover:scale-110 transition-transform">⏱️</div>
                </button>
            </div>

            {/* BIBLIOTECA / HERRAMIENTAS */}
            <div>
                 <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-8 h-1 bg-orange-500 rounded-full"></span>
                    Biblioteca Digital
                </h3>
                 <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => onSelectTool("Generar Guía PDF")} 
                      className="bg-white p-4 rounded-lg border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-center"
                      aria-label="Herramienta Biblioteca: Generar Guía PDF para estudio offline"
                      role="button"
                    >
                        <div className="text-2xl mb-1">📄</div>
                        <span className="text-xs font-bold text-slate-700">Crear PDF</span>
                    </button>
                    <button 
                      onClick={() => onSelectTool("Crear Taller Práctico")} 
                      className="bg-white p-4 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-colors text-center"
                      aria-label="Herramienta Biblioteca: Crear Taller Práctico interactivo"
                      role="button"
                    >
                        <div className="text-2xl mb-1">✍️</div>
                        <span className="text-xs font-bold text-slate-700">Taller</span>
                    </button>
                    <button 
                      onClick={() => onSelectTool("Recursos Regionales")} 
                      className="bg-white p-4 rounded-lg border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-colors text-center"
                      aria-label="Herramienta Biblioteca: Acceder a Recursos Regionales contextualizados"
                      role="button"
                    >
                        <div className="text-2xl mb-1">🌱</div>
                        <span className="text-xs font-bold text-slate-700">Recursos de mi Región</span>
                    </button>
                 </div>
            </div>
        </div>

        {/* ✅ ACTUALIZADO: Versión v3.0 Dual-Track */}
        <div className="text-center mt-12 mb-8">
            <p className="text-xs text-slate-400">Eduglobal365 v6.0 • Campus Virtual Inteligente • Dual-Track Architecture</p>
        </div>

      </div>

      {/* FLOATING ACTION BUTTON: Chat con Edú */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        onClick={() => {
          if (onStartGeneralChat) {
            onStartGeneralChat();
          } else {
            onSelectSubject("Tutor Edú");
          }
        }}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 md:p-5 shadow-2xl hover:shadow-blue-500/50 transition-all hover:scale-110 flex items-center justify-center group z-50 border-4 border-white dark:border-slate-800"
        aria-label="Hablar con Tutor Edú"
      >
        <span className="text-3xl md:text-4xl">🤖</span>
        <div className="absolute right-full mr-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-bold px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none border border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <span>Hola, ¿como estas?. Edu esta aca para escucharte y ayudarte en lo q necesites</span>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
          </span>
        </div>
      </motion.button>
    </div>
  );
};

export default CampusMap;