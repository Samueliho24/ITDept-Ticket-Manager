import api from './api';

export const loginService = (username, password) =>
  api.post('/auth/login', { username, password });

export const authMeService = () =>
  api.get('/auth/me');

export const refreshTokenService = () =>
  api.post('/auth/refresh');

export const logoutService = () =>
  api.post('/auth/logout');
