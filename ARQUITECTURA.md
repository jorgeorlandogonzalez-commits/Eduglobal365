# 🏗️ Documento de Arquitectura de Software (SAD)
**Proyecto:** Eduglobal365 v6.0 (Fase 1 - MVP Avanzado + Track Constructor + Integración Curricular MEN)
**Modelo:** SAS BIC (Impacto Social y Educativo)
**Enfoque:** Audio-First, AI-Powered, Offline-Capable, Dual-Track Architecture, Currículo Oficial (DBA)

## 1. Visión General y Propósito

Eduglobal365 es una plataforma educativa ecosistémica impulsada por Inteligencia Artificial (Tutor Edú) diseñada para democratizar la educación de élite en zonas rurales y urbanas de Colombia. La arquitectura está diseñada bajo los principios de Micro-learning, Audio-First (integración con NotebookLM) y alineación estricta con los lineamientos del Ministerio de Educación Nacional (MEN).

**Arquitectura de Doble Track (Dual-Track v3.0+)**: Permite operar simultáneamente bajo un mismo ecosistema técnico:
- 🎓 **Track Estudiante**: Preparación Pruebas Saber 11 (Grados 8°-11°).
- 🛠️ **Track Constructor**: Formación técnica para emprendedores que construyen soluciones con impacto social.

## 2. Decisiones Clave de Diseño (ADRs)

Para garantizar la viabilidad técnica y el despliegue rápido, con especial atención a las zonas rurales y la escalabilidad de impacto social, se tomaron las siguientes decisiones arquitectónicas:

### ADR 1: Arquitectura Client-Side SPA (Single Page Application)
- **Decisión**: Construir la aplicación utilizando React 18+ y Vite sin un backend tradicional complejo.
- **Razón**: Permite iteración rápida, despliegue estático económico y facilita la transición a una PWA (Progressive Web App) para verdaderas capacidades offline (Offline-First local execution roadmap).

### ADR 2: Persistencia Local (Local Storage) y Exportación HTML Aislada
- **Decisión**: Utilizar `localStorage` (`StorageService`) para guardar el estado del usuario, historial, materiales y proyectos. Además, implementar un exportador de paquetes HTML offline-friendly (`DownloadService`).
- **Razón**: Elimina la fricción inicial de bases de datos de red, habilita la experiencia offline instantánea para zonas con intermitencia (vía descarga de archivos HTML interactivos auto-contenidos) y aísla la data de cada "Track" (estudiante vs. constructor).

### ADR 3: RAG (Retrieval-Augmented Generation) con Anclaje Curricular (DBA)
- **Decisión**: El `geminiService` inyecta contexto de materiales curados por docentes junto con el código oficial de "Derecho Básico de Aprendizaje" (DBA) del MEN.
- **Razón**: Asegura que las respuestas del LLM no solo sean precisas según el material provisto, sino que estén auditadas curricularmente frente a estándares oficiales, crucial para el modelo B2G (Business-to-Government) e impacto verificable.

### ADR 4: Arquitectura "Audio-First" para Fase MVP
- **Decisión**: Restringir componentes interactivos intensivos en ancho de banda (como video) en favor del audio en la fase inicial, limitando la integración de Google Vids a la Fase 2 del roadmap.
- **Razón**: Reducción de barreras de acceso en conexiones rurales o dispositivos de gama baja, empujando una ingesta basada en podcasting educativo generativo (ej. NotebookLM derivado).

### ADR 5: Arquitectura Dual-Track Estricta
- **Decisión**: Desacoplar estados de memoria, instrucciones de sistema (SYSTEM_INSTRUCTIONS) y flujos de UI base (ej: `applet` layout vs. `ConstructorLab`) usando un enumerador de rol (`UserRole`: 'student', 'teacher', 'builder', 'admin').
- **Razón**: Protege la experiencia del modelo cognitivo de la IA ("Tutor Estricto" vs "Coach Constructor") para que no ocurran "alucinaciones de rol" cruzadas (context bleeding). Además, activa la "Cross-Track Synergy" donde constructores pueden apuntar a resolver problemas de `SubjectID` educativos.

## 3. Componentes Principales (Vista Estructural)

La aplicación sigue una arquitectura modular basada en componentes funcionales de React y servicios singleton:

### Capa de Presentación (UI Components)
- `App.tsx` (Orquestador Dual): Maneja estado global y actúa como el "Controlador Frontal", despachando flujos basados en el rol del usuario (Student, Teacher, Builder), usando `crypto.randomUUID()` polifillado para gestión de IDs segura.
- `CampusMap.tsx` & `LandingPage.tsx`: Puertas de entrada para navegación espacial; ahora soportan conmutación limpia de tracks.
- `TeacherPortal.tsx`: Backoffice docente, enfocado en mapeo DBA de recursos (audio texto).
- `SubjectDashboard.tsx`: UI consumidora final para estudiantes. Oculta herramientas avanzadas/beta dinámicamente si no están activas en MVP (Audio-First pattern).
- `ConstructorLab.tsx`: Panel focalizado en gestión CRUD (Local) de proyectos de infraestructura ("Build with Purpose" pattern); maneja métricas de impacto y estados (IDEACIÓN, PROGRESO, COMPLETADO).
- `ChatBubble.tsx`: Presentación de la conversación AI. Renderizado polimórfico especializado interpretando *markdown extendido* privativo de la app (`[CODE_SNIPPET]`, `[QUIZ_FLASH]`, etc) condicionado por Track de lectura.

### Capa de Lógica de Negocio (Services)
- `geminiService.ts`: Gestor LLM (`gemini-2.0-flash`). Inyección de contexto maestro con System Prompt condicionado y control estricto de roles (`maxOutputTokens`, RAG curado in-prompt).
- `storageService.ts`: Capa ORM / LocalStorage wrapper. Mantiene la separación Multi-Tenancy local usando propiedades `track` en los datos serializados.
- `downloadService.ts`: Compilador nativo de exportaciones HTML (`Smart Packages`), con ramas polimórficas (exportación modo Estudiante "Para la Vereda" o modo Constructor "Package técnico").

### Capa de Configuración y Dominio (`src/config/`)
- `constants.ts`: "Cerebro Sistemático". Contiene el diccionario `DBA_CODES` hardcoded para validación offline ultra-rápida. Define el `SYSTEM_INSTRUCTIONS_V5` maestro.
- `types.ts`: TS Enums y Typedefs fundacionales (`Message`, `CourseMaterial`, `BuilderProject`, `UserRole`, `SubjectModule`). Establece los contratos de invariabilidad del dominio.

## 4. Flujos de Interacción Extendidos (Vista Dinámica)

### Flujo Dual-Track Isolation
1. El usuario selecciona perfil (Estudiante o Constructor) en `LandingPage`.
2. El Orquestador (`App.tsx`) actualiza estado persistente (`userRole: lowercase valid`).
3. Al iniciar chat, el `geminiService` inyecta RAG y metadato de rol al System Prompt.
4. Las respuestas del LLM y mensajes User se archivan en `StorageService` adjuntos al `track` activo.
5. El renderizado visual de conversaciones y exportaciones asumen el rol del `track` para mostrar UI adaptada (Ej: "Consejo de Arquitectura" a un builder, no a un estudiante).

### Flujo "Cross-Track Synergy"
1. Un 'Builder' en `ConstructorLab` crea proyecto declarando una "Impact Metric".
2. Selecciona un Módulo del MEN (`linkedSubjectId`) que su herramienta resolverá.
3. Se genera un "Builder Package" offline vía `DownloadService`, conteniendo especificaciones técnicas y trazabilidad al DBA a solucionar, listo para trabajo de campo sin internet.

## 5. Escalabilidad y Mantenibilidad (Ruta hacia Frente Local - WebLLM)

El código actual está en posición de refactorización "Drop-In" para la Fase 2 gracias a su modularidad de servicios:

### Sustitución Capa LLM
La función de `geminiService.ts` está desacoplada de la UI. La migración "True Offline" de Fase 2 permitirá intercambiar la llamada REST `GoogleGenAI` (Gemini API) por un motor en el navegador localizador de modelos cuantizados locales (ej. Gemma 2B via WebLLM/WebGPU), preservando 100% el mismo UI React.

### Sustitución de Persistencia
`storageService.ts` opera con contratos TS. Pasar de `localStorage` a `IndexedDB` local o una API de backend híbrida Cloud Firestore es trivial dado el aislamiento actual.

### PWA / Integración de Aulas Remotas
La estructura actual de componentes funcionales puros facilita la integración con Service Workers (Cache Storage de Vite-PWA), fundamental para caching de audios pre-renderizados e indexación estructural.

---

> **Comentario del Arquitecto Core (v6.0)**: La estabilización de los tipos (`config/types.ts`) y la inyección estricta de variables de traza (`track` property, validadores lowercase, `dbaCode` estandarizado) en toda la cascada de UI han cerrado vulnerabilidades semánticas en la experiencia. La arquitectura es una de las pioneras en su factor de forma para LATAM: Uniendo currículo hiper-estandarizado (DBA) con metodologías ágiles de creación (Constructor) en una sola plataforma tolerante a fallos de conectividad.
