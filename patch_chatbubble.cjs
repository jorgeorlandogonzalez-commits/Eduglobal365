const fs = require('fs');
let code = fs.readFileSync('components/ChatBubble.tsx', 'utf8');

const regexes = [
  {
    regex: /\{hasActivaWebLLM && \([\s\S]*?\}\)/g,
    replace: `{hasActivaWebLLM && (
  <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 border border-purple-200 rounded-lg p-3 my-2 shadow-sm">
    <h4 className="font-bold text-purple-800 text-sm uppercase tracking-wide mb-2">🤖 IA Local Activada (Gemma 2B)</h4>
    <ul className="text-xs text-slate-700 space-y-1">
      <li>✅ Cero consumo de datos</li>
      <li>✅ Respuestas inmediatas</li>
      <li>✅ Tus datos nunca salen de tu celular</li>
    </ul>
  </div>
)}`
  },
  {
    regex: /\{hasInstalaPWA && \([\s\S]*?\}\)/g,
    replace: `{hasInstalaPWA && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 my-2 shadow-sm">
    <h4 className="font-bold text-blue-800 text-sm uppercase tracking-wide mb-2">📲 Instalar como App</h4>
    <p className="text-xs text-slate-600 mb-2">Estudia sin gastar datos instalando EduGlobal365 en tu celular.</p>
    <button onClick={() => window.dispatchEvent(new CustomEvent('eduglobal:install-pwa'))} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">📲 Instalar EduGlobal365</button>
  </div>
)}`
  },
  {
    regex: /\{hasSincronizaNube && \([\s\S]*?\}\)/g,
    replace: `{hasSincronizaNube && (
  <div className="bg-green-50 border border-green-200 rounded-lg p-3 my-2 shadow-sm">
    <h4 className="font-bold text-green-800 text-sm uppercase tracking-wide mb-2">☁️ Sincronizar con la Nube</h4>
    <button onClick={() => window.dispatchEvent(new CustomEvent('eduglobal:sync-cloud'))} className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">☁️ Subir Progreso de Respaldo</button>
  </div>
)}`
  },
  {
    regex: /\{hasExportaJson && \([\s\S]*?\}\)/g,
    replace: `{hasExportaJson && (
  <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 my-2 shadow-sm">
    <h4 className="font-bold text-cyan-800 text-sm uppercase tracking-wide mb-2">📤 Compartir con Compañeros</h4>
    <p className="text-xs text-slate-600 mb-2">Exporta tu progreso para pasarlo por USB o Bluetooth.</p>
    <button onClick={() => window.dispatchEvent(new CustomEvent('eduglobal:export-json'))} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">📤 Exportar Progreso (JSON)</button>
  </div>
)}`
  },
  {
    regex: /\{hasDescargaOffline && \([\s\S]*?\}\)/g,
    replace: `{hasDescargaOffline && (
  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 my-2 shadow-sm">
    <h4 className="font-bold text-emerald-800 text-sm uppercase tracking-wide mb-2">📥 Descargar para Offline</h4>
    <button onClick={() => window.dispatchEvent(new CustomEvent('eduglobal:download-offline'))} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">📥 Preparar para la Vereda</button>
  </div>
)}`
  },
  {
    regex: /\{hasAdoptaModulo && \([\s\S]*?\}\)/g,
    replace: `{hasAdoptaModulo && (
  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3 my-2 shadow-sm">
    <h4 className="font-bold text-amber-800 text-sm uppercase tracking-wide mb-2">🛠️ Adoptar Módulo Educativo</h4>
    <p className="text-xs text-slate-700 mb-2">Construye una solución técnica que mejore este módulo para estudiantes reales.</p>
    <button onClick={() => window.dispatchEvent(new CustomEvent('eduglobal:adopt-module'))} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">🛠️ Aceptar Reto Constructor</button>
  </div>
)}`
  },
  {
    regex: /\{hasLimpiaCache && \([\s\S]*?\}\)/g,
    replace: `{hasLimpiaCache && (
  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 my-2 shadow-sm">
    <h4 className="font-bold text-amber-800 text-sm uppercase tracking-wide mb-2">🧹 Liberar Espacio</h4>
    <button onClick={() => window.dispatchEvent(new CustomEvent('eduglobal:clean-cache'))} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">🧹 Limpiar Paquetes Antiguos</button>
  </div>
)}`
  },
  {
    regex: /\{hasAlertaBienestar && \([\s\S]*?\}\)/g,
    replace: `{hasAlertaBienestar && (
  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 my-3 shadow-md">
    <h4 className="font-bold text-red-800 text-sm uppercase tracking-wide mb-2">❤️ Apoyo Emocional</h4>
    <p className="text-sm text-slate-700 mb-3">Si estás pasando por un momento difícil, hay personas listas para escucharte:</p>
    <div className="space-y-2">
      <a href="tel:106" className="block w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg text-center">📞 Línea 106 (Niños y Adolescentes)</a>
      <a href="tel:123" className="block w-full bg-slate-700 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-lg text-center">📞 Línea 123 (Emergencias)</a>
      <a href="tel:192" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-center">📞 Línea 192 (Salud Mental)</a>
    </div>
  </div>
)}`
  }
];

for (const rule of regexes) {
  code = code.replace(rule.regex, rule.replace);
}

fs.writeFileSync('components/ChatBubble.tsx', code);
