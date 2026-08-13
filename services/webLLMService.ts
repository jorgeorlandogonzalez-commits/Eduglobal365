// src/services/webLLMService.ts
import * as webllm from '@mlc-ai/web-llm';
import { Message, UserRole } from '../config/types';
import { SYSTEM_INSTRUCTIONS_V5 } from '../config/constants';

// ✅ OT#1: Modelos REALES del catálogo oficial @mlc-ai/web-llm (consistente con docs: "Gemma 2B")
const PRIMARY_MODEL = 'gemma-2b-it-q4f16_1-MLC';
const FALLBACK_MODEL = 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC';

class WebLLMService {
  private engine: webllm.MLCEngine | null = null;
  private ready = false;
  private loadedModel: string | null = null;

  async init(onProgress?: (progress: number, text: string) => void): Promise<string> {
    if (this.ready && this.engine) return this.loadedModel as string;
    if (!navigator.gpu) throw new Error('WebGPU no soportado en este navegador.');
    this.engine = new webllm.MLCEngine();
    this.engine.setInitProgressCallback((r) => { if (onProgress) onProgress(r.progress, r.text); });
    try {
      await this.engine.reload(PRIMARY_MODEL);
      this.loadedModel = PRIMARY_MODEL;
    } catch (e) {
      console.warn('Modelo primario falló; intentando fallback liviano:', e);
      await this.engine.reload(FALLBACK_MODEL);
      this.loadedModel = FALLBACK_MODEL;
    }
    this.ready = true;
    console.log(`✅ WebLLM cargado: ${this.loadedModel}`);
    return this.loadedModel;
  }

  isReady(): boolean { return this.ready; }
  getLoadedModel(): string | null { return this.loadedModel; }

  async generate(chatHistory: Message[], newMessage: string, userRole: UserRole = 'student', subjectContext: string | null = null): Promise<string> {
    if (!this.ready || !this.engine) throw new Error('WebLLM no inicializado.');
    const messages: any[] = [{
      role: 'system',
      content: `${SYSTEM_INSTRUCTIONS_V5}\n\n<ROL_ACTUAL>\nEl usuario actual es un: ${userRole}\n${subjectContext ? `Está en el silo de: ${subjectContext}` : ''}\n</ROL_ACTUAL>\n\n<CONTEXTO_LOCAL>\nEstás operando 100% LOCAL en el dispositivo vía WebGPU (Gemma 2B). No hay internet. Respeta el FORMATO_DE_SALIDA_ESTANDAR completo.\n</CONTEXTO_LOCAL>`
    }];
    chatHistory.slice(-10).forEach(m => messages.push({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));
    messages.push({ role: 'user', content: newMessage });
    const reply = await this.engine.chat.completions.create({ messages, temperature: 0.7, max_tokens: 1024 });
    return reply.choices[0].message?.content || this.staticFallback(userRole, subjectContext);
  }

  private staticFallback(userRole: UserRole, subjectContext: string | null): string {
    const s = subjectContext || 'General';
    if (userRole === 'builder') {
      return `¡Pilas Constructor! 🛠️ Motor local en modo respaldo.\n\n[ARCHITECTURE_TIP]\nMantén IndexedDB como fuente de verdad y Service Workers cacheando solo audios.\n\n[📥 MODO OFFLINE]\n• Offline-First: local primero, nube después\n• Reflexión: ¿Qué parte de tu proyecto funciona sin internet?`;
    }
    return `¡Qué nota que sigas estudiando! 🧑‍🎓\n\n[RETO_VEREDA]\nPiensa cómo lo que aprendes en ${s} se aplica en tu vereda o barrio.\n\n[📥 MODO OFFLINE]\n• Aprendizaje sin internet: posible\n• Tu progreso se guarda localmente\n• Reflexión: ¿Qué aprendiste hoy que puedas enseñar mañana?`;
  }

  async unload(): Promise<void> {
    if (this.engine) {
      try { await this.engine.unload(); console.log('✅ WebLLM liberado de GPU'); } catch (e) { console.warn(e); }
      this.engine = null; this.ready = false; this.loadedModel = null;
    }
  }
}

export const webLLMInstance = new WebLLMService();
