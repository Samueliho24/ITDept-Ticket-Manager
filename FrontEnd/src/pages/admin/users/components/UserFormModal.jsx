import { useState } from 'react';
import { Modal, Form, Input, Select, Space, Button } from 'antd';
import { createUser, updateUser } from '../../../../services/userService';
import { useAppContext } from '../../../../context/AppContext';
import { rolTypeList } from '../../../../constants/lists';

export default function UserFormModal({ open, onClose, onSuccess, user, departments }) {
  const { messageApi } = useAppContext();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!user;

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!isEditing && values.password !== values.confirmPassword) {
        messageApi.error('Las contraseñas no coinciden.');
        return;
      }
      setSubmitting(true);
      if (isEditing) {
        await updateUser(user.id, {
          name: values.name,
          lastname: values.lastname,
          role: values.role,
          department_id: values.department_id || null,
          phone: values.phone || null,
        });
        messageApi.success('Usuario actualizado correctamente.');
      } else {
        await createUser({
          name: values.name,
          lastname: values.lastname,
          username: values.username,
          password: values.password,
          role: values.role,
          department_id: values.department_id || null,
          phone: values.phone || null,
        });
        messageApi.success('Usuario creado correctamente.');
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
      title={isEditing ? 'Editar Información de Usuario' : 'Registrar Nuevo Usuario'}
      open={open}
      onCancel={onClose}
      width={520}
      destroyOnClose
      footer={
        <Space className="flex-space-between">
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="primary" loading={submitting} onClick={handleSubmit}>
            {isEditing ? 'Guardar' : 'Registrar'}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" preserve={false} requiredMark={false}>
        <div className="mb-24">
          <Space className="w-100" size="middle" styles={{ item: { flex: 1 } }}>
            <Form.Item
              name="name"
              label="Nombre"
              rules={[{ required: true, message: 'Campo requerido' }]}
              className="mb-0"
              initialValue={user?.name}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="lastname"
              label="Apellido"
              rules={[{ required: true, message: 'Campo requerido' }]}
              className="mb-0"
              initialValue={user?.lastname}
            >
              <Input />
            </Form.Item>
          </Space>
        </div>

        <div className="mb-24">
          <Space className="w-100" size="middle" styles={{ item: { flex: 1 } }}>
            <Form.Item
              name="username"
              label="Usuario"
              rules={[
                { required: true, message: 'Campo requerido' },
                { min: 3, message: 'Mínimo 3 caracteres' },
              ]}
              className="mb-0"
              initialValue={user?.username}
            >
              <Input disabled={isEditing} />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Teléfono"
              className="mb-0"
              initialValue={user?.phone}
            >
              <Input placeholder="Ej: +58 412-1234567" />
            </Form.Item>
          </Space>
        </div>

        {!isEditing && (
          <div className="mb-24">
            <Space className="w-100" size="middle" styles={{ item: { flex: 1 } }}>
              <Form.Item
                name="password"
                label="Contraseña"
                rules={[
                  { required: true, message: 'Campo requerido' },
                  { min: 6, message: 'Mínimo 6 caracteres' },
                ]}
                className="mb-0"
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="Confirmar Contraseña"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Campo requerido' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) return Promise.resolve();
                      return Promise.reject(new Error('Las contraseñas no coinciden'));
                    },
                  }),
                ]}
                className="mb-0"
              >
                <Input.Password />
              </Form.Item>
            </Space>
          </div>
        )}

        <div className="mb-0">
          <Space className="w-100" size="middle" styles={{ item: { flex: 1 } }}>
            <Form.Item
              name="role"
              label="Rol"
              rules={[{ required: true, message: 'Campo requerido' }]}
              className="mb-0"
              initialValue={user?.role}
            >
              <Select options={rolTypeList} />
            </Form.Item>
            <Form.Item
              name="department_id"
              label="Departamento"
              className="mb-0"
              initialValue={user?.department_id || undefined}
            >
              <Select
                allowClear
                placeholder="Seleccionar departamento"
                options={departments.map((d) => ({ label: d.name, value: d.id }))}
              />
            </Form.Item>
          </Space>
        </div>
      </Form>
    </Modal>
  );
}
