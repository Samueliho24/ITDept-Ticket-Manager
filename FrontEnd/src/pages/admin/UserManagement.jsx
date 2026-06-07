import { useState, useEffect, useMemo, useCallback, startTransition } from 'react';
import { Table, Tag, Switch, Button, Input, Modal, Form, Select, Space } from 'antd';
import { EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { listUsers, createUser, updateUser, toggleUserStatus } from '../../services/userService';
import { listDepartments } from '../../services/departmentService';
import { useAppContext } from '../../context/AppContext';
import { ROLE_LABELS } from '../../context/AuthContext';

export default function UserManagement() {
  const { messageApi } = useAppContext();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [form] = Form.useForm();

  const deptMap = useMemo(() => {
    const map = new Map();
    departments.forEach((d) => map.set(d.id, d.name));
    return map;
  }, [departments]);

  useEffect(() => {
    listDepartments({ limit: 100 }).then((res) => setDepartments(res.data.items || [])).catch(() => {});
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: pageSize, offset: (page - 1) * pageSize };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const res = await listUsers(params);
      setUsers(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => { startTransition(() => { fetchUsers(); }); }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        `${u.name} ${u.lastname}`.toLowerCase().includes(q) ||
        (deptMap.get(u.department_id) || '').toLowerCase().includes(q),
    );
  }, [users, search, deptMap]);

  const openCreateModal = () => {
    setEditingUser(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      lastname: user.lastname,
      username: user.username,
      role: user.role,
      department_id: user.department_id || undefined,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!editingUser && values.password !== values.confirmPassword) {
        messageApi.error('Las contraseñas no coinciden.');
        return;
      }
      setSubmitting(true);
      if (editingUser) {
        const payload = {
          name: values.name,
          lastname: values.lastname,
          role: values.role,
          department_id: values.department_id || null,
        };
        await updateUser(editingUser.id, payload);
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
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      if (err?.response?.data?.detail) {
        messageApi.error(err.response.data.detail);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId, active) => {
    try {
      await toggleUserStatus(userId, active);
      messageApi.success(active ? 'Usuario activado.' : 'Usuario desactivado.');
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, active } : u)));
    } catch {
      messageApi.error('Error al cambiar estado del usuario.');
    }
  };

  const columns = [
    {
      title: 'Nombre Completo',
      key: 'fullname',
      render: (_, r) => `${r.name} ${r.lastname}`,
    },
    {
      title: 'Usuario',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Departamento',
      key: 'department',
      render: (_, r) => deptMap.get(r.department_id) || '—',
    },
    {
      title: 'Rol Asignado',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const color = role === 'admin' ? 'blue' : role === 'technician' ? 'gold' : 'green';
        return <Tag color={color}>{ROLE_LABELS[role] || role}</Tag>;
      },
    },
    {
      title: 'Estado',
      dataIndex: 'active',
      key: 'active',
      render: (active, record) => (
        <Switch checked={active} onChange={(checked) => handleToggleStatus(record.id, checked)} />
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => openEditModal(record)}
        />
      ),
    },
  ];

  return (
    <div className="admin-users-page">
      <h2 className="page-title">GESTIÓN DE USUARIOS</h2>
      <div className="admin-users-header">
        <Input
          placeholder="Escribir por nombre o departamento"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-users-search"
          style={{ flex: 1 }}
          allowClear
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
          Registrar Usuario
        </Button>
      </div>

      <Table
        dataSource={filteredUsers}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
          showTotal: (t) => `Total: ${t} usuarios`,
        }}
        className="admin-users-table"
        size="middle"
      />

      <Modal
        title={editingUser ? 'Editar Usuario' : 'Crear Usuario'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={
          <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="primary" loading={submitting} onClick={handleSubmit}>
              {editingUser ? 'Editar' : 'Crear'}
            </Button>
          </Space>
        }
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Space style={{ width: '100%' }} size="middle">
            <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'Campo requerido' }]} style={{ width: '50%' }}>
              <Input />
            </Form.Item>
            <Form.Item name="lastname" label="Apellido" rules={[{ required: true, message: 'Campo requerido' }]} style={{ width: '50%' }}>
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
          >
            <Input disabled={!!editingUser} />
          </Form.Item>

          {!editingUser && (
            <Space style={{ width: '100%' }} size="middle">
              <Form.Item
                name="password"
                label="Contraseña"
                rules={[{ required: true, message: 'Campo requerido' }, { min: 6, message: 'Mínimo 6 caracteres' }]}
                style={{ width: '50%' }}
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
                style={{ width: '50%' }}
              >
                <Input.Password />
              </Form.Item>
            </Space>
          )}

          <Space style={{ width: '100%' }} size="middle">
            <Form.Item name="role" label="Rol" rules={[{ required: true, message: 'Campo requerido' }]} style={{ width: '50%' }}>
              <Select
                options={[
                  { label: 'Administrador', value: 'admin' },
                  { label: 'Técnico', value: 'technician' },
                  { label: 'Solicitante', value: 'requestor' },
                ]}
              />
            </Form.Item>
            <Form.Item name="department_id" label="Departamento" style={{ width: '50%' }}>
              <Select
                allowClear
                placeholder="Seleccionar departamento"
                options={departments.map((d) => ({ label: d.name, value: d.id }))}
              />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
