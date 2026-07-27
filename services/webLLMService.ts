import * as webllm from '@mlc-ai/web-llm';
import { Message, UserRole } from '../config/types';

// WebLLM currently provides MLC chat endpoints.
const SELECTED_MODEL = 'gemma-2b-it-q4f16_1-MLC';

class WebLLMService {
  private engine: webllm.MLCEngine | null = null;
  private ready: boolean = false;
  
  async init(onProgress?: (progress: number, text: string) => void) {
    if (this.ready) return;
    
    try {
      this.engine = new webllm.MLCEngine();
      
      this.engine.setInitProgressCallback((report) => {
        if (onProgress) {
          onProgress(report.progress, report.text);
        }
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

  async generate(chatHistory: Message[], newMessage: string, subject: string, userRole: UserRole): Promise<string> {
    if (!this.ready || !this.engine) {
      throw new Error('WebLLM is not initialized.');
    }

    const messages = chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    messages.push({
      role: 'user',
      content: newMessage
    });

    // We format it explicitly with some system prompt if possible,
    // or just let Gemma handle it.
    
    // In WebLLM, you just pass the standard chat completion format
    const request = {
      messages: messages as any[],
      temperature: 0.7,
      max_tokens: 1024,
    };

    const reply = await this.engine.chat.completions.create(request);
    
    return reply.choices[0].message.content || 'Sin respuesta...';
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
