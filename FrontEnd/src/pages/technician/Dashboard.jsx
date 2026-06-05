import { useState, useEffect, useCallback, startTransition } from 'react';
import { Tag, Button, Tooltip, Spin, Empty, Badge } from 'antd';
import { Eye, Info, AlertCircle, Clock, CheckCircle, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { listTickets } from '../../services/ticketService';
import InfoHistoryModal from './modals/InfoHistoryModal';

const STATUS_CONFIG = [
  { key: 'Asignado', label: 'Mis Tickets Asignados', color: '#860404', icon: AlertCircle },
  { key: 'En Proceso', label: 'En Proceso', color: '#B8860B', icon: Clock },
  { key: 'Resuelto', label: 'Resueltos', color: '#1A8C06', icon: CheckCircle },
];

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
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [counts, setCounts] = useState({ Asignado: 0, 'En Proceso': 0, Resuelto: 0 });
  const [activeStatus, setActiveStatus] = useState('Asignado');
  const [loading, setLoading] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  const fetchCounts = useCallback(async () => {
    try {
      const results = await Promise.all(
        ['Asignado', 'En Proceso', 'Resuelto'].map((s) =>
          listTickets({ status: s, limit: 1, offset: 0 }).then((r) => r.data.total)
        )
      );
      setCounts({ Asignado: results[0], 'En Proceso': results[1], Resuelto: results[2] });
    } catch {}
  }, []);

  const fetchTickets = useCallback(async (status) => {
    setLoading(true);
    try {
      const res = await listTickets({ status, limit: 10, offset: 0 });
      setTickets(res.data.items || []);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      fetchCounts();
      fetchTickets('Asignado');
    });
  }, [fetchCounts, fetchTickets]);

  const handleCardClick = (status) => {
    setActiveStatus(status);
    fetchTickets(status);
  };

  return (
    <div className="technician-dashboard">
      {/* KPI ROW */}
      <div className="kpi-row">
        {STATUS_CONFIG.map((cfg) => {
          const Icon = cfg.icon;
          return (
            <div
              key={cfg.key}
              className={`kpi-card ${activeStatus === cfg.key ? 'active' : ''}`}
              style={{ backgroundColor: cfg.color }}
              onClick={() => handleCardClick(cfg.key)}
            >
              <div className="kpi-text">
                <div className="kpi-value">{counts[cfg.key]}</div>
                <div className="kpi-label">{cfg.label}</div>
              </div>
              <div className="kpi-icon-wrap">
                <Icon size={28} />
              </div>
            </div>
          );
        })}
      </div>

      <hr className="tech-dashboard-divider" />

      {/* TICKET LIST */}
      <div className="ticket-list">
        <div className="ticket-list-header">
          <h2>Mis tickets:</h2>
          <Badge count={tickets.length} style={{ backgroundColor: '#006699' }} overflowCount={99} />
        </div>

        {loading ? (
          <div className="loading-center"><Spin size="large" /></div>
        ) : tickets.length === 0 ? (
          <Empty description="No hay tickets en este estado" />
        ) : (
          <div className="ticket-list-body">
            {tickets.map((ticket) => {
              const days = getDaysElapsed(ticket.opened_at);
              return (
                <div key={ticket.id} className="ticket-row">
                  {/* Col 1 — Código + Solicitante */}
                  <div className="ticket-col ticket-col-info">
                    <div className="ticket-number">{ticket.ticket_number}</div>
                    <div className="ticket-solicitante">{ticket.requester_name || '—'}</div>
                  </div>

                  {/* Col 2 — Departamento */}
                  <div className="ticket-col ticket-col-dept">
                    <span className="ticket-dept-name">{ticket.department_name || '—'}</span>
                  </div>

                  {/* Col 3 — Categoría (solo si no es Asignado) */}
                  <div className="ticket-col ticket-col-cat">
                    {ticket.status !== 'Asignado' && ticket.category && (
                      <Tag color="blue">{ticket.category}</Tag>
                    )}
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
                    {ticket.status === 'Resuelto' ? (
                      <Tooltip title="Ver detalles">
                        <Button
                          type="text"
                          icon={<Eye size={18} />}
                          className="btn-view"
                          onClick={() => navigate(`/workspace/${ticket.id}`)}
                        />
                      </Tooltip>
                    ) : (
                      <Button
                        type="primary"
                        icon={<Wrench size={16} />}
                        className="btn-atender"
                        onClick={() => navigate(`/workspace/${ticket.id}`)}
                      >
                        Atender
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="tech-dashboard-info-btn">
        <Tooltip title="Ver alcance de la vista">
          <Button
            type="text"
            icon={<Info size={20} />}
            onClick={() => setInfoModalOpen(true)}
          />
        </Tooltip>
      </div>

      <InfoHistoryModal open={infoModalOpen} onClose={() => setInfoModalOpen(false)} />
    </div>
  );
}
