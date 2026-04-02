import './style.css'
import { checkHealth, getAccessToken, login, logout } from './api.js'
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
}

const content = document.getElementById('page-content')

function navigate(page, params = {}) {
  if (!getAccessToken() && page !== 'login') {
    showLogin()
    return
  }
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page)
  })
  content.innerHTML = '<p class="loading">Cargando...</p>'
  const render = pages[page]
  if (render) render(content, params)
  else content.innerHTML = '<p class="empty">Página no encontrada.</p>'
}

function showLogin(notice = '') {
  content.innerHTML = `
    <div style="max-width:360px;margin:60px auto">
      <h2>Iniciar sesión</h2>
      <div class="form-group"><label>Correo</label>
        <input type="email" id="login-correo" value="admin@atara.mep.go.cr">
      </div>
      <div class="form-group"><label>Contraseña</label>
        <input type="password" id="login-pass" value="Admin1234!">
      </div>
      <button class="btn btn-primary" id="login-btn" style="width:100%">Entrar</button>
      ${notice ? `<div style="margin-top:10px;color:#d97706;font-size:13px;background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;padding:8px 12px">${notice}</div>` : ''}
      <div id="login-error" style="margin-top:10px;color:#dc2626;font-size:13px"></div>
    </div>
  `
  const btn       = content.querySelector('#login-btn')
  const errorDiv  = content.querySelector('#login-error')

  async function doLogin() {
    const correo = content.querySelector('#login-correo').value.trim()
    const pass   = content.querySelector('#login-pass').value
    if (!correo || !pass) {
      errorDiv.textContent = 'Ingrese correo y contraseña.'
      return
    }
    btn.disabled = true
    btn.textContent = 'Ingresando…'
    errorDiv.textContent = ''
    try {
      await login(correo, pass)
      navigate('aniosLectivos')
    } catch (e) {
      errorDiv.textContent = e.message
      btn.disabled = false
      btn.textContent = 'Entrar'
    }
  }

  btn.addEventListener('click', doLogin)
  content.querySelector('#login-pass').addEventListener('keydown', e => {
    if (e.key === 'Enter') doLogin()
  })
  content.querySelector('#login-correo').addEventListener('keydown', e => {
    if (e.key === 'Enter') content.querySelector('#login-pass').focus()
  })
}

window.addEventListener('atara:navigate', e => {
  const { page, params } = e.detail || {}
  if (page) navigate(page, params || {})
  closeSidebar()
})

window.addEventListener('atara:session-expired', () => {
  showLogin('La sesión expiró. Inicia sesión nuevamente.')
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

// Nav click
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault()
    navigate(a.dataset.page)
    closeSidebar()
  })
})

// Health check
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

// Start: show login if no token, otherwise go to main page
if (getAccessToken()) {
  navigate('aniosLectivos')
} else {
  showLogin()
}
