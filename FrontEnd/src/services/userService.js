import api from './api';

export const listUsers = (params) => api.get('/users/', { params });
export const createUser = (data) => api.post('/users/', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const toggleUserStatus = (id, active) => api.patch(`/users/${id}/status`, { active });
export const changeUserPassword = (id, data) => api.patch(`/users/${id}/password`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
