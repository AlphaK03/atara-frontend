import { getMe, logout } from '../api.js'

export async function renderSesion(container) {
  container.innerHTML = '<p class="loading">Cargando sesión…</p>'

  const me = await getMe()
  if (!me) return // sesión expiró; api.js ya dispara atara:session-expired

  const rolLabel = {
    ADMIN:        'Administrador',
    DOCENTE:      'Docente',
    COORDINADOR:  'Coordinador',
  }[me.rol] ?? me.rol

  container.innerHTML = `
    <h1>Sesión activa</h1>
    <div class="card" style="max-width:480px;margin-top:20px;padding:24px">
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:var(--text-muted);width:130px">Nombre</td>
            <td style="padding:8px 0;font-weight:600">${me.nombre} ${me.apellidos}</td></tr>
        <tr><td style="padding:8px 0;color:var(--text-muted)">Correo</td>
            <td style="padding:8px 0">${me.correo}</td></tr>
        <tr><td style="padding:8px 0;color:var(--text-muted)">Rol</td>
            <td style="padding:8px 0">
              <span class="badge">${rolLabel}</span>
            </td></tr>
        ${me.seccionIds?.length ? `
        <tr><td style="padding:8px 0;color:var(--text-muted);vertical-align:top">Secciones</td>
            <td style="padding:8px 0">${me.seccionIds.join(', ')}</td></tr>` : ''}
        ${me.materiaIds?.length ? `
        <tr><td style="padding:8px 0;color:var(--text-muted);vertical-align:top">Materias</td>
            <td style="padding:8px 0">${me.materiaIds.join(', ')}</td></tr>` : ''}
      </table>
      <hr style="margin:20px 0;border:none;border-top:1px solid var(--border)">
      <button class="btn btn-danger" id="btn-logout" style="min-width:140px">Cerrar sesión</button>
    </div>
  `

  container.querySelector('#btn-logout').addEventListener('click', async () => {
    const btn = container.querySelector('#btn-logout')
    btn.disabled = true
    btn.textContent = 'Cerrando…'
    await logout()
    window.dispatchEvent(new CustomEvent('atara:session-expired'))
  })
}
