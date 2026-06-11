import axios from 'axios';

const publicApi = axios.create({
  baseURL: '/api/v1/public',
  headers: { 'Content-Type': 'application/json' },
});

export const createPublicTicket = (data) => publicApi.post('/tickets', data);

export const getPublicTicket = (ticketNumber) => publicApi.get(`/tickets/${ticketNumber}`);

export const listPublicDepartments = () => publicApi.get('/departments');
