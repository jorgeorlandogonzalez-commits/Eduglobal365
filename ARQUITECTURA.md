# ARQUITECTURA EDUGLOBAL365 v6.0

## Visión General
EduGlobal365 es un sistema educativo avanzado (B2B2C / B2G) diseñado bajo el modelo SAS BIC, con un enfoque principal en la accesibilidad para zonas rurales y urbanas de Colombia. Su propuesta de valor central es entregar educación de élite impulsada por IA, sin depender de una conexión constante a internet.

## 4 Pilares Arquitectónicos

### 1. Offline-First Absoluto (Local First)
La aplicación está diseñada asumiendo que **no hay internet por defecto**:
- **Base de Datos Local (`idb`)**: Uso intensivo de `IndexedDB` a través de `StorageService` como la única y verdadera fuente de la verdad en tiempo de ejecución.
- **IA Local (`WebLLM`)**: Inferencia en el dispositivo mediante el modelo `Gemma 2B` usando WebGPU. Permite respuestas conversacionales socráticas de IA sin latencia de red ni consumo de datos.
- **Sincronización Diferida (`FirebaseSyncService`)**: Firestore actúa únicamente como un "espejo" de respaldo. Cuando la PWA detecta conexión (`window.addEventListener('online')`), vacía la cola local y sube el progreso, mensajes y analíticas.
- **Smart Downloads (`DownloadService`)**: Capacidad de compilar el estado actual del chat, RAG y metadata en un **paquete HTML autocontenido** con Service Worker inyectado. Esto permite exportar módulos enteros a una memoria USB ("Preparar para la Vereda") y ejecutarlos en cualquier navegador offline.

### 2. Dual-Track System
El sistema aísla y adapta los flujos de usuario (Roles):
- **Track Estudiante**: Foco en preparación Saber 11 (ICFES), estándares DBA (Derechos Básicos de Aprendizaje), y micro-learning socrático. Gamificado con puntos y medallas.
- **Track Constructor**: Metodología "Build with Purpose". Orientado a jóvenes que desean desarrollar proyectos de impacto social, definiendo Stack Técnico y Métricas de Impacto, con soporte de IA tipo "Coach Técnico".
- **Track Docente/Admin**: Capacidad de auto-generar materiales alineados a los currículos (DBA) y reportar métricas de cobertura B2G.

### 3. Audio-First (Micro-learning Ping-Pong)
- Interfaz centrada en la consumición de contenidos curados en formato Podcast.
- **Context-Aware Timestamps (`dbaSeedContent.ts`)**: El audio detona eventos interactivos. El sistema pausa el reproductor en segundos específicos y lanza "Retos de Vereda" o "Quiz Flash" a través de la IA.

### 4. Motor ZPD y Gamificación Intrínseca
- **Zona de Desarrollo Próximo (ZPD)**: El perfil del usuario ajusta la dificultad de las respuestas del LLM (Nivel 1 Básico a Nivel 3 Avanzado).
- Gamificación atada al aprendizaje (rachas, quizzes aprobados) sin incentivos puramente extrínsecos.

## Mapa de Servicios Core
- `services/storageService.ts`: Capa de persistencia asíncrona local (IndexedDB).
- `services/webLLMService.ts`: Wrapper para `@mlc-ai/web-llm` (Gemma 2B).
- `services/geminiService.ts`: Controlador híbrido de IA. Enruta a Gemini 3.1 Pro (Nube) si hay red, o hace fallback a `webLLMService` (Local) / estático si no hay red.
- `services/downloadService.ts`: Motor de empaquetado de archivos `.html`, `.pdf` y `.json`.
- `config/firebase.ts`: Inicialización en la nube, Autenticación anónima y Auto-Sync.

## Flujo de Datos Híbrido (Ejemplo de Chat)
1. Usuario envía mensaje.
2. `geminiService` verifica red (`navigator.onLine` / Flag manual).
3. **Offline**: Llama a WebLLM. **Online**: Llama a Gemini.
4. Respuesta recibida -> Se guarda en `IndexedDB` (`storageService.saveMessage`).
5. Se encola un job de sync (`storageService.addToSyncQueue`).
6. Si hay red, `startAutoSync` procesa la cola y refleja el mensaje en Firestore.
