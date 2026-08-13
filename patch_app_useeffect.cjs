const fs = require('fs');
let code = fs.readFileSync('App.tsx', 'utf8');

const search = `  // ==========================================================================
  // RENDER: LANDING / TEACHER / REWARDS / CONSTRUCTOR`;

const replace = `  useEffect(() => {
    const onInstallPwa = (e: Event) => { e.preventDefault(); deferredPrompt.current = e; };
    window.addEventListener('beforeinstallprompt', onInstallPwa);

    const hInstall = () => {
      if (deferredPrompt.current) { deferredPrompt.current.prompt(); deferredPrompt.current = null; }
      else alert('📲 Usa el menú del navegador → "Agregar a pantalla de inicio" / "Instalar app".');
    };
    const hSync = async () => {
      try {
        const mod: any = await import('./config/firebase');
        if (mod.FirebaseSyncService) {
          const r = await mod.FirebaseSyncService.processSyncQueue();
          alert(\`☁️ Sincronización completada: \${r.success} elementos respaldados.\`);
        } else alert('☁️ Sync en nube disponible al activar FirebaseSyncService.');
      } catch { alert('☁️ No se pudo sincronizar ahora. Intenta al recuperar conexión.'); }
    };
    const hExport = () => {
      const payload = { app: 'eduglobal365', version: '6.0', exportedAt: Date.now(), subject: activeSubject, role: userRole, messages, profile: student };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = \`eduglobal365_progreso_\${(activeSubject || 'general').replace(/\\s+/g, '_')}.json\`;
      a.click(); URL.revokeObjectURL(url);
    };
    const hDownload = () => handleSmartDownload();
    const hClean = async () => {
      try {
        const mod: any = await import('./services/downloadService');
        if (mod.DownloadService.cleanupExpiredPackages) { await mod.DownloadService.cleanupExpiredPackages(); alert('🧹 Paquetes antiguos limpiados.'); }
        else alert('🧹 Limpieza disponible próximamente.');
      } catch { alert('🧹 No se pudo limpiar el caché ahora.'); }
    };
    const hAdopt = () => { setUserRole('builder'); setCurrentView('CONSTRUCTOR_LAB'); };

    window.addEventListener('eduglobal:install-pwa', hInstall);
    window.addEventListener('eduglobal:sync-cloud', hSync);
    window.addEventListener('eduglobal:export-json', hExport);
    window.addEventListener('eduglobal:download-offline', hDownload);
    window.addEventListener('eduglobal:clean-cache', hClean);
    window.addEventListener('eduglobal:adopt-module', hAdopt);
    return () => {
      window.removeEventListener('beforeinstallprompt', onInstallPwa);
      window.removeEventListener('eduglobal:install-pwa', hInstall);
      window.removeEventListener('eduglobal:sync-cloud', hSync);
      window.removeEventListener('eduglobal:export-json', hExport);
      window.removeEventListener('eduglobal:download-offline', hDownload);
      window.removeEventListener('eduglobal:clean-cache', hClean);
      window.removeEventListener('eduglobal:adopt-module', hAdopt);
    };
  }, [messages, activeSubject, userRole, student]);

  // ==========================================================================
  // RENDER: LANDING / TEACHER / REWARDS / CONSTRUCTOR`;

code = code.replace(search, replace);
fs.writeFileSync('App.tsx', code);
