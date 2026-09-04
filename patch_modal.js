const fs = require('fs');

let modal = fs.readFileSync('components/PaymentModal.tsx', 'utf8');

const target = `    try {
      await startWompiCheckout(selectedPlan, userEmail, userName);
      onSuccess();
    } catch (e: any) {`;

const replacement = `    try {
      await startWompiCheckout(selectedPlan, userEmail, userName);
      // ✅ OT#7.6: El Widget de Wompi toma el control de la pantalla.
      // La confirmación ocurre al volver del redirect (/payment/success).
      // El modal permanece abierto por si el usuario cierra el widget sin pagar.
      setIsProcessing(false);
    } catch (e: any) {`;

if (modal.includes(target)) {
    modal = modal.replace(target, replacement);
    fs.writeFileSync('components/PaymentModal.tsx', modal, 'utf8');
    console.log("Patched correctly");
} else {
    console.log("Target not found!");
}
