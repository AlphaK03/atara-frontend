import logoUNASvg from '../assets/images/logos/LogoUNA.svg'
import logoDEBpng from '../assets/images/logos/DEB.png'

export function renderAcerca(container) {
  container.innerHTML = `
    <h1>Acerca de ATARA</h1>
    <p class="page-desc">Información sobre el sistema, su origen, propósito e institución responsable.</p>

    <div class="acerca-layout">

      <section class="card acerca-intro">
        <h2 style="margin-top:0">¿Qué es ATARA?</h2>
        <p>ATARA (<strong>Sistema de Alerta Temprana y Atención al Rendimiento Académico</strong>) surgió de una iniciativa académica orientada a fortalecer los procesos de seguimiento pedagógico en la educación primaria costarricense.</p>
        <p>El sistema permite a docentes y coordinadores identificar de manera oportuna a estudiantes que presentan dificultades en su desempeño, facilitando la toma de decisiones pedagógicas sustentadas en datos y el diseño de estrategias de atención diferenciada.</p>
        <p>ATARA organiza la evaluación a partir de saberes conceptuales, procedimentales y actitudinales, distribuidos en ejes temáticos alineados al currículo nacional, y genera alertas automáticas según el nivel de desempeño registrado por periodo lectivo.</p>
      </section>

      <div class="acerca-grid">

        <section class="card acerca-card">
          <div class="acerca-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
            </svg>
          </div>
          <h3 class="acerca-card-title">Misión</h3>
          <p class="acerca-card-text">Identificar oportunamente a estudiantes en riesgo académico para orientar la intervención docente de forma efectiva y sustentada en evidencia pedagógica.</p>
        </section>

        <section class="card acerca-card">
          <div class="acerca-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <h3 class="acerca-card-title">Visión</h3>
          <p class="acerca-card-text">Ser la herramienta de referencia para el seguimiento pedagógico integral en la educación primaria costarricense, promoviendo una cultura de mejora continua basada en datos.</p>
        </section>

        <section class="card acerca-card">
          <div class="acerca-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h3 class="acerca-card-title">Objetivo</h3>
          <p class="acerca-card-text">Proveer a los equipos docentes de un instrumento ágil y comprensible para el registro, análisis y comunicación del rendimiento académico estudiantil por eje temático y periodo.</p>
        </section>

        <section class="card acerca-card">
          <div class="acerca-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <h3 class="acerca-card-title">Población objetivo</h3>
          <p class="acerca-card-text">Docentes, coordinadores y personal académico de centros educativos de primaria, con énfasis en el seguimiento de los seis niveles de la educación general básica.</p>
        </section>

      </div>

      <section class="card acerca-devs">
        <h2 style="margin-top:0">Equipo de desarrollo</h2>
        <div class="acerca-devs-grid">

          <div class="acerca-dev-card">
            <div class="acerca-dev-avatar">KJC</div>
            <div class="acerca-dev-info">
              <p class="acerca-dev-name">Keylor Josué Cortés Cascante</p>
              <p class="acerca-dev-role">Desarrollador de software</p>
              <p class="acerca-dev-school">Escuela de Informática, Universidad Nacional de Costa Rica</p>
            </div>
          </div>

          <div class="acerca-dev-card">
            <div class="acerca-dev-avatar">JLV</div>
            <div class="acerca-dev-info">
              <p class="acerca-dev-name">Jose Luis Valverde Solís</p>
              <p class="acerca-dev-role">Desarrollador de software</p>
              <p class="acerca-dev-school">Escuela de Informática, Universidad Nacional de Costa Rica</p>
            </div>
          </div>

        </div>
      </section>

      <section class="card acerca-inst">
        <h2 style="margin-top:0">Institución responsable</h2>
        <div class="acerca-inst-body">
          <div class="acerca-inst-logo-wrap">
            <img src="${logoDEBpng}" alt="División de Educación Básica, CIDE-UNA" class="acerca-inst-logo-img" />
          </div>
          <div class="acerca-inst-info">
            <p class="acerca-inst-nombre">División de Educación Básica</p>
            <p class="acerca-inst-unidad">Centro de Investigación y Docencia en Educación (CIDE)</p>
            <p class="acerca-inst-unidad">Universidad Nacional de Costa Rica</p>
            <p class="acerca-inst-nota">ATARA es un proyecto académico desarrollado en el marco de las actividades de investigación y extensión de la División de Educación Básica del CIDE, Universidad Nacional de Costa Rica, orientado a la mejora de los procesos de enseñanza y aprendizaje en la educación primaria costarricense.</p>
          </div>
        </div>
      </section>

    </div>

    <style>
      .acerca-layout { display: flex; flex-direction: column; gap: 0; }
      .acerca-intro p { font-size: 14px; line-height: 1.75; color: var(--text); margin-bottom: 12px; }
      .acerca-intro p:last-child { margin-bottom: 0; }

      .acerca-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 14px;
        margin-bottom: 18px;
      }

      .acerca-card { display: flex; flex-direction: column; gap: 10px; margin-bottom: 0; }
      .acerca-card-icon {
        width: 36px; height: 36px;
        background: var(--bg);
        border-radius: var(--radius);
        display: flex; align-items: center; justify-content: center;
        color: var(--primary);
        flex-shrink: 0;
      }
      .acerca-card-icon svg { width: 18px; height: 18px; }
      .acerca-card-title {
        font-family: 'Sora', sans-serif;
        font-size: 14px;
        font-weight: 700;
        color: var(--text);
        margin: 0;
      }
      .acerca-card-text { font-size: 13px; line-height: 1.65; color: var(--text-muted); margin: 0; }

      .acerca-inst-body {
        display: flex;
        gap: 24px;
        align-items: flex-start;
      }
      .acerca-inst-logo-wrap { flex-shrink: 0; }
      .acerca-inst-logo-img {
        width: 100px;
        height: auto;
        object-fit: contain;
        display: block;
      }
      .acerca-inst-nombre {
        font-family: 'Sora', sans-serif;
        font-size: 15px; font-weight: 700;
        color: var(--text); margin: 0 0 4px;
      }
      .acerca-inst-unidad {
        font-size: 13px; font-weight: 600;
        color: var(--primary); margin: 0 0 2px;
      }
      .acerca-inst-nota {
        font-size: 13px; line-height: 1.65;
        color: var(--text-muted); margin: 12px 0 0;
      }

      .acerca-devs-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 14px;
      }
      .acerca-dev-card {
        display: flex;
        gap: 14px;
        align-items: flex-start;
        background: var(--bg);
        border-radius: var(--radius);
        padding: 14px;
      }
      .acerca-dev-avatar {
        flex-shrink: 0;
        width: 44px; height: 44px;
        border-radius: 50%;
        background: var(--primary);
        color: #fff;
        font-family: 'Sora', sans-serif;
        font-size: 12px; font-weight: 700;
        display: flex; align-items: center; justify-content: center;
        letter-spacing: 0.5px;
      }
      .acerca-dev-name {
        font-family: 'Sora', sans-serif;
        font-size: 14px; font-weight: 700;
        color: var(--text); margin: 0 0 3px;
      }
      .acerca-dev-role {
        font-size: 12px; font-weight: 600;
        color: var(--primary); margin: 0 0 4px;
      }
      .acerca-dev-school {
        font-size: 12px; line-height: 1.5;
        color: var(--text-muted); margin: 0;
      }

      @media (max-width: 600px) {
        .acerca-inst-body { flex-direction: column; }
        .acerca-grid { grid-template-columns: 1fr; }
        .acerca-devs-grid { grid-template-columns: 1fr; }
      }
    </style>
  `
}
