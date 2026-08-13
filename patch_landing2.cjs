const fs = require('fs');

const code = `// src/components/LandingPage.tsx
import React, { useState } from 'react';
import { motion } from 'motion/react';

export type Grade = '8°' | '9°' | '10°' | '11°';

interface LandingPageProps {
  onStart: () => void;
  onTeacherAccess: () => void;
  onConstructorAccess: () => void;
  studentName: string;
  studentGrade: Grade;
  onGradeChange: (grade: Grade) => void;
}

const PRICING = { monthly: 49900, annual: 499000 };
const formatCOP = (v: number) => \`$\${v.toLocaleString('es-CO')}\`;

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onTeacherAccess, onConstructorAccess, studentName, studentGrade, onGradeChange }) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedData, setAcceptedData] = useState(false);
  const [isMinor, setIsMinor] = useState(false);
  const [hasAdultConsent, setHasAdultConsent] = useState(false);

  const canProceed = acceptedTerms && acceptedData && (!isMinor || hasAdultConsent);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const handleStart = () => {
    if (!canProceed) return;
    try {
      localStorage.setItem('eduglobal_legal_accepted', 'true');
      localStorage.setItem('eduglobal_legal_date', new Date().toISOString());
    } catch (e) { console.warn('No se pudo guardar consentimiento'); }
    onStart();
  };

  const features = [
    { icon: '📴', title: '100% Offline-First', desc: 'Estudia sin señal: tu progreso y la IA viven en tu celular (IndexedDB + WebGPU).' },
    { icon: '🤖', title: 'IA Tutora Local (Gemma 2B)', desc: 'Método socrático tipo Khanmigo, sin consumir datos ni depender de la nube.' },
    { icon: '🎯', title: 'Alineado al MEN (DBA)', desc: 'Cada reto y quiz cita el Derecho Básico de Aprendizaje oficial. Trazabilidad para el ICFES.' },
    { icon: '🎧', title: 'Audio-First Ping-Pong', desc: 'Podcasts que se pausan solos para lanzarte retos. Aprender escuchando, como NotebookLM.' },
    { icon: '📤', title: 'Comparte por USB/Bluetooth', desc: 'Exporta tu progreso en JSON y pásalo a un compañero de vereda sin internet.' },
    { icon: '🛠️', title: 'Track Constructor', desc: 'Si programas o emprendes, adopta módulos educativos y construye soluciones reales.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-y-auto">

      {/* NAV */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <span className="font-black text-lg tracking-tight">EduGlobal<span className="text-blue-400">365</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <button onClick={() => scrollTo('planes')} className="hover:text-white">Planes</button>
            <button onClick={() => scrollTo('funciones')} className="hover:text-white">Funciones</button>
            <button onClick={() => scrollTo('tracks')} className="hover:text-white">Tracks</button>
            <button onClick={onTeacherAccess} className="hover:text-white">Soy Docente</button>
            <button onClick={onConstructorAccess} className="hover:text-white">Soy Constructor</button>
          </nav>
          <button onClick={() => scrollTo('planes')} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-full text-sm font-bold transition-colors">Empezar</button>
        </div>
      </header>

      {/* BANNER EMERGENCIA */}
      <div className="bg-amber-500/10 border-b border-amber-500/30">
        <p className="max-w-6xl mx-auto px-4 py-2 text-xs text-amber-300 text-center">
          🇨🇴 <strong>Contexto actual:</strong> Colombia atraviesa una emergencia por terremoto. Los jóvenes de zonas afectadas pueden aplicar al <strong>Plan Solidaridad ($0)</strong> financiado por subsidio cruzado.
        </p>
      </div>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-block px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-bold tracking-widest uppercase mb-6">
            Hecho para Colombia · Modelo SAS BIC
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
            El tutor de bolsillo que<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-300 to-purple-400">nunca te deja sin estudiar</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
            IA tutora alineada al currículo oficial del MEN (DBA) que funciona <strong className="text-slate-200">sin internet</strong> en tu celular. Prepárate para el ICFES aunque tu vereda no tenga señal.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <label className="text-sm text-slate-400">Estoy en:</label>
            <select
              value={studentGrade}
              onChange={(e) => onGradeChange(e.target.value as Grade)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="8°">8° Grado</option>
              <option value="9°">9° Grado</option>
              <option value="10°">10° Grado</option>
              <option value="11°">11° Grado</option>
            </select>
            <button onClick={() => scrollTo('planes')} className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-900/50 transition-all hover:scale-105">
              Ver planes desde {formatCOP(PRICING.monthly)}/mes
            </button>
          </div>
          <p className="text-xs text-slate-500">Bienvenid@, {studentName}. Tu campus te espera.</p>
        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14">
          {[
            ['100%', 'Funciona sin internet'],
            ['45+', 'Puntos de interacción en audio'],
            ['5', 'Materias con DBA oficiales'],
            ['2B', 'IA local Gemma en tu GPU'],
          ].map(([n, l]) => (
            <div key={l} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-2xl font-black text-blue-400">{n}</p>
              <p className="text-xs text-slate-400 mt-1">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRECIOS */}
      <section id="planes" className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-3">Un solo plan. Todo incluido.</h2>
        <p className="text-slate-400 text-center mb-10">Bachillerato completo (8°–11°), preparación ICFES e Idiomas.</p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-700 bg-slate-900 p-8 flex flex-col">
            <h3 className="font-bold text-lg mb-2">Mensual</h3>
            <p className="text-4xl font-black mb-1">{formatCOP(PRICING.monthly)}<span className="text-base font-medium text-slate-400">/mes</span></p>
            <p className="text-xs text-slate-400 mb-6">COP, IVA incluido. Sin permanencia.</p>
            <ul className="space-y-2 text-sm text-slate-300 mb-8">
              <li>✅ Todas las materias + simulacros ICFES</li>
              <li>✅ IA tutora offline ilimitada</li>
              <li>✅ Podcasts y paquetes "Para la Vereda"</li>
              <li>✅ Progreso sincronizable en la nube</li>
            </ul>
            <button onClick={() => scrollTo('consent')} className="mt-auto border border-blue-500 text-blue-300 rounded-full py-3 font-bold hover:bg-blue-500/10 transition-colors">Elegir Mensual</button>
          </div>
          <div className="relative rounded-2xl border-2 border-blue-500 bg-gradient-to-b from-blue-950/60 to-slate-900 p-8 flex flex-col shadow-2xl shadow-blue-900/40">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">2 MESES GRATIS</span>
            <h3 className="font-bold text-lg mb-2">Anual</h3>
            <p className="text-4xl font-black mb-1">{formatCOP(PRICING.annual)}<span className="text-base font-medium text-slate-400">/año</span></p>
            <p className="text-xs text-slate-400 mb-6">Pagas 10 meses, estudias 12. Ahorra {formatCOP(99800)}.</p>
            <ul className="space-y-2 text-sm text-slate-300 mb-8">
              <li>✅ Todo lo del plan Mensual</li>
              <li>✅ Precio congelado todo el año</li>
              <li>✅ Prioridad en nuevas funciones</li>
              <li>💙 Financias 1 beca Solidaridad</li>
            </ul>
            <button onClick={() => scrollTo('consent')} className="mt-auto bg-blue-600 hover:bg-blue-500 rounded-full py-3 font-bold transition-colors">Elegir Anual</button>
          </div>
        </div>
        <p className="text-center text-xs text-slate-500 mt-6">💙 Plan Solidaridad: acceso gratuito para jóvenes afectados por la emergencia, financiado por subsidio cruzado de nuestra comunidad SAS BIC.</p>
      </section>

      {/* FUNCIONES */}
      <section id="funciones" className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-black text-center mb-10">Tecnología de punta para la vereda</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-blue-500/50 transition-colors">
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-bold mt-3 mb-1">{f.title}</h3>
              <p className="text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRACKS */}
      <section id="tracks" className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-black text-center mb-10">Un ecosistema, tres caminos</h2>
        <div className="grid md:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-blue-500/40 bg-blue-950/30 p-6">
            <span className="text-3xl">🎓</span>
            <h3 className="font-bold mt-3 mb-1">Track Estudiante</h3>
            <p className="text-sm text-slate-400 mb-4">Valida tu bachillerato y domina el ICFES con retos de tu región.</p>
            <button onClick={() => scrollTo('consent')} className="w-full bg-blue-600 hover:bg-blue-500 rounded-full py-2.5 text-sm font-bold">Comenzar a estudiar</button>
          </div>
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-6">
            <span className="text-3xl">🛠️</span>
            <h3 className="font-bold mt-3 mb-1">Track Constructor</h3>
            <p className="text-sm text-slate-400 mb-4">Emprende y adopta módulos educativos con impacto social medible.</p>
            <button onClick={onConstructorAccess} className="w-full border border-emerald-500 text-emerald-300 hover:bg-emerald-500/10 rounded-full py-2.5 text-sm font-bold">Entrar al Lab</button>
          </div>
          <div className="rounded-2xl border border-purple-500/40 bg-purple-950/30 p-6">
            <span className="text-3xl">👨🏫</span>
            <h3 className="font-bold mt-3 mb-1">Track Docente</h3>
            <p className="text-sm text-slate-400 mb-4">Genera Audio Overviews y quizzes alineados a DBA con un clic.</p>
            <button onClick={onTeacherAccess} className="w-full border border-purple-500 text-purple-300 hover:bg-purple-500/10 rounded-full py-2.5 text-sm font-bold">Portal Docente</button>
          </div>
        </div>
      </section>

      {/* CONSENTIMIENTO + CTA FINAL */}
      <section id="consent" className="max-w-2xl mx-auto px-4 py-16">
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-8">
          <h2 className="text-2xl font-black mb-2">Crea tu cuenta de estudio</h2>
          <p className="text-sm text-slate-400 mb-6">
            Al continuar aceptas nuestros{' '}
            <a href="/legal/terms.html" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Términos y Condiciones</a>{' '}
            (incluyen precios y Plan Solidaridad) y la Política de Datos (Ley 1581 de 2012).
          </p>
          <div className="space-y-3 text-sm">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-800" />
              <span>Acepto los Términos y Condiciones y el modelo de precios (Mensual {formatCOP(PRICING.monthly)} / Anual {formatCOP(PRICING.annual)}).</span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={acceptedData} onChange={(e) => setAcceptedData(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-800" />
              <span>Autorizo el tratamiento de mis datos educativos (Ley 1581 de 2012).</span>
            </label>
            <div className="bg-slate-950/60 rounded-lg p-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={isMinor} onChange={(e) => { setIsMinor(e.target.checked); if (!e.target.checked) setHasAdultConsent(false); }} className="mt-1 h-4 w-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500 bg-slate-800" />
                <span>Soy menor de 14 años (Ley 1098 de 2006).</span>
              </label>
              {isMinor && (
                <label className="flex items-start gap-3 cursor-pointer mt-3 ml-6">
                  <input type="checkbox" checked={hasAdultConsent} onChange={(e) => setHasAdultConsent(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-600 text-green-600 focus:ring-green-500 bg-slate-800" />
                  <span>Cuento con autorización de mi padre, madre o acudiente.</span>
                </label>
              )}
            </div>
          </div>
          <button
            onClick={handleStart}
            disabled={!canProceed}
            className={\`w-full mt-6 rounded-full py-4 font-black text-lg transition-all \${canProceed ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/50 hover:scale-[1.02]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}\`}
          >
            Entrar al Campus →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 EduGlobal365 SAS BIC — Educación de élite para todos los colombianos.</p>
          <div className="flex gap-4">
            <a href="/legal/terms.html" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 underline">Términos y Condiciones</a>
            <button onClick={onTeacherAccess} className="hover:text-slate-300">Docentes</button>
            <button onClick={onConstructorAccess} className="hover:text-slate-300">Constructores</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
`;

fs.writeFileSync('components/LandingPage.tsx', code);
