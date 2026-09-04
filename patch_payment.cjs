const fs = require('fs');

let content = fs.readFileSync('services/paymentService.ts', 'utf8');

const oldLoad = `// ✅ OT#7.6: Script OFICIAL de Wompi = widget.js (checkout.js no existe → 404)
const loadWompiScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.Widget) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.wompi.co/widget.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Wompi Checkout'));
    document.body.appendChild(script);
  });
};`;

const newLoad = `// ✅ OT#7.6: Script OFICIAL de Wompi (widget.js) — global \`Widget\`
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
};`;

const oldStart = `export const startWompiCheckout = async (
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
  if (!window.Widget) throw new Error('Wompi Widget no disponible');

  const amountInCents = PLAN_PRICES[plan] * 100; // Wompi trabaja en centavos
  const currency = 'COP';
  const reference = \`edu365_\${user.uid}_\${plan}_\${Date.now()}\`;
  const signature = await getSignatureFromBackend(amountInCents, currency, reference);
  const publicKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY;
  if (!publicKey) throw new Error('VITE_WOMPI_PUBLIC_KEY no configurada');

  // Registro pending fire-and-forget (la confirmación real viene por redirect + webhook)
  fetch('/api/wompi/register-pending', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user.uid, plan, reference })
  }).catch(() => {});

  // ✅ OT#7.6: Widget oficial. render() toma el control; al aprobar, Wompi redirige a redirectUrl.
  const widget = new window.Widget({
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
    redirectUrl: \`\${window.location.origin}/payment/success\`,
    skipResultPage: true
  });
  widget.render();
};`;

const newStart = `export const startWompiCheckout = async (
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
  const reference = \`edu365_\${user.uid}_\${plan}_\${Date.now()}\`;
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
    redirectUrl: \`\${window.location.origin}/payment/success\`
  });
  widget.render();
};`;

if (content.includes(oldLoad)) {
  content = content.replace(oldLoad, newLoad);
} else {
  console.log("oldLoad not found");
}

if (content.includes(oldStart)) {
  content = content.replace(oldStart, newStart);
} else {
  console.log("oldStart not found");
}

fs.writeFileSync('services/paymentService.ts', content, 'utf8');
console.log("Patched successfully");
