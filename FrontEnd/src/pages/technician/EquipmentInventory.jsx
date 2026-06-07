import { useState, useEffect, useCallback, startTransition } from 'react';
import { Table, Input, Select, Button, Tooltip, Tag } from 'antd';
import { Search, Eye } from 'lucide-react';
import { listEquipments } from '../../services/equipmentService';
import { equipmentTypeList, equipmentStatusList } from '../../constants/lists';
import { useLayoutContext } from '../../layout/MainLayout';

export default function EquipmentInventory() {
  const { onViewEquipment } = useLayoutContext();
  const [equipment, setEquipment] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({ search: '', equipment_type: '', status: '' });

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
      render: (s) => {
        const color = s === 'Operativo' ? 'green' : s === 'En Observación' ? 'gold' : 'red';
        return <Tag color={color}>{s}</Tag>;
      },
    },
    {
      title: '',
      key: 'action',
      width: 60,
      render: (_, record) => (
        <Tooltip title="Ver ficha técnica">
          <Button type="text" icon={<Eye size={18} />} onClick={() => onViewEquipment(record)} />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="equipment-inventory">
      <h2 className="page-title">INVENTARIO TECNOLÓGICO</h2>
      <div className="inventory-filter-bar">
        <Input
          placeholder="Buscar por código, marca o modelo..."
          prefix={<Search size={16} />}
          allowClear
          style={{ flex: 1, minWidth: 200 }}
          value={filters.search}
          onChange={(e) => { setFilters((p) => ({ ...p, search: e.target.value })); setPage(1); }}
        />
        <Select
          allowClear
          placeholder="Tipo"
          style={{ width: 160 }}
          value={filters.equipment_type || undefined}
          onChange={(v) => { setFilters((p) => ({ ...p, equipment_type: v })); setPage(1); }}
          options={equipmentTypeList}
        />
        <Select
          allowClear
          placeholder="Estado"
          style={{ width: 160 }}
          value={filters.status || undefined}
          onChange={(v) => { setFilters((p) => ({ ...p, status: v })); setPage(1); }}
          options={equipmentStatusList}
        />
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
    </div>
  );
}
