import { useState, useEffect, useCallback, startTransition } from 'react';
import { Table, Button, Modal, Form, Input, Tag, Space, Popconfirm, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { listDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../services/departmentService';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../../services/categoryService';
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
  const [catForm] = Form.useForm();

  // --- Categories state ---
  const [categories, setCategories] = useState([]);
  const [catTotal, setCatTotal] = useState(0);
  const [catLoading, setCatLoading] = useState(false);
  const [catPage, setCatPage] = useState(1);
  const [catPageSize, setCatPageSize] = useState(10);
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catSubmitting, setCatSubmitting] = useState(false);

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

  const fetchCategories = useCallback(async () => {
    setCatLoading(true);
    try {
      const params = { limit: catPageSize, offset: (catPage - 1) * catPageSize };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const res = await listCategories(params);
      setCategories(res.data.items || []);
      setCatTotal(res.data.total || 0);
    } catch {
      setCategories([]);
    } finally {
      setCatLoading(false);
    }
  }, [catPage, catPageSize]);

  useEffect(() => { startTransition(() => { fetchDepartments(); }); }, [fetchDepartments]);
  useEffect(() => { startTransition(() => { fetchCategories(); }); }, [fetchCategories]);

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

  // --- Category handlers ---
  const openCreateCatModal = () => {
    setEditingCat(null);
    catForm.resetFields();
    setCatModalOpen(true);
  };

  const openEditCatModal = (cat) => {
    setEditingCat(cat);
    catForm.setFieldsValue({ name: cat.name });
    setCatModalOpen(true);
  };

  const handleCatSubmit = async () => {
    try {
      const values = await catForm.validateFields();
      setCatSubmitting(true);
      if (editingCat) {
        await updateCategory(editingCat.id, values);
        messageApi.success('Categoría actualizada correctamente.');
      } else {
        await createCategory(values);
        messageApi.success('Categoría creada correctamente.');
      }
      setCatModalOpen(false);
      fetchCategories();
    } catch (err) {
      if (err?.response?.data?.detail) {
        messageApi.error(err.response.data.detail);
      }
    } finally {
      setCatSubmitting(false);
    }
  };

  const handleToggleCatActive = async (cat) => {
    try {
      const res = await deleteCategory(cat.id);
      messageApi.success(res.data?.detail || 'Estado de categoría cambiado.');
      fetchCategories();
    } catch (err) {
      if (err?.response?.data?.detail) {
        messageApi.error(err.response.data.detail);
      } else {
        messageApi.error('Error al cambiar estado de la categoría.');
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
      <h2 className="page-title">CONFIGURACIÓN</h2>
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

      {/* CATEGORIES SECTION */}
      <section className="settings-section">
        <div className="settings-section-header">
          <h3>Gestión de Categorías de Tickets</h3>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateCatModal}>
            Agregar Categoría
          </Button>
        </div>
        <Table
          dataSource={categories}
          columns={[
            { title: 'Nombre', dataIndex: 'name', key: 'name' },
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
                  <Button type="text" icon={<EditOutlined />} onClick={() => openEditCatModal(record)} />
                  <Popconfirm
                    title={record.is_active ? 'Deshabilitar categoría' : 'Habilitar categoría'}
                    description={record.is_active ? '¿Está seguro de deshabilitar esta categoría?' : '¿Está seguro de habilitar esta categoría?'}
                    onConfirm={() => handleToggleCatActive(record)}
                    okText={record.is_active ? 'Deshabilitar' : 'Habilitar'}
                    cancelText="Cancelar"
                  >
                    <Button type="text" icon={record.is_active ? <CloseCircleOutlined /> : <CheckCircleOutlined />} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          rowKey="id"
          loading={catLoading}
          pagination={{
            current: catPage,
            pageSize: catPageSize,
            total: catTotal,
            onChange: (p, ps) => { setCatPage(p); setCatPageSize(ps); },
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (t) => `Total: ${t} categorías`,
          }}
          className="admin-settings-table"
          size="middle"
        />
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

      {/* CREATE / EDIT CATEGORY MODAL */}
      <Modal
        title={editingCat ? 'Editar Categoría' : 'Agregar Categoría'}
        open={catModalOpen}
        onCancel={() => setCatModalOpen(false)}
        footer={
          <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={() => setCatModalOpen(false)}>Cancelar</Button>
            <Button type="primary" loading={catSubmitting} onClick={handleCatSubmit}>
              {editingCat ? 'Guardar' : 'Crear'}
            </Button>
          </Space>
        }
        destroyOnClose
      >
        <Form form={catForm} layout="vertical" preserve={false}>
          <Form.Item
            name="name"
            label="Nombre"
            rules={[
              { required: true, message: 'Campo requerido' },
              { min: 2, message: 'Debe tener al menos 2 caracteres' },
            ]}
          >
            <Input placeholder="Ej: Redes, Hardware, Software" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
