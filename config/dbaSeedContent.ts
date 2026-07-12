// src/config/dbaSeedContent.ts
import { CourseMaterial } from "./types";

// ============================================================================
// 🎯 INTERACTION_POINTS - Puntos de Interrupción para Modo Ping-Pong Híbrido
// ============================================================================
/**
 * Define momentos específicos dentro del podcast donde el Tutor Edú interviene.
 * El reproductor de audio debe pausar automáticamente al alcanzar estos timestamps
 * e inyectar el prompt en el chat para activar al estudiante.
 * 
 * ⚠️ Los timestamps están en SEGUNDOS desde el inicio del audio.
 */
export interface InteractionPoint {
  timestamp: number; // Segundos desde el inicio del audio
  prompt: string;    // Mensaje que el Tutor Edú inyectará en el chat
  type?: 'quiz' | 'reto' | 'reflexion'; // Tipo de interacción (opcional para UI)
}

export const INTERACTION_POINTS: Record<string, InteractionPoint[]> = {
  'MAT-11-DBA-01': [
    { 
      timestamp: 10, 
      type: 'reto',
      prompt: "📡 ¡Atención estudiante! Tutor Edú te tiene una pregunta interactiva: Si un agricultor de Necoclí tiene un terreno de cultivo inclinado y quiere medir la distancia real en ladera usando razones de un triángulo, ¿qué lado representa la hipotenusa? A) El lado opuesto al ángulo de elevación, B) El lado más largo (inclinación de la colina), C) El cateto adyacente horizontal." 
    },
    { 
      timestamp: 25, 
      type: 'quiz',
      prompt: "[QUIZ_FLASH] ¡Sigamos activos! Al calcular la hipotenusa de un terreno cuyos catetos miden 6 metros y 8 metros, aplicando Pitágoras, ¿cuál es el resultado? A) 10 metros, B) 14 metros, C) 12 metros." 
    }
  ],
  'HUM-11-DBA-01': [
    { 
      timestamp: 12, 
      type: 'quiz',
      prompt: "[QUIZ_FLASH] Pregunta sobre Análisis Crítico: Si un periodista local publica un artículo denunciando el estado de las vías veredales, ¿cuál es su intención comunicativa principal? A) Narrar un cuento fantástico, B) Persuadir e informar con argumentos lógicos, C) Expresar poesía abstracta." 
    }
  ],
  'CNA-11-DBA-01': [
    { 
      timestamp: 15, 
      type: 'reto',
      prompt: "[RETO_VEREDA] ¡Pregunta de Física! Si un campesino empuja una carretilla con 60kg de abono a velocidad constante, ¿qué podemos decir de la fuerza neta total? A) Es cero (fuerzas balanceadas), B) Es muy alta y aumenta de forma continua, C) Es igual a la gravedad." 
    }
  ]
};

// ============================================================================
// 🌱 DBA_SEED_CONTENT - Banco de Semillas Curadas (Contenido Pre-Cargado)
// ============================================================================
/**
 * Contenido educativo pre-curado alineado con los DBA oficiales del MEN.
 * Se inyecta automáticamente cuando no hay materiales subidos por docentes.
 * 
 * ⚠️ CAMBIOS CRÍTICOS vs versión anterior:
 * 1. Timestamps FIJOS (epoch) en lugar de Date.now() dinámico
 * 2. Flag `isSeed: true` para identificar semillas
 * 3. Flag `requiresAudioGeneration: true` para audios placeholder
 * 4. `resourceUrl` vacío hasta que el audio real exista
 * 5. `audioScript` para fallback a TTS del navegador
 */

// Extensión de CourseMaterial para semillas (no rompe la interfaz base)
export interface SeedCourseMaterial extends CourseMaterial {
  isSeed: true;
  requiresAudioGeneration?: boolean;
  audioScript?: string;
  estimatedDuration?: number; // Segundos
  difficulty?: 'basic' | 'intermediate' | 'advanced';
}

export const DBA_SEED_CONTENT: SeedCourseMaterial[] = [
  {
    id: "seed-mat-11-01",
    grade: "11°",
    subject: "Matemáticas",
    topic: "Trigonometría Aplicada a la Altura de Ladera",
    dbaCode: "MAT-11-DBA-01",
    textContent: `La trigonometría no son solo fórmulas en la pizarra; es la ciencia de las distancias en relieve. En la región del Urabá y en laderas de Boyacá, medir la inclinación es vital para evitar deslizamientos de tierra y sembrar en curvas de nivel.

Estudiamos el triángulo rectángulo: un ángulo de 90° con su hipotenusa (inclinación) y los catetos opuesto y adyacente. Con el seno, coseno y tangente podemos deducir distancias imposibles de medir con cinta tradicional.

[RETO_VEREDA]
**El Reto de tu Vereda:** Don José tiene un terreno con una inclinación de 30° respecto al plano horizontal. Si el largo de la loma es de 50 metros, ¿cuántos metros de base plana real tiene su cultivo para calcular la densidad de siembra de aguacate hass? (Recuerda: Coseno(30°) ≈ 0.866).

[QUIZ_FLASH]
Si el cateto opuesto es igual a 5 metros y la hipotenusa es igual a 10 metros, ¿cuál es el seno del ángulo?
A) 0.5 (Ángulo de 30°)
B) 1.0 (Ángulo de 90°)
C) 0.866 (Ángulo de 60°)`,
    hasAudio: true,
    timestamp: 1704067200000, // ✅ FIJO: 1 Enero 2024 00:00 UTC
    moduleId: "m1",
    toolId: "audio",
    resourceUrl: "", // ✅ VACÍO hasta que el audio real exista
    // 🆕 Campos de semilla:
    isSeed: true,
    requiresAudioGeneration: true,
    estimatedDuration: 180, // 3 minutos
    difficulty: 'intermediate',
    audioScript: `La trigonometría no son solo fórmulas en la pizarra. Es la ciencia de las distancias en relieve. En la región del Urabá y en laderas de Boyacá, medir la inclinación es vital para evitar deslizamientos de tierra y sembrar en curvas de nivel. Estudiamos el triángulo rectángulo: un ángulo de 90 grados con su hipotenusa, que es la inclinación, y los catetos opuesto y adyacente. Con el seno, coseno y tangente podemos deducir distancias imposibles de medir con cinta tradicional.`
  },
  {
    id: "seed-hum-11-01",
    grade: "11°",
    subject: "Humanidades y Lengua Castellana",
    topic: "La Crónica Periodística y el Análisis de Tesis",
    dbaCode: "HUM-11-DBA-01",
    textContent: `Analizar críticamente un texto implica identificar qué nos quiere vender el autor (su tesis) y con qué bases lo defiende. En Colombia, la crónica es un puente extraordinario entre la literatura de ficción y la noticia pura, dándole rostro humano a las realidades agrarias.

La comprensión crítica nos permite desmontar falacias lógicas, sesgos de confirmación e intereses de la contraparte en contratos agrarios o debates públicos locales.

[RETO_VEREDA]
**El Reto de tu Vereda:** Lee la cartelera de la cooperativa de tu municipio y detecta si el llamado a asamblea tiene argumentos racionales (datos, fechas, ventajas) o si apela únicamente a la emoción para convencerte. Escribe tu análisis en el chat.

[QUIZ_FLASH]
¿Qué componente es indispensable para sustentar una tesis en un debate veredal?
A) Argumentos basados en datos reales y evidencia verificable.
B) Insistir en voz alta sin dejar hablar al otro.
C) Usar palabras difíciles que nadie entienda.`,
    hasAudio: true,
    timestamp: 1704153600000, // ✅ FIJO: 2 Enero 2024 00:00 UTC
    moduleId: "hl1",
    toolId: "audio",
    resourceUrl: "",
    isSeed: true,
    requiresAudioGeneration: true,
    estimatedDuration: 200,
    difficulty: 'intermediate',
    audioScript: `Analizar críticamente un texto implica identificar qué nos quiere vender el autor, su tesis, y con qué bases lo defiende. En Colombia, la crónica es un puente extraordinario entre la literatura de ficción y la noticia pura, dándole rostro humano a las realidades agrarias. La comprensión crítica nos permite desmontar falacias lógicas, sesgos de confirmación e intereses de la contraparte en contratos agrarios o debates públicos locales.`
  },
  {
    id: "seed-cna-11-01",
    grade: "11°",
    subject: "Ciencias Naturales",
    topic: "Leyes de Newton en el Transporte Agrícola",
    dbaCode: "CNA-11-DBA-01",
    textContent: `La física gobierna cada esfuerzo físico en el campo: levantar un bulto, jalar un arado o frenar un camión cargado en bajada. Las tres Leyes de Newton nos explican la inercia, la fuerza como producto de masa por aceleración, y la famosa ley de Acción y Reacción.

Entender la fricción y los coeficientes de rozamiento evita que los bueyes o caballos sufran lesiones innecesarias y optimiza los fletes de transporte intermunicipal.

[RETO_VEREDA]
**El Reto de tu Vereda:** Si una camioneta cargada de plátano con una masa total de 2,000 kg se apaga en una loma inclinada de 10°, ¿qué fuerza de fricción mínima deben ofrecer las llantas contra la trocha empantanada para evitar que ruede hacia atrás?

[QUIZ_FLASH]
Si empujas un bloque con una fuerza de 20N sobre una superficie de piedra lisa y este no se mueve, ¿cuál es la fuerza de rozamiento estático opuesta?
A) Exactamente 20 Newton, cancelando el movimiento.
B) Cero Newton, porque está quieto.
C) 40 Fricciones.`,
    hasAudio: true,
    timestamp: 1704240000000, // ✅ FIJO: 3 Enero 2024 00:00 UTC
    moduleId: "cn1",
    toolId: "audio",
    resourceUrl: "",
    isSeed: true,
    requiresAudioGeneration: true,
    estimatedDuration: 210,
    difficulty: 'advanced',
    audioScript: `La física gobierna cada esfuerzo físico en el campo: levantar un bulto, jalar un arado o frenar un camión cargado en bajada. Las tres Leyes de Newton nos explican la inercia, la fuerza como producto de masa por aceleración, y la famosa ley de Acción y Reacción. Entender la fricción y los coeficientes de rozamiento evita que los bueyes o caballos sufran lesiones innecesarias y optimiza los fletes de transporte intermunicipal.`
  },
  {
    id: "seed-cs-11-01",
    grade: "11°",
    subject: "Ciencias Sociales",
    topic: "Estructura del Estado Colombiano y Mecanismos de Veeduría",
    dbaCode: "CSO-11-DBA-03",
    textContent: `La Constitución de 1991 no es solo un librito; es la caja de herramientas de tu vereda. Conocer el presupuesto participativo, las juntas de acción comunal (JAC) y las veedurías ciudadanas le da poder al campesinado para exigir agua potable, alumbrado y cubrimiento escolar de calidad.

El poder se ejerce a través de la participación ciudadana legítima y el conocimiento técnico de los concejos municipales y presupuestos de regalías locales.

[RETO_VEREDA]
**El Reto de tu Vereda:** Redacta un borrador sencillo de Derecho de Petición dirigido a la Alcaldía de tu municipio solicitando información sobre el presupuesto destinado a la mejora de la placa huella de tu vereda. ¡Pídele al Tutor Edú que lo revise!

[QUIZ_FLASH]
¿Qué mecanismo constitucional permite a un ciudadano proteger de manera inmediata sus derechos fundamentales vulnerados?
A) El Derecho de Petición
B) La Acción de Tutela
C) Un Cabildo Abierto`,
    hasAudio: true,
    timestamp: 1704326400000, // ✅ FIJO: 4 Enero 2024 00:00 UTC
    moduleId: "cs3",
    toolId: "audio",
    resourceUrl: "",
    isSeed: true,
    requiresAudioGeneration: true,
    estimatedDuration: 190,
    difficulty: 'intermediate',
    audioScript: `La Constitución de 1991 no es solo un librito. Es la caja de herramientas de tu vereda. Conocer el presupuesto participativo, las juntas de acción comunal y las veedurías ciudadanas le da poder al campesinado para exigir agua potable, alumbrado y cubrimiento escolar de calidad. El poder se ejerce a través de la participación ciudadana legítima y el conocimiento técnico de los concejos municipales y presupuestos de regalías locales.`
  },
  {
    id: "seed-ing-11-01",
    grade: "11°",
    subject: "Inglés",
    topic: "Sustainable Farming Vocabulary & Present Perfect",
    dbaCode: "ING-11-DBA-01",
    textContent: `Connecting our rural pride with global markets requires English. Today, organic, shade-grown, and cooperative-produced crops are highly valued in Europe and the United States. Learning terms like "soil conservation", "fair trade", and writing using the "Present Perfect" (e.g., "I have grown coffee for five years") creates business opportunities!

Let's break the barrier and speak about our fields to the world.

[RETO_VEREDA]
**The Vereda Challenge:** Write a 3-sentence description of your favorite local agricultural product in English. Use the Present Perfect at least once (e.g., "Our community has produced bananas since 1980...").

[QUIZ_FLASH]
Which of the following sentences is written correctly in Present Perfect?
A) We have produce organic cacao for three years.
B) We have produced organic cacao for three years.
C) We producing organic cacao now.`,
    hasAudio: true,
    timestamp: 1704412800000, // ✅ FIJO: 5 Enero 2024 00:00 UTC
    moduleId: "ie1",
    toolId: "audio",
    resourceUrl: "",
    isSeed: true,
    requiresAudioGeneration: true,
    estimatedDuration: 170,
    difficulty: 'basic',
    audioScript: `Connecting our rural pride with global markets requires English. Today, organic, shade-grown, and cooperative-produced crops are highly valued in Europe and the United States. Learning terms like soil conservation, fair trade, and writing using the Present Perfect creates business opportunities! Let's break the barrier and speak about our fields to the world.`
  }
];

// ============================================================================
// 🔧 HELPERS UTILITARIOS PARA SEMILLAS
// ============================================================================

/**
 * Obtiene las semillas disponibles para una materia y grado específicos.
 * @param subject - Nombre de la materia
 * @param grade - Grado escolar (ej: "11°")
 * @returns Array de SeedCourseMaterial filtrado
 */
export const getSeedsForSubject = (subject: string, grade: string): SeedCourseMaterial[] => {
  return DBA_SEED_CONTENT.filter(
    seed => seed.subject === subject && seed.grade === grade
  );
};

/**
 * Obtiene los puntos de interacción para un DBA específico.
 * @param dbaCode - Código DBA (ej: "MAT-11-DBA-01")
 * @returns Array de InteractionPoint o array vacío si no hay puntos definidos
 */
export const getInteractionPointsForDBA = (dbaCode: string): InteractionPoint[] => {
  return INTERACTION_POINTS[dbaCode] || [];
};

/**
 * Verifica si un CourseMaterial es una semilla pre-curada.
 * @param material - Material a verificar
 * @returns true si es semilla, false si es contenido de docente
 */
export const isSeedMaterial = (material: any): material is SeedCourseMaterial => {
  return typeof material === 'object' && material !== null && 'isSeed' in material && material.isSeed === true;
};