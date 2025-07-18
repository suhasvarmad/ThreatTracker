import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Alerts
export const triggerAlert = (userId, message) =>
  api.post('/alerts', { userId, message });

export const fetchAlerts = (organizationId) =>
  api.get('/alerts', { params: { organizationId } });

export const classifyAlert = (alertId, type) =>
  api.put(`/alerts/${alertId}`, { type });

export const fetchClassifiedAlerts = (organizationId) =>
  api.get('/it/review', { params: { organizationId } });

export const reviewAlert = (alertId) =>
  api.put(`/alerts/${alertId}/review`);

// 📝 Tickets
export const createTicket = (alertId, description) =>
  api.post('/ticket', { alertId, description });

export const fetchTickets = (organizationId) => {
  console.log('Fetching tickets for org:', organizationId);
  return api.get('/tickets', { params: { organizationId } });
};

export const updateTicketStatus = (ticketId, status) =>
  api.put(`/ticket/${ticketId}`, { status });

// 🔧 Misc
export const testBackend = () => api.get('/test');

export default api;
