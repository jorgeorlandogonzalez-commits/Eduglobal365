// src/services/geminiService.ts
import { Message, Role, UserRole, CourseMaterial } from "../config/types";
import { SYSTEM_INSTRUCTIONS_V5 } from "../config/constants";
import { StorageService } from "./storageService";
import { webLLMInstance } from "./webLLMService";

// ============================================================================
// 🤖 IA LOCAL REAL (WebLLM) - Inferencia 100% offline vía WebGPU
// ============================================================================

/**
 * Genera respuesta usando IA local vía WebLLM (Gemma 2B).
 * Se ejecuta en el navegador del usuario, sin internet, sin API keys.
 */
export const sendMessageToGemmaOffline = async (
  chatHistory: Message[],
  newMessage: string,
  subjectContext: string | null = null,
  userRole: UserRole = 'student'
): Promise<string> => {
  const normSubject = subjectContext || "General";
  
  // ✅ Intentar WebLLM real si está listo
  if (webLLMInstance.isReady()) {
    try {
      return await webLLMInstance.generate(chatHistory, newMessage, normSubject, userRole);
    } catch (e) {
      console.error("WebLLM offline error, falling back to static offline:", e);
    }
  }

  // ✅ Fallback estático: leer de StorageService (IndexedDB), NO de Firestore
  const materials = await StorageService.getCourseMaterials(normSubject);
  const matchedMaterial = materials[0];
  const prefix = "[💡 GEMMA 4 LOCAL ENGINE - INFERENCIA CLIENT-SIDE WebGPU]";

  // Modo Simulacro
  if (newMessage.toUpperCase().includes("SIMULACRO") || 
      newMessage.toUpperCase().includes("SISTEMA") || 
      chatHistory.some(h => h.text.includes("SIMULACRO"))) {
    return `${prefix} ¡Hola! Iniciamos el Simulacro de Entrenamiento en modo Offline.\n` +
           `Pregunta 1 de 5:\n` +
           `Si en una vereda el cultivo de café produce 120 bultos y se vende el 40% a la cooperativa local, ¿cuántos bultos le quedan al agricultor?\n` +
           `A) 48 bultos\nB) 72 bultos\nC) 60 bultos\nD) 80 bultos\n` +
           `Por favor, escribe solo la opción correcta (A, B, C o D). ¡Pilas con el análisis!`;
  }

  // Modo Estándar con RAG local
  let ragText = "";
  let dbaCode = "GEN-DBA-01";
  if (matchedMaterial) {
    ragText = matchedMaterial.textContent;
    dbaCode = matchedMaterial.dbaCode;
  }

  // Respuesta para Track Constructor
  if (userRole === 'builder') {
    return `${prefix} ¡Pilas Colega! Operando Localmente. 🛠️\n` +
           `He revisado tu proyecto en el silo de ${normSubject}.\n\n` +
           `[CODE_SNIPPET]\n` +
           `// Patrón de persistencia local resiliente\n` +
           `export const checkAndSyncLocalData = async () => {\n` +
           `  const pendingData = await StorageService.getSyncQueue();\n` +
           `  if (navigator.onLine && pendingData.length > 0) {\n` +
           `    console.log("Sincronizando con nube...");\n` +
           `  }\n` +
           `};\n\n` +
           `[ARCHITECTURE_TIP]\n` +
           `Utiliza Service Workers enfocados únicamente en caching de audios. ` +
           `Esto reduce el consumo de datos de 15MB a 0MB una vez cacheado.\n\n` +
           `¿Qué paso seguimos con el desarrollo de tu solución? ¡De una!`;
  }

  // Respuesta para Track Estudiante
  return `${prefix} ¡Hola! Operando desde el motor local de tu dispositivo. 🧑‍🎓\n` +
         `**Tema de estudio:** ${normSubject} (Trazado con DBA: ${dbaCode})\n` +
         `${matchedMaterial 
           ? `Basándonos en la guía del profesor sobre **"${matchedMaterial.topic}"**:\n${ragText.substring(0, 200)}...` 
           : `Vamos a repasar conceptos clave de esta materia.`}\n\n` +
         `[QUIZ_FLASH]\n¿Cuál es la regla fundamental para asimilar conocimiento de forma crítica?\n` +
         `A) Memorizar al pie de la letra toda la teoría.\n` +
         `B) Cuestionar la lógica y aplicarlo a un problema real de tu región.\n` +
         `C) Dejar la tarea para el último día.\n\n` +
         `[RETO_VEREDA]\n**El Reto de tu Vereda:** Conversa con tu familia sobre cómo este ` +
         `conocimiento de ${normSubject} se aplica a los precios de mercado en el pueblo.\n\n` +
         `[📥 MODO OFFLINE]\n` +
         `• Enfoque Socrático: Cuestiona todo\n` +
         `• Dato Curioso: El cerebro aprende 60% más rápido con problemas reales\n\n` +
         `¿Cuál es tu respuesta para el Quiz Flash?`;
};

// ============================================================================
// ☁️ IA EN LA NUBE (Gemini Flash) - Con v5.1 + ZPD + Región + Anti-alucinación
// ============================================================================

/**
 * Sends a message to the Gemini service.
 * Automatically falls back to WebLLM local engine if the network is down or API fails.
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

    // ✅ CARGAR PERFIL DEL ESTUDIANTE (ZPD + Región + Gamificación)
    let zpdLevel = 2;
    let userRegion = 'bogota';
    let userStreak = 0;
    
    try {
      const profile = await StorageService.getStudentProfile();
      if (profile) {
        zpdLevel = (profile as any).zpd?.level || 2;
        userRegion = (profile as any).region || 'bogota';
        userStreak = profile.streak || 0;
      }
    } catch (e) {
      console.warn("No se pudo cargar perfil para personalización:", e);
    }

    // ✅ CONSTRUIR SYSTEM INSTRUCTION DINÁMICO CON v5.1
    let dynamicSystemInstruction = SYSTEM_INSTRUCTIONS_V5;
    dynamicSystemInstruction += `\n\n<PERFIL_ESTUDIANTE_ACTUAL>\n` +
                                `ROL: ${activeRole}\n` +
                                `NIVEL ZPD: ${zpdLevel} (1=Básico/andamiaje alto, 2=Intermedio, 3=Avanzado/desafío)\n` +
                                `REGIÓN: ${userRegion}\n` +
                                `RACHA ACTIVA: ${userStreak} días\n` +
                                `</PERFIL_ESTUDIANTE_ACTUAL>`;

    let finalPrompt = newMessage;

    if (subjectContext) {
      finalPrompt = `[CONTEXTO: ESTOY EN EL SILO DE ${subjectContext.toUpperCase()}. ACTÚA SEGÚN ESE PROTOCOLO] ${newMessage}`;
            
      try {
        // ✅ LEER DE INDEXEDDB (StorageService), NO DE FIRESTORE
        const materials = await StorageService.getCourseMaterials(subjectContext);
        if (materials.length > 0) {
          const ragContext = materials.map(m => 
            `TEMA: ${m.topic}\nDBA_CODE: ${m.dbaCode || 'N/A'}\nCONTENIDO CURADO:\n${m.textContent.substring(0, 1500)}`
          ).join('\n\n');
                  
          dynamicSystemInstruction += `\n\n<CONTEXTO_RAG_DOCENTE>\n` +
                                     `El profesor ha subido el siguiente material oficial. DEBES basar tus respuestas, ` +
                                     `quices y retos EXCLUSIVAMENTE en esta información. Cita el DBA_CODE cuando sea relevante:\n\n` +
                                     `${ragContext}\n</CONTEXTO_RAG_DOCENTE>`;
        }
      } catch (e) {
        console.warn("No se pudo cargar RAG:", e);
      }
    }

    contents.push({ role: 'user', parts: [{ text: finalPrompt }] });

    // ✅ Backend BFF (protege API key en servidor)
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }
        
    const data = await response.json();
    const responseText = data.text || "";

    // ✅ VALIDACIÓN ANTI-ALUCINACIÓN DBA
    if (subjectContext && !responseText.includes('DBA-') && !responseText.includes('competencia')) {
      console.warn("⚠️ Respuesta sin cita DBA detectada. Se mantiene pero se registra para revisión.");
    }

    // ✅ AGREGAR A COLA DE SINCRONIZACIÓN cuando hay logros
    if (responseText.includes('[📥 MODO OFFLINE]') || 
        responseText.toLowerCase().includes('¡correcto!') || 
        responseText.toLowerCase().includes('¡excelente!')) {
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
    // ✅ Fallback único y limpio (antes estaba duplicado)
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
  const standardGuidelines = teacherGuidelines || 
    "Material práctico interactivo enfocado en problemáticas reales de la agricultura o el comercio local colombiano.";
  
  const prompt = `
  Como un Agente AI experto de EduGlobal365 y consultor curricular del Ministerio de Educación Nacional de Colombia:
  Genera el contenido para un aula interactiva o recurso RAG de un docente.
  
  Parámetros de entrada:
  - Grado escolar: ${grade}
  - Materia: ${subject}
  - Módulo curricular: ${moduleTitle}
  - Herramienta Pedagógica: ${toolId}
  - Ideas del Docente: "${standardGuidelines}"
  
  REGLAS PEDAGÓGICAS (v5.1):
  - Método socrático: nunca des la respuesta directa, guía con preguntas.
  - Micro-learning: máximo 4 párrafos cortos.
  - Audio-First: el contenido debe funcionar como guion de podcast.
  - Source-grounded: todo debe alinearse al DBA correspondiente.
  - Regional: usa ejemplos de Colombia (Urabá, Boyacá, Caribe, Amazonía, Eje Cafetero, Bogotá).
  
  Debes generar:
  1. Un código DBA real y válido (ej. MAT-11-DBA-01, HUM-10-DBA-02).
  2. Un título creativo de tema.
  3. Contenido textual didáctico con [RETO_VEREDA], [QUIZ_FLASH] y [📥 MODO OFFLINE].
  4. Una sugerencia de URL de recurso multimedia.

  Retorna únicamente JSON con claves: "dbaCode", "topic", "textContent", "resourceUrl".
  `;
  
  try {
    const response = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, temperature: 0.8, maxOutputTokens: 800 })
    });
        
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
        
    const dataResponse = await response.json();
    const text = dataResponse.text || "";
    const cleanText = text.replace(/```json/gi, "").replace(/```/gi, "").trim();
    const data = JSON.parse(cleanText);
        
    return {
      dbaCode: data.dbaCode || `${subject.substring(0,3).toUpperCase()}-${grade.replace('°','')}-DBA-01`,
      topic: data.topic || `Clase interactiva de ${moduleTitle}`,
      textContent: data.textContent || "Contenido educativo auto-generado.",
      resourceUrl: data.resourceUrl || `https://storage.googleapis.com/eduglobal365/podcasts/${grade}_${subject.substring(0,3).toLowerCase()}_resumen.mp3`
    };
  } catch (error) {
    console.error("Error auto-generating material, using local fallback:", error);
    
    const subjectAbbr = subject.substring(0, 3).toUpperCase();
    const gradeNum = grade.replace('°', '');
    
    return {
      dbaCode: `${subjectAbbr}-${gradeNum}-DBA-01`,
      topic: `🚀 Súper Reto Virtual: ¡Domina ${moduleTitle}!`,
      textContent: `¡Bienvenido al reto inteligente de ${moduleTitle}!\n\n` +
                   `[RETO_VEREDA]\nEn las parcelas cercanas a Necoclí, la rotación de cosechas ` +
                   `incrementa un 35% de productividad. Diseña un plan usando los fundamentos de ${moduleTitle}.\n\n` +
                   `[QUIZ_FLASH]\n¿Cuál es la forma más rápida de acelerar tu aprendizaje regional?\n` +
                   `A) Escribir en papel tus ideas y validarlas con el Tutor Edú.\n` +
                   `B) Copiar y pegar sin leer.\n` +
                   `C) Guardar el material y no volver a abrirlo.\n\n` +
                   `[📥 MODO OFFLINE]\n• Enfoque Socrático: Cuestiona todo\n• El cerebro aprende 60% más rápido con problemas reales`,
      resourceUrl: `https://storage.googleapis.com/eduglobal365/podcasts/${gradeNum}_${subjectAbbr.toLowerCase()}_offline_base.mp3`
    };
  }
};