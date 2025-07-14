
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Request interceptor for adding auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor for handling errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle token expiration
      localStorage.removeItem('jwt');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  getVapidKey: () => api.get('/auth/vapid-public-key'),
};

// Admin endpoints
export const admin = {
  getAllUsers: (roleId) => api.get('/admin/users', { params: { role_id: roleId } }),
  createDepartment: (data) => api.post('/admin/department', data),
  getLogs: (params) => api.get('/admin/logs', { params }),
};

// Role endpoints
export const roles = {
  create: (data) => api.post('/roles', data),
  update: (id, data) => api.put(`/roles/${id}`, data),
  getAll: () => api.get('/roles'),
  getById: (id) => api.get(`/roles/${id}`),
};

// Department endpoints
export const departments = {
  create: (data) => api.post('/departments', data),
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
};

// Complaint endpoints
export const complaints = {
  create: (data) => api.post('/complaints', data),
  getById: (id) => api.get(`/complaints/${id}`),
  getAll: (params) => api.get('/complaints', { params }),
};

// Subadmin task endpoints
export const subadminTasks = {
  getComplaints: () => api.get('/subadmin/complaints'),
  addTask: (data) => api.post('/subadmin/tasks', data),
};

// Notification endpoints
export const notifications = {
  getAll: (params) => api.get('/notifications', { params }),
};

// Helper function to handle API errors
export const handleApiError = (error) => {
  const message = error.response?.data?.error || error.message || 'Something went wrong';
  return { error: message };
};

export default api;
