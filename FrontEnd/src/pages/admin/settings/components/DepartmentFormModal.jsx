import { useState } from 'react';
import { Modal, Form, Input, Space, Button } from 'antd';
import { createDepartment, updateDepartment } from '../../../../services/departmentService';
import { useAppContext } from '../../../../context/AppContext';

export default function DepartmentFormModal({ open, onClose, onSuccess, department }) {
  const { messageApi } = useAppContext();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!department;

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (isEditing) {
        await updateDepartment(department.id, values);
        messageApi.success('Departamento actualizado correctamente.');
      } else {
        await createDepartment(values);
        messageApi.success('Departamento creado correctamente.');
      }
      onSuccess?.();
    } catch (err) {
      if (err?.response?.data?.detail) {
        messageApi.error(err.response.data.detail);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={isEditing ? 'Editar Departamento' : 'Agregar Departamento'}
      open={open}
      onCancel={onClose}
      width={480}
      destroyOnClose
      footer={
        <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="primary" loading={submitting} onClick={handleSubmit}>
            {isEditing ? 'Guardar' : 'Crear'}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" preserve={false} requiredMark={false}>
        <Form.Item
          name="name"
          label="Nombre"
          rules={[{ required: true, message: 'Campo requerido' }]}
          initialValue={department?.name}
        >
          <Input placeholder="Ej: Recursos Humanos" />
        </Form.Item>
        <Form.Item
          name="code"
          label="Código"
          rules={[
            { required: true, message: 'Campo requerido' },
            { len: 3, message: 'Debe tener exactamente 3 caracteres' },
          ]}
          initialValue={department?.code}
        >
          <Input
            maxLength={3}
            style={{ textTransform: 'uppercase' }}
            onChange={(e) => { e.target.value = e.target.value.toUpperCase(); }}
            placeholder="Ej: RHS"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
