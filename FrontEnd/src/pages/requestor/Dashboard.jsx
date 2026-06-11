import './Dashboard.scss';
import { useState, useEffect, useCallback, startTransition } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Tag, Button, Spin, Empty, Tooltip } from 'antd';
import { PlusCircle, Eye, XCircle } from 'lucide-react';
import { listTickets } from '../../services/ticketService';
import { useModals } from '../../context/ModalContext';

const STATUS_TAG_COLOR = {
  Abierto: 'red',
  Asignado: 'orange',
  'En Proceso': 'gold',
  Pendiente: 'geekblue',
  Resuelto: 'green',
  Cerrado: 'default',
  Anulado: 'default',
};

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function getDaysElapsed(dateStr) {
  if (!dateStr) return 0;
  const then = new Date(dateStr);
  const now = new Date();
  return Math.max(0, Math.floor((now - then) / (1000 * 60 * 60 * 24)));
}

export default function RequestorDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openReport, openDetail, openCancel } = useModals();
  const { refreshKey } = useOutletContext();

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
  }, [fetchTickets, refreshKey]);

  return (
    <div className="requestor-dashboard">
      <div className="dashboard-header">
        <h2>Mis Tickets</h2>
        <Button type="primary" icon={<PlusCircle size={16} />} onClick={openReport}>
          Reportar Falla
        </Button>
      </div>

      {loading ? (
        <div className="loading-center"><Spin size="large" /></div>
      ) : tickets.length === 0 ? (
        <Empty description="No tienes tickets registrados" />
      ) : (
        <div className="ticket-list-body">
          {tickets.map((ticket) => {
            const days = getDaysElapsed(ticket.opened_at);
            return (
              <div key={ticket.id} className="ticket-row">
                {/* Col 1 — Código + Categoría */}
                <div className="ticket-col ticket-col-info">
                  <div className="ticket-number">{ticket.ticket_number}</div>
                  <div className="ticket-solicitante">{ticket.category || 'Sin categoría'}</div>
                </div>

                {/* Col 2 — Departamento */}
                <div className="ticket-col ticket-col-dept">
                  <span className="ticket-dept-name">{ticket.department_name || '—'}</span>
                </div>

                {/* Col 3 — Estado */}
                <div className="ticket-col ticket-col-status">
                  <Tag color={STATUS_TAG_COLOR[ticket.status] || 'default'}>{ticket.status}</Tag>
                </div>

                {/* Col 4 — Fecha + Días */}
                <div className="ticket-col ticket-col-date">
                  <div className="ticket-date">{formatDate(ticket.opened_at)}</div>
                  <div className={`ticket-days ${days >= 5 ? 'stale' : ''}`}>
                    {days} {days === 1 ? 'Día' : 'Días'}
                  </div>
                </div>

                {/* Col 5 — Acción */}
                <div className="ticket-col ticket-col-action">
                  <Tooltip title="Ver detalles">
                    <Button
                      type="text"
                      icon={<Eye size={18} />}
                      className="btn-view"
                      onClick={() => openDetail(ticket)}
                    />
                  </Tooltip>
                  {ticket.status === 'Abierto' && (
                    <Button
                      size="small"
                      danger
                      icon={<XCircle size={14} />}
                      className="btn-cancel-ticket"
                      onClick={(e) => { e.stopPropagation(); openCancel(ticket); }}
                    >
                      Anular
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
