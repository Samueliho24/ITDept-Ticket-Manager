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
        <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="primary" loading={submitting} onClick={handleSubmit}>
            {isEditing ? 'Guardar' : 'Registrar'}
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" preserve={false} requiredMark={false}>
        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            name="name"
            label="Nombre"
            rules={[{ required: true, message: 'Campo requerido' }]}
            style={{ flex: 1 }}
            initialValue={user?.name}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="lastname"
            label="Apellido"
            rules={[{ required: true, message: 'Campo requerido' }]}
            style={{ flex: 1 }}
            initialValue={user?.lastname}
          >
            <Input />
          </Form.Item>
        </Space>

        <Form.Item
          name="username"
          label="Usuario"
          rules={[
            { required: true, message: 'Campo requerido' },
            { min: 3, message: 'Mínimo 3 caracteres' },
          ]}
          initialValue={user?.username}
        >
          <Input disabled={isEditing} />
        </Form.Item>

        {!isEditing && (
          <Space style={{ width: '100%' }} size="middle">
            <Form.Item
              name="password"
              label="Contraseña"
              rules={[
                { required: true, message: 'Campo requerido' },
                { min: 6, message: 'Mínimo 6 caracteres' },
              ]}
              style={{ flex: 1 }}
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
              style={{ flex: 1 }}
            >
              <Input.Password />
            </Form.Item>
          </Space>
        )}

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item
            name="role"
            label="Rol"
            rules={[{ required: true, message: 'Campo requerido' }]}
            style={{ flex: 1 }}
            initialValue={user?.role}
          >
            <Select options={rolTypeList} />
          </Form.Item>
          <Form.Item
            name="department_id"
            label="Departamento"
            style={{ flex: 1 }}
            initialValue={user?.department_id || undefined}
          >
            <Select
              allowClear
              placeholder="Seleccionar departamento"
              options={departments.map((d) => ({ label: d.name, value: d.id }))}
            />
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  );
}
