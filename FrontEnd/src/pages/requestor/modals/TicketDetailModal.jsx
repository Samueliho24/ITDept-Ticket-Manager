import { useState, useEffect, startTransition } from 'react';
import { Modal, Timeline, Steps, Tag, Rate, Spin, Descriptions, Empty } from 'antd';
import { getTicket, getTicketHistory, rateTicket } from '../../../services/ticketService';
import { useModals } from '../../../context/ModalContext';

const STEP_MAP = {
  Abierto: 0,
  Asignado: 1,
  'En Proceso': 2,
  Pendiente: 2,
  Resuelto: 3,
  Cerrado: 4,
};

const STEP_STATUS = {
  Abierto: 'process',
  Asignado: 'process',
  'En Proceso': 'process',
  Resuelto: 'finish',
  Cerrado: 'finish',
};

export default function TicketDetailModal() {
  const { detailTicket, closeDetail } = useModals();
  const [ticket, setTicket] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    if (detailTicket) {
      startTransition(() => { setRating(0); });
      startTransition(() => { setRatingSubmitted(detailTicket.rated || false); });
      startTransition(() => { setTicket(detailTicket); setLoading(true); });
      getTicket(detailTicket.id)
        .then((res) => setTicket(res.data))
        .catch(() => {});
      getTicketHistory(detailTicket.id)
        .then((res) => { setHistory(res.data.items || res.data); })
        .catch(() => setHistory([]))
        .finally(() => setLoading(false));
    }
  }, [detailTicket]);

  const handleRate = async (value) => {
    if (ratingSubmitted) return;
    setRatingLoading(true);
    try {
      await rateTicket(detailTicket.id, { score: value, comment: '' });
      setRating(value);
      setRatingSubmitted(true);
    } catch {
      setRatingSubmitted(false);
    } finally {
      setRatingLoading(false);
    }
  };

  const stepsOrder = ['Abierto', 'Asignado', 'En Proceso', 'Resuelto', 'Cerrado'];
  const currentStep = STEP_MAP[ticket?.status] ?? 0;

  return (
    <Modal
      title={`Ticket ${ticket?.ticket_number || `#${ticket?.id?.slice(0, 8) || ''}`}`}
      open={!!detailTicket}
      onCancel={closeDetail}
      footer={null}
      width={640}
      destroyOnClose
    >
      {!ticket ? null : (
        <div className="ticket-detail-modal">
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Título">{ticket.title}</Descriptions.Item>
            <Descriptions.Item label="Estado">
              <Tag>{ticket.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Prioridad">{ticket.priority}</Descriptions.Item>
            <Descriptions.Item label="Categoría">{ticket.category || '—'}</Descriptions.Item>
            <Descriptions.Item label="Descripción">{ticket.description || '—'}</Descriptions.Item>
            {ticket.assigned_to_name && (
              <Descriptions.Item label="Técnico Asignado">{ticket.assigned_to_name}</Descriptions.Item>
            )}

          </Descriptions>

          <div className="detail-section">
            <h4>Progreso</h4>
            <Steps
              current={currentStep}
              status={ticket.status === 'Anulado' ? 'error' : STEP_STATUS[ticket.status] || 'process'}
              items={stepsOrder.map((s) => ({ title: s }))}
              size="small"
            />
          </div>

          <div className="detail-section">
            <h4>Historial</h4>
            {loading ? (
              <Spin />
            ) : history.length === 0 ? (
              <Empty description="Sin historial" />
            ) : (
              <Timeline
                items={history.map((h) => ({
                  children: (
                    <div className="timeline-item">
                      <span className="timeline-action">{h.technical_action || h.new_status || 'Actualización'}</span>
                      {h.reason && <span className="timeline-reason">: {h.reason}</span>}
                      {h.technical_comment && <span className="timeline-reason"> — {h.technical_comment}</span>}
                      <span className="timeline-date">
                        {h.change_date ? new Date(h.change_date).toLocaleString('es-ES') : ''}
                      </span>
                    </div>
                  ),
                }))}
              />
            )}
          </div>

          {ticket.status === 'Resuelto' && !ratingSubmitted && (
            <div className="detail-section rating-section">
              <h4>Califica la resolución (anónimo)</h4>
              <Rate onChange={handleRate} value={rating} disabled={ratingLoading} />
            </div>
          )}

          {ratingSubmitted && (
            <div className="detail-section rating-section rated">
              <h4>Calificaste este ticket</h4>
              <Rate value={rating} disabled />
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
