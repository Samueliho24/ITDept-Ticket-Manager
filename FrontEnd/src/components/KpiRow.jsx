import { Clock, Inbox, AlertTriangle, Wrench } from 'lucide-react';
import KpiCard from './KpiCard';

export default function KpiRow({ metrics, loading }) {
  const kpis = [
    {
      icon: <Clock size={22} color="#006699" />,
      value: metrics ? `${metrics.avg_resolution_time_hours} hrs` : '—',
      label: 'Tiempo Medio de Resolución',
      trend: '12% vs. mes anterior',
      trendDirection: 'down',
      color: '#006699',
    },
    {
      icon: <Inbox size={22} color="#1A8C06" />,
      value: metrics ? metrics.tickets_created_month : '—',
      label: 'Tickets Creados del Mes',
      trend: 'Dentro del promedio mensual',
      trendDirection: 'down',
      color: '#1A8C06',
    },
    {
      icon: <AlertTriangle size={22} color="#D97706" />,
      value: metrics ? metrics.critical_alerts : '—',
      label: 'Alertas Críticas Activas',
      trend: 'Equipos prioritarios afectados',
      trendDirection: 'up',
      color: '#D97706',
    },
    {
      icon: <Wrench size={22} color="#860404" />,
      value: metrics ? metrics.tickets_pending : '—',
      label: 'Tickets por Resolver',
      trend: '2 nuevos hoy',
      trendDirection: 'up',
      color: '#860404',
    },
  ];

  return (
    <div className="kpi-analytics">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.label} {...kpi} loading={loading} />
      ))}
    </div>
  );
}
