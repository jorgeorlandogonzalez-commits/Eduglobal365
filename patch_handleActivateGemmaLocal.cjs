const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const search = `  const handleActivateGemmaLocal = async () => {
    if (gemmaReady) {
      // Desactivar modo local y liberar memoria GPU
      setForceGemmaLocal(false);
      setGemmaReady(false);
      (window as any).__forceLocalAI = false;
      try {
        await WebLLMService.unload();
      } catch (e) {
        console.warn('Error unloading WebLLM:', e);
      }
      return;
    }

    if (gemmaModelDownloading) return;

    setGemmaModelDownloading(true);
    setGemmaProgress(0);

    try {
      await WebLLMService.init((progress) => {
        setGemmaProgress(Math.round(progress * 100));
      });
      setGemmaReady(true);
      setForceGemmaLocal(true);
      (window as any).__forceLocalAI = true;
    } catch (e) {
      console.warn('Gemma Local Fallback:', e);
      alert('Tu navegador no soporta WebGPU o no pudo cargar el modelo. Usaremos el modo estático offline.');
      setForceGemmaLocal(false);
      setGemmaReady(false);
    } finally {
      setGemmaModelDownloading(false);
    }
  };`;

const replace = `  const handleActivateGemmaLocal = async () => {
  if (gemmaReady) {
    setForceGemmaLocal(false); setGemmaReady(false);
    await webLLMInstance.unload();
    return;
  }
  if (gemmaModelDownloading) return;
  setGemmaModelDownloading(true); setGemmaProgress(0);
  try {
    await webLLMInstance.init((p) => setGemmaProgress(Math.round(p * 100)));
    setGemmaReady(true); setForceGemmaLocal(true);
  } catch (e) {
    console.warn('Gemma Local no disponible:', e);
    alert('📱 Tu dispositivo no soporta WebGPU. Quedas en Modo Ahorro Máximo: guías descargables, audios y quizzes siguen funcionando.');
  } finally {
    setGemmaModelDownloading(false);
  }
};`;

code = code.replace(search, replace);
fs.writeFileSync('App.tsx', code);
