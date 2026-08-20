const fs = require('fs');

console.log("Patching components/LandingPage.tsx...");
let landing = fs.readFileSync('components/LandingPage.tsx', 'utf-8');
// 1.1 Remove onConstructorAccess
landing = landing.replace(/onConstructorAccess: \(\) => void;\n?/, '');
landing = landing.replace(/onConstructorAccess,\n?/, '');

// 1.2 Remove "Soy Constructor" from nav/footer
landing = landing.replace(/<button onClick=\{onConstructorAccess\} className="hover:text-slate-300">Constructores<\/button>\n?/, '');

// 1.3 Replace Tracks Section
const trackRegex = /<section id="tracks"[\s\S]*?<\/section>/;
const newTracksSection = `<section id="tracks" className="max-w-6xl mx-auto px-4 py-16">
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
</section>`;
landing = landing.replace(trackRegex, newTracksSection);

// 1.5 Replace feature
landing = landing.replace(/{ icon: '🛠️', title: 'Track Constructor', desc: 'Si programas o emprendes, adopta módulos educativos y construye soluciones reales.' }/g, `{ icon: '🌱', title: 'Habilidades para la Vida', desc: 'Cursos cortos no formales con certificado: finanzas, emprendimiento, comunicación y digital.' }`);

fs.writeFileSync('components/LandingPage.tsx', landing, 'utf-8');

console.log("Patching App.tsx...");
let app = fs.readFileSync('App.tsx', 'utf-8');
// 2.1 Remove ConstructorLab
app = app.replace(/import ConstructorLab from '\.\/components\/ConstructorLab';\n?/, '');
app = app.replace(/if \(currentView === 'CONSTRUCTOR_LAB'\) {[\s\S]*?}\n\n/g, '');
app = app.replace(/onConstructorAccess=\{[^}]+\}\n?/g, '');
fs.writeFileSync('App.tsx', app, 'utf-8');

console.log("Patching components/CampusMap.tsx...");
let campus = fs.readFileSync('components/CampusMap.tsx', 'utf-8');
// 3.1 Remove onSwitchTrack
campus = campus.replace(/onSwitchTrack\?: \(\) => void;\n?/, '');
campus = campus.replace(/onSwitchTrack,\n?/, '');
const switchBtnRegex = /\{\/\* ✅ NUEVO: Botón de cambio de Track \(Dual-Track Architecture\) \*\/\}\s*\{userRole === 'student' && onSwitchTrack && \([\s\S]*?<\/button>\s*\)\}/;
campus = campus.replace(switchBtnRegex, '');

// 3.2 Add card for Habilidades para la vida
const addBeforeTarget = `<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">`;
const lifeSkillsSection = `{/* BLOQUE D: HABILIDADES PARA LA VIDA */}
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

        `;
campus = campus.replace(addBeforeTarget, lifeSkillsSection + addBeforeTarget);

fs.writeFileSync('components/CampusMap.tsx', campus, 'utf-8');
console.log("Done");
