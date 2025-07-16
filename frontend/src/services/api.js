
import axios from 'axios';
import { getToken, removeToken } from '../utils/cookieStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true // Important for cookies
});

// List of public routes that don't need authentication
const publicRoutes = [
  '/auth/register',
  '/auth/login',
  '/auth/refresh-token',
  '/auth/vapid-public-key'
];

// Request interceptor for adding auth token
api.interceptors.request.use(
  config => {
    // Check if the route is public
    const isPublicRoute = publicRoutes.some(route => config.url.includes(route));
    
    // Only add token for protected routes
    if (!isPublicRoute) {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  response => response,
  error => {
    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        response: {
          data: {
            success: false,
            error: 'Network error. Please check your connection.'
          }
        }
      });
    }

    // Handle 401 errors (unauthorized)
    if (error.response.status === 401) {
      removeToken();
      // Only redirect to login for auth errors on protected routes
      if (!publicRoutes.some(route => error.config.url.includes(route))) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  refreshToken: () => api.post('/auth/refresh-token'),
  getVapidKey: () => api.get('/auth/vapid-public-key'),
  validateToken: () => api.get('/auth/validate-token'),
  getProfile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout')
};

// Admin endpoints
export const admin = {
  getAllUsers: (roleId) => api.get('/admin/users', { params: { role_id: roleId } }),
  createDepartment: (data) => api.post('/departments', data), // Updated to use correct endpoint
  getLogs: (params) => api.get('/admin/logs', { params }),
  testLogs: () => api.get('/admin/test-logs'),
  getDepartments: () => api.get('/departments'), // Updated to use correct endpoint
  createSubadmin: (data) => api.post('/admin/subadmin', data),
  getLogFile: (lines) => api.get('/admin/log-file', { params: { lines } }),
  clearLogFile: () => api.post('/admin/log-file/clear'),
  getLogStats: () => api.get('/admin/log-file/stats'),
  getDashboardStats: (params) => api.get('/admin/dashboard/stats', { params }),
  getDashboardCharts: () => api.get('/admin/dashboard/charts'),
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
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`)
};

// Complaint endpoints
export const complaints = {
  create: (data) => api.post('/complaints', data),
  getById: (id) => api.get(`/complaints/${id}`),
  getAll: (params) => api.get('/complaints', { params }),
  updateStatus: (id, data) => api.put(`/complaints/${id}`, data),
};

// Subadmin task endpoints
export const subadminTasks = {
  getComplaints: () => api.get('/subadmin/complaints'),
  addTask: (data) => api.post('/subadmin/tasks', data),
  updateComplaintStatus: (complaintId, status) => api.put(`/complaints/${complaintId}/status`, { status }),
  completeTask: (taskId) => api.put(`/subadmin/tasks/${taskId}/complete`),
  getTaskById: (taskId) => api.get(`/subadmin/tasks/${taskId}`),
  getTaskForComplaint: (complaintId) => api.get(`/subadmin/tasks/complaint/${complaintId}`),
  updateComplaint: async (complaintId, data) => {
    try {
      const response = await api.put(`/complaints/${complaintId}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

// Notification endpoints
export const notifications = {
  getAll: (params) => api.get('/notifications', { params }),
};

// Helper function to handle API errors
export const handleApiError = (error) => {
  if (error.response?.data) {
    return error.response.data;
  }
  return { error: 'An unexpected error occurred' };
};

export default api;
