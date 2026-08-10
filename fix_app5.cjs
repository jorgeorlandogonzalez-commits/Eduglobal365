const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const regex = /\{currentView === 'CLASSROOM' && \([\s\S]*?<h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Acceso Rápido<\/h3>/;

const replacement = `{currentView === 'CLASSROOM' && (
              <>
                <div className="pt-4 pb-2">
                  <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {activeSubject === 'Tutor Edú' ? 'Charla con Edú' : \`Silo: \${activeSubject}\`}
                  </h3>
                </div>
                {activeSubject !== 'Tutor Edú' && (
                  <>
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
              </>
            )}
            <div className="pt-4 pb-2">
              <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Acceso Rápido</h3>`;

code = code.replace(regex, replacement);
fs.writeFileSync('App.tsx', code);
console.log("Done");
