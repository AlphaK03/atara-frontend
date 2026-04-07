import './style.css'
import { checkHealth, getAccessToken, getContextoUsuario, login, logout,
         clearAccessToken, clearRefreshToken, clearUserId } from './api.js'
import { renderAniosLectivos }    from './pages/aniosLectivos.js'
import { renderEstudiantes }      from './pages/estudiantes.js'
import { renderMatriculas }       from './pages/matriculas.js'
import { renderEvaluaciones }     from './pages/evaluaciones.js'
import { renderAlertas }          from './pages/alertas.js'
import { renderAlertasTempranas } from './pages/alertasTempranas.js'
import { renderEvaluacionesSaber } from './pages/evaluacionesSaber.js'
import { renderVisualizaciones }  from './pages/visualizaciones.js'
import { renderReportes }         from './pages/reportes.js'
import { renderImportarPiad }     from './pages/importarPiad.js'
import { renderSecciones }        from './pages/secciones.js'
import { renderSesion }           from './pages/sesion.js'
import { renderAdmin }            from './pages/admin.js'

const pages = {
  aniosLectivos:    renderAniosLectivos,
  estudiantes:      renderEstudiantes,
  importarPiad:     renderImportarPiad,
  secciones:        renderSecciones,
  matriculas:       renderMatriculas,
  evaluaciones:     renderEvaluaciones,
  alertas:          renderAlertas,
  alertasTempranas: renderAlertasTempranas,
  evaluacionesSaber: renderEvaluacionesSaber,
  visualizaciones:  renderVisualizaciones,
  reportes:         renderReportes,
  sesion:           renderSesion,
  admin:            renderAdmin,
}

// ── Definición de menú por rol ────────────────────────────────────────────
const NAV_BY_ROL = {
  ADMIN: [
    { section: 'Administración', items: [
      { page: 'admin', label: 'Gestión de usuarios' },
    ]},
    { section: 'Gestión', items: [
      { page: 'aniosLectivos', label: 'Años Lectivos' },
      { page: 'estudiantes',   label: 'Estudiantes' },
      { page: 'importarPiad',  label: 'Importar PIAD' },
    ]},
  ],
  DOCENTE: [
    { section: 'Gestión', items: [
      { page: 'secciones',         label: 'Secciones' },
      { page: 'evaluacionesSaber', label: 'Eval. por Saber' },
    ]},
    { section: 'Análisis', items: [
      { page: 'alertasTempranas', label: 'Alertas Tempranas' },
      { page: 'visualizaciones',  label: 'Visualizaciones' },
      { page: 'reportes',         label: 'Reportes' },
    ]},
  ],
}
NAV_BY_ROL.COORDINADOR = NAV_BY_ROL.DOCENTE

// Páginas a las que solo puede acceder ADMIN
const ADMIN_ONLY_PAGES = new Set(['admin', 'aniosLectivos', 'estudiantes', 'importarPiad'])

const DEFAULT_PAGE = { ADMIN: 'admin', DOCENTE: 'secciones', COORDINADOR: 'secciones' }

// ── Estado global ─────────────────────────────────────────────────────────
let _currentUser = null  // { userId, nombre, apellidos, rol, ... }

const content  = document.getElementById('page-content')
const navLinks = document.getElementById('nav-links')

// ── Render del menú según rol ─────────────────────────────────────────────
function renderNav(rol) {
  const sections = NAV_BY_ROL[rol] || NAV_BY_ROL.DOCENTE
  navLinks.innerHTML = `
    <li class="nav-section-label">Usuario</li>
    <li><a href="#" data-page="sesion">Mi sesión</a></li>
    ${sections.map(s => `
      <li class="nav-section-label">${s.section}</li>
      ${s.items.map(i => `<li><a href="#" data-page="${i.page}">${i.label}</a></li>`).join('')}
    `).join('')}
  `
  // Re-bind click events para los nuevos <a>
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault()
      navigate(a.dataset.page)
      closeSidebar()
    })
  })
}

// ── Actualizar topbar ────────────────────────────────────────────────────
function updateTopbar(me) {
  if (!me) {
    document.getElementById('topbar-nombre').textContent = '—'
    document.getElementById('topbar-rol').textContent = '—'
    document.getElementById('topbar-avatar').textContent = '?'
    return
  }
  const rolLabel = { ADMIN: 'Administrador', DOCENTE: 'Docente', COORDINADOR: 'Coordinador' }[me.rol] ?? me.rol
  document.getElementById('topbar-nombre').textContent = `${me.nombre} ${me.apellidos}`
  document.getElementById('topbar-rol').textContent = rolLabel
  document.getElementById('topbar-avatar').textContent = (me.nombre?.[0] ?? '?').toUpperCase()
  document.getElementById('topbar-title').textContent =
    me.rol === 'ADMIN' ? 'Administración ATARA' : 'ATARA — Sistema de Alertas'
}

// ── Guard de navegación por rol ──────────────────────────────────────────
function canNavigate(page) {
  if (!_currentUser) return false
  if (ADMIN_ONLY_PAGES.has(page) && _currentUser.rol !== 'ADMIN') return false
  return true
}

// ── navigate ──────────────────────────────────────────────────────────────
function navigate(page, params = {}) {
  if (!getAccessToken() && page !== 'login') {
    showLogin()
    return
  }
  if (!canNavigate(page)) {
    content.innerHTML = '<p class="empty">No tienes permiso para acceder a esta sección.</p>'
    return
  }
  navLinks.querySelectorAll('a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page)
  })
  content.innerHTML = '<p class="loading">Cargando...</p>'
  const render = pages[page]
  if (render) render(content, params)
  else content.innerHTML = '<p class="empty">Página no encontrada.</p>'
}

// ── Login ─────────────────────────────────────────────────────────────────
function showLogin(notice = '') {
  // Ocultar topbar de escritorio en la pantalla de login
  document.getElementById('desktop-topbar').style.display = 'none'
  updateTopbar(null)
  navLinks.innerHTML = ''

  content.innerHTML = `
    <div style="max-width:360px;margin:60px auto">
      <h2>Iniciar sesión</h2>
      <div class="form-group"><label>Correo</label>
        <input type="email" id="login-correo" value="admin@atara.mep.go.cr">
      </div>
      <div class="form-group"><label>Contraseña</label>
        <input type="password" id="login-pass" value="Admin1234!">
      </div>
      <button class="btn btn-primary" id="login-btn" style="width:100%;margin-top:8px">Entrar</button>
      ${notice ? `<div style="margin-top:10px;color:#d97706;font-size:13px;background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;padding:8px 12px">${notice}</div>` : ''}
      <div id="login-error" style="margin-top:10px;color:#dc2626;font-size:13px"></div>
    </div>
  `
  const btn       = content.querySelector('#login-btn')
  const errorDiv  = content.querySelector('#login-error')

  async function doLogin() {
    const correo = content.querySelector('#login-correo').value.trim()
    const pass   = content.querySelector('#login-pass').value
    if (!correo || !pass) { errorDiv.textContent = 'Ingrese correo y contraseña.'; return }
    btn.disabled = true
    btn.textContent = 'Ingresando…'
    errorDiv.textContent = ''
    try {
      await login(correo, pass)
      // login limpia _meCache en api.js; bootstrap lo recargará
      await afterLogin()
    } catch (e) {
      errorDiv.textContent = e.message
      btn.disabled = false
      btn.textContent = 'Entrar'
    }
  }

  btn.addEventListener('click', doLogin)
  content.querySelector('#login-pass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin() })
  content.querySelector('#login-correo').addEventListener('keydown', e => { if (e.key === 'Enter') content.querySelector('#login-pass').focus() })
}

// ── Post-login: cargar contexto y mostrar app ────────────────────────────
async function afterLogin() {
  const me = await getContextoUsuario()
  if (!me) return  // session-expired ya disparado por api.js
  _currentUser = me
  document.getElementById('desktop-topbar').style.display = ''
  renderNav(me.rol)
  updateTopbar(me)
  const defaultPage = DEFAULT_PAGE[me.rol] ?? 'aniosLectivos'
  navigate(defaultPage)
  window.dispatchEvent(new CustomEvent('atara:logged-in'))
}

// ── Bootstrap: valida token antes de mostrar cualquier contenido ──────────
async function bootstrap() {
  // Ocultar topbar hasta verificar si hay sesión activa
  document.getElementById('desktop-topbar').style.display = 'none'
  if (!getAccessToken()) {
    showLogin()
    return
  }
  // Mostrar indicador de validación mientras se verifica la sesión
  content.innerHTML = '<p class="loading">Verificando sesión…</p>'
  try {
    const me = await getContextoUsuario()
    if (!me) {
      // api.js ya despachó atara:session-expired → lo maneja el listener de abajo
      return
    }
    _currentUser = me
    document.getElementById('desktop-topbar').style.display = ''
    renderNav(me.rol)
    updateTopbar(me)
    navigate(DEFAULT_PAGE[me.rol] ?? 'aniosLectivos')
  } catch {
    clearAccessToken(); clearRefreshToken(); clearUserId()
    showLogin()
  }
}

// ── Eventos globales ──────────────────────────────────────────────────────
window.addEventListener('atara:navigate', e => {
  const { page, params } = e.detail || {}
  if (page) navigate(page, params || {})
  closeSidebar()
})

window.addEventListener('atara:session-expired', () => {
  _currentUser = null
  showLogin('La sesión expiró. Inicia sesión nuevamente.')
})

// ── Topbar: toggle dropdown ───────────────────────────────────────────────
const topbarUser = document.getElementById('topbar-user')
topbarUser?.addEventListener('click', e => {
  topbarUser.classList.toggle('open')
  e.stopPropagation()
})
document.addEventListener('click', () => {
  topbarUser?.classList.remove('open')
})

document.getElementById('topbar-btn-sesion')?.addEventListener('click', () => {
  topbarUser?.classList.remove('open')
  navigate('sesion')
})

document.getElementById('topbar-btn-logout')?.addEventListener('click', async () => {
  topbarUser?.classList.remove('open')
  const btn = document.getElementById('topbar-btn-logout')
  btn.disabled = true
  btn.textContent = 'Cerrando…'
  await logout()
  _currentUser = null
  window.dispatchEvent(new CustomEvent('atara:session-expired'))
})

// ── Sidebar móvil ──────────────────────────────────────────────────────────
const sidebar  = document.querySelector('.sidebar')
const backdrop = document.getElementById('sidebar-backdrop')
const hamburger = document.getElementById('hamburger')

function closeSidebar() {
  sidebar.classList.remove('open')
  backdrop.classList.remove('visible')
}

hamburger?.addEventListener('click', () => {
  const isOpen = sidebar.classList.toggle('open')
  backdrop.classList.toggle('visible', isOpen)
})
backdrop.addEventListener('click', closeSidebar)

// ── Health check ──────────────────────────────────────────────────────────
async function pingBackend() {
  const dot   = document.getElementById('status-dot')
  const label = document.getElementById('status-label')
  try {
    const data = await checkHealth()
    const up = data?.status === 'UP'
    dot.className   = `dot ${up ? 'up' : 'down'}`
    label.textContent = up ? 'Backend UP' : 'Backend DOWN'
  } catch {
    dot.className   = 'dot down'
    label.textContent = 'Sin conexión'
  }
}

pingBackend()
setInterval(pingBackend, 15000)

// ── Arranque ──────────────────────────────────────────────────────────────
bootstrap()
