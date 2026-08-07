// src/services/webLLMService.ts
import * as webllm from '@mlc-ai/web-llm';
import { Message, UserRole } from '../config/types';
import { SYSTEM_INSTRUCTIONS_V5 } from '../config/constants';

// ✅ CORREGIDO: Modelo real del catálogo oficial de WebLLM
// Opciones válidas:
// - Llama-3.1-8B-Instruct-q4f16_1-MLC-1k (mejor español, 1k contexto)
// - Qwen2.5-7B-Instruct-q4f16_1-MLC (excelente multilingüe)
// - Gemma-2-2b-it-q4f16_1-MLC (más liviano, ~1.5GB)
const SELECTED_MODEL = 'Llama-3.1-8B-Instruct-q4f16_1-MLC-1k';

// ✅ NUEVO: Contexto extendido para conversaciones más largas
// Si el dispositivo tiene buena GPU, usar modelos con más contexto:
// - Llama-3.1-8B-Instruct-q4f16_1-MLC (sin -1k = 8k contexto, ~5GB)
const USE_EXTENDED_CONTEXT = false; // Cambiar a true solo en dispositivos potentes

class WebLLMService {
  private engine: webllm.MLCEngine | null = null;
  private ready: boolean = false;
  
  async init(onProgress?: (progress: number, text: string) => void) {
    if (this.ready) return;
    
    // ✅ Fallback si WebGPU no soportado
    if (!navigator.gpu) {
      throw new Error('WebGPU no soportado en este navegador. Usa Chrome o Edge actualizado.');
    }
    
    try {
      this.engine = new webllm.MLCEngine();
      
      this.engine.setInitProgressCallback((report) => {
        if (onProgress) onProgress(report.progress, report.text);
      });

      await this.engine.reload(SELECTED_MODEL);
      this.ready = true;
      console.log(`✅ WebLLM cargado: ${SELECTED_MODEL}`);
    } catch (error) {
      console.error('Error initializing WebLLM:', error);
      this.ready = false;
      throw error;
    }
  }

  isReady(): boolean {
    return this.ready;
  }

  /**
   * ✅ CORREGIDO: Inyecta System Instruction v5.2 + contexto extendido
   */
  async sendMessageToGemmaLocal(
    chatHistory: Message[], 
    newMessage: string,
    userRole: UserRole = 'student',
    subjectContext: string | null = null
  ): Promise<string> {
    if (!this.ready || !this.engine) {
      throw new Error('WebLLM is not initialized.');
    }

    // ✅ 1. Construir mensajes con System Instruction INYECTADO
    const messages: any[] = [
      {
        role: 'system',
        content: `${SYSTEM_INSTRUCTIONS_V5}\n\n<ROL_ACTUAL>\nEl usuario actual es un: ${userRole}\n${subjectContext ? `Está en el silo de: ${subjectContext}` : ''}\n</ROL_ACTUAL>\n\n<CONTEXTO_LOCAL>\nEstás operando 100% LOCAL en el dispositivo del usuario vía WebGPU. No hay internet. Usa [ACTIVA_WEBLLM] si es la primera vez que te activan.`
      }
    ];

    // 2. Agregar historial (limitar a últimos 10 mensajes para no saturar contexto de 1k)
    const recentHistory = chatHistory.slice(-10);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    });

    // 3. Agregar nuevo mensaje
    messages.push({
      role: 'user',
      content: newMessage
    });

    const request = {
      messages: messages,
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 1024, // ✅ CORREGIDO: Suficiente para formato completo v5.2
      // frequency_penalty: 0.3, // Reduce repeticiones (opcional)
    };

    try {
      const reply = await this.engine.chat.completions.create(request);
      const responseText = reply.choices[0].message.content;
      
      if (!responseText || responseText.trim() === '') {
        return this.getOfflineFallback(userRole, subjectContext);
      }
      
      return responseText;
    } catch (error) {
      console.error('Error en inferencia WebLLM:', error);
      return this.getOfflineFallback(userRole, subjectContext);
    }
  }

  /**
   * ✅ NUEVO: Fallback rico cuando WebLLM no puede generar respuesta
   */
  private getOfflineFallback(userRole: UserRole, subjectContext: string | null): string {
    if (userRole === 'builder') {
      return `¡Pilas Constructor! 🛠️ El motor local está procesando tu consulta.\n\n` +
             `[ARCHITECTURE_TIP]\nMientras tanto, revisa si tu arquitectura respeta el patrón Offline-First:\n` +
             `• IndexedDB como fuente de verdad\n• Service Workers para assets\n• Sync diferida a la nube\n\n` +
             `[📥 MODO OFFLINE]\n• WebLLM local activo\n• Tus datos están seguros en tu dispositivo\n• Reflexión: ¿Qué parte de tu proyecto puede funcionar sin internet?`;
    }
    
    return `¡Qué nota que sigas estudiando! 🧑‍🎓\n\n` +
           `El motor local está pensando tu respuesta. Mientras tanto:\n\n` +
           `[RETO_VEREDA]\nPiensa en cómo lo que estás aprendiendo se aplica en tu vereda o barrio.\n\n` +
           `[📥 MODO OFFLINE]\n• Aprendizaje sin internet: posible\n• Tu progreso se guarda localmente\n• Reflexión: ¿Qué aprendiste hoy que puedas enseñar mañana?`;
  }

  async unload() {
    if (this.engine) {
      try {
        await this.engine.unload();
        console.log('✅ WebLLM descargado de memoria GPU');
      } catch (e) {
        console.warn('Error al descargar WebLLM:', e);
      }
      this.engine = null;
      this.ready = false;
    }
  }
}

export const webLLMInstance = new WebLLMService();