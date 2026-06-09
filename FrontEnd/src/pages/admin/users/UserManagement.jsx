import { useState, useEffect, useMemo, useCallback, startTransition } from 'react';
import { Table, Tag, Button, Input, Space } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, KeyOutlined } from '@ant-design/icons';
import { listUsers } from '../../../services/userService';
import { listDepartments } from '../../../services/departmentService';
import { ROLE_LABELS } from '../../../context/AuthContext';
import UserFormModal from './components/UserFormModal';
import UserStatusModal from './components/UserStatusModal';
import UserDeleteModal from './components/UserDeleteModal';
import UserPasswordModal from './components/UserPasswordModal';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

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
    setSelectedUser(null);
    setFormModalOpen(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormModalOpen(true);
  };

  const openStatusModal = (user) => {
    setSelectedUser(user);
    setStatusModalOpen(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setPasswordModalOpen(true);
  };

  const handleFormSuccess = () => {
    setFormModalOpen(false);
    setSelectedUser(null);
    fetchUsers();
  };

  const handleStatusSuccess = () => {
    setStatusModalOpen(false);
    setSelectedUser(null);
    fetchUsers();
  };

  const handleDeleteSuccess = () => {
    setDeleteModalOpen(false);
    setSelectedUser(null);
    fetchUsers();
  };

  const handlePasswordSuccess = () => {
    setPasswordModalOpen(false);
    setSelectedUser(null);
    fetchUsers();
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
      render: (active) => (
        <span className={`user-status-badge ${active === 1 ? 'active' : 'inactive'}`}>
          <span className="status-dot" />
          {active === 1 ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space className="user-actions-bar">
          <Button type="text" icon={<EditOutlined />} onClick={() => openEditModal(record)} title="Editar" />
          <Button type="text" icon={record.active === 1 ? <CloseCircleOutlined /> : <CheckCircleOutlined />} onClick={() => openStatusModal(record)} title={record.active === 1 ? 'Desactivar' : 'Activar'} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => openDeleteModal(record)} title="Eliminar" />
          <Button type="text" icon={<KeyOutlined />} onClick={() => openPasswordModal(record)} title="Cambiar contraseña" />
        </Space>
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

      <UserFormModal
        open={formModalOpen}
        onClose={() => { setFormModalOpen(false); setSelectedUser(null); }}
        onSuccess={handleFormSuccess}
        user={selectedUser}
        departments={departments}
      />

      <UserStatusModal
        open={statusModalOpen}
        onClose={() => { setStatusModalOpen(false); setSelectedUser(null); }}
        onSuccess={handleStatusSuccess}
        user={selectedUser}
      />

      <UserDeleteModal
        open={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setSelectedUser(null); }}
        onSuccess={handleDeleteSuccess}
        user={selectedUser}
      />

      <UserPasswordModal
        open={passwordModalOpen}
        onClose={() => { setPasswordModalOpen(false); setSelectedUser(null); }}
        onSuccess={handlePasswordSuccess}
        user={selectedUser}
      />
    </div>
  );
}
