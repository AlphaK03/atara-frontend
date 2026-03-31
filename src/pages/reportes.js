/**
 * Reportes — Análisis Pedagógico con Chart.js
 *
 * Tipos de gráfico disponibles: Barras | Pastel/Donut | Radar | Línea
 * Cada tipo muestra el mismo conjunto de datos en una representación distinta.
 */

import Chart from 'chart.js/auto'
import {
  EJES, CONTENIDOS, ESTUDIANTES, PERIODOS,
  REGISTROS, SABER_LABELS, SABER_COLORS,
  SCORE_COLORS, SCORE_TEXT, SCORE_LABELS,
  detectarRegresiones, getEje,
} from '../pedagogicaData.js'

// ─── Colores constantes ────────────────────────────────────────────────────────

const SABER_HEX = {
  CONCEPTUAL:    '#2563eb',
  PROCEDIMENTAL: '#059669',
  ACTITUDINAL:   '#d97706',
}

const SCORE_HEX = ['', '#ef4444', '#f97316', '#eab308', '#22c55e']
const SCORE_NAMES = ['', 'Insuficiente', 'Básico', 'Satisfactorio', 'Destacado']

// ─── Registro de instancias Chart.js (para destruirlas al re-renderizar) ──────

const _charts = {}
function destroyChart(id) { _charts[id]?.destroy(); delete _charts[id] }
function destroyAll()     { Object.keys(_charts).forEach(destroyChart) }

// ─── Helpers de datos ─────────────────────────────────────────────────────────

function avgForContenido(contenidoId, periodoIdx, studentIds) {
  const scores = REGISTROS.filter(r =>
    r.contenidoId === contenidoId &&
    r.periodoIdx  === periodoIdx  &&
    studentIds.has(r.estudianteId)
  ).map(r => r.puntuacion)
  return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null
}

function avgBySaber(saber, periodoIdx, studentIds) {
  const cIds = CONTENIDOS.filter(c => c.saberTipo === saber).map(c => c.id)
  const scores = REGISTROS.filter(r =>
    r.periodoIdx === periodoIdx && cIds.includes(r.contenidoId) && studentIds.has(r.estudianteId)
  ).map(r => r.puntuacion)
  return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null
}

function avgByEje(ejeId, periodoIdx, studentIds) {
  const cIds = CONTENIDOS.filter(c => c.eje === ejeId).map(c => c.id)
  const scores = REGISTROS.filter(r =>
    r.periodoIdx === periodoIdx && cIds.includes(r.contenidoId) && studentIds.has(r.estudianteId)
  ).map(r => r.puntuacion)
  return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null
}

function colorForAvg(avg) {
  if (avg === null) return '#e5e7eb'
  if (avg < 1.5) return SCORE_HEX[1]
  if (avg < 2.5) return SCORE_HEX[2]
  if (avg < 3.5) return SCORE_HEX[3]
  return SCORE_HEX[4]
}

// ─── Opciones base de Chart.js ────────────────────────────────────────────────

const BASE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { font: { size: 12 }, boxWidth: 14 } },
    tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label ?? ''}: ${Number(ctx.raw).toFixed(2)}` } },
  },
}

const SCALE_Y_0_4 = {
  y: { min: 0, max: 4, ticks: { stepSize: 1, callback: v => ['', 'I', 'B', 'S', 'D'][v] ?? v }, grid: { color: '#f3f4f6' } },
  x: { grid: { display: false } },
}

// ─── Fábrica de gráficos ──────────────────────────────────────────────────────

function makeChart(id, type, data, options = {}) {
  destroyChart(id)
  const canvas = document.getElementById(id)
  if (!canvas) return
  _charts[id] = new Chart(canvas, { type, data, options: { ...BASE_OPTS, ...options } })
}

// ─── Insight generator ────────────────────────────────────────────────────────

function generarInsights(weakTopics, saberAvgs, regrCounts) {
  const insights = []

  const ejeWeakCount = {}
  for (const t of weakTopics) ejeWeakCount[t.eje] = (ejeWeakCount[t.eje] || 0) + 1
  const topWeakEje = Object.entries(ejeWeakCount).sort((a, b) => b[1] - a[1])[0]
  if (topWeakEje) {
    const eje = getEje(topWeakEje[0])
    insights.push({ icon: '📚', title: 'Eje con mayor debilidad colectiva',
      text: `La mayoría de los estudiantes muestran debilidad en el eje <strong>${eje?.nombre || topWeakEje[0]}</strong> (${topWeakEje[1]} contenido${topWeakEje[1] !== 1 ? 's' : ''} con promedio ≤2.5). Se recomienda revisar la estrategia pedagógica de manera transversal.` })
  }

  const saberEntries = Object.entries(saberAvgs).filter(([, v]) => v !== null)
  if (saberEntries.length >= 2) {
    const minS = saberEntries.reduce((a, b) => a[1] < b[1] ? a : b)
    const maxS = saberEntries.reduce((a, b) => a[1] > b[1] ? a : b)
    insights.push({ icon: '⚖', title: 'Desequilibrio entre tipos de saber',
      text: `El saber <strong>${SABER_LABELS[minS[0]]}</strong> (${Number(minS[1]).toFixed(2)}) está significativamente por debajo del saber <strong>${SABER_LABELS[maxS[0]]}</strong> (${Number(maxS[1]).toFixed(2)}).` })
  }

  const topRegr = Object.entries(regrCounts).sort((a, b) => b[1] - a[1]).slice(0, 2)
  if (topRegr.length) {
    const names = topRegr.map(([id, cnt]) => {
      const est = ESTUDIANTES.find(e => e.id === Number(id))
      return `${est?.nombre || 'ID ' + id} (${cnt})`
    }).join(', ')
    insights.push({ icon: '↘', title: 'Estudiantes con mayor regresión',
      text: `Los estudiantes con más alertas de regresión son: <strong>${names}</strong>. Se recomienda un plan de apoyo diferenciado.` })
  }

  if (saberAvgs.ACTITUDINAL !== null && saberAvgs.ACTITUDINAL < 2.5) {
    insights.push({ icon: '🔔', title: 'Señal precursora en saber actitudinal',
      text: `Promedio actitudinal del grupo: ${Number(saberAvgs.ACTITUDINAL).toFixed(2)} — por debajo del umbral (2.5). La caída actitudinal suele preceder a la caída en rendimiento académico.` })
  }

  return insights
}

// ─── Render principal ─────────────────────────────────────────────────────────

export function renderReportes(container) {
  const secciones = [...new Set(ESTUDIANTES.map(e => e.seccion))].sort()
  let chartType = 'bar'

  container.innerHTML = `
    <h1>Reportes — Análisis Pedagógico</h1>
    <p class="page-desc">
      Estadísticas y tendencias del modelo curricular de Español (MEP).
      Cambia el tipo de gráfico para ver la misma información en distintas representaciones.
    </p>

    <!-- Filtros -->
    <div class="card">
      <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end">
        <div class="form-group" style="min-width:130px">
          <label>Sección</label>
          <select id="rpt-seccion">
            <option value="">Todas</option>
            ${secciones.map(s => `<option value="${s}">${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="min-width:160px">
          <label>Periodo</label>
          <select id="rpt-periodo">
            <option value="">Último (${PERIODOS[PERIODOS.length - 1]})</option>
            ${PERIODOS.map((p, i) => `<option value="${i}">${p}</option>`).join('')}
          </select>
        </div>
        <button class="btn btn-secondary btn-sm" id="rpt-clear">Limpiar filtros</button>
      </div>
    </div>

    <!-- Selector de tipo de gráfico -->
    <div class="card" style="padding:14px 18px">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <span style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em">
          Tipo de gráfico:
        </span>
        <div id="chart-type-btns" style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="chart-type-btn active" data-type="bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="10" width="5" height="11"/><rect x="9.5" y="5" width="5" height="16"/><rect x="16" y="13" width="5" height="8"/></svg>
            Barras
          </button>
          <button class="chart-type-btn" data-type="pie">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
            Pastel
          </button>
          <button class="chart-type-btn" data-type="doughnut">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
            Dona
          </button>
          <button class="chart-type-btn" data-type="radar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 19 21 12 17 5 21"/><line x1="12" y1="2" x2="12" y2="22"/><line x1="3" y1="8" x2="21" y2="8"/><line x1="3" y1="16" x2="21" y2="16"/></svg>
            Radar
          </button>
          <button class="chart-type-btn" data-type="line">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Línea
          </button>
          <button class="chart-type-btn" data-type="polarArea">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
            Polar
          </button>
        </div>
      </div>
    </div>

    <!-- Gráficos: fila 1 -->
    <div class="rpt-charts-row">
      <div class="card" style="margin:0">
        <h2 style="margin-top:0;font-size:14px" id="g1-title">Rendimiento por contenido</h2>
        <p style="font-size:11px;color:var(--text-muted);margin-bottom:12px" id="g1-sub">Promedio grupal — contenidos con mayor debilidad (≤ 2.5)</p>
        <div style="position:relative;height:260px"><canvas id="chart-contenidos"></canvas></div>
      </div>
      <div class="card" style="margin:0">
        <h2 style="margin-top:0;font-size:14px" id="g2-title">Tipos de saber</h2>
        <p style="font-size:11px;color:var(--text-muted);margin-bottom:12px" id="g2-sub">Promedio grupal por componente curricular</p>
        <div style="position:relative;height:260px"><canvas id="chart-saber"></canvas></div>
      </div>
    </div>

    <!-- Gráficos: fila 2 -->
    <div class="rpt-charts-row">
      <div class="card" style="margin:0">
        <h2 style="margin-top:0;font-size:14px">Tendencia por eje temático</h2>
        <p style="font-size:11px;color:var(--text-muted);margin-bottom:12px">Evolución del promedio por trimestre</p>
        <div style="position:relative;height:260px"><canvas id="chart-tendencia"></canvas></div>
      </div>
      <div class="card" style="margin:0">
        <h2 style="margin-top:0;font-size:14px">Distribución de escalas</h2>
        <p style="font-size:11px;color:var(--text-muted);margin-bottom:12px">Porcentaje de evaluaciones por nivel (I / B / S / D)</p>
        <div style="position:relative;height:260px"><canvas id="chart-distribucion"></canvas></div>
      </div>
    </div>

    <!-- Gráfico: regresiones (siempre barras horizontales, es un ranking) -->
    <div class="card">
      <h2 style="margin-top:0;font-size:14px">Estudiantes con más regresiones</h2>
      <p style="font-size:11px;color:var(--text-muted);margin-bottom:12px">Número de alertas de regresión detectadas</p>
      <div style="position:relative;height:220px"><canvas id="chart-regresiones"></canvas></div>
    </div>

    <!-- Análisis automático -->
    <div class="card">
      <h2 style="margin-top:0;font-size:14px">Análisis automático</h2>
      <p style="font-size:11px;color:var(--text-muted);margin-bottom:16px">Conclusiones derivadas de los patrones detectados.</p>
      <div id="insights-list"></div>
    </div>

    <style>
      .chart-type-btn {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 6px 12px; border-radius: 6px; border: 1px solid var(--border);
        background: var(--surface); color: var(--text-muted);
        font-size: 12px; font-weight: 500; cursor: pointer;
        transition: all 0.15s;
      }
      .chart-type-btn:hover { border-color: var(--accent); color: var(--accent); }
      .chart-type-btn.active {
        background: var(--accent); color: #fff;
        border-color: var(--accent);
      }
    </style>
  `

  // ─── Lógica de render ────────────────────────────────────────────────────────

  function render() {
    const seccionFilter = container.querySelector('#rpt-seccion').value
    const periodoIdx    = container.querySelector('#rpt-periodo').value !== ''
      ? Number(container.querySelector('#rpt-periodo').value)
      : PERIODOS.length - 1

    const students  = ESTUDIANTES.filter(e => !seccionFilter || e.seccion === seccionFilter)
    const studentIds = new Set(students.map(e => e.id))

    // ── Datos: contenidos con debilidad ────────────────────────────────────────
    const topicAvgs = CONTENIDOS
      .map(c => ({ ...c, avg: avgForContenido(c.id, periodoIdx, studentIds) }))
      .filter(c => c.avg !== null && c.avg <= 2.5)
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 10)

    // ── Datos: tipos de saber ──────────────────────────────────────────────────
    const saberAvgs = {}
    for (const s of ['CONCEPTUAL', 'PROCEDIMENTAL', 'ACTITUDINAL']) {
      saberAvgs[s] = avgBySaber(s, periodoIdx, studentIds)
    }

    // ── Datos: regresiones ────────────────────────────────────────────────────
    const regrCounts = {}
    detectarRegresiones()
      .filter(a => studentIds.has(a.estudianteId))
      .forEach(a => { regrCounts[a.estudianteId] = (regrCounts[a.estudianteId] || 0) + 1 })

    destroyAll()

    // ── Gráfico 1: Contenidos con debilidad ───────────────────────────────────
    if (!topicAvgs.length) {
      document.getElementById('chart-contenidos').parentElement.innerHTML =
        '<p class="empty" style="padding:40px 0">Sin contenidos con debilidad detectada.</p>'
    } else {
      const labels = topicAvgs.map(c => c.id + ' — ' + (c.nombre.length > 30 ? c.nombre.slice(0, 30) + '…' : c.nombre))
      const data   = topicAvgs.map(c => c.avg)
      const colors = topicAvgs.map(c => colorForAvg(c.avg))

      if (chartType === 'bar') {
        makeChart('chart-contenidos', 'bar', {
          labels,
          datasets: [{ label: 'Promedio', data, backgroundColor: colors, borderRadius: 4 }],
        }, { indexAxis: 'y', scales: { x: { min: 0, max: 4, grid: { color: '#f3f4f6' } }, y: { grid: { display: false } } } })

      } else if (chartType === 'pie' || chartType === 'doughnut') {
        // Para pastel: agrupa por escala (1-4)
        const dist = [1, 2, 3, 4].map(score => REGISTROS.filter(r =>
          r.periodoIdx === periodoIdx && studentIds.has(r.estudianteId) && r.puntuacion === score
        ).length)
        makeChart('chart-contenidos', chartType, {
          labels: SCORE_NAMES.slice(1),
          datasets: [{ data: dist, backgroundColor: SCORE_HEX.slice(1), borderWidth: 1 }],
        }, { plugins: { ...BASE_OPTS.plugins, legend: { position: 'right' } } })

      } else if (chartType === 'radar') {
        makeChart('chart-contenidos', 'radar', {
          labels: topicAvgs.map(c => c.id),
          datasets: [{ label: 'Promedio', data, backgroundColor: 'rgba(59,130,216,0.15)', borderColor: '#3b82f6', pointBackgroundColor: colors }],
        }, { scales: { r: { min: 0, max: 4, ticks: { stepSize: 1 }, grid: { color: '#e5e7eb' } } } })

      } else if (chartType === 'polarArea') {
        makeChart('chart-contenidos', 'polarArea', {
          labels: topicAvgs.map(c => c.id),
          datasets: [{ data, backgroundColor: colors.map(c => c + 'aa') }],
        }, { scales: { r: { min: 0, max: 4 } } })

      } else {
        // line
        makeChart('chart-contenidos', 'line', {
          labels,
          datasets: [{ label: 'Promedio', data, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,216,0.1)', fill: true, tension: 0.3, pointBackgroundColor: colors }],
        }, { scales: { ...SCALE_Y_0_4, x: { ticks: { maxRotation: 45 }, grid: { display: false } } } })
      }
    }

    // ── Gráfico 2: Tipos de saber ─────────────────────────────────────────────
    const saberLabels = ['Conceptual', 'Procedimental', 'Actitudinal']
    const saberData   = ['CONCEPTUAL', 'PROCEDIMENTAL', 'ACTITUDINAL'].map(s => saberAvgs[s] ?? 0)
    const saberColors = ['CONCEPTUAL', 'PROCEDIMENTAL', 'ACTITUDINAL'].map(s => SABER_HEX[s])

    if (chartType === 'radar') {
      makeChart('chart-saber', 'radar', {
        labels: saberLabels,
        datasets: [{ label: 'Promedio', data: saberData, backgroundColor: 'rgba(5,150,105,0.15)', borderColor: '#059669', pointBackgroundColor: saberColors }],
      }, { scales: { r: { min: 0, max: 4, ticks: { stepSize: 1 }, grid: { color: '#e5e7eb' } } } })

    } else if (chartType === 'pie' || chartType === 'doughnut') {
      makeChart('chart-saber', chartType, {
        labels: saberLabels,
        datasets: [{ data: saberData, backgroundColor: saberColors, borderWidth: 1 }],
      }, { plugins: { ...BASE_OPTS.plugins, legend: { position: 'right' } } })

    } else if (chartType === 'polarArea') {
      makeChart('chart-saber', 'polarArea', {
        labels: saberLabels,
        datasets: [{ data: saberData, backgroundColor: saberColors.map(c => c + 'bb') }],
      }, { scales: { r: { min: 0, max: 4 } } })

    } else {
      // bar o line → barras verticales para saberes (solo 3 puntos)
      makeChart('chart-saber', chartType === 'line' ? 'line' : 'bar', {
        labels: saberLabels,
        datasets: [{ label: 'Promedio', data: saberData, backgroundColor: saberColors, borderColor: saberColors, borderRadius: 4, fill: chartType === 'line', tension: 0.4 }],
      }, { scales: SCALE_Y_0_4 })
    }

    // ── Gráfico 3: Tendencia por eje ──────────────────────────────────────────
    // Siempre línea, independientemente del selector (es temporal, el tipo de línea tiene sentido aquí)
    const ejesConDatos = EJES.filter(eje => {
      const cIds = CONTENIDOS.filter(c => c.eje === eje.id).map(c => c.id)
      return REGISTROS.some(r => cIds.includes(r.contenidoId) && studentIds.has(r.estudianteId))
    })

    const tendenciaDatasets = ejesConDatos.map(eje => {
      const data = PERIODOS.map((_, pidx) => {
        const v = avgByEje(eje.id, pidx, studentIds)
        return v !== null ? parseFloat(v.toFixed(2)) : null
      })
      return {
        label: eje.nombre,
        data,
        borderColor: eje.color,
        backgroundColor: eje.color + '22',
        fill: chartType === 'line',
        tension: 0.35,
        pointRadius: 5,
        spanGaps: true,
      }
    })

    const tendenciaType = (chartType === 'bar') ? 'bar'
                        : (chartType === 'pie' || chartType === 'doughnut') ? 'doughnut'
                        : (chartType === 'radar') ? 'radar'
                        : (chartType === 'polarArea') ? 'polarArea'
                        : 'line'

    if (tendenciaType === 'doughnut' || tendenciaType === 'polarArea') {
      // Para pastel/polar en tendencia: promedio por eje en el periodo actual
      makeChart('chart-tendencia', tendenciaType, {
        labels: ejesConDatos.map(e => e.nombre),
        datasets: [{ data: ejesConDatos.map(e => {
          const v = avgByEje(e.id, periodoIdx, studentIds)
          return v !== null ? parseFloat(v.toFixed(2)) : 0
        }), backgroundColor: ejesConDatos.map(e => e.color + (tendenciaType === 'polarArea' ? 'bb' : '')), borderWidth: 1 }],
      }, tendenciaType === 'polarArea'
        ? { scales: { r: { min: 0, max: 4 } } }
        : { plugins: { ...BASE_OPTS.plugins, legend: { position: 'right', labels: { font: { size: 10 } } } } })

    } else if (tendenciaType === 'radar') {
      makeChart('chart-tendencia', 'radar', {
        labels: PERIODOS,
        datasets: tendenciaDatasets.map(ds => ({ ...ds, fill: true })),
      }, { scales: { r: { min: 0, max: 4, ticks: { stepSize: 1 }, grid: { color: '#e5e7eb' } } } })

    } else {
      makeChart('chart-tendencia', tendenciaType === 'bar' ? 'bar' : 'line', {
        labels: PERIODOS,
        datasets: tendenciaDatasets,
      }, { scales: SCALE_Y_0_4 })
    }

    // ── Gráfico 4: Distribución de escalas ────────────────────────────────────
    const distData   = [1, 2, 3, 4].map(score => REGISTROS.filter(r =>
      r.periodoIdx === periodoIdx && studentIds.has(r.estudianteId) && r.puntuacion === score
    ).length)
    const distColors = SCORE_HEX.slice(1)
    const distLabels = SCORE_NAMES.slice(1)

    if (chartType === 'radar') {
      makeChart('chart-distribucion', 'radar', {
        labels: distLabels,
        datasets: [{ label: 'Cantidad', data: distData, backgroundColor: 'rgba(220,38,38,0.1)', borderColor: '#ef4444', pointBackgroundColor: distColors }],
      }, { scales: { r: { ticks: { stepSize: 1 }, grid: { color: '#e5e7eb' } } } })

    } else if (chartType === 'bar' || chartType === 'line') {
      makeChart('chart-distribucion', chartType, {
        labels: distLabels,
        datasets: [{ label: 'Evaluaciones', data: distData, backgroundColor: distColors, borderColor: distColors, borderRadius: 4, fill: chartType === 'line', tension: 0.3 }],
      }, { scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: '#f3f4f6' } } } })

    } else {
      makeChart('chart-distribucion', chartType === 'polarArea' ? 'polarArea' : chartType, {
        labels: distLabels,
        datasets: [{ data: distData, backgroundColor: chartType === 'polarArea' ? distColors.map(c => c + 'bb') : distColors, borderWidth: 1 }],
      }, chartType === 'polarArea'
        ? {}
        : { plugins: { ...BASE_OPTS.plugins, legend: { position: 'right' } } })
    }

    // ── Gráfico 5: Regresiones (siempre barras horizontales — es un ranking) ──
    const ranked = Object.entries(regrCounts).sort((a, b) => b[1] - a[1]).slice(0, 7)
    if (!ranked.length) {
      document.getElementById('chart-regresiones').parentElement.innerHTML =
        '<p class="empty" style="padding:24px 0">No se detectaron regresiones.</p>'
    } else {
      const rLabels = ranked.map(([id]) => ESTUDIANTES.find(e => e.id === Number(id))?.nombre || 'ID ' + id)
      const rData   = ranked.map(([, cnt]) => cnt)
      makeChart('chart-regresiones', 'bar', {
        labels: rLabels,
        datasets: [{ label: 'Regresiones', data: rData, backgroundColor: '#ef4444bb', borderColor: '#ef4444', borderRadius: 4 }],
      }, { indexAxis: 'y', scales: { x: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#f3f4f6' } }, y: { grid: { display: false } } } })
    }

    // ── Insights ──────────────────────────────────────────────────────────────
    const insights = generarInsights(topicAvgs, saberAvgs, regrCounts)
    const insightsDiv = container.querySelector('#insights-list')
    insightsDiv.innerHTML = !insights.length
      ? '<p class="empty" style="padding:12px 0">No se generaron conclusiones con los datos actuales.</p>'
      : insights.map(ins => `
          <div style="display:flex;gap:14px;padding:14px 16px;border-radius:var(--radius);background:#f8f9fb;border:1px solid var(--border);margin-bottom:12px">
            <div style="font-size:20px;flex-shrink:0;padding-top:2px">${ins.icon}</div>
            <div>
              <div style="font-size:13px;font-weight:700;margin-bottom:4px">${ins.title}</div>
              <div style="font-size:13px;color:#374151;line-height:1.6">${ins.text}</div>
            </div>
          </div>`).join('')
  }

  // ─── Eventos ──────────────────────────────────────────────────────────────────

  container.querySelector('#rpt-seccion').addEventListener('change', render)
  container.querySelector('#rpt-periodo').addEventListener('change', render)
  container.querySelector('#rpt-clear').addEventListener('click', () => {
    container.querySelector('#rpt-seccion').value = ''
    container.querySelector('#rpt-periodo').value = ''
    render()
  })

  container.querySelector('#chart-type-btns').addEventListener('click', e => {
    const btn = e.target.closest('.chart-type-btn')
    if (!btn) return
    chartType = btn.dataset.type
    container.querySelectorAll('.chart-type-btn').forEach(b => b.classList.toggle('active', b === btn))
    render()
  })

  render()
}
