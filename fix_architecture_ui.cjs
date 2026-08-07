const fs = require('fs');
let code = fs.readFileSync('components/ChatBubble.tsx', 'utf8');

const rxUIAdded = /\n\s*\{\s*hasArchitectureTip && \(\s*<div className="bg-slate-100 border border-slate-300 rounded-lg p-3 my-2">\s*<h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">🏛️ Tip de Arquitectura<\/h4>\s*<\/div>\s*\)\}/;
code = code.replace(rxUIAdded, '');

fs.writeFileSync('components/ChatBubble.tsx', code);
console.log("Success UI");
