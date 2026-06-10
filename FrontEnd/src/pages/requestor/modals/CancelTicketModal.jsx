import { useState } from 'react';
import { Modal, Input, message } from 'antd';
import { cancelTicket } from '../../../services/ticketService';
import { useModals } from '../../../context/ModalContext';

export default function CancelTicketModal({ onSuccess }) {
  const { cancelTicket: ticket, closeCancel } = useModals();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleOk = async () => {
    if (!reason.trim()) {
      message.warning('Debes indicar un motivo');
      return;
    }
    setSubmitting(true);
    try {
      await cancelTicket(ticket.id, { reason: reason.trim() });
      message.success('Ticket anulado exitosamente');
      setReason('');
      closeCancel();
      if (onSuccess) onSuccess();
    } catch {
      message.error('Error al anular el ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setReason('');
    closeCancel();
  };

  return (
    <Modal
      title="Anular Ticket"
      open={!!ticket}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={submitting}
      okText="Anular Ticket"
      cancelText="Cancelar"
      okButtonProps={{ danger: true }}
      destroyOnClose
    >
      {ticket && (
        <div>
          <p>¿Estás seguro de que deseas anular el ticket <strong>{ticket.ticket_number || `#${ticket.id.slice(0, 8)}`}</strong>?</p>
          <Input.TextArea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motivo de la anulación"
            maxLength={300}
            showCount
          />
        </div>
      )}
    </Modal>
  );
}
