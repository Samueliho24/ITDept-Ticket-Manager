import './EquipmentInventory.scss';
import { useState, useEffect, useCallback, startTransition } from 'react';
import { Table, Input, Select, Button, Tooltip, Dropdown } from 'antd';
import { Search, Eye, MoreVertical } from 'lucide-react';
import { PlusOutlined, EditOutlined, SwapOutlined, StopOutlined, EyeOutlined } from '@ant-design/icons';
import { listEquipments } from '../../services/equipmentService';
import { listDepartments } from '../../services/departmentService';
import { equipmentTypeList, equipmentStatusList } from '../../constants/lists';
import { useAuth } from '../../context/AuthContext';
import EquipmentDetailModal from './modals/EquipmentDetailModal';
import AddAssetModal from '../admin/modals/AddAssetModal';
import EditAssetModal from '../admin/modals/EditAssetModal';
import TransferAssetModal from '../admin/modals/TransferAssetModal';
import DecommissionAssetModal from '../admin/modals/DecommissionAssetModal';

export default function EquipmentInventory() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [equipment, setEquipment] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({ search: '', equipment_type: '', status: '' });
  const [departments, setDepartments] = useState([]);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailEquipment, setDetailEquipment] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editEquipment, setEditEquipment] = useState(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferEquipment, setTransferEquipment] = useState(null);
  const [decommissionOpen, setDecommissionOpen] = useState(false);
  const [decommissionEquipment, setDecommissionEquipment] = useState(null);

  useEffect(() => {
    listDepartments({ limit: 100 }).then((res) => setDepartments(res.data.items || [])).catch(() => {});
  }, []);

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        limit: pageSize,
        offset: (page - 1) * pageSize,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
      };
      const res = await listEquipments(params);
      setEquipment(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch {
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    startTransition(() => { fetchEquipment(); });
  }, [fetchEquipment]);

  const openDetail = (record) => {
    setDetailEquipment(record);
    setDetailOpen(true);
  };

  const openEdit = (record) => {
    setEditEquipment(record);
    setEditOpen(true);
  };

  const openTransfer = (record) => {
    setTransferEquipment(record);
    setTransferOpen(true);
  };

  const openDecommission = (record) => {
    setDecommissionEquipment(record);
    setDecommissionOpen(true);
  };

  const adminDropdownItems = (record) => [
    { key: 'view', icon: <EyeOutlined />, label: 'Ver detalle', onClick: () => openDetail(record) },
    { key: 'edit', icon: <EditOutlined />, label: 'Editar', onClick: () => openEdit(record) },
    { key: 'transfer', icon: <SwapOutlined />, label: 'Trasladar', onClick: () => openTransfer(record) },
    { key: 'decommission', icon: <StopOutlined />, label: 'Cambiar Estado', onClick: () => openDecommission(record) },
  ];

  const statusColor = {
    Operativo: 'green',
    'En Mantenimiento': 'gold',
    'En Observación': 'gold',
    Dañado: 'red',
    Desincorporado: 'red',
  };

  const columns = [
    { title: 'Código', dataIndex: 'inventory_code', key: 'code', width: 120 },
    { title: 'Tipo', dataIndex: 'equipment_type', key: 'type', width: 130 },
    { title: 'Marca', dataIndex: 'brand', key: 'brand', width: 120, render: (v) => v || '—' },
    { title: 'Modelo', dataIndex: 'model', key: 'model', width: 130, render: (v) => v || '—' },
    {
      title: 'Ubicación',
      key: 'location',
      width: 140,
      render: (_, r) => r.department_name || '—',
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (s) => (
        <span className="equip-status-tag" style={{ color: statusColor[s] || '#333' }}>{s}</span>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 60,
      render: (_, record) =>
        isAdmin ? (
          <Dropdown menu={{ items: adminDropdownItems(record) }} trigger={['click']} placement="bottomRight">
            <Tooltip title="Acciones">
              <Button type="text" icon={<MoreVertical size={18} />} />
            </Tooltip>
          </Dropdown>
        ) : (
          <Tooltip title="Ver ficha técnica">
            <Button type="text" icon={<Eye size={18} />} onClick={() => openDetail(record)} />
          </Tooltip>
        ),
    },
  ];

  const handleRefresh = () => fetchEquipment();

  return (
    <div className="equipment-inventory">
      <h2 className="page-title">INVENTARIO TECNOLÓGICO</h2>
      <div className="inventory-filter-bar">
        <Input
          placeholder="Buscar por código, marca o modelo..."
          prefix={<Search size={16} />}
          allowClear
          className="filter-flex-min-200"
          value={filters.search}
          onChange={(e) => { setFilters((p) => ({ ...p, search: e.target.value })); setPage(1); }}
        />
        <Select
          allowClear
          placeholder="Tipo"
          className="filter-width-160"
          value={filters.equipment_type || undefined}
          onChange={(v) => { setFilters((p) => ({ ...p, equipment_type: v })); setPage(1); }}
          options={equipmentTypeList}
        />
        <Select
          allowClear
          placeholder="Estado"
          className="filter-width-160"
          value={filters.status || undefined}
          onChange={(v) => { setFilters((p) => ({ ...p, status: v })); setPage(1); }}
          options={equipmentStatusList}
        />
        {isAdmin && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddOpen(true)}>
            Nuevo Activo
          </Button>
        )}
      </div>
      <Table
        dataSource={equipment}
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
          showTotal: (t) => `Total: ${t} equipos`,
        }}
        className="equipment-table"
        size="middle"
      />

      <EquipmentDetailModal
        equipment={detailEquipment}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={isAdmin ? openEdit : null}
        onTransfer={isAdmin ? openTransfer : null}
        onDecommission={isAdmin ? openDecommission : null}
      />
      <AddAssetModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={handleRefresh}
        departments={departments}
      />
      <EditAssetModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={handleRefresh}
        departments={departments}
        equipment={editEquipment}
      />
      <TransferAssetModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        onSuccess={handleRefresh}
        departments={departments}
        equipment={transferEquipment}
      />
      <DecommissionAssetModal
        open={decommissionOpen}
        onClose={() => setDecommissionOpen(false)}
        onSuccess={handleRefresh}
        equipment={decommissionEquipment}
      />
    </div>
  );
}
