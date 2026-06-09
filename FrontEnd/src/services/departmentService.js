import api from './api';

export const listDepartments = (params) => api.get('/departments/', { params });
export const createDepartment = (data) => api.post('/departments/', data);
export const updateDepartment = (id, data) => api.put(`/departments/${id}`, data);
export const deleteDepartment = (id) => api.delete(`/departments/${id}`);
export const toggleDepartmentStatus = (id) => api.patch(`/departments/${id}/status`);
