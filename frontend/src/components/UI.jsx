import { X, AlertTriangle, Loader2 } from 'lucide-react';

// ── Loading ──────────────────────────────────────────────────────────────────
export function Loading({ message = 'Loading...' }) {
  return (
    <div className="loading-full">
      <div className="loading-spinner" />
      <span>{message}</span>
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ── Confirm Dialog ───────────────────────────────────────────────────────────
export function ConfirmDialog({ title, message, onConfirm, onCancel, loading }) {
  return (
    <div className="modal-overlay confirm-modal" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal" style={{ maxWidth: 380 }}>
        <div className="modal-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
          <div className="confirm-icon" style={{ margin: '0 auto 16px' }}>
            <AlertTriangle size={22} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>{title}</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{message}</p>
        </div>
        <div className="modal-footer" style={{ justifyContent: 'center' }}>
          <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="loading-spinner" style={{ width: 14, height: 14 }} /> : null}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Badge ────────────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  return (
    <span className={`badge ${status === 'Present' ? 'badge-present' : 'badge-absent'}`}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: status === 'Present' ? 'var(--success)' : 'var(--danger)',
        display: 'inline-block'
      }} />
      {status}
    </span>
  );
}

// ── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ name }) {
  const initials = name?.split(' ').map((n) => n[0]).slice(0, 2).join('') || '?';
  return <div className="avatar">{initials}</div>;
}

// ── Form Input ───────────────────────────────────────────────────────────────
export function FormField({ label, error, children }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      {children}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
