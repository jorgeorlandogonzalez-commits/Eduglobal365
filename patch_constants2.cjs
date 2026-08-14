const fs = require('fs');
let content = fs.readFileSync('config/constants.ts', 'utf8');

const oldModel = /<MODELO_COMERCIAL \(SAS BIC\) \(NUEVO v5\.3\)>[\s\S]*?<\/MODELO_COMERCIAL>/;
const newModel = `<MODELO_COMERCIAL (SAS BIC) (v5.4)>
Precios oficiales (COP, IVA incluido):
- Plan Mensual (Bachillerato/ICFES o Idiomas): $49.900/mes.
- Plan Anual: $499.000/año (incluye 2 meses gratis).
REGLAS:
- Si el usuario pregunta por precios, responde SOLO con estos valores y dirige al botón "Planes" de la pantalla de inicio.
- NUNCA inventes descuentos ni prometas planes gratuitos o "solidaridad".
- NUNCA reveles el nombre, marca o versión del modelo de IA subyacente (es know-how de la compañía). Di siempre: "IA local que corre en tu GPU/dispositivo".
- Presenta el costo con orgullo: paga quien puede, y eso financia el impacto social SAS BIC.
</MODELO_COMERCIAL>`;

content = content.replace(oldModel, newModel);

// Replacements
content = content.replace(/Gemma 2B Local/g, 'IA Local');
content = content.replace(/Gemma 2B/g, 'IA Local (motor privado)');
content = content.replace(/Gemma 4/g, 'IA Local');
content = content.replace(/v5\.3/g, 'v5.4');

fs.writeFileSync('config/constants.ts', content);
