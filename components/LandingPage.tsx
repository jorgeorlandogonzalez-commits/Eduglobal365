import React, { useState } from 'react';
export type Grade = '8°' | '9°' | '10°' | '11°';
import { motion } from 'motion/react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../config/firebase';

interface LandingPageProps {
  onStart: () => void;
  studentName: string;
  studentGrade: Grade;
  onGradeChange: (g: Grade) => void;
  onTeacherAccess: () => void;
    onProfileUpdate?: (name: string, grade: Grade) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onStart,
  studentName,
  studentGrade,
  onGradeChange,
  onTeacherAccess,
    onProfileUpdate
}) => {
  const [gmailUser, setGmailUser] = useState<string>('');
  const [showStudentOnboarding, setShowStudentOnboarding] = useState(false);
  const [showSasBicModal, setShowSasBicModal] = useState(false);
  const [localName, setLocalName] = useState(studentName);
  const [localGrade, setLocalGrade] = useState<Grade>(studentGrade);
  
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedData, setAcceptedData] = useState(false);
  const [isMinor, setIsMinor] = useState(false);
  const [hasAdultConsent, setHasAdultConsent] = useState(false);
  const PRICING = { monthly: 49900, annual: 499000 };

  const canProceed = acceptedTerms && acceptedData && (!isMinor || (isMinor && hasAdultConsent));

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStudentAccess = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const email = (cred.user.email || '').toLowerCase();
      if (!email.includes('@gmail.com')) {
        alert('Para registrarte como estudiante necesitas un correo de Gmail.');
        await auth.signOut();
        return;
      }
      setGmailUser(email);
      if (cred.user.displayName) setLocalName(cred.user.displayName.split(' ')[0]);
      if (localStorage.getItem('eduglobal_legal_accepted') === 'true') {
        onStart();
      } else {
        setShowStudentOnboarding(true);
      }
    } catch (e) {
      alert('Necesitas iniciar sesión con Gmail para entrar como estudiante.');
    }
  };

  const handleStart = () => {
    if (!canProceed) return;
    localStorage.setItem('eduglobal_legal_accepted', 'true');
    onStart();
  };

  const features = [
    { icon: '📴', title: '100% Offline-First', desc: 'Estudia sin señal: tu progreso y la IA viven en tu celular (IndexedDB + WebGPU).' },
    { icon: '🧠', title: 'IA local en tu GPU', desc: 'Tu propio tutor corre en tu dispositivo; tus datos nunca salen de él.' },
    { icon: '🎯', title: 'Alineado al MEN (DBA)', desc: 'Cada reto y quiz cita el Derecho Básico de Aprendizaje oficial. Trazabilidad para el ICFES.' },
    { icon: '🎧', title: 'Audio-First Ping-Pong', desc: 'Podcasts que se pausan solos para lanzarte retos. Aprender escuchando, como NotebookLM.' },
    { icon: '📤', title: 'Comparte por USB/Bluetooth', desc: 'Exporta tu progreso en JSON y pásalo a un compañero de vereda sin internet.' },
    { icon: '🌱', title: 'Habilidades para la Vida', desc: 'Cursos cortos no formales con certificado: finanzas, emprendimiento, comunicación y digital.' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden selection:bg-blue-500/30">
      <nav className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎒</span>
            <span className="font-black tracking-tight">EduGlobal365</span>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-medium text-slate-300">
            <button onClick={() => scrollTo('planes')} className="hover:text-white transition-colors">Planes</button>
            <button onClick={() => scrollTo('funciones')} className="hover:text-white transition-colors">Tecnología</button>
            <button onClick={() => scrollTo('tracks')} className="hover:text-white transition-colors">Ecosistema</button>
          </div>
          <div className="flex gap-3">
            <button onClick={handleStudentAccess} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-full text-sm font-bold transition-colors">🎓 Soy Estudiante</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 pt-32 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <button onClick={() => setShowSasBicModal(true)}
            className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-bold tracking-widest uppercase mb-6 shadow-[0_0_18px_rgba(59,130,246,0.5)] animate-pulse hover:animate-none hover:scale-105 transition">
            <span className="absolute -top-2.5 -right-3 text-sm animate-bounce">✨</span>
            Hecho para Colombia · Modelo S.A.S BIC
            <span className="absolute -bottom-2.5 -left-3 text-sm animate-bounce" style={{ animationDelay: '150ms' }}>✨</span>
          </button>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
            El tutor de bolsillo que<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-300 to-purple-400">nunca te deja sin estudiar</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
            IA tutora alineada al currículo oficial del MEN (DBA) que funciona <strong className="text-slate-200">sin internet</strong> en tu celular. Prepárate para el ICFES aunque tu vereda no tenga señal.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <button onClick={() => scrollTo('planes')} className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-900/50 transition-all hover:scale-105">
              Ver planes desde {formatCOP(PRICING.monthly)}/mes
            </button>
          </div>
        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14">
          {[
            { icon: '📴', label: 'Funciona sin internet', desc: 'Tu progreso vive en tu celular' },
            { icon: '🧠', label: 'IA local en tu GPU', desc: 'Privada: tus datos no salen de tu dispositivo' },
            { icon: '🎯', label: 'Alineada al MEN', desc: 'DBA oficiales en cada reto y quiz' },
            { icon: '🎧', label: 'Podcasts que preguntan', desc: 'El audio se pausa para retarte' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-center hover:border-blue-500/50 transition-colors">
              <span className="text-4xl block mb-2">{s.icon}</span>
              <p className="text-sm font-black text-blue-400">{s.label}</p>
              <p className="text-xs text-slate-400 mt-1">{s.desc}</p>
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
            <button onClick={handleStudentAccess} className="mt-auto border border-blue-500 text-blue-300 rounded-full py-3 font-bold hover:bg-blue-500/10 transition-colors">Elegir Mensual</button>
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
              <li>✅ Soporte prioritario</li>
            </ul>
            <button onClick={handleStudentAccess} className="mt-auto bg-blue-600 hover:bg-blue-500 rounded-full py-3 font-bold transition-colors">Elegir Anual</button>
          </div>
        </div>
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
  <h2 className="text-3xl font-black text-center mb-3">Una suscripción. Dos mundos.</h2>
  <p className="text-slate-400 text-center mb-10">Todo incluido con tu plan: académico y habilidades para la vida.</p>
  <div className="grid md:grid-cols-2 gap-5">
    <div className="rounded-2xl border border-blue-500/40 bg-blue-950/30 p-6">
      <span className="text-3xl">🎓</span>
      <h3 className="font-bold mt-3 mb-1">Formación Académica (DBA/MEN)</h3>
      <p className="text-sm text-slate-400 mb-4">Matemáticas, Ciencias, Sociales, Humanidades e Inglés (8°–11°), preparación ICFES y simulacros, alineados al currículo oficial.</p>
      <ul className="text-xs text-slate-300 space-y-1">
        <li>✅ Tutor IA socrático offline</li>
        <li>✅ Podcasts descargables</li>
        <li>✅ Simulacros tipo ICFES</li>
      </ul>
    </div>
    <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 p-6">
      <span className="text-3xl">🌱</span>
      <h3 className="font-bold mt-3 mb-1">Habilidades para la Vida</h3>
      <p className="text-sm text-slate-400 mb-4">Formación NO formal para el trabajo y la vida diaria, con certificado de finalización.</p>
      <ul className="text-xs text-slate-300 space-y-1">
        <li>✅ Finanzas personales</li>
        <li>✅ Emprendimiento y negocio local</li>
        <li>✅ Comunicación y liderazgo</li>
        <li>✅ Alfabetización digital</li>
      </ul>
    </div>
  </div>
</section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 EduGlobal365 SAS BIC — Educación de élite para todos los colombianos.</p>
          <div className="flex gap-4">
            <a href="/legal/terms.html" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 underline">Términos y Condiciones</a>
            <button onClick={onTeacherAccess} className="hover:text-slate-300">Docentes</button>
                      </div>
        </div>
      </footer>

      {showSasBicModal && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4" onClick={() => setShowSasBicModal(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-black mb-4 text-slate-100">¿Qué es una S.A.S BIC? 💙</h2>
            <div className="space-y-3 text-sm text-slate-300">
              <p><strong className="text-white">BIC = Beneficio e Interés Colectivo.</strong> Somos una Sociedad por Acciones Simplificada que, por ley y por convicción, debe generar impacto social positivo además de utilidades.</p>
              <p>🎯 <strong>En la práctica:</strong> cada suscripción paga financia tecnología educativa para Colombia; nuestro éxito se mide en estudiantes que avanzan, no solo en ingresos.</p>
              <p>🔒 <strong>Compromisos:</strong> educación de élite accesible, funcionamiento sin internet para zonas rurales y reportes de impacto verificables ante el Estado.</p>
            </div>
            <button onClick={() => setShowSasBicModal(false)} className="mt-6 w-full bg-blue-600 hover:bg-blue-500 rounded-full py-3 font-bold text-white">¡Vamos con toda! 🇨🇴</button>
          </div>
        </div>
      )}

      {showStudentOnboarding && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-8 my-8">
            <h2 className="text-2xl font-black mb-1 text-slate-100">Crea tu cuenta de estudio</h2>
            <p className="text-xs text-slate-400 mb-6">Sesión iniciada con: <span className="text-blue-400">{gmailUser}</span></p>
            <div className="space-y-4 text-sm text-slate-300">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">¿Cómo te llamamos?</label>
                <input value={localName} onChange={(e) => setLocalName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tu grado</label>
                <select value={localGrade} onChange={(e) => setLocalGrade(e.target.value as Grade)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 outline-none">
                  <option value="8°">8° Grado</option>
                  <option value="9°">9° Grado</option>
                  <option value="10°">10° Grado</option>
                  <option value="11°">11° Grado</option>
                </select>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-600 text-blue-600 bg-slate-800" />
                <span>Acepto los <a href="/legal/terms.html" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Términos y Condiciones</a> y el modelo de precios.</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={acceptedData} onChange={(e) => setAcceptedData(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-600 text-blue-600 bg-slate-800" />
                <span>Autorizo el tratamiento de mis datos educativos (Ley 1581 de 2012).</span>
              </label>
              <div className="bg-slate-950/60 rounded-lg p-3 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={isMinor} onChange={(e) => { setIsMinor(e.target.checked); if (!e.target.checked) setHasAdultConsent(false); }} className="mt-1 h-4 w-4 rounded border-slate-600 text-blue-600 bg-slate-800" />
                  <span>Soy menor de 14 años (Ley 1098 de 2006).</span>
                </label>
                {isMinor && (
                  <label className="flex items-start gap-3 cursor-pointer ml-6">
                    <input type="checkbox" checked={hasAdultConsent} onChange={(e) => setHasAdultConsent(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-600 text-green-600 bg-slate-800" />
                    <span>Cuento con autorización de mi padre, madre o acudiente.</span>
                  </label>
                )}
              </div>
            </div>
            <button
              disabled={!canProceed || !localName.trim()}
              onClick={() => { onProfileUpdate?.(localName.trim(), localGrade); handleStart(); }}
              className={`w-full mt-6 rounded-full py-4 font-black text-lg transition-all ${canProceed && localName.trim() ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
              Entrar al Campus →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default LandingPage;
