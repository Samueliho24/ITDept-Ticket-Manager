import './Dashboard.scss';
import { useState, useEffect, useCallback, startTransition } from 'react';
import { Tooltip, Button } from 'antd';
import { AlertCircle, Clock, CheckCircle, Info } from 'lucide-react';
import { listTickets } from '../../services/ticketService';
import TicketListView from '../../components/TicketListView';
import InfoHistoryModal from './modals/InfoHistoryModal';

const STATUS_CONFIG = [
  { key: 'Asignado', label: 'Mis Tickets Asignados', color: '#860404', icon: AlertCircle },
  { key: 'En Proceso', label: 'En Proceso', color: '#B8860B', icon: Clock },
  { key: 'Resuelto', label: 'Resueltos', color: '#1A8C06', icon: CheckCircle },
];

export default function TechnicianDashboard() {
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

      <TicketListView
        tickets={tickets}
        loading={loading}
        title="Mis tickets"
      />

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
