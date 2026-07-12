import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StudentProfile } from '../config/types';

interface RewardShopProps {
  student: StudentProfile;
  onReturn: () => void;
  onPurchase: (cost: number, itemName: string) => void;
}

export const RewardShop: React.FC<RewardShopProps> = ({ student, onReturn, onPurchase }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'avatars' | 'perks' | 'real_world'>('all');
  const [showConfirm, setShowConfirm] = useState<{ id: string, name: string, cost: number, icon: string } | null>(null);

  const points = student.points || 0;

  const rewards = [
    {
      id: 'avatar_astronaut',
      name: 'Avatar Especial: Explorador',
      description: 'Desbloquea el avatar de astronauta para tu perfil.',
      cost: 500,
      icon: '👨‍🚀',
      category: 'avatars',
      available: true
    },
    {
      id: 'avatar_robot',
      name: 'Avatar Especial: Mecha',
      description: 'Desbloquea el avatar de robot avanzado.',
      cost: 750,
      icon: '🤖',
      category: 'avatars',
      available: true
    },
    {
      id: 'perk_track',
      name: 'Pase Track Emprendedor',
      description: 'Acceso anticipado a módulos avanzados de agronomía.',
      cost: 1500,
      icon: '🌱',
      category: 'perks',
      available: true
    },
    {
      id: 'perk_mentor',
      name: 'Mentoría 1:1 VIP',
      description: 'Sesión online de 30 mins con un tutor especializado.',
      cost: 3000,
      icon: '👨‍🏫',
      category: 'perks',
      available: true
    },
    {
      id: 'real_certificate',
      name: 'Certificado de Excelencia',
      description: 'Certificado oficial avalado para tu hoja de vida.',
      cost: 5000,
      icon: '📜',
      category: 'real_world',
      available: true
    },
    {
      id: 'real_raffle',
      name: 'Ticket Sorteo: Tablet Estudiantil',
      description: '1 ticket para el sorteo mensual de dispositivos (conectividad rural).',
      cost: 10000,
      icon: '📱',
      category: 'real_world',
      available: true
    }
  ];

  const filteredRewards = selectedCategory === 'all' 
    ? rewards 
    : rewards.filter(r => r.category === selectedCategory);

  const handlePurchaseClick = (reward: typeof rewards[0]) => {
    if (points >= reward.cost) {
      setShowConfirm({ id: reward.id, name: reward.name, cost: reward.cost, icon: reward.icon });
    }
  };

  const confirmPurchase = () => {
    if (showConfirm) {
      onPurchase(showConfirm.cost, showConfirm.name);
      setShowConfirm(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 md:p-8 animate-fade-in transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={onReturn}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
            >
              <span className="text-xl">⬅️</span>
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                <span className="text-4xl drop-shadow-sm">🏪</span> Tienda de Recompensas
              </h1>
              <p className="text-slate-500 dark:text-slate-400">Canjea tus puntos por premios y beneficios exclusivos.</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg border border-amber-300/50 flex items-center gap-3">
            <span className="text-3xl">🪙</span>
            <div>
              <p className="text-xs uppercase font-bold text-amber-100 tracking-wider">Tu Saldo</p>
              <p className="text-2xl font-black">{points} XP</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-6 scrollbar-hide">
          <button 
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === 'all' ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'}`}
          >
            🌟 Todo
          </button>
          <button 
            onClick={() => setSelectedCategory('avatars')}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === 'avatars' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'}`}
          >
            👾 Avatares
          </button>
          <button 
            onClick={() => setSelectedCategory('perks')}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === 'perks' ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'}`}
          >
            ✨ Beneficios
          </button>
          <button 
            onClick={() => setSelectedCategory('real_world')}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === 'real_world' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'}`}
          >
            🎁 Mundo Real
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredRewards.map((reward) => {
              const canAfford = points >= reward.cost;
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  key={reward.id}
                  className={`bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 transition-all duration-300 flex flex-col ${canAfford ? 'border-transparent shadow-xl hover:shadow-2xl hover:-translate-y-1' : 'border-slate-200 dark:border-slate-700 opacity-75 grayscale-[0.5]'}`}
                >
                  <div className="text-6xl mb-4 drop-shadow-md text-center bg-slate-50 dark:bg-slate-900 rounded-2xl py-8">
                    {reward.icon}
                  </div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 leading-tight">
                    {reward.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 flex-1">
                    {reward.description}
                  </p>
                  <button
                    onClick={() => handlePurchaseClick(reward)}
                    disabled={!canAfford}
                    className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${canAfford ? 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 shadow-md hover:shadow-lg' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'}`}
                  >
                    <span className="text-lg">🪙</span> {reward.cost.toLocaleString()} XP
                    {!canAfford && <span className="text-xs ml-2 opacity-75">(Faltan {reward.cost - points})</span>}
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowConfirm(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center border border-slate-200 dark:border-slate-700"
            >
              <div className="text-6xl mb-4 drop-shadow-lg">{showConfirm.icon}</div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">¿Confirmar canje?</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Vas a canjear <span className="font-bold text-amber-500">{showConfirm.cost} XP</span> por <br/><span className="font-bold">"{showConfirm.name}"</span>.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirm(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={confirmPurchase}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-lg hover:shadow-xl transition-all"
                >
                  ¡Canjear!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
