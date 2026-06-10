import api from './api';

export const getMetrics = (params) => api.get('/admin/metrics', { params });
