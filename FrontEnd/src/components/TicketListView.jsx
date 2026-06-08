import { Tag, Button, Tooltip, Spin, Empty, Badge } from 'antd';
import { Eye, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

const STATUS_TAG_COLOR = {
  Abierto: 'red',
  Asignado: 'orange',
  'En Proceso': 'gold',
  Pendiente: 'geekblue',
  Resuelto: 'green',
  Cerrado: 'default',
  Anulado: 'default',
};

export default function TicketListView({ tickets, loading, title = 'Tickets', showStatus = false }) {
  const navigate = useNavigate();

  return (
    <div className="ticket-list">
      <div className="ticket-list-header">
        <h2>{title}</h2>
        <Badge count={tickets.length} style={{ backgroundColor: '#006699' }} overflowCount={99} />
      </div>

      {loading ? (
        <div className="loading-center"><Spin size="large" /></div>
      ) : tickets.length === 0 ? (
        <Empty description="No hay tickets disponibles" />
      ) : (
        <div className="ticket-list-body">
          {tickets.map((ticket) => {
            const days = getDaysElapsed(ticket.opened_at);
            return (
              <div key={ticket.id} className="ticket-row">
                <div className="ticket-col ticket-col-info">
                  <div className="ticket-number">{ticket.ticket_number}</div>
                  <div className="ticket-solicitante">{ticket.requester_name || '—'}</div>
                </div>

                <div className="ticket-col ticket-col-dept">
                  <span className="ticket-dept-name">{ticket.department_name || '—'}</span>
                </div>

                {showStatus && (
                  <div className="ticket-col ticket-col-status">
                    <Tag color={STATUS_TAG_COLOR[ticket.status] || 'default'}>{ticket.status}</Tag>
                  </div>
                )}

                <div className="ticket-col ticket-col-cat">
                  {ticket.status !== 'Asignado' && ticket.category && (
                    <Tag color="blue">{ticket.category}</Tag>
                  )}
                </div>

                <div className="ticket-col ticket-col-date">
                  <div className="ticket-date">{formatDate(ticket.opened_at)}</div>
                  <div className={`ticket-days ${days >= 5 ? 'stale' : ''}`}>
                    {days} {days === 1 ? 'Día' : 'Días'}
                  </div>
                </div>

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
  );
}
