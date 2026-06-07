/**
 * tutorial.js — Tutorial guiado de bienvenida para el personal DOCENTE.
 *
 * Se muestra una sola vez, en el primer ingreso del usuario a la plataforma
 * (el backend marca `primerIngreso=true` en el login inicial y lo limpia acto
 * seguido, por lo que el valor debe leerse del response del login).
 *
 * - `maybeStartTutorial({ rol, primerIngreso })` → lanza el tutorial solo si el
 *    usuario NO es ADMIN y es su primer ingreso.
 * - `startTutorial()` → lo abre siempre (para el botón "Ver tutorial" del menú).
 */
import './tutorial.css'
import logoAtara from './assets/images/logos/logo-atara-transparente.png'

// Respaldo local: si el usuario ya lo vio en este navegador no se reabre solo.
const STORAGE_KEY = 'atara.tutorial.visto'

// ── Iconos (SVG inline, heredan currentColor) ──────────────────────────────
const I = {
  wave: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>`,
  flow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M9 6h6a2 2 0 0 1 2 2v7"/></svg>`,
  layers: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>`,
  cap: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c0 1 2.5 2.5 6 2.5s6-1.5 6-2.5v-5"/></svg>`,
  clipboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="m9 14 2 2 4-4"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  rocket: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
}

// ── Contenido de las diapositivas ──────────────────────────────────────────
const SLIDES = [
  {
    hero: true,
    title: 'Te damos la bienvenida a ATARA',
    desc: 'El <strong>Sistema de Alerta Temprana y Atención al Rendimiento Académico</strong> te ayuda a dar seguimiento a tus estudiantes y a detectar a tiempo quién necesita apoyo. Esta breve guía te muestra cómo.',
    kicker: 'Guía rápida para docentes · 1 minuto',
  },
  {
    icon: I.flow,
    title: 'Tu ciclo de trabajo',
    desc: 'En cada trimestre seguirás siempre el mismo recorrido. No te preocupes por memorizarlo: el menú lateral te acompaña en cada paso.',
    flow: ['Secciones', 'Estudiantes', 'Evaluar', 'Alertas', 'Reportes'],
  },
  {
    icon: I.layers,
    title: 'Tus secciones',
    desc: 'Una <strong>sección</strong> es un grupo de estudiantes a tu cargo. En <strong>Secciones</strong> ves las que tienes asignadas, entras a su detalle y gestionas a tus estudiantes. Solo verás las tuyas: la información de otros docentes permanece privada.',
  },
  {
    icon: I.cap,
    title: 'Estudiantes e importación PIAD',
    desc: 'Registra estudiantes uno por uno o usa <strong>Importar PIAD</strong>: sube la Lista PIAD en PDF y ATARA la lee automáticamente para matricular a tus estudiantes, sin escribirlos a mano.',
  },
  {
    icon: I.clipboard,
    title: 'Evaluación por saberes',
    desc: 'Es el corazón de ATARA. Valoras a cada estudiante por <strong>eje temático</strong> dentro de tres tipos de saber —Conceptual, Procedimental y Actitudinal— usando una escala del <strong>1 al 5</strong>. Solo aparecen los ejes que corresponden al grado de la sección.',
  },
  {
    icon: I.bell,
    title: 'Alertas tempranas automáticas',
    desc: 'A partir de tus evaluaciones, ATARA calcula el promedio de cada eje y genera alertas por ti:',
    alerts: true,
  },
  {
    icon: I.chart,
    title: 'Visualiza y comparte',
    desc: 'En <strong>Visualizaciones</strong> ves la distribución del desempeño de tu sección en gráficos claros. En <strong>Reportes</strong> obtienes el informe individual de cada estudiante, listo para imprimir o exportar a tus reuniones con familias.',
  },
  {
    icon: I.rocket,
    title: '¡Listo para comenzar!',
    desc: 'Ya conoces lo esencial. Empieza por revisar tus <strong>Secciones</strong> y registrar tus primeras evaluaciones. Si quieres repasar esta guía, vuelve a abrirla cuando quieras desde el menú de tu perfil, en <strong>«Ver tutorial»</strong>.',
    kicker: '¡Mucho éxito acompañando a tus estudiantes!',
  },
]

let _active = false
let _idx = 0
let _overlay = null
let _onKey = null

function bodyHtml(slide) {
  const media = slide.hero
    ? `<img src="${logoAtara}" alt="ATARA" class="atut-hero-logo">`
    : `<div class="atut-icon">${slide.icon}</div>`

  let extra = ''
  if (slide.flow) {
    extra = `<div class="atut-flow">${
      slide.flow.map((s, i) =>
        `${i ? '<span class="atut-flow-arrow">→</span>' : ''}<span class="atut-flow-step">${s}</span>`
      ).join('')
    }</div>`
  }
  if (slide.alerts) {
    extra = `
      <div class="atut-alerts">
        <div class="atut-alert-row alta">
          <span class="atut-alert-tag">ALTA</span>
          <div class="atut-alert-info"><b>Promedio ≤ 2,0</b><span>Riesgo crítico: requiere intervención inmediata.</span></div>
        </div>
        <div class="atut-alert-row media">
          <span class="atut-alert-tag">MEDIA</span>
          <div class="atut-alert-info"><b>Promedio 2,1 – 3,0</b><span>Riesgo moderado: conviene dar seguimiento.</span></div>
        </div>
      </div>`
  }

  const kicker = slide.kicker ? `<span class="atut-kicker">${slide.kicker}</span>` : ''

  return `
    ${media}
    <h2 class="atut-title">${slide.title}</h2>
    <p class="atut-desc">${slide.desc}</p>
    ${extra}
    ${kicker}
  `
}

function render() {
  const slide = SLIDES[_idx]
  const total = SLIDES.length
  const esUltima = _idx === total - 1
  const pct = Math.round(((_idx + 1) / total) * 100)

  _overlay.querySelector('.atut-progress-fill').style.width = pct + '%'
  _overlay.querySelector('.atut-step-count').textContent = `Paso ${_idx + 1} de ${total}`

  const body = _overlay.querySelector('.atut-body')
  body.innerHTML = bodyHtml(slide)
  // Reinicia la animación de entrada
  body.style.animation = 'none'
  void body.offsetWidth
  body.style.animation = ''

  _overlay.querySelector('.atut-dots').innerHTML = SLIDES.map((_, i) =>
    `<button class="atut-dot${i === _idx ? ' active' : ''}" data-i="${i}" aria-label="Ir al paso ${i + 1}"></button>`
  ).join('')

  const prev = _overlay.querySelector('.atut-prev')
  prev.disabled = _idx === 0
  _overlay.querySelector('.atut-next').textContent = esUltima ? 'Comenzar a usar ATARA' : 'Siguiente'
  _overlay.querySelector('.atut-skip').style.visibility = esUltima ? 'hidden' : 'visible'
}

function go(i) {
  _idx = Math.max(0, Math.min(SLIDES.length - 1, i))
  render()
}

function close() {
  if (!_active) return
  _active = false
  try { localStorage.setItem(STORAGE_KEY, '1') } catch { /* ignorar */ }
  if (_onKey) document.removeEventListener('keydown', _onKey)
  _onKey = null
  if (_overlay && _overlay.parentNode) {
    _overlay.style.animation = 'atut-fade-in 0.18s ease reverse'
    setTimeout(() => { if (_overlay?.parentNode) _overlay.remove(); _overlay = null }, 160)
  }
}

/** Abre el tutorial desde el principio. Uso manual (botón "Ver tutorial"). */
export function startTutorial() {
  if (_active) return
  _active = true
  _idx = 0

  _overlay = document.createElement('div')
  _overlay.className = 'atut-overlay'
  _overlay.setAttribute('role', 'dialog')
  _overlay.setAttribute('aria-modal', 'true')
  _overlay.setAttribute('aria-label', 'Tutorial de bienvenida de ATARA')
  _overlay.innerHTML = `
    <div class="atut-card" tabindex="-1">
      <div class="atut-accentbar"></div>
      <div class="atut-head">
        <div class="atut-progress"><div class="atut-progress-fill"></div></div>
        <span class="atut-step-count"></span>
        <button class="atut-close" aria-label="Cerrar tutorial">&times;</button>
      </div>
      <div class="atut-body"></div>
      <div class="atut-foot">
        <button class="atut-btn atut-btn-ghost atut-prev">Anterior</button>
        <div class="atut-dots"></div>
        <button class="atut-btn atut-btn-primary atut-next">Siguiente</button>
      </div>
      <div style="text-align:center;padding:0 22px 16px">
        <button class="atut-skip">Omitir tutorial</button>
      </div>
    </div>
  `
  document.body.appendChild(_overlay)

  // Eventos
  _overlay.querySelector('.atut-close').addEventListener('click', close)
  _overlay.querySelector('.atut-skip').addEventListener('click', close)
  _overlay.querySelector('.atut-prev').addEventListener('click', () => go(_idx - 1))
  _overlay.querySelector('.atut-next').addEventListener('click', () => {
    if (_idx === SLIDES.length - 1) close()
    else go(_idx + 1)
  })
  _overlay.querySelector('.atut-dots').addEventListener('click', e => {
    const dot = e.target.closest('.atut-dot')
    if (dot) go(parseInt(dot.dataset.i, 10))
  })
  // No cerrar al hacer clic fuera: evita perder el tutorial por accidente.

  _onKey = e => {
    if (e.key === 'Escape') close()
    else if (e.key === 'ArrowRight') go(_idx + 1)
    else if (e.key === 'ArrowLeft') go(_idx - 1)
  }
  document.addEventListener('keydown', _onKey)

  render()
  _overlay.querySelector('.atut-card').focus()
}

/**
 * Lanza el tutorial solo en el primer ingreso de un docente.
 * El administrador no necesita tutorial.
 */
export function maybeStartTutorial({ rol, primerIngreso } = {}) {
  if (rol === 'ADMIN') return
  if (!primerIngreso) return
  // Pequeño respiro para que la página de inicio termine de renderizar detrás.
  setTimeout(startTutorial, 450)
}
