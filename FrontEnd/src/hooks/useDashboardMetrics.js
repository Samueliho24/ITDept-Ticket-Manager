import { useState, useEffect, useRef } from 'react';
import { getMetrics } from '../services/metricsService';

export default function useDashboardMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    getMetrics()
      .then((res) => {
        if (mountedRef.current) {
          setMetrics(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mountedRef.current) {
          setError(err.response?.data?.detail || 'Error al cargar métricas');
          setLoading(false);
        }
      });

    return () => { mountedRef.current = false; };
  }, []);

  const refetch = () => {
    setLoading(true);
    setError(null);
    getMetrics()
      .then((res) => setMetrics(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Error al cargar métricas'))
      .finally(() => setLoading(false));
  };

  return { metrics, loading, error, refetch };
}
