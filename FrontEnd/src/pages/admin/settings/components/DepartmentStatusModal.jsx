import { useState } from 'react';
import { Modal, Button, Space } from 'antd';
import { toggleDepartmentStatus } from '../../../../services/departmentService';
import { useAppContext } from '../../../../context/AppContext';

export default function DepartmentStatusModal({ open, onClose, onSuccess, department }) {
  const { messageApi } = useAppContext();
  const [submitting, setSubmitting] = useState(false);

  if (!department) return null;

  const isActive = department.is_active;
  const deptName = department.name;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await toggleDepartmentStatus(department.id);
      messageApi.success(isActive ? 'Departamento desactivado correctamente.' : 'Departamento activado correctamente.');
      onSuccess?.();
    } catch (err) {
      if (err?.response?.data?.detail) {
        messageApi.error(err.response.data.detail);
      } else {
        messageApi.error('Error al cambiar estado del departamento.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={isActive ? 'Desactivar Departamento' : 'Activar Departamento'}
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
          ? `¿Está seguro que desea DESACTIVAR el departamento ${deptName}? Los usuarios y equipos asignados a este departamento dejarán de tener referencia.`
          : `¿Está seguro que desea ACTIVAR el departamento ${deptName}?`}
      </div>
    </Modal>
  );
}
