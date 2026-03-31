/**
 * Alertas Tempranas (Enfoque Pedagógico)
 *
 * Displays 4 types of pedagogically-grounded alerts derived from
 * propuesta-contenidos-espanol.md:
 *
 *   REGRESIÓN        — score dropped between last two periods (same student, same content)
 *   ESTANCAMIENTO    — same low score (≤2) across all 3 periods, no improvement
 *   DESEQUILIBRIO    — avg conceptual vs. actitudinal gap ≥1.5 points
 *   DESFASE DE CICLO — student's grade > content grade AND score ≤2 (prerequisite not mastered)
 *
 * All content items reference real topics from the Excel.
 */

import {
  generarTodasLasAlertas,
  EJES, ESTUDIANTES,
  SABER_LABELS, SABER_COLORS,
  SCORE_COLORS, SCORE_LABELS,
  TIPO_ALERT_META, RIESGO_COLORS,
  getEje,
} from '../pedagogicaData.js'

// ─── helpers ─────────────────────────────────────────────────────────────────

function saberBadge(saberTipo) {
  const c = SABER_COLORS[saberTipo] || {}
  return `<span style="
    display:inline-block;padding:1px 7px;border-radius:20px;font-size:10px;font-weight:700;
    letter-spacing:.04em;text-transform:uppercase;
    background:${c.bg};color:${c.color};border:1px solid ${c.border};
  ">${SABER_LABELS[saberTipo] || saberTipo}</span>`
}

function tipoBadge(tipo) {
  const m = TIPO_ALERT_META[tipo]
  if (!m) return ''
  return `<span style="
    display:inline-flex;align-items:center;gap:4px;
    padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;
    background:${m.badgeBg};color:${m.badgeColor};
  ">${m.icon} ${m.label}</span>`
}

function riesgoBadge(nivel) {
  const label = { ALTA: 'Alto', MEDIA: 'Medio', BAJA: 'Bajo' }[nivel] || nivel
  return `<span class="badge ${RIESGO_COLORS[nivel]?.badge || 'badge-gray'}">${label} riesgo</span>`
}

/** Sparkline: 3 dots showing score history */
function sparkline(hist) {
  return `<div style="display:flex;align-items:center;gap:3px">
    ${hist.map((s, i) => `
      <div style="text-align:center">
        <div style="
          width:22px;height:22px;border-radius:4px;
          background:${SCORE_COLORS[s]};color:${s === 3 ? '#78350f' : '#fff'};
          font-size:10px;font-weight:700;
          display:flex;align-items:center;justify-content:center;
        ">${s}</div>
        <div style="font-size:9px;color:var(--text-muted);margin-top:2px">C${i + 1}</div>
      </div>
      ${i < hist.length - 1 ? '<div style="font-size:10px;color:var(--text-muted)">→</div>' : ''}
    `).join('')}
  </div>`
}

function verEnMapa(nombre) {
  return `<button class="btn btn-secondary btn-sm" style="margin-top:10px;font-size:11px" data-nav-estudiante="${nombre}">
    🔍 Ver en mapa de calor
  </button>`
}

// ─── card renderers ──────────────────────────────────────────────────────────

function cardRegresion(a) {
  const s = RIESGO_COLORS[a.riesgo]
  const eje = getEje(a.ejeId)
  return `
    <div class="ped-alert-card" style="border-left-color:${s.border};background:${s.bg}">
      <div class="ped-alert-header">
        <div>
          <div class="ped-alert-student">${a.nombre}</div>
          <div class="ped-alert-meta">Sección ${a.seccion} · ${a.fecha}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:5px;align-items:flex-end">
          ${tipoBadge(a.tipo)}
          ${riesgoBadge(a.riesgo)}
        </div>
      </div>
      <div class="ped-alert-body">
        <div class="ped-alert-topic">
          <span style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em">Contenido</span>
          <div style="font-weight:600;font-size:13px;margin-top:2px">${a.contenidoNombre}</div>
          <div style="margin-top:4px;display:flex;gap:6px;flex-wrap:wrap">
            ${saberBadge(a.saberTipo)}
            ${eje ? `<span style="font-size:10px;color:${eje.color};font-weight:600;border:1px solid ${eje.color};padding:1px 7px;border-radius:20px">${eje.nombre}</span>` : ''}
          </div>
        </div>
        <div class="ped-alert-scores">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">Evolución por ciclo</div>
          ${sparkline(a.historial)}
          <div style="margin-top:6px;font-size:12px;color:#ef4444;font-weight:600">
            ↘ Descenso de ${a.scoreEsperado} → ${a.scoreActual}
            (${SCORE_LABELS[a.scoreEsperado]} → ${SCORE_LABELS[a.scoreActual]})
          </div>
        </div>
      </div>
      <div class="ped-alert-action">
        <span style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em">Acción sugerida</span>
        <div style="margin-top:4px;font-size:13px;color:#374151">${a.accion}</div>
        ${verEnMapa(a.nombre)}
      </div>
    </div>`
}

function cardEstancamiento(a) {
  const s = RIESGO_COLORS[a.riesgo]
  const eje = getEje(a.ejeId)
  return `
    <div class="ped-alert-card" style="border-left-color:${s.border};background:${s.bg}">
      <div class="ped-alert-header">
        <div>
          <div class="ped-alert-student">${a.nombre}</div>
          <div class="ped-alert-meta">Sección ${a.seccion} · ${a.fecha}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:5px;align-items:flex-end">
          ${tipoBadge(a.tipo)}
          ${riesgoBadge(a.riesgo)}
        </div>
      </div>
      <div class="ped-alert-body">
        <div class="ped-alert-topic">
          <span style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em">Contenido</span>
          <div style="font-weight:600;font-size:13px;margin-top:2px">${a.contenidoNombre}</div>
          <div style="margin-top:4px;display:flex;gap:6px;flex-wrap:wrap">
            ${saberBadge(a.saberTipo)}
            ${eje ? `<span style="font-size:10px;color:${eje.color};font-weight:600;border:1px solid ${eje.color};padding:1px 7px;border-radius:20px">${eje.nombre}</span>` : ''}
          </div>
        </div>
        <div class="ped-alert-scores">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">Evolución por ciclo</div>
          ${sparkline(a.historial)}
          <div style="margin-top:6px;font-size:12px;color:#d97706;font-weight:600">
            ⇄ Promedio ${a.promedio} durante los ciclos — sin mejora detectada
          </div>
        </div>
      </div>
      <div class="ped-alert-action">
        <span style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em">Acción sugerida</span>
        <div style="margin-top:4px;font-size:13px;color:#374151">${a.accion}</div>
        ${verEnMapa(a.nombre)}
      </div>
    </div>`
}

function cardDesequilibrio(a) {
  const s = RIESGO_COLORS[a.riesgo]
  const tiposOrden = ['CONCEPTUAL', 'PROCEDIMENTAL', 'ACTITUDINAL']
  return `
    <div class="ped-alert-card" style="border-left-color:#7c3aed;background:#faf5ff">
      <div class="ped-alert-header">
        <div>
          <div class="ped-alert-student">${a.nombre}</div>
          <div class="ped-alert-meta">Sección ${a.seccion} · ${a.fecha}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:5px;align-items:flex-end">
          ${tipoBadge(a.tipo)}
          ${riesgoBadge(a.riesgo)}
        </div>
      </div>
      <div class="ped-alert-body">
        <div class="ped-alert-topic">
          <span style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em">Tipo de desequilibrio</span>
          <div style="margin-top:6px;display:flex;flex-direction:column;gap:6px">
            ${tiposOrden.filter(t => a.avgs[t] !== undefined).map(t => {
              const pct = (a.avgs[t] / 4 * 100).toFixed(0)
              const c = SABER_COLORS[t]
              return `
                <div>
                  <div style="display:flex;justify-content:space-between;margin-bottom:3px">
                    <span style="font-size:12px;font-weight:600">${SABER_LABELS[t]}</span>
                    <span style="font-size:12px;font-weight:700;color:${c.color}">${Number(a.avgs[t]).toFixed(1)}</span>
                  </div>
                  <div style="background:#f3f4f6;border-radius:3px;height:8px;overflow:hidden">
                    <div style="background:${c.color};width:${pct}%;height:100%;border-radius:3px"></div>
                  </div>
                </div>`
            }).join('')}
          </div>
          <div style="margin-top:8px;font-size:12px;font-weight:600;color:#7c3aed">
            ⚖ Diferencia de ${a.diferencia} puntos entre ${SABER_LABELS[a.saberFuerte]} y ${SABER_LABELS[a.saberDebil]}
          </div>
        </div>
      </div>
      <div class="ped-alert-action">
        <span style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em">Acción sugerida</span>
        <div style="margin-top:4px;font-size:13px;color:#374151">${a.accion}</div>
        ${verEnMapa(a.nombre)}
      </div>
    </div>`
}

function cardDesfase(a) {
  const eje = getEje(a.ejeId)
  return `
    <div class="ped-alert-card" style="border-left-color:#ef4444;background:#fff5f5">
      <div class="ped-alert-header">
        <div>
          <div class="ped-alert-student">${a.nombre}</div>
          <div class="ped-alert-meta">Sección ${a.seccion} · ${a.fecha}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:5px;align-items:flex-end">
          ${tipoBadge(a.tipo)}
          ${riesgoBadge(a.riesgo)}
        </div>
      </div>
      <div class="ped-alert-body">
        <div class="ped-alert-topic">
          <span style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em">Contenido prerequisito no dominado</span>
          <div style="font-weight:600;font-size:13px;margin-top:2px">${a.contenidoNombre}</div>
          <div style="margin-top:4px;display:flex;gap:6px;flex-wrap:wrap">
            ${saberBadge(a.saberTipo)}
            ${eje ? `<span style="font-size:10px;color:${eje.color};font-weight:600;border:1px solid ${eje.color};padding:1px 7px;border-radius:20px">${eje.nombre}</span>` : ''}
          </div>
        </div>
        <div class="ped-alert-scores">
          <div style="margin-top:4px;font-size:12px;color:#ef4444;font-weight:600">
            ⚠ Estudiante en ${a.gradoEstudiante}.° grado con puntuación ${a.scoreActual} (${SCORE_LABELS[a.scoreActual]}) en contenido de ${a.gradoContenido}.° grado
          </div>
          <div style="margin-top:8px">
            ${sparkline(a.historial)}
          </div>
        </div>
      </div>
      <div class="ped-alert-action">
        <span style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em">Acción sugerida</span>
        <div style="margin-top:4px;font-size:13px;color:#374151">${a.accion}</div>
        ${verEnMapa(a.nombre)}
      </div>
    </div>`
}

function renderCard(a) {
  if (a.tipo === 'REGRESION')     return cardRegresion(a)
  if (a.tipo === 'ESTANCAMIENTO') return cardEstancamiento(a)
  if (a.tipo === 'DESEQUILIBRIO') return cardDesequilibrio(a)
  if (a.tipo === 'DESFASE_CICLO') return cardDesfase(a)
  return ''
}

// ─── main render ─────────────────────────────────────────────────────────────

export function renderAlertasTempranas(container) {
  const todasAlertas = generarTodasLasAlertas()
  const secciones = [...new Set(ESTUDIANTES.map(e => e.seccion))].sort()
  const ejes      = EJES.map(e => ({ id: e.id, nombre: e.nombre }))

  container.innerHTML = `
    <h1>Alertas Tempranas — Enfoque Pedagógico</h1>
    <p class="page-desc">
      Alertas generadas a partir del modelo curricular del MEP (Español, I y II Ciclo).
      Los contenidos referenciados provienen directamente de la estructura definida en la propuesta pedagógica.
    </p>

    <!-- Summary row: 4 alert types -->
    <div class="ped-summary-grid">
      <div class="ped-sum-card" style="border-top-color:#ef4444" data-filter-tipo="REGRESION">
        <div class="ped-sum-icon" style="color:#ef4444">↘</div>
        <div class="ped-sum-count" id="cnt-reg" style="color:#ef4444">0</div>
        <div class="ped-sum-label">Regresión</div>
        <div class="ped-sum-sub">Puntaje cayó entre trimestres</div>
      </div>
      <div class="ped-sum-card" style="border-top-color:#d97706" data-filter-tipo="ESTANCAMIENTO">
        <div class="ped-sum-icon" style="color:#d97706">⇄</div>
        <div class="ped-sum-count" id="cnt-est" style="color:#d97706">0</div>
        <div class="ped-sum-label">Estancamiento</div>
        <div class="ped-sum-sub">Puntaje bajo sin mejora</div>
      </div>
      <div class="ped-sum-card" style="border-top-color:#7c3aed" data-filter-tipo="DESEQUILIBRIO">
        <div class="ped-sum-icon" style="color:#7c3aed">⚖</div>
        <div class="ped-sum-count" id="cnt-deseq" style="color:#7c3aed">0</div>
        <div class="ped-sum-label">Desequilibrio</div>
        <div class="ped-sum-sub">Brecha entre tipos de saber</div>
      </div>
      <div class="ped-sum-card" style="border-top-color:#dc2626" data-filter-tipo="DESFASE_CICLO">
        <div class="ped-sum-icon" style="color:#dc2626">⚠</div>
        <div class="ped-sum-count" id="cnt-ciclo" style="color:#dc2626">0</div>
        <div class="ped-sum-label">Desfase de ciclo</div>
        <div class="ped-sum-sub">Prerequisito no dominado</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card">
      <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end">
        <div class="form-group" style="min-width:130px">
          <label>Tipo de alerta</label>
          <select id="f-tipo">
            <option value="">Todas</option>
            <option value="REGRESION">Regresión</option>
            <option value="ESTANCAMIENTO">Estancamiento</option>
            <option value="DESEQUILIBRIO">Desequilibrio</option>
            <option value="DESFASE_CICLO">Desfase de ciclo</option>
          </select>
        </div>
        <div class="form-group" style="min-width:120px">
          <label>Sección</label>
          <select id="f-seccion">
            <option value="">Todas</option>
            ${secciones.map(s => `<option value="${s}">${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="min-width:130px">
          <label>Riesgo</label>
          <select id="f-riesgo">
            <option value="">Todos</option>
            <option value="ALTA">Alto</option>
            <option value="MEDIA">Medio</option>
          </select>
        </div>
        <div class="form-group" style="min-width:180px">
          <label>Eje temático</label>
          <select id="f-eje">
            <option value="">Todos</option>
            ${ejes.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="min-width:140px">
          <label>Tipo de saber</label>
          <select id="f-saber">
            <option value="">Todos</option>
            <option value="CONCEPTUAL">Conceptual</option>
            <option value="PROCEDIMENTAL">Procedimental</option>
            <option value="ACTITUDINAL">Actitudinal</option>
          </select>
        </div>
        <button class="btn btn-secondary btn-sm" id="f-clear">Limpiar</button>
      </div>
    </div>

    <!-- Alert list -->
    <div id="alert-count-label" style="font-size:13px;color:var(--text-muted);margin-bottom:12px"></div>
    <div id="alerts-list"></div>
  `

  // ── update summary counts ──────────────────────────────────────────────────
  container.querySelector('#cnt-reg').textContent   = todasAlertas.filter(a => a.tipo === 'REGRESION').length
  container.querySelector('#cnt-est').textContent   = todasAlertas.filter(a => a.tipo === 'ESTANCAMIENTO').length
  container.querySelector('#cnt-deseq').textContent = todasAlertas.filter(a => a.tipo === 'DESEQUILIBRIO').length
  container.querySelector('#cnt-ciclo').textContent = todasAlertas.filter(a => a.tipo === 'DESFASE_CICLO').length

  // ── clickable summary cards filter ────────────────────────────────────────
  container.querySelectorAll('[data-filter-tipo]').forEach(card => {
    card.style.cursor = 'pointer'
    card.addEventListener('click', () => {
      const sel = container.querySelector('#f-tipo')
      const val = card.dataset.filterTipo
      sel.value = sel.value === val ? '' : val
      renderList()
    })
  })

  // ── filter + render ────────────────────────────────────────────────────────
  function renderList() {
    const tipo    = container.querySelector('#f-tipo').value
    const seccion = container.querySelector('#f-seccion').value
    const riesgo  = container.querySelector('#f-riesgo').value
    const ejeId   = container.querySelector('#f-eje').value
    const saber   = container.querySelector('#f-saber').value

    const filtered = todasAlertas.filter(a =>
      (!tipo    || a.tipo    === tipo)    &&
      (!seccion || a.seccion === seccion) &&
      (!riesgo  || a.riesgo  === riesgo)  &&
      (!ejeId   || a.ejeId   === ejeId)   &&
      (!saber   || a.saberTipo === saber)
    )

    const countLabel = container.querySelector('#alert-count-label')
    countLabel.textContent = filtered.length
      ? `Mostrando ${filtered.length} alerta${filtered.length !== 1 ? 's' : ''}`
      : ''

    const list = container.querySelector('#alerts-list')
    if (!filtered.length) {
      list.innerHTML = '<p class="empty">No se encontraron alertas con los filtros aplicados.</p>'
      return
    }
    list.innerHTML = filtered.map(renderCard).join('')
  }

  // ── events ─────────────────────────────────────────────────────────────────
  ;['#f-tipo','#f-seccion','#f-riesgo','#f-eje','#f-saber'].forEach(sel => {
    container.querySelector(sel).addEventListener('change', renderList)
  })
  container.querySelector('#f-clear').addEventListener('click', () => {
    ;['#f-tipo','#f-seccion','#f-riesgo','#f-eje','#f-saber'].forEach(sel => {
      container.querySelector(sel).value = ''
    })
    renderList()
  })

  renderList()

  // ── navigate to heatmap on button click ───────────────────────────────────
  container.querySelector('#alerts-list').addEventListener('click', e => {
    const btn = e.target.closest('[data-nav-estudiante]')
    if (!btn) return
    window.dispatchEvent(new CustomEvent('atara:navigate', {
      detail: { page: 'visualizaciones', params: { estudiante: btn.dataset.navEstudiante } }
    }))
  })
}
