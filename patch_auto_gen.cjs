const fs = require('fs');
let code = fs.readFileSync('services/geminiService.ts', 'utf8');

const lines = code.split('\n');
const startIdx = lines.findIndex(l => l.includes('const prompt = `'));
let endIdx = -1;
for (let i = startIdx + 1; i < lines.length; i++) {
  if (lines[i].includes('`;')) {
    endIdx = i;
    break;
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  const newPromptLines = `  const prompt = \`
  Como un Agente AI experto de EduGlobal365 y consultor curricular del Ministerio de Educación Nacional de Colombia:
  Genera el contenido para un aula interactiva o recurso RAG de un docente.
  
  Parámetros de entrada:
  - Grado escolar: \${grade}
  - Materia: \${subject}
  - Módulo curricular: \${moduleTitle}
  - Herramienta Pedagógica: \${toolId}
  - Ideas del Docente: "\${standardGuidelines}"
  
  REGLAS PEDAGÓGICAS (v5.1):
  - Método socrático: nunca des la respuesta directa, guía con preguntas.
  - Micro-learning: máximo 4 párrafos cortos.
  - Audio-First: el contenido debe funcionar como guion de podcast.
  - Source-grounded: todo debe alinearse al DBA correspondiente.
  - Regional: usa ejemplos de Colombia (Urabá, Boyacá, Caribe, Amazonía, Eje Cafetero, Bogotá).
  
  Debes generar:
  1. Un código DBA real y válido alineado con la materia y grado (ej. MAT-11-DBA-01, HUM-10-DBA-02, CNA-09-DBA-01).
  2. Un título creativo de tema (Topic) sumamente atractivo.
  3. El contenido textual didáctico (para inyección RAG y estudio). Debe incluir:
     - Una explicación conceptual socrática en menos de 4 párrafos cortos.
     - Un bloque de [RETO_VEREDA] que sea un problema realista contextualizado en Colombia.
     - Un bloque de [QUIZ_FLASH] de opción múltiple (A, B, C) rápido para medir asimilación inmediata.
     - Un cierre [📥 MODO OFFLINE] con 2 bullet points clave.
  4. Una sugerencia de URL de recurso multimedia (un podcast educativo o recurso auto-contenido).

  Retorna únicamente un formato JSON válido con las siguientes claves: "dbaCode", "topic", "textContent", "resourceUrl". No incluyas explicaciones previas ni bloques de formato markdown excepto el propio JSON crudo.
  \`;`.split('\n');
  
  lines.splice(startIdx, endIdx - startIdx + 1, ...newPromptLines);
  fs.writeFileSync('services/geminiService.ts', lines.join('\n'));
  console.log('patched prompt multiline correctly');
} else {
  console.log('not found');
}
