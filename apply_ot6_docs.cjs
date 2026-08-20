const fs = require('fs');
let arch = fs.readFileSync('ARQUITECTURA.md', 'utf-8');
const archRegex = /- \*\*Track Constructor\*\*: Metodología "Build with Purpose"\. Orientado a jóvenes que desean desarrollar proyectos de impacto social, definiendo Stack Técnico y Métricas de Impacto, con soporte de IA tipo "Coach Técnico"\./;
const archReplace = `- **Categoría Habilidades para la Vida** (dentro del Track Estudiante): Formación NO formal (finanzas, emprendimiento, comunicación, alfabetización digital) con certificado de finalización. Sustituye al antiguo "Track Constructor" público (eliminado en v6.1 por decisión de modelo de negocio: sin marketplace de terceros).`;
arch = arch.replace(archRegex, archReplace);
fs.writeFileSync('ARQUITECTURA.md', arch, 'utf-8');

let onboarding = fs.readFileSync('ONBOARDING.md', 'utf-8');
const onboardRegex = /### 🛠️ Track Constructor[\s\S]*?### 3\. Descarga e Importación/g;
const onboardReplace = `### 🌱 Habilidades para la Vida
- **Misión**: Formación NO formal para el trabajo y la vida diaria (finanzas, emprendimiento, comunicación, alfabetización digital).
- **Cómo usarlo**: Ingresa al *Campus Virtual*, selecciona el bloque "Habilidades para la Vida".
- **Herramienta estrella**: Al finalizar cualquiera de los 4 cursos cortos, obtienes un certificado de finalización de carácter privado. Esta categoría está 100% incluida en la suscripción principal.

---

## ⚡ Guía de Pruebas (La Prueba de Fuego)
Para asegurar que todo el motor funciona correctamente, te sugerimos seguir este flujo de validación:

### 1. Inicializa la Inteligencia Artificial Local (WebLLM)
1. En la barra de navegación (Header), haz clic en el botón con el ícono del Robot 🤖 (Botón WebLLM).
2. Verás una barra de progreso mientras tu navegador descarga el modelo de IA local privado.
3. Una vez alcance el 100%, el botón se pondrá en verde. ¡Felicidades! Tienes un cerebro de IA operando directamente en tu tarjeta gráfica, sin depender de servidores.

### 2. Prueba el "Modo Vereda" (Offline Test)
1. Estando en el Dashboard de Materias, **apaga tu conexión a internet** (puedes usar las DevTools del navegador en modo "Offline").
2. Entra a una materia (Ej: Matemáticas). Gracias a los *DBA Seed Content* siempre tendrás contenido mínimo vital aunque no tengas internet.
3. Chatea con el Tutor Edú. Notarás que te responde inmediatamente usando WebLLM, todo se guarda localmente en IndexedDB.
4. Recupera la conexión a internet. Verás en consola cómo \`FirebaseSyncService\` entra en acción subiendo todos tus mensajes locales a la nube de manera silenciosa.

### 3. Descarga e Importación`;
onboarding = onboarding.replace(/### 🛠️ Track Constructor[\s\S]*?### 3\. Descarga e Importación/g, onboardReplace);
fs.writeFileSync('ONBOARDING.md', onboarding, 'utf-8');
console.log("Done");
