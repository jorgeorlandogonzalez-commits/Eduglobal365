const fs = require('fs');
let seedContent = fs.readFileSync('config/dbaSeedContent.ts', 'utf-8');

const newSeeds = `
  {
    id: "seed-vida-fin-01",
    subject: "Habilidades para la Vida",
    grade: "11°",
    topic: "Finanzas Personales: Tu Plata bajo Control",
    dbaCode: "VIDA-FIN-01",
    isSeed: true,
    timestamp: 1704585600000,
    resourceUrl: "",
    textContent: "Un presupuesto es saber de dónde entra la plata y pa' dónde va. Los ingresos menos los gastos.\\n\\n[RETO_VEREDA]\\nImagina una familia que vive de la cosecha de café. ¿Cómo armarías su presupuesto mensual sabiendo que los ingresos suben y bajan?\\n\\n[QUIZ_FLASH]\\n¿Qué es un gasto fijo?\\nA) Salir a comer\\nB) Arriendo y servicios\\nC) Ropa nueva\\n\\n[📥 MODO OFFLINE]\\n• Presupuesto = Control\\n• Fijo vs Variable\\n• Reflexión: ¿A dónde va tu dinero hoy?"
  },
  {
    id: "seed-vida-emp-01",
    subject: "Habilidades para la Vida",
    grade: "11°",
    topic: "Emprendimiento: De la Idea a la Primera Venta",
    dbaCode: "VIDA-EMP-01",
    isSeed: true,
    timestamp: 1704585600000,
    resourceUrl: "",
    textContent: "La propuesta de valor es lo que hace que tu producto sea único y le solucione un dolor al cliente.\\n\\n[RETO_VEREDA]\\nPiensa en un negocio para tu vereda. ¿Quién es exactamente el cliente y qué problema le resuelves?\\n\\n[QUIZ_FLASH]\\n¿Qué debe validar primero un emprendedor?\\nA) Comprar equipos caros\\nB) Que el cliente esté dispuesto a pagar\\nC) Hacer un logo bonito\\n\\n[📥 MODO OFFLINE]\\n• Propuesta de valor\\n• Conocer al cliente\\n• Reflexión: ¿Qué problema ves en tu comunidad que podrías resolver?"
  },
`;

seedContent = seedContent.replace(/export const DBA_SEED_CONTENT: SeedContent\[\] = \[/, 'export const DBA_SEED_CONTENT: SeedContent[] = [\n' + newSeeds);

const newPoints = `
  "VIDA-FIN-01": [
    { timestamp: 45, type: 'question', payload: '[QUIZ_FLASH]' },
    { timestamp: 120, type: 'challenge', payload: '[RETO_VEREDA]' }
  ],
  "VIDA-EMP-01": [
    { timestamp: 45, type: 'question', payload: '[QUIZ_FLASH]' },
    { timestamp: 120, type: 'challenge', payload: '[RETO_VEREDA]' }
  ],
`;

seedContent = seedContent.replace(/export const INTERACTION_POINTS: Record<string, InteractionPoint\[\]> = \{/, 'export const INTERACTION_POINTS: Record<string, InteractionPoint[]> = {\n' + newPoints);

fs.writeFileSync('config/dbaSeedContent.ts', seedContent, 'utf-8');
console.log("Done");
