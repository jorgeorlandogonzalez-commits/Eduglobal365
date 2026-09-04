// src/services/paymentService.ts
import { auth } from '../config/firebase';
import { checkPrivilegedAccess } from './privilegedAccessService';

declare global {
  interface Window {
    WompiCheckout: any;
  }
}

export type SubscriptionPlan = 'monthly' | 'annual';

export const PLAN_PRICES: Record<SubscriptionPlan, number> = {
  monthly: 49900,  // COP
  annual: 499000   // COP
};

export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  monthly: 'Mensual ($49.900/mes)',
  annual: 'Anual ($499.000/año - 2 meses gratis)'
};

/**
 * Carga el script de Wompi Checkout dinámicamente.
 */
const loadWompiScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.WompiCheckout) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.wompi.co/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Wompi Checkout'));
    document.body.appendChild(script);
  });
};

/**
 * Genera la firma de integridad en el BACKEND (seguridad).
 */
const getSignatureFromBackend = async (amountInCents: number, currency: string, reference: string): Promise<string> => {
  const res = await fetch('/api/wompi/signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amountInCents, currency, reference })
  });
  if (!res.ok) throw new Error('Error generando firma');
  const data = await res.json();
  return data.signature;
};

/**
 * Inicia el checkout de Wompi para una suscripción.
 */
export const startWompiCheckout = async (
  plan: SubscriptionPlan,
  customerEmail: string,
  customerName: string
): Promise<void> => {
  const user = auth?.currentUser;
  if (!user) throw new Error('Debes iniciar sesión con Gmail para suscribirte.');
  
  // Si es superusuario, no debería llegar aquí (se bloquea antes), pero por seguridad:
  if (checkPrivilegedAccess().isPrivileged) {
    throw new Error('Tu cuenta tiene acceso gratuito. No necesitas pagar.');
  }
  
  await loadWompiScript();
  
  const amountInCents = PLAN_PRICES[plan] * 100;
  const currency = 'COP';
  const reference = `edu365_${user.uid}_${plan}_${Date.now()}`;
  
  const signature = await getSignatureFromBackend(amountInCents, currency, reference);
  
  const publicKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY;
  if (!publicKey) throw new Error('VITE_WOMPI_PUBLIC_KEY no configurada');
  
  return new Promise((resolve, reject) => {
    const checkout = new window.WompiCheckout({
      publicKey,
      amountInCents,
      currency,
      reference,
      signature,
      customerData: {
        email: customerEmail,
        fullName: customerName,
        phoneNumber: '+573000000000',
        phoneNumberCountry: 'CO'
      },
      redirectUrl: `${window.location.origin}/payment/success`,
      skipResultPage: true
    });
    
    checkout.on('chargeCreationSuccess', async (data: any) => {
      console.log('✅ Pago iniciado:', data.transactionId);
      await fetch('/api/wompi/register-pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          plan,
          transactionId: data.transactionId,
          reference
        })
      });
      resolve();
    });
    
    checkout.on('chargeCreationError', (err: any) => {
      console.error('❌ Error en pago:', err);
      reject(new Error('Error procesando pago: ' + (err.reason || 'desconocido')));
    });
    
    checkout.open();
  });
};

/**
 * Consulta el estado de suscripción del usuario activo.
 * Los superusuarios siempre tienen suscripción activa.
 */
export const checkSubscriptionStatus = async (): Promise<{
  active: boolean;
  plan?: SubscriptionPlan | 'privileged';
  expiresAt?: number;
  daysRemaining?: number;
  isPrivileged?: boolean;
  privilegedLabel?: string;
}> => {
  // ✅ SUPERUSUARIO: acceso inmediato sin consultar backend
  const privileged = checkPrivilegedAccess();
  if (privileged.isPrivileged) {
    return {
      active: true,
      plan: 'privileged',
      expiresAt: Date.now() + (365 * 10 * 24 * 60 * 60 * 1000), // 10 años (efectivamente permanente)
      daysRemaining: 3650,
      isPrivileged: true,
      privilegedLabel: privileged.label
    };
  }
  
  const user = auth?.currentUser;
  if (!user) return { active: false };
  
  try {
    const res = await fetch(`/api/wompi/subscription-status?userId=${user.uid}`);
    if (!res.ok) return { active: false };
    return await res.json();
  } catch {
    return { active: false };
  }
};
