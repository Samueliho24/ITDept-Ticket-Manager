import { useState, useEffect, useCallback, startTransition } from 'react';
import { Card, Button, Empty, Spin } from 'antd';
import { PlusCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { listTickets } from '../../services/ticketService';
import { useModals } from '../../context/ModalContext';

const STATUS_ICONS = {
  Abierto: <AlertCircle size={18} />,
  'En Proceso': <Clock size={18} />,
  Resuelto: <CheckCircle size={18} />,
};

export default function RequestorDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openReport, openDetail, openCancel } = useModals();

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listTickets({ limit: 20, offset: 0 });
      const all = res.data.items;
      const active = all.filter((t) => t.status === 'Abierto' || t.status === 'En Proceso');
      const resolved = all.filter((t) => t.status === 'Resuelto');
      const fill = active.length < 10 ? resolved.slice(0, 10 - active.length) : [];
      setTickets([...active, ...fill]);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => { fetchTickets(); });
  }, [fetchTickets]);

  const statusColor = (status) => {
    switch (status) {
      case 'Abierto': return '#860404';
      case 'En Proceso': return '#D0A021';
      case 'Resuelto': return '#1A8C06';
      default: return '#64748B';
    }
  };

  return (
    <div className="requestor-dashboard">
      <div className="dashboard-header">
        <h2>Mis Tickets</h2>
        <Button type="primary" icon={<PlusCircle size={16} />} onClick={openReport} className="btn-reportar">
          Reportar Falla
        </Button>
      </div>

      {loading ? (
        <div className="loading-center"><Spin size="large" /></div>
      ) : tickets.length === 0 ? (
        <Empty description="No tienes tickets registrados" />
      ) : (
        <div className="dashboard-cards">
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="ticket-card"
              hoverable
              onClick={() => openDetail(ticket)}
            >
              <div className="card-header">
                <span className="card-id">#{ticket.id.slice(0, 8)}</span>
                <span className="card-status" style={{ color: statusColor(ticket.status) }}>
                  {STATUS_ICONS[ticket.status] || null}
                  {ticket.status}
                </span>
              </div>
              <div className="card-title">{ticket.title}</div>
              <div className="card-meta">
                <span>{ticket.category || 'Sin categoría'}</span>
                <span className="card-priority">{ticket.priority}</span>
              </div>
              {ticket.status === 'Abierto' && (
                <Button
                  size="small"
                  danger
                  className="card-cancel-btn"
                  onClick={(e) => { e.stopPropagation(); openCancel(ticket); }}
                >
                  Anular
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
