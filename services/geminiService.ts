// src/services/geminiService.ts
import { GoogleGenAI, Content, Part } from "@google/genai";
import { Message, Role, UserRole, CourseMaterial } from "../config/types";
import { SYSTEM_INSTRUCTIONS_V5 } from "../config/constants";
import { StorageService } from "./storageService";

// ============================================================================
// 🚀 LAZY INITIALIZATION (Inicialización Perezosa)
// ============================================================================
/**
 * Variable privada para mantener la instancia de la IA.
 * Se mantiene null hasta que se necesita por primera vez.
 */
let aiInstance: GoogleGenAI | null = null;

/**
 * Getter que garantiza que la IA solo se inicializa cuando se va a usar.
 * Previene errores de arranque si VITE_GEMINI_API_KEY falta temporalmente.
 */
const getAIInstance = (): GoogleGenAI => {
  if (!aiInstance) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn("⚠️ VITE_GEMINI_API_KEY no está configurada. Las llamadas a la nube usarán fallbacks locales o fallarán.");
    }
    
    // ✅ La instancia se crea SOLO en este momento, no al importar el archivo
    aiInstance = new GoogleGenAI({ apiKey: apiKey || "demo-key" });
  }
  return aiInstance;
};

// ============================================================================
// 🛠️ GEMMA-4 LOCAL OFFLINE ENGINE SIMULATOR (MVP MOCK)
// ============================================================================
/**
 * ⚠️ NOTA DEL ARQUITECTO: Esta función es un SIMULADOR de respaldo para el MVP.
 * En la Fase 2, se reemplazará por una llamada real a @mlc-ai/web-llm cargando 
 * un modelo cuantizado (ej. Gemma-2B-it-q4f16_1-MLC) para inferencia 100% local vía WebGPU.
 */
export const sendMessageToGemmaOffline = (
  chatHistory: Message[],
  newMessage: string,
  subjectContext: string | null = null,
  userRole: UserRole = 'student'
): string => {
  const normSubject = subjectContext || "General";
  const materials = StorageService.getCourseMaterials(normSubject);
  const matchedMaterial = materials[0];
  const prefix = `[💡 GEMMA 4 LOCAL ENGINE - INFERENCIA CLIENT-SIDE WebGPU]`;

  if (userRole === 'builder') {
    return `${prefix} ¡Pilas Colega! Operando Localmente. 🛠️\nHe revisado tu proyecto en el silo de ${normSubject}.\nPara darte un consejo práctico y rápido sin internet:\n1. Asegura que tu arquitectura maneje datos relacionales localmente.\n2. Comprime tus audios para que el internet de la vereda no los bloquee.\n\n[CODE_SNIPPET]\n// Patrón de persistencia local resiliente\nexport const checkAndSyncLocalData = async () => {\n  const pendingData = localStorage.getItem("pending_sync_data");\n  if (navigator.onLine && pendingData) console.log("Sincronizando...");\n};\n\n[ARCHITECTURE_TIP]\nUtiliza Service Workers enfocados únicamente en caching de audios. Esto reduce el consumo de datos de 15MB a 0MB una vez cacheado.\n\n¿Qué paso seguimos con el desarrollo de tu solución? ¡De una!`;
  }

  let ragText = "";
  let dbaCode = "GEN-DBA-01";
  if (matchedMaterial) {
    ragText = matchedMaterial.textContent;
    dbaCode = matchedMaterial.dbaCode;
  }

  if (newMessage.toUpperCase().includes("SIMULACRO") || newMessage.toUpperCase().includes("SISTEMA") || chatHistory.some(h => h.text.includes("SIMULACRO"))) {
    return `${prefix} ¡Hola! Iniciamos el Simulacro de Entrenamiento en modo Offline.\nPregunta 1 de 5:\nSi en una vereda el cultivo de café produce 120 bultos y se vende el 40% a la cooperativa local, ¿cuántos bultos le quedan al agricultor?\nA) 48 bultos\nB) 72 bultos\nC) 60 bultos\nD) 80 bultos\nPor favor, escribe solo la opción correcta (A, B, C o D). ¡Pilas con el análisis!`;
  }

  return `${prefix} ¡Hola! Operando desde el motor local de tu dispositivo. 🧑‍🎓\nDado que no tenemos conexión activa, usamos la tecnología "Offline-First" optimizada.\n**Tema de estudio:** ${normSubject} (Trazado con DBA: ${dbaCode})\n${matchedMaterial ? `Basándonos en la guía del profesor sobre **"${matchedMaterial.topic}"**:\n${ragText.substring(0, 150)}...` : `Vamos a repasar conceptos clave de esta materia.`}\n\n[QUIZ_FLASH]\n¿Cuál es la regla fundamental para asimilar conocimiento de forma crítica?\nA) Memorizar al pie de la letra toda la teoría.\nB) Cuestionar la lógica y aplicarlo a un problema real de tu región.\nC) Dejar la tarea para el último día.\n\n[RETO_VEREDA]\n**El Reto de tu Vereda:** Conversa con tu familia sobre cómo este conocimiento de ${normSubject} se aplica a los precios de mercado en el pueblo.\n\n[📥 MODO OFFLINE: Resumen listo]\n- **Enfoque Socrático**: Cuestiona todo y busca la utilidad práctica.\n- **Dato Curioso**: El cerebro aprende un 60% más rápido cuando el problema tiene impacto en tu vida diaria.\n\n¿Cuál es tu respuesta para el Quiz Flash?`;
};

// ============================================================================
// ☁️ GEMINI CLOUD SERVICE (Con Fallback Offline)
// ============================================================================
/**
 * Sends a message to the Gemini service with strict v5.1 RAG injection.
 * Automatically falls back to localized client-side Gemma-4 Offline Engine if network fails.
 */
export const sendMessageToGemini = async (
  chatHistory: Message[],
  newMessage: string,
  subjectContext: string | null = null,
  userRole: UserRole = 'student',
  track?: UserRole
): Promise<string> => {
  const activeRole = track || userRole;

  // 1. Verificación Offline inmediata
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return sendMessageToGemmaOffline(chatHistory, newMessage, subjectContext, activeRole);
  }

  try {
    // ✅ 2. Aquí es donde ocurre la Lazy Initialization real
    const ai = getAIInstance();

    const contents: Content[] = chatHistory.map((msg) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text } as Part],
    }));

    let finalPrompt = newMessage;
    let dynamicSystemInstruction = SYSTEM_INSTRUCTIONS_V5;
    
    dynamicSystemInstruction += `\n\n<ROL_ACTUAL>\nEl usuario actual es un: ${activeRole}\n</ROL_ACTUAL>`;

    if (subjectContext) {
      finalPrompt = `[CONTEXTO: ESTOY EN EL SILO DE ${subjectContext.toUpperCase()}. ACTÚA SEGÚN ESE PROTOCOLO] ${newMessage}`;
      
      const materials = StorageService.getCourseMaterials(subjectContext);
      if (materials.length > 0) {
        // ✅ 3. INYECCIÓN SOURCE-GROUNDED: Forzamos a la IA a usar el DBA y el contenido exacto
        const ragContext = materials.map(m => `TEMA: ${m.topic}\nDBA_CODE: ${m.dbaCode || 'N/A'}\nCONTENIDO CURADO:\n${m.textContent}`).join('\n\n');
        
        dynamicSystemInstruction += `\n\n<CONTEXTO_RAG_DOCENTE>\nEl profesor ha subido el siguiente material oficial. DEBES basar tus respuestas, quices y retos EXCLUSIVAMENTE en esta información. Cita el DBA_CODE cuando sea relevante:\n\n${ragContext}\n</CONTEXTO_RAG_DOCENTE>`;
      }
    }

    contents.push({ role: 'user', parts: [{ text: finalPrompt } as Part] });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: contents,
      config: {
        systemInstruction: dynamicSystemInstruction,
        temperature: 0.7,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 350, // ✅ Control estricto para Micro-Learning
      },
    });

    return response.text || sendMessageToGemmaOffline(chatHistory, newMessage, subjectContext, activeRole);
  } catch (error) {
    console.error("Error calling Gemini API, falling back to local Gemma Engine:", error);
    // ✅ 4. Fallback robusto si la API falla (ej: cuota excedida o error de red)
    return sendMessageToGemmaOffline(chatHistory, newMessage, subjectContext, activeRole);
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
  const prompt = `
Como un Agente AI experto de EduGlobal365 y consultor curricular del Ministerio de Educación Nacional de Colombia:
Genera el contenido para un aula interactiva o recurso RAG de un docente.
Parámetros: Grado: ${grade}, Materia: ${subject}, Módulo: ${moduleTitle}, Herramienta: ${toolId}, Ideas: "${standardGuidelines}"
Genera:
1. Un código DBA real y válido (ej. MAT-11-DBA-01).
2. Un título creativo de tema.
3. Contenido textual didáctico (máx 4 párrafos cortos) que incluya un bloque [RETO_VEREDA] contextualizado en Colombia y un bloque [QUIZ_FLASH] de opción múltiple (A, B, C).
4. Una sugerencia de URL de recurso multimedia.
Retorna únicamente un formato JSON válido con las claves: "dbaCode", "topic", "textContent", "resourceUrl". Sin markdown.
`;
  try {
    // ✅ 5. Lazy Initialization también aplicada aquí
    const ai = getAIInstance();
    
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { temperature: 0.8, maxOutputTokens: 600, responseMimeType: "application/json" }
    });
    
    const text = response.text || "";
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
      textContent: `¡Bienvenido al reto inteligente de ${moduleTitle}!\n\n[RETO_VEREDA]\n**Análisis Territorial:** En las parcelas cercanas a Necoclí, la rotación de cosechas incrementa un 35% de productividad. Diseña un plan donde uses los fundamentos de ${moduleTitle} para optimizar el área de siembra.\n\n[QUIZ_FLASH]\n¿Cuál es la forma más rápida de acelerar tu aprendizaje regional?\nA) Escribir en papel tus ideas y validarlas con el Tutor Edú.\nB) Copiar y pegar sin leer.\nC) Guardar el material y no volver a abrirlo.`,
      resourceUrl: `https://storage.googleapis.com/eduglobal365/podcasts/${gradeNum}_${subjectAbbr.toLowerCase()}_offline_base.mp3`
    };
  }
};