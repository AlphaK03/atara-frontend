const BASE = '/api'

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body !== undefined) opts.body = JSON.stringify(body)

  const res = await fetch(BASE + path, opts)
  const text = await res.text()
  const json = text ? JSON.parse(text) : null

  if (!res.ok) {
    const msg = json?.message || json?.error || `Error ${res.status}`
    throw new Error(msg)
  }
  return json
}

// ── Años Lectivos ──────────────────────────────────────────────────────────
export const getAniosLectivos    = ()       => request('GET',  '/anios-lectivos')
export const getAnioLectivoActivo = ()      => request('GET',  '/anios-lectivos/activo')
export const createAnioLectivo   = (data)   => request('POST', '/anios-lectivos', data)
export const activarAnioLectivo  = (id)     => request('PUT',  `/anios-lectivos/${id}/activar`)

// ── Estudiantes ────────────────────────────────────────────────────────────
export const getEstudiantes      = (estado) => request('GET',  `/estudiantes${estado ? `?estado=${estado}` : ''}`)
export const getEstudiante       = (id)     => request('GET',  `/estudiantes/${id}`)
export const createEstudiante    = (data)   => request('POST', '/estudiantes', data)
export const updateEstudiante    = (id, data) => request('PUT', `/estudiantes/${id}`, data)

// ── Matrículas ─────────────────────────────────────────────────────────────
export const createMatricula     = (data)   => request('POST', '/matriculas', data)
export const getMatriculasByEstudiante = (id) => request('GET', `/matriculas/estudiante/${id}`)
export const getMatriculasBySeccion    = (id) => request('GET', `/matriculas/seccion/${id}`)

// ── Evaluaciones ───────────────────────────────────────────────────────────
export const createEvaluacion    = (data)   => request('POST', '/evaluaciones', data)
export const addDetalleEvaluacion = (id, data) => request('POST', `/evaluaciones/${id}/detalles`, data)
export const getEvaluacion       = (id)     => request('GET',  `/evaluaciones/${id}`)
export const getEvaluacionesByEstudiante = (id) => request('GET', `/evaluaciones/estudiante/${id}`)

// ── Alertas ────────────────────────────────────────────────────────────────
export const getAlertasByEstudiante = (studentId, periodId) =>
  request('GET', `/alertas/estudiante/${studentId}${periodId ? `?periodId=${periodId}` : ''}`)
export const getAlertasBySeccion = (sectionId, periodId) =>
  request('GET', `/alertas/seccion/${sectionId}${periodId ? `?periodId=${periodId}` : ''}`)

// ── PIAD ───────────────────────────────────────────────────────────────────
export async function extraerPIAD(archivo) {
  const form = new FormData()
  form.append('archivo', archivo)
  const res = await fetch(BASE + '/piad/extraer', { method: 'POST', body: form })
  const text = await res.text()
  const json = text ? JSON.parse(text) : null
  if (!res.ok) throw new Error(json?.message || json?.error || `Error ${res.status}`)
  return json
}

// ── Health ─────────────────────────────────────────────────────────────────
export const checkHealth = () => fetch('/actuator/health').then(r => r.json())
