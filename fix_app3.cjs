const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const regex1 = /  const handleStartGeneralChat = async \(\) => {[\s\S]*?  const handleEnterSubject = async \(subject: string\) => {/;

const replacement1 = `  const handleStartGeneralChat = async () => {
    const subjectContext = "Tutor Edú";
    setActiveSubject(subjectContext);
    
    // Load existing history or start fresh
    let history = await StorageService.loadSubjectChat(subjectContext, userRole);
    
    if (history.length === 0) {
      const initialUserMsg: Message = { 
        id: generateUUID(), 
        role: Role.USER, 
        text: "Hola", 
        timestamp: Date.now() - 1000,
        track: userRole
      };
      
      const aiMsg: Message = { 
        id: generateUUID(), 
        role: Role.MODEL, 
        text: "Hola, ¿como estas?. Edu esta aca para escucharte y ayudarte en lo q necesites", 
        timestamp: Date.now(),
        track: userRole
      };
      
      const newHistory = [initialUserMsg, aiMsg];
      setMessages(newHistory);
      setCurrentView('CLASSROOM');
      setIsSidebarOpen(false);
      StorageService.saveSubjectChat(subjectContext, newHistory, userRole);
    } else {
      setMessages(history);
      setCurrentView('CLASSROOM');
      setIsSidebarOpen(false);
    }
  };

  const handleEnterSubject = async (subject: string) => {`;

code = code.replace(regex1, replacement1);

// Update tooltip text
code = code.replace(/<span className="text-lg">💾<\/span> Preparar para la Vereda/g, '<span className="text-lg">💾</span> Preparar para la Vereda');

// We need to hide the study tools when activeSubject is Tutor Edú
const regex2 = /                <button onClick={\(\) => { setIsSidebarOpen\(false\); handleSmartDownload\(\); }} className="md:hidden w-full flex items-center gap-3 px-3 py-2 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900\/30 rounded-lg text-sm transition-colors text-left font-bold">[\s\S]*?                <button onClick={\(\) => { setIsSidebarOpen\(false\); handleEnterTool\("Recursos Regionales"\); }} className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700\/50 rounded-lg text-sm transition-colors text-left">/g;

const matched2 = code.match(regex2);
if (matched2) {
  const replacement2 = `                {activeSubject !== 'Tutor Edú' && (
                  <>
${matched2[0]}
                  </>
                )}`;
  code = code.replace(regex2, replacement2);
}

// Update the activeSubject title in the sidebar
const regex3 = /<h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Silo: {activeSubject}<\/h3>/;
const replacement3 = `<h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {activeSubject === 'Tutor Edú' ? 'Charla con Edú' : \`Silo: \${activeSubject}\`}
                  </h3>`;
code = code.replace(regex3, replacement3);

// Update the activeSubject title in the top bar
const regex4 = /\{currentView === 'CAMPUS' \? 'Campus Virtual' : \`Módulo: \$\{activeSubject \|\| 'General'\}\`\}/;
const replacement4 = `{currentView === 'CAMPUS' ? 'Campus Virtual' : activeSubject === 'Tutor Edú' ? 'Asistente Virtual' : \`Módulo: \${activeSubject || 'General'}\`}`;
code = code.replace(regex4, replacement4);

// Update the tool bar buttons in top bar
const regex5 = /\{currentView === 'CLASSROOM' && \(/;
const replacement5 = `{currentView === 'CLASSROOM' && activeSubject !== 'Tutor Edú' && (`;
code = code.replace(regex5, replacement5);


fs.writeFileSync('App.tsx', code);
console.log("Done");
