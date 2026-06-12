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

  const lettersKeyDown = (e) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ ]$/.test(e.key)) e.preventDefault();
  };

  const lettersPaste = (e) => {
    const text = e.clipboardData.getData('text');
    if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/.test(text)) e.preventDefault();
  };

  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
    e.target.value = raw.length > 4 ? `${raw.slice(0, 4)}-${raw.slice(4)}` : raw;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
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
      closable={false}
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
          <Space className="w-100" size="middle" styles={{ item: { flex: 1 } }}>
            <Form.Item
              name="name"
              label="Nombre"
              rules={[
                { required: true, message: 'Campo requerido' },
                { pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, message: 'Solo se permiten letras' },
              ]}
              
              initialValue={user?.name}
            >
              <Input onKeyDown={lettersKeyDown} onPaste={lettersPaste} />
            </Form.Item>
            <Form.Item
              name="lastname"
              label="Apellido"
              rules={[
                { required: true, message: 'Campo requerido' },
                { pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, message: 'Solo se permiten letras' },
              ]}
              
              initialValue={user?.lastname}
            >
              <Input onKeyDown={lettersKeyDown} onPaste={lettersPaste} />
            </Form.Item>
          </Space>

          <Space className="w-100" size="middle" styles={{ item: { flex: 1 } }}>
            <Form.Item
              name="username"
              label="Usuario"
              rules={[
                { required: true, message: 'Campo requerido' },
                { min: 3, message: 'Mínimo 3 caracteres' },
                { pattern: /^[a-zA-Z0-9_]+$/, message: 'Solo letras, números y guión bajo' },
              ]}
              
              initialValue={user?.username}
            >
              <Input disabled={isEditing} />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Teléfono"
              rules={[
                { pattern: /^\d{4}-\d{7}$/, message: 'Debe tener formato 0000-0000000' },
              ]}
              
              initialValue={user?.phone}
            >
              <Input placeholder="0000-0000000" onChange={handlePhoneChange} maxLength={12} />
            </Form.Item>
          </Space>

        {!isEditing && (
            <Space className="w-100" size="middle" styles={{ item: { flex: 1 } }}>
              <Form.Item
                name="password"
                label="Contraseña"
                rules={[
                  { required: true, message: 'Campo requerido' },
                  { min: 6, message: 'Mínimo 6 caracteres' },
                ]}
                
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
                
              >
                <Input.Password />
              </Form.Item>
            </Space>
        )}

          <Space className="w-100" size="middle" styles={{ item: { flex: 1 } }}>
            <Form.Item
              name="role"
              label="Rol"
              rules={[{ required: true, message: 'Campo requerido' }]}
              
              initialValue={user?.role}
            >
              <Select options={rolTypeList} />
            </Form.Item>
            <Form.Item
              name="department_id"
              label="Departamento"
              
              initialValue={user?.department_id || undefined}
            >
              <Select
                allowClear
                placeholder="Seleccionar departamento"
                options={departments.map((d) => ({ label: d.name, value: d.id }))}
                rules={[{ required: true, message: 'Campo requerido' }]}
              />
            </Form.Item>
          </Space>
      </Form>
    </Modal>
  );
}
