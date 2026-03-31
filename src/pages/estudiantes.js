import { getEstudiantes, getEstudiante, createEstudiante, updateEstudiante } from '../api.js'

const GENEROS = ['MASCULINO', 'FEMENINO', 'OTRO']
const ESTADOS = ['', 'ACTIVO', 'INACTIVO', 'GRADUADO', 'TRASLADADO']

function estadoBadge(estado) {
  const map = { ACTIVO: 'badge-green', INACTIVO: 'badge-red', GRADUADO: 'badge-blue', TRASLADADO: 'badge-yellow' }
  return `<span class="badge ${map[estado] || 'badge-gray'}">${estado || '—'}</span>`
}

function studentForm(s = {}) {
  return `
    <div class="form-grid">
      <div class="form-group">
        <label>Identificación *</label>
        <input name="identificacion" value="${s.identificacion || ''}" required />
      </div>
      <div class="form-group">
        <label>Nombre *</label>
        <input name="nombre" value="${s.nombre || ''}" required />
      </div>
      <div class="form-group">
        <label>Primer apellido *</label>
        <input name="apellido1" value="${s.apellido1 || ''}" required />
      </div>
      <div class="form-group">
        <label>Segundo apellido</label>
        <input name="apellido2" value="${s.apellido2 || ''}" />
      </div>
      <div class="form-group">
        <label>Fecha nacimiento</label>
        <input type="date" name="fechaNacimiento" value="${s.fechaNacimiento || ''}" />
      </div>
      <div class="form-group">
        <label>Género</label>
        <select name="genero">
          <option value="">— Sin especificar —</option>
          ${GENEROS.map(g => `<option value="${g}" ${s.genero === g ? 'selected' : ''}>${g}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Nombre acudiente</label>
        <input name="nombreAcudiente" value="${s.nombreAcudiente || ''}" />
      </div>
      <div class="form-group">
        <label>Teléfono acudiente</label>
        <input name="telefonoAcudiente" value="${s.telefonoAcudiente || ''}" />
      </div>
      <div class="form-group full">
        <label>Correo acudiente</label>
        <input type="email" name="correoAcudiente" value="${s.correoAcudiente || ''}" />
      </div>
    </div>
  `
}

export async function renderEstudiantes(container) {
  container.innerHTML = `
    <h1>Estudiantes</h1>
    <p class="page-desc">Listado de estudiantes. Puedes crear, editar y filtrar por estado.</p>

    <div class="card">
      <h2 class="collapsible-trigger open" id="form-toggle">Registrar estudiante</h2>
      <div id="form-body">
        <div id="form-msg"></div>
        <form id="create-form">
          ${studentForm()}
          <div class="btn-row">
            <button type="submit" class="btn btn-primary">Crear estudiante</button>
          </div>
        </form>
      </div>
    </div>

    <div class="card">
      <div class="section-actions">
        <h2 style="margin:0">Listado</h2>
        <div style="display:flex;gap:8px;align-items:center">
          <select id="estado-filter">
            ${ESTADOS.map(e => `<option value="${e}">${e || 'Todos los estados'}</option>`).join('')}
          </select>
          <button class="btn btn-secondary btn-sm" id="refresh-btn">Actualizar</button>
        </div>
      </div>
      <div id="list-msg"></div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>ID</th><th>Identificación</th><th>Nombre completo</th><th>Acudiente</th><th>Estado</th><th>Acción</th></tr>
          </thead>
          <tbody id="tbody"></tbody>
        </table>
      </div>
    </div>

    <!-- Edit modal -->
    <div id="edit-overlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:100;align-items:center;justify-content:center;">
      <div style="background:#fff;border-radius:10px;padding:28px;width:600px;max-width:95vw;max-height:90vh;overflow-y:auto;">
        <h2 style="margin-bottom:16px">Editar estudiante</h2>
        <div id="edit-msg"></div>
        <form id="edit-form"></form>
        <div class="btn-row">
          <button class="btn btn-primary" id="edit-save">Guardar</button>
          <button class="btn btn-secondary" id="edit-cancel">Cancelar</button>
        </div>
      </div>
    </div>
  `

  const tbody     = container.querySelector('#tbody')
  const formMsg   = container.querySelector('#form-msg')
  const listMsg   = container.querySelector('#list-msg')
  const editOverlay = container.querySelector('#edit-overlay')
  const editForm  = container.querySelector('#edit-form')
  const editMsg   = container.querySelector('#edit-msg')
  let editingId   = null

  container.querySelector('#form-toggle').addEventListener('click', e => {
    const open = e.target.classList.toggle('open')
    container.querySelector('#form-body').style.display = open ? '' : 'none'
  })

  async function loadList() {
    const estado = container.querySelector('#estado-filter').value
    tbody.innerHTML = '<tr><td colspan="6" class="empty">Cargando...</td></tr>'
    try {
      const data = await getEstudiantes(estado || null)
      if (!data.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty">Sin resultados.</td></tr>'
        return
      }
      tbody.innerHTML = data.map(s => `
        <tr>
          <td>${s.id}</td>
          <td>${s.identificacion}</td>
          <td>${s.nombre} ${s.apellido1} ${s.apellido2 || ''}</td>
          <td>${s.nombreAcudiente || '—'}</td>
          <td>${estadoBadge(s.estado)}</td>
          <td><button class="btn btn-sm btn-secondary edit-btn" data-id="${s.id}">Editar</button></td>
        </tr>
      `).join('')

      tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          try {
            const s = await getEstudiante(btn.dataset.id)
            editingId = s.id
            editForm.innerHTML = studentForm(s)
            editMsg.innerHTML = ''
            editOverlay.style.display = 'flex'
          } catch (err) {
            listMsg.innerHTML = `<div class="alert alert-error">${err.message}</div>`
          }
        })
      })
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty">${err.message}</td></tr>`
    }
  }

  container.querySelector('#estado-filter').addEventListener('change', loadList)
  container.querySelector('#refresh-btn').addEventListener('click', loadList)

  container.querySelector('#create-form').addEventListener('submit', async e => {
    e.preventDefault()
    formMsg.innerHTML = ''
    const fd = new FormData(e.target)
    const btn = e.target.querySelector('button[type=submit]')
    btn.disabled = true
    try {
      const body = Object.fromEntries([...fd.entries()].filter(([, v]) => v !== ''))
      await createEstudiante(body)
      formMsg.innerHTML = '<div class="alert alert-success">Estudiante creado correctamente.</div>'
      e.target.reset()
      await loadList()
    } catch (err) {
      formMsg.innerHTML = `<div class="alert alert-error">${err.message}</div>`
    } finally {
      btn.disabled = false
    }
  })

  container.querySelector('#edit-save').addEventListener('click', async () => {
    editMsg.innerHTML = ''
    const fd = new FormData(editForm)
    try {
      const body = Object.fromEntries([...fd.entries()].filter(([, v]) => v !== ''))
      await updateEstudiante(editingId, body)
      editOverlay.style.display = 'none'
      listMsg.innerHTML = '<div class="alert alert-success">Estudiante actualizado.</div>'
      await loadList()
    } catch (err) {
      editMsg.innerHTML = `<div class="alert alert-error">${err.message}</div>`
    }
  })

  container.querySelector('#edit-cancel').addEventListener('click', () => {
    editOverlay.style.display = 'none'
  })

  await loadList()
}
