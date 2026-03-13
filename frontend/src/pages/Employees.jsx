import { useEffect, useState } from 'react';
import { Plus, Search, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { getEmployees, createEmployee, deleteEmployee } from '../services/api';
import { Loading, EmptyState, Modal, ConfirmDialog, Avatar, StatusBadge, FormField } from '../components/UI';

const DEPARTMENTS = [
  'Engineering', 'Product', 'Design', 'Marketing',
  'Sales', 'HR', 'Finance', 'Operations', 'Legal', 'Support',
];

const EMPTY_FORM = { employee_id: '', full_name: '', email: '', department: '' };

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchEmployees = () => {
    setLoading(true);
    getEmployees()
      .then(setEmployees)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEmployees(); }, []);

  const validate = () => {
    const errors = {};
    if (!form.employee_id.trim()) errors.employee_id = 'Employee ID is required';
    if (!form.full_name.trim()) errors.full_name = 'Full name is required';
    if (!form.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email format';
    if (!form.department) errors.department = 'Department is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createEmployee(form);
      toast.success('Employee added successfully');
      setShowModal(false);
      setForm(EMPTY_FORM);
      setFormErrors({});
      fetchEmployees();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteEmployee(confirmDelete.employee_id);
      toast.success(`${confirmDelete.full_name} removed`);
      setConfirmDelete(null);
      fetchEmployees();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = !q || e.full_name.toLowerCase().includes(q) || e.employee_id.toLowerCase().includes(q) || e.email.toLowerCase().includes(q);
    const matchDept = !deptFilter || e.department === deptFilter;
    return matchSearch && matchDept;
  });

  const uniqueDepts = [...new Set(employees.map((e) => e.department))].sort();

  return (
    <div className="page">
      <div className="card">
        <div className="card-header">
          <span className="card-title">
            Employees
            <span style={{ marginLeft: 10, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
              {employees.length} total
            </span>
          </span>

          <div className="filters-row">
            <div className="search-input-wrap">
              <Search size={15} />
              <input
                className="form-input"
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {uniqueDepts.map((d) => <option key={d}>{d}</option>)}
            </select>
            <button className="btn btn-primary" onClick={() => { setForm(EMPTY_FORM); setFormErrors({}); setShowModal(true); }}>
              <Plus size={16} /> Add Employee
            </button>
          </div>
        </div>

        {loading ? (
          <Loading message="Loading employees..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Users size={24} />}
            title={search || deptFilter ? 'No results found' : 'No employees yet'}
            description={search || deptFilter ? 'Try adjusting your search or filters.' : 'Add your first employee to get started.'}
            action={!search && !deptFilter && (
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <Plus size={16} /> Add Employee
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
                  <th>Email</th>
                  <th>Department</th>
                  <th>Joined</th>
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar name={emp.full_name} />
                        <span style={{ fontWeight: 500, color: 'var(--text)' }}>{emp.full_name}</span>
                      </div>
                    </td>
                    <td><span className="emp-id">{emp.employee_id}</span></td>
                    <td>{emp.email}</td>
                    <td><span className="badge badge-dept">{emp.department}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                      {emp.created_at ? new Date(emp.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--danger)', padding: '6px 8px' }}
                        onClick={() => setConfirmDelete(emp)}
                        title="Delete employee"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {showModal && (
        <Modal
          title="Add New Employee"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <span className="loading-spinner" style={{ width: 14, height: 14 }} /> : <Plus size={15} />}
                Add Employee
              </button>
            </>
          }
        >
          <div className="form-grid">
            <div className="form-grid form-grid-2">
              <FormField label="Employee ID *" error={formErrors.employee_id}>
                <input
                  className={`form-input ${formErrors.employee_id ? 'error' : ''}`}
                  placeholder="e.g. EMP001"
                  value={form.employee_id}
                  onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                />
              </FormField>
              <FormField label="Department *" error={formErrors.department}>
                <select
                  className={`form-select ${formErrors.department ? 'error' : ''}`}
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </FormField>
            </div>
            <FormField label="Full Name *" error={formErrors.full_name}>
              <input
                className={`form-input ${formErrors.full_name ? 'error' : ''}`}
                placeholder="e.g. Priya Sharma"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </FormField>
            <FormField label="Email Address *" error={formErrors.email}>
              <input
                className={`form-input ${formErrors.email ? 'error' : ''}`}
                type="email"
                placeholder="e.g. priya@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </FormField>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Employee"
          message={`Are you sure you want to remove ${confirmDelete.full_name}? All their attendance records will also be deleted.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
