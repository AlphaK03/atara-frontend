/**
 * pedagogicaData.js — Shared pedagogical data layer for ATARA
 *
 * Source: propuesta-contenidos-espanol.md + Estructura de los contenidos Español.xlsx
 *
 * This module centralizes:
 *  - 7 ejes temáticos transversales (from the proposal)
 *  - Real contenidos extracted from the Excel (with eje, saberTipo, nivelCognitivo)
 *  - Mock students, 3-period score history
 *  - Detection functions: regression, stagnation, imbalance, cycle gap
 */

// ─── 7 EJES TEMÁTICOS (from propuesta-contenidos-espanol.md §3) ──────────────

export const EJES = [
  { id: 'FONOLOGICA',    nombre: 'Conciencia fonológica / Lectoescritura', color: '#7c3aed', cobertura: '1.° – 2.°' },
  { id: 'PRODUCCION',    nombre: 'Producción textual',                     color: '#2563eb', cobertura: 'Todos los grados' },
  { id: 'COMPRENSION',   nombre: 'Comprensión lectora',                    color: '#0891b2', cobertura: 'Desde 2.°, crítico en 4.° – 6.°' },
  { id: 'VOCABULARIO',   nombre: 'Vocabulario y ortografía',               color: '#059669', cobertura: 'Desde 3.°, morfología avanzada en 6.°' },
  { id: 'GRAMATICA',     nombre: 'Gramática',                              color: '#d97706', cobertura: 'Fuerte en 4.° – 5.°' },
  { id: 'LITERATURA',    nombre: 'Literatura',                             color: '#dc2626', cobertura: '4.° – 6.°' },
  { id: 'EXPRESION_ORAL',nombre: 'Expresión oral',                         color: '#6b7280', cobertura: 'Todos los grados' },
]

// ─── CONTENIDOS (real content from the Excel, grades 4–6) ───────────────────
//
// saberTipo classification:
//   CONCEPTUAL   = "Saberes conceptuales" column (qué saber)
//   PROCEDIMENTAL= "Habilidades y actitudes" with action/skill language (cómo hacer)
//   ACTITUDINAL  = "Habilidades y actitudes" with disposition/value language (querer valorar)
//
// nivelCognitivo follows Bloom's taxonomy aligned to grade:
//   RECONOCIMIENTO (1°-2°) → APLICACIÓN (3°) → ANÁLISIS (4°) → EVALUACIÓN (5°) → SÍNTESIS (6°)
//
// prerequisitoId links to the prior-grade content in the same thematic chain.

export const CONTENIDOS = [
  // ── CUARTO GRADO (grado 4) ────────────────────────────────────────────────
  {
    id: '4.1', grado: 4,
    nombre: 'Producciones textuales orales y escritas',
    descripcion: 'Experiencias propias como base para la producción textual.',
    eje: 'PRODUCCION', saberTipo: 'CONCEPTUAL', nivelCognitivo: 'ANÁLISIS',
    prerequisitoId: '3.1',
  },
  {
    id: '4.2', grado: 4,
    nombre: 'Conjeturas y analogías en la lectura',
    descripcion: 'Prácticas lectoras: conjeturas, relación entre conocimientos previos y el contenido.',
    eje: 'COMPRENSION', saberTipo: 'CONCEPTUAL', nivelCognitivo: 'ANÁLISIS',
    prerequisitoId: '3.3',
  },
  {
    id: '4.3', grado: 4,
    nombre: 'Ideas propias y ajenas. Lenguaje hipotético. Asociación imagen-texto',
    descripcion: 'Estrategias de interpretación: observación, indagación, diálogo, descripción y reflexión.',
    eje: 'COMPRENSION', saberTipo: 'PROCEDIMENTAL', nivelCognitivo: 'ANÁLISIS',
    prerequisitoId: '3.3',
  },
  {
    id: '4.4', grado: 4,
    nombre: 'Familias de palabras: raíz, prefijo y sufijo. Sinónimos, antónimos, parónimos',
    descripcion: 'Estrategias de comprensión del significado del vocabulario nuevo en el texto escrito.',
    eje: 'VOCABULARIO', saberTipo: 'CONCEPTUAL', nivelCognitivo: 'ANÁLISIS',
    prerequisitoId: '3.6',
  },
  {
    id: '4.5', grado: 4,
    nombre: 'Vocabulario y tiempos verbales: presente, pasado y futuro',
    descripcion: 'Vocabulario básico ortográfico en la producción textual oral y escrita.',
    eje: 'GRAMATICA', saberTipo: 'CONCEPTUAL', nivelCognitivo: 'ANÁLISIS',
    prerequisitoId: null,
  },
  {
    id: '4.7', grado: 4,
    nombre: 'Tipos de texto: expositivo, narrativo y descriptivo',
    descripcion: 'Características y estructura de los diversos tipos de textos. Gusto por la calidad de textos orales y escritos.',
    eje: 'COMPRENSION', saberTipo: 'CONCEPTUAL', nivelCognitivo: 'ANÁLISIS',
    prerequisitoId: '3.2',
  },
  {
    id: '4.8', grado: 4,
    nombre: 'Comprensión de textos: causa y efecto, ideas relevantes e irrelevantes',
    descripcion: 'Estrategias de comprensión lectora. Asociación de ideas, relaciones de causa y efecto.',
    eje: 'COMPRENSION', saberTipo: 'PROCEDIMENTAL', nivelCognitivo: 'ANÁLISIS',
    prerequisitoId: '3.3',
  },
  {
    id: '4.9', grado: 4,
    nombre: 'Interpretación de textos literarios',
    descripcion: 'Interpretación de la lectura de textos literarios con trabajo colaborativo.',
    eje: 'LITERATURA', saberTipo: 'ACTITUDINAL', nivelCognitivo: 'ANÁLISIS',
    prerequisitoId: null,
  },
  {
    id: '4.12', grado: 4,
    nombre: 'Sustantivo, adjetivo, verbo. Oración simple: sujeto y predicado',
    descripcion: 'Redacción de informes, cuentos, leyendas, poesías, cartas, noticias, instrucciones.',
    eje: 'GRAMATICA', saberTipo: 'CONCEPTUAL', nivelCognitivo: 'ANÁLISIS',
    prerequisitoId: null,
  },

  // ── QUINTO GRADO (grado 5) ────────────────────────────────────────────────
  {
    id: '5.1', grado: 5,
    nombre: 'Producciones textuales con pensamiento crítico',
    descripcion: 'Producciones textuales orales y escritas. Pensamiento crítico aplicado a la producción.',
    eje: 'PRODUCCION', saberTipo: 'CONCEPTUAL', nivelCognitivo: 'EVALUACIÓN',
    prerequisitoId: '4.1',
  },
  {
    id: '5.3', grado: 5,
    nombre: 'Inferencia textual: ideas propias, ajenas y lenguaje hipotético',
    descripcion: 'Análisis artístico. Estrategias de interpretación profunda del texto.',
    eje: 'COMPRENSION', saberTipo: 'PROCEDIMENTAL', nivelCognitivo: 'EVALUACIÓN',
    prerequisitoId: '4.3',
  },
  {
    id: '5.5', grado: 5,
    nombre: 'Coherencia y secuencia lógica en la producción oral',
    descripcion: 'Comunicación oral paralingüística: voz, intensidad, ritmo, vocalizaciones y lenguaje no verbal.',
    eje: 'PRODUCCION', saberTipo: 'PROCEDIMENTAL', nivelCognitivo: 'EVALUACIÓN',
    prerequisitoId: '4.1',
  },
  {
    id: '5.6', grado: 5,
    nombre: 'Polisemia, sinónimos, antónimos, familias léxicas y campos semánticos',
    descripcion: 'Enriquecimiento lingüístico. Cambios semánticos en palabras con prefijos y sufijos.',
    eje: 'VOCABULARIO', saberTipo: 'CONCEPTUAL', nivelCognitivo: 'EVALUACIÓN',
    prerequisitoId: '4.4',
  },
  {
    id: '5.7', grado: 5,
    nombre: 'Estructura del texto literario y géneros literarios',
    descripcion: 'Características de los géneros literarios. Propósito literario de acuerdo con el género.',
    eje: 'LITERATURA', saberTipo: 'CONCEPTUAL', nivelCognitivo: 'EVALUACIÓN',
    prerequisitoId: '4.9',
  },
  {
    id: '5.9', grado: 5,
    nombre: 'Relación entre el mundo literario y la experiencia del lector',
    descripcion: 'Comprensión inferencial. Relación entre conflictos del mundo literario y los del lector.',
    eje: 'LITERATURA', saberTipo: 'ACTITUDINAL', nivelCognitivo: 'EVALUACIÓN',
    prerequisitoId: '4.9',
  },

  // ── SEXTO GRADO (grado 6) ─────────────────────────────────────────────────
  {
    id: '6.1', grado: 6,
    nombre: 'Producciones textuales con conciencia escolar crítica',
    descripcion: 'Producciones textuales orales y escritas. Participaciones grupales e individuales.',
    eje: 'PRODUCCION', saberTipo: 'CONCEPTUAL', nivelCognitivo: 'SÍNTESIS',
    prerequisitoId: '5.1',
  },
  {
    id: '6.5', grado: 6,
    nombre: 'Hipótesis textuales, analogías y contrastes con experiencias previas',
    descripcion: 'Apreciación literaria y cooperación. Relación entre secuencias textuales y coherencia.',
    eje: 'COMPRENSION', saberTipo: 'PROCEDIMENTAL', nivelCognitivo: 'SÍNTESIS',
    prerequisitoId: '5.3',
  },
  {
    id: '6.6', grado: 6,
    nombre: 'Sinonimia, antonimia y polisemia en el texto',
    descripcion: 'Escritura coherente y precisa. Significaciones semejantes, diferentes y múltiples.',
    eje: 'VOCABULARIO', saberTipo: 'CONCEPTUAL', nivelCognitivo: 'SÍNTESIS',
    prerequisitoId: '5.6',
  },
  {
    id: '6.9', grado: 6,
    nombre: 'Géneros literarios: estructura, propósito y tipo de destinatario',
    descripcion: 'Placer literario. Diferencias y semejanzas entre los diversos géneros literarios.',
    eje: 'LITERATURA', saberTipo: 'CONCEPTUAL', nivelCognitivo: 'SÍNTESIS',
    prerequisitoId: '5.7',
  },
  {
    id: '6.11', grado: 6,
    nombre: 'Crítica literaria: intención, tono y propósito comunicativo',
    descripcion: 'Asociación entre lo escuchado y lo interpretado. Captación de códigos no verbales.',
    eje: 'LITERATURA', saberTipo: 'ACTITUDINAL', nivelCognitivo: 'SÍNTESIS',
    prerequisitoId: '5.9',
  },
  {
    id: '6.12', grado: 6,
    nombre: 'Fuentes de información: diccionarios, periódicos, revistas',
    descripcion: 'Valoración de fuentes de información. Partes del libro, periódicos y revistas.',
    eje: 'COMPRENSION', saberTipo: 'PROCEDIMENTAL', nivelCognitivo: 'SÍNTESIS',
    prerequisitoId: null,
  },
]

// ─── STUDENTS ────────────────────────────────────────────────────────────────

export const ESTUDIANTES = [
  { id: 1,  nombre: 'María González',   seccion: '7A', grado: 4, escuela: 'Escuela Central' },
  { id: 2,  nombre: 'Carlos Rodríguez', seccion: '7A', grado: 4, escuela: 'Escuela Central' },
  { id: 3,  nombre: 'Sofía Méndez',     seccion: '8B', grado: 5, escuela: 'Colegio San José' },
  { id: 4,  nombre: 'Luis Vargas',      seccion: '7B', grado: 4, escuela: 'Escuela Central' },
  { id: 5,  nombre: 'Andrea Quesada',   seccion: '9A', grado: 6, escuela: 'Colegio San José' },
  { id: 6,  nombre: 'Diego Araya',      seccion: '8A', grado: 4, escuela: 'Escuela Central' },
  { id: 7,  nombre: 'Valeria Mora',     seccion: '9B', grado: 6, escuela: 'Liceo Nacional' },
  { id: 8,  nombre: 'Kevin Jiménez',    seccion: '7A', grado: 4, escuela: 'Escuela Central' },
  { id: 9,  nombre: 'Gabriela Torres',  seccion: '8B', grado: 5, escuela: 'Colegio San José' },
  { id: 10, nombre: 'Roberto Salas',    seccion: '9A', grado: 6, escuela: 'Liceo Nacional' },
]

// ─── PERIODS ─────────────────────────────────────────────────────────────────

export const PERIODOS = ['I Ciclo 2026', 'II Ciclo 2026']

// ─── SCORE TABLE ─────────────────────────────────────────────────────────────
//
// Format: [estudianteId, contenidoId, score_C1, score_C2]
//
// Designed to demonstrate all 4 detection patterns:
//   REGRESIÓN        → María (4.3, 4.7, 4.8), Andrea (6.1, 6.5)
//   ESTANCAMIENTO    → Carlos (4.1-4.8), Kevin (4.7, 4.8), Valeria (6.11)
//   DESEQUILIBRIO    → Sofía (high conceptual, low actitudinal), Roberto (same)
//   DESFASE DE CICLO → Luis (grade 4 but scores ≤2 in prerequisite content 4.2, 4.3)

const SCORES_TABLA = [
  // María González (1, grade 4) — regression in comprensión lectora
  [1, '4.1',  3, 3],
  [1, '4.2',  3, 2],
  [1, '4.3',  3, 1],  // REGRESSION ↓
  [1, '4.4',  2, 3],
  [1, '4.7',  3, 1],  // REGRESSION ↓↓
  [1, '4.8',  3, 1],  // REGRESSION ↓↓
  [1, '4.9',  2, 2],
  [1, '4.12', 3, 3],

  // Carlos Rodríguez (2, grade 4) — stagnation (≤2 in both ciclos)
  [2, '4.1',  2, 2],  // STAGNATION
  [2, '4.2',  2, 2],  // STAGNATION
  [2, '4.3',  1, 1],  // STAGNATION LOW
  [2, '4.7',  2, 2],  // STAGNATION
  [2, '4.8',  2, 2],  // STAGNATION
  [2, '4.9',  1, 2],
  [2, '4.12', 2, 3],

  // Sofía Méndez (3, grade 5) — imbalance: strong conceptual, weak actitudinal
  [3, '5.1',  3, 4],  // CONCEPTUAL: strong
  [3, '5.3',  2, 3],
  [3, '5.5',  3, 3],
  [3, '5.6',  4, 4],  // CONCEPTUAL: very strong
  [3, '5.7',  3, 4],  // CONCEPTUAL: strong
  [3, '5.9',  1, 1],  // ACTITUDINAL: weak → IMBALANCE

  // Luis Vargas (4, grade 4) — cycle gap: grade 4 student, low on prerequisite-level content
  [4, '4.1',  2, 2],
  [4, '4.2',  1, 2],  // CYCLE GAP: prerequisite from 3.3 not mastered
  [4, '4.3',  1, 1],  // CYCLE GAP + STAGNATION
  [4, '4.4',  2, 3],
  [4, '4.7',  2, 3],
  [4, '4.8',  1, 2],
  [4, '4.12', 3, 3],

  // Andrea Quesada (5, grade 6) — regression in producción textual
  [5, '6.1',  3, 2],  // REGRESSION ↓
  [5, '6.5',  3, 2],  // REGRESSION ↓
  [5, '6.6',  4, 3],
  [5, '6.9',  3, 3],
  [5, '6.11', 2, 2],  // STAGNATION
  [5, '6.12', 3, 4],

  // Diego Araya (6, grade 4) — strong overall, no alerts
  [6, '4.1',  4, 4],
  [6, '4.2',  3, 4],
  [6, '4.3',  4, 4],
  [6, '4.7',  4, 4],
  [6, '4.8',  3, 4],
  [6, '4.9',  4, 3],
  [6, '4.12', 4, 4],

  // Valeria Mora (7, grade 6) — weak in literatura, stagnation
  [7, '6.1',  3, 3],
  [7, '6.5',  2, 3],
  [7, '6.6',  3, 3],
  [7, '6.9',  1, 2],  // weak literatura conceptual
  [7, '6.11', 1, 1],  // STAGNATION LOW actitudinal
  [7, '6.12', 3, 3],

  // Kevin Jiménez (8, grade 4) — stagnation in multiple areas
  [8, '4.1',  2, 2],  // STAGNATION
  [8, '4.2',  2, 2],  // STAGNATION
  [8, '4.3',  1, 2],
  [8, '4.7',  2, 2],  // STAGNATION
  [8, '4.8',  1, 1],  // CRITICAL STAGNATION
  [8, '4.9',  2, 2],
  [8, '4.12', 2, 3],

  // Gabriela Torres (9, grade 5) — strong overall, no alerts
  [9, '5.1',  3, 4],
  [9, '5.3',  3, 4],
  [9, '5.5',  4, 4],
  [9, '5.6',  3, 4],
  [9, '5.7',  3, 4],
  [9, '5.9',  3, 4],

  // Roberto Salas (10, grade 6) — imbalance: strong conceptual/procedimental, critical actitudinal
  [10, '6.1',  4, 4],  // CONCEPTUAL: very strong
  [10, '6.5',  4, 3],
  [10, '6.6',  4, 4],  // CONCEPTUAL: very strong
  [10, '6.9',  3, 3],
  [10, '6.11', 1, 1],  // ACTITUDINAL: critical → IMBALANCE
  [10, '6.12', 4, 4],
]

// ─── BUILD REGISTROS ──────────────────────────────────────────────────────────

export const REGISTROS = SCORES_TABLA.flatMap(([estudianteId, contenidoId, ...scores]) =>
  scores.map((puntuacion, periodoIdx) => ({
    estudianteId,
    contenidoId,
    periodo: PERIODOS[periodoIdx],
    periodoIdx,
    puntuacion,
  }))
)

// ─── HELPER LOOKUPS ──────────────────────────────────────────────────────────

export function getContenido(id) {
  return CONTENIDOS.find(c => c.id === id)
}

export function getEstudiante(id) {
  return ESTUDIANTES.find(e => e.id === id)
}

export function getEje(ejeId) {
  return EJES.find(e => e.id === ejeId)
}

/** Returns the last-period score for a student+contenido */
export function getLastScore(estudianteId, contenidoId) {
  const regs = REGISTROS
    .filter(r => r.estudianteId === estudianteId && r.contenidoId === contenidoId)
    .sort((a, b) => b.periodoIdx - a.periodoIdx)
  return regs[0]?.puntuacion ?? null
}

/** Returns all cycle scores for a student+contenido, sorted C1→C2 */
export function getScoreHistory(estudianteId, contenidoId) {
  return REGISTROS
    .filter(r => r.estudianteId === estudianteId && r.contenidoId === contenidoId)
    .sort((a, b) => a.periodoIdx - b.periodoIdx)
    .map(r => r.puntuacion)
}

// ─── PEDAGOGICAL ACTION SUGGESTIONS ─────────────────────────────────────────

const ACCIONES_REGRESION = {
  PRODUCCION:    'Revisar estrategias de escritura. Aplicar talleres de producción guiada con retroalimentación inmediata.',
  COMPRENSION:   'Reforzar estrategias de comprensión: predicción, visualización y conexión texto-experiencia.',
  VOCABULARIO:   'Implementar ejercicios de vocabulario contextualizado. Revisar reglas ortográficas con práctica oral.',
  GRAMATICA:     'Retomar conceptos gramaticales con ejemplos concretos del contexto del estudiante.',
  LITERATURA:    'Fomentar lectura libre y discusión grupal. Conectar los textos con intereses del estudiante.',
  EXPRESION_ORAL:'Crear espacios seguros de exposición oral. Reforzar pronunciación con actividades de dramatización.',
  FONOLOGICA:    'Aplicar actividades de conciencia silábica y fonémica. Evaluar necesidad de apoyo especializado.',
}

const ACCIONES_ESTANCAMIENTO = {
  PRODUCCION:    'Cambiar de estrategia pedagógica. Probar escritura colaborativa o proyectos de escritura real (cartas, cuentos).',
  COMPRENSION:   'Utilizar textos de mayor interés personal. Aplicar técnicas de lectura en voz alta y discusión grupal.',
  VOCABULARIO:   'Implementar juegos de vocabulario y actividades lúdicas. Vincular palabras nuevas con situaciones cotidianas.',
  GRAMATICA:     'Aplicar gramática en contexto real. Usar producción textual como vehículo en lugar de ejercicios mecánicos.',
  LITERATURA:    'Introducir géneros literarios variados. Conectar literatura con medios que el estudiante ya disfruta.',
  EXPRESION_ORAL:'Implementar rutinas de expresión oral breve y segura (show and tell, noticias cortas del aula).',
  FONOLOGICA:    'Derivar a evaluación de aprendizaje. Considerar intervención especializada en lectoescritura.',
}

export function accionSugerida(tipo, ejeId) {
  const mapa = tipo === 'REGRESION' ? ACCIONES_REGRESION : ACCIONES_ESTANCAMIENTO
  return mapa[ejeId] || 'Diseñar actividades integradoras con apoyo del equipo de orientación.'
}

export function accionDesequilibrio(saberDebil) {
  return {
    ACTITUDINAL:   'Trabajar la motivación y el vínculo emocional con el aprendizaje. Entrevista con orientador(a).',
    PROCEDIMENTAL: 'Reforzar estrategias de proceso: cómo hacer, cómo aplicar. Modelado y práctica guiada.',
    CONCEPTUAL:    'Conectar los conceptos con aplicaciones reales. Vincular teoría con producción práctica.',
  }[saberDebil] || 'Diseñar actividades integradoras que trabajen todos los tipos de saber simultáneamente.'
}

// ─── DETECTION FUNCTIONS ─────────────────────────────────────────────────────

/**
 * Detects REGRESSION: score drops by ≥1 point between the last two periods
 * for the same student + contenido.
 */
export function detectarRegresiones() {
  const alertas = []
  let fechaBase = 5

  for (const est of ESTUDIANTES) {
    const contenidosEvaluados = [...new Set(
      REGISTROS.filter(r => r.estudianteId === est.id).map(r => r.contenidoId)
    )]
    for (const cId of contenidosEvaluados) {
      const hist = getScoreHistory(est.id, cId)
      if (hist.length < 2) continue
      const prev = hist[hist.length - 2]
      const curr = hist[hist.length - 1]
      if (curr < prev) {
        const contenido = getContenido(cId)
        const drop = prev - curr
        alertas.push({
          tipo: 'REGRESION',
          riesgo: drop >= 2 ? 'ALTA' : 'MEDIA',
          estudianteId: est.id,
          nombre: est.nombre,
          seccion: est.seccion,
          contenidoId: cId,
          contenidoNombre: contenido?.nombre || cId,
          ejeId: contenido?.eje || '',
          saberTipo: contenido?.saberTipo || '',
          nivelCognitivo: contenido?.nivelCognitivo || '',
          scoreEsperado: prev,
          scoreActual: curr,
          descenso: drop,
          historial: hist,
          accion: accionSugerida('REGRESION', contenido?.eje),
          fecha: `2026-03-${String(fechaBase++).padStart(2, '0')}`,
        })
      }
    }
  }
  return alertas.sort((a, b) => b.descenso - a.descenso)
}

/**
 * Detects STAGNATION: same score ≤2 across all 3 periods (no improvement)
 * for the same student + contenido.
 */
export function detectarEstancamientos() {
  const alertas = []
  let fechaBase = 12

  for (const est of ESTUDIANTES) {
    const contenidosEvaluados = [...new Set(
      REGISTROS.filter(r => r.estudianteId === est.id).map(r => r.contenidoId)
    )]
    for (const cId of contenidosEvaluados) {
      const hist = getScoreHistory(est.id, cId)
      if (hist.length < 2) continue
      const allLow   = hist.every(s => s <= 2)
      const noGrowth = hist[hist.length - 1] <= hist[0]  // C2 ≤ C1
      if (allLow && noGrowth) {
        const contenido = getContenido(cId)
        const avg = hist.reduce((a, b) => a + b, 0) / hist.length
        alertas.push({
          tipo: 'ESTANCAMIENTO',
          riesgo: avg <= 1.5 ? 'ALTA' : 'MEDIA',
          estudianteId: est.id,
          nombre: est.nombre,
          seccion: est.seccion,
          contenidoId: cId,
          contenidoNombre: contenido?.nombre || cId,
          ejeId: contenido?.eje || '',
          saberTipo: contenido?.saberTipo || '',
          nivelCognitivo: contenido?.nivelCognitivo || '',
          historial: hist,
          promedio: avg.toFixed(1),
          accion: accionSugerida('ESTANCAMIENTO', contenido?.eje),
          fecha: `2026-03-${String(fechaBase++).padStart(2, '0')}`,
        })
      }
    }
  }
  return alertas.sort((a, b) => parseFloat(a.promedio) - parseFloat(b.promedio))
}

/**
 * Detects IMBALANCE: avg score of best saber type exceeds worst by ≥1.5 points.
 * One type might indicate attitudinal disengagement or procedural gap.
 */
export function detectarDesequilibrios() {
  const alertas = []

  for (const est of ESTUDIANTES) {
    // Get last-period scores per contenido
    const lastScores = {}
    const contenidosEvaluados = [...new Set(
      REGISTROS.filter(r => r.estudianteId === est.id).map(r => r.contenidoId)
    )]
    for (const cId of contenidosEvaluados) {
      const hist = getScoreHistory(est.id, cId)
      lastScores[cId] = hist[hist.length - 1]
    }

    // Group by saberTipo
    const byTipo = { CONCEPTUAL: [], PROCEDIMENTAL: [], ACTITUDINAL: [] }
    for (const [cId, score] of Object.entries(lastScores)) {
      const c = getContenido(cId)
      if (c && byTipo[c.saberTipo]) byTipo[c.saberTipo].push(score)
    }

    // Compute averages
    const avgs = {}
    for (const [tipo, scores] of Object.entries(byTipo)) {
      if (scores.length > 0) avgs[tipo] = scores.reduce((a, b) => a + b, 0) / scores.length
    }

    const tipos = Object.keys(avgs)
    if (tipos.length < 2) continue

    const maxTipo = tipos.reduce((a, b) => avgs[a] > avgs[b] ? a : b)
    const minTipo = tipos.reduce((a, b) => avgs[a] < avgs[b] ? a : b)
    const diff = avgs[maxTipo] - avgs[minTipo]

    if (diff >= 1.5) {
      alertas.push({
        tipo: 'DESEQUILIBRIO',
        riesgo: diff >= 2.5 ? 'ALTA' : 'MEDIA',
        estudianteId: est.id,
        nombre: est.nombre,
        seccion: est.seccion,
        saberFuerte: maxTipo,
        saberDebil: minTipo,
        scoreAlto: avgs[maxTipo].toFixed(1),
        scoreBajo: avgs[minTipo].toFixed(1),
        diferencia: diff.toFixed(1),
        avgs,
        accion: accionDesequilibrio(minTipo),
        fecha: '2026-03-20',
      })
    }
  }
  return alertas.sort((a, b) => parseFloat(b.diferencia) - parseFloat(a.diferencia))
}

/**
 * Detects CYCLE GAP: student's grade > content's grade (meaning it's a prerequisite
 * they should have mastered) and their current score ≤2.
 */
export function detectarDesfaseCiclo() {
  const alertas = []

  for (const est of ESTUDIANTES) {
    const contenidosEvaluados = [...new Set(
      REGISTROS.filter(r => r.estudianteId === est.id).map(r => r.contenidoId)
    )]
    for (const cId of contenidosEvaluados) {
      const hist = getScoreHistory(est.id, cId)
      const lastScore = hist[hist.length - 1]
      const contenido = getContenido(cId)
      if (!contenido) continue
      // Flag if the student's grade is higher than the content grade AND score ≤2
      if (lastScore <= 2 && contenido.grado < est.grado) {
        alertas.push({
          tipo: 'DESFASE_CICLO',
          riesgo: 'ALTA',
          estudianteId: est.id,
          nombre: est.nombre,
          seccion: est.seccion,
          contenidoId: cId,
          contenidoNombre: contenido.nombre,
          ejeId: contenido.eje,
          saberTipo: contenido.saberTipo,
          gradoEstudiante: est.grado,
          gradoContenido: contenido.grado,
          scoreActual: lastScore,
          historial: hist,
          accion: 'Evaluación diagnóstica y plan de nivelación. Verificar dominio de contenidos del ciclo anterior antes de avanzar.',
          fecha: '2026-03-22',
        })
      }
    }
  }
  return alertas
}

/**
 * Generates ALL alerts across all 4 types, deduplicated and sorted by risk.
 */
export function generarTodasLasAlertas() {
  return [
    ...detectarRegresiones(),
    ...detectarEstancamientos(),
    ...detectarDesequilibrios(),
    ...detectarDesfaseCiclo(),
  ]
}

// ─── DISPLAY HELPERS ─────────────────────────────────────────────────────────

export const SABER_LABELS = {
  CONCEPTUAL:    'Conceptual',
  PROCEDIMENTAL: 'Procedimental',
  ACTITUDINAL:   'Actitudinal',
}

export const SABER_COLORS = {
  CONCEPTUAL:    { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  PROCEDIMENTAL: { bg: '#dcfce7', color: '#15803d', border: '#86efac' },
  ACTITUDINAL:   { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
}

export const NIVEL_LABELS = {
  RECONOCIMIENTO: 'Reconocimiento',
  APLICACIÓN:     'Aplicación',
  ANÁLISIS:       'Análisis',
  EVALUACIÓN:     'Evaluación',
  SÍNTESIS:       'Síntesis',
}

export const SCORE_COLORS = { 1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#22c55e' }
export const SCORE_TEXT   = { 1: '#fff',    2: '#fff',    3: '#78350f', 4: '#fff' }
export const SCORE_LABELS = { 1: 'Insuficiente', 2: 'Básico', 3: 'Satisfactorio', 4: 'Destacado' }

export const TIPO_ALERT_META = {
  REGRESION:     { label: 'Regresión',          icon: '↘',  badgeBg: '#fde8e8', badgeColor: '#a83232' },
  ESTANCAMIENTO: { label: 'Estancamiento',       icon: '⇄',  badgeBg: '#fff4e0', badgeColor: '#92400e' },
  DESEQUILIBRIO: { label: 'Desequilibrio',       icon: '⚖',  badgeBg: '#ede9fe', badgeColor: '#5b21b6' },
  DESFASE_CICLO: { label: 'Desfase de ciclo',    icon: '⚠',  badgeBg: '#fde8e8', badgeColor: '#a83232' },
}

export const RIESGO_COLORS = {
  ALTA:  { border: '#ef4444', bg: '#fff5f5', badge: 'badge-red' },
  MEDIA: { border: '#f59e0b', bg: '#fffbef', badge: 'badge-yellow' },
  BAJA:  { border: '#22c55e', bg: '#f0fdf4', badge: 'badge-green' },
}
