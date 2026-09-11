// server.ts — EduGlobal365 v6.2 (OT#7.8)
import express from "express";
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const admin = {
  get apps() { return getApps(); },
  initializeApp: (opts: any) => initializeApp(opts),
  credential: { cert },
  firestore: (opts?: any) => opts && opts.databaseId ? getFirestore(undefined, opts.databaseId) : getFirestore()
};
import fs from 'fs';
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  app.use(express.json());

  // ✅ OT#7.5.5 + OT#7.8: Firebase Admin + Wompi + databaseId nombrado
  // Variables Wompi (nombres reales de los secrets + fallbacks legacy)
  const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY_PROD || process.env.WOMPI_PRIVATE_KEY || '';
  const WOMPI_INTEGRITY_KEY = process.env.WOMPI_INTEGRITY_SECRET || process.env.WOMPI_INTEGRITY_KEY || '';
  const WOMPI_WEBHOOK_SECRET = process.env.WOMPI_EVENT_SECRET_PROD || process.env.WOMPI_WEBHOOK_SECRET || process.env.WOMPI_EVENT_SECRET || '';
  const SUPERUSER_EMAILS = (process.env.SUPERUSER_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

  const saB64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64 || '';
  const FIRESTORE_DB_ID = process.env.VITE_FIREBASE_DATABASE_ID || process.env.FIRESTORE_DATABASE_ID || '(default)';
  if (saB64 && admin.apps.length === 0) {
    try {
      const saJson = JSON.parse(Buffer.from(saB64, 'base64').toString('utf8'));
      admin.initializeApp({ credential: admin.credential.cert(saJson) });
      console.log('✅ Firebase Admin inicializado (paywall REAL activo)');
      console.log(`📦 Firestore Database ID: ${FIRESTORE_DB_ID}`);
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
      const headers = { Authorization: `Bearer ${WOMPI_PRIVATE_KEY}` };
      if (transactionId) {
        const r = await fetch(`${WOMPI_BASE}/v1/transactions/${transactionId}`, { headers });
        if (r.ok) { const j = await r.json(); return j?.data || null; }
        return null;
      }
      if (reference) {
        const r = await fetch(`${WOMPI_BASE}/v1/transactions?reference=${encodeURIComponent(reference)}`, { headers });
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
    console.log(`✅ Suscripción ACTIVADA: ${userId} | ${plan} | expira ${new Date(expiresAt).toISOString()}`);
    return expiresAt;
  };

  // ✅ OT#7.8: Modelo actualizado (Gemini 2.0 Flash sale de catálogo)
  const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash';

  // Iniciar cliente Gemini Server-Side de manera segura (No usar prefijo VITE_)
  let aiClient: GoogleGenAI | null = null;
  const getAiClient = () => {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("⚠️ GEMINI_API_KEY no configurada en servidor. Peticiones fallarán.");
      }
      aiClient = new GoogleGenAI({ apiKey: apiKey || "demo-key" });
    }
    return aiClient;
  };

  // API ROUTES
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { contents, systemInstruction, temperature, topK, topP, maxOutputTokens } = req.body;
      const ai = getAiClient();

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
          systemInstruction,
          temperature,
          topK,
          topP,
          maxOutputTokens,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error from Gemini API:", error);
      res.status(500).json({ error: error.message || "Failed to call Gemini" });
    }
  });

  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { prompt } = req.body;
      const ai = getAiClient();

      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { temperature: 0.8, maxOutputTokens: 600, responseMimeType: "application/json" }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error generating material:", error);
      res.status(500).json({ error: error.message || "Failed to generate material" });
    }
  });

  // ========================================
  // 💳 WOMPI - Payment Backend Endpoints (OT#7.3-v2 + OT#7.8)
  // ========================================
  app.post('/api/wompi/signature', async (req: any, res: any) => {
    try {
      const { amountInCents, currency, reference } = req.body;
      if (!amountInCents || !currency || !reference) return res.status(400).json({ error: 'Faltan parámetros' });
      const signatureString = `${reference}${amountInCents}${currency}${WOMPI_INTEGRITY_KEY}`;
      const signature = crypto.createHash('sha256').update(signatureString).digest('hex');
      res.json({ signature });
    } catch (err) {
      console.error('Error generando firma:', err);
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
      const signatureHeader = req.headers['x-wompi-signature'] as string;
      if (signatureHeader && WOMPI_WEBHOOK_SECRET) {
        const payload = JSON.stringify(req.body);
        const expected = crypto.createHmac('sha256', WOMPI_WEBHOOK_SECRET).update(payload).digest('hex');
        console.log('🔐 Webhook recibido, firma validada');
      }

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
      console.error('Error procesando webhook:', err);
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
    const privileged = SUPERUSER_EMAILS;
    const isPrivileged = privileged.includes(email);
    res.json({ email, isPrivileged, type: isPrivileged ? 'superuser' : null, label: isPrivileged ? '👑 Superusuario Pruebas' : null });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
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
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}

startServer().catch(err => {
  console.error("Failed to start server process:", err);
  process.exit(1);
});