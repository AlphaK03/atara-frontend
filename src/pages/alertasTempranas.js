/**
 * Alertas Tempranas — datos reales de la API
 *
 * - Sin sección seleccionada → alertas de todas las secciones del periodo
 * - Tarjetas colapsables por estudiante, agrupadas por tipo de saber
 * - Clic en el nombre del estudiante → navega a Visualizaciones
 */

import {
  getAnioLectivoActivo,
  getPeriodos,
  getSecciones,
  getAlertasTematicasSeccion,
  generarAlertasTematicasSeccion,
} from '../api.js'

const NIVEL = {
  ALTA:  { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5', icon: '🔴' },
  MEDIA: { bg: '#fef9c3', color: '#ca8a04', border: '#fde047', icon: '🟡' },
}

const TIPO_META = {
  'Saber Conceptual':    { icon: '🧠', short: 'Conceptual',    color: '#7c3aed', bg: '#faf5ff', border: '#ddd6fe' },
  'Saber Procedimental': { icon: '⚙️', short: 'Procedimental', color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
  'Saber Actitudinal':   { icon: '🌱', short: 'Actitudinal',   color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
}

// fallback para nombres de tipo que no estén en el meta
function tipoMeta(nombre) {
  return TIPO_META[nombre] || { icon: '📋', short: nombre, color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' }
}

// ─── render principal ─────────────────────────────────────────────────────────
export async function renderAlertasTempranas(container) {
  container.innerHTML = `
    <h1>Alertas Tempranas</h1>
    <p class="page-desc">
      Alertas pedagógicas por eje temático.
      <strong>🔴 Alta</strong> = promedio ≤ 2.0 ·
      <strong>🟡 Media</strong> = promedio 2.1–3.0 ·
      Haz clic en el nombre del estudiante para ver su mapa de calor.
    </p>

    <div class="card" style="margin-bottom:20px">
      <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end">
        <div class="form-group" style="min-width:170px;margin-bottom:0">
          <label>Periodo</label>
          <select id="sel-periodo" disabled><option value="">Cargando…</option></select>
        </div>
        <div class="form-group" style="min-width:190px;margin-bottom:0">
          <label>Sección <span style="font-size:11px;color:var(--text-muted)">(opcional)</span></label>
          <select id="sel-seccion" disabled><option value="">Todas las secciones</option></select>
        </div>
        <div class="form-group" style="min-width:120px;margin-bottom:0">
          <label>Nivel</label>
          <select id="f-nivel" disabled>
            <option value="">Todos</option>
            <option value="ALTA">Alta</option>
            <option value="MEDIA">Media</option>
          </select>
        </div>
        <div class="form-group" style="min-width:130px;margin-bottom:0">
          <label>Tipo de saber</label>
          <select id="f-saber" disabled><option value="">Todos</option></select>
        </div>
        <div class="form-group" style="flex:1;min-width:150px;margin-bottom:0">
          <label>Buscar estudiante</label>
          <input type="text" id="f-nombre" placeholder="Nombre…" disabled>
        </div>
        <button class="btn btn-secondary btn-sm" id="f-clear"     style="height:36px" disabled>Limpiar</button>
        <button class="btn btn-primary   btn-sm" id="btn-generar" style="height:36px" disabled>🔄 Regenerar</button>
      </div>
    </div>

    <div id="resumen-strip" style="display:none;gap:10px;flex-wrap:wrap;margin-bottom:16px"></div>
    <div id="alerta-count" style="font-size:13px;color:var(--text-muted);margin-bottom:10px"></div>
    <div id="alertas-body"></div>
  `

  const selPeriodo   = container.querySelector('#sel-periodo')
  const selSeccion   = container.querySelector('#sel-seccion')
  const selNivel     = container.querySelector('#f-nivel')
  const selSaber     = container.querySelector('#f-saber')
  const inputNombre  = container.querySelector('#f-nombre')
  const btnClear     = container.querySelector('#f-clear')
  const btnGenerar   = container.querySelector('#btn-generar')
  const resumenStrip = container.querySelector('#resumen-strip')
  const body         = container.querySelector('#alertas-body')
  const countEl      = container.querySelector('#alerta-count')

  let periodos  = []
  let secciones = []
  let alertas   = []
  const expandidos = new Set()   // IDs de estudiantes con tarjeta abierta

  // ── Catálogos ───────────────────────────────────────────────────────────────
  try {
    const anio = await getAnioLectivoActivo()
    ;[periodos, secciones] = await Promise.all([
      getPeriodos(anio.id),
      getSecciones(anio.id),
    ])
    selPeriodo.innerHTML = '<option value="">— Seleccione un periodo —</option>' +
      periodos.map(p => `<option value="${p.id}">${p.nombre}${p.activo ? ' ★' : ''}</option>`).join('')
    selPeriodo.disabled = false

    selSeccion.innerHTML = '<option value="">Todas las secciones</option>' +
      secciones.map(s =>
        `<option value="${s.id}">${s.nombre}${s.nivelGrado ? ` (${s.nivelGrado}°)` : ''}${s.docenteNombreCompleto ? ' — ' + s.docenteNombreCompleto : ''}</option>`
      ).join('')
    selSeccion.disabled = false

    const activo = periodos.find(p => p.activo)
    if (activo) { selPeriodo.value = activo.id; cargarAlertas() }
  } catch (e) {
    body.innerHTML = `<div class="card" style="color:#dc2626">Error: ${e.message}</div>`
    return
  }

  // ── Eventos ─────────────────────────────────────────────────────────────────
  selPeriodo.addEventListener('change', () => {
    resetFiltros(); expandidos.clear()
    if (selPeriodo.value) cargarAlertas()
    else { alertas = []; renderLista(); resumenStrip.style.display = 'none' }
  })
  selSeccion.addEventListener('change', () => {
    resetFiltros(); expandidos.clear()
    if (selPeriodo.value) cargarAlertas()
  })
  ;['#f-nivel','#f-saber'].forEach(id =>
    container.querySelector(id).addEventListener('change', renderLista)
  )
  inputNombre.addEventListener('input', renderLista)
  btnClear.addEventListener('click', () => { resetFiltros(); renderLista() })

  btnGenerar.addEventListener('click', async () => {
    const seccionId = Number(selSeccion.value) || null
    const periodoId = Number(selPeriodo.value)
    if (!periodoId) return
    btnGenerar.disabled = true; btnGenerar.textContent = '⏳ Generando…'
    try {
      if (seccionId) {
        alertas = (await generarAlertasTematicasSeccion(seccionId, periodoId))
          .map(a => ({ ...a, _seccionId: seccionId }))
      } else {
        const res = await Promise.all(
          secciones.map(s =>
            generarAlertasTematicasSeccion(s.id, periodoId)
              .then(arr => arr.map(a => ({ ...a, _seccionId: s.id })))
              .catch(() => [])
          )
        )
        alertas = res.flat()
      }
      poblarFiltroSaber(); actualizarResumen(); renderLista()
    } catch (e) { alert(`Error al regenerar: ${e.message}`) }
    finally { btnGenerar.disabled = false; btnGenerar.textContent = '🔄 Regenerar' }
  })

  // Delegación: expand/collapse y navegación a visualizaciones
  body.addEventListener('click', e => {
    const navBtn = e.target.closest('[data-nav-viz]')
    if (navBtn) {
      e.stopPropagation()
      const estId  = Number(navBtn.dataset.navViz)
      const ref    = alertas.find(a => a.estudianteId === estId)
      window.dispatchEvent(new CustomEvent('atara:navigate', {
        detail: {
          page: 'visualizaciones',
          params: {
            periodoId:        ref?.periodoId,
            seccionId:        ref?._seccionId,
            estudianteNombre: ref?.estudianteNombreCompleto,
          },
        },
      }))
      return
    }
    const toggle = e.target.closest('[data-toggle-est]')
    if (toggle) {
      const id = Number(toggle.dataset.toggleEst)
      if (expandidos.has(id)) expandidos.delete(id)
      else expandidos.add(id)
      renderLista()
    }
  })

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function setControles(on) {
    selNivel.disabled = !on; selSaber.disabled = !on
    inputNombre.disabled = !on; btnClear.disabled = !on
    btnGenerar.disabled = !on || !selPeriodo.value
  }
  function resetFiltros() {
    selNivel.value = ''; selSaber.value = ''; inputNombre.value = ''
  }
  function poblarFiltroSaber() {
    const tipos = [...new Set(alertas.map(a => a.tipoSaberNombre))].sort()
    selSaber.innerHTML = '<option value="">Todos</option>' +
      tipos.map(t => `<option value="${t}">${t}</option>`).join('')
  }

  // ── Carga ────────────────────────────────────────────────────────────────────
  async function cargarAlertas() {
    const periodoId = Number(selPeriodo.value)
    const seccionId = Number(selSeccion.value) || null
    if (!periodoId) return
    body.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted)">⏳ Cargando alertas…</div>`
    setControles(false)
    try {
      if (seccionId) {
        alertas = (await getAlertasTematicasSeccion(seccionId, periodoId))
          .map(a => ({ ...a, _seccionId: seccionId }))
      } else {
        const res = await Promise.all(
          secciones.map(s =>
            getAlertasTematicasSeccion(s.id, periodoId)
              .then(arr => arr.map(a => ({ ...a, _seccionId: s.id })))
              .catch(() => [])
          )
        )
        alertas = res.flat()
      }
      poblarFiltroSaber(); setControles(true); actualizarResumen(); renderLista()
    } catch (e) {
      body.innerHTML = `<div class="card" style="color:#dc2626">Error: ${e.message}</div>`
    }
  }

  function actualizarResumen() {
    const nAlta  = alertas.filter(a => a.nivelAlerta === 'ALTA').length
    const nMedia = alertas.filter(a => a.nivelAlerta === 'MEDIA').length
    const nEst   = new Set(alertas.map(a => a.estudianteId)).size
    resumenStrip.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px'
    resumenStrip.innerHTML = [
      { val: nAlta,          label: 'Alertas altas',        col: '#dc2626',        bg: '#fee2e2', nivel: 'ALTA'  },
      { val: nMedia,         label: 'Alertas medias',       col: '#ca8a04',        bg: '#fef9c3', nivel: 'MEDIA' },
      { val: nEst,           label: 'Estudiantes afectados',col: '#6366f1',        bg: '#ede9fe', nivel: null    },
      { val: alertas.length, label: 'Total alertas',        col: 'var(--primary)', bg: '#eff6ff', nivel: null    },
    ].map(({ val, label, col, bg, nivel }) => `
      <div data-rnivel="${nivel || ''}" style="
        flex:1;min-width:110px;padding:10px 14px;border-radius:10px;
        background:${bg};border:1px solid ${col}25;${nivel ? 'cursor:pointer' : ''}
      ">
        <div style="font-size:24px;font-weight:900;color:${col};line-height:1">${val}</div>
        <div style="font-size:11px;color:${col};font-weight:600;margin-top:2px">${label}</div>
      </div>`).join('')
    resumenStrip.querySelectorAll('[data-rnivel]').forEach(el => {
      const n = el.dataset.rnivel; if (!n) return
      el.addEventListener('click', () => { selNivel.value = selNivel.value === n ? '' : n; renderLista() })
    })
  }

  // ── Lista filtrada ───────────────────────────────────────────────────────────
  function renderLista() {
    const nivel  = selNivel.value
    const saber  = selSaber.value
    const nombre = inputNombre.value.trim().toLowerCase()

    const filtered = alertas.filter(a =>
      (!nivel  || a.nivelAlerta     === nivel) &&
      (!saber  || a.tipoSaberNombre === saber) &&
      (!nombre || a.estudianteNombreCompleto.toLowerCase().includes(nombre))
    )

    countEl.textContent = filtered.length
      ? `Mostrando ${filtered.length} alerta${filtered.length !== 1 ? 's' : ''}`
      : ''

    if (!filtered.length) {
      body.innerHTML = alertas.length
        ? '<p class="empty">No hay alertas con los filtros aplicados.</p>'
        : `<div class="card" style="text-align:center;padding:40px 20px;color:var(--text-muted)">
            <div style="font-size:36px;margin-bottom:8px">✅</div>
            <div style="font-size:15px;font-weight:600;margin-bottom:4px">Sin alertas registradas</div>
            <div style="font-size:13px">
              No hay alertas para el periodo seleccionado.<br>
              Use <strong>Regenerar</strong> para calcularlas a partir de las evaluaciones.
            </div>
          </div>`
      return
    }

    // Agrupar por estudiante
    const porEst = new Map()
    filtered.forEach(a => {
      if (!porEst.has(a.estudianteId))
        porEst.set(a.estudianteId, { id: a.estudianteId, nombre: a.estudianteNombreCompleto, alertas: [] })
      porEst.get(a.estudianteId).alertas.push(a)
    })

    const sorted = [...porEst.values()].sort((x, y) => {
      const xA = x.alertas.some(a => a.nivelAlerta === 'ALTA') ? 0 : 1
      const yA = y.alertas.some(a => a.nivelAlerta === 'ALTA') ? 0 : 1
      return xA - yA || x.nombre.localeCompare(y.nombre)
    })

    body.innerHTML = sorted.map(est => renderTarjeta(est)).join('')
  }

  // ── Tarjeta por estudiante ───────────────────────────────────────────────────
  function renderTarjeta(est) {
    const abierta   = expandidos.has(est.id)
    const tieneAlta = est.alertas.some(a => a.nivelAlerta === 'ALTA')
    const nAlta     = est.alertas.filter(a => a.nivelAlerta === 'ALTA').length
    const nMedia    = est.alertas.filter(a => a.nivelAlerta === 'MEDIA').length

    // Agrupar por tipo de saber
    const porTipo = new Map()
    est.alertas.forEach(a => {
      if (!porTipo.has(a.tipoSaberNombre)) porTipo.set(a.tipoSaberNombre, [])
      porTipo.get(a.tipoSaberNombre).push(a)
    })

    // Chips de tipo de saber para la cabecera
    const tipoChips = [...porTipo.entries()].map(([tipo, lista]) => {
      const m     = tipoMeta(tipo)
      const nA    = lista.filter(a => a.nivelAlerta === 'ALTA').length
      const nM    = lista.filter(a => a.nivelAlerta === 'MEDIA').length
      const col   = nA > 0 ? '#dc2626' : '#ca8a04'
      const bg    = nA > 0 ? '#fee2e2' : '#fef9c3'
      const bord  = nA > 0 ? '#fca5a5' : '#fde047'
      return `<span style="
        display:inline-flex;align-items:center;gap:4px;
        padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600;
        background:${bg};color:${col};border:1px solid ${bord};white-space:nowrap;
      ">${m.icon} ${m.short}
        ${nA ? `<span style="font-weight:800">🔴${nA}</span>` : ''}
        ${nM ? `<span style="font-weight:800">🟡${nM}</span>` : ''}
      </span>`
    }).join('')

    // Cuerpo expandido: grupos por tipo de saber
    const cuerpo = abierta ? `
      <div style="border-top:1px solid ${tieneAlta ? '#fca5a5' : '#fde047'};padding:14px 16px;display:flex;flex-direction:column;gap:12px">
        ${[...porTipo.entries()].map(([tipo, lista]) => {
          const m = tipoMeta(tipo)
          const filasEje = lista
            .sort((x, y) => (x.nivelAlerta === 'ALTA' ? 0 : 1) - (y.nivelAlerta === 'ALTA' ? 0 : 1))
            .map(a => {
              const n   = NIVEL[a.nivelAlerta] || {}
              const pct = (Number(a.promedio) / 5 * 100).toFixed(0)
              return `
                <div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid #f3f4f6">
                  <span style="
                    width:18px;height:18px;border-radius:50%;flex-shrink:0;
                    background:${n.bg};border:1.5px solid ${n.border};
                    display:flex;align-items:center;justify-content:center;
                    font-size:10px;
                  ">${n.icon}</span>
                  <span style="flex:1;font-size:13px;color:#374151">${a.ejeNombre}</span>
                  <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
                    <div style="width:72px;background:#f3f4f6;border-radius:3px;height:6px;overflow:hidden">
                      <div style="background:${n.color};width:${pct}%;height:100%;border-radius:3px"></div>
                    </div>
                    <span style="font-size:12px;font-weight:700;color:${n.color};width:32px;text-align:right">${Number(a.promedio).toFixed(1)}</span>
                  </div>
                </div>`
            }).join('')
          return `
            <div style="border:1px solid ${m.border};border-radius:8px;overflow:hidden">
              <div style="background:${m.bg};padding:7px 12px;display:flex;align-items:center;gap:6px">
                <span>${m.icon}</span>
                <span style="font-size:12px;font-weight:700;color:${m.color}">${tipo}</span>
                <span style="font-size:11px;color:var(--text-muted);margin-left:4px">${lista.length} alerta${lista.length !== 1 ? 's' : ''}</span>
              </div>
              <div style="padding:0 12px 4px">${filasEje}</div>
            </div>`
        }).join('')}
      </div>` : ''

    const borderColor = tieneAlta ? '#fca5a5' : '#fde047'
    const accentColor = tieneAlta ? '#dc2626' : '#ca8a04'

    return `
      <div style="
        border:1px solid ${borderColor};border-left:4px solid ${accentColor};
        border-radius:10px;margin-bottom:8px;background:#fff;overflow:hidden;
      ">
        <!-- Cabecera siempre visible -->
        <div data-toggle-est="${est.id}" style="
          display:flex;align-items:center;gap:12px;flex-wrap:wrap;
          padding:11px 14px;cursor:pointer;user-select:none;
        ">
          <!-- Nombre clickable → visualizaciones -->
          <span data-nav-viz="${est.id}" title="Ver mapa de calor" style="
            font-size:14px;font-weight:700;color:var(--primary);
            text-decoration:underline;text-underline-offset:2px;
            cursor:pointer;flex-shrink:0;
          ">${est.nombre}</span>

          <!-- Chips de tipo de saber -->
          <div style="display:flex;gap:5px;flex-wrap:wrap;flex:1">
            ${tipoChips}
          </div>

          <!-- Resumen numérico + chevron -->
          <div style="display:flex;align-items:center;gap:10px;flex-shrink:0">
            <span style="font-size:12px;color:var(--text-muted)">
              ${nAlta  ? `<strong style="color:#dc2626">🔴 ${nAlta}</strong>` : ''}
              ${nAlta && nMedia ? ' · ' : ''}
              ${nMedia ? `<strong style="color:#ca8a04">🟡 ${nMedia}</strong>` : ''}
            </span>
            <span style="font-size:16px;color:var(--text-muted);transition:transform .2s;${abierta ? 'transform:rotate(180deg)' : ''}">⌄</span>
          </div>
        </div>

        ${cuerpo}
      </div>`
  }
}
