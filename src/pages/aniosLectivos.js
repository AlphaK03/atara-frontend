import { getAniosLectivos, createAnioLectivo, activarAnioLectivo } from '../api.js'

export async function renderAniosLectivos(container) {
  container.innerHTML = `
    <h1>Años Lectivos</h1>
    <p class="page-desc">Gestiona los años lectivos del sistema. Solo uno puede estar activo a la vez.</p>

    <div class="card">
      <h2 class="collapsible-trigger open" id="form-toggle">Registrar nuevo año lectivo</h2>
      <div id="form-body">
        <div id="form-msg"></div>
        <form id="anio-form">
          <div class="form-grid cols-3">
            <div class="form-group">
              <label>Año</label>
              <input type="number" name="anio" placeholder="2025" min="2000" max="2100" required />
            </div>
            <div class="form-group">
              <label>Fecha inicio</label>
              <input type="date" name="fechaInicio" required />
            </div>
            <div class="form-group">
              <label>Fecha fin</label>
              <input type="date" name="fechaFin" required />
            </div>
          </div>
          <div class="btn-row">
            <button type="submit" class="btn btn-primary">Crear año lectivo</button>
          </div>
        </form>
      </div>
    </div>

    <div class="card">
      <div class="section-actions">
        <h2 style="margin:0">Listado</h2>
        <button class="btn btn-secondary btn-sm" id="refresh-btn">Actualizar</button>
      </div>
      <div id="list-msg"></div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Año</th><th>Inicio</th><th>Fin</th><th>Estado</th><th>Acción</th>
            </tr>
          </thead>
          <tbody id="anios-tbody">
            <tr><td colspan="6" class="empty">Cargando...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `

  const tbody   = container.querySelector('#anios-tbody')
  const formMsg = container.querySelector('#form-msg')
  const listMsg = container.querySelector('#list-msg')

  // Collapsible form
  container.querySelector('#form-toggle').addEventListener('click', e => {
    const body = container.querySelector('#form-body')
    const open = e.target.classList.toggle('open')
    body.style.display = open ? '' : 'none'
  })

  async function loadList() {
    tbody.innerHTML = '<tr><td colspan="6" class="empty">Cargando...</td></tr>'
    try {
      const data = await getAniosLectivos()
      if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty">No hay años lectivos registrados.</td></tr>'
        return
      }
      tbody.innerHTML = data.map(a => `
        <tr>
          <td>${a.id}</td>
          <td><strong>${a.anio}</strong></td>
          <td>${a.fechaInicio}</td>
          <td>${a.fechaFin}</td>
          <td>${a.activo
            ? '<span class="badge badge-green">Activo</span>'
            : '<span class="badge badge-gray">Inactivo</span>'}</td>
          <td>${!a.activo
            ? `<button class="btn btn-sm btn-success activar-btn" data-id="${a.id}">Activar</button>`
            : '—'}</td>
        </tr>
      `).join('')

      tbody.querySelectorAll('.activar-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          btn.disabled = true
          try {
            await activarAnioLectivo(btn.dataset.id)
            listMsg.innerHTML = '<div class="alert alert-success">Año lectivo activado.</div>'
            await loadList()
          } catch (err) {
            listMsg.innerHTML = `<div class="alert alert-error">${err.message}</div>`
            btn.disabled = false
          }
        })
      })
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty">${err.message}</td></tr>`
    }
  }

  container.querySelector('#refresh-btn').addEventListener('click', loadList)

  container.querySelector('#anio-form').addEventListener('submit', async e => {
    e.preventDefault()
    formMsg.innerHTML = ''
    const fd = new FormData(e.target)
    const btn = e.target.querySelector('button[type=submit]')
    btn.disabled = true
    try {
      await createAnioLectivo({
        anio: Number(fd.get('anio')),
        fechaInicio: fd.get('fechaInicio'),
        fechaFin: fd.get('fechaFin'),
      })
      formMsg.innerHTML = '<div class="alert alert-success">Año lectivo creado correctamente.</div>'
      e.target.reset()
      await loadList()
    } catch (err) {
      formMsg.innerHTML = `<div class="alert alert-error">${err.message}</div>`
    } finally {
      btn.disabled = false
    }
  })

  await loadList()
}
