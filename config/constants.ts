// src/config/constants.ts
import { NotebookTool, SubjectModule, UserRole } from "./types";

export const APP_NAME = "Eduglobal365";

// ============================================================================
// 🎯 NOTEBOOK_TOOLS - Herramientas de Estudio Interactivo (Audio-First MVP)
// ============================================================================
/**
 * Lista de herramientas disponibles para el estudiante en cada módulo.
 * 🔄 'video' está comentado para Fase 1 (Audio-First offline-friendly).
 * Para habilitar video en Fase 2: descomentar la línea y actualizar UI components.
 */
export const NOTEBOOK_TOOLS: NotebookTool[] = [
  { id: 'audio', label: 'Resumen en audio', icon: '🎧', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  // { id: 'video', label: 'Resumen en video', icon: '🎬', color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' }, // 🔄 Fase 2: Google Vids integration
  { id: 'informe', label: 'Informes', icon: '📄', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
  { id: 'quiz', label: 'Cuestionario', icon: '❓', color: 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100' },
  { id: 'tabla', label: 'Tabla de datos', icon: '📊', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' },
  { id: 'presentacion', label: 'Presentación', icon: '📽️', color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' },
  { id: 'mapa', label: 'Mapa mental', icon: '🧠', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
  { id: 'tarjetas', label: 'Tarjetas didácticas', icon: '🗂️', color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' },
  { id: 'infografia', label: 'Infografía', icon: '🖼️', color: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 hover:bg-fuchsia-100' },
];

// ============================================================================
// 📚 DBA_CODES - Mapeo Centralizado de Derechos Básicos de Aprendizaje (MEN)
// ============================================================================
/**
 * Objeto centralizado para códigos DBA del Ministerio de Educación Nacional.
 * Formato: {MATERIA}-{GRADO}-DBA-{ÍNDICE}
 * Ej: 'MAT-11-DBA-01' = Matemáticas, Grado 11, DBA #01
 * 
 * Beneficios:
 * - Facilita actualización curricular sin tocar lógica de negocio
 * - Permite reportes de cobertura ante el MEN
 * - Diferencia EduGlobal365 de competidores sin validación oficial
 */
export const DBA_CODES = {
  // Matemáticas
  MATEMATICAS: {
    '9': ['MAT-09-DBA-01', 'MAT-09-DBA-02', 'MAT-09-DBA-03'],
    '10': ['MAT-10-DBA-01', 'MAT-10-DBA-02', 'MAT-10-DBA-03'],
    '11': ['MAT-11-DBA-01', 'MAT-11-DBA-02', 'MAT-11-DBA-03']
  },
  // Humanidades y Lengua Castellana
  HUMANIDADES: {
    '9': ['HUM-09-DBA-01', 'HUM-09-DBA-02'],
    '10': ['HUM-10-DBA-01', 'HUM-10-DBA-02'],
    '11': ['HUM-11-DBA-01', 'HUM-11-DBA-02']
  },
  // Ciencias Naturales
  CIENCIAS_NATURALES: {
    '9': ['CNA-09-DBA-01', 'CNA-09-DBA-02'],
    '10': ['CNA-10-DBA-01', 'CNA-10-DBA-02'],
    '11': ['CNA-11-DBA-01', 'CNA-11-DBA-02']
  },
  // Ciencias Sociales
  CIENCIAS_SOCIALES: {
    '9': ['CSO-09-DBA-01', 'CSO-09-DBA-02', 'CSO-09-DBA-03'],
    '10': ['CSO-10-DBA-01', 'CSO-10-DBA-02', 'CSO-10-DBA-03'],
    '11': ['CSO-11-DBA-01', 'CSO-11-DBA-02', 'CSO-11-DBA-03']
  },
  // Idioma Extranjero (Inglés)
  INGLES: {
    '9': ['ING-09-DBA-01'],
    '10': ['ING-10-DBA-01'],
    '11': ['ING-11-DBA-01']
  }
} as const;

// ============================================================================
// 🔧 HELPERS UTILITARIOS
// ============================================================================

/**
 * Obtiene el código DBA para una materia, grado y módulo específicos.
 * @param subject - Nombre de la materia (ej: "Matemáticas")
 * @param grade - Grado escolar (ej: "11°")
 * @param moduleIndex - Índice del módulo (0-based, para seleccionar DBA específico)
 * @returns Código DBA en formato "XXX-XX-DBA-XX" o fallback genérico
 */
export const getDbaCode = (subject: string, grade: string, moduleIndex: number = 0): string => {
  const gradeNum = grade.replace('°', '');
  const subjectKey = subject.toUpperCase().replace(/\s+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Mapeo de nombres de materia a claves de DBA_CODES
  const subjectMap: Record<string, keyof typeof DBA_CODES> = {
    'MATEMÁTICAS': 'MATEMATICAS',
    'HUMANIDADESYLENGUACASTELLANA': 'HUMANIDADES',
    'CIENCIASNATURALES': 'CIENCIAS_NATURALES',
    'CIENCIASSOCIALES': 'CIENCIAS_SOCIALES',
    'IDIOMAEXTRANJERO': 'INGLES',
    'INGLÉS': 'INGLES',
    'INGLES': 'INGLES'
  };
  
  const dbaKey = subjectMap[subjectKey];
  
  if (dbaKey && DBA_CODES[dbaKey][gradeNum]) {
    const codes = DBA_CODES[dbaKey][gradeNum];
    // Retornar código específico o el último disponible si el índice excede
    return codes[Math.min(moduleIndex, codes.length - 1)];
  }
  
  // Fallback genérico para materias no mapeadas
  const abbr = subject.substring(0, 3).toUpperCase();
  return `${abbr}-${gradeNum}-DBA-${String(moduleIndex + 1).padStart(2, '0')}`;
};

/**
 * Valida si un rol de usuario es válido según la arquitectura Dual-Track.
 * @param role - String a validar
 * @returns true si el rol es válido ('student' | 'teacher' | 'builder' | 'admin')
 */
export const isValidUserRole = (role: string): role is UserRole => {
  return ['student', 'teacher', 'builder', 'admin'].includes(role);
};

/**
 * Obtiene el label amigable para un UserRole.
 * @param role - UserRole a convertir
 * @returns Label en español para UI
 */
export const getUserRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    student: 'Estudiante',
    teacher: 'Docente',
    builder: 'Constructor',
    admin: 'Administrador'
  };
  return labels[role];
};

// ============================================================================
// 🎓 getModulesForSubject - Traductor Curricular MEN → Estructura de Datos
// ============================================================================
/**
 * Traduce la estructura curricular oficial del MEN (EBC/DBA) a una estructura
 * de datos consumible por la aplicación. Separa Educación Básica Secundaria
 * (8°-9°) de la Media Académica (10°-11°) según lineamientos del Ministerio.
 * 
 * @param subject - Nombre de la materia
 * @param grade - Grado escolar ("8°", "9°", "10°", "11°")
 * @returns Array de SubjectModule con dbaCode para trazabilidad oficial
 */
export const getModulesForSubject = (subject: string, grade: string): SubjectModule[] => {
  const isMedia = grade.includes('10') || grade.includes('11');
  const gradeNum = grade.replace('°', '');

  if (subject === 'Matemáticas') {
    if (isMedia) {
      return [
        { id: 'm1', title: 'Trigonometría', description: 'Relaciones trigonométricas y aplicaciones.', dbaCode: 'MAT-11-DBA-01' },
        { id: 'm2', title: 'Cálculo', description: 'Límites, derivadas e integrales básicas.', dbaCode: 'MAT-11-DBA-02' },
        { id: 'm3', title: 'Estadística Avanzada', description: 'Análisis de datos y probabilidad.', dbaCode: 'MAT-11-DBA-03' }
      ];
    }
    return [
      { id: 'm1', title: 'Álgebra Introductoria', description: 'Ecuaciones y expresiones algebraicas.', dbaCode: 'MAT-09-DBA-01' },
      { id: 'm2', title: 'Geometría', description: 'Figuras planas y espaciales.', dbaCode: 'MAT-09-DBA-02' },
      { id: 'm3', title: 'Estadística Básica', description: 'Recolección y análisis de datos.', dbaCode: 'MAT-09-DBA-03' }
    ];
  }
  
  if (subject === 'Humanidades y Lengua Castellana') {
    if (isMedia) {
      return [
        { id: 'hl1', title: 'Análisis Literario Universal', description: 'Obras clásicas y contemporáneas.', dbaCode: 'HUM-11-DBA-01' },
        { id: 'hl2', title: 'Argumentación', description: 'Construcción de ensayos y debates.', dbaCode: 'HUM-11-DBA-02' }
      ];
    }
    return [
      { id: 'hl1', title: 'Lectura Crítica', description: 'Comprensión e interpretación de textos.', dbaCode: 'HUM-09-DBA-01' },
      { id: 'hl2', title: 'Literatura Latinoamericana', description: 'Autores y movimientos representativos.', dbaCode: 'HUM-09-DBA-02' }
    ];
  }

  if (subject === 'Ciencias Naturales') {
    if (isMedia) {
      return [
        { id: 'cn1', title: 'Física', description: 'Mecánica, ondas y energía.', dbaCode: 'CNA-11-DBA-01' },
        { id: 'cn2', title: 'Química', description: 'Estructura atómica y reacciones.', dbaCode: 'CNA-11-DBA-02' }
      ];
    }
    return [
      { id: 'cn1', title: 'Biología', description: 'Célula, genética y ecosistemas.', dbaCode: 'CNA-09-DBA-01' },
      { id: 'cn2', title: 'Introducción a Física y Química', description: 'Conceptos básicos de la materia.', dbaCode: 'CNA-09-DBA-02' }
    ];
  }

  if (subject === 'Ciencias Sociales') {
    if (isMedia) {
      return [
        { id: 'cs1', title: 'Geopolítica', description: 'Relaciones internacionales y conflictos.', dbaCode: 'CSO-11-DBA-01' },
        { id: 'cs2', title: 'Ciencias Económicas y Políticas', description: 'Sistemas económicos y democracia.', dbaCode: 'CSO-11-DBA-02' },
        { id: 'cs3', title: 'Filosofía', description: 'Pensamiento crítico y corrientes filosóficas.', dbaCode: 'CSO-11-DBA-03' }
      ];
    }
    return [
      { id: 'cs1', title: 'Geografía Humana', description: 'Población y territorio.', dbaCode: 'CSO-09-DBA-01' },
      { id: 'cs2', title: 'Historia', description: 'Historia de Colombia y el mundo.', dbaCode: 'CSO-09-DBA-02' },
      { id: 'cs3', title: 'Constitución', description: 'Derechos y deberes ciudadanos.', dbaCode: 'CSO-09-DBA-03' }
    ];
  }

  if (subject === 'Idioma Extranjero' || subject === 'Inglés') {
    if (isMedia) {
      return [
        { id: 'ie1', title: 'Inglés Intensivo', description: 'Preparación para pruebas estandarizadas.', dbaCode: 'ING-11-DBA-01' }
      ];
    }
    return [
      { id: 'ie1', title: 'Inglés Básico', description: 'Vocabulario y gramática fundamental.', dbaCode: 'ING-09-DBA-01' }
    ];
  }

  // Fallback genérico con dbaCode dinámico usando helper
  const subjectAbbr = subject.substring(0, 3).toUpperCase();
  return [
    { id: 'mod1', title: `Fundamentos de ${subject}`, description: 'Conceptos clave y aplicaciones prácticas.', dbaCode: getDbaCode(subject, grade, 0) },
    { id: 'mod2', title: `Profundización en ${subject}`, description: 'Análisis avanzado y casos de estudio.', dbaCode: getDbaCode(subject, grade, 1) }
  ];
};

// ============================================================================
// 🤖 SYSTEM_INSTRUCTIONS_V5 - Prompt Dual-Track para Tutor Edú / Asistente Constructor
// ============================================================================
/**
 * System Instructions optimizado para arquitectura Audio-First (Fase 1) 
 * y metodología "Build with Purpose" para Track Constructor.
 * 
 * Inyectar en Gemini API como `systemInstruction` para comportamiento consistente.
 */
export const SYSTEM_INSTRUCTIONS_V5 = `
// ==========================================================
// OS EDUGLOBAL365 V5.0 - ARQUITECTURA DUAL-TRACK
// ==========================================================

<IDENTIDAD_Y_VIBE>
Nombre: Tutor Edú (o Asistente Constructor, según el rol del usuario).
Rol: Coach de aprendizaje interactivo (Track Estudiante) o Mentor Técnico (Track Constructor).
Misión: Operar bajo el modelo SAS BIC, garantizando educación de élite y "Offline-First" para estudiantes, y guiando a emprendedores a construir soluciones con impacto social.
Tono: Conversacional, rápido, enérgico. Usa jerga colombiana sutil (ej. "¡Pilas!", "Qué nota", "Vamos con toda").
</IDENTIDAD_Y_VIBE>

<CONTEXTO_OPERATIVO_DUAL>
Si estás hablando con un ESTUDIANTE:
1. Comprobar si entendió el audio/clase.
2. Ponerle un reto práctico basado en su región (ej. Urabá, Boyacá, etc.).
3. Resolver dudas específicas si algo del podcast no quedó claro.

Si estás hablando con un CONSTRUCTOR:
1. Ayudarle a definir la arquitectura y el stack técnico de su proyecto.
2. Guiarlo bajo la metodología "Build with Purpose" (Impacto Social).
3. Proveer fragmentos de código, buenas prácticas y revisión de lógica.
</CONTEXTO_OPERATIVO_DUAL>

<REGLA_DEL_MICRO_LEARNING>
- Prohibido enviar muros de texto. Respuestas deben leerse en menos de 45 segundos o máximas de 5 a 6 líneas de lectura rápida.
- Siempre termina tu turno devolviéndole la pelota al usuario con una pregunta, un reto o un quiz. 
- Fomenta el método socrático: si falla, dale pistas lógicas, no la respuesta directa.
</REGLA_DEL_MICRO_LEARNING>

<COMANDOS_MULTIMODALES_UI>
Usa estas ETIQUETAS ESTRUCTURADAS para que la interfaz web/móvil active funciones ligeras:
1. [PODCAST_TRIGGER: "Nombre del Tema"]: Reproduce el audio curado de NotebookLM.
2. [QUIZ_FLASH]: Lanza pregunta rápida de opción múltiple (A, B, C).
3. [RETO_VEREDA]: Problema aplicado al entorno agrícola/comercial del estudiante.
4. [CODE_SNIPPET]: Muestra fragmento de código para el Track Constructor.
5. [ARCHITECTURE_TIP]: Sugerencia de arquitectura offline-first para constructores.
</COMANDOS_MULTIMODALES_UI>

<FORMATO_DE_SALIDA>
- Gancho inicial rápido (Ej: "¡Listo! Terminó el podcast de Álgebra.").
- Comando de acción interactiva ([PODCAST_TRIGGER...], [QUIZ_FLASH], [RETO_VEREDA], [CODE_SNIPPET], etc.).
- Desarrollo corto (máximo 5-6 líneas).
- CIERRE OBLIGATORIO: [📥 MODO OFFLINE: 2 bullet points con la pepa del conocimiento para llevar].
</FORMATO_DE_SALIDA>
`;

// ============================================================================
// 💬 Mensajes de Sistema y Onboarding
// ============================================================================

/**
 * Mensaje inicial personalizado según el grado del estudiante.
 * Usa el personaje "Valentina" para generar empatía y contexto rural.
 */
export const getInitialUserMessage = (grade: string) => `¡Hola! Soy Valentina, estoy en ${grade} grado en una zona rural del Urabá Antioqueño. Es la primera vez que entro a EduGlobal365 y estoy un poco nerviosa por las pruebas ICFES. Siento que las Matemáticas me van a dar muy duro. ¿Qué hago?`;

/**
 * Trigger para activar modo simulacro ICFES estricto.
 * La IA debe comportarse como evaluador, no como tutor, en este modo.
 */
export const SIMULATION_TRIGGER_MESSAGE = `[SISTEMA] ACTIVAR MODO SIMULACRO ESTRICTO TIPO ICFES. 
Eres un evaluador estricto. Vas a realizar 5 preguntas de selección múltiple (A, B, C, D) sobre temas de 11° grado.
Haz UNA pregunta a la vez. Espera la respuesta del estudiante. 
Si acierta, dile que es correcto y suma 1 punto. Si falla, dile cuál era la correcta y por qué.
Luego, haz la siguiente pregunta.
Inicia AHORA con la Pregunta 1 de 5.`;

// ============================================================================
// 🛠️ getBuilderResources - Recursos Técnicos para Track Constructor
// ============================================================================
/**
 * Recursos técnicos curados para emprendedores del Track Constructor.
 * Incluye plantillas, guías y tutoriales para acelerar el desarrollo.
 */
export const getBuilderResources = () => [
  { id: 'res-1', title: 'Plantilla React + Vite', type: 'CODE', url: 'https://vitejs.dev/guide/' },
  { id: 'res-2', title: 'Guía de Diseño Offline-First', type: 'DOC', url: '#' },
  { id: 'res-3', title: 'Integración con Gemini API', type: 'TUTORIAL', url: 'https://ai.google.dev/docs' },
  { id: 'res-4', title: 'Modelo SAS BIC', type: 'BUSINESS', url: '#' }
];