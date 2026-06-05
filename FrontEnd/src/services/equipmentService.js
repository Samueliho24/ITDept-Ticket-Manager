import api from './api';

export const listEquipments = (params) => api.get('/equipment/', { params });

export const getEquipment = (id) => api.get(`/equipment/${id}`);
