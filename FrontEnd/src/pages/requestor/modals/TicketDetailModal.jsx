import { useState, useEffect, startTransition } from 'react';
import { Modal, Timeline, Steps, Tag, Rate, Spin, Descriptions, Empty } from 'antd';
import { getTicketHistory, rateTicket } from '../../../services/ticketService';
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
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    if (detailTicket) {
      startTransition(() => { setRating(0); });
      startTransition(() => { setRatingSubmitted(detailTicket.rated || false); });
      startTransition(() => { setLoading(true); });
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
  const currentStep = STEP_MAP[detailTicket?.status] ?? 0;

  return (
    <Modal
      title={`Ticket #${detailTicket?.id?.slice(0, 8) || ''}`}
      open={!!detailTicket}
      onCancel={closeDetail}
      footer={null}
      width={640}
      destroyOnClose
    >
      {!detailTicket ? null : (
        <div className="ticket-detail-modal">
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Título">{detailTicket.title}</Descriptions.Item>
            <Descriptions.Item label="Estado">
              <Tag>{detailTicket.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Prioridad">{detailTicket.priority}</Descriptions.Item>
            <Descriptions.Item label="Categoría">{detailTicket.category || '—'}</Descriptions.Item>
            <Descriptions.Item label="Descripción">{detailTicket.description || '—'}</Descriptions.Item>
            {detailTicket.assigned_to_name && (
              <Descriptions.Item label="Técnico Asignado">{detailTicket.assigned_to_name}</Descriptions.Item>
            )}
            {detailTicket.solution && (
              <Descriptions.Item label="Solución">{detailTicket.solution}</Descriptions.Item>
            )}
          </Descriptions>

          <div className="detail-section">
            <h4>Progreso</h4>
            <Steps
              current={currentStep}
              status={detailTicket.status === 'Anulado' ? 'error' : STEP_STATUS[detailTicket.status] || 'process'}
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
                      <span className="timeline-action">{h.action}</span>
                      {h.reason && <span className="timeline-reason">: {h.reason}</span>}
                      <span className="timeline-user">{h.performed_by_name || ''}</span>
                      <span className="timeline-date">
                        {h.created_at ? new Date(h.created_at).toLocaleString('es-ES') : ''}
                      </span>
                    </div>
                  ),
                }))}
              />
            )}
          </div>

          {detailTicket.status === 'Resuelto' && !ratingSubmitted && (
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
