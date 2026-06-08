import api from './api';

export const getMetrics = () => api.get('/admin/metrics');
