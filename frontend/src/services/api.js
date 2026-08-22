import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? 'https://cutnculturesalon.cloud/api' : '/api');

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  verify: () => api.get('/auth/verify'),
};

export const customerAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  import: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/customers/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  export: () => api.get('/customers/export', { responseType: 'blob' }),
  getStats: () => api.get('/customers/stats'),
};

export const templateAPI = {
  getAll: (params) => api.get('/templates', { params }),
  getById: (id) => api.get(`/templates/${id}`),
  create: (data) => api.post('/templates', data),
  update: (id, data) => api.put(`/templates/${id}`, data),
  delete: (id) => api.delete(`/templates/${id}`),
};

export const messageLogAPI = {
  getAll: (params) => api.get('/message-logs', { params }),
  getStats: () => api.get('/message-logs/stats'),
};

export const invoiceAPI = {
  getNextNumber: () => api.get('/invoices/next-number'),
  getAll: (params) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  saveAndSend: (data) => api.post('/invoices/save-and-send', data),
  downloadPdf: (id) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
  resend: (id, phone) => api.post(`/invoices/${id}/resend`, { phone }),
};

export const whatsappAPI = {
  getStatus: () => api.get('/whatsapp/status'),
  initialize: () => api.post('/whatsapp/initialize'),
  logout: () => api.post('/whatsapp/logout'),
  restart: () => api.post('/whatsapp/restart'),
  sendTest: (data) => api.post('/whatsapp/test-message', data),
  sendManual: (data) => api.post('/whatsapp/send-message', data),
  getDashboard: () => api.get('/whatsapp/dashboard'),
  getSettings: () => api.get('/whatsapp/settings'),
  updateSettings: (data) => api.put('/whatsapp/settings', data),
  triggerCron: (job) => api.post(`/whatsapp/cron/${job}`),
};

export default api;
