// src/components/ChatBubble.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Message, Role, UserRole } from '../config/types';

interface ChatBubbleProps {
  message: Message;
  onOptionSelect?: (option: string) => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onOptionSelect }) => {
  const isUser = message.role === Role.USER;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = message.text.replace(/\[.*?\]/g, '').replace(/[*_~`#]/g, '').trim();
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  useEffect(() => {
    return () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();

      const textToRead = message.text
        .replace(/[*_~`#]/g, '')
        .replace(/\[.*?\]/g, '')
        .trim();

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'es-CO';

      const voices = window.speechSynthesis.getVoices();
      let bestVoice = voices.find(v => v.lang.includes('es-CO') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium')));
      if (!bestVoice) bestVoice = voices.find(v => v.lang.includes('es-CO'));
      if (!bestVoice) bestVoice = voices.find(v => v.lang.startsWith('es-') && (v.name.includes('Google') || v.name.includes('Natural')));
      if (!bestVoice) bestVoice = voices.find(v => v.lang.startsWith('es-'));

      if (bestVoice) utterance.voice = bestVoice;

      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // ==========================================================================
  // RENDER CONTENT - Parseo de comandos multimodales v5.2
  // ==========================================================================
  const renderContent = (text: string) => {
    // 1. Detect Offline Summary
    const offlineRegex = /\[📥 MODO OFFLINE:([\s\S]*?)\]|\[📥 MODO OFFLINE\]([\s\S]*?)(?=\n\n|$)/i;
    const offlineMatch = text.match(offlineRegex);
    const offlineContent = offlineMatch ? (offlineMatch[1] || offlineMatch[2]).trim() : null;
    let mainContent = text.replace(offlineRegex, '').trim();

    // 2. Detect Podcast Trigger
    const podcastRegex = /\[PODCAST_TRIGGER:\s*"([^"]+)"\]/i;
    const podcastMatch = mainContent.match(podcastRegex);
    const podcastTopic = podcastMatch ? podcastMatch[1] : null;
    mainContent = mainContent.replace(podcastRegex, '').trim();

    // 3. Detect Video Suggestion (Fase 2)
    const videoRegex = /\[VIDEO_SUGGESTION:\s*"([^"]+)"\]/i;
    const videoMatch = mainContent.match(videoRegex);
    const videoTopic = videoMatch ? videoMatch[1] : null;
    mainContent = mainContent.replace(videoRegex, '').trim();

    // 4. Detect Quiz Flash & Reto Vereda (presencia)
    const hasQuizFlash = mainContent.includes('[QUIZ_FLASH]');
    mainContent = mainContent.replace(/\[QUIZ_FLASH\]/gi, '').trim();

    const hasRetoVereda = mainContent.includes('[RETO_VEREDA]');
    mainContent = mainContent.replace(/\[RETO_VEREDA\]/gi, '').trim();

    const hasRetoConstructor = mainContent.includes('[RETO_CONSTRUCTOR]');
    mainContent = mainContent.replace(/\[RETO_CONSTRUCTOR\]/gi, '').trim();

    // 5. Detect Code & Architecture (Track Constructor)
    const hasCodeSnippet = mainContent.includes('[CODE_SNIPPET]');
    mainContent = mainContent.replace(/\[CODE_SNIPPET\]/gi, '').trim();

    const hasArchitectureTip = mainContent.includes('[ARCHITECTURE_TIP]');
    mainContent = mainContent.replace(/\[ARCHITECTURE_TIP\]/gi, '').trim();

    // 6. ✅ NUEVO: Detect v5.2 Multimodal Commands (Track Estudiante)
    const hasExportaJson = mainContent.includes('[EXPORTA_JSON]');
    mainContent = mainContent.replace(/\[EXPORTA_JSON\]/gi, '').trim();

    const hasInstalaPWA = mainContent.includes('[INSTALA_PWA]');
    mainContent = mainContent.replace(/\[INSTALA_PWA\]/gi, '').trim();

    const hasActivaWebLLM = mainContent.includes('[ACTIVA_WEBLLM]');
    mainContent = mainContent.replace(/\[ACTIVA_WEBLLM\]/gi, '').trim();

    const hasSincronizaNube = mainContent.includes('[SINCRONIZA_NUBE]');
    mainContent = mainContent.replace(/\[SINCRONIZA_NUBE\]/gi, '').trim();

    // 7. ✅ NUEVO: Detect v5.2 Multimodal Commands (Track Constructor)
    const hasAdoptaModulo = mainContent.includes('[ADOPTA_MODULO]');
    mainContent = mainContent.replace(/\[ADOPTA_MODULO\]/gi, '').trim();

    // 8. ✅ NUEVO: Detect v5.2 Transversal Commands
    const hasAlertaBienestar = mainContent.includes('[ALERTA_BIENESTAR]');
    mainContent = mainContent.replace(/\[ALERTA_BIENESTAR\]/gi, '').trim();

    const hasDescargaOffline = mainContent.includes('[DESCARGA_OFFLINE]');
    mainContent = mainContent.replace(/\[DESCARGA_OFFLINE\]/gi, '').trim();

    const hasLimpiaCache = mainContent.includes('[LIMPIA_CACHE]');
    mainContent = mainContent.replace(/\[LIMPIA_CACHE\]/gi, '').trim();

    // 9. ✅ NUEVO: Silent Metric Capture (para reportes B2G)
    const metricRegex = /\[METRICA:\s*([^\]]+)\]/gi;
    const metricsFound: string[] = [];
    let metricMatch;
    while ((metricMatch = metricRegex.exec(mainContent)) !== null) {
      metricsFound.push(metricMatch[1]);
    }
    mainContent = mainContent.replace(metricRegex, '').trim();

    if (metricsFound.length > 0) {
      console.log('[📊 METRIC CAPTURED]', metricsFound);
      // TODO: Conectar con storageService.addToSyncQueue para reportes B2G
    }

    // 10. Legacy PDF/Video detection
    const isPdf = mainContent.includes("📄 GUÍA DE ESTUDIO OFICIAL");
    const isVideoSuggestion = mainContent.includes("YouTube") || mainContent.includes("📺");

    // ==========================================================================
    // Helper: Render text with bold + interactive quiz options
    // ==========================================================================
    const renderTextWithBold = (txt: string) => {
      const lines = txt.split('\n');
      return lines.map((line, lineIdx) => {
        const optionMatch = line.match(/^([A-D][\.\)])\s+(.*)/i);

        if (optionMatch && onOptionSelect && !isUser) {
          const letter = optionMatch[1];
          const optionText = optionMatch[2];
          return (
            <button
              key={lineIdx}
              onClick={() => onOptionSelect(line)}
              className="block w-full text-left my-2 p-3 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors bg-white dark:bg-slate-800 shadow-sm text-slate-700 dark:text-slate-200 group"
            >
              <span className="font-bold text-blue-600 dark:text-blue-400 mr-2 group-hover:text-blue-700 dark:group-hover:text-blue-300">{letter}</span>
              {optionText.split("**").map((part, i) =>
                i % 2 === 1 ? <strong key={i} className="font-bold text-blue-900 dark:text-blue-100">{part}</strong> : part
              )}
            </button>
          );
        }

        return (
          <React.Fragment key={lineIdx}>
            {line.split("**").map((part, i) =>
              i % 2 === 1 ? <strong key={i} className="font-bold text-blue-900 dark:text-blue-100">{part}</strong> : part
            )}
            {lineIdx < lines.length - 1 && <br />}
          </React.Fragment>
        );
      });
    };

    return (
      <div className="space-y-3">
        {/* Track Badge (Dual-Track Isolation) */}
        {message.track && (
          <div className="flex justify-end">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              message.track === 'student'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : message.track === 'builder'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
            }`}>
              {message.track === 'student' ? '🎓 Estudiante' : message.track === 'builder' ? '🛠️ Constructor' : 'Sistema'}
            </span>
          </div>
        )}

        {/* ================================================================ */}
        {/* PODCAST PLAYER (Audio-First MVP) */}
        {/* ================================================================ */}
        {podcastTopic && (
          <div className="bg-slate-800 text-white rounded-xl p-4 shadow-md flex items-center gap-4 my-3">
            <button
              onClick={toggleSpeech}
              className="bg-blue-500 hover:bg-blue-400 text-white rounded-full p-3 transition-colors shrink-0 shadow-sm"
              title={isSpeaking ? "Pausar Audio" : "Reproducir Audio"}
              aria-label={isSpeaking ? "Pausar audio" : "Reproducir audio"}
            >
              {isSpeaking ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <div className="flex-1">
              <p className="text-[10px] text-blue-300 font-bold uppercase tracking-wider mb-0.5">Audio Overview (NotebookLM)</p>
              <p className="font-medium text-sm truncate">{podcastTopic}</p>
              <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-400 h-full w-1/3 rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* VIDEO SUGGESTION (Fase 2 - Dev mode only) */}
        {/* ================================================================ */}
        {videoTopic && process.env.NODE_ENV === 'development' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-md my-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-red-600 text-white p-2 rounded-full shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  <path d="M8 11V6l5 2.5L8 11z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-red-900 text-sm uppercase tracking-wide">Video Sugerido (Fase 2)</h4>
                <p className="font-medium text-slate-800 text-sm">{videoTopic}</p>
              </div>
            </div>
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(videoTopic)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Buscar en YouTube (Demo)
            </a>
          </div>
        )}

        {/* ================================================================ */}
        {/* 🆕 ALERTA BIENESTAR (CRÍTICO - Seguridad) */}
        {/* ================================================================ */}
        {hasAlertaBienestar && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 my-3 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-red-600 text-white p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-bold text-red-800 text-sm uppercase tracking-wide">Apoyo Emocional</h4>
            </div>
            <p className="text-sm text-slate-700 mb-3">Si estás pasando por un momento difícil, hay personas listas para escucharte:</p>
            <div className="space-y-2">
              <a href="tel:106" className="block w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center">
                📞 Línea 106 (Niños y Adolescentes)
              </a>
              <a href="tel:123" className="block w-full bg-slate-700 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center">
                📞 Línea 123 (Emergencias)
              </a>
              <a href="tel:192" className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center">
                📞 Línea 192 (Salud Mental)
              </a>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* CODE SNIPPET (Track Constructor) */}
        {/* ================================================================ */}
        {hasCodeSnippet && (
          <div className="bg-slate-900 text-slate-100 rounded-lg p-3 my-2 font-mono text-xs overflow-x-auto border border-slate-700">
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="font-bold text-xs uppercase">Código</span>
            </div>
            <pre className="whitespace-pre-wrap break-words">{mainContent}</pre>
          </div>
        )}

        {/* ================================================================ */}
        {/* ARCHITECTURE TIP (Track Constructor) */}
        {/* ================================================================ */}
        {hasArchitectureTip && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 my-2 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-indigo-100 text-indigo-700 p-1.5 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-bold text-indigo-800 text-sm uppercase tracking-wide">Consejo de Arquitectura</h4>
            </div>
            <div className="text-sm text-slate-700 whitespace-pre-wrap">
              {renderTextWithBold(mainContent)}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* RETO VEREDA (Track Estudiante) */}
        {/* ================================================================ */}
        {hasRetoVereda && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 my-2 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-emerald-100 text-emerald-700 p-1.5 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-bold text-emerald-800 text-sm uppercase tracking-wide">Reto Vereda</h4>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* QUIZ FLASH (Track Estudiante) */}
        {/* ================================================================ */}
        {hasQuizFlash && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 my-2 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-purple-100 text-purple-700 p-1.5 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-bold text-purple-800 text-sm uppercase tracking-wide">Quiz Flash</h4>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* 🆕 ACTIVA WEBLLM (Feedback visual de IA local) */}
        {/* ================================================================ */}
        {hasActivaWebLLM && (
          <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 border border-purple-200 rounded-lg p-3 my-2 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-purple-100 text-purple-700 p-1.5 rounded-md text-xl">🤖</div>
              <h4 className="font-bold text-purple-800 text-sm uppercase tracking-wide">IA Local Activada</h4>
            </div>
            <div className="text-xs text-slate-700 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span>Cero consumo de datos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span>Respuestas inmediatas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span>Tus datos nunca salen de tu celular</span>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* 🆕 INSTALA PWA (Onboarding) */}
        {/* ================================================================ */}
        {hasInstalaPWA && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 my-2 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-100 text-blue-700 p-1.5 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-bold text-blue-800 text-sm uppercase tracking-wide">Instalar como App</h4>
            </div>
            <p className="text-xs text-slate-600 mb-2">Estudia sin gastar datos instalando EduGlobal365 en tu celular.</p>
            <button
              onClick={() => {
                console.log('📲 Solicitando instalación PWA...');
                alert('📲 En producción, este botón abrirá el diálogo nativo de instalación del navegador (beforeinstallprompt).');
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>📲</span>
              <span>Instalar EduGlobal365</span>
            </button>
          </div>
        )}

        {/* ================================================================ */}
        {/* 🆕 SINCRONIZA NUBE (Firebase Sync) */}
        {/* ================================================================ */}
        {hasSincronizaNube && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 my-2 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-green-100 text-green-700 p-1.5 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4.5 4.5 0 018.306-3.954 5.251 5.251 0 019.08 5.04A4.502 4.502 0 0115.5 17h-10z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-bold text-green-800 text-sm uppercase tracking-wide">Sincronizar con la Nube</h4>
            </div>
            <p className="text-xs text-slate-600 mb-2">Respalda tu progreso en la nube para acceder desde otros dispositivos.</p>
            <button
              onClick={() => {
                console.log('☁️ Sincronizando cola con Firebase...');
                alert('☁️ En producción, esto disparará FirebaseSyncService.processSyncQueue() para subir tu progreso a la nube.');
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>☁️</span>
              <span>Subir Progreso a la Nube</span>
            </button>
          </div>
        )}

        {/* ================================================================ */}
        {/* 🆕 EXPORTA JSON (P2P Sharing) */}
        {/* ================================================================ */}
        {hasExportaJson && (
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 my-2 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-cyan-100 text-cyan-700 p-1.5 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-bold text-cyan-800 text-sm uppercase tracking-wide">Compartir con Compañeros</h4>
            </div>
            <p className="text-xs text-slate-600 mb-2">Exporta tu progreso para compartirlo por USB o Bluetooth con otros estudiantes.</p>
            <button
              onClick={() => {
                console.log('📤 Exportando progreso como JSON...');
                alert('📤 En producción, esto descargará tu progreso como archivo JSON para compartir por USB/Bluetooth.');
              }}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>📤</span>
              <span>Exportar Progreso (USB/Bluetooth)</span>
            </button>
          </div>
        )}

        {/* ================================================================ */}
        {/* 🆕 DESCARGA OFFLINE (Preparar para la Vereda) */}
        {/* ================================================================ */}
        {hasDescargaOffline && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 my-2 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-emerald-100 text-emerald-700 p-1.5 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-bold text-emerald-800 text-sm uppercase tracking-wide">Descargar para Offline</h4>
            </div>
            <p className="text-xs text-slate-600 mb-2">Guarda este módulo en tu dispositivo para estudiar sin internet.</p>
            <button
              onClick={() => {
                console.log('📥 Generando paquete offline...');
                alert('📥 En producción, esto generará un paquete HTML/PDF/JSON descargable.');
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>📥</span>
              <span>Preparar para la Vereda</span>
            </button>
          </div>
        )}

        {/* ================================================================ */}
        {/* 🆕 ADOPTA MÓDULO (Cross-Track Synergy) */}
        {/* ================================================================ */}
        {hasAdoptaModulo && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-3 my-2 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-amber-100 text-amber-700 p-1.5 rounded-md text-xl">🛠️</div>
              <h4 className="font-bold text-amber-800 text-sm uppercase tracking-wide">Adoptar Módulo Educativo</h4>
            </div>
            <p className="text-xs text-slate-700 mb-2">Construye una solución técnica que mejore la experiencia de estudiantes en este módulo.</p>
            <button
              onClick={() => {
                console.log('🛠️ Iniciando Cross-Track Synergy...');
                alert('🛠️ En producción, esto cambiaría al Track Constructor con el módulo pre-seleccionado.');
              }}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>🛠️</span>
              <span>Aceptar Reto Constructor</span>
            </button>
          </div>
        )}

        {/* ================================================================ */}
        {/* 🆕 LIMPIA CACHE (IndexedDB maintenance) */}
        {/* ================================================================ */}
        {hasLimpiaCache && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 my-2 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-amber-100 text-amber-700 p-1.5 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="font-bold text-amber-800 text-sm uppercase tracking-wide">Liberar Espacio</h4>
            </div>
            <p className="text-xs text-slate-600 mb-2">Tu dispositivo tiene muchos paquetes offline guardados.</p>
            <button
              onClick={() => {
                console.log('🧹 Limpiando cache...');
                alert('🧹 En producción, esto limpiará paquetes antiguos de IndexedDB.');
              }}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>🧹</span>
              <span>Limpiar Paquetes Antiguos</span>
            </button>
          </div>
        )}

        {/* ================================================================ */}
        {/* MAIN CONTENT AREA */}
        {/* ================================================================ */}
        <div className="whitespace-pre-wrap leading-relaxed">
          {isPdf ? (
            <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 font-mono text-sm shadow-sm my-2">
              <div className="flex items-center justify-between mb-2 border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-700 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  VISTA PREVIA DE DOCUMENTO
                </span>
                <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-600">Listo para Imprimir</span>
              </div>
              {renderTextWithBold(mainContent)}
            </div>
          ) : isVideoSuggestion ? (
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 my-2">
              <div className="flex items-start gap-3">
                <div className="bg-red-600 text-white p-2 rounded-full shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    <path d="M8 11V6l5 2.5L8 11z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-red-900 text-sm">Video Sugerido (Fase 2)</h4>
                  <div className="text-slate-800 text-sm mt-1">{renderTextWithBold(mainContent)}</div>
                </div>
              </div>
            </div>
          ) : (
            renderTextWithBold(mainContent)
          )}
        </div>

        {/* ================================================================ */}
        {/* OFFLINE SUMMARY SECTION */}
        {/* ================================================================ */}
        {offlineContent && (
          <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-md shadow-sm">
            <h4 className="font-bold text-yellow-800 flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              MODO OFFLINE
            </h4>
            <div className="text-sm text-slate-700 whitespace-pre-wrap">
              {renderTextWithBold(offlineContent)}
            </div>
            <p className="text-[10px] text-slate-500 mt-2 italic font-medium uppercase tracking-wide">Toma captura para estudiar sin internet</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[90%] md:max-w-[75%] lg:max-w-[60%] rounded-2xl p-4 shadow-sm ${
          isUser
            ? 'bg-blue-600 text-white rounded-tr-none'
            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none'
        }`}
      >
        <div className="flex items-center justify-between mb-1 opacity-80 text-xs font-semibold uppercase tracking-wider">
          <div className="flex items-center gap-2">
            {isUser ? (
              <>
                <span>Estudiante</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
                <span className="text-blue-600 dark:text-blue-400">Tutor Edú</span>
              </>
            )}
          </div>
          {!isUser && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${isCopied ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                title={isCopied ? "Copiado" : "Copiar mensaje"}
                aria-label={isCopied ? "Mensaje copiado al portapapeles" : "Copiar mensaje al portapapeles"}
              >
                {isCopied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[10px]">Copiado</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                    <span className="text-[10px]">Compartir</span>
                  </>
                )}
              </button>
              <button
                onClick={toggleSpeech}
                className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${isSpeaking ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                title={isSpeaking ? "Detener narración" : "Escuchar mensaje"}
                aria-label={isSpeaking ? "Detener lectura en voz alta" : "Escuchar mensaje en voz alta"}
              >
                {isSpeaking ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[10px]">Detener</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[10px]">Escuchar</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        {renderContent(message.text)}
      </div>
    </motion.div>
  );
};

export default ChatBubble;