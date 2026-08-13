const fs = require('fs');

if (fs.existsSync('ONBOARDING.md')) {
  fs.appendFileSync('ONBOARDING.md', `\n## 💳 Modelo Comercial (SAS BIC)
| Plan | Precio (COP, IVA incl.) | Incluye |
|------|--------------------------|---------|
| Mensual | $49.900/mes | Bachillerato 8°–11°, ICFES, Idiomas, modo offline, IA local |
| Anual | $499.000/año | Todo lo anterior + 2 meses gratis (ahorra $99.800) |
| Solidaridad | $0 | Jóvenes afectados por la emergencia, vía subsidio cruzado |
`);
}

if (fs.existsSync('ARQUITECTURA.md')) {
  fs.appendFileSync('ARQUITECTURA.md', `\n## Modelo Comercial SAS BIC
- Precio único estudiante: COP $49.900/mes o COP $499.000/año (2 meses gratis).
- Subsidio cruzado: el ingreso de planes pagos financia el Plan Solidaridad (gratuito para afectados por la emergencia).
- El Tutor Edú conoce los precios oficiales (ver <MODELO_COMERCIAL> en el System Instruction v5.3) y nunca inventa descuentos.
`);
}
