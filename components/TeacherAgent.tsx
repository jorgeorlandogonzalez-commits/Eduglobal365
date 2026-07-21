import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Message, Role } from '../config/types';
import { sendMessageToGemini } from '../services/geminiService';

export const TeacherAgent: React.FC<{ onApplyGeneratedContent: (content: string, resourceUrl: string) => void }> = ({ onApplyGeneratedContent }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: Role.MODEL, text: '¡Hola! Soy tu Agente AI Docente. Ayudo a diseñar currículos alineados al MEN, enfocados en el modelo SAS BIC y metodologías activas. ¿Qué tema vas a enseñar hoy y para qué región de Colombia? Si deseas que genere contenido directamente, solo pídeme "Generar el material".', timestamp: Date.now(), track: 'teacher' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: Role.USER, text: input, timestamp: Date.now(), track: 'teacher' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const contextWithInstructions = [...messages, { id: '0', role: Role.USER, text: '[SISTEMA] Si vas a generar el material final, pon el formato requerido entre etiquetas <MATERIAL>...</MATERIAL>.', timestamp: Date.now(), track: 'teacher' } as Message];
    const aiResponse = await sendMessageToGemini(contextWithInstructions, input, 'Teacher Portal', 'teacher', 'teacher');
    
    const aiMsg: Message = { id: Date.now().toString(), role: Role.MODEL, text: aiResponse, timestamp: Date.now(), track: 'teacher' };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const extractMaterial = (text: string) => {
    const match = text.match(/<MATERIAL>([\s\S]*?)<\/MATERIAL>/);
    if (match && match[1]) {
      return match[1].trim();
    }
    return text;
  };

  return (
    <div className="flex flex-col h-[400px] border border-indigo-200 dark:border-indigo-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map(msg => {
            const hasMaterial = msg.text.includes('<MATERIAL>');
            const displayText = msg.text.replace(/<MATERIAL>[\s\S]*?<\/MATERIAL>/, '[MATERIAL GENERADO]');

            return (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === Role.USER ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === Role.USER ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'}`}>
                <div className="whitespace-pre-wrap">{displayText}</div>
                {hasMaterial && (
                  <button onClick={() => onApplyGeneratedContent(extractMaterial(msg.text), "https://storage.googleapis.com/eduglobal365/podcasts/auto_generado.mp3")} className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 rounded shadow-sm">
                    Aplicar Contenido al Módulo
                  </button>
                )}
              </div>
            </motion.div>
          )})}
        </AnimatePresence>
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-xl animate-pulse flex gap-1">
              <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyPress={e => e.key === 'Enter' && handleSend()} 
            placeholder="Pregunta o pide generar contenido..." 
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-indigo-700">
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};
