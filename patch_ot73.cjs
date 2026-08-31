const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf-8');

// Add imports
if (!server.includes("import admin from 'firebase-admin';")) {
  server = server.replace('import express from "express";', "import express from \"express\";\nimport admin from 'firebase-admin';\nimport fs from 'fs';");
}

// Add the setup block after WOMPI_PRIVATE_KEY
const wompiKeyMarker = "const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY || '';";
const setupBlock = `
// ✅ OT#7.3-v2: Firebase Admin para suscripciones (server-side, seguro)
const saB64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64 || '';
if (saB64 && admin.apps.length === 0) {
  try {
    const saJson = JSON.parse(Buffer.from(saB64, 'base64').toString('utf8'));
    admin.initializeApp({ credential: admin.credential.cert(saJson) });
    console.log('✅ Firebase Admin inicializado (paywall REAL activo)');
  } catch (e) {
    console.error('❌ Error inicializando Firebase Admin:', e);
  }
} else if (!saB64) {
  console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_B64 no configurada: paywall en MODO ABIERTO (solo desarrollo).');
}

const WOMPI_BASE = (process.env.WOMPI_ENV === 'sandbox') ? 'https://sandbox.wompi.co' : 'https://production.wompi.co';
const WOMPI_WEBHOOK_SECRET = process.env.WOMPI_WEBHOOK_SECRET || process.env.WOMPI_EVENT_SECRET || '';

const subDoc = (uid: string) => admin.firestore().collection('subscriptions').doc(uid);

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
};
`;

if (!server.includes("✅ OT#7.3-v2")) {
  server = server.replace(wompiKeyMarker, wompiKeyMarker + "\n" + setupBlock);
}

// Replace the endpoints block
const newEndpoints = `// ========================================
// 💳 WOMPI - Payment Backend Endpoints (OT#7.3-v2)
// ========================================

app.post('/api/wompi/signature', async (req: any, res: any) => {
  try {
    const { amountInCents, currency, reference } = req.body;
    if (!amountInCents || !currency || !reference) return res.status(400).json({ error: 'Faltan parámetros' });
    const signatureString = \`\${reference}\${amountInCents}\${currency}\${WOMPI_INTEGRITY_KEY}\`;
    const signature = crypto.createHash('sha256').update(signatureString).digest('hex');
    res.json({ signature });
  } catch (err) {
    res.status(500).json({ error: 'Error generando firma' });
  }
});

app.post('/api/wompi/register-pending', async (req: any, res: any) => {
  try {
    const { userId, plan, transactionId, reference } = req.body;
    if (admin.apps.length) {
      await subDoc(userId).set({ status: 'pending', plan, transactionId, reference, updatedAt: Date.now() }, { merge: true });
    }
    res.json({ success: true, transactionId });
  } catch (err) {
    res.status(500).json({ error: 'Error registrando' });
  }
});

app.post('/api/wompi/webhook', async (req: any, res: any) => {
  try {
    const event = req.body;
    if (event?.event === 'transaction.updated' && event?.data?.status === 'APPROVED') {
      const reference = event.data.reference;
      const parts = String(reference).split('_');
      const userId = parts[1];
      const plan = (parts[2] === 'annual' ? 'annual' : 'monthly') as 'annual' | 'monthly';
      const tx = await findWompiTransaction(event.data.id, reference);
      if (tx && tx.status === 'APPROVED' && userId && admin.apps.length) {
        await activateSubscription(userId, plan, tx.id);
      }
    }
    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
});

app.get('/api/wompi/subscription-status', async (req: any, res: any) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ active: false });
    if (admin.apps.length === 0) {
      return res.json({ active: true, plan: 'annual', openMode: true, expiresAt: Date.now() + 365 * 86400000, daysRemaining: 365 });
    }
    const snap = await subDoc(userId).get();
    if (!snap.exists) return res.json({ active: false, status: 'none' });
    const sub = snap.data() as any;
    const active = sub.status === 'active' && (sub.expiresAt || 0) > Date.now();
    res.json({
      active, plan: sub.plan, status: sub.status, expiresAt: sub.expiresAt,
      daysRemaining: Math.max(0, Math.floor(((sub.expiresAt || 0) - Date.now()) / 86400000))
    });
  } catch (err) {
    res.status(500).json({ active: false });
  }
});

app.post('/api/wompi/confirm', async (req: any, res: any) => {
  try {
    const { transactionId, reference } = req.body || {};
    const tx = await findWompiTransaction(transactionId, reference);
    if (!tx) return res.json({ activated: false, reason: 'not-found' });
    if (tx.status !== 'APPROVED') return res.json({ activated: false, reason: tx.status });
    const ref = reference || tx.reference;
    const parts = String(ref).split('_');
    const userId = parts[1];
    const plan = (parts[2] === 'annual' ? 'annual' : 'monthly') as 'annual' | 'monthly';
    if (!userId || admin.apps.length === 0) return res.json({ activated: false, reason: 'no-admin' });
    const expiresAt = await activateSubscription(userId, plan, tx.id);
    res.json({ activated: true, expiresAt });
  } catch (err) {
    res.status(500).json({ activated: false });
  }
});

app.get('/api/privileged/check', async (req: any, res: any) => {
  const email = (req.query.email as string || '').toLowerCase().trim();
  const privileged = (process.env.SUPERUSER_EMAILS || '').split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean);
  const isPrivileged = privileged.includes(email);
  res.json({ email, isPrivileged, type: isPrivileged ? 'superuser' : null, label: isPrivileged ? '👑 Superusuario Pruebas' : null });
});

// Vite middleware for development`;

// Extract from '// ========================================' to '// Vite middleware for development'
// and replace.
const startIndex = server.indexOf('// ========================================');
const endIndex = server.indexOf('// Vite middleware for development');

if (startIndex !== -1 && endIndex !== -1) {
  server = server.substring(0, startIndex) + newEndpoints + server.substring(endIndex + '// Vite middleware for development'.length);
}

// Replace the fallback block (Anti-fragile)
const oldFallback = `} else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get(/(.*)/, (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }`;
const newFallback = `} else {
    const distPath = path.join(process.cwd(), 'dist');
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      app.use(express.static(distPath));
      app.get(/(.*)/, (req, res) => {
        res.sendFile(indexPath);
      });
    } else {
      console.warn('⚠️ dist/index.html no encontrado. Usando Vite middleware como fallback.');
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
      app.use(vite.middlewares);
    }
  }`;

if (server.includes(oldFallback)) {
  server = server.replace(oldFallback, newFallback);
}

fs.writeFileSync('server.ts', server, 'utf-8');
console.log("Patched server.ts");
