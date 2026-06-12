import { useState } from 'react';
import { Modal, Button, Space } from 'antd';
import { deleteUser } from '../../../../services/userService';
import { useAppContext } from '../../../../context/AppContext';
import { useAuth } from '../../../../context/AuthContext';

export default function UserDeleteModal({ open, onClose, onSuccess, user }) {
  const { messageApi } = useAppContext();
  const { user: currentUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const userName = `${user.name} ${user.lastname}`;
  const isSelf = currentUser?.id === user.id;

  const handleConfirm = async () => {
    if (isSelf) {
      messageApi.error('No puedes eliminar tu propio usuario.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await deleteUser(user.id);
      messageApi.success(res.data?.detail || 'Usuario eliminado permanentemente.');
      onSuccess?.();
    } catch (err) {
      if (err?.response?.data?.detail) {
        messageApi.error(err.response.data.detail);
      } else {
        messageApi.error('Error al eliminar el usuario.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Eliminar Usuario"
      open={open}
      onCancel={onClose}
      width={500}
      destroyOnClose
      closable={false}
      footer={
        <Space className="flex-space-between">
          <Button onClick={onClose}>Cancelar</Button>
          <Button danger type="primary" loading={submitting} onClick={handleConfirm}>
            Eliminar Permanentemente
          </Button>
        </Space>
      }
    >
      <div className="user-modal-warning user-modal-warning--danger">
        <strong>¡ATENCIÓN!</strong> Está a punto de <strong>ELIMINAR permanentemente</strong> al usuario{' '}
        <strong>{userName}</strong>. Esta acción ejecutará un borrado lógico irreversible en el sistema
        y no se podrá deshacer. ¿Desea continuar?
      </div>
    </Modal>
  );
}
