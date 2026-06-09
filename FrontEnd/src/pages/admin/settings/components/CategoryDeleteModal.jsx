import { useState } from 'react';
import { Modal, Button, Space } from 'antd';
import { deleteCategory } from '../../../../services/categoryService';
import { useAppContext } from '../../../../context/AppContext';

export default function CategoryDeleteModal({ open, onClose, onSuccess, category }) {
  const { messageApi } = useAppContext();
  const [submitting, setSubmitting] = useState(false);

  if (!category) return null;

  const catName = category.name;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const res = await deleteCategory(category.id);
      messageApi.success(res.data?.detail || 'Categoría eliminada exitosamente.');
      onSuccess?.();
    } catch (err) {
      if (err?.response?.data?.detail) {
        messageApi.error(err.response.data.detail);
      } else {
        messageApi.error('Error al eliminar la categoría.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Eliminar Categoría"
      open={open}
      onCancel={onClose}
      width={500}
      destroyOnClose
      footer={
        <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button danger type="primary" loading={submitting} onClick={handleConfirm}>
            Eliminar
          </Button>
        </Space>
      }
    >
      <div className="user-modal-warning user-modal-warning--danger">
        <strong>¡ATENCIÓN!</strong> Está a punto de <strong>ELIMINAR</strong> la categoría{' '}
        <strong>"{catName}"</strong>. Esta acción ejecutará un borrado lógico en el sistema.
        Las tickets existentes conservarán su categoría actual. ¿Desea continuar?
      </div>
    </Modal>
  );
}
