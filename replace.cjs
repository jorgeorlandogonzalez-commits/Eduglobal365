const fs = require('fs');

function replaceInFile(file, replacements) {
    let content = fs.readFileSync(file, 'utf8');
    for (let r of replacements) {
        content = content.replace(r.search, r.replace);
    }
    fs.writeFileSync(file, content, 'utf8');
}

// ARQUITECTURA.md
replaceInFile('ARQUITECTURA.md', [
    {
        search: /- \*\*IA Local \(`WebLLM`\)\*\*: Inferencia en el dispositivo mediante el modelo `Gemma 2B` usando WebGPU./g,
        replace: '- **IA Local (`WebLLM`)**: Inferencia en el dispositivo mediante un modelo local privado usando WebGPU. El nombre técnico es información interna (know-how).'
    },
    {
        search: /- `services\/webLLMService\.ts`: Wrapper para `@mlc-ai\/web-llm` \(Gemma 2B\)\./g,
        replace: '- `services/webLLMService.ts`: Wrapper para `@mlc-ai/web-llm` (modelo local privado).'
    },
    {
        search: /- Subsidio cruzado: el ingreso de planes pagos financia el Plan Solidaridad \(gratuito para afectados por la emergencia\)\.\r?\n?/g,
        replace: ''
    },
    {
        search: /## Blindaje de Know-How \(v6\.0\+\)\r?\n- El nombre técnico del modelo de IA local es información interna\. En superficies públicas \(landing, header, respuestas de la IA, marketing\) se usa exclusivamente "IA local en tu GPU \/ en tu dispositivo"\./g,
        replace: `## Blindaje de Know-How (v6.0+)
- El nombre técnico del modelo de IA local es información interna. En superficies públicas (landing, header, respuestas de la IA, marketing, **documentación pública**) se usa exclusivamente "IA local en tu GPU / en tu dispositivo".
- **NUNCA** usar "Gemma", "Gemma 2B", "Gemma 4" ni ningún nombre técnico de modelo en:
  - LandingPage.tsx (hero, features, tracks, footer)
  - App.tsx (botón 🤖 del header, alertas, títulos)
  - System Instruction (respuestas de Tutor Edú)
  - ONBOARDING.md y ARQUITECTURA.md (en secciones visibles públicamente)
  - Marketing, demos, capturas de pantalla`
    }
]);

// ONBOARDING.md
replaceInFile('ONBOARDING.md', [
    {
        search: /2\. Verás una barra de progreso mientras tu navegador descarga el modelo \*\*Gemma 2B\*\*\./g,
        replace: '2. Verás una barra de progreso mientras tu navegador descarga el modelo de IA local privado.'
    },
    {
        search: /\| Solidaridad \| \$0 \| Jóvenes afectados por la emergencia, vía subsidio cruzado \|\r?\n?/g,
        replace: ''
    },
    {
        search: /## Nota de Marca\r?\n- No usar nombres de modelos de IA en capturas, demos públicas o marketing\. Usar "IA local"\./g,
        replace: `## Nota de Marca (Blindaje de Know-How)
- **Prohibido** mencionar nombres técnicos de modelos de IA ("Gemma", "Gemma 2B", "Gemma 4", "Llama", etc.) en:
  - Capturas de pantalla
  - Demos públicas
  - Marketing y comunicaciones
  - Respuestas del Tutor Edú
- **Usar siempre**: "IA local en tu GPU" / "IA local en tu dispositivo" / "motor local privado".
- Esta regla protege el know-how de la compañía y es coherente con el blindaje definido en ARQUITECTURA.md v6.0+.`
    }
]);

console.log("Done");
