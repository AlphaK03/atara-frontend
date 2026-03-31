import { createMatricula, getMatriculasByEstudiante, getMatriculasBySeccion } from '../api.js'

function estadoBadge(estado) {
  const map = { ACTIVO: 'badge-green', INACTIVO: 'badge-red', RETIRADO: 'badge-yellow', TRASLADADO: 'badge-blue' }
  return `<span class="badge ${map[estado] || 'badge-gray'}">${estado || '—'}</span>`
}

export async function renderMatriculas(container) {
  container.innerHTML = `
    <h1>Matrículas</h1>
    <p class="page-desc">Matricula estudiantes en secciones. Consulta el historial por estudiante o sección.</p>

    <div class="card">
      <h2 class="collapsible-trigger open" id="form-toggle">Nueva matrícula</h2>
      <div id="form-body">
        <div class="alert alert-info" style="margin-bottom:14px">
          Necesitarás el <strong>ID del estudiante</strong>, el <strong>ID de la sección</strong>
          y el <strong>ID del año lectivo</strong>. Consúltalos en las pantallas correspondientes.
        </div>
        <div id="form-msg"></div>
        <form id="mat-form">
          <div class="form-grid cols-3">
            <div class="form-group">
              <label>ID Estudiante *</label>
              <input type="number" name="estudianteId" min="1" required />
            </div>
            <div class="form-group">
              <label>ID Sección *</label>
              <input type="number" name="seccionId" min="1" required />
            </div>
            <div class="form-group">
              <label>ID Año Lectivo *</label>
              <input type="number" name="anioLectivoId" min="1" required />
            </div>
          </div>
          <div class="btn-row">
            <button type="submit" class="btn btn-primary">Matricular</button>
          </div>
        </form>
      </div>
    </div>

    <div class="card">
      <h2>Consultar matrículas</h2>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end">
        <div class="form-group">
          <label>Por ID estudiante</label>
          <input type="number" id="search-estudiante" placeholder="Ej: 1" min="1" style="width:140px"/>
        </div>
        <button class="btn btn-secondary" id="btn-by-estudiante">Buscar</button>
        <div style="width:1px;background:var(--border);height:36px;align-self:flex-end"></div>
        <div class="form-group">
          <label>Por ID sección</label>
          <input type="number" id="search-seccion" placeholder="Ej: 1" min="1" style="width:140px"/>
        </div>
        <button class="btn btn-secondary" id="btn-by-seccion">Buscar</button>
      </div>
    </div>

    <div id="results-card" style="display:none" class="card">
      <h2 id="results-title">Resultados</h2>
      <div id="results-msg"></div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>ID</th><th>Estudiante</th><th>Sección</th><th>Año</th><th>Fecha</th><th>Estado</th></tr>
          </thead>
          <tbody id="results-tbody">
            <tr><td colspan="6" class="empty">—</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `

  const formMsg = container.querySelector('#form-msg')

  container.querySelector('#form-toggle').addEventListener('click', e => {
    const open = e.target.classList.toggle('open')
    container.querySelector('#form-body').style.display = open ? '' : 'none'
  })

  container.querySelector('#mat-form').addEventListener('submit', async e => {
    e.preventDefault()
    formMsg.innerHTML = ''
    const fd = new FormData(e.target)
    const btn = e.target.querySelector('button[type=submit]')
    btn.disabled = true
    try {
      const result = await createMatricula({
        estudianteId:  Number(fd.get('estudianteId')),
        seccionId:     Number(fd.get('seccionId')),
        anioLectivoId: Number(fd.get('anioLectivoId')),
      })
      formMsg.innerHTML = `<div class="alert alert-success">
        Matrícula creada — ID: <strong>${result.id}</strong>,
        Estudiante: <strong>${result.estudianteNombreCompleto}</strong>,
        Sección: <strong>${result.seccionNombre}</strong>
      </div>`
      e.target.reset()
    } catch (err) {
      formMsg.innerHTML = `<div class="alert alert-error">${err.message}</div>`
    } finally {
      btn.disabled = false
    }
  })

  function showResults(title, data) {
    const card  = container.querySelector('#results-card')
    const tbody = container.querySelector('#results-tbody')
    const msg   = container.querySelector('#results-msg')
    container.querySelector('#results-title').textContent = title
    msg.innerHTML = ''
    card.style.display = 'block'

    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty">Sin resultados.</td></tr>'
      return
    }
    tbody.innerHTML = data.map(m => `
      <tr>
        <td>${m.id}</td>
        <td>${m.estudianteNombreCompleto}</td>
        <td>${m.seccionNombre}</td>
        <td>${m.anioLectivo}</td>
        <td>${m.fechaMatricula || '—'}</td>
        <td>${estadoBadge(m.estado)}</td>
      </tr>
    `).join('')
  }

  container.querySelector('#btn-by-estudiante').addEventListener('click', async () => {
    const id = container.querySelector('#search-estudiante').value
    if (!id) return
    try {
      const data = await getMatriculasByEstudiante(id)
      showResults(`Matrículas del estudiante #${id}`, data)
    } catch (err) {
      container.querySelector('#results-msg').innerHTML = `<div class="alert alert-error">${err.message}</div>`
      container.querySelector('#results-card').style.display = 'block'
    }
  })

  container.querySelector('#btn-by-seccion').addEventListener('click', async () => {
    const id = container.querySelector('#search-seccion').value
    if (!id) return
    try {
      const data = await getMatriculasBySeccion(id)
      showResults(`Matrículas de la sección #${id}`, data)
    } catch (err) {
      container.querySelector('#results-msg').innerHTML = `<div class="alert alert-error">${err.message}</div>`
      container.querySelector('#results-card').style.display = 'block'
    }
  })
}
