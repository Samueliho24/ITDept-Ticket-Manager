import { useState } from 'react';
import { Modal, Button, Space } from 'antd';
import { toggleCategoryStatus } from '../../../../services/categoryService';
import { useAppContext } from '../../../../context/AppContext';

export default function CategoryStatusModal({ open, onClose, onSuccess, category }) {
  const { messageApi } = useAppContext();
  const [submitting, setSubmitting] = useState(false);

  if (!category) return null;

  const isActive = category.is_active;
  const catName = category.name;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await toggleCategoryStatus(category.id);
      messageApi.success(isActive ? 'Categoría desactivada correctamente.' : 'Categoría activada correctamente.');
      onSuccess?.();
    } catch (err) {
      if (err?.response?.data?.detail) {
        messageApi.error(err.response.data.detail);
      } else {
        messageApi.error('Error al cambiar estado de la categoría.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={isActive ? 'Deshabilitar Categoría' : 'Habilitar Categoría'}
      open={open}
      onCancel={onClose}
      width={480}
      destroyOnClose
      footer={
        <Space className="flex-space-between">
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="primary" loading={submitting} onClick={handleConfirm}>
            Confirmar
          </Button>
        </Space>
      }
    >
      <div className="user-modal-warning">
        {isActive
          ? `¿Está seguro que desea DESHABILITAR la categoría "${catName}"? Las tickets existentes conservarán su categoría actual.`
          : `¿Está seguro que desea HABILITAR la categoría "${catName}"?`}
      </div>
    </Modal>
  );
}
