# ONBOARDING EDUGLOBAL365 🚀

¡Bienvenido a **EduGlobal365 v6.0**! Este documento es tu guía de inicio rápido para operar, probar y dominar la plataforma educativa más avanzada para el contexto de Colombia, impulsada por tecnología Offline-First, IA Local (WebLLM) y un robusto enfoque de Arquitectura Dual-Track.

## 🎯 ¿Qué es EduGlobal365?
Es un "Tutor de Bolsillo" o acompañante de estudio (Tutor Edú). A diferencia de las plataformas tradicionales, EduGlobal365 está optimizada para funcionar en **Zonas Rurales ("Veredas")** donde la conectividad es intermitente o nula, a la vez que despliega toda la potencia de la nube en entornos urbanos.

---

## 🧭 Los Modos de Uso (Dual-Track)

EduGlobal365 detecta el rol del usuario para transformar radicalmente su interfaz y la personalidad de la IA:

### 🎓 Track Estudiante
- **Misión**: Validar bachillerato, dominar estándares DBA y prepararse para las pruebas Saber 11 (ICFES).
- **Cómo usarlo**: Ingresa al *Campus Virtual*, selecciona una materia (Silo), escucha el audio introductorio y responde los retos o "Quizzes Flash" que te lanza el Tutor Edú.
- **Herramienta estrella**: Exportación Inteligente (`DownloadService`) que permite **"Preparar para la Vereda"** generando un paquete HTML, PDF, Texto o JSON para importar y exportar progreso a través de USB o Bluetooth.

### 🌱 Habilidades para la Vida
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
4. Recupera la conexión a internet. Verás en consola cómo `FirebaseSyncService` entra en acción subiendo todos tus mensajes locales a la nube de manera silenciosa.

### 3. Descarga e Importación de Clases (Smart Download)
1. Dentro del chat de cualquier materia, haz clic en el botón **"Preparar para la Vereda 📥"** (Exportar).
2. Tienes opciones para exportar en HTML, PDF, Texto Plano (`.txt`) o copia de seguridad en `.json`.
3. Para validar la compatibilidad, descarga un archivo JSON y luego prueba **Importarlo**. Esto simula cómo los estudiantes en veredas podrían compartir su contenido con sus compañeros mediante memorias USB o Bluetooth sin necesidad de internet.

### 4. Simulación Ping-Pong (Audio-First)
1. Selecciona el módulo de la biblioteca con DBA cargados (Ej. Trigonometría Agrícola - MAT-11-DBA-01).
2. Reproduce el audio (Podcast).
3. A los 10 o más segundos, el sistema pausará la reproducción y disparará un **[RETO_VEREDA]** o **[QUIZ_FLASH]** en el chat automáticamente. Esto es posible gracias a los `INTERACTION_POINTS` que fuerzan la participación activa del estudiante en medio del audio.

---

## 🛠 Requisitos y Compatibilidad
- **IA Local (WebLLM)**: Requiere un navegador moderno (Chrome/Edge recientes) que soporte **WebGPU**. 
- **Persistencia**: Requiere permisos para almacenamiento local (IndexedDB) de al menos 2GB si se van a cachear modelos de IA completos.
- **PWA**: Instalación como app en dispositivos móviles soportada (Manifest e iconos listos en `vite.config.ts` y `/public`).

¡A disfrutar de la revolución educativa!

## 💳 Modelo Comercial (SAS BIC)
| Plan | Precio (COP, IVA incl.) | Incluye |
|------|--------------------------|---------|
| Mensual | $49.900/mes | Bachillerato 8°–11°, ICFES, Idiomas, modo offline, IA local |
| Anual | $499.000/año | Todo lo anterior + 2 meses gratis (ahorra $99.800) |

## Nota de Marca (Blindaje de Know-How)
- **Prohibido** mencionar nombres técnicos de modelos de IA ("Gemma", "Gemma 2B", "Gemma 4", "Llama", etc.) en:
  - Capturas de pantalla
  - Demos públicas
  - Marketing y comunicaciones
  - Respuestas del Tutor Edú
- **Usar siempre**: "IA local en tu GPU" / "IA local en tu dispositivo" / "motor local privado".
- Esta regla protege el know-how de la compañía y es coherente con el blindaje definido en ARQUITECTURA.md v6.0+.
