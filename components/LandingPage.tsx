// src/components/LandingPage.tsx
import React from 'react';
import { motion } from 'motion/react';
import { APP_NAME } from '../config/constants';
import { useAuth } from './AuthProvider';

// ✅ MEJORA 1: Type safety para grados válidos (previene errores en runtime)
export type Grade = '8°' | '9°' | '10°' | '11°';

interface LandingPageProps {
  // ✅ MEJORA 2: Comentarios de trazabilidad para futuros mantenedores
  onStart: () => void;                    // → App.tsx: setUserRole('student')
  onTeacherAccess: () => void;            // → App.tsx: setUserRole('teacher')  
  onConstructorAccess: () => void;        // → App.tsx: setUserRole('builder') ✅ lowercase
  studentName: string;
  studentGrade: Grade;                    // ✅ Type-safe en lugar de string genérico
  onGradeChange: (grade: Grade) => void;  // ✅ Type-safe en lugar de string genérico
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  onStart, 
  onTeacherAccess, 
  onConstructorAccess, 
  studentName, 
  studentGrade, 
  onGradeChange 
}) => {
  const { user, signIn } = useAuth();

  const handleAction = async (action: () => void) => {
    if (!user) {
      await signIn();
      if (user) action(); // wait, user state might not be updated immediately. The user will have to click again if it doesn't navigate.
    } else {
      action();
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden flex flex-col items-center justify-center font-sans text-slate-100">
      
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen"></div>
        
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgNDBoNDBWMHoiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPg==')] opacity-50"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md text-blue-300 text-xs font-bold tracking-widest uppercase mb-6">
            ✨ Edú, Tu Tutor Personal IA
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-300 to-purple-400"
        >
          {APP_NAME}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-xl md:text-2xl text-slate-400 font-light max-w-2xl mb-8 leading-relaxed"
        >
          Bienvenid@, <span className="font-semibold text-white">{user ? user.displayName || studentName : studentName}</span>. 
          Tu ecosistema de aprendizaje impulsado por IA, diseñado para llevarte al siguiente nivel.
        </motion.p>


        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="mb-10 flex flex-col items-center gap-3"
        >
          <label htmlFor="grade-select" className="text-sm font-medium text-slate-400 uppercase tracking-wider">Selecciona tu grado</label>
          <select
            id="grade-select"
            value={studentGrade}
            onChange={(e) => onGradeChange(e.target.value as Grade)}
            className="bg-slate-800/80 border border-slate-700 text-white text-lg rounded-xl px-6 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none cursor-pointer hover:bg-slate-700/80 transition-colors text-center w-48"
            aria-label="Seleccionar grado escolar para personalizar contenido educativo"
          >
            <option value="8°">8° Grado</option>
            <option value="9°">9° Grado</option>
            <option value="10°">10° Grado</option>
            <option value="11°">11° Grado</option>
          </select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4"
        >
          {/* ✅ MEJORA 3: aria-label para accesibilidad en Track Estudiante */}
          <button
            onClick={() => handleAction(onStart)}
            aria-label="Acceder al Track Estudiante: Preparación para Pruebas Saber 11 con tutoría IA"
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-blue-600 rounded-full hover:bg-blue-500 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50 shadow-[0_0_40px_rgba(37,99,235,0.4)]"
          >
            <span className="sr-only">Track Estudiante</span>
            <span className="mr-3 text-lg tracking-wide uppercase" aria-hidden="true">Track Estudiante</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <div className="absolute inset-0 h-full w-full rounded-full bg-white/20 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
          </button>

          {/* ✅ MEJORA 3: aria-label para accesibilidad en Track Constructor */}
          <button
            onClick={() => handleAction(onConstructorAccess)}
            aria-label="Acceder al Track Constructor: Formación técnica para emprendedores con metodología Build with Purpose"
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-emerald-400 transition-all duration-300 bg-slate-800 border border-emerald-500/30 rounded-full hover:bg-slate-700 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.1)]"
          >
            <span className="sr-only">Track Constructor</span>
            <span className="mr-3 text-lg tracking-wide uppercase" aria-hidden="true">Track Constructor</span>
            <span className="text-2xl transition-transform duration-300 group-hover:rotate-12" aria-hidden="true">🛠️</span>
          </button>
        </motion.div>

        {/* Bottom features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-16 flex flex-col items-center gap-6"
        >
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-xs font-medium text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Offline-First
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-150"></span>
              Audio-First
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse delay-300"></span>
              IA Adaptativa
            </div>
          </div>
          
          {/* ✅ MEJORA 3: aria-label para acceso docente */}
          <button 
            onClick={() => handleAction(onTeacherAccess)}
            aria-label="Acceso exclusivo para docentes: Panel de administración de contenidos y seguimiento estudiantil"
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1 mt-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Acceso Docentes
          </button>
        </motion.div>

      </div>
    </div>
  );
};

export default LandingPage;