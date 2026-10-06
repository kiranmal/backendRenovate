import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

/* ---------- Toast ---------- */
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = '') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="adm adm-toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={`adm-toast ${t.type}`}>{t.message}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------- Confirm dialog ---------- */
const ConfirmCtx = createContext(() => {});
export const useConfirm = () => useContext(ConfirmCtx);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const confirm = useCallback((opts) => new Promise((resolve) => {
    setState({ ...opts, resolve });
  }), []);
  const close = (val) => { state?.resolve(val); setState(null); };
  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      {state && (
        <div className="adm adm-modal-bg" onClick={() => close(false)}>
          <div className="adm-modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-head">
              <h3>{state.title || 'Confirm'}</h3>
              <button className="adm-modal-close" onClick={() => close(false)}>×</button>
            </div>
            <div className="adm-modal-body">
              <p style={{ margin: 0, color: 'var(--text-2)' }}>{state.message || 'Are you sure?'}</p>
            </div>
            <div className="adm-modal-foot">
              <button className="adm-btn" onClick={() => close(false)}>Cancel</button>
              <button className={`adm-btn ${state.danger ? 'adm-btn-danger' : 'adm-btn-primary'}`} onClick={() => close(true)}>
                {state.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmCtx.Provider>
  );
}

/* ---------- Modal ---------- */
export function Modal({ open, onClose, title, children, footer, size }) {
  if (!open) return null;
  return (
    <div className="adm adm-modal-bg" onClick={onClose}>
      <div className={`adm-modal ${size === 'lg' ? 'lg' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="adm-modal-head">
          <h3>{title}</h3>
          <button className="adm-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="adm-modal-body">{children}</div>
        {footer && <div className="adm-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- Badge ---------- */
export function Badge({ status, children }) {
  const cls = ['new', 'contacted', 'done', 'published', 'draft', 'featured'].includes(status) ? status : '';
  return <span className={`adm-badge ${cls} dot`}>{children || status}</span>;
}

/* ---------- Field ---------- */
export function Field({ label, required, hint, error, children }) {
  return (
    <div className="adm-field">
      {label && <label>{label}{required && <span className="req"> *</span>}</label>}
      {children}
      {hint && <div className="hint">{hint}</div>}
      {error && <div className="adm-err">{error}</div>}
    </div>
  );
}

export function Input(props) { return <input className="adm-input" {...props} />; }
export function Textarea(props) { return <textarea className="adm-textarea" {...props} />; }
export function Select(props) { return <select className="adm-select" {...props} />; }

/* ---------- Skeleton ---------- */
export function Skeleton({ w = '100%', h = 16, r = 6, style }) {
  return <div className="adm-skel" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

export function TableSkeleton({ rows = 6, cols = 4 }) {
  return (
    <div style={{ padding: '1rem 1.25rem' }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: '1rem', marginBottom: '.85rem' }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} h={14} style={{ flex: 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---------- Empty ---------- */
export function Empty({ icon = '✦', title, sub, action }) {
  return (
    <div className="adm-empty">
      <div className="adm-empty-ico">{icon}</div>
      <p>{title}</p>
      {sub && <span>{sub}</span>}
      {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
    </div>
  );
}

/* ---------- Pagination ---------- */
export function Pagination({ page, pages, setPage }) {
  if (pages <= 1) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '.3rem', padding: '1rem' }}>
      <button className="adm-btn adm-btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>‹ Prev</button>
      <span style={{ padding: '.35rem .8rem', fontSize: '.82rem', color: 'var(--muted)' }}>Page {page} of {pages}</span>
      <button className="adm-btn adm-btn-sm" disabled={page === pages} onClick={() => setPage(page + 1)}>Next ›</button>
    </div>
  );
}

/* ---------- Image picker (uses media library) ---------- */
export function ImagePicker({ value, onChange, label }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const token = localStorage.getItem('admin_token');
  const API = (window.__ADM_API__ || '').replace(/\/api$/, '');

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await fetch(`${window.__ADM_API__}/admin/images`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
      });
      const data = await res.json();
      if (data.success) onChange(`${API}${data.image.url}`);
    } catch { /* ignore */ }
    setUploading(false);
  };

  return (
    <Field label={label || 'Image'}>
      <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
        {value ? (
          <img src={value} alt="" style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }} />
        ) : (
          <div style={{ width: 64, height: 64, borderRadius: 8, background: 'var(--surface-2)', border: '1px dashed var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>✦</div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
          <button type="button" className="adm-btn adm-btn-sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading…' : value ? 'Replace' : 'Upload'}
          </button>
          {value && <button type="button" className="adm-btn adm-btn-sm adm-btn-ghost" onClick={() => onChange('')}>Remove</button>}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => { upload(e.target.files[0]); e.target.value = ''; }} />
    </Field>
  );
}

/* ---------- useApi hook ---------- */
export function useApi() {
  const token = localStorage.getItem('admin_token');
  const call = useCallback(async (path, opts = {}) => {
    const res = await fetch(`${window.__ADM_API__}${path}`, {
      ...opts,
      headers: { Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
    });
    if (res.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.hash = '#/admin';
      throw new Error('unauthorized');
    }
    return res.json();
  }, [token]);
  return call;
}

/* ---------- relative time ---------- */
export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function fmtSize(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}
