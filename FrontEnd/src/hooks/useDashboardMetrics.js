import { useState, useEffect, useRef, useCallback } from 'react';
import { getMetrics } from '../services/metricsService';

export default function useDashboardMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const refetch = useCallback((params) => {
    setLoading(true);
    setError(null);
    getMetrics(params)
      .then((res) => { if (mountedRef.current) setMetrics(res.data); })
      .catch((err) => { if (mountedRef.current) setError(err.response?.data?.detail || 'Error al cargar métricas'); })
      .finally(() => { if (mountedRef.current) setLoading(false); });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    getMetrics()
      .then((res) => { if (mountedRef.current) setMetrics(res.data); })
      .catch((err) => { if (mountedRef.current) setError(err.response?.data?.detail || 'Error al cargar métricas'); })
      .finally(() => { if (mountedRef.current) setLoading(false); });
    return () => { mountedRef.current = false; };
  }, []);

  return { metrics, loading, error, refetch };
}
