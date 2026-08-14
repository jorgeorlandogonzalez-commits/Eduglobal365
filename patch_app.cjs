const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');

// D2.1
content = content.replace(
  'onGradeChange={(grade) => setStudent(prev => ({ ...prev, grade }))}',
  'onGradeChange={(grade) => setStudent(prev => ({ ...prev, grade }))}\n        onProfileUpdate={(name, grade) => setStudent(prev => ({ ...prev, name, grade }))}'
);

// D2.2 - Header Botón WebLLM
content = content.replace(
  /title=\{gemmaReady \? "Operando en Gemma Local \(Inferencia local activa\)" : "Activar Inferencia Offline con Gemma 2B"\}/g,
  'title={gemmaReady ? "Operando en IA Local (inferencia en tu dispositivo)" : "Activar inferencia offline en tu dispositivo"}'
);

content = content.replace(
  /`Descargando Gemma\.\.\. \$\{gemmaProgress\}%`/g,
  '`Activando IA Local... ${gemmaProgress}%`'
);

content = content.replace(
  /"Gemma Local Activo"/g,
  '"IA Local Activa"'
);

content = content.replace(
  /"Activar Gemma Local"/g,
  '"Activar IA Local"'
);

// Other "Gemma" mentions in App.tsx (if any that are user-facing)
// We should check if there are others like "Inferencia Local Activa" is already there.
// The prompt says: "Buscar cualquier otra aparición de "Gemma" en App.tsx -> reemplazar por "IA Local"."
// Note: We MUST NOT replace variables or internal logic names (like forceGemmaLocal, gemmaReady, etc.)
// "En superficies PUBLICAS (landing, header App, respuestas de la IA) esta PROHIBIDO. En documentacion INTERNA puede conservarse."
// Let's manually replace any other UI string containing Gemma:
content = content.replace(
  /Operando en Gemma 4 Local/gi,
  'Operando en IA Local'
);

content = content.replace(
  /Gemma 4 Local Activo/gi,
  'IA Local Activa'
);

content = content.replace(
  /Compilando Gemma 4 Local\.\.\. \$\{gemmaProgress\}%/gi,
  'Activando IA Local... ${gemmaProgress}%'
);

content = content.replace(
  /Activar Gemma 4 Local/gi,
  'Activar IA Local'
);

fs.writeFileSync('App.tsx', content);
