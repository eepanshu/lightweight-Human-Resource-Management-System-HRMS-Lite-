import { LayoutDashboard, Users, CalendarCheck, Menu, X } from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'employees', label: 'Employees', icon: Users },
  { key: 'attendance', label: 'Attendance', icon: CalendarCheck },
];

export default function Sidebar({ activePage, setPage }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="btn btn-ghost btn-sm"
        style={{ position: 'fixed', top: 16, left: 16, zIndex: 300, display: 'none' }}
        id="mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h1>HRMS <span style={{ color: 'var(--accent-light)', fontFamily: 'var(--font-mono)', fontStyle: 'normal', fontSize: '0.7rem' }}>lite</span></h1>
          <span>Human Resource System</span>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`nav-item ${activePage === key ? 'active' : ''}`}
              onClick={() => { setPage(key); setMobileOpen(false); }}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--success)',
              boxShadow: '0 0 6px var(--success)'
            }} />
            <span>Admin Mode</span>
          </div>
          <div style={{ marginTop: 6, color: 'var(--text-muted)', fontSize: '0.7rem' }}>
            v1.0.0
          </div>
        </div>
      </aside>
    </>
  );
}
