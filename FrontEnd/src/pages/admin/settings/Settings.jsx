import './Settings.scss';
import { useState, useEffect, useCallback, startTransition } from 'react';
import { Table, Button, Tag, InputNumber, Form, Dropdown, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { MoreVertical } from 'lucide-react';
import { listDepartments } from '../../../services/departmentService';
import { listCategories } from '../../../services/categoryService';
import DepartmentFormModal from './components/DepartmentFormModal';
import DepartmentStatusModal from './components/DepartmentStatusModal';
import DepartmentDeleteModal from './components/DepartmentDeleteModal';
import CategoryFormModal from './components/CategoryFormModal';
import CategoryStatusModal from './components/CategoryStatusModal';
import CategoryDeleteModal from './components/CategoryDeleteModal';

export default function Settings() {
  // --- Departments state ---
  const [departments, setDepartments] = useState([]);
  const [deptTotal, setDeptTotal] = useState(0);
  const [deptLoading, setDeptLoading] = useState(false);
  const [deptPage, setDeptPage] = useState(1);
  const [deptPageSize, setDeptPageSize] = useState(10);
  const [selectedDept, setSelectedDept] = useState(null);
  const [formDeptOpen, setFormDeptOpen] = useState(false);
  const [statusDeptOpen, setStatusDeptOpen] = useState(false);
  const [deleteDeptOpen, setDeleteDeptOpen] = useState(false);

  // --- Categories state ---
  const [categories, setCategories] = useState([]);
  const [catTotal, setCatTotal] = useState(0);
  const [catLoading, setCatLoading] = useState(false);
  const [catPage, setCatPage] = useState(1);
  const [catPageSize, setCatPageSize] = useState(10);
  const [selectedCat, setSelectedCat] = useState(null);
  const [formCatOpen, setFormCatOpen] = useState(false);
  const [statusCatOpen, setStatusCatOpen] = useState(false);
  const [deleteCatOpen, setDeleteCatOpen] = useState(false);

  const fetchDepartments = useCallback(async () => {
    setDeptLoading(true);
    try {
      const params = { limit: deptPageSize, offset: (deptPage - 1) * deptPageSize };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const res = await listDepartments(params);
      setDepartments(res.data.items || []);
      setDeptTotal(res.data.total || 0);
    } catch {
      setDepartments([]);
    } finally {
      setDeptLoading(false);
    }
  }, [deptPage, deptPageSize]);

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

  // --- Department handlers ---
  const openCreateDept = () => {
    setSelectedDept(null);
    setFormDeptOpen(true);
  };

  const openEditDept = (dept) => {
    setSelectedDept(dept);
    setFormDeptOpen(true);
  };

  const openStatusDept = (dept) => {
    setSelectedDept(dept);
    setStatusDeptOpen(true);
  };

  const openDeleteDept = (dept) => {
    setSelectedDept(dept);
    setDeleteDeptOpen(true);
  };

  const handleDeptFormSuccess = () => {
    setFormDeptOpen(false);
    setSelectedDept(null);
    fetchDepartments();
  };

  const handleDeptStatusSuccess = () => {
    setStatusDeptOpen(false);
    setSelectedDept(null);
    fetchDepartments();
  };

  const handleDeptDeleteSuccess = () => {
    setDeleteDeptOpen(false);
    setSelectedDept(null);
    fetchDepartments();
  };

  // --- Category handlers ---
  const openCreateCat = () => {
    setSelectedCat(null);
    setFormCatOpen(true);
  };

  const openEditCat = (cat) => {
    setSelectedCat(cat);
    setFormCatOpen(true);
  };

  const openStatusCat = (cat) => {
    setSelectedCat(cat);
    setStatusCatOpen(true);
  };

  const openDeleteCat = (cat) => {
    setSelectedCat(cat);
    setDeleteCatOpen(true);
  };

  const handleCatFormSuccess = () => {
    setFormCatOpen(false);
    setSelectedCat(null);
    fetchCategories();
  };

  const handleCatStatusSuccess = () => {
    setStatusCatOpen(false);
    setSelectedCat(null);
    fetchCategories();
  };

  const handleCatDeleteSuccess = () => {
    setDeleteCatOpen(false);
    setSelectedCat(null);
    fetchCategories();
  };

  // --- Action items ---
  const deptActionItems = (record) => [
    { key: 'edit', icon: <EditOutlined />, label: 'Editar', onClick: () => openEditDept(record) },
    { key: 'status', icon: record.is_active ? <CloseCircleOutlined /> : <CheckCircleOutlined />, label: record.is_active ? 'Desactivar' : 'Activar', onClick: () => openStatusDept(record) },
    { key: 'delete', icon: <DeleteOutlined />, label: 'Eliminar', danger: true, onClick: () => openDeleteDept(record) },
  ];

  const catActionItems = (record) => [
    { key: 'edit', icon: <EditOutlined />, label: 'Editar', onClick: () => openEditCat(record) },
    { key: 'status', icon: record.is_active ? <CloseCircleOutlined /> : <CheckCircleOutlined />, label: record.is_active ? 'Deshabilitar' : 'Habilitar', onClick: () => openStatusCat(record) },
    { key: 'delete', icon: <DeleteOutlined />, label: 'Eliminar', danger: true, onClick: () => openDeleteCat(record) },
  ];

  // --- Columns ---
  const deptColumns = [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Código', dataIndex: 'code', key: 'code', width: 100 },
    {
      title: 'Estado',
      key: 'status',
      width: 110,
      render: (_, r) => (
        <Tag color={r.is_active ? 'green' : 'red'}>{r.is_active ? 'Activo' : 'Inactivo'}</Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Dropdown menu={{ items: deptActionItems(record) }} trigger={['click']} placement="bottomRight">
          <Tooltip title="Acciones">
            <Button type="text" icon={<MoreVertical size={18} />} />
          </Tooltip>
        </Dropdown>
      ),
    },
  ];

  const catColumns = [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    {
      title: 'Estado',
      key: 'status',
      width: 110,
      render: (_, r) => (
        <Tag color={r.is_active ? 'green' : 'red'}>{r.is_active ? 'Activo' : 'Inactivo'}</Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Dropdown menu={{ items: catActionItems(record) }} trigger={['click']} placement="bottomRight">
          <Tooltip title="Acciones">
            <Button type="text" icon={<MoreVertical size={18} />} />
          </Tooltip>
        </Dropdown>
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
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateDept}>
            Agregar Departamento
          </Button>
        </div>
        <Table
          dataSource={departments}
          columns={deptColumns}
          rowKey="id"
          loading={deptLoading}
          pagination={{
            current: deptPage,
            pageSize: deptPageSize,
            total: deptTotal,
            onChange: (p, ps) => { setDeptPage(p); setDeptPageSize(ps); },
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
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateCat}>
            Agregar Categoría
          </Button>
        </div>
        <Table
          dataSource={categories}
          columns={catColumns}
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

      {/* DEPARTMENT MODALS */}
      <DepartmentFormModal
        open={formDeptOpen}
        onClose={() => { setFormDeptOpen(false); setSelectedDept(null); }}
        onSuccess={handleDeptFormSuccess}
        department={selectedDept}
      />
      <DepartmentStatusModal
        open={statusDeptOpen}
        onClose={() => { setStatusDeptOpen(false); setSelectedDept(null); }}
        onSuccess={handleDeptStatusSuccess}
        department={selectedDept}
      />
      <DepartmentDeleteModal
        open={deleteDeptOpen}
        onClose={() => { setDeleteDeptOpen(false); setSelectedDept(null); }}
        onSuccess={handleDeptDeleteSuccess}
        department={selectedDept}
      />

      {/* CATEGORY MODALS */}
      <CategoryFormModal
        open={formCatOpen}
        onClose={() => { setFormCatOpen(false); setSelectedCat(null); }}
        onSuccess={handleCatFormSuccess}
        category={selectedCat}
      />
      <CategoryStatusModal
        open={statusCatOpen}
        onClose={() => { setStatusCatOpen(false); setSelectedCat(null); }}
        onSuccess={handleCatStatusSuccess}
        category={selectedCat}
      />
      <CategoryDeleteModal
        open={deleteCatOpen}
        onClose={() => { setDeleteCatOpen(false); setSelectedCat(null); }}
        onSuccess={handleCatDeleteSuccess}
        category={selectedCat}
      />
    </div>
  );
}
