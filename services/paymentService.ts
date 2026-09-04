// src/services/paymentService.ts
import { auth } from '../config/firebase';
import { checkPrivilegedAccess } from './privilegedAccessService';

declare global {
  interface Window {
    Widget?: any;
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

// ✅ OT#7.6: Script OFICIAL de Wompi (widget.js) — global `Widget`
const loadWompiScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).Widget) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.wompi.co/widget.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Wompi Checkout'));
    document.body.appendChild(script);
  });
};

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

export const startWompiCheckout = async (
  plan: SubscriptionPlan,
  customerEmail: string,
  customerName: string
): Promise<void> => {
  const user = auth?.currentUser;
  if (!user) throw new Error('Debes iniciar sesión con Gmail para suscribirte.');
  if (checkPrivilegedAccess().isPrivileged) {
    throw new Error('Tu cuenta tiene acceso gratuito. No necesitas pagar.');
  }
  await loadWompiScript();
  const WompiWidget = (window as any).Widget;
  if (!WompiWidget) throw new Error('Wompi Widget no disponible');
  const amountInCents = PLAN_PRICES[plan] * 100;
  const currency = 'COP';
  const reference = `edu365_${user.uid}_${plan}_${Date.now()}`;
  const signature = await getSignatureFromBackend(amountInCents, currency, reference);
  const publicKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY;
  if (!publicKey) throw new Error('VITE_WOMPI_PUBLIC_KEY no configurada');
  // Registro pending fire-and-forget (la activación real viene por redirect + webhook)
  fetch('/api/wompi/register-pending', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user.uid, plan, reference })
  }).catch(() => {});
  // ✅ OT#7.6: Widget oficial; el retorno es por redirectUrl
  const widget = new WompiWidget({
    publicKey,
    currency,
    amountInCents,
    reference,
    signature,
    customerEmail,
    customerFullName: customerName,
    customerData: {
      email: customerEmail,
      fullName: customerName,
      phoneNumber: '+573000000000',
      phoneNumberCountry: 'CO'
    },
    redirectUrl: `${window.location.origin}/payment/success`
  });
  widget.render();
};

export const checkSubscriptionStatus = async (): Promise<{
  active: boolean;
  plan?: SubscriptionPlan | 'privileged';
  expiresAt?: number;
  daysRemaining?: number;
  isPrivileged?: boolean;
  privilegedLabel?: string;
}> => {
  const privileged = checkPrivilegedAccess();
  if (privileged.isPrivileged) {
    return {
      active: true,
      plan: 'privileged',
      expiresAt: Date.now() + (365 * 10 * 24 * 60 * 60 * 1000),
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
