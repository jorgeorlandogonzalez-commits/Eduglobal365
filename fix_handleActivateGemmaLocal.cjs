const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const oldFunc = `  const handleActivateGemmaLocal = async () => {
    if (gemmaReady) {
      setForceGemmaLocal(false);
      setGemmaReady(false);
      await WebLLMService.unload();
      return;
    }

    if (gemmaModelDownloading) return;

    setGemmaModelDownloading(true);
    setGemmaProgress(0);
    const success = await WebLLMService.init((progress) => {
      setGemmaProgress(progress);
    });
    
    if (success) {
      setGemmaReady(true);
      setForceGemmaLocal(true);
      (window as any).__forceLocalAI = true;
    } else {
      setGemmaModelDownloading(false);
    }
  };`;

const newFunc = `  const handleActivateGemmaLocal = async () => {
    if (gemmaReady) {
      setForceGemmaLocal(false);
      setGemmaReady(false);
      (window as any).__forceLocalAI = false;
      await WebLLMService.unload();
      return;
    }

    if (gemmaModelDownloading) return;

    setGemmaModelDownloading(true);
    setGemmaProgress(0);
    
    try {
      await WebLLMService.init((progress, text) => {
        setGemmaProgress(Math.round(progress * 100));
      });
      setGemmaReady(true);
      setForceGemmaLocal(true);
      (window as any).__forceLocalAI = true;
    } catch (e) {
      console.warn('Gemma Local Fallback:', e);
      alert('Tu navegador no soporta WebGPU o no pudo cargar el modelo. Usaremos el modo estático offline.');
    } finally {
      setGemmaModelDownloading(false);
    }
  };`;

if(code.includes(oldFunc)) {
  code = code.replace(oldFunc, newFunc);
  fs.writeFileSync('App.tsx', code);
  console.log("Success");
} else {
  // Let's just try replacing by regex
  const rx = /const handleActivateGemmaLocal = async \(\) => \{[\s\S]*?\};/;
  code = code.replace(rx, newFunc);
  fs.writeFileSync('App.tsx', code);
  console.log("Success with regex");
}
