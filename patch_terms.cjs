const fs = require('fs');

let terms = fs.readFileSync('public/legal/terms.html', 'utf-8');

const additionalTerms = `<h2>15. Pagos y Renovación Automática</h2>
<p>Los pagos se procesan a través de <strong>Wompi</strong>, pasarela de pagos colombiana certificada con estándar PCI-DSS. EduGlobal365 no almacena datos de tarjetas de crédito; todo el procesamiento ocurre en los servidores seguros de Wompi.</p>
<ul>
  <li>Las suscripciones se renuevan automáticamente al finalizar el periodo.</li>
  <li>Puedes cancelar en cualquier momento desde tu perfil, manteniendo el acceso hasta el fin del periodo pagado.</li>
  <li>Métodos de pago aceptados: PSE, tarjetas de crédito/débito (Visa, Mastercard, Amex), Nequi, Daviplata, Baloto y Efecty.</li>
</ul>
<h2>16. Derecho de Retracto (Ley 1480 de 2011)</h2>
<p>Tienes derecho a retractarte de la compra dentro de los <strong>5 días hábiles</strong> siguientes a la contratación, siempre que no hayas consumido más del 20% del contenido. Para solicitar retracto, escribe a <strong>soporte@eduglobal365.co</strong>.</p>
<h2>17. Cuentas Privilegiadas y de Convenio</h2>
<p>EduGlobal365 puede otorgar cuentas con acceso gratuito permanente a: (a) personal interno de pruebas, (b) aliados B2G (MinEducación, secretarías de educación), (c) aliados B2B (instituciones educativas con convenio). Estas cuentas están exentas del cobro de suscripción mientras el convenio esté vigente.</p>
`;

terms = terms.replace('  <div class="footer">', additionalTerms + '  <div class="footer">');
terms = terms.replace(/Versión 2\.2/g, 'Versión 2.3');

fs.writeFileSync('public/legal/terms.html', terms, 'utf-8');
console.log("Terms updated.");
