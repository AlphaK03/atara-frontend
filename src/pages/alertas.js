import { getAlertasByEstudiante, getAlertasBySeccion } from '../api.js'

function nivelBadge(nivel) {
  const map = { ALTA: 'badge-red', MEDIA: 'badge-yellow', BAJA: 'badge-blue' }
  return `<span class="badge ${map[nivel] || 'badge-gray'}">${nivel || '—'}</span>`
}

function estadoBadge(estado) {
  const map = { ACTIVA: 'badge-red', RESUELTA: 'badge-green', IGNORADA: 'badge-gray' }
  return `<span class="badge ${map[estado] || 'badge-gray'}">${estado || '—'}</span>`
}

export async function renderAlertas(container) {
  container.innerHTML = `
    <h1>Alertas</h1>
    <p class="page-desc">Consulta alertas activas por estudiante o por sección. El periodo es opcional.</p>

    <div class="card">
      <h2>Buscar alertas</h2>
      <div style="display:flex;gap:16px;flex-wrap:wrap">

        <div style="flex:1;min-width:240px;padding:16px;border:1px solid var(--border);border-radius:8px">
          <h2 style="margin-top:0;font-size:14px">Por estudiante</h2>
          <div class="form-group" style="margin-bottom:10px">
            <label>ID Estudiante *</label>
            <input type="number" id="student-id" placeholder="Ej: 1" min="1" />
          </div>
          <div class="form-group" style="margin-bottom:12px">
            <label>ID Periodo (opcional)</label>
            <input type="number" id="student-period-id" placeholder="Ej: 1" min="1" />
          </div>
          <button class="btn btn-primary" id="btn-student">Buscar</button>
        </div>

        <div style="flex:1;min-width:240px;padding:16px;border:1px solid var(--border);border-radius:8px">
          <h2 style="margin-top:0;font-size:14px">Por sección</h2>
          <div class="form-group" style="margin-bottom:10px">
            <label>ID Sección *</label>
            <input type="number" id="section-id" placeholder="Ej: 1" min="1" />
          </div>
          <div class="form-group" style="margin-bottom:12px">
            <label>ID Periodo (opcional)</label>
            <input type="number" id="section-period-id" placeholder="Ej: 1" min="1" />
          </div>
          <button class="btn btn-primary" id="btn-section">Buscar</button>
        </div>

      </div>
    </div>

    <div id="results-card" style="display:none" class="card">
      <h2 id="results-title">Resultados</h2>
      <div id="results-msg"></div>
      <div id="summary" style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap"></div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>ID</th><th>Estudiante</th><th>Contenido</th><th>Nivel</th><th>Estado</th><th>Motivo</th><th>Fecha</th></tr>
          </thead>
          <tbody id="results-tbody"></tbody>
        </table>
      </div>
    </div>
  `

  function showResults(title, data) {
    const card   = container.querySelector('#results-card')
    const tbody  = container.querySelector('#results-tbody')
    const msg    = container.querySelector('#results-msg')
    const summary = container.querySelector('#summary')
    container.querySelector('#results-title').textContent = title
    msg.innerHTML = ''
    card.style.display = 'block'

    if (!data.length) {
      summary.innerHTML = ''
      tbody.innerHTML = '<tr><td colspan="7" class="empty">No se encontraron alertas.</td></tr>'
      return
    }

    // Summary counts
    const counts = data.reduce((acc, a) => {
      acc[a.alertLevel] = (acc[a.alertLevel] || 0) + 1
      return acc
    }, {})
    summary.innerHTML = `
      <div style="padding:10px 16px;border-radius:6px;background:#fde8e8;color:#a83232">
        <strong>${counts['ALTA'] || 0}</strong> Alta
      </div>
      <div style="padding:10px 16px;border-radius:6px;background:#fef4dc;color:#7a5a1a">
        <strong>${counts['MEDIA'] || 0}</strong> Media
      </div>
      <div style="padding:10px 16px;border-radius:6px;background:#dceeff;color:#1a4d8a">
        <strong>${counts['BAJA'] || 0}</strong> Baja
      </div>
      <div style="padding:10px 16px;border-radius:6px;background:#ebebeb;color:#555">
        <strong>${data.length}</strong> Total
      </div>
    `

    tbody.innerHTML = data.map(a => `
      <tr>
        <td>${a.id}</td>
        <td>${a.studentName || a.studentId}</td>
        <td>${a.contentName || a.contentId || '—'}</td>
        <td>${nivelBadge(a.alertLevel)}</td>
        <td>${estadoBadge(a.status)}</td>
        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${a.reason || ''}">${a.reason || '—'}</td>
        <td>${a.generatedAt ? a.generatedAt.split('T')[0] : '—'}</td>
      </tr>
    `).join('')
  }

  container.querySelector('#btn-student').addEventListener('click', async () => {
    const id = container.querySelector('#student-id').value
    if (!id) return
    const periodId = container.querySelector('#student-period-id').value || null
    try {
      const data = await getAlertasByEstudiante(id, periodId)
      showResults(`Alertas del estudiante #${id}`, Array.isArray(data) ? data : [])
    } catch (err) {
      container.querySelector('#results-msg').innerHTML = `<div class="alert alert-error">${err.message}</div>`
      container.querySelector('#results-card').style.display = 'block'
    }
  })

  container.querySelector('#btn-section').addEventListener('click', async () => {
    const id = container.querySelector('#section-id').value
    if (!id) return
    const periodId = container.querySelector('#section-period-id').value || null
    try {
      const data = await getAlertasBySeccion(id, periodId)
      showResults(`Alertas de la sección #${id}`, Array.isArray(data) ? data : [])
    } catch (err) {
      container.querySelector('#results-msg').innerHTML = `<div class="alert alert-error">${err.message}</div>`
      container.querySelector('#results-card').style.display = 'block'
    }
  })
}
