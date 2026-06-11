import { useState } from 'react';
import { Modal, Form, Input, Space, Button } from 'antd';
import { createCategory, updateCategory } from '../../../../services/categoryService';
import { useAppContext } from '../../../../context/AppContext';

export default function CategoryFormModal({ open, onClose, onSuccess, category }) {
  const { messageApi } = useAppContext();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!category;

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (isEditing) {
        await updateCategory(category.id, values);
        messageApi.success('Categoría actualizada correctamente.');
      } else {
        await createCategory(values);
        messageApi.success('Categoría creada correctamente.');
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
      title={isEditing ? 'Editar Categoría' : 'Agregar Categoría'}
      open={open}
      onCancel={onClose}
      width={480}
      destroyOnClose
      footer={
        <Space className="flex-space-between">
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
          rules={[
            { required: true, message: 'Campo requerido' },
            { min: 2, message: 'Debe tener al menos 2 caracteres' },
          ]}
          initialValue={category?.name}
        >
          <Input placeholder="Ej: Redes, Hardware, Software" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
