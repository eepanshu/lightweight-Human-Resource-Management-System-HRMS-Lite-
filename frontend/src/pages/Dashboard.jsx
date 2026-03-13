import { useEffect, useState } from 'react';
import { Users, CalendarCheck, CalendarX, BarChart2, TrendingUp } from 'lucide-react';
import { getDashboard } from '../services/api';
import { Loading, EmptyState } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

export default function Dashboard({ setPage }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading message="Loading dashboard..." />;
  if (error) return (
    <div style={{ padding: 32, color: 'var(--danger)' }}>Failed to load: {error}</div>
  );

  const total = data.total_present + data.total_absent || 1;
  const attendanceRate = Math.round((data.total_present / total) * 100);

  return (
    <div className="page">
      <div className="stats-grid">
        <StatCard icon={<Users size={20} />} color="blue" value={data.total_employees} label="Total Employees" />
        <StatCard icon={<CalendarCheck size={20} />} color="green" value={data.total_present} label="Present Records" />
        <StatCard icon={<CalendarX size={20} />} color="red" value={data.total_absent} label="Absent Records" />
        <StatCard icon={<TrendingUp size={20} />} color="amber" value={`${attendanceRate}%`} label="Attendance Rate" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Dept chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Employees by Department</span>
            <BarChart2 size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="card-body">
            {data.departments.length === 0 ? (
              <EmptyState title="No data yet" description="Add employees to see department breakdown." />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.departments} barSize={28}>
                  <XAxis dataKey="department" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {data.departments.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top attendance */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Top Attendance</span>
            <CalendarCheck size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {data.top_attendance.length === 0 ? (
              <EmptyState title="No attendance data" description="Mark attendance to see leaders." />
            ) : (
              <div>
                {data.top_attendance.map((emp, i) => (
                  <div key={emp.employee_id} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 20px',
                    borderBottom: i < data.top_attendance.length - 1 ? '1px solid var(--border)' : 'none'
                  }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: i === 0 ? 'var(--warning-bg)' : 'rgba(255,255,255,0.06)',
                      color: i === 0 ? 'var(--warning)' : 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700, flexShrink: 0
                    }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, truncate: true }}>{emp.full_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.department}</div>
                    </div>
                    <span className="badge badge-present">{emp.present_days} days</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header"><span className="card-title">Quick Actions</span></div>
        <div className="card-body" style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary" onClick={() => setPage('employees')}>
            <Users size={16} /> Manage Employees
          </button>
          <button className="btn btn-ghost" onClick={() => setPage('attendance')}>
            <CalendarCheck size={16} /> Mark Attendance
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, color, value, label }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
