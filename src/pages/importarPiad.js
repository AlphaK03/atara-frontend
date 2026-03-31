import { extraerPIAD } from '../api.js'

const TIPOS_ADECUACION = [
  'Sin adecuación',
  'Adecuación de acceso',
  'Adecuación no significativa',
  'Adecuación significativa',
]

const NIVELES = ['Primero', 'Segundo', 'Tercero', 'Cuarto', 'Quinto', 'Sexto']

function opcionesAdecuacion(selected) {
  return TIPOS_ADECUACION.map(t =>
    `<option value="${t}" ${t === selected ? 'selected' : ''}>${t}</option>`
  ).join('')
}

function opcionesNivel(selected) {
  return NIVELES.map(n =>
    `<option value="${n}" ${n === selected ? 'selected' : ''}>${n}</option>`
  ).join('')
}

function filaEditable(est) {
  return `
    <tr data-num="${est.numero}">
      <td style="text-align:center;color:#888;width:36px">${est.numero}</td>
      <td style="width:130px"><input class="cell-input" name="cedula"          value="${est.cedula          || ''}" /></td>
      <td style="width:150px"><input class="cell-input" name="primerApellido"  value="${est.primerApellido  || ''}" /></td>
      <td style="width:150px"><input class="cell-input" name="segundoApellido" value="${est.segundoApellido || ''}" /></td>
      <td style="width:190px"><input class="cell-input" name="nombre"          value="${est.nombre          || ''}" /></td>
      <td style="width:195px">
        <select class="cell-select" name="tipoAdecuacion">
          ${opcionesAdecuacion(est.tipoAdecuacion)}
        </select>
      </td>
      <td style="width:100px">
        <select class="cell-select" name="nivel">
          ${opcionesNivel(est.nivel)}
        </select>
      </td>
      <td style="width:65px"><input class="cell-input" name="grupo" type="number" min="1" value="${est.grupo}" /></td>
      <td style="width:105px"><input class="cell-input" name="fechaMatricula" value="${est.fechaMatricula || ''}" /></td>
    </tr>
  `
}

export function renderImportarPiad(container) {
  container.innerHTML = `
    <h1>Importar Lista PIAD</h1>
    <p class="page-desc">
      Sube el PDF de Lista PIAD generado por SIGCE. El sistema extrae los datos por OCR
      y te permite revisarlos y corregirlos antes de guardar.
    </p>

    <div class="card">
      <h2>1. Seleccionar archivo</h2>

      <div id="drop-zone">
        <div id="drop-inner">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="18" x2="12" y2="12"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
          <p id="drop-label">Arrastra el PDF aquí o haz clic para seleccionar</p>
          <p style="font-size:12px;color:#aaa;margin:0">Solo archivos PDF</p>
        </div>
        <input type="file" id="file-input" accept=".pdf,application/pdf" style="display:none" />
      </div>

      <div id="upload-msg" style="margin-top:12px"></div>

      <div class="btn-row" style="margin-top:16px">
        <button id="btn-extraer" class="btn btn-primary" disabled>Extraer datos</button>
      </div>
    </div>

    <div id="resultado-card" class="card" style="display:none">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h2 style="margin:0">2. Revisar y corregir</h2>
        <span id="conteo-badge" class="badge badge-green"></span>
      </div>
      <p style="color:#666;font-size:13px;margin-bottom:16px">
        Puedes editar cualquier campo directamente en la tabla antes de guardar.
      </p>

      <div class="table-wrap" style="overflow-x:auto">
        <table id="tabla-piad" style="table-layout:fixed;width:100%;min-width:1130px">
          <colgroup>
            <col style="width:36px" />
            <col style="width:130px" />
            <col style="width:150px" />
            <col style="width:150px" />
            <col style="width:190px" />
            <col style="width:195px" />
            <col style="width:100px" />
            <col style="width:65px" />
            <col style="width:105px" />
          </colgroup>
          <thead>
            <tr>
              <th>#</th>
              <th>Cédula</th>
              <th>Primer Apellido</th>
              <th>Segundo Apellido</th>
              <th>Nombre(s)</th>
              <th>Tipo Adecuación</th>
              <th>Nivel</th>
              <th>Grupo</th>
              <th>F. Matrícula</th>
            </tr>
          </thead>
          <tbody id="tbody-piad"></tbody>
        </table>
      </div>

      <div class="btn-row" style="margin-top:20px">
        <button class="btn btn-primary" disabled title="Función disponible cuando la base de datos esté lista">
          Guardar en sistema
        </button>
        <span style="font-size:12px;color:#999;align-self:center">
          — Guardado en base de datos pendiente de implementación
        </span>
      </div>
    </div>

    <style>
      #drop-zone {
        border: 2px dashed #d1d5db;
        border-radius: 10px;
        padding: 40px 24px;
        text-align: center;
        cursor: pointer;
        transition: border-color 0.2s, background 0.2s;
      }
      #drop-zone.drag-over { border-color: #3b82f6; background: #eff6ff; }
      #drop-zone.has-file  { border-color: #10b981; background: #f0fdf4; }
      #drop-inner p { margin: 8px 0 0; color: #555; }
      .cell-input {
        width: 100%;
        border: 1px solid transparent;
        border-radius: 4px;
        padding: 4px 6px;
        font-size: 13px;
        background: transparent;
        transition: border-color 0.15s, background 0.15s;
        box-sizing: border-box;
        white-space: nowrap;
        overflow: visible;
      }
      .cell-input:hover, .cell-input:focus {
        border-color: #93c5fd;
        background: #fff;
        outline: none;
      }
      .cell-select {
        width: 100%;
        border: 1px solid transparent;
        border-radius: 4px;
        padding: 4px 4px;
        font-size: 13px;
        background: transparent;
        cursor: pointer;
        box-sizing: border-box;
      }
      .cell-select:hover, .cell-select:focus {
        border-color: #93c5fd;
        background: #fff;
        outline: none;
      }
      #tabla-piad th {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #tabla-piad td {
        padding: 4px 6px;
        vertical-align: middle;
        overflow: visible;
      }
      #spinner {
        display: inline-block;
        width: 18px; height: 18px;
        border: 3px solid #e5e7eb;
        border-top-color: #3b82f6;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
        vertical-align: middle;
        margin-right: 8px;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  `

  const dropZone    = container.querySelector('#drop-zone')
  const fileInput   = container.querySelector('#file-input')
  const dropLabel   = container.querySelector('#drop-label')
  const uploadMsg   = container.querySelector('#upload-msg')
  const btnExtraer  = container.querySelector('#btn-extraer')
  const resultCard  = container.querySelector('#resultado-card')
  const tbodyPiad   = container.querySelector('#tbody-piad')
  const conteoBadge = container.querySelector('#conteo-badge')

  let archivoSeleccionado = null

  function seleccionarArchivo(file) {
    if (!file) return
    if (file.type !== 'application/pdf') {
      uploadMsg.innerHTML = '<div class="alert alert-error">El archivo debe ser un PDF.</div>'
      return
    }
    archivoSeleccionado = file
    dropLabel.textContent = `📄 ${file.name} (${(file.size / 1024).toFixed(0)} KB)`
    dropZone.classList.add('has-file')
    uploadMsg.innerHTML = ''
    btnExtraer.disabled = false
  }

  // Click en zona de drop
  dropZone.addEventListener('click', () => fileInput.click())
  fileInput.addEventListener('change', () => seleccionarArchivo(fileInput.files[0]))

  // Drag & drop
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over') })
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'))
  dropZone.addEventListener('drop', e => {
    e.preventDefault()
    dropZone.classList.remove('drag-over')
    seleccionarArchivo(e.dataTransfer.files[0])
  })

  // Extraer
  btnExtraer.addEventListener('click', async () => {
    if (!archivoSeleccionado) return

    btnExtraer.disabled = true
    uploadMsg.innerHTML = '<div class="alert" style="background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe"><span id="spinner"></span> Procesando PDF con OCR, esto puede tardar unos segundos...</div>'
    resultCard.style.display = 'none'

    try {
      const datos = await extraerPIAD(archivoSeleccionado)

      if (!datos || datos.length === 0) {
        uploadMsg.innerHTML = '<div class="alert alert-error">No se encontraron estudiantes en el PDF. Verifica que sea una Lista PIAD válida.</div>'
        btnExtraer.disabled = false
        return
      }

      uploadMsg.innerHTML = '<div class="alert alert-success">Extracción completada. Revisa y corrige los datos antes de guardar.</div>'
      conteoBadge.textContent = `${datos.length} estudiante${datos.length !== 1 ? 's' : ''} extraído${datos.length !== 1 ? 's' : ''}`
      tbodyPiad.innerHTML = datos.map(filaEditable).join('')
      resultCard.style.display = ''
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' })

    } catch (err) {
      uploadMsg.innerHTML = `<div class="alert alert-error">Error al extraer: ${err.message}</div>`
      btnExtraer.disabled = false
    }
  })
}
