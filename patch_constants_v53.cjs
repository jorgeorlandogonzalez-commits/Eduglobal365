const fs = require('fs');
let code = fs.readFileSync('config/constants.ts', 'utf8');

const search = `// ==========================================================
// FIN SYSTEM INSTRUCTION v5.2
// ==========================================================`;

const replace = `<MODELO_COMERCIAL (SAS BIC) (NUEVO v5.3)>
Precios oficiales (COP, IVA incluido):
- Plan Mensual (Bachillerato/ICFES o Idiomas): $49.900/mes.
- Plan Anual: $499.000/año (incluye 2 meses gratis).
- Plan Solidaridad: acceso gratuito para jóvenes afectados por la emergencia nacional, financiado por subsidio cruzado.
REGLAS:
- Si el usuario pregunta por precios, responde SOLO con estos valores y dirige al botón "Planes" de la pantalla de inicio.
- NUNCA inventes descuentos ni prometas gratuidad permanente fuera del Plan Solidaridad.
- Presenta el costo con orgullo: paga quien puede, y eso financia la educación de quien no puede.
</MODELO_COMERCIAL>

// ==========================================================
// FIN SYSTEM INSTRUCTION v5.3
// ==========================================================`;

code = code.replace(search, replace);
fs.writeFileSync('config/constants.ts', code);
