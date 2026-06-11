import './Dashboard.scss';
import { useState, useEffect, useCallback, startTransition } from 'react';
import MetricsHeader from '../../components/MetricsHeader';
import KpiRow from '../../components/KpiRow';
import ChartsSection from '../../components/ChartsSection';
import TicketListView from '../../components/TicketListView';
import useDashboardMetrics from '../../hooks/useDashboardMetrics';
import { listTickets } from '../../services/ticketService';

export default function AdminDashboard() {
  const { metrics, loading: metricsLoading, refetch } = useDashboardMetrics();
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    setTicketsLoading(true);
    try {
      const res = await listTickets({ limit: 10, offset: 0 });
      setTickets(res.data.items || []);
    } catch {
      setTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      fetchTickets();
    });
  }, [fetchTickets]);

  return (
    <div className="admin-dashboard">
      <MetricsHeader />

      <KpiRow metrics={metrics} loading={metricsLoading} />

      <ChartsSection
        resolvedByMonth={metrics?.resolved_by_month || []}
        departmentBreakdown={metrics?.department_breakdown || []}
        loading={metricsLoading}
        onToggleCancelled={(exclude) => refetch({ exclude_cancelled: exclude })}
      />

      <TicketListView
        tickets={tickets}
        loading={ticketsLoading}
        title="Tickets Recientes del Sistema"
        showStatus
      />
    </div>
  );
}
