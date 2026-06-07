import api from './api';

export const listEquipments = (params) => api.get('/equipments/', { params });

export const getEquipment = (id) => api.get(`/equipments/${id}`);

export const createEquipment = (data) => api.post('/equipments/', data);

export const updateEquipment = (id, data) => api.put(`/equipments/${id}`, data);

export const transferEquipment = (id, data) => api.patch(`/equipments/${id}/location`, data);

export const changeEquipmentStatus = (id, data) => api.patch(`/equipments/${id}/status`, data);
