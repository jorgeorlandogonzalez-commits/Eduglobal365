// src/services/geminiService.ts
import { GoogleGenAI, Content, Part } from "@google/genai";
import { Message, UserRole } from "../config/types";
import { SYSTEM_INSTRUCTIONS_V5 } from "../config/constants";
import { StorageService } from "./storageService";
import { webLLMInstance } from "./webLLMService";

// Lazy initialization del cliente Gemini
let aiInstance: GoogleGenAI | null = null;
const getAI = (): GoogleGenAI => {
  if (!aiInstance) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) console.warn("VITE_GEMINI_API_KEY no configurada.");
    aiInstance = new GoogleGenAI({ apiKey: apiKey || "demo-key" });
  }
  return aiInstance;
};

// ✅ OT#1: PING REAL. navigator.onLine detecta red, no internet real (WiFi sin salida en zonas rurales).
export const checkRealConnection = async (): Promise<boolean> => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return false;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    await fetch('https://www.googleapis.com/generate_204', { method: 'HEAD', mode: 'no-cors', cache: 'no-store', signal: ctrl.signal });
    clearTimeout(t);
    return true;
  } catch { return false; }
};

/**
 * Motor local Gemma 2B (WebLLM) con fallback estático rico.
 */
export const sendMessageToGemmaOffline = async (
  chatHistory: Message[],
  newMessage: string,
  subjectContext: string | null = null,
  userRole: UserRole = 'student'
): Promise<string> => {
  if (webLLMInstance.isReady()) {
    try {
      return await webLLMInstance.generate(chatHistory, newMessage, userRole, subjectContext);
    } catch (e) {
      console.error('WebLLM falló; usando fallback estático:', e);
    }
  }
  const normSubject = subjectContext || 'General';
  const materials = StorageService.getCourseMaterials(normSubject);
  const matched = materials[0];
  const dbaCode = matched?.dbaCode || 'GEN-DBA-01';
  const prefix = '[💡 GEMMA 2B LOCAL ENGINE — MODO RESPALDO]';

  if (newMessage.toUpperCase().includes('SIMULACRO') || chatHistory.some(h => h.text.includes('SIMULACRO'))) {
    return `${prefix} ¡Simulacro offline activo!\nPregunta 1 de 5:\nSi una vereda cosecha 120 bultos de café y vende el 40% a la cooperativa, ¿cuántos bultos quedan?\nA) 48\nB) 72\nC) 60\nD) 80\nEscribe solo la letra. ¡Pilas!`;
  }
  if (userRole === 'builder') {
    return `${prefix} ¡Pilas Colega! 🛠️ Proyecto en silo ${normSubject}.\n\n[CODE_SNIPPET]\n// Persistencia local resiliente\nconst pending = await StorageService.getSyncQueue();\nif (navigator.onLine && pending.length) console.log('Sincronizando...');\n\n[ARCHITECTURE_TIP]\nService Workers: cachea solo audios. De 15MB a 0MB tras el primer uso.\n\n¿Qué paso sigue? ¡De una!`;
  }
  return `${prefix} Operando local sin internet. 🧑‍🎓\n**Tema:** ${normSubject} (DBA: ${dbaCode})\n${matched ? `Guía del docente: **"${matched.topic}" — ${matched.textContent.substring(0, 150)}...` : 'Repasemos conceptos clave.'}\n\n[QUIZ_FLASH]\n¿Cómo se asimila mejor el conocimiento?\nA) Memorizando sin entender\nB) Cuestionando y aplicando a tu región\nC) Dejándolo para después\n\n[RETO_VEREDA]\nConversa con tu familia cómo ${normSubject} se aplica a los precios del mercado local.\n\n[📥 MODO OFFLINE]\n• Enfoque Socrático: cuestiona todo\n• Aprender haciendo: impacto real\n• Reflexión: ¿Dónde lo aplicarás mañana?`;
};

/**
 * Enrutador híbrido: Online → Gemini | Offline/forzado → Gemma 2B local.
 */
export const sendMessageToGemini = async (
  chatHistory: Message[],
  newMessage: string,
  subjectContext: string | null = null,
  userRole: UserRole = 'student',
  track?: UserRole,
  forceLocal?: boolean // ✅ OT#1: botón 🤖 del usuario
): Promise<string> => {
  const activeRole = track || userRole;

  const hasNet = forceLocal ? false : await checkRealConnection();
  if (!hasNet) {
    return sendMessageToGemmaOffline(chatHistory, newMessage, subjectContext, activeRole);
  }

  try {
    const ai = getAI();
    const contents: Content[] = chatHistory.map((msg) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text } as Part],
    }));

    let dynamicSystemInstruction = SYSTEM_INSTRUCTIONS_V5;
    dynamicSystemInstruction += `\n\n<ROL_ACTUAL>\nEl usuario actual es un: ${activeRole}\n</ROL_ACTUAL>`;

    let finalPrompt = newMessage;
    if (subjectContext) {
      finalPrompt = `[CONTEXTO: ESTOY EN EL SILO DE ${subjectContext.toUpperCase()}. ACTÚA SEGÚN ESE PROTOCOLO] ${newMessage}`;
      const materials = StorageService.getCourseMaterials(subjectContext);
      if (materials.length > 0) {
        const ragContext = materials.map(m => `TEMA: ${m.topic}\nDBA_CODE: ${m.dbaCode || 'N/A'}\nCONTENIDO CURADO:\n${m.textContent.substring(0, 1500)}`).join('\n\n');
        dynamicSystemInstruction += `\n\n<CONTEXTO_RAG_DOCENTE>\nMaterial oficial del docente. Responde EXCLUSIVAMENTE desde aquí y cita el DBA_CODE:\n\n${ragContext}\n</CONTEXTO_RAG_DOCENTE>`;
      }
    }

    contents.push({ role: 'user', parts: [{ text: finalPrompt } as Part] });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents,
      config: { systemInstruction: dynamicSystemInstruction, temperature: 0.7, topK: 40, topP: 0.9, maxOutputTokens: 1024 },
    });

    return response.text || await sendMessageToGemmaOffline(chatHistory, newMessage, subjectContext, activeRole);
  } catch (error) {
    console.error('Gemini API falló; fallback local:', error);
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
      textContent: `¡Bienvenido al reto inteligente de ${moduleTitle}!\\n\\n` +
                   `[RETO_VEREDA]\\nEn las parcelas cercanas a Necoclí, la rotación de cosechas ` +
                   `incrementa un 35% de productividad. Diseña un plan usando los fundamentos de ${moduleTitle}.\\n\\n` +
                   `[QUIZ_FLASH]\\n¿Cuál es la forma más rápida de acelerar tu aprendizaje regional?\\n` +
                   `A) Escribir en papel tus ideas y validarlas con el Tutor Edú.\\n` +
                   `B) Copiar y pegar sin leer.\\n` +
                   `C) Guardar el material y no volver a abrirlo.\\n\\n` +
                   `[📥 MODO OFFLINE]\\n• Enfoque Socrático: Cuestiona todo\\n• El cerebro aprende 60% más rápido con problemas reales`,
      resourceUrl: `https://storage.googleapis.com/eduglobal365/podcasts/${gradeNum}_${subjectAbbr.toLowerCase()}_offline_base.mp3`
    };
  }
};
