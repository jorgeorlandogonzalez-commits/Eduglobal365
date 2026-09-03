const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf-8');

const target = "  app.use(express.json());";

const insertion = `

  // ✅ OT#7.5.5: Restauración completa de Firebase Admin + Wompi + databaseId

  // Variables Wompi
  const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY || '';
  const WOMPI_INTEGRITY_KEY = process.env.WOMPI_INTEGRITY_KEY || '';
  const WOMPI_WEBHOOK_SECRET = process.env.WOMPI_WEBHOOK_SECRET || '';
  const SUPERUSER_EMAILS = (process.env.SUPERUSER_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

  // ✅ Inicialización Firebase Admin con databaseId nombrado
  const saB64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64 || '';
  const FIRESTORE_DB_ID = process.env.VITE_FIREBASE_DATABASE_ID || process.env.FIRESTORE_DATABASE_ID || '(default)';
  
  if (saB64 && admin.apps.length === 0) {
    try {
      const saJson = JSON.parse(Buffer.from(saB64, 'base64').toString('utf8'));
      admin.initializeApp({ credential: admin.credential.cert(saJson) });
      console.log('✅ Firebase Admin inicializado (paywall REAL activo)');
      console.log(\`📦 Firestore Database ID: \${FIRESTORE_DB_ID}\`);
    } catch (e) {
      console.error('❌ Error inicializando Firebase Admin:', e);
    }
  } else if (!saB64) {
    console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_B64 no configurada: paywall en MODO ABIERTO (solo desarrollo).');
  }

  const WOMPI_BASE = (process.env.WOMPI_ENV === 'sandbox') ? 'https://sandbox.wompi.co' : 'https://production.wompi.co';

  const subDoc = (uid: string) => admin.firestore({ databaseId: FIRESTORE_DB_ID }).collection('subscriptions').doc(uid);

  const findWompiTransaction = async (transactionId?: string, reference?: string): Promise<any> => {
    try {
      const headers = { Authorization: \`Bearer \${WOMPI_PRIVATE_KEY}\` };
      if (transactionId) {
        const r = await fetch(\`\${WOMPI_BASE}/v1/transactions/\${transactionId}\`, { headers });
        if (r.ok) { const j = await r.json(); return j?.data || null; }
        return null;
      }
      if (reference) {
        const r = await fetch(\`\${WOMPI_BASE}/v1/transactions?reference=\${encodeURIComponent(reference)}\`, { headers });
        if (r.ok) { const j = await r.json(); return (j?.data || [])[0] || null; }
      }
      return null;
    } catch { return null; }
  };

  const activateSubscription = async (userId: string, plan: 'monthly' | 'annual', transactionId: string) => {
    const days = plan === 'annual' ? 365 : 30;
    const expiresAt = Date.now() + days * 86400000;
    await subDoc(userId).set({
      status: 'active', plan, expiresAt, transactionId, activatedAt: Date.now()
    }, { merge: true });
    console.log(\`✅ Suscripción ACTIVADA: \${userId} | \${plan} | expira \${new Date(expiresAt).toISOString()}\`);
    return expiresAt;
  };`;

if (!server.includes("✅ OT#7.5.5")) {
  server = server.replace(target, target + insertion);
}

fs.writeFileSync('server.ts', server, 'utf-8');
console.log("Patched server.ts");
