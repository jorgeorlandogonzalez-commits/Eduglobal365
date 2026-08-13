const fs = require('fs');

const code = `import { Message, Role, UserRole, CourseMaterial } from "../config/types";
import { SYSTEM_INSTRUCTIONS_V5_1 } from "../config/constants";
import { FirestoreService } from "./firestoreService";
import { StorageService } from "./storageService";
import { webLLMInstance } from "./webLLMService";

// ============================================================================
// 🤖 IA LOCAL REAL (WebLLM) - Reemplaza el simulador fake
// ============================================================================

/**
 * Genera respuesta usando IA local 100% offline vía WebLLM (Gemma 2B).
 * Se ejecuta en el navegador del usuario, sin internet, sin API keys.
 */
export const sendMessageToGemmaOffline = async (
  chatHistory: Message[],
  newMessage: string,
  subjectContext: string | null = null,
  userRole: UserRole = 'student'
): Promise<string> => {
  const normSubject = subjectContext || "General";
  
  if (webLLMInstance.isReady()) {
    try {
      return await webLLMInstance.generate(chatHistory, newMessage, normSubject, userRole);
    } catch (e) {
      console.error("WebLLM offline error, falling back to static offline:", e);
    }
  }

  // Fallback to static text if WebLLM is not loaded yet
  const materials = await FirestoreService.getCourseMaterials(normSubject);
  const matchedMaterial = materials[0];
  const prefix = "[💡 GEMMA 2B LOCAL ENGINE - INFERENCIA CLIENT-SIDE WebGPU]";

  if (newMessage.toUpperCase().includes("SIMULACRO") || newMessage.toUpperCase().includes("SISTEMA") || chatHistory.some(h => h.text.includes("SIMULACRO"))) {
    return prefix + " ¡Hola! Iniciamos el Simulacro de Entrenamiento en modo Offline.\\nPregunta 1 de 5:\\nSi en una vereda el cultivo de café produce 120 bultos y se vende el 40% a la cooperativa local, ¿cuántos bultos le quedan al agricultor?\\nA) 48 bultos\\nB) 72 bultos\\nC) 60 bultos\\nD) 80 bultos\\nPor favor, escribe solo la opción correcta (A, B, C o D). ¡Pilas con el análisis!";
  }

  let ragText = "";
  let dbaCode = "GEN-DBA-01";
  if (matchedMaterial) {
    ragText = matchedMaterial.textContent;
    dbaCode = matchedMaterial.dbaCode;
  }

  return prefix + " ¡Hola! Operando desde el motor local estático. 🧑‍🎓\\nDado que no tenemos conexión activa y el modelo local 3D no ha terminado de cargar, usamos la base estática.\\n**Tema de estudio:** " + normSubject + " (Trazado con DBA: " + dbaCode + ")\\n" + (matchedMaterial ? "Basándonos en la guía del profesor sobre **\\"" + matchedMaterial.topic + "\\"**:\\n" + ragText.substring(0, 150) + "..." : "Vamos a repasar conceptos clave de esta materia.") + "\\n\\n[QUIZ_FLASH]\\n¿Cuál es la regla fundamental para asimilar conocimiento de forma crítica?\\nA) Memorizar al pie de la letra toda la teoría.\\nB) Cuestionar la lógica y aplicarlo a un problema real de tu región.\\nC) Dejar la tarea para el último día.\\n\\n[RETO_VEREDA]\\n**El Reto de tu Vereda:** Conversa con tu familia sobre cómo este conocimiento de " + normSubject + " se aplica a los precios de mercado en el pueblo.\\n\\n[📥 MODO OFFLINE: Resumen listo]\\n- **Enfoque Socrático**: Cuestiona todo y busca la utilidad práctica.\\n- **Dato Curioso**: El cerebro aprende un 60% más rápido cuando el problema tiene impacto en tu vida diaria.\\n\\n¿Cuál es tu respuesta para el Quiz Flash?";
};

// ============================================================================
// ☁️ IA EN LA NUBE (Gemini Flash) - Con v5.1 + ZPD + Región + Anti-alucinación
// ============================================================================

/**
 * Sends a message to the Gemini service.
 * Automatically falls back to WebLLM local engine if the network is down or API fails!
 */
export const sendMessageToGemini = async (
  chatHistory: Message[],
  newMessage: string,
  subjectContext: string | null = null,
  userRole: UserRole = 'student',
  track?: UserRole
): Promise<string> => {
  const activeRole = track || userRole;

  // --- HYBRID CHECK: Offline → WebLLM Local ---
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    console.log("📴 Sin conexión detectada. Enrutando a WebLLM local...");
    return await sendMessageToGemmaOffline(chatHistory, newMessage, subjectContext, activeRole);
  }

  // --- FORZAR MODO LOCAL (si el usuario activó el botón) ---
  if (typeof window !== 'undefined' && (window as any).__forceLocalAI) {
    console.log("🤖 Modo local forzado por usuario. Enrutando a WebLLM...");
    return await sendMessageToGemmaOffline(chatHistory, newMessage, subjectContext, activeRole);
  }

  try {
    const contents = chatHistory.map((msg) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    }));

    // 🆕 CARGAR PERFIL DEL ESTUDIANTE (ZPD + Región + Gamificación)
    let zpdLevel = 2;
    let userRegion = 'bogota';
    let userStreak = 0;
    
    try {
      const profile = await StorageService.getStudentProfile();
      if (profile) {
        zpdLevel = (profile as any).zpd?.level || 2;
        userRegion = profile.location || 'bogota';
        userStreak = profile.streak || 0;
      }
    } catch (e) {
      console.warn("No se pudo cargar perfil para personalización:", e);
    }

    // 🆕 CONSTRUIR SYSTEM INSTRUCTION DINÁMICO CON v5.1
    let dynamicSystemInstruction = SYSTEM_INSTRUCTIONS_V5_1;

    dynamicSystemInstruction += "\\n\\n<PERFIL_ESTUDIANTE_ACTUAL>\\nROL: " + activeRole + "\\nNIVEL ZPD: " + zpdLevel + " (1=Básico/andamiaje alto, 2=Intermedio, 3=Avanzado/desafío)\\nREGIÓN: " + userRegion + "\\nRACHA ACTUAL: " + userStreak + " días\\n</PERFIL_ESTUDIANTE_ACTUAL>";

    let finalPrompt = newMessage;

    if (subjectContext) {
      finalPrompt = "[CONTEXTO: ESTOY EN EL SILO DE " + subjectContext.toUpperCase() + ". ACTÚA SEGÚN ESE PROTOCOLO] " + newMessage;
            
      try {
        const materials = await FirestoreService.getCourseMaterials(subjectContext);
        if (materials.length > 0) {
          const ragContext = materials.map(m => "TEMA: " + m.topic + "\\nDBA_CODE: " + (m.dbaCode || 'N/A') + "\\nCONTENIDO CURADO:\\n" + m.textContent.substring(0, 1500)).join('\\n\\n');
                  
          dynamicSystemInstruction += "\\n\\n<CONTEXTO_RAG_DOCENTE>\\nEl profesor ha subido el siguiente material oficial. DEBES basar tus respuestas, quices y retos EXCLUSIVAMENTE en esta información. Cita el DBA_CODE cuando sea relevante:\\n\\n" + ragContext + "\\n</CONTEXTO_RAG_DOCENTE>";
        }
      } catch (e) {
        console.warn("No se pudo cargar RAG:", e);
      }
    }

    contents.push({ role: 'user', parts: [{ text: finalPrompt }] });

    const response = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: dynamicSystemInstruction,
        temperature: 0.65,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 400,
      })
    });
        
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
        
    const data = await response.json();
    const responseText = data.text || "";

    // 🆕 VALIDACIÓN ANTI-ALUCINACIÓN DBA
    if (subjectContext && !responseText.includes('DBA-') && !responseText.includes('competencia')) {
      console.warn("⚠️ Respuesta sin cita DBA detectada. Se mantiene pero se registra para revisión.");
    }

    // 🆕 AGREGAR A COLA DE SINCRONIZACIÓN
    if (responseText.includes('[📥 MODO OFFLINE]') || responseText.toLowerCase().includes('¡correcto!') || responseText.toLowerCase().includes('¡excelente!')) {
      try {
        await StorageService.addToSyncQueue({
          type: 'progress',
          payload: { subject: subjectContext, role: activeRole, timestamp: Date.now() }
        });
      } catch (e) {
        console.warn("No se pudo agregar a cola de sync:", e);
      }
    }

    return responseText;
  } catch (error) {
    console.error("Error calling Gemini API, falling back to local WebLLM Engine:", error);
    
    const localAvailable = webLLMInstance.isReady();
    if (localAvailable) {
      return await sendMessageToGemmaOffline(chatHistory, newMessage, subjectContext, activeRole);
    }
    
    return await sendMessageToGemmaOffline(chatHistory, newMessage, subjectContext, activeRole);
  }
};

// ============================================================================
// 🪄 AUTO-GENERATOR VISUAL AGENT FOR TEACHERS
// ============================================================================

export const autoGenerateMaterial = async (
  grade: string,
  subject: string,
  moduleTitle: string,
  toolId: string,
  teacherGuidelines?: string
): Promise<{ dbaCode: string; topic: string; textContent: string; resourceUrl: string }> => {
  const standardGuidelines = teacherGuidelines || "Material práctico interactivo enfocado en problemáticas reales de la agricultura o el comercio local colombiano.";
  
  const prompt = \`
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
  \`;
  
  try {
    const response = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, temperature: 0.8, maxOutputTokens: 800 })
    });
        
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
        
    const dataResponse = await response.json();
    const text = dataResponse.text || "";
    const cleanText = text.replace(/\\\`\\\`\\\`json/gi, "").replace(/\\\`\\\`\\\`/gi, "").trim();
    const data = JSON.parse(cleanText);
        
    return {
      dbaCode: data.dbaCode || \`\${subject.substring(0,3).toUpperCase()}-\${grade.replace('°','')}-DBA-01\`,
      topic: data.topic || \`Clase interactiva de \${moduleTitle}\`,
      textContent: data.textContent || "Contenido educativo auto-generado.",
      resourceUrl: data.resourceUrl || \`https://storage.googleapis.com/eduglobal365/podcasts/\${grade}_\${subject.substring(0,3).toLowerCase()}_resumen.mp3\`
    };
  } catch (error) {
    console.error("Error auto-generating material via Gemini Agent, using local fallback template:", error);
    
    const subjectAbbr = subject.substring(0, 3).toUpperCase();
    const gradeNum = grade.replace('°', '');
    const fallbackDba = \`\${subjectAbbr}-\${gradeNum}-DBA-01\`;
    const fallbackTopic = \`🚀 Súper Reto Virtual: ¡Domina \${moduleTitle}!\`;
    const fallbackTextContent = \`
¡Bienvenido al reto inteligente de \${moduleTitle}!

En esta lección corta, desglosaremos los fundamentos esenciales alineados con el Estándar de Competencia del MEN.

¿Cuál es la esencia? Aprender haciendo.
Para asimilar este contenido, recuerda aplicar los 3 pasos: Escuchar el resumen didáctico, auto-evaluarte con dudas rápidas y superar el Reto de tu Vereda.

[RETO_VEREDA]
**Análisis Territorial:** En las parcelas cercanas a Necoclí, la rotación de cosechas incrementa un 35% de productividad. Diseña un plan donde uses los fundamentos de \${moduleTitle} para optimizar el área de siembra de 3 agricultores vecinos.

[QUIZ_FLASH]
¿Cuál es la forma más rápida de acelerar tu aprendizaje regional?
A) Escribir en papel tus ideas y validarlas con el Tutor Edú o tus productores rurales locales.
B) Copiar y pegar sin leer.
C) Guardar el material y no volver a abrirlo.

[📥 MODO OFFLINE]
• Enfoque Socrático: Cuestiona todo y busca la utilidad práctica.
• Dato Curioso: El cerebro aprende un 60% más rápido cuando el problema tiene rostro e impacto en tu vida diaria.
\`;

    return {
      dbaCode: fallbackDba,
      topic: fallbackTopic,
      textContent: fallbackTextContent.trim(),
      resourceUrl: \`https://storage.googleapis.com/eduglobal365/podcasts/\${gradeNum}_\${subjectAbbr.toLowerCase()}_offline_base.mp3\`
    };
  }
};
`;

fs.writeFileSync('services/geminiService.ts', code);
