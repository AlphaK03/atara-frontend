import './style.css'
import { checkHealth } from './api.js'
import { renderAniosLectivos }    from './pages/aniosLectivos.js'
import { renderEstudiantes }      from './pages/estudiantes.js'
import { renderMatriculas }       from './pages/matriculas.js'
import { renderEvaluaciones }     from './pages/evaluaciones.js'
import { renderAlertas }          from './pages/alertas.js'
import { renderAlertasTempranas } from './pages/alertasTempranas.js'
import { renderVisualizaciones }  from './pages/visualizaciones.js'
import { renderReportes }         from './pages/reportes.js'
import { renderImportarPiad }     from './pages/importarPiad.js'

const pages = {
  aniosLectivos:    renderAniosLectivos,
  estudiantes:      renderEstudiantes,
  importarPiad:     renderImportarPiad,
  matriculas:       renderMatriculas,
  evaluaciones:     renderEvaluaciones,
  alertas:          renderAlertas,
  alertasTempranas: renderAlertasTempranas,
  visualizaciones:  renderVisualizaciones,
  reportes:         renderReportes,
}

const content = document.getElementById('page-content')

function navigate(page, params = {}) {
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page)
  })
  content.innerHTML = '<p class="loading">Cargando...</p>'
  const render = pages[page]
  if (render) render(content, params)
  else content.innerHTML = '<p class="empty">Página no encontrada.</p>'
}

window.addEventListener('atara:navigate', e => {
  const { page, params } = e.detail || {}
  if (page) navigate(page, params || {})
  closeSidebar()
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
    closeSidebar()   // cierra el menú en móvil al seleccionar página
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
navigate('aniosLectivos')
