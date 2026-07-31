import './UserPasswordModal.scss';
import { useState } from 'react';
import { Modal, Form, Input, Space, Button } from 'antd';
import { changeUserPassword } from '../../../../services/userService';
import { useAppContext } from '../../../../context/AppContext';

export default function UserPasswordModal({ open, onClose, onSuccess, user }) {
  const { messageApi } = useAppContext();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (values.newPassword !== values.confirmPassword) {
        messageApi.error('Las contraseñas no coinciden.');
        return;
      }
      setSubmitting(true);
      await changeUserPassword(user.id, { password: values.newPassword });
      messageApi.success('Contraseña actualizada correctamente.');
      form.resetFields();
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
      title="Cambiar Contraseña"
      open={open}
      onCancel={() => { form.resetFields(); onClose(); }}
      width={420}
      destroyOnClose
      closable={false}
      footer={
        <Space className="flex-space-between">
          <Button onClick={() => { form.resetFields(); onClose(); }}>Cancelar</Button>
          <Button type="primary" loading={submitting} onClick={handleSubmit}>
            Actualizar Contraseña
          </Button>
        </Space>
      }
    >
      <p className="password-modal-info">
        Cambiando contraseña de: <strong>{user.name} {user.lastname}</strong>
      </p>
      <Form form={form} layout="vertical" preserve={false} requiredMark={false}>
        <Form.Item
          name="newPassword"
          label="Nueva Contraseña"
          rules={[
            { required: true, message: 'Campo requerido' },
            { min: 6, message: 'Mínimo 6 caracteres' },
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Confirmar Nueva Contraseña"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Campo requerido' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                return Promise.reject(new Error('Las contraseñas no coinciden'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  );
}
