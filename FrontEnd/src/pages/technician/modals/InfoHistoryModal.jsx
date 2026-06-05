import { Modal } from 'antd';
import { Info } from 'lucide-react';

export default function InfoHistoryModal({ open, onClose }) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={520}
      closable={false}
      centered
      className="info-history-modal"
    >
      <div className="info-modal-card">
        <div className="info-modal-icon">
          <Info size={40} />
        </div>
        <h3>Aviso del Sistema</h3>
        <p>
          En este Dashboard principal únicamente se visualizan los tickets más recientes
          de cada categoría de soporte técnico para agilizar la atención inmediata.
        </p>
        <p>
          Para examinar, filtrar o auditar el <strong>historial completo</strong> de
          incidencias, acceda a la ventana de Historial (la cual cuenta con un sistema
          de paginación completa y filtros avanzados, compartiendo la misma estructura
          robusta de la vista del solicitante).
        </p>
        <button type="button" className="info-modal-btn" onClick={onClose}>
          Entendido
        </button>
      </div>
    </Modal>
  );
}
