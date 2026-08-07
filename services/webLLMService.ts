// src/services/webLLMService.ts
import * as webllm from '@mlc-ai/web-llm';
import { Message, UserRole } from '../config/types';
import { SYSTEM_INSTRUCTIONS_V5 } from '../config/constants';

const SELECTED_MODEL = 'Llama-3-8B-Instruct-q4f32_1-MLC-1k'; 
// Nota: Gemma-2B-it-q4f16_1-MLC es válido también, pero Llama-3-8B tiene mejor español

class WebLLMService {
  private engine: webllm.MLCEngine | null = null;
  private ready: boolean = false;
  
  async init(onProgress?: (progress: number, text: string) => void) {
    if (this.ready) return;
    
    // ✅ Fallback si WebGPU no soportado
    if (!navigator.gpu) {
      throw new Error('WebGPU no soportado. Usando modo estático.');
    }
    
    try {
      this.engine = new webllm.MLCEngine();
      
      this.engine.setInitProgressCallback((report) => {
        if (onProgress) onProgress(report.progress, report.text);
      });

      await this.engine.reload(SELECTED_MODEL);
      this.ready = true;
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
   * ✅ CORREGIDO: Ahora inyecta el System Instruction v5.2 completo
   * para que la IA local se comporte como Tutor Edú con método socrático
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
        content: `${SYSTEM_INSTRUCTIONS_V5}\n\n<ROL_ACTUAL>\nEl usuario actual es un: ${userRole}\n${subjectContext ? `Está en el silo de: ${subjectContext}` : ''}\n</ROL_ACTUAL>\n\n<CONTEXTO_LOCAL>\nEstás operando 100% LOCAL en el dispositivo del usuario vía WebGPU. No hay internet. Usa [ACTIVA_WEBLLM] si es la primera vez.`
      }
    ];

    // 2. Agregar historial
    chatHistory.forEach(msg => {
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
      max_tokens: 500, // Micro-learning: respuestas cortas
    };

    const reply = await this.engine.chat.completions.create(request);
    return reply.choices[0].message.content || '[📥 MODO OFFLINE]\n• Sin respuesta local\n• Intenta reconectar';
  }

  async unload() {
    if (this.engine) {
      await this.engine.unload();
      this.engine = null;
      this.ready = false;
    }
  }
}

export const webLLMInstance = new WebLLMService();