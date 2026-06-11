import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { loginService, authMeService, refreshTokenService, logoutService } from '../services/authService';

export const ROLES = Object.freeze(['admin', 'technician', 'requestor']);

export const ROLE_LABELS = Object.freeze({
  admin: 'Administrador',
  technician: 'Técnico',
  requestor: 'Solicitante',
});

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { user: null, loading: true };
  });
  const refreshTimerRef = useRef(null);

  const startRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    refreshTimerRef.current = setInterval(async () => {
      try {
        await refreshTokenService();
      } catch {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
        setState({ user: null, loading: false });
        window.location.href = '/login';
      }
    }, 15 * 60 * 1000);
  }, []);

  const stopRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    authMeService()
      .then((res) => {
        setState({ user: res.data, loading: false });
        startRefreshTimer();
      })
      .catch(() => {
        setState({ user: null, loading: false });
      });
    return () => stopRefreshTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await loginService(username, password);
    const userData = res.data;
    setState({ user: userData, loading: false });
    startRefreshTimer();
    return userData;
  }, [startRefreshTimer]);

  const logout = useCallback(async () => {
    try {
      await logoutService();
    } catch {
      // even if request fails, clear local state
    }
    stopRefreshTimer();
    setState({ user: null, loading: false });
  }, [stopRefreshTimer]);

  const isAuthenticated = !!state.user;

  return (
    <AuthContext.Provider value={{ user: state.user, login, logout, isAuthenticated, loading: state.loading }}>
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
