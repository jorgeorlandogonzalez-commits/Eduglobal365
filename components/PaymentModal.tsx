// src/components/PaymentModal.tsx
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { startWompiCheckout, PLAN_PRICES, SubscriptionPlan } from '../services/paymentService';

interface PaymentModalProps {
  userEmail: string;
  userName: string;
  onSuccess: () => void;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ userEmail, userName, onSuccess, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('annual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      await startWompiCheckout(selectedPlan, userEmail, userName);
      // ✅ El Widget toma el control; la confirmación ocurre al volver del redirect
      setIsProcessing(false);
    } catch (e: any) {
      setError(e.message || 'Error procesando pago');
      setIsProcessing(false);
    }
  };

  const formatCOP = (v: number) => `$${v.toLocaleString('es-CO')}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-slate-950/95 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Activa tu Suscripción</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Acceso completo a Formación Académica + Habilidades para la Vida</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
        </div>

        <div className="space-y-2 mb-6">
          {(['monthly', 'annual'] as SubscriptionPlan[]).map(plan => (
            <button
              key={plan}
              onClick={() => setSelectedPlan(plan)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                selectedPlan === plan
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-100">
                    {plan === 'monthly' ? '📅 Mensual' : '📆 Anual'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {plan === 'annual' ? '💙 2 meses gratis · Ahorras $99.800' : 'Sin permanencia · Cancela cuando quieras'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{formatCOP(PLAN_PRICES[plan])}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">/{plan === 'monthly' ? 'mes' : 'año'}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 mb-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="font-bold mb-1">🛡️ Pagos seguros con Wompi</div>
          <ul className="space-y-0.5">
            <li>✅ PSE, tarjetas de crédito/débito</li>
            <li>✅ Nequi y Daviplata</li>
            <li>✅ Efectivo (Baloto, Efecty)</li>
            <li>✅ Cifrado SSL + PCI-DSS compliant</li>
          </ul>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Sesión: <span className="font-medium text-blue-600 dark:text-blue-400">{userEmail}</span>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg p-3 mb-4 text-sm">
            ❌ {error}
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg"
        >
          {isProcessing ? 'Procesando pago...' : `Pagar ${formatCOP(PLAN_PRICES[selectedPlan])} con Wompi →`}
        </button>

        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-3">
          Al pagar aceptas los <a href="/legal/terms.html" target="_blank" className="underline">Términos y Condiciones v2.3</a>
        </p>
      </div>
    </motion.div>
  );
};

export default PaymentModal;