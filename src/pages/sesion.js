import { getMe, logout } from '../api.js'

const ROL_LABEL = {
  ADMIN:        'Administrador',
  DOCENTE:      'Docente',
  COORDINADOR:  'Coordinador',
}
const ROL_BADGE = {
  ADMIN:        'badge-blue',
  DOCENTE:      'badge-green',
  COORDINADOR:  'badge-yellow',
}

export async function renderSesion(container) {
  container.innerHTML = '<p class="loading">Cargando sesión…</p>'

  const me = await getMe()
  if (!me) return

  const rolLabel  = ROL_LABEL[me.rol]  ?? me.rol
  const rolBadge  = ROL_BADGE[me.rol]  ?? 'badge-gray'
  const iniciales = [me.nombre, me.apellidos]
    .filter(Boolean)
    .map(s => s[0].toUpperCase())
    .join('')
    .slice(0, 2)

  container.innerHTML = `
    <h1 style="margin-bottom:24px">Mi Sesión</h1>

    <div class="sesion-grid" style="display:grid;grid-template-columns:280px 1fr;gap:20px;align-items:start;max-width:760px">

      <!-- Tarjeta de perfil -->
      <div class="card" style="text-align:center;padding:32px 24px">
        <div style="
          width:80px;height:80px;border-radius:50%;
          background:var(--accent);color:#fff;
          display:flex;align-items:center;justify-content:center;
          font-size:28px;font-weight:700;
          margin:0 auto 16px;
          box-shadow:0 4px 14px rgba(59,125,216,0.35)
        ">${iniciales}</div>
        <div style="font-size:17px;font-weight:700;margin-bottom:6px;line-height:1.3">
          ${escHtml(me.nombre)} ${escHtml(me.apellidos)}
        </div>
        <span class="badge ${rolBadge}" style="font-size:12px;padding:3px 12px">${rolLabel}</span>
        <div style="margin-top:16px;font-size:12px;color:var(--text-muted)">${escHtml(me.correo)}</div>
      </div>

      <!-- Detalle de cuenta -->
      <div style="display:flex;flex-direction:column;gap:16px">

        <div class="card" style="padding:20px 24px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:14px">
            Información de cuenta
          </div>
          <div style="display:flex;flex-direction:column;gap:12px">
            ${fila('ID de usuario', String(me.userId ?? '—'))}
            ${fila('Nombre completo', `${escHtml(me.nombre)} ${escHtml(me.apellidos)}`)}
            ${fila('Correo electrónico', escHtml(me.correo))}
            ${fila('Rol', `<span class="badge ${rolBadge}">${rolLabel}</span>`)}
          </div>
        </div>

        ${me.seccionIds?.length ? `
        <div class="card" style="padding:20px 24px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:14px">
            Secciones asignadas
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            ${me.seccionIds.map(id =>
              `<span class="badge badge-gray" style="font-size:12px">Sección ${id}</span>`
            ).join('')}
          </div>
        </div>` : ''}

        ${me.materiaIds?.length ? `
        <div class="card" style="padding:20px 24px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:14px">
            Materias asignadas
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            ${me.materiaIds.map(id =>
              `<span class="badge badge-gray" style="font-size:12px">Materia ${id}</span>`
            ).join('')}
          </div>
        </div>` : ''}

        <div class="card" style="padding:20px 24px">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted);margin-bottom:14px">
            Acciones
          </div>
          <div id="logout-msg" style="margin-bottom:10px"></div>
          <button class="btn btn-danger" id="btn-logout" style="min-width:160px">
            Cerrar sesión
          </button>
        </div>

      </div>
    </div>

    <style>
      @media (max-width: 600px) {
        .sesion-grid { grid-template-columns: 1fr !important; }
      }
    </style>
  `

  container.querySelector('#btn-logout').addEventListener('click', async () => {
    const btn = container.querySelector('#btn-logout')
    const logoutMsg = container.querySelector('#logout-msg')
    btn.disabled = true
    btn.textContent = 'Cerrando sesión…'
    logoutMsg.innerHTML = '<div class="alert alert-info" style="font-size:13px">Cerrando tu sesión, espera un momento…</div>'
    await logout()
    window.dispatchEvent(new CustomEvent('atara:session-expired'))
  })
}

function fila(label, value) {
  return `
    <div style="display:flex;gap:12px;align-items:baseline">
      <span style="
        font-size:12px;font-weight:600;color:var(--text-muted);
        text-transform:uppercase;letter-spacing:.04em;
        min-width:140px;flex-shrink:0
      ">${label}</span>
      <span style="font-size:13px;color:var(--text)">${value}</span>
    </div>
  `
}

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
