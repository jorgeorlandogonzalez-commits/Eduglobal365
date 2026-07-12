import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getModulesForSubject } from '../config/constants';

interface OfflineManagerProps {
  onClose: () => void;
}

export const OfflineManager: React.FC<OfflineManagerProps> = ({ onClose }) => {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [downloadedModules, setDownloadedModules] = useState<string[]>([]);

  // Simulate existing downloaded modules
  useEffect(() => {
    const saved = localStorage.getItem('offline_modules');
    if (saved) {
      setDownloadedModules(JSON.parse(saved));
    } else {
      setDownloadedModules(['Matemáticas - Básico', 'Inglés - A1']);
    }
  }, []);

  const handleDownload = (moduleName: string) => {
    setDownloading(moduleName);
    setProgress(0);
    
    // Simulate download progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          const newDownloaded = [...downloadedModules, moduleName];
          setDownloadedModules(newDownloaded);
          localStorage.setItem('offline_modules', JSON.stringify(newDownloaded));
          setTimeout(() => setDownloading(null), 500);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 300);
  };

  const handleRemove = (moduleName: string) => {
    const newDownloaded = downloadedModules.filter(m => m !== moduleName);
    setDownloadedModules(newDownloaded);
    localStorage.setItem('offline_modules', JSON.stringify(newDownloaded));
  };

  const availableSilos = ['Matemáticas', 'Inglés', 'Ciencias', 'Sociales', 'Lenguaje'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[85vh] overflow-hidden"
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center text-2xl text-green-600 dark:text-green-400">
              📥
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">Gestor Offline SAS BIC</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Administra tus módulos para estudiar sin internet en zonas rurales.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50 flex items-start gap-3">
            <span className="text-xl">💡</span>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Tip de Almacenamiento:</strong> Los paquetes de audio ("Audio-First") pesan 80% menos que los videos. Prioriza descargarlos para ahorrar espacio en tu dispositivo.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Módulos Descargados</h3>
            {downloadedModules.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 italic">No tienes paquetes descargados.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {downloadedModules.map(mod => (
                  <div key={mod} className="flex items-center justify-between bg-white dark:bg-slate-800 border border-green-200 dark:border-green-800/50 p-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-green-500 dark:text-green-400 text-xl">✅</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{mod}</span>
                    </div>
                    <button 
                      onClick={() => handleRemove(mod)}
                      className="text-slate-400 hover:text-red-500 transition-colors text-sm p-2"
                      title="Eliminar del dispositivo"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Disponibles para Descarga</h3>
            <div className="space-y-3">
              {availableSilos.map(silo => {
                const isDownloaded = downloadedModules.includes(`${silo} - Completo`);
                const isDownloading = downloading === `${silo} - Completo`;

                if (isDownloaded) return null;

                return (
                  <div key={silo} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl gap-4">
                    <div>
                      <h4 className="font-bold text-slate-700 dark:text-slate-200">{silo} - Paquete Completo</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Incluye audios, quices y retos (Aprox. 12 MB)</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      {isDownloading ? (
                        <div className="w-full sm:w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-green-500 h-full transition-all duration-300 ease-out" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleDownload(`${silo} - Completo`)}
                          disabled={downloading !== null}
                          className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${downloading !== null ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 transition-colors'}`}
                        >
                          <span className="text-lg">☁️</span> Descargar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
