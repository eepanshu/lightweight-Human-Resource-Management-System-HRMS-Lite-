import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ── Response interceptor for unified error handling ──
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err.response?.data?.detail ||
      (Array.isArray(err.response?.data?.detail)
        ? err.response.data.detail.map((e) => e.msg).join(', ')
        : null) ||
      err.message ||
      'Something went wrong';
    return Promise.reject(new Error(typeof msg === 'string' ? msg : JSON.stringify(msg)));
  }
);

// ── Employees ──
export const getEmployees = () => api.get('/api/employees').then((r) => r.data);
export const createEmployee = (data) => api.post('/api/employees', data).then((r) => r.data);
export const deleteEmployee = (empId) => api.delete(`/api/employees/${empId}`);

// ── Attendance ──
export const getAttendance = (params = {}) =>
  api.get('/api/attendance', { params }).then((r) => r.data);
export const getEmployeeAttendance = (empId, params = {}) =>
  api.get(`/api/attendance/${empId}`, { params }).then((r) => r.data);
export const markAttendance = (data) => api.post('/api/attendance', data).then((r) => r.data);

// ── Dashboard ──
export const getDashboard = () => api.get('/api/dashboard').then((r) => r.data);
