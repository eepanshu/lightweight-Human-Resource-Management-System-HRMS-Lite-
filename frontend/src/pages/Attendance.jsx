import { useEffect, useState } from 'react';
import { Plus, Search, CalendarCheck, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAttendance, getEmployees, markAttendance } from '../services/api';
import { Loading, EmptyState, Modal, StatusBadge, Avatar, FormField } from '../components/UI';

const today = () => new Date().toISOString().split('T')[0];

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ employee_id: '', date: today(), status: 'Present' });
  const [formErrors, setFormErrors] = useState({});
  const [activeTab, setActiveTab] = useState('list'); // list | mark

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      getAttendance(dateFilter ? { date: dateFilter } : {}),
      getEmployees(),
    ])
      .then(([att, emps]) => { setRecords(att); setEmployees(emps); })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, [dateFilter]);

  const validate = () => {
    const errors = {};
    if (!form.employee_id) errors.employee_id = 'Select an employee';
    if (!form.date) errors.date = 'Date is required';
    if (!form.status) errors.status = 'Status is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await markAttendance(form);
      toast.success('Attendance recorded');
      setShowModal(false);
      setForm({ employee_id: '', date: today(), status: 'Present' });
      setFormErrors({});
      fetchAll();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    const name = r.employee?.full_name?.toLowerCase() || '';
    const empId = r.employee?.employee_id?.toLowerCase() || '';
    const matchSearch = !q || name.includes(q) || empId.includes(q);
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Summary for today
  const todayStr = today();
  const todayRecords = records.filter((r) => r.date === todayStr);
  const presentToday = todayRecords.filter((r) => r.status === 'Present').length;
  const absentToday = todayRecords.filter((r) => r.status === 'Absent').length;

  return (
    <div className="page">
      {/* Mini summary bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: "Present Today", value: presentToday, color: 'var(--success)', bg: 'var(--success-bg)' },
          { label: "Absent Today", value: absentToday, color: 'var(--danger)', bg: 'var(--danger-bg)' },
          { label: "Total Records", value: records.length, color: 'var(--accent-light)', bg: 'var(--accent-glow)' },
        ].map((s) => (
          <div key={s.label} style={{
            background: s.bg, border: `1px solid ${s.color}30`,
            borderRadius: 10, padding: '12px 20px', display: 'flex', gap: 12, alignItems: 'center'
          }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-soft)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Attendance Records</span>

          <div className="filters-row">
            <div className="search-input-wrap">
              <Search size={15} />
              <input
                className="form-input"
                placeholder="Search employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <input
              type="date"
              className="form-input"
              style={{ width: 'auto' }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option>Present</option>
              <option>Absent</option>
            </select>
            {(dateFilter || statusFilter || search) && (
              <button className="btn btn-ghost btn-sm" onClick={() => { setDateFilter(''); setStatusFilter(''); setSearch(''); }}>
                Clear
              </button>
            )}
            <button className="btn btn-primary" onClick={() => { setForm({ employee_id: '', date: today(), status: 'Present' }); setFormErrors({}); setShowModal(true); }}>
              <Plus size={16} /> Mark Attendance
            </button>
          </div>
        </div>

        {loading ? (
          <Loading message="Loading records..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<CalendarCheck size={24} />}
            title="No attendance records"
            description={search || dateFilter || statusFilter ? 'No records match your filters.' : 'Mark attendance to start tracking.'}
            action={!search && !dateFilter && !statusFilter && (
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <Plus size={16} /> Mark Attendance
              </button>
            )}
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Employee ID</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((rec) => (
                  <tr key={rec.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar name={rec.employee?.full_name} />
                        <span style={{ fontWeight: 500, color: 'var(--text)' }}>{rec.employee?.full_name || '—'}</span>
                      </div>
                    </td>
                    <td><span className="emp-id">{rec.employee?.employee_id || '—'}</span></td>
                    <td><span className="badge badge-dept">{rec.employee?.department || '—'}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                      {new Date(rec.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td><StatusBadge status={rec.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mark Attendance Modal */}
      {showModal && (
        <Modal
          title="Mark Attendance"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <span className="loading-spinner" style={{ width: 14, height: 14 }} /> : <CalendarCheck size={15} />}
                Save Record
              </button>
            </>
          }
        >
          <div className="form-grid">
            <FormField label="Employee *" error={formErrors.employee_id}>
              <select
                className={`form-select ${formErrors.employee_id ? 'error' : ''}`}
                value={form.employee_id}
                onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.full_name} ({emp.employee_id})
                  </option>
                ))}
              </select>
            </FormField>

            <div className="form-grid form-grid-2">
              <FormField label="Date *" error={formErrors.date}>
                <input
                  type="date"
                  className={`form-input ${formErrors.date ? 'error' : ''}`}
                  value={form.date}
                  max={today()}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </FormField>
              <FormField label="Status *" error={formErrors.status}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Present', 'Absent'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`btn ${form.status === s ? (s === 'Present' ? 'btn-primary' : 'btn-danger') : 'btn-ghost'}`}
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => setForm({ ...form, status: s })}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </FormField>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '12px 14px', fontSize: '0.8rem', color: 'var(--text-muted)'
            }}>
              💡 If a record already exists for this employee on this date, it will be updated.
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
