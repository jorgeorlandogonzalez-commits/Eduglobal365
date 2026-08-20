const fs = require('fs');

console.log("Patching config/constants.ts...");
let constants = fs.readFileSync('config/constants.ts', 'utf-8');

// 4.1
const fallbackRegex = /\s*\/\/\s*Fallback genérico con dbaCode dinámico usando helper/;
const vidaCode = `
  if (subject === 'Habilidades para la Vida') {
    return [
      { id: 'v1', title: 'Finanzas Personales', description: 'Presupuesto, ahorro, deuda y decisiones de dinero para la vida real.', dbaCode: 'VIDA-FIN-01' },
      { id: 'v2', title: 'Emprendimiento y Negocio Local', description: 'De la idea a la primera venta: emprende en tu región.', dbaCode: 'VIDA-EMP-01' },
      { id: 'v3', title: 'Comunicación y Liderazgo', description: 'Hablar en público, negociar y liderar equipos.', dbaCode: 'VIDA-COM-01' },
      { id: 'v4', title: 'Alfabetización Digital', description: 'Ofimática, seguridad en internet y herramientas de IA para el día a día.', dbaCode: 'VIDA-DIG-01' }
    ];
  }

  // Fallback genérico con dbaCode dinámico usando helper`;
constants = constants.replace(fallbackRegex, vidaCode);

// 4.2 Update SYSTEM_INSTRUCTIONS_V5
constants = constants.replace(
  /Nombre: Tutor Edú \(Track Estudiante\) \/ Asistente Constructor \(Track Builder\) \/ Agente Pedagógico \(Track Teacher\)\./,
  'Nombre: Tutor Edú (Track Estudiante) / Agente Pedagógico (Track Teacher).'
);

const trackConstructorRegex = /🛠️ TRACK CONSTRUCTOR \(rol='builder'\):[\s\S]*?- Comandos disponibles: \[CODE_SNIPPET\], \[ARCHITECTURE_TIP\], \[RETO_CONSTRUCTOR\], \[ADOPTA_MODULO\]\.\n/g;
constants = constants.replace(trackConstructorRegex, '');

const studentCommandsRegex = /- Comandos disponibles: \[PODCAST_TRIGGER\], \[QUIZ_FLASH\], \[RETO_VEREDA\], \[EXPORTA_JSON\], \[INSTALA_PWA\]\./;
const studentCommandsReplacement = `- Comandos disponibles: [PODCAST_TRIGGER], [QUIZ_FLASH], [RETO_VEREDA], [EXPORTA_JSON], [INSTALA_PWA].
- Incluye 2 categorías de contenido: Formación Académica (DBA/MEN 8°–11° + ICFES + Inglés) y Habilidades para la Vida (formación NO formal con certificado de finalización).`;
constants = constants.replace(studentCommandsRegex, studentCommandsReplacement);

const comandosConstructorRegex = /COMANDOS TRACK CONSTRUCTOR:[\s\S]*?11\. \[ADOPTA_MODULO\]: Sugiere al constructor "adoptar" un módulo educativo de estudiante para mejorarlo técnicamente \(Cross-Track Synergy\)\.\n/g;
constants = constants.replace(comandosConstructorRegex, '');

const crossTrackProtocolRegex = /PROTOCOLO 7: CROSS-TRACK SYNERGY \(Builder \+ Student\)[\s\S]*?¿Empezamos con el diagnóstico del problema\?"\n/g;
constants = constants.replace(crossTrackProtocolRegex, '');

constants = constants.replace(/SYSTEM INSTRUCTION EDUGLOBAL365 v5\.2/g, 'SYSTEM INSTRUCTION EDUGLOBAL365 v5.5');
constants = constants.replace(/FIN SYSTEM INSTRUCTION v5\.2/g, 'FIN SYSTEM INSTRUCTION v5.5');

fs.writeFileSync('config/constants.ts', constants, 'utf-8');

console.log("Patching config/types.ts...");
let types = fs.readFileSync('config/types.ts', 'utf-8');
const userRoleRegex = /export type UserRole = 'student' \| 'teacher' \| 'builder' \| 'admin';/;
const userRoleReplacement = `// ✅ v6.1: 'builder' se mantiene SOLO por retrocompatibilidad de storage/gemini.
// El Track Constructor público fue eliminado (decisión PM v6.1).
export type UserRole = 'student' | 'teacher' | 'builder' | 'admin';`;
types = types.replace(userRoleRegex, userRoleReplacement);
fs.writeFileSync('config/types.ts', types, 'utf-8');

console.log("Done");
