const fs = require('fs');
let app = fs.readFileSync('App.tsx', 'utf-8');

const targetStr = `      if (!status.active && !privileged.isPrivileged) {
        setShowPaymentModal(true);
      }
    };
    checkSub();
  }, [currentView, auth?.currentUser]);`;

const useEffectCode = `

  // ✅ OT#7.3-v2: Confirmar pago al volver del redirect de Wompi
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('reference') || '';
    const txId = params.get('transactionId') || params.get('transaction_id') || params.get('id') || '';
    const isReturn = ref.startsWith('edu365_') || window.location.pathname.includes('payment/success');
    if (isReturn) {
      fetch('/api/wompi/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: ref, transactionId: txId })
      }).then(() => {
        window.history.replaceState({}, '', window.location.pathname);
      }).catch(() => {});
    }
  }, []);`;

if (!app.includes("✅ OT#7.3-v2: Confirmar pago")) {
  app = app.replace(targetStr, targetStr + useEffectCode);
}
fs.writeFileSync('App.tsx', app, 'utf-8');
console.log("Patched App.tsx");
