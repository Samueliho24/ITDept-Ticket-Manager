import { useState } from 'react';
import { Modal, Button, Space } from 'antd';
import { deleteDepartment } from '../../../../services/departmentService';
import { useAppContext } from '../../../../context/AppContext';

export default function DepartmentDeleteModal({ open, onClose, onSuccess, department }) {
  const { messageApi } = useAppContext();
  const [submitting, setSubmitting] = useState(false);

  if (!department) return null;

  const deptName = department.name;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const res = await deleteDepartment(department.id);
      messageApi.success(res.data?.detail || 'Departamento eliminado exitosamente.');
      onSuccess?.();
    } catch (err) {
      if (err?.response?.data?.detail) {
        messageApi.error(err.response.data.detail);
      } else {
        messageApi.error('Error al eliminar el departamento.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Eliminar Departamento"
      open={open}
      onCancel={onClose}
      width={500}
      destroyOnClose
      footer={
        <Space className="flex-space-between">
          <Button onClick={onClose}>Cancelar</Button>
          <Button danger type="primary" loading={submitting} onClick={handleConfirm}>
            Eliminar
          </Button>
        </Space>
      }
    >
      <div className="user-modal-warning user-modal-warning--danger">
        <strong>¡ATENCIÓN!</strong> Está a punto de <strong>ELIMINAR</strong> el departamento{' '}
        <strong>{deptName}</strong>. Esta acción ejecutará un borrado lógico en el sistema.
        No podrá eliminar el departamento si existen usuarios o equipos asociados a él.
        ¿Desea continuar?
      </div>
    </Modal>
  );
}
