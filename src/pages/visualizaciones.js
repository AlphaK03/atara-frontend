/**
 * Visualizaciones — Mapa de calor pedagógico
 *
 * Heatmap where:
 *   Rows    = students
 *   Columns = real contenidos from the Excel, grouped by eje temático
 *   Cells   = last-period score (1–4) with color coding
 *
 * Color scale (from propuesta-contenidos-espanol.md):
 *   1 → Red     (Insuficiente — critical)
 *   2 → Orange  (Básico — at risk)
 *   3 → Yellow  (Satisfactorio — acceptable)
 *   4 → Green   (Destacado — strong)
 *
 * Visual enhancements:
 *   ↘  in cell if current score < previous period (regression)
 *   ⇄  in cell if same low score across all 3 periods (stagnation)
 *   Cluster highlight: if 3+ consecutive low scores in same eje, row section is flagged
 */

import {
  EJES, CONTENIDOS, ESTUDIANTES,
  REGISTROS, PERIODOS,
  getScoreHistory, getLastScore,
  SCORE_COLORS, SCORE_TEXT, SCORE_LABELS, SABER_LABELS, SABER_COLORS,
  getEje,
} from '../pedagogicaData.js'

const SCHOOLS = [...new Set(ESTUDIANTES.map(e => e.escuela))]

// ─── cell logic helpers ───────────────────────────────────────────────────────

/** Returns regression/stagnation indicator for a score history */
function cellIndicator(hist) {
  if (!hist || hist.length < 2) return ''
  const allLow   = hist.every(s => s <= 2)
  const noGrowth = hist[hist.length - 1] <= hist[0]
  if (allLow && noGrowth && hist.length >= 2) return '<span style="font-size:9px;opacity:.8">⇄</span>'
  if (hist[hist.length - 1] < hist[hist.length - 2]) return '<span style="font-size:9px;opacity:.8">↘</span>'
  return ''
}

/** Returns average score for a row of cells (ignoring nulls) */
function rowAvg(scores) {
  const valid = scores.filter(s => s !== null)
  if (!valid.length) return null
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

/** Color for an average (continuous, not stepped) */
function avgColor(avg) {
  if (avg === null) return '#e5e7eb'
  if (avg < 1.5) return SCORE_COLORS[1]
  if (avg < 2.5) return SCORE_COLORS[2]
  if (avg < 3.5) return SCORE_COLORS[3]
  return SCORE_COLORS[4]
}
function avgTextColor(avg) {
  if (avg === null) return '#9ca3af'
  if (avg >= 2.5 && avg < 3.5) return '#78350f'
  return '#fff'
}

// ─── main render ─────────────────────────────────────────────────────────────

export function renderVisualizaciones(container, params = {}) {
  const grades = [...new Set(CONTENIDOS.map(c => c.grado))].sort()

  container.innerHTML = `
    <h1>Mapa de Calor Pedagógico</h1>
    <p class="page-desc">
      Rendimiento por contenido (extraído del curriculum de Español MEP), agrupado por eje temático.
      Las columnas corresponden a contenidos reales del archivo curricular.
    </p>

    <!-- Filters -->
    <div class="card">
      <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end">
        <div class="form-group" style="min-width:160px">
          <label>Centro educativo</label>
          <select id="vz-school">
            <option value="">Todos</option>
            ${SCHOOLS.map(s => `<option value="${s}">${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="min-width:120px">
          <label>Sección</label>
          <select id="vz-section">
            <option value="">Todas</option>
          </select>
        </div>
        <div class="form-group" style="min-width:120px">
          <label>Grado (contenidos)</label>
          <select id="vz-grado">
            <option value="">Todos</option>
            ${grades.map(g => `<option value="${g}">${g}.° grado</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="min-width:170px">
          <label>Eje temático</label>
          <select id="vz-eje">
            <option value="">Todos</option>
            ${EJES.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="min-width:150px">
          <label>Tipo de saber</label>
          <select id="vz-saber">
            <option value="">Todos</option>
            <option value="CONCEPTUAL">Conceptual</option>
            <option value="PROCEDIMENTAL">Procedimental</option>
            <option value="ACTITUDINAL">Actitudinal</option>
          </select>
        </div>
        <div class="form-group" style="min-width:170px">
          <label>Buscar estudiante</label>
          <input type="text" id="vz-search" placeholder="Nombre..." />
        </div>
        <button class="btn btn-secondary btn-sm" id="vz-clear">Limpiar</button>
      </div>
    </div>

    <!-- Legend -->
    <div style="display:flex;flex-wrap:wrap;gap:20px;align-items:center;margin-bottom:16px">
      <span style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em">Escala:</span>
      ${[1,2,3,4].map(s => `
        <div style="display:flex;align-items:center;gap:5px">
          <div style="width:20px;height:20px;border-radius:3px;background:${SCORE_COLORS[s]}"></div>
          <span style="font-size:12px">${s} — ${SCORE_LABELS[s]}</span>
        </div>`).join('')}
      <div style="display:flex;align-items:center;gap:5px">
        <span style="font-size:14px;color:var(--text-muted)">↘</span>
        <span style="font-size:12px">Regresión</span>
      </div>
      <div style="display:flex;align-items:center;gap:5px">
        <span style="font-size:14px;color:var(--text-muted)">⇄</span>
        <span style="font-size:12px">Estancamiento</span>
      </div>
      <div style="display:flex;align-items:center;gap:5px">
        <div style="width:16px;height:16px;border-radius:3px;background:#fde8e8;border:2px solid #ef4444"></div>
        <span style="font-size:12px">Clúster de debilidad (≥3 bajos en mismo eje)</span>
      </div>
    </div>

    <!-- Heatmap -->
    <div class="card" style="overflow-x:auto;padding:16px">
      <div id="heatmap-container"></div>
    </div>

    <!-- Column detail panel (shows on click) -->
    <div id="col-detail" style="display:none" class="card">
      <h2 id="col-detail-title" style="margin-top:0;font-size:15px"></h2>
      <div id="col-detail-body"></div>
    </div>
  `

  const schoolSel  = container.querySelector('#vz-school')
  const sectionSel = container.querySelector('#vz-section')
  const gradoSel   = container.querySelector('#vz-grado')
  const ejeSel     = container.querySelector('#vz-eje')
  const saberSel   = container.querySelector('#vz-saber')
  const searchInput= container.querySelector('#vz-search')

  function updateSections() {
    const school = schoolSel.value
    const secciones = school
      ? [...new Set(ESTUDIANTES.filter(e => e.escuela === school).map(e => e.seccion))].sort()
      : [...new Set(ESTUDIANTES.map(e => e.seccion))].sort()
    sectionSel.innerHTML = `<option value="">Todas</option>` +
      secciones.map(s => `<option value="${s}">${s}</option>`).join('')
  }

  function renderHeatmap() {
    const school  = schoolSel.value
    const section = sectionSel.value
    const grado   = gradoSel.value ? Number(gradoSel.value) : null
    const ejeId   = ejeSel.value
    const saber   = saberSel.value
    const search  = searchInput.value.toLowerCase().trim()

    // Filter students
    const students = ESTUDIANTES.filter(e =>
      (!school  || e.escuela === school)  &&
      (!section || e.seccion === section) &&
      (!search  || e.nombre.toLowerCase().includes(search))
    )

    // Filter contenidos
    let contenidos = CONTENIDOS.filter(c =>
      (!grado || c.grado === grado) &&
      (!ejeId || c.eje   === ejeId) &&
      (!saber || c.saberTipo === saber)
    )

    const hm = container.querySelector('#heatmap-container')

    if (!students.length || !contenidos.length) {
      hm.innerHTML = '<p class="empty">No hay datos con los filtros aplicados.</p>'
      return
    }

    // Group contenidos by eje
    const ejesPresentes = EJES.filter(e => contenidos.some(c => c.eje === e.id))

    // Build header HTML: eje groups + individual content columns
    const theadEjeRow = ejesPresentes.map(eje => {
      const cols = contenidos.filter(c => c.eje === eje.id)
      return `<th colspan="${cols.length}" style="
        text-align:center;padding:6px 4px;font-size:11px;font-weight:700;
        background:${eje.color}18;color:${eje.color};border-bottom:2px solid ${eje.color};
        white-space:nowrap;
      ">${eje.nombre}</th>`
    }).join('')

    const theadContentRow = ejesPresentes.flatMap(eje =>
      contenidos.filter(c => c.eje === eje.id).map(c => {
        const saberC = SABER_COLORS[c.saberTipo]
        return `<th style="
          padding:6px 3px;font-size:10px;text-align:center;color:var(--text-muted);
          min-width:56px;max-width:56px;word-break:break-word;line-height:1.3;
          border-bottom:none;background:transparent;
        " title="${c.nombre} — ${SABER_LABELS[c.saberTipo]}">
          <div style="
            display:inline-block;padding:1px 5px;border-radius:3px;margin-bottom:3px;
            background:${saberC.bg};color:${saberC.color};font-size:9px;font-weight:700;
          ">${c.saberTipo.slice(0, 3)}</div>
          <div>${c.id}</div>
        </th>`
      })
    ).join('')

    // Build rows
    const tbodyRows = students.map(est => {
      const cells = []
      let rowScores = []

      ejesPresentes.forEach(eje => {
        const ejeCols = contenidos.filter(c => c.eje === eje.id)
        const ejeScores = []

        ejeCols.forEach(c => {
          const hist   = getScoreHistory(est.id, c.id)
          const score  = hist.length ? hist[hist.length - 1] : null
          const indic  = cellIndicator(hist)
          ejeScores.push(score)
          rowScores.push(score)

          const bg   = score !== null ? SCORE_COLORS[score] : '#f3f4f6'
          const text = score !== null ? SCORE_TEXT[score]   : '#9ca3af'
          cells.push(`<td style="padding:3px;text-align:center" title="${c.nombre}: ${score !== null ? SCORE_LABELS[score] : 'Sin datos'}">
            <div style="
              background:${bg};color:${text};
              width:52px;height:30px;border-radius:4px;
              display:flex;align-items:center;justify-content:center;gap:1px;
              font-size:11px;font-weight:700;margin:0 auto;cursor:default;
            ">${score ?? '—'}${indic}</div>
          </td>`)
        })

        // Cluster detection: if all eje scores ≤2 and eje has ≥3 cols
        const allLow = ejeScores.filter(s => s !== null).length >= 3 &&
                       ejeScores.filter(s => s !== null).every(s => s <= 2)
        if (allLow) {
          // wrap the last N cells in a highlight — we mark via a wrapper class (CSS only approach)
          // We'll inject a visual separator cell instead
          cells[cells.length - ejeCols.length] = cells[cells.length - ejeCols.length]
            .replace('border-radius:4px', 'border-radius:4px;outline:2px solid #ef4444')
        }
      })

      const avg = rowAvg(rowScores)
      const avgDisplay = avg !== null ? avg.toFixed(1) : '—'

      return `
        <tr>
          <td style="padding:8px 12px;font-weight:500;white-space:nowrap;min-width:150px">${est.nombre}</td>
          <td style="padding:4px 8px;text-align:center;color:var(--text-muted);white-space:nowrap;font-size:12px">${est.seccion}</td>
          ${cells.join('')}
          <td style="padding:8px 10px;text-align:center">
            <div style="
              background:${avgColor(avg)};color:${avgTextColor(avg)};
              padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;
              display:inline-block;white-space:nowrap;
            ">${avgDisplay}</div>
          </td>
        </tr>`
    }).join('')

    // Column averages row
    const colAvgCells = ejesPresentes.flatMap(eje =>
      contenidos.filter(c => c.eje === eje.id).map(c => {
        const scores = students
          .map(e => { const h = getScoreHistory(e.id, c.id); return h.length ? h[h.length - 1] : null })
          .filter(s => s !== null)
        const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null
        const display = avg !== null ? avg.toFixed(1) : '—'
        return `<td style="padding:6px 3px;text-align:center;background:var(--bg)">
          <div style="
            background:${avgColor(avg)};color:${avgTextColor(avg)};
            width:52px;height:24px;border-radius:4px;
            display:flex;align-items:center;justify-content:center;
            font-size:10px;font-weight:700;margin:0 auto;
          ">${display}</div>
        </td>`
      })
    ).join('')

    hm.innerHTML = `
      <table style="border-collapse:separate;border-spacing:2px;font-size:12px;width:100%">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px 12px;background:transparent;border-bottom:none">Estudiante</th>
            <th style="padding:4px 8px;background:transparent;border-bottom:none;color:var(--text-muted);font-size:11px">Sección</th>
            ${theadEjeRow}
            <th style="padding:8px 10px;background:transparent;border-bottom:none;font-size:11px;text-align:center;color:var(--text-muted)">Prom.</th>
          </tr>
          <tr>
            <th style="background:transparent;border-bottom:none"></th>
            <th style="background:transparent;border-bottom:none"></th>
            ${theadContentRow}
            <th style="background:transparent;border-bottom:none"></th>
          </tr>
        </thead>
        <tbody>
          ${tbodyRows}
          <tr style="background:var(--bg)">
            <td colspan="2" style="padding:6px 12px;font-size:11px;font-weight:700;color:var(--text-muted)">Promedio del grupo</td>
            ${colAvgCells}
            <td></td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top:14px;font-size:11px;color:var(--text-muted)">
        * Periodos evaluados: ${PERIODOS.join(' · ')} · Las celdas muestran el último trimestre disponible.
      </div>
    `
  }

  // ── events ─────────────────────────────────────────────────────────────────
  schoolSel.addEventListener('change', () => { updateSections(); renderHeatmap() })
  sectionSel.addEventListener('change', renderHeatmap)
  gradoSel.addEventListener('change', renderHeatmap)
  ejeSel.addEventListener('change', renderHeatmap)
  saberSel.addEventListener('change', renderHeatmap)
  searchInput.addEventListener('input', renderHeatmap)

  container.querySelector('#vz-clear').addEventListener('click', () => {
    schoolSel.value = ''
    sectionSel.value = ''
    gradoSel.value = ''
    ejeSel.value = ''
    saberSel.value = ''
    searchInput.value = ''
    updateSections()
    renderHeatmap()
  })

  // Pre-fill from navigation params (e.g. alert click → visualizaciones)
  if (params.estudiante) {
    searchInput.value = params.estudiante
  }

  updateSections()
  renderHeatmap()
}
