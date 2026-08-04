// src/config/dbaSeedContent.ts
import { CourseMaterial } from "./types";

// ============================================================================
// ?? INTERACTION_POINTS - Puntos de Interacción en Audio/Podcast
// ============================================================================
/**
 * Define momentos específicos (en segundos) del audio donde el reproductor
 * debe pausarse automáticamente para lanzar una pregunta socrática o reto.
 * 
 * Formato: DBA_CODE -> array de puntos de interacción
 * Cada punto tiene: timestamp (segundos), prompt (pregunta al estudiante)
 */

export interface InteractionPoint {
  timestamp: number;  // Segundo exacto del audio
  prompt: string;     // Pregunta o reto que se muestra al estudiante
  type: 'question' | 'challenge' | 'reflection';
  expectedTimeSeconds?: number; // Tiempo estimado para responder
}

export const INTERACTION_POINTS: Record<string, InteractionPoint[]> = {
  // === MATEMÁTICAS 9° ===
  "MAT-09-DBA-01": [
    { timestamp: 45, prompt: "Si en una finca de Urabá hay 12 filas de plátanos y cada fila tiene 8 plantas, ¿cuántas plantas hay en total? Piensa antes de responder...", type: "question", expectedTimeSeconds: 30 },
    { timestamp: 120, prompt: "[RETO_VEREDA] Un agricultor de Boyacá cosecha 250 kilos de papa. Si empaca en bolsas de 5 kilos, ¿cuántas bolsas necesita? Usa división.", type: "challenge", expectedTimeSeconds: 45 },
    { timestamp: 180, prompt: "¿Por qué crees que el orden de las operaciones es importante cuando calculas gastos de una tienda de barrio?", type: "reflection", expectedTimeSeconds: 20 }
  ],
  "MAT-09-DBA-02": [
    { timestamp: 60, prompt: "Observa tu salón de clases. ¿Cuántas figuras geométricas puedes identificar en 10 segundos? Nómbralas.", type: "challenge", expectedTimeSeconds: 15 },
    { timestamp: 135, prompt: "Si un terreno cuadrado en el Eje Cafetero mide 15 metros de lado, ¿cuántos metros de cerca necesitas para rodearlo?", type: "question", expectedTimeSeconds: 35 }
  ],
  "MAT-09-DBA-03": [
    { timestamp: 50, prompt: "En tu familia, ¿cuántas personas prefieren arepa de maíz vs arepa de arroz? Haz una encuesta mental y calcula porcentajes.", type: "challenge", expectedTimeSeconds: 40 },
    { timestamp: 140, prompt: "¿Por qué crees que en el Caribe se usan más gráficos de barras para mostrar turistas por mes?", type: "reflection", expectedTimeSeconds: 25 }
  ],

  // === MATEMÁTICAS 10° ===
  "MAT-10-DBA-01": [
    { timestamp: 55, prompt: "Si un bus de Bogotá carga 80 pasajeros y en cada parada suben 12 y bajan 5, ¿cuál es la expresión algebraica del cambio?", type: "question", expectedTimeSeconds: 45 },
    { timestamp: 130, prompt: "[RETO_VEREDA] Un pescador de Cartagena vende 3 libras de pescado a $x cada una. Si gana el doble de lo que le costó, ¿cuál es su ecuación de ganancia?", type: "challenge", expectedTimeSeconds: 50 }
  ],
  "MAT-10-DBA-02": [
    { timestamp: 70, prompt: "Piensa en una rampa de skatepark. ¿Qué ángulo crees que tiene con el suelo? ¿Agudo, recto u obtuso?", type: "question", expectedTimeSeconds: 20 },
    { timestamp: 160, prompt: "En la Amazonía, los ríos forman triángulos con sus afluentes. Si conoces dos ángulos, ¿cómo hallas el tercero?", type: "challenge", expectedTimeSeconds: 35 }
  ],
  "MAT-10-DBA-03": [
    { timestamp: 80, prompt: "Si en una finca de palma el rendimiento es proporcional al abono, ¿qué pasa con la cosecha si reduces el abono a la mitad?", type: "question", expectedTimeSeconds: 30 },
    { timestamp: 150, prompt: "[QUIZ_FLASH] ¿Cuál es la fórmula de proporción directa? A) y = k/x  B) y = k·x  C) y = x-k", type: "question", expectedTimeSeconds: 20 }
  ],

  // === MATEMÁTICAS 11° ===
  "MAT-11-DBA-01": [
    { timestamp: 90, prompt: "Una noria en un parque de diversiones gira. Si el radio es 5 metros, ¿cuánto mide una vuelta completa? Usa π ≈ 3.14", type: "question", expectedTimeSeconds: 40 },
    { timestamp: 175, prompt: "Desde un mirador en Medellín, ves un edificio con un ángulo de elevación de 30°. Si estás a 100 metros, ¿qué trigonométrica usarías para hallar la altura?", type: "challenge", expectedTimeSeconds: 50 }
  ],
  "MAT-11-DBA-02": [
    { timestamp: 85, prompt: "Si la velocidad de un carro en la Autopista Norte es de 60 km/h, ¿cómo representas su posición respecto al tiempo usando una función?", type: "question", expectedTimeSeconds: 35 },
    { timestamp: 165, prompt: "[RETO_VEREDA] Un comerciante de Ráquira vende ollas. Su ganancia es la derivada de sus ingresos. ¿Qué significa que la derivada sea cero?", type: "challenge", expectedTimeSeconds: 60 }
  ],
  "MAT-11-DBA-03": [
    { timestamp: 70, prompt: "En un censo de una vereda del Chocó, 3 de cada 10 personas hablan wounaan. Si tomas una muestra de 100, ¿cuántos esperarías?", type: "question", expectedTimeSeconds: 25 },
    { timestamp: 145, prompt: "¿Por qué crees que las encuestas políticas en Colombia usan intervalos de confianza? ¿Qué pasa si no las usan?", type: "reflection", expectedTimeSeconds: 30 }
  ],

  // === HUMANIDADES 9° ===
  "HUM-09-DBA-01": [
    { timestamp: 60, prompt: "Lee este fragmento en voz alta (mentalmente): 'El río Magdalena lleva consigo la historia de Colombia'. ¿Qué crees que quiere decir el autor?", type: "reflection", expectedTimeSeconds: 30 },
    { timestamp: 140, prompt: "[RETO_VEREDA] Un abuelo de la Costa cuenta historias de cumbia. ¿Es una narración literaria o oral? ¿Por qué?", type: "question", expectedTimeSeconds: 25 }
  ],
  "HUM-09-DBA-02": [
    { timestamp: 75, prompt: "Gabriel García Márquez escribió sobre Macondo. ¿Qué elementos de tu pueblo o barrio podrían ser mágicos para un extranjero?", type: "reflection", expectedTimeSeconds: 35 },
    { timestamp: 155, prompt: "Compara: ¿en qué se parece una vallenata a un poema de José Asunción Silva?", type: "challenge", expectedTimeSeconds: 40 }
  ],

  // === HUMANIDADES 10° ===
  "HUM-10-DBA-01": [
    { timestamp: 80, prompt: "En 'La Casa de los Espíritus', hay violencia política. ¿Qué conflictos sociales ves hoy en tu región que podrían inspirar una novela?", type: "reflection", expectedTimeSeconds: 35 },
    { timestamp: 160, prompt: "[QUIZ_FLASH] ¿Cuál obra es de Gabriel García Márquez? A) La vorágine  B) Cien años de soledad  C) María", type: "question", expectedTimeSeconds: 15 }
  ],
  "HUM-10-DBA-02": [
    { timestamp: 65, prompt: "Escribe (mentalmente) un argumento a favor de la educación rural en 3 oraciones. Usa conectores lógicos.", type: "challenge", expectedTimeSeconds: 45 },
    { timestamp: 145, prompt: "¿Por qué crees que en debates políticos se usan falacias? Nombra una que hayas escuchado recientemente.", type: "reflection", expectedTimeSeconds: 30 }
  ],

  // === HUMANIDADES 11° ===
  "HUM-11-DBA-01": [
    { timestamp: 90, prompt: "Compara el Quijote con un personaje colombiano: ¿quién en tu comunidad 'lucha contra molinos de viento'?", type: "challenge", expectedTimeSeconds: 40 },
    { timestamp: 170, prompt: "¿Por qué la literatura universal sigue siendo relevante para un joven de Necoclí en 2026?", type: "reflection", expectedTimeSeconds: 30 }
  ],
  "HUM-11-DBA-02": [
    { timestamp: 70, prompt: "Redacta mentalmente una tesis: 'La violencia en Colombia se reduce con educación'. ¿Qué argumentos usarías?", type: "challenge", expectedTimeSeconds: 50 },
    { timestamp: 150, prompt: "[RETO_VEREDA] Un concejal propone cerrar una escuela rural para ahorrar. Escribe 2 contra-argumentos sólidos.", type: "challenge", expectedTimeSeconds: 45 }
  ],

  // === CIENCIAS NATURALES 9° ===
  "CNA-09-DBA-01": [
    { timestamp: 55, prompt: "Mira tus manos. ¿Cuántos tipos de células crees que hay ahí? ¿Piel, hueso, sangre...?", type: "question", expectedTimeSeconds: 20 },
    { timestamp: 130, prompt: "En la Amazonía, la clorofila es verde. ¿Por qué crees que las plantas no usan el color negro para captar más luz?", type: "reflection", expectedTimeSeconds: 35 }
  ],
  "CNA-09-DBA-02": [
    { timestamp: 70, prompt: "Si calientas agua en una olla de barro de Ráquira, ¿en qué estado pasa el agua? ¿Qué le pasa a las moléculas?", type: "question", expectedTimeSeconds: 30 },
    { timestamp: 150, prompt: "[RETO_VEREDA] Un río de Boyacá tiene pH 4.5. ¿Es ácido, neutro o básico? ¿Qué consecuencias tiene para la pesca?", type: "challenge", expectedTimeSeconds: 40 }
  ],

  // === CIENCIAS NATURALES 10° ===
  "CNA-10-DBA-01": [
    { timestamp: 85, prompt: "Un bus de TransMilenio frena bruscamente. ¿Qué ley de Newton explica por qué te empujas hacia adelante?", type: "question", expectedTimeSeconds: 30 },
    { timestamp: 165, prompt: "¿Por qué en la costa Caribe se siente más calor que en Bogotá, si ambos reciben luz solar?", type: "challenge", expectedTimeSeconds: 35 }
  ],
  "CNA-10-DBA-02": [
    { timestamp: 75, prompt: "El café del Eje Cafetero tiene cafeína (C8H10N4O2). ¿Cuántos átomos de carbono tiene una molécula?", type: "question", expectedTimeSeconds: 25 },
    { timestamp: 155, prompt: "[QUIZ_FLASH] ¿Qué tipo de reacción es la combustión? A) Endotérmica  B) Exotérmica  C) De síntesis", type: "question", expectedTimeSeconds: 15 }
  ],

  // === CIENCIAS NATURALES 11° ===
  "CNA-11-DBA-01": [
    { timestamp: 95, prompt: "Una pelota de fútbol se patea en el Estadio Metropolitano. Describe su trayectoria usando vectores (mentalmente).", type: "challenge", expectedTimeSeconds: 40 },
    { timestamp: 180, prompt: "¿Por qué las olas del Caribe rompen diferente que las del Pacífico colombiano? Piensa en energía y profundidad.", type: "reflection", expectedTimeSeconds: 35 }
  ],
  "CNA-11-DBA-02": [
    { timestamp: 80, prompt: "En la minería de carbón de Zipaquirá, ¿qué tipo de reacciones químicas liberan gases tóxicos?", type: "question", expectedTimeSeconds: 35 },
    { timestamp: 160, prompt: "[RETO_VEREDA] Diseña (mentalmente) un experimento para medir la calidad del agua en un río de tu región.", type: "challenge", expectedTimeSeconds: 50 }
  ],

  // === CIENCIAS SOCIALES 9° ===
  "CSO-09-DBA-01": [
    { timestamp: 60, prompt: "Mira por la ventana. ¿Qué elementos del paisaje son naturales y cuáles son culturales? Clasifícalos.", type: "challenge", expectedTimeSeconds: 30 },
    { timestamp: 140, prompt: "¿Por qué crees que en el Urabá hay más lluvia que en La Guajira? Piensa en geografía física.", type: "reflection", expectedTimeSeconds: 30 }
  ],
  "CSO-09-DBA-02": [
    { timestamp: 70, prompt: "¿Qué evento histórico crees que más marcó a tu departamento? Pregunta en casa si no sabes.", type: "reflection", expectedTimeSeconds: 25 },
    { timestamp: 150, prompt: "[RETO_VEREDA] Compara: ¿en qué se parece la independencia de Colombia a un proceso actual de tu región?", type: "challenge", expectedTimeSeconds: 40 }
  ],
  "CSO-09-DBA-03": [
    { timestamp: 65, prompt: "¿Cuáles son tus derechos como estudiante según la Constitución? Nombra 3.", type: "question", expectedTimeSeconds: 30 },
    { timestamp: 145, prompt: "Si un alcalde no recoge la basura en tu vereda, ¿qué mecanismo constitucional puedes usar?", type: "challenge", expectedTimeSeconds: 35 }
  ],

  // === CIENCIAS SOCIALES 10° ===
  "CSO-10-DBA-01": [
    { timestamp: 85, prompt: "¿Por qué crees que Colombia tiene conflictos fronterizos con Venezuela? Piensa en recursos naturales.", type: "reflection", expectedTimeSeconds: 35 },
    { timestamp: 165, prompt: "[QUIZ_FLASH] ¿Colombia pertenece a qué bloque geopolítico principal? A) OTAN  B) OEA  C) Unión Europea", type: "question", expectedTimeSeconds: 15 }
  ],
  "CSO-10-DBA-02": [
    { timestamp: 75, prompt: "Si el salario mínimo en Colombia sube un 10%, ¿cómo afecta eso a una tienda de barrio en Necoclí?", type: "challenge", expectedTimeSeconds: 40 },
    { timestamp: 155, prompt: "¿Por qué crees que la inflación afecta más a los campesinos que a los urbanos ricos?", type: "reflection", expectedTimeSeconds: 30 }
  ],
  "CSO-10-DBA-03": [
    { timestamp: 90, prompt: "¿Qué filósofo crees que más necesitaría Colombia hoy y por qué? Platón, Marx, Simone de Beauvoir...", type: "reflection", expectedTimeSeconds: 35 },
    { timestamp: 170, prompt: "[RETO_VEREDA] Un líder social es asesinado. Usa el pensamiento crítico: ¿qué preguntas deben hacerse los medios?", type: "challenge", expectedTimeSeconds: 45 }
  ],

  // === CIENCIAS SOCIALES 11° ===
  "CSO-11-DBA-01": [
    { timestamp: 95, prompt: "¿Cómo afecta el precio del dólar a una familia que vive del turismo en Santa Marta?", type: "challenge", expectedTimeSeconds: 40 },
    { timestamp: 180, prompt: "¿Por qué crees que Colombia aún no es miembro de la OTAN? Argumenta a favor y en contra.", type: "reflection", expectedTimeSeconds: 40 }
  ],
  "CSO-11-DBA-02": [
    { timestamp: 80, prompt: "Compara el modelo económico de Chile con el de Colombia. ¿Cuál crees que beneficia más al campesino?", type: "challenge", expectedTimeSeconds: 45 },
    { timestamp: 165, prompt: "[RETO_VEREDA] Diseña una política pública para reducir el desempleo juvenil en tu municipio.", type: "challenge", expectedTimeSeconds: 50 }
  ],
  "CSO-11-DBA-03": [
    { timestamp: 85, prompt: "¿Qué es la ética para ti? Da un ejemplo de un dilema moral que hayas vivido recientemente.", type: "reflection", expectedTimeSeconds: 35 },
    { timestamp: 160, prompt: "[QUIZ_FLASH] ¿Quién escribió 'Crítica de la razón pura'? A) Descartes  B) Kant  C) Nietzsche", type: "question", expectedTimeSeconds: 15 }
  ],

  // === INGLÉS 9° ===
  "ING-09-DBA-01": [
    { timestamp: 50, prompt: "Listen mentally: 'The farmer wakes up at 5 AM'. What time do YOU wake up? Answer in English.", type: "question", expectedTimeSeconds: 20 },
    { timestamp: 120, prompt: "[RETO_VEREDA] Describe your daily routine in 3 English sentences. Use 'usually', 'sometimes', 'never'.", type: "challenge", expectedTimeSeconds: 40 },
    { timestamp: 180, prompt: "¿Por qué crees que el inglés es importante para un guía turístico en Cartagena?", type: "reflection", expectedTimeSeconds: 25 }
  ],

  // === INGLÉS 10° ===
  "ING-10-DBA-01": [
    { timestamp: 65, prompt: "If you could travel to any English-speaking country, where would you go and why? Answer in English.", type: "challenge", expectedTimeSeconds: 35 },
    { timestamp: 140, prompt: "[QUIZ_FLASH] Choose the correct form: 'If I ___ rich, I would help my community.' A) am  B) was  C) were", type: "question", expectedTimeSeconds: 20 }
  ],

  // === INGLÉS 11° ===
  "ING-11-DBA-01": [
    { timestamp: 80, prompt: "Write (mentally) a short email in English to a foreign university asking for scholarship information.", type: "challenge", expectedTimeSeconds: 50 },
    { timestamp: 165, prompt: "[RETO_VEREDA] You are presenting Colombia to a foreign investor. Mention 3 business opportunities in English.", type: "challenge", expectedTimeSeconds: 45 }
  ]
};

// ============================================================================
// ?? DBA_SEED_CONTENT - Materiales Curriculares por Defecto (Offline-First)
// ============================================================================
/**
 * Cuando NO hay internet y NO hay materiales del docente cargados,
 * estos contenidos semilla garantizan que el estudiante SIEMPRE
 * tenga algo que estudiar. Son "mínimos vitales" curriculares.
 * 
 * Marcados con isSeed=true para distinguirlos de contenido docente.
 */

export const DBA_SEED_CONTENT: CourseMaterial[] = [
  // === MATEMÁTICAS SEMILLA ===
  {
    id: "seed-mat-11-01",
    grade: "11°",
    subject: "Matemáticas",
    topic: "Trigonometría Aplicada al Territorio",
    textContent: `La trigonometría no son solo fórmulas. Es la herramienta que usan los agrimensores para medir tierras en Colombia.

[RETO_VEREDA]
Un topógrafo debe medir un terreno en el Eje Cafetero. Sabe que un lado mide 100m y el ángulo con el siguiente es 60°. ¿Cómo calcula la altura usando seno?

Pista: seno(60°) = √3/2 ≈ 0.866

[QUIZ_FLASH]
¿Qué función trigonométrica relaciona cateto opuesto e hipotenusa?
A) Coseno
B) Seno
C) Tangente

[?? MODO OFFLINE]
 Seno = opuesto/hipotenusa
 Coseno = adyacente/hipotenusa
 Reflexión: ¿Dónde más ves triángulos en tu pueblo?`,
    hasAudio: true,
    timestamp: Date.now(),
    moduleId: "m1",
    toolId: "audio",
    resourceUrl: "https://storage.googleapis.com/eduglobal365/podcasts/11_mat_trigonometria.mp3",
    dbaCode: "MAT-11-DBA-01"
  },
  {
    id: "seed-mat-11-02",
    grade: "11°",
    subject: "Matemáticas",
    topic: "Cálculo: El Cambio en lo Cotidiano",
    textContent: `El cálculo estudia el cambio. Cuando un comerciante de Ráquira ve cómo varían sus ventas en diciembre, está pensando como un matemático.

[RETO_VEREDA]
Un vendedor de arepas en Barranquilla vende 50 arepas a las 6 AM y 200 a las 10 AM. ¿Cuál es la tasa de cambio promedio por hora?

[QUIZ_FLASH]
La derivada de una función en un punto representa:
A) El área bajo la curva
B) La pendiente de la recta tangente
C) El volumen de un sólido

[?? MODO OFFLINE]
 Derivada = tasa de cambio instantánea
 Integral = acumulación o área
 Reflexión: ¿Qué cosas cambian rápido en tu vida diaria?`,
    hasAudio: true,
    timestamp: Date.now(),
    moduleId: "m2",
    toolId: "audio",
    resourceUrl: "https://storage.googleapis.com/eduglobal365/podcasts/11_mat_calculo.mp3",
    dbaCode: "MAT-11-DBA-02"
  },
  {
    id: "seed-mat-10-01",
    grade: "10°",
    subject: "Matemáticas",
    topic: "Ecuaciones que Resuelven Problemas Reales",
    textContent: `Una ecuación es un balance. Como cuando repartes el café de la cosecha entre los trabajadores del campo: debe ser justo.

[RETO_VEREDA]
En una finca de plátano en Urabá, el dueño reparte la cosecha: 1/3 para él, 1/4 para los trabajadores, y el resto para reinversión. ¿Qué fracción queda para reinversión?

[QUIZ_FLASH]
¿Cuál es el primer paso para resolver 2x + 5 = 15?
A) Dividir entre 2
B) Restar 5 a ambos lados
C) Multiplicar por x

[?? MODO OFFLINE]
 Despejar: operación inversa
 Lo que haces a un lado, hazlo al otro
 Reflexión: ¿Cuándo en tu casa usan ecuaciones sin saberlo?`,
    hasAudio: true,
    timestamp: Date.now(),
    moduleId: "m1",
    toolId: "audio",
    resourceUrl: "https://storage.googleapis.com/eduglobal365/podcasts/10_mat_algebra.mp3",
    dbaCode: "MAT-10-DBA-01"
  },

  // === CIENCIAS NATURALES SEMILLA ===
  {
    id: "seed-cna-11-01",
    grade: "11°",
    subject: "Ciencias Naturales",
    topic: "Física del Movimiento en Colombia",
    textContent: `Cada vez que un bus de escalera sube una cuesta andina, la física está en acción: fuerza, fricción, gravedad.

[RETO_VEREDA]
Un jeep Willys sube una cuesta de 30° en Quindío. Si pesa 1500 kg, ¿qué fuerza mínima necesita su motor para vencer la gravedad? (g = 9.8 m/s², seno 30° = 0.5)

[QUIZ_FLASH]
Segunda Ley de Newton: Fuerza = ?
A) masa × velocidad
B) masa × aceleración
C) peso × tiempo

[?? MODO OFFLINE]
 F = m·a
 Toda acción tiene reacción
 Reflexión: ¿Por qué te empujas hacia atrás cuando un bus arranca?`,
    hasAudio: true,
    timestamp: Date.now(),
    moduleId: "cn1",
    toolId: "audio",
    resourceUrl: "https://storage.googleapis.com/eduglobal365/podcasts/11_cna_fisica.mp3",
    dbaCode: "CNA-11-DBA-01"
  },
  {
    id: "seed-cna-10-02",
    grade: "10°",
    subject: "Ciencias Naturales",
    topic: "Química en la Cocina Colombiana",
    textContent: `Cuando preparas arepa, pan o chocolate, estás haciendo química: reacciones, cambios de estado, mezclas.

[RETO_VEREDA]
El chocolate de Santander se calienta hasta 50°C. Si empieza a 20°C y el fuego aporta 1000 julios, ¿cuánta masa de chocolate hay? (Ce = 2.1 J/g°C)

[QUIZ_FLASH]
¿Cuál es un ejemplo de cambio químico?
A) Derretir mantequilla
B) Quemar leña
C) Disolver azúcar

[?? MODO OFFLINE]
 Físico = cambia forma, no sustancia
 Químico = nueva sustancia
 Reflexión: ¿Qué reacciones químicas hay en tu cocina ahora?`,
    hasAudio: true,
    timestamp: Date.now(),
    moduleId: "cn2",
    toolId: "audio",
    resourceUrl: "https://storage.googleapis.com/eduglobal365/podcasts/10_cna_quimica.mp3",
    dbaCode: "CNA-10-DBA-02"
  },

  // === CIENCIAS SOCIALES SEMILLA ===
  {
    id: "seed-cso-11-01",
    grade: "11°",
    subject: "Ciencias Sociales",
    topic: "Geopolítica y Recursos en Colombia",
    textContent: `Colombia está en una posición geográfica única: puente entre dos océanos, con recursos que el mundo necesita.

[RETO_VEREDA]
¿Por qué crees que potencias extranjeras muestran interés en la Amazonía colombiana? Argumenta con 3 razones geoeconómicas.

[QUIZ_FLASH]
Colombia tiene costas en:
A) Pacífico y Atlántico
B) Pacífico y Caribe
C) Atlántico y Índico

[?? MODO OFFLINE]
 Posición estratégica = poder
 Recursos naturales = conflicto potencial
 Reflexión: ¿Cómo protegerías la Amazonía si fueras presidente?`,
    hasAudio: true,
    timestamp: Date.now(),
    moduleId: "cs1",
    toolId: "audio",
    resourceUrl: "https://storage.googleapis.com/eduglobal365/podcasts/11_cso_geopolitica.mp3",
    dbaCode: "CSO-11-DBA-01"
  },
  {
    id: "seed-cso-10-03",
    grade: "10°",
    subject: "Ciencias Sociales",
    topic: "Filosofía para la Vida Diaria",
    textContent: `La filosofía no es solo para universidades. Es preguntarse por qué hacemos lo que hacemos, como cuando elegimos entre estudiar o trabajar.

[RETO_VEREDA]
Un joven de 16 años en Boyacá debe elegir: quedarse a ayudar en la finca o irse a estudiar a Tunja. Usa la ética utilitaria: ¿qué maximiza el bienestar familiar?

[QUIZ_FLASH]
¿Quién dijo "Pienso, luego existo"?
A) Kant
B) Descartes
C) Aristóteles

[?? MODO OFFLINE]
 Pensamiento crítico = cuestionar
 Ética = cómo deberíamos actuar
 Reflexión: ¿Qué decisión difícil te hace pensar como filósofo?`,
    hasAudio: true,
    timestamp: Date.now(),
    moduleId: "cs3",
    toolId: "audio",
    resourceUrl: "https://storage.googleapis.com/eduglobal365/podcasts/10_cso_filosofia.mp3",
    dbaCode: "CSO-10-DBA-03"
  },

  // === HUMANIDADES SEMILLA ===
  {
    id: "seed-hum-11-01",
    grade: "11°",
    subject: "Humanidades y Lengua Castellana",
    topic: "Literatura y Territorio",
    textContent: `Cada región de Colombia tiene su voz literaria: el costeño García Márquez, el antioqueño Mejía Vallejo, la bogotana Piedad Bonnett.

[RETO_VEREDA]
Escribe (mentalmente) un párrafo mágico-realista sobre tu pueblo. Incluye un elemento cotidiano que sea extraordinario para un extranjero.

[QUIZ_FLASH]
Macondo es un pueblo ficticio creado por:
A) Álvaro Mutis
B) Gabriel García Márquez
C) Fernando Botero

[?? MODO OFFLINE]
 Realismo mágico = lo cotidiano + lo asombroso
 Literatura = espejo de una cultura
 Reflexión: ¿Qué historia de tu familia merece ser contada?`,
    hasAudio: true,
    timestamp: Date.now(),
    moduleId: "hl1",
    toolId: "audio",
    resourceUrl: "https://storage.googleapis.com/eduglobal365/podcasts/11_hum_literatura.mp3",
    dbaCode: "HUM-11-DBA-01"
  },

  // === INGLÉS SEMILLA ===
  {
    id: "seed-ing-11-01",
    grade: "11°",
    subject: "Inglés",
    topic: "English for Future Opportunities",
    textContent: `English opens doors. For a student in Necoclí, it could mean working in tourism, tech, or studying abroad.

[RETO_VEREDA]
You are at a job interview in English. The interviewer asks: "Why should we hire you?" Prepare a 3-sentence answer mentally.

[QUIZ_FLASH]
Choose the correct sentence:
A) I have lived here since three years.
B) I have lived here for three years.
C) I live here since three years.

[?? MODO OFFLINE]
 "Since" + specific point in time
 "For" + duration
 Reflexión: ¿How would English change YOUR future?`,
    hasAudio: true,
    timestamp: Date.now(),
    moduleId: "ie1",
    toolId: "audio",
    resourceUrl: "https://storage.googleapis.com/eduglobal365/podcasts/11_ing_opportunities.mp3",
    dbaCode: "ING-11-DBA-01"
  }
];

// ============================================================================
// ?? HELPERS
// ============================================================================

/**
 * Verifica si un material es contenido semilla (por defecto) o creado por docente.
 * Útil para distinguir contenido curado de contenido generado.
 */
export const isSeedMaterial = (material: CourseMaterial): boolean => {
  return material.id?.startsWith("seed-") ?? false;
};

/**
 * Obtiene los puntos de interacción para un DBA específico.
 * Si no existe, retorna array vacío (no pausa el audio).
 */
export const getInteractionPoints = (dbaCode: string): InteractionPoint[] => {
  return INTERACTION_POINTS[dbaCode] || [];
};

/**
 * Obtiene materiales semilla para una asignatura y grado específicos.
 * Útil para poblar el dashboard cuando no hay internet ni materiales docente.
 */
export const getSeedMaterialsBySubject = (subject: string, grade?: string): CourseMaterial[] => {
  return DBA_SEED_CONTENT.filter(m => {
    const matchSubject = m.subject.toLowerCase().trim() === subject.toLowerCase().trim();
    if (grade) {
      return matchSubject && m.grade === grade;
    }
    return matchSubject;
  });
};

/**
 * Obtiene TODOS los códigos DBA que tienen contenido semilla disponible.
 * Útil para reportes de cobertura curricular offline.
 */
export const getAvailableDBACodes = (): string[] => {
  const fromInteractions = Object.keys(INTERACTION_POINTS);
  const fromContent = DBA_SEED_CONTENT.map(m => m.dbaCode);
  return [...new Set([...fromInteractions, ...fromContent])];
};
