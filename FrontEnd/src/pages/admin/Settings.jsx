import { useState, useEffect, useCallback, startTransition } from 'react';
import { Table, Button, Modal, Form, Input, Tag, Space, Popconfirm, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { listDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../services/departmentService';
import { useAppContext } from '../../context/AppContext';

export default function Settings() {
  const { messageApi } = useAppContext();
  const [departments, setDepartments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: pageSize, offset: (page - 1) * pageSize };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const res = await listDepartments(params);
      setDepartments(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch {
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => { startTransition(() => { fetchDepartments(); }); }, [fetchDepartments]);

  const openCreateModal = () => {
    setEditingDept(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    form.setFieldsValue({ name: dept.name, code: dept.code });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      if (editingDept) {
        await updateDepartment(editingDept.id, values);
        messageApi.success('Departamento actualizado correctamente.');
      } else {
        await createDepartment(values);
        messageApi.success('Departamento creado correctamente.');
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      if (err?.response?.data?.detail) {
        messageApi.error(err.response.data.detail);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (deptId) => {
    try {
      const res = await deleteDepartment(deptId);
      messageApi.success(res.data?.detail || 'Departamento eliminado.');
      fetchDepartments();
    } catch (err) {
      if (err?.response?.data?.detail) {
        messageApi.error(err.response.data.detail);
      } else {
        messageApi.error('Error al eliminar departamento.');
      }
    }
  };

  const deptColumns = [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Código', dataIndex: 'code', key: 'code', width: 100 },
    {
      title: 'Estado',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (active) => (
        <Tag color={active ? 'green' : 'red'}>{active ? 'Activo' : 'Inactivo'}</Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          <Popconfirm
            title="Eliminar departamento"
            description="¿Está seguro de eliminar este departamento?"
            onConfirm={() => handleDelete(record.id)}
            okText="Eliminar"
            cancelText="Cancelar"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-settings-page">
      {/* DEPARTMENTS SECTION */}
      <section className="settings-section">
        <div className="settings-section-header">
          <h3>Gestión de Departamentos</h3>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            Agregar Departamento
          </Button>
        </div>
        <Table
          dataSource={departments}
          columns={deptColumns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (t) => `Total: ${t} departamentos`,
          }}
          className="admin-settings-table"
          size="middle"
        />
      </section>

      {/* SLA SECTION — maquetado */}
      <section className="settings-section settings-disabled">
        <div className="settings-section-header">
          <h3>Umbrales de Trazabilidad (SLA)</h3>
          <Tag>Próximamente</Tag>
        </div>
        <div className="settings-disabled-body">
          <Form layout="inline">
            <Form.Item label="Días límite sin actividad">
              <InputNumber disabled value={7} min={1} max={99} />
            </Form.Item>
          </Form>
        </div>
      </section>

      {/* CATEGORIES SECTION — maquetado */}
      <section className="settings-section settings-disabled">
        <div className="settings-section-header">
          <h3>Gestión de Categorías de Tickets</h3>
          <Tag>Próximamente</Tag>
        </div>
        <div className="settings-disabled-body">
          <p className="settings-placeholder-text">
            Estructura base para añadir o desactivar categorías de fallas de soporte técnico.
          </p>
        </div>
      </section>

      {/* CREATE / EDIT DEPARTMENT MODAL */}
      <Modal
        title={editingDept ? 'Editar Departamento' : 'Agregar Departamento'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={
          <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="primary" loading={submitting} onClick={handleSubmit}>
              {editingDept ? 'Guardar' : 'Crear'}
            </Button>
          </Space>
        }
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'Campo requerido' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            label="Código"
            rules={[
              { required: true, message: 'Campo requerido' },
              { len: 3, message: 'Debe tener exactamente 3 caracteres' },
            ]}
          >
            <Input maxLength={3} style={{ textTransform: 'uppercase' }}
              onChange={(e) => { e.target.value = e.target.value.toUpperCase(); }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
