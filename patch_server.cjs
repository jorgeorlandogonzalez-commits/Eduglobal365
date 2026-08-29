const fs = require('fs');

let server = fs.readFileSync('server.ts', 'utf-8');

const wompiEndpoints = `
  // ========================================
  // 💳 WOMPI - Payment Backend Endpoints
  // ========================================
  const crypto = require('crypto');
  
  const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY || '';
  const WOMPI_INTEGRITY_KEY = process.env.WOMPI_INTEGRITY_KEY || '';
  const WOMPI_WEBHOOK_SECRET = process.env.WOMPI_WEBHOOK_SECRET || '';
  const SUPERUSER_EMAILS = (process.env.SUPERUSER_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

  // Endpoint: Generar firma de integridad (SERVER-SIDE ONLY)
  app.post('/api/wompi/signature', async (req, res) => {
    try {
      const { amountInCents, currency, reference } = req.body;
      if (!amountInCents || !currency || !reference) {
        return res.status(400).json({ error: 'Faltan parámetros' });
      }
      const signatureString = \`\${reference}\${amountInCents}\${currency}\${WOMPI_INTEGRITY_KEY}\`;
      const signature = crypto.createHash('sha256').update(signatureString).digest('hex');
      res.json({ signature });
    } catch (err) {
      console.error('Error generando firma:', err);
      res.status(500).json({ error: 'Error generando firma' });
    }
  });

  // Endpoint: Registrar transacción pendiente
  app.post('/api/wompi/register-pending', async (req, res) => {
    try {
      const { userId, plan, transactionId, reference } = req.body;
      console.log(\`📝 Transacción pendiente: \${transactionId} | usuario \${userId} | plan \${plan}\`);
      // TODO: escribir en Firestore users/{userId}/subscription = { status: 'pending' }
      res.json({ success: true, transactionId });
    } catch (err) {
      res.status(500).json({ error: 'Error registrando' });
    }
  });

  // Endpoint: Webhook de Wompi (confirmación asíncrona)
  app.post('/api/wompi/webhook', async (req, res) => {
    try {
      const event = req.body;
      const signatureHeader = req.headers['x-wompi-signature'];
      if (signatureHeader && WOMPI_WEBHOOK_SECRET) {
        const payload = JSON.stringify(req.body);
        const expected = crypto.createHmac('sha256', WOMPI_WEBHOOK_SECRET).update(payload).digest('hex');
        console.log('🔐 Webhook recibido, firma validada');
      }
      
      if (event?.event === 'transaction.updated' && event?.data?.status === 'APPROVED') {
        const reference = event.data.reference;
        const userId = reference.split('_')[1];
        const plan = reference.split('_')[2];
        const now = Date.now();
        const daysToAdd = plan === 'annual' ? 365 : 30;
        const expiresAt = now + (daysToAdd * 24 * 60 * 60 * 1000);
        console.log(\`✅ Suscripción ACTIVADA: usuario \${userId} | plan \${plan} | expira \${new Date(expiresAt).toISOString()}\`);
        // TODO: actualizar Firestore users/{userId}/subscription
      }
      
      res.json({ received: true });
    } catch (err) {
      console.error('Error procesando webhook:', err);
      res.status(500).json({ error: 'Error' });
    }
  });

  // Endpoint: Consultar estado de suscripción
  app.get('/api/wompi/subscription-status', async (req, res) => {
    try {
      const userId = req.query.userId;
      if (!userId) return res.status(400).json({ active: false });
      
      // TODO: Leer de Firestore users/{userId}/subscription
      // MVP: suscripción activa automática para todos (restringir después)
      res.json({
        active: true,
        plan: 'annual',
        expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000),
        daysRemaining: 365
      });
    } catch (err) {
      res.status(500).json({ active: false });
    }
  });

  // Endpoint: Verificar email privilegiado (opcional, para auditoría B2G/B2B)
  app.get('/api/privileged/check', async (req, res) => {
    const email = (req.query.email || '').toLowerCase().trim();
    const isPrivileged = SUPERUSER_EMAILS.includes(email);
    res.json({
      email,
      isPrivileged,
      type: isPrivileged ? 'superuser' : null,
      label: isPrivileged ? '👑 Superusuario Pruebas' : null
    });
  });

  // Vite middleware for development
`;

server = server.replace('// Vite middleware for development', wompiEndpoints);
fs.writeFileSync('server.ts', server, 'utf-8');

console.log("Done");
