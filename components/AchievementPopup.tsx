import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
}

interface AchievementPopupProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const Confetti = () => {
  const pieces = Array.from({ length: 40 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-0">
      {pieces.map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: '50%', 
            y: '50%', 
            opacity: 1,
            scale: 0
          }}
          animate={{ 
            x: `calc(50% + ${(Math.random() - 0.5) * 300}px)`, 
            y: `calc(50% + ${(Math.random() - 0.5) * 300}px)`, 
            opacity: 0,
            scale: Math.random() * 1.5 + 0.5,
            rotate: Math.random() * 360
          }}
          transition={{ 
            duration: Math.random() * 2 + 1.5, 
            ease: "easeOut" 
          }}
          className={`absolute w-3 h-3 rounded-sm ${['bg-red-500', 'bg-blue-500', 'bg-amber-500', 'bg-green-500', 'bg-purple-500'][Math.floor(Math.random() * 5)]}`}
          style={{
            left: 0,
            top: 0
          }}
        />
      ))}
    </div>
  );
};

export const AchievementPopup: React.FC<AchievementPopupProps> = ({ achievement, onClose }) => {
  useEffect(() => {
    if (achievement) {
      const timer = setTimeout(() => {
        onClose();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-2xl border-2 border-amber-400 dark:border-amber-500 max-w-sm overflow-hidden"
        >
          <Confetti />
          <div className="relative z-10 flex items-start gap-4">
            <motion.div 
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="text-5xl drop-shadow-lg"
            >
              {achievement.icon}
            </motion.div>
            <div>
              <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                ¡Nuevo Logro Desbloqueado!
              </h4>
              <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1 leading-tight">
                {achievement.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                {achievement.description}
              </p>
              {achievement.points > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full text-xs font-bold"
                >
                  <span className="text-sm">⭐</span> +{achievement.points} XP
                </motion.div>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-20 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
