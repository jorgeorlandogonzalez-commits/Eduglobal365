const fs = require('fs');
let code = fs.readFileSync('components/ChatBubble.tsx', 'utf8');

// We need to find the section where tags are detected.
// We'll search for `const hasRetoVereda`
const rxDetect = /(\/\/ 4\. Detect Reto Vereda \(Track Estudiante\)\n\s*const hasRetoVereda = mainContent\.includes\('\[RETO_VEREDA\]'\);\n\s*mainContent = mainContent\.replace\(\/\\\[RETO_VEREDA\\\]\/gi, ''\)\.trim\(\);)/;

const newDetect = `$1
    
    const hasRetoConstructor = mainContent.includes('[RETO_CONSTRUCTOR]');
    mainContent = mainContent.replace(/\\[RETO_CONSTRUCTOR\\]/gi, '').trim();

    const hasExportaJson = mainContent.includes('[EXPORTA_JSON]');
    mainContent = mainContent.replace(/\\[EXPORTA_JSON\\]/gi, '').trim();

    const hasInstalaPWA = mainContent.includes('[INSTALA_PWA]');
    mainContent = mainContent.replace(/\\[INSTALA_PWA\\]/gi, '').trim();

    const hasActivaWebLLM = mainContent.includes('[ACTIVA_WEBLLM]');
    mainContent = mainContent.replace(/\\[ACTIVA_WEBLLM\\]/gi, '').trim();

    const hasSincronizaNube = mainContent.includes('[SINCRONIZA_NUBE]');
    mainContent = mainContent.replace(/\\[SINCRONIZA_NUBE\\]/gi, '').trim();

    const hasArchitectureTip = mainContent.includes('[ARCHITECTURE_TIP]');
    mainContent = mainContent.replace(/\\[ARCHITECTURE_TIP\\]/gi, '').trim();

    const hasAdoptaModulo = mainContent.includes('[ADOPTA_MODULO]');
    mainContent = mainContent.replace(/\\[ADOPTA_MODULO\\]/gi, '').trim();

    const hasAlertaBienestar = mainContent.includes('[ALERTA_BIENESTAR]');
    mainContent = mainContent.replace(/\\[ALERTA_BIENESTAR\\]/gi, '').trim();

    const hasDescargaOffline = mainContent.includes('[DESCARGA_OFFLINE]');
    mainContent = mainContent.replace(/\\[DESCARGA_OFFLINE\\]/gi, '').trim();

    const hasLimpiaCache = mainContent.includes('[LIMPIA_CACHE]');
    mainContent = mainContent.replace(/\\[LIMPIA_CACHE\\]/gi, '').trim();
`;

code = code.replace(rxDetect, newDetect);

// Now the UI for these tags. Let's find where hasQuizFlash is rendered and insert our UI after it.
const rxUI = /(<div className="flex items-center gap-2 mb-2">\s*<div className="bg-purple-100 text-purple-700 p-1.5 rounded-md">\s*<svg.*?>\s*<path.*?\/>\s*<\/svg>\s*<\/div>\s*<h4 className="font-bold text-purple-800 text-sm uppercase tracking-wide">Quiz Flash<\/h4>\s*<\/div>\s*\{\/\* The actual quiz text will be in mainContent \*\/\}\s*<\/div>\s*\})\n/;

const newUI = `$1
        {hasRetoConstructor && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 my-2 shadow-sm">
            <h4 className="font-bold text-blue-800 text-sm uppercase tracking-wide flex items-center gap-2 mb-2">
              <span>🛠️ Reto Constructor</span>
            </h4>
          </div>
        )}
        {hasExportaJson && (
          <div className="my-2">
            <button onClick={() => onOptionSelect && onOptionSelect("¡Exportemos mis datos!")} className="flex items-center gap-2 bg-slate-100 hover:bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-slate-200 font-medium text-sm transition-colors">
              📤 Compartir con compañeros (JSON)
            </button>
          </div>
        )}
        {hasInstalaPWA && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 my-2 shadow-sm">
            <h4 className="font-bold text-blue-800 text-sm mb-1 flex items-center gap-2">📱 Instala EduGlobal365</h4>
            <p className="text-sm text-slate-700 mb-2">Para estudiar sin gastar datos, guarda esta app en tu celular.</p>
            <button onClick={() => onOptionSelect && onOptionSelect("¿Cómo instalo la PWA?")} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition-colors">
              Ver instrucciones
            </button>
          </div>
        )}
        {hasActivaWebLLM && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 my-2">
            <h4 className="font-bold text-purple-800 text-sm flex items-center gap-2">🤖 Inferencia Local Activa</h4>
            <p className="text-xs text-slate-600 mt-1">Tus datos nunca salen del dispositivo.</p>
          </div>
        )}
        {hasSincronizaNube && (
          <div className="my-2">
            <button onClick={() => onOptionSelect && onOptionSelect("Sincronizar ahora")} className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-full border border-green-200 font-medium text-sm transition-colors">
              ☁️ Sincronizar Progreso a la Nube
            </button>
          </div>
        )}
        {hasArchitectureTip && (
          <div className="bg-slate-100 border border-slate-300 rounded-lg p-3 my-2">
            <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">🏛️ Tip de Arquitectura</h4>
          </div>
        )}
        {hasAdoptaModulo && (
          <div className="my-2">
            <button onClick={() => onOptionSelect && onOptionSelect("¡Quiero adoptar este módulo!")} className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 px-4 py-2 rounded-full border border-orange-200 font-medium text-sm transition-colors">
              🫂 Adoptar Módulo para Mejorarlo
            </button>
          </div>
        )}
        {hasAlertaBienestar && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-2 shadow-sm">
            <h4 className="font-bold text-red-700 text-sm flex items-center gap-2 mb-2">🆘 Líneas de Apoyo Gratuitas</h4>
            <ul className="text-sm text-red-900 space-y-1 font-medium">
              <li>📞 Línea 106 - Apoyo psicosocial</li>
              <li>📞 Línea 123 - Emergencias</li>
              <li>📞 Línea 192 (Opción 4) - Salud mental</li>
            </ul>
          </div>
        )}
        {hasDescargaOffline && (
          <div className="my-2">
            <button onClick={() => onOptionSelect && onOptionSelect("Mostrar opciones de descarga")} className="flex items-center gap-2 bg-slate-800 text-white hover:bg-slate-700 px-4 py-2 rounded-full font-medium text-sm transition-colors">
              📥 Opciones de Descarga (PDF/Audio)
            </button>
          </div>
        )}
        {hasLimpiaCache && (
          <div className="my-2">
            <button onClick={() => onOptionSelect && onOptionSelect("Limpiar caché antigua")} className="flex items-center gap-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full border border-yellow-300 font-medium text-sm transition-colors">
              🧹 Liberar Espacio en Celular
            </button>
          </div>
        )}
`;

code = code.replace(rxUI, newUI);
fs.writeFileSync('components/ChatBubble.tsx', code);
console.log("Success");
