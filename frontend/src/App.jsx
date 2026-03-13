import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';

const PAGE_META = {
  dashboard: { title: 'Dashboard', sub: 'Overview & insights' },
  employees: { title: 'Employees', sub: 'Manage employee records' },
  attendance: { title: 'Attendance', sub: 'Track daily attendance' },
};

export default function App() {
  const [page, setPage] = useState('dashboard');
  const meta = PAGE_META[page];

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-body)',
          },
          success: { iconTheme: { primary: 'var(--success)', secondary: '#fff' } },
          error: { iconTheme: { primary: 'var(--danger)', secondary: '#fff' } },
        }}
      />

      <div className="app-shell">
        <Sidebar activePage={page} setPage={setPage} />

        <main className="main-content">
          <header className="topbar">
            <div>
              <div className="topbar-title">{meta.title}</div>
              <div className="topbar-sub">{meta.sub}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                background: 'var(--bg-hover)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </header>

          {page === 'dashboard' && <Dashboard setPage={setPage} />}
          {page === 'employees' && <Employees />}
          {page === 'attendance' && <Attendance />}
        </main>
      </div>
    </>
  );
}
