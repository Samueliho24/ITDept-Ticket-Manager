import { createContext, useContext, useState, useCallback } from 'react';
import { loginService } from '../services/authService';

export const ROLES = Object.freeze(['admin', 'technician', 'requestor']);

export const ROLE_LABELS = Object.freeze({
  admin: 'Administrador',
  technician: 'Técnico',
  requestor: 'Solicitante',
});

const AuthContext = createContext(null);

function decodeTokenPayload(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function loadInitialState() {
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  if (storedToken && storedUser) {
    try {
      return { token: storedToken, user: JSON.parse(storedUser) };
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
  return { token: null, user: null };
}

export function AuthProvider({ children }) {
  const [state, setState] = useState(() => loadInitialState());

  const login = useCallback(async (username, password) => {
    const data = await loginService(username, password);
    const payload = decodeTokenPayload(data.access_token);
    const userData = {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
      active: payload.active,
    };
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    setState({ token: data.access_token, user: userData });
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState({ token: null, user: null });
  }, []);

  const isAuthenticated = !!state.token && !!state.user;

  return (
    <AuthContext.Provider value={{ user: state.user, token: state.token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
