import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../api.js'

const ROL_BADGE  = { ADMIN: 'badge-blue', DOCENTE: 'badge-green', COORDINADOR: 'badge-yellow' }
const ESTADO_BADGE = { ACTIVO: 'badge-green', INACTIVO: 'badge-red' }
const ROL_LABEL  = { ADMIN: 'Administrador', DOCENTE: 'Docente', COORDINADOR: 'Coordinador' }

let _usuarios = []

export async function renderAdmin(container) {
  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;flex-wrap:wrap;gap:10px">
      <div>
        <h1 style="margin-bottom:4px">Gestión de usuarios</h1>
        <p class="page-desc" style="margin-bottom:0">Administra los usuarios del sistema ATARA.</p>
      </div>
      <button id="btn-nuevo" class="btn btn-primary">+ Nuevo usuario</button>
    </div>

    <!-- Formulario de creación / edición (oculto por defecto) -->
    <div id="form-panel" style="display:none;background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:24px;margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <h2 id="form-title" style="margin:0;font-size:16px;color:#0369a1">Nuevo usuario</h2>
        <button id="btn-form-close" style="border:none;background:none;cursor:pointer;font-size:22px;color:#64748b;line-height:1;padding:0 4px" title="Cerrar">×</button>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label>Nombre <span style="color:#dc2626">*</span></label>
          <input type="text" id="f-nombre" maxlength="100" placeholder="Nombre(s)">
        </div>
        <div class="form-group">
          <label>Apellidos <span style="color:#dc2626">*</span></label>
          <input type="text" id="f-apellidos" maxlength="150" placeholder="Apellidos">
        </div>
        <div class="form-group">
          <label>Correo electrónico <span style="color:#dc2626">*</span></label>
          <input type="email" id="f-correo" maxlength="150" placeholder="correo@institución.cr">
        </div>
        <div class="form-group">
          <label id="lbl-password">Contraseña <span style="color:#dc2626">*</span></label>
          <input type="password" id="f-password" maxlength="100" placeholder="Mínimo 8 caracteres">
          <span id="hint-password" style="font-size:11px;color:var(--text-muted);display:none">Dejar vacío para no cambiar.</span>
        </div>
        <div class="form-group">
          <label>Rol <span style="color:#dc2626">*</span></label>
          <select id="f-rol">
            <option value="">— Seleccione —</option>
            <option value="DOCENTE">Docente</option>
            <option value="COORDINADOR">Coordinador</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>
        <div class="form-group" id="grupo-estado" style="display:none">
          <label>Estado</label>
          <select id="f-estado">
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
        </div>
      </div>
      <div id="form-error" style="margin-top:14px;font-size:13px;color:#dc2626"></div>
      <div class="btn-row" style="margin-top:20px">
        <button id="btn-save" class="btn btn-primary">Guardar</button>
        <button id="btn-cancel" class="btn btn-secondary">Cancelar</button>
      </div>
    </div>

    <!-- Tabla de usuarios -->
    <div class="card" style="padding:0;overflow:hidden">
      <div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
        <span id="lbl-count" style="font-size:13px;color:var(--text-muted)">Cargando…</span>
        <input id="admin-search" type="text" placeholder="Buscar por nombre o correo…"
               style="min-width:220px;padding:7px 10px;border-radius:6px;border:1px solid var(--border);font-size:13px">
      </div>
      <div id="admin-msg"></div>
      <div class="table-wrap">
        <table id="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th style="text-align:center;width:120px">Acciones</th>
            </tr>
          </thead>
          <tbody id="admin-tbody">
            <tr><td colspan="6" class="loading">Cargando usuarios…</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `

  // ── referencias ────────────────────────────────────────────────────────────
  const msg        = container.querySelector('#admin-msg')
  const tbody      = container.querySelector('#admin-tbody')
  const lblCount   = container.querySelector('#lbl-count')
  const searchInput = container.querySelector('#admin-search')
  const formPanel  = container.querySelector('#form-panel')
  const formTitle  = container.querySelector('#form-title')
  const formError  = container.querySelector('#form-error')
  const btnNuevo   = container.querySelector('#btn-nuevo')
  const btnSave    = container.querySelector('#btn-save')
  const btnCancel  = container.querySelector('#btn-cancel')
  const btnClose   = container.querySelector('#btn-form-close')
  const grupoEstado = container.querySelector('#grupo-estado')
  const hintPwd    = container.querySelector('#hint-password')
  const lblPwd     = container.querySelector('#lbl-password')

  let editingId = null  // null = crear, número = editar

  // ── cargar usuarios ────────────────────────────────────────────────────────
  async function cargarUsuarios() {
    try {
      _usuarios = await getUsuarios() ?? []
    } catch (e) {
      msg.innerHTML = `<div class="alert alert-error" style="margin:16px">${e.message}</div>`
      return
    }
    renderTable(_usuarios)
  }

  function renderTable(lista) {
    lblCount.textContent = `${lista.length} usuario${lista.length !== 1 ? 's' : ''}`
    if (!lista.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty">Sin resultados.</td></tr>`
      return
    }
    tbody.innerHTML = lista.map((u, i) => `
      <tr>
        <td style="color:var(--text-muted);width:36px">${i + 1}</td>
        <td>
          <div style="font-weight:600">${escHtml(u.nombre)} ${escHtml(u.apellidos)}</div>
        </td>
        <td style="color:var(--text-muted)">${escHtml(u.correo)}</td>
        <td><span class="badge ${ROL_BADGE[u.rol] ?? 'badge-gray'}">${ROL_LABEL[u.rol] ?? u.rol}</span></td>
        <td><span class="badge ${ESTADO_BADGE[u.estado] ?? 'badge-gray'}">${u.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}</span></td>
        <td style="text-align:center">
          <button class="btn btn-sm btn-secondary btn-edit" data-id="${u.id}" title="Editar">Editar</button>
          <button class="btn btn-sm btn-danger btn-del" data-id="${u.id}" title="Eliminar" style="margin-left:4px">×</button>
        </td>
      </tr>
    `).join('')

    tbody.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => abrirEditar(Number(btn.dataset.id)))
    })
    tbody.querySelectorAll('.btn-del').forEach(btn => {
      btn.addEventListener('click', () => confirmarEliminar(Number(btn.dataset.id)))
    })
  }

  // ── búsqueda en vivo ───────────────────────────────────────────────────────
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase()
    renderTable(q
      ? _usuarios.filter(u =>
          `${u.nombre} ${u.apellidos}`.toLowerCase().includes(q) ||
          u.correo.toLowerCase().includes(q))
      : _usuarios)
  })

  // ── abrir form nuevo ───────────────────────────────────────────────────────
  function abrirNuevo() {
    editingId = null
    formTitle.textContent = 'Nuevo usuario'
    limpiarForm()
    grupoEstado.style.display = 'none'
    hintPwd.style.display = 'none'
    lblPwd.innerHTML = 'Contraseña <span style="color:#dc2626">*</span>'
    container.querySelector('#f-password').placeholder = 'Mínimo 8 caracteres'
    formPanel.style.display = ''
    formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' })
    container.querySelector('#f-nombre').focus()
  }

  // ── abrir form editar ──────────────────────────────────────────────────────
  function abrirEditar(id) {
    const u = _usuarios.find(x => x.id === id)
    if (!u) return
    editingId = id
    formTitle.textContent = `Editar — ${u.nombre} ${u.apellidos}`
    container.querySelector('#f-nombre').value    = u.nombre
    container.querySelector('#f-apellidos').value = u.apellidos
    container.querySelector('#f-correo').value    = u.correo
    container.querySelector('#f-password').value  = ''
    container.querySelector('#f-password').placeholder = 'Dejar vacío para no cambiar'
    container.querySelector('#f-rol').value       = u.rol
    container.querySelector('#f-estado').value    = u.estado
    grupoEstado.style.display = ''
    hintPwd.style.display = ''
    lblPwd.innerHTML = 'Contraseña'
    formError.textContent = ''
    formPanel.style.display = ''
    formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' })
    container.querySelector('#f-nombre').focus()
  }

  function cerrarForm() {
    formPanel.style.display = 'none'
    limpiarForm()
    editingId = null
  }

  function limpiarForm() {
    ;['#f-nombre','#f-apellidos','#f-correo','#f-password','#f-rol','#f-estado'].forEach(sel => {
      const el = container.querySelector(sel)
      if (el) el.value = ''
    })
    formError.textContent = ''
  }

  // ── guardar (crear o actualizar) ───────────────────────────────────────────
  async function guardar() {
    formError.textContent = ''
    const nombre    = container.querySelector('#f-nombre').value.trim()
    const apellidos = container.querySelector('#f-apellidos').value.trim()
    const correo    = container.querySelector('#f-correo').value.trim()
    const password  = container.querySelector('#f-password').value
    const rol       = container.querySelector('#f-rol').value
    const estado    = container.querySelector('#f-estado').value

    if (!nombre || !apellidos || !correo || !rol) {
      formError.textContent = 'Completa todos los campos requeridos.'
      return
    }
    if (!editingId && !password) {
      formError.textContent = 'La contraseña es requerida al crear un usuario.'
      return
    }
    if (password && password.length < 8) {
      formError.textContent = 'La contraseña debe tener al menos 8 caracteres.'
      return
    }

    const payload = { nombre, apellidos, correo, rol }
    if (password) payload.password = password
    if (editingId && estado) payload.estado = estado

    btnSave.disabled = true
    btnSave.textContent = 'Guardando…'

    try {
      if (editingId) {
        const updated = await updateUsuario(editingId, payload)
        const idx = _usuarios.findIndex(u => u.id === editingId)
        if (idx !== -1) _usuarios[idx] = updated
      } else {
        const created = await createUsuario(payload)
        _usuarios.push(created)
      }
      cerrarForm()
      const q = searchInput.value.toLowerCase()
      renderTable(q
        ? _usuarios.filter(u =>
            `${u.nombre} ${u.apellidos}`.toLowerCase().includes(q) ||
            u.correo.toLowerCase().includes(q))
        : _usuarios)
      mostrarExito(editingId ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.')
    } catch (e) {
      formError.textContent = e.message
    } finally {
      btnSave.disabled = false
      btnSave.textContent = 'Guardar'
    }
  }

  // ── eliminar con confirmación ──────────────────────────────────────────────
  async function confirmarEliminar(id) {
    const u = _usuarios.find(x => x.id === id)
    if (!u) return
    if (!confirm(`¿Eliminar al usuario "${u.nombre} ${u.apellidos}"?\nEsta acción no se puede deshacer.`)) return

    try {
      await deleteUsuario(id)
      _usuarios = _usuarios.filter(x => x.id !== id)
      const q = searchInput.value.toLowerCase()
      renderTable(q
        ? _usuarios.filter(u2 =>
            `${u2.nombre} ${u2.apellidos}`.toLowerCase().includes(q) ||
            u2.correo.toLowerCase().includes(q))
        : _usuarios)
      mostrarExito('Usuario eliminado.')
    } catch (e) {
      msg.innerHTML = `<div class="alert alert-error" style="margin:16px">${e.message}</div>`
      setTimeout(() => { msg.innerHTML = '' }, 4000)
    }
  }

  function mostrarExito(texto) {
    msg.innerHTML = `<div class="alert alert-success" style="margin:16px">${texto}</div>`
    setTimeout(() => { msg.innerHTML = '' }, 3500)
  }

  // ── eventos ────────────────────────────────────────────────────────────────
  btnNuevo.addEventListener('click', abrirNuevo)
  btnSave.addEventListener('click', guardar)
  btnCancel.addEventListener('click', cerrarForm)
  btnClose.addEventListener('click', cerrarForm)

  container.querySelector('#f-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') guardar()
  })

  await cargarUsuarios()
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
