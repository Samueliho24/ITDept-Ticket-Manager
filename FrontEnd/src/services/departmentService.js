import api from './api';

export const listDepartments = (params) => api.get('/departments/', { params });
