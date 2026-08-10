const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const regex = /                <button onClick=\{\(\) => \{ setIsSidebarOpen\(false\); handleEnterTool\("Recursos Regionales"\); \}\} className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700\/50 rounded-lg text-sm transition-colors text-left">\n                  <\/>\n                \)}\n                  <span className="text-lg">🌱<\/span> Recursos de mi Región\n                <\/button>\n              <\/([^>]+)>\n            \)}\n/;

const replacement = `                <button onClick={() => { setIsSidebarOpen(false); handleEnterTool("Recursos Regionales"); }} className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg text-sm transition-colors text-left">
                  <span className="text-lg">🌱</span> Recursos de mi Región
                </button>
                </>
                )}
              </>
            )}
`;

code = code.replace(regex, replacement);
fs.writeFileSync('App.tsx', code);
console.log("Done");
