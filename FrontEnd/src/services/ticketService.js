import api from './api';

export const createTicket = (data) => api.post('/tickets/', data);

export const listTickets = (params) => api.get('/tickets/', { params });

export const getTicket = (id) => api.get(`/tickets/${id}`);

export const getTicketHistory = (id) => api.get(`/tickets/${id}/history`);

export const cancelTicket = (id, data) => api.patch(`/tickets/${id}/cancel`, data);

export const rateTicket = (id, data) => api.post(`/tickets/${id}/rate`, data);

export const getTicketRating = (id) => api.get(`/tickets/${id}/rating`);
