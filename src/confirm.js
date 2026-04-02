/**
 * confirm.js — Shared dialog utilities for ATARA temp frontend
 *
 * showConfirm({ title, message, confirmText, danger }) → Promise<boolean>
 * openModal(opts) → { el, msgDiv, saveBtn, close() }
 */

export function showConfirm({ title, message, confirmText = 'Eliminar', danger = true }) {
  return new Promise(resolve => {
    const ov = document.createElement('div')
    ov.style.cssText =
      'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:900;' +
      'display:flex;align-items:center;justify-content:center;padding:16px'
    ov.innerHTML = `
      <div style="background:#fff;border-radius:12px;padding:28px;width:440px;max-width:100%;
                  box-shadow:0 25px 60px rgba(0,0,0,.3)">
        <h3 style="margin:0 0 10px;font-size:17px;color:#111">${title}</h3>
        <div style="font-size:13px;color:#374151;line-height:1.75;margin-bottom:24px">${message}</div>
        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button id="dlg-cancel"
            style="padding:8px 18px;border-radius:7px;border:1px solid #d1d5db;
                   background:#fff;font-size:13px;cursor:pointer;font-weight:500">
            Cancelar
          </button>
          <button id="dlg-ok"
            style="padding:8px 20px;border-radius:7px;border:none;
                   background:${danger ? '#dc2626' : '#2563eb'};
                   color:#fff;font-size:13px;font-weight:600;cursor:pointer">
            ${confirmText}
          </button>
        </div>
      </div>
    `
    document.body.appendChild(ov)
    const close = r => { document.body.removeChild(ov); resolve(r) }
    ov.querySelector('#dlg-ok').addEventListener('click', () => close(true))
    ov.querySelector('#dlg-cancel').addEventListener('click', () => close(false))
    ov.addEventListener('click', e => { if (e.target === ov) close(false) })
  })
}

/**
 * Opens a reusable edit modal. Returns controls so the caller can wire up save logic.
 *
 * opts: { title, body (HTML string), saveText }
 * returns: { el (overlay element), bodyEl, msgEl, saveBtn, close() }
 */
export function openModal({ title, body = '', saveText = 'Guardar' }) {
  const ov = document.createElement('div')
  ov.style.cssText =
    'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:800;' +
    'display:flex;align-items:center;justify-content:center;padding:16px'
  ov.innerHTML = `
    <div style="background:#fff;border-radius:12px;padding:28px;width:560px;max-width:100%;
                max-height:90vh;overflow-y:auto;box-shadow:0 25px 60px rgba(0,0,0,.3)">
      <h3 id="modal-title" style="margin:0 0 20px;font-size:17px;color:#111">${title}</h3>
      <div id="modal-body">${body}</div>
      <div id="modal-msg" style="margin-top:12px"></div>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:22px">
        <button id="modal-cancel"
          style="padding:8px 18px;border-radius:7px;border:1px solid #d1d5db;
                 background:#fff;font-size:13px;cursor:pointer;font-weight:500">
          Cancelar
        </button>
        <button id="modal-save" class="btn btn-primary">${saveText}</button>
      </div>
    </div>
  `
  document.body.appendChild(ov)

  const ctrl = {
    el:      ov,
    bodyEl:  ov.querySelector('#modal-body'),
    msgEl:   ov.querySelector('#modal-msg'),
    saveBtn: ov.querySelector('#modal-save'),
    close()  { if (document.body.contains(ov)) document.body.removeChild(ov) },
  }

  ov.querySelector('#modal-cancel').addEventListener('click', ctrl.close)
  ov.addEventListener('click', e => { if (e.target === ov) ctrl.close() })
  return ctrl
}

/** Friendly wrapper for backend errors on unimplemented endpoints. */
export function backendMsg(err) {
  const raw = err?.message || ''
  if (/405|not allowed|501|not implemented/i.test(raw)) {
    return 'Esta operación aún no está disponible en el servidor. ' +
           'Contacte al administrador del sistema para habilitarla.'
  }
  return raw
}
