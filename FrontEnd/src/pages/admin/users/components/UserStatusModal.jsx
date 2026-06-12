import { useState } from 'react';
import { Modal, Button, Space } from 'antd';
import { toggleUserStatus } from '../../../../services/userService';
import { useAppContext } from '../../../../context/AppContext';

export default function UserStatusModal({ open, onClose, onSuccess, user }) {
  const { messageApi } = useAppContext();
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const isActive = user.active === 1;
  const userName = `${user.name} ${user.lastname}`;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await toggleUserStatus(user.id, isActive ? 0 : 1);
      messageApi.success(isActive ? 'Usuario desactivado correctamente.' : 'Usuario activado correctamente.');
      onSuccess?.();
    } catch (err) {
      if (err?.response?.data?.detail) {
        messageApi.error(err.response.data.detail);
      } else {
        messageApi.error('Error al cambiar estado del usuario.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={isActive ? 'Desactivar Usuario' : 'Activar Usuario'}
      open={open}
      onCancel={onClose}
      width={480}
      destroyOnClose
      closeable={false}
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
          ? `¿Está seguro que desea DESACTIVAR al usuario ${userName}? El usuario perderá acceso inmediato al sistema.`
          : `¿Está seguro que desea ACTIVAR al usuario ${userName}?`}
      </div>
    </Modal>
  );
}
