const fs = require('fs');

// ARQUITECTURA.md
let arch = fs.readFileSync('ARQUITECTURA.md', 'utf-8');
arch += `\n## 💳 Integración de Pagos (Wompi) y Cuentas Privilegiadas
- Pasarela: **Wompi** (colombiana, PCI-DSS, soporta PSE/tarjetas/Nequi/Daviplata/efectivo).
- Arquitectura: Public Key en frontend, Private/Integrity Keys solo en backend (\`server.ts\`).
- Firma de integridad generada server-side con SHA256 (anti-fraude).
- Webhook de Wompi confirma pagos asíncronamente y actualiza Firestore.
- **Paywall** bloquea el Campus si \`subscription.expiresAt < Date.now()\` y el usuario no es privilegiado.
- **Sistema de Cuentas Privilegiadas** (\`privilegedAccessService.ts\`):
  - Lista de emails con acceso gratuito permanente (superusuarios, B2G, B2B).
  - Badge visual "👑 Superusuario Pruebas" en header y sidebar.
  - Bypass automático del paywall.
  - Patrón reutilizable para cuentas de convenio institucional.
`;
fs.writeFileSync('ARQUITECTURA.md', arch, 'utf-8');

// ONBOARDING.md
let onb = fs.readFileSync('ONBOARDING.md', 'utf-8');
onb += `\n## 💳 Activación de Suscripción
Al iniciar sesión con Gmail, si no tienes suscripción activa (y no eres cuenta privilegiada), aparecerá el modal de pago:
1. Selecciona plan Mensual ($49.900) o Anual ($499.000).
2. Haz clic en "Pagar con Wompi".
3. Elige método: PSE, tarjeta, Nequi, Daviplata o efectivo.
4. Confirma el pago.
5. Acceso inmediato al Campus.

## 👑 Cuentas Privilegiadas
Ciertos usuarios (personal interno de pruebas, aliados B2G/B2B) tienen acceso gratuito permanente. Se identifican por un badge "👑 Superusuario Pruebas" en el header.
`;
fs.writeFileSync('ONBOARDING.md', onb, 'utf-8');
console.log("Docs updated.");
