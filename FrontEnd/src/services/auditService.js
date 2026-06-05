import api from './api';

export const listAuditLogs = (params) => api.get('/admin/audit-logs', { params });
