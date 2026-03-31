import {
  createEvaluacion, addDetalleEvaluacion,
  getEvaluacion, getEvaluacionesByEstudiante
} from '../api.js'

const ORIGENES = ['MANUAL', 'AUTOMATICO', 'IMPORTACION']

export async function renderEvaluaciones(container) {
  container.innerHTML = `
    <h1>Evaluaciones</h1>
    <p class="page-desc">Crea evaluaciones y agrega detalles de criterios. Consulta el historial por estudiante.</p>

    <!-- Create evaluation -->
    <div class="card">
      <h2 class="collapsible-trigger open" id="form-toggle">Nueva evaluación</h2>
      <div id="form-body">
        <div class="alert alert-info" style="margin-bottom:14px">
          Necesitarás los IDs de: <strong>estudiante</strong>, <strong>periodo</strong>,
          <strong>usuario</strong> y <strong>sección</strong>.
        </div>
        <div id="create-msg"></div>
        <form id="create-form">
          <div class="form-grid">
            <div class="form-group">
              <label>ID Estudiante *</label>
              <input type="number" name="estudianteId" min="1" required />
            </div>
            <div class="form-group">
              <label>ID Periodo *</label>
              <input type="number" name="periodoId" min="1" required />
            </div>
            <div class="form-group">
              <label>ID Usuario *</label>
              <input type="number" name="usuarioId" min="1" required />
            </div>
            <div class="form-group">
              <label>ID Sección *</label>
              <input type="number" name="seccionId" min="1" required />
            </div>
            <div class="form-group">
              <label>Origen de registro *</label>
              <select name="origenRegistro" required>
                ${ORIGENES.map(o => `<option value="${o}">${o}</option>`).join('')}
              </select>
            </div>
            <div class="form-group full">
              <label>Observación general</label>
              <textarea name="observacionGeneral" placeholder="Opcional..."></textarea>
            </div>
          </div>
          <div class="btn-row">
            <button type="submit" class="btn btn-primary">Crear evaluación</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add detail -->
    <div class="card">
      <h2 class="collapsible-trigger" id="detail-toggle">Agregar detalle a evaluación existente</h2>
      <div id="detail-body" style="display:none">
        <div id="detail-msg"></div>
        <form id="detail-form">
          <div class="form-grid cols-3">
            <div class="form-group">
              <label>ID Evaluación *</label>
              <input type="number" name="evaluacionId" min="1" required />
            </div>
            <div class="form-group">
              <label>ID Criterio *</label>
              <input type="number" name="criterioId" min="1" required />
            </div>
            <div class="form-group">
              <label>ID Escala *</label>
              <input type="number" name="escalaId" min="1" required />
            </div>
            <div class="form-group full">
              <label>Observación</label>
              <textarea name="observacion" placeholder="Opcional..."></textarea>
            </div>
          </div>
          <div class="btn-row">
            <button type="submit" class="btn btn-primary">Agregar detalle</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Search -->
    <div class="card">
      <h2>Consultar evaluaciones</h2>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end">
        <div class="form-group">
          <label>Por ID estudiante</label>
          <input type="number" id="search-input" placeholder="Ej: 1" min="1" style="width:140px"/>
        </div>
        <button class="btn btn-secondary" id="search-btn">Buscar</button>
        <div style="width:1px;background:var(--border);height:36px;align-self:flex-end"></div>
        <div class="form-group">
          <label>Por ID evaluación</label>
          <input type="number" id="search-eval-id" placeholder="Ej: 1" min="1" style="width:140px"/>
        </div>
        <button class="btn btn-secondary" id="search-eval-btn">Ver detalle</button>
      </div>
    </div>

    <div id="results-card" style="display:none" class="card">
      <h2 id="results-title">Resultados</h2>
      <div id="results-content"></div>
    </div>
  `

  container.querySelector('#form-toggle').addEventListener('click', e => {
    const open = e.target.classList.toggle('open')
    container.querySelector('#form-body').style.display = open ? '' : 'none'
  })

  container.querySelector('#detail-toggle').addEventListener('click', e => {
    const open = e.target.classList.toggle('open')
    container.querySelector('#detail-body').style.display = open ? '' : 'none'
  })

  container.querySelector('#create-form').addEventListener('submit', async e => {
    e.preventDefault()
    const msg = container.querySelector('#create-msg')
    msg.innerHTML = ''
    const fd = new FormData(e.target)
    const btn = e.target.querySelector('button[type=submit]')
    btn.disabled = true
    try {
      const body = {
        estudianteId:      Number(fd.get('estudianteId')),
        periodoId:         Number(fd.get('periodoId')),
        usuarioId:         Number(fd.get('usuarioId')),
        seccionId:         Number(fd.get('seccionId')),
        origenRegistro:    fd.get('origenRegistro'),
        observacionGeneral: fd.get('observacionGeneral') || null,
      }
      const result = await createEvaluacion(body)
      msg.innerHTML = `<div class="alert alert-success">
        Evaluación creada — ID: <strong>${result.id}</strong>,
        Estudiante: <strong>${result.estudianteNombreCompleto}</strong>
      </div>`
      e.target.reset()
    } catch (err) {
      msg.innerHTML = `<div class="alert alert-error">${err.message}</div>`
    } finally {
      btn.disabled = false
    }
  })

  container.querySelector('#detail-form').addEventListener('submit', async e => {
    e.preventDefault()
    const msg = container.querySelector('#detail-msg')
    msg.innerHTML = ''
    const fd = new FormData(e.target)
    const btn = e.target.querySelector('button[type=submit]')
    btn.disabled = true
    try {
      const evalId = Number(fd.get('evaluacionId'))
      const result = await addDetalleEvaluacion(evalId, {
        criterioId:  Number(fd.get('criterioId')),
        escalaId:    Number(fd.get('escalaId')),
        observacion: fd.get('observacion') || null,
      })
      msg.innerHTML = `<div class="alert alert-success">Detalle agregado a la evaluación #${result.id}.</div>`
      e.target.reset()
    } catch (err) {
      msg.innerHTML = `<div class="alert alert-error">${err.message}</div>`
    } finally {
      btn.disabled = false
    }
  })

  function renderEvalTable(data, title) {
    const card = container.querySelector('#results-card')
    const content = container.querySelector('#results-content')
    container.querySelector('#results-title').textContent = title
    card.style.display = 'block'

    if (!data.length) {
      content.innerHTML = '<p class="empty">Sin resultados.</p>'
      return
    }
    content.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>ID</th><th>Estudiante</th><th>Periodo</th><th>Sección</th><th>Origen</th><th>Fecha</th></tr>
          </thead>
          <tbody>
            ${data.map(ev => `
              <tr>
                <td>${ev.id}</td>
                <td>${ev.estudianteNombreCompleto}</td>
                <td>${ev.periodoNombre || ev.periodoId}</td>
                <td>${ev.seccionNombre || ev.seccionId}</td>
                <td><span class="badge badge-gray">${ev.origenRegistro}</span></td>
                <td>${ev.createdAt ? ev.createdAt.split('T')[0] : '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `
  }

  function renderEvalDetail(ev) {
    const card = container.querySelector('#results-card')
    const content = container.querySelector('#results-content')
    container.querySelector('#results-title').textContent = `Evaluación #${ev.id}`
    card.style.display = 'block'
    content.innerHTML = `
      <table style="margin-bottom:12px">
        <tr><td class="text-muted" style="padding:4px 12px 4px 0">Estudiante</td><td>${ev.estudianteNombreCompleto}</td></tr>
        <tr><td class="text-muted" style="padding:4px 12px 4px 0">Periodo</td><td>${ev.periodoNombre || ev.periodoId}</td></tr>
        <tr><td class="text-muted" style="padding:4px 12px 4px 0">Sección</td><td>${ev.seccionNombre || ev.seccionId}</td></tr>
        <tr><td class="text-muted" style="padding:4px 12px 4px 0">Origen</td><td>${ev.origenRegistro}</td></tr>
        <tr><td class="text-muted" style="padding:4px 12px 4px 0">Observación</td><td>${ev.observacionGeneral || '—'}</td></tr>
      </table>
    `
  }

  container.querySelector('#search-btn').addEventListener('click', async () => {
    const id = container.querySelector('#search-input').value
    if (!id) return
    try {
      const data = await getEvaluacionesByEstudiante(id)
      renderEvalTable(Array.isArray(data) ? data : [data], `Evaluaciones del estudiante #${id}`)
    } catch (err) {
      const card = container.querySelector('#results-card')
      container.querySelector('#results-content').innerHTML = `<div class="alert alert-error">${err.message}</div>`
      card.style.display = 'block'
    }
  })

  container.querySelector('#search-eval-btn').addEventListener('click', async () => {
    const id = container.querySelector('#search-eval-id').value
    if (!id) return
    try {
      const ev = await getEvaluacion(id)
      renderEvalDetail(ev)
    } catch (err) {
      const card = container.querySelector('#results-card')
      container.querySelector('#results-content').innerHTML = `<div class="alert alert-error">${err.message}</div>`
      card.style.display = 'block'
    }
  })
}
