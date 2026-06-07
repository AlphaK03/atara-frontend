import './style.css'
import logoAtara  from './assets/images/logos/logo-atara-transparente.png'
import logoUNA    from './assets/images/logos/logo_una.webp'
import fondoLogin from './assets/images/backgrounds/fondo login.svg'
import { checkHealth, getAccessToken, getContextoUsuario, login, logout,
         clearAccessToken, clearRefreshToken, clearUserId,
         solicitarResetPassword, confirmarResetPassword, cambiarPassword,
         registro, getMaterias } from './api.js'
import { showToast } from './utils/toast.js'
import { maybeStartTutorial, startTutorial } from './tutorial.js'
import { renderAniosLectivos }    from './pages/aniosLectivos.js'
import { renderEstudiantes }      from './pages/estudiantes.js'
import { renderAlertasTempranas } from './pages/alertasTempranas.js'
import { renderEvaluacionesSaber } from './pages/evaluacionesSaber.js'
import { renderVisualizaciones }  from './pages/visualizaciones.js'
import { renderReportes }         from './pages/reportes.js'
import { renderImportarPiad }     from './pages/importarPiad.js'
import { renderSecciones }        from './pages/secciones.js'
import { renderSesion }           from './pages/sesion.js'
import { renderAdmin }            from './pages/admin.js'
import { renderCentros }          from './pages/centros.js'
import { renderAcerca }           from './pages/acerca.js'

const pages = {
  aniosLectivos:    renderAniosLectivos,
  estudiantes:      renderEstudiantes,
  importarPiad:     renderImportarPiad,
  secciones:        renderSecciones,
  alertasTempranas: renderAlertasTempranas,
  evaluacionesSaber: renderEvaluacionesSaber,
  visualizaciones:  renderVisualizaciones,
  reportes:         renderReportes,
  sesion:           renderSesion,
  admin:            renderAdmin,
  centros:          renderCentros,
  acerca:           renderAcerca,
}

// ── Definición de menú por rol ────────────────────────────────────────────
const NAV_BY_ROL = {
  ADMIN: [
    { section: 'Administración', items: [
      { page: 'admin',   label: 'Gestión de usuarios' },
      { page: 'centros', label: 'Centros educativos' },
    ]},
    { section: 'Gestión', items: [
      { page: 'aniosLectivos', label: 'Años Lectivos' },
      { page: 'secciones',     label: 'Secciones' },
      { page: 'estudiantes',   label: 'Estudiantes' },
      { page: 'importarPiad',  label: 'Importar PIAD' },
    ]},
    { section: 'Sistema', items: [
      { page: 'acerca', label: 'Acerca de ATARA' },
    ]},
  ],
  DOCENTE: [
    { section: 'Gestión', items: [
      { page: 'secciones',         label: 'Secciones' },
      { page: 'estudiantes',       label: 'Estudiantes' },
      { page: 'importarPiad',      label: 'Importar PIAD' },
      { page: 'evaluacionesSaber', label: 'Eval. por Saber' },
    ]},
    { section: 'Análisis', items: [
      { page: 'alertasTempranas', label: 'Alertas Tempranas' },
      { page: 'visualizaciones',  label: 'Visualizaciones' },
      { page: 'reportes',         label: 'Reportes' },
    ]},
    { section: 'Sistema', items: [
      { page: 'acerca', label: 'Acerca de ATARA' },
    ]},
  ],
}
NAV_BY_ROL.COORDINADOR = NAV_BY_ROL.DOCENTE

// Páginas a las que solo puede acceder ADMIN.
// Estudiantes e Importar PIAD se comparten con DOCENTE (también gestionan estudiantes
// y matrículas de sus secciones), por lo que ya no son exclusivas de ADMIN.
const ADMIN_ONLY_PAGES = new Set(['admin', 'centros', 'aniosLectivos'])

const DEFAULT_PAGE = { ADMIN: 'admin', DOCENTE: 'secciones', COORDINADOR: 'secciones' }

// ── Bottom nav definition ─────────────────────────────────────────────────
const SVG_BELL  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`
const SVG_CHART = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`
const SVG_USERS = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`
const SVG_CAP   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 10 12 5 2 10 12 15 22 10"/><polyline points="6 12 6 17 12 21 18 17 18 12"/></svg>`
const SVG_CAL   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
const SVG_CLIP  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`

const BOTTOM_NAV_ITEMS = {
  ADMIN: [
    { page: 'admin',         label: 'Usuarios',    icon: SVG_USERS },
    { page: 'estudiantes',   label: 'Estudiantes', icon: SVG_CAP   },
    { page: 'aniosLectivos', label: 'Años',        icon: SVG_CAL   },
  ],
  DOCENTE: [
    { page: 'evaluacionesSaber', label: 'Evaluaciones', icon: SVG_CLIP  },
    { page: 'alertasTempranas',  label: 'Alertas',      icon: SVG_BELL  },
    { page: 'reportes',          label: 'Reportes',     icon: SVG_CHART },
  ],
}
BOTTOM_NAV_ITEMS.COORDINADOR = BOTTOM_NAV_ITEMS.DOCENTE

// ── Estado global ─────────────────────────────────────────────────────────
let _currentUser = null  // { userId, nombre, apellidos, rol, ... }
// Señal de "primer ingreso" capturada del response del login. El backend la
// limpia durante el login, por lo que NO puede leerse luego desde /api/auth/me;
// se conserva aquí para lanzar el tutorial una vez completado el post-login
// (incluido el flujo de cambio de contraseña forzado de usuarios nuevos).
let _primerIngresoPendiente = false

const content  = document.getElementById('page-content')
const navLinks = document.getElementById('nav-links')

// Logo del sidebar (importado desde assets, Vite lo resuelve con hash)
const sidebarLogoEl = document.getElementById('sidebar-logo')
if (sidebarLogoEl) sidebarLogoEl.src = logoAtara

const footerLogoEl = document.getElementById('footer-logo-una')
if (footerLogoEl) footerLogoEl.src = logoUNA

// ── Render del menú según rol ─────────────────────────────────────────────
function renderBottomNav(rol, activePage = '') {
  const nav = document.getElementById('mobile-bottom-nav')
  if (!nav) return
  const items = BOTTOM_NAV_ITEMS[rol] || []
  nav.innerHTML = items.map(item => `
    <button class="mbn-item${item.page === activePage ? ' active' : ''}" data-page="${item.page}">
      <span class="mbn-icon">${item.icon}</span>
      <span class="mbn-label">${item.label}</span>
    </button>
  `).join('')
  nav.querySelectorAll('.mbn-item').forEach(btn => {
    btn.addEventListener('click', () => { navigate(btn.dataset.page); closeSidebar() })
  })
}

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
  history.pushState({ page, params }, '', '#' + page)
  navLinks.querySelectorAll('a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page)
  })
  document.querySelectorAll('.mbn-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page)
  })
  content.innerHTML = '<p class="loading">Cargando...</p>'
  const render = pages[page]
  if (render) render(content, params)
  else content.innerHTML = '<p class="empty">Página no encontrada.</p>'
}

// ── Login ─────────────────────────────────────────────────────────────────
function showLogin(notice = '') {
  // Ocultar topbar y sidebar (layout de pantalla completa para el login)
  document.getElementById('desktop-topbar').style.display = 'none'
  document.body.classList.add('login-mode')
  updateTopbar(null)
  navLinks.innerHTML = ''

  content.innerHTML = `
    <div class="login-screen">
      <div class="login-left">
        <div class="login-card">
          <div class="login-logo-wrap">
            <img src="${logoAtara}" alt="ATARA" class="login-logo">
          </div>
          <h2 class="login-title">Inicia sesión en tu cuenta</h2>
          <form class="login-form" id="login-form" autocomplete="on">
            <div class="login-field">
              <label for="login-correo">Correo electrónico</label>
              <div class="login-input-group">
                <input type="email" id="login-correo" placeholder="usuario@correo.com" autocomplete="username">
                <span class="login-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2"/>
                    <path d="M3 7l9 6 9-6"/>
                  </svg>
                </span>
              </div>
            </div>
            <div class="login-field">
              <label for="login-pass">Contraseña</label>
              <div class="login-input-group">
                <input type="password" id="login-pass" placeholder="Ingrese su contraseña" autocomplete="current-password">
                <span class="login-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="4" y="11" width="16" height="10" rx="2"/>
                    <path d="M8 11V7a4 4 0 018 0v4"/>
                  </svg>
                </span>
              </div>
            </div>
            ${notice ? `<div class="login-notice">${notice}</div>` : ''}
            <div id="login-error" class="login-error"></div>
            <button type="submit" class="login-submit" id="login-btn">Ingresar</button>
            <button type="button" class="login-forgot" id="btn-forgot">¿Olvidaste tu contraseña?</button>
            <button type="button" class="login-forgot" id="btn-registro">¿Eres nuevo? Crear cuenta</button>
          </form>
        </div>
      </div>
      <div class="login-right">
        <img src="${fondoLogin}" alt="" class="login-illustration" aria-hidden="true">
      </div>
    </div>
  `

  const form     = content.querySelector('#login-form')
  const btn      = content.querySelector('#login-btn')
  const errorDiv = content.querySelector('#login-error')

  async function doLogin(ev) {
    ev?.preventDefault()
    const correo = content.querySelector('#login-correo').value.trim()
    const pass   = content.querySelector('#login-pass').value
    if (!correo || !pass) { errorDiv.textContent = 'Ingrese correo y contraseña.'; return }
    btn.disabled = true
    btn.textContent = 'Ingresando…'
    errorDiv.textContent = ''
    try {
      const loginData = await login(correo, pass)
      _primerIngresoPendiente = !!loginData?.primerIngreso
      if (loginData?.debeCambiarPassword) {
        showCambiarPasswordForzado()
      } else {
        await afterLogin()
      }
    } catch (e) {
      errorDiv.textContent = e.message
      btn.disabled = false
      btn.textContent = 'Ingresar'
    }
  }

  form.addEventListener('submit', doLogin)
  content.querySelector('#btn-forgot').addEventListener('click', showResetStep1)
  content.querySelector('#btn-registro').addEventListener('click', showRegistro)
}

// ── Política de contraseña segura (debe coincidir con @PasswordSegura del backend) ──
const PASSWORD_HINT = 'Mínimo 8 caracteres, con al menos 2 mayúsculas, 2 minúsculas y 2 números.'

/**
 * Revisa la contraseña contra TODOS los factores de la política y devuelve la
 * lista de incumplimientos (cada uno con el motivo explicado). Lista vacía = válida.
 */
function obtenerFallosPassword(pwd) {
  const p = pwd || ''
  const mayusculas = (p.match(/[A-ZÁÉÍÓÚÑÜ]/g) || []).length
  const minusculas = (p.match(/[a-záéíóúñü]/g) || []).length
  const digitos    = (p.match(/[0-9]/g) || []).length
  const fallos = []
  if (p.length < 8) {
    fallos.push(`Es demasiado corta: tiene ${p.length} caracter${p.length === 1 ? '' : 'es'} y se requieren al menos 8.`)
  }
  if (mayusculas < 2) {
    fallos.push(`Faltan mayúsculas: tiene ${mayusculas} y se requieren al menos 2 (por ejemplo A, B, C).`)
  }
  if (minusculas < 2) {
    fallos.push(`Faltan minúsculas: tiene ${minusculas} y se requieren al menos 2 (por ejemplo a, b, c).`)
  }
  if (digitos < 2) {
    fallos.push(`Faltan números: tiene ${digitos} y se requieren al menos 2 (por ejemplo 1, 2, 3).`)
  }
  return fallos
}

/**
 * Valida la contraseña y, si no cumple, muestra un mensaje emergente por cada
 * factor incumplido explicando el motivo. Devuelve true solo si es válida.
 */
function validarPasswordConToasts(pwd) {
  const fallos = obtenerFallosPassword(pwd)
  fallos.forEach((motivo, i) => {
    // Pequeño desfase para que las notificaciones no se solapen exactamente.
    setTimeout(() => showToast(`Contraseña no válida — ${motivo}`, 'error', 6000), i * 120)
  })
  return fallos.length === 0
}

// ── Reset contraseña — paso 1: ingresar correo ────────────────────────────
function showResetStep1() {
  content.innerHTML = `
    <div class="login-screen">
      <div class="login-left">
        <div class="login-card">
          <div class="login-logo-wrap">
            <img src="${logoAtara}" alt="ATARA" class="login-logo">
          </div>
          <h2 class="login-title">Restablecer contraseña</h2>
          <p class="login-subtitle">Ingresa tu correo y te enviaremos un código de verificación.</p>
          <form class="login-form" id="reset-form-1">
            <div class="login-field">
              <label for="reset-correo">Correo electrónico</label>
              <div class="login-input-group">
                <input type="email" id="reset-correo" placeholder="usuario@correo.com" autocomplete="email">
                <span class="login-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>
                  </svg>
                </span>
              </div>
            </div>
            <div id="reset-error-1" class="login-error"></div>
            <button type="submit" class="login-submit" id="reset-btn-1">Enviar código</button>
            <button type="button" class="login-forgot" id="btn-back-login">← Volver al inicio de sesión</button>
          </form>
        </div>
      </div>
      <div class="login-right">
        <img src="${fondoLogin}" alt="" class="login-illustration" aria-hidden="true">
      </div>
    </div>
  `
  const form     = content.querySelector('#reset-form-1')
  const btn      = content.querySelector('#reset-btn-1')
  const errorDiv = content.querySelector('#reset-error-1')

  form.addEventListener('submit', async e => {
    e.preventDefault()
    const correo = content.querySelector('#reset-correo').value.trim()
    if (!correo) { errorDiv.textContent = 'Ingresa tu correo.'; return }
    btn.disabled = true; btn.textContent = 'Enviando…'; errorDiv.textContent = ''
    try {
      await solicitarResetPassword(correo)
      showResetStep2(correo)
    } catch (err) {
      errorDiv.textContent = err.message
      btn.disabled = false; btn.textContent = 'Enviar código'
    }
  })
  content.querySelector('#btn-back-login').addEventListener('click', () => showLogin())
}

// ── Reset contraseña — paso 2: ingresar código + nueva contraseña ─────────
function showResetStep2(correo) {
  content.innerHTML = `
    <div class="login-screen">
      <div class="login-left">
        <div class="login-card">
          <div class="login-logo-wrap">
            <img src="${logoAtara}" alt="ATARA" class="login-logo">
          </div>
          <h2 class="login-title">Ingresa el código</h2>
          <p class="login-subtitle">Enviamos un código de 6 dígitos a <strong>${correo}</strong>. Expira en 15 minutos.</p>
          <form class="login-form" id="reset-form-2">
            <div class="login-field">
              <label for="reset-codigo">Código de verificación</label>
              <div class="login-input-group">
                <input type="text" id="reset-codigo" placeholder="000000" maxlength="6"
                  inputmode="numeric" autocomplete="one-time-code"
                  style="font-size:24px;font-weight:700;letter-spacing:10px;text-align:center">
              </div>
            </div>
            <div class="login-field">
              <label for="reset-nueva">Nueva contraseña</label>
              <div class="login-input-group">
                <input type="password" id="reset-nueva" placeholder="Nueva contraseña" autocomplete="new-password">
                <span class="login-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>
                  </svg>
                </span>
              </div>
              <p class="login-hint">${PASSWORD_HINT}</p>
            </div>
            <div class="login-field">
              <label for="reset-confirmar">Confirmar contraseña</label>
              <div class="login-input-group">
                <input type="password" id="reset-confirmar" placeholder="Repite la contraseña" autocomplete="new-password">
              </div>
            </div>
            <div id="reset-error-2" class="login-error"></div>
            <button type="submit" class="login-submit" id="reset-btn-2">Cambiar contraseña</button>
            <button type="button" class="login-forgot" id="btn-reenviar">¿No llegó el código? Reenviar</button>
          </form>
        </div>
      </div>
      <div class="login-right">
        <img src="${fondoLogin}" alt="" class="login-illustration" aria-hidden="true">
      </div>
    </div>
  `
  const form     = content.querySelector('#reset-form-2')
  const btn      = content.querySelector('#reset-btn-2')
  const errorDiv = content.querySelector('#reset-error-2')

  form.addEventListener('submit', async e => {
    e.preventDefault()
    const codigo    = content.querySelector('#reset-codigo').value.trim()
    const nueva     = content.querySelector('#reset-nueva').value
    const confirmar = content.querySelector('#reset-confirmar').value
    if (!/^\d{6}$/.test(codigo))  { errorDiv.textContent = 'El código debe tener 6 dígitos.'; return }
    if (!validarPasswordConToasts(nueva)) {
      errorDiv.textContent = 'La contraseña no cumple los requisitos de seguridad.'
      return
    }
    if (nueva !== confirmar)  { errorDiv.textContent = 'Las contraseñas no coinciden.'; return }
    btn.disabled = true; btn.textContent = 'Cambiando…'; errorDiv.textContent = ''
    try {
      await confirmarResetPassword(correo, codigo, nueva)
      showLogin('Contraseña actualizada correctamente. Inicia sesión con tu nueva contraseña.')
    } catch (err) {
      errorDiv.textContent = err.message
      btn.disabled = false; btn.textContent = 'Cambiar contraseña'
    }
  })
  content.querySelector('#btn-reenviar').addEventListener('click', async () => {
    try {
      await solicitarResetPassword(correo)
      errorDiv.style.color = 'green'
      errorDiv.textContent = 'Código reenviado. Revisa tu correo.'
      setTimeout(() => { errorDiv.textContent = ''; errorDiv.style.color = '' }, 4000)
    } catch { /* ignorar */ }
  })
}

// ── Auto-registro de docentes ─────────────────────────────────────────────
async function showRegistro() {
  let materias = []
  try {
    materias = await getMaterias()
  } catch { /* mostrar form de todas formas */ }

  content.innerHTML = `
    <div class="login-screen">
      <div class="login-left">
        <div class="login-card">
          <div class="login-logo-wrap">
            <img src="${logoAtara}" alt="ATARA" class="login-logo">
          </div>
          <h2 class="login-title">Crear cuenta</h2>
          <p class="login-subtitle">Solo disponible para correos institucionales: <strong>@una.ac.cr</strong>, <strong>@mep.go.cr</strong>.</p>
          <form class="login-form" id="reg-form" autocomplete="on">
            <div class="login-field">
              <label for="reg-nombre">Nombre</label>
              <div class="login-input-group">
                <input type="text" id="reg-nombre" placeholder="Tu nombre" autocomplete="given-name">
              </div>
            </div>
            <div class="login-field">
              <label for="reg-apellidos">Apellidos</label>
              <div class="login-input-group">
                <input type="text" id="reg-apellidos" placeholder="Tus apellidos" autocomplete="family-name">
              </div>
            </div>
            <div class="login-field">
              <label for="reg-correo">Correo institucional</label>
              <div class="login-input-group">
                <input type="email" id="reg-correo" placeholder="usuario@una.ac.cr" autocomplete="email">
                <span class="login-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2"/>
                    <path d="M3 7l9 6 9-6"/>
                  </svg>
                </span>
              </div>
            </div>
            <div class="login-field">
              <label>Materias que impartes <span style="color:var(--danger)">*</span></label>
              <div class="materia-chips" id="reg-materias">
                ${materias.length
                  ? materias.map(m => `<button type="button" class="materia-chip-toggle" data-id="${m.id}">${m.nombre}</button>`).join('')
                  : '<span style="color:var(--text-muted);font-size:13px">No se pudieron cargar las materias.</span>'}
              </div>
            </div>
            <div class="login-field">
              <label for="reg-pass">Contraseña</label>
              <div class="login-input-group">
                <input type="password" id="reg-pass" placeholder="Nueva contraseña" autocomplete="new-password">
                <span class="login-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>
                  </svg>
                </span>
              </div>
              <p class="login-hint">${PASSWORD_HINT}</p>
            </div>
            <div class="login-field">
              <label for="reg-confirmar">Confirmar contraseña</label>
              <div class="login-input-group">
                <input type="password" id="reg-confirmar" placeholder="Repite la contraseña" autocomplete="new-password">
              </div>
            </div>
            <div id="reg-error" class="login-error"></div>
            <button type="submit" class="login-submit" id="reg-btn">Crear cuenta</button>
            <button type="button" class="login-forgot" id="reg-btn-volver">¿Ya tienes cuenta? Iniciar sesión</button>
          </form>
        </div>
      </div>
      <div class="login-right">
        <img src="${fondoLogin}" alt="" class="login-illustration" aria-hidden="true">
      </div>
    </div>
  `

  const form     = content.querySelector('#reg-form')
  const btn      = content.querySelector('#reg-btn')
  const errorDiv = content.querySelector('#reg-error')

  // Toggle materia chips
  content.querySelectorAll('.materia-chip-toggle').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('selected'))
  })

  content.querySelector('#reg-btn-volver').addEventListener('click', () => showLogin())

  form.addEventListener('submit', async e => {
    e.preventDefault()
    const nombre    = content.querySelector('#reg-nombre').value.trim()
    const apellidos = content.querySelector('#reg-apellidos').value.trim()
    const correo    = content.querySelector('#reg-correo').value.trim()
    const pass      = content.querySelector('#reg-pass').value
    const confirmar = content.querySelector('#reg-confirmar').value
    const materiasIds = [...content.querySelectorAll('.materia-chip-toggle.selected')]
      .map(c => parseInt(c.dataset.id, 10))

    if (!nombre)              { errorDiv.textContent = 'Ingresa tu nombre.'; return }
    if (!apellidos)           { errorDiv.textContent = 'Ingresa tus apellidos.'; return }
    if (!correo)              { errorDiv.textContent = 'Ingresa tu correo institucional.'; return }
    if (materiasIds.length === 0) { errorDiv.textContent = 'Selecciona al menos una materia.'; return }
    if (!validarPasswordConToasts(pass)) {
      errorDiv.textContent = 'La contraseña no cumple los requisitos de seguridad.'
      return
    }
    if (pass !== confirmar)   { errorDiv.textContent = 'Las contraseñas no coinciden.'; return }

    btn.disabled = true; btn.textContent = 'Creando cuenta…'; errorDiv.textContent = ''
    try {
      await registro(nombre, apellidos, correo, pass, materiasIds)
      showLogin('Cuenta creada. Revisa tu correo para verificar tu dirección y luego inicia sesión.')
    } catch (err) {
      errorDiv.textContent = err.message
      btn.disabled = false; btn.textContent = 'Crear cuenta'
    }
  })
}

// ── Cambio de contraseña forzado (primer login) ───────────────────────────
function showCambiarPasswordForzado() {
  document.getElementById('desktop-topbar').style.display = 'none'
  document.body.classList.add('login-mode')

  content.innerHTML = `
    <div class="login-screen">
      <div class="login-left">
        <div class="login-card">
          <div class="login-logo-wrap">
            <img src="${logoAtara}" alt="ATARA" class="login-logo">
          </div>
          <h2 class="login-title">Establece tu contraseña</h2>
          <p class="login-subtitle">Por seguridad, debes crear tu propia contraseña antes de continuar.</p>
          <form class="login-form" id="fp-form">
            <div class="login-field">
              <label for="fp-nueva">Nueva contraseña</label>
              <div class="login-input-group">
                <input type="password" id="fp-nueva" placeholder="Nueva contraseña" autocomplete="new-password">
                <span class="login-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>
                  </svg>
                </span>
              </div>
              <p class="login-hint">${PASSWORD_HINT}</p>
            </div>
            <div class="login-field">
              <label for="fp-confirmar">Confirmar contraseña</label>
              <div class="login-input-group">
                <input type="password" id="fp-confirmar" placeholder="Repite la nueva contraseña" autocomplete="new-password">
              </div>
            </div>
            <div id="fp-error" class="login-error"></div>
            <button type="submit" class="login-submit" id="fp-btn">Establecer contraseña</button>
          </form>
        </div>
      </div>
      <div class="login-right">
        <img src="${fondoLogin}" alt="" class="login-illustration" aria-hidden="true">
      </div>
    </div>
  `

  const form     = content.querySelector('#fp-form')
  const btn      = content.querySelector('#fp-btn')
  const errorDiv = content.querySelector('#fp-error')

  form.addEventListener('submit', async e => {
    e.preventDefault()
    const nueva     = content.querySelector('#fp-nueva').value
    const confirmar = content.querySelector('#fp-confirmar').value
    if (!validarPasswordConToasts(nueva)) {
      errorDiv.textContent = 'La contraseña no cumple los requisitos de seguridad.'
      return
    }
    if (nueva !== confirmar){ errorDiv.textContent = 'Las contraseñas no coinciden.'; return }
    btn.disabled = true; btn.textContent = 'Guardando…'; errorDiv.textContent = ''
    try {
      await cambiarPassword(null, nueva)
      await afterLogin()
    } catch (err) {
      errorDiv.textContent = err.message
      btn.disabled = false; btn.textContent = 'Establecer contraseña'
    }
  })
}

// ── Post-login: cargar contexto y mostrar app ────────────────────────────
async function afterLogin() {
  const me = await getContextoUsuario()
  if (!me) return  // session-expired ya disparado por api.js
  _currentUser = me
  document.body.classList.remove('login-mode')
  document.getElementById('desktop-topbar').style.display = ''
  renderNav(me.rol)
  renderFooterLinks(me.rol)
  updateTopbar(me)
  const bsElA = document.querySelector('.backend-status')
  if (bsElA) bsElA.style.display = me.rol === 'ADMIN' ? 'flex' : 'none'
  const hashPage = window.location.hash.slice(1)
  const startPage = (hashPage && pages[hashPage] && canNavigate(hashPage))
    ? hashPage
    : (DEFAULT_PAGE[me.rol] ?? 'aniosLectivos')
  renderBottomNav(me.rol, startPage)
  navigate(startPage)
  updateTutorialMenuButton(me.rol)
  window.dispatchEvent(new CustomEvent('atara:logged-in'))

  // Tutorial de bienvenida: solo docentes y solo en su primer ingreso.
  maybeStartTutorial({ rol: me.rol, primerIngreso: _primerIngresoPendiente })
  _primerIngresoPendiente = false
}

// El botón "Ver tutorial" del menú de perfil solo tiene sentido para docentes
// (el administrador no usa el tutorial). Permite reabrir la guía cuando se quiera.
function updateTutorialMenuButton(rol) {
  const btn = document.getElementById('topbar-btn-tutorial')
  if (btn) btn.style.display = rol === 'ADMIN' ? 'none' : ''
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
    document.body.classList.remove('login-mode')
    document.getElementById('desktop-topbar').style.display = ''
    renderNav(me.rol)
    updateTopbar(me)
    const bsElB = document.querySelector('.backend-status')
    if (bsElB) bsElB.style.display = me.rol === 'ADMIN' ? 'flex' : 'none'
    const hashPage = window.location.hash.slice(1)
    const startPage = (hashPage && pages[hashPage] && canNavigate(hashPage))
      ? hashPage
      : (DEFAULT_PAGE[me.rol] ?? 'aniosLectivos')
    renderBottomNav(me.rol, startPage)
    navigate(startPage)
    updateTutorialMenuButton(me.rol)
  } catch {
    clearAccessToken(); clearRefreshToken(); clearUserId()
    showLogin()
  }
}

// ── Eventos globales ──────────────────────────────────────────────────────
window.addEventListener('popstate', e => {
  if (e.state?.page) navigate(e.state.page, e.state.params || {})
})

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

document.getElementById('topbar-btn-tutorial')?.addEventListener('click', () => {
  topbarUser?.classList.remove('open')
  startTutorial()
})

document.getElementById('topbar-btn-logout')?.addEventListener('click', async () => {
  topbarUser?.classList.remove('open')
  const btn = document.getElementById('topbar-btn-logout')
  btn.disabled = true
  btn.textContent = 'Cerrando…'
  try {
    await logout()
    _currentUser = null
    showToast('Sesión cerrada correctamente.', 'info')
    window.dispatchEvent(new CustomEvent('atara:session-expired'))
  } finally {
    btn.disabled = false
    btn.textContent = 'Cerrar sesión'
  }
})

// ── Sidebar móvil ──────────────────────────────────────────────────────────
const sidebar  = document.querySelector('.sidebar')
const backdrop = document.getElementById('sidebar-backdrop')
const hamburger = document.getElementById('hamburger')

function closeSidebar() {
  sidebar.classList.remove('open')
  backdrop.classList.remove('visible')
  hamburger?.classList.remove('open')
}

hamburger?.addEventListener('click', () => {
  const isOpen = sidebar.classList.toggle('open')
  backdrop.classList.toggle('visible', isOpen)
  hamburger.classList.toggle('open', isOpen)
})
backdrop.addEventListener('click', closeSidebar)

// ── Footer ────────────────────────────────────────────────────────────────
const footerYearEl = document.getElementById('footer-year')
if (footerYearEl) footerYearEl.textContent = new Date().getFullYear()

const FOOTER_LINKS_BY_ROL = {
  ADMIN: [
    { page: 'sesion', label: 'Mi sesión' },
    { page: 'acerca', label: 'Acerca de ATARA' },
  ],
  DOCENTE: [
    { page: 'sesion',            label: 'Mi sesión' },
    { page: 'alertasTempranas',  label: 'Alertas Tempranas' },
    { page: 'evaluacionesSaber', label: 'Eval. por Saber' },
    { page: 'reportes',          label: 'Reportes' },
    { page: 'acerca',            label: 'Acerca de ATARA' },
  ],
}
FOOTER_LINKS_BY_ROL.COORDINADOR = FOOTER_LINKS_BY_ROL.DOCENTE

function renderFooterLinks(rol) {
  const ul = document.getElementById('footer-links')
  if (!ul) return
  const items = FOOTER_LINKS_BY_ROL[rol] || FOOTER_LINKS_BY_ROL.DOCENTE
  ul.innerHTML = items.map(i =>
    `<li><a href="#${i.page}" data-page="${i.page}">${i.label}</a></li>`
  ).join('')
  ul.querySelectorAll('a[data-page]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault()
      navigate(a.dataset.page)
      closeSidebar()
    })
  })
}

// ── Health check ──────────────────────────────────────────────────────────
async function pingBackend() {
  const dot   = document.getElementById('status-dot')
  const label = document.getElementById('status-label')
  try {
    const data = await checkHealth()
    const up = data?.status === 'UP'
    dot.className   = `dot ${up ? 'up' : 'down'}`
    label.textContent = up ? 'En línea' : 'Error de conexión'
  } catch {
    dot.className   = 'dot down'
    label.textContent = 'Sin conexión'
  }
}

pingBackend()
setInterval(pingBackend, 15000)

// ── Arranque ──────────────────────────────────────────────────────────────
bootstrap()
