import { useState, useEffect, useCallback, startTransition } from 'react';
import { Table, DatePicker, Input, Select, Button, Modal, Tag, Descriptions, Space } from 'antd';
import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { listAuditLogs } from '../../services/auditService';

const { RangePicker } = DatePicker;

const ACTION_COLORS = {
  CREATE_USER: 'green',
  UPDATE_USER: 'blue',
  TOGGLE_USER_STATUS: 'orange',
  CHANGE_USER_PASSWORD: 'geekblue',
  CREATE_DEPARTMENT: 'green',
  UPDATE_DEPARTMENT: 'blue',
  DELETE_DEPARTMENT: 'red',
  login: 'default',
};

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

function actionLabel(action) {
  const labels = {
    CREATE_USER: 'Creación',
    UPDATE_USER: 'Modificación',
    TOGGLE_USER_STATUS: 'Estado',
    CHANGE_USER_PASSWORD: 'Contraseña',
    CREATE_DEPARTMENT: 'Creación',
    UPDATE_DEPARTMENT: 'Modificación',
    DELETE_DEPARTMENT: 'Eliminación',
    login: 'Inicio Sesión',
  };
  return labels[action] || action;
}

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dateRange, setDateRange] = useState(null);
  const [usernameFilter, setUsernameFilter] = useState('');
  const [actionFilter, setActionFilter] = useState(null);
  const [detailModal, setDetailModal] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: pageSize, offset: (page - 1) * pageSize };
      if (dateRange?.[0]) params.start_date = dateRange[0].toISOString();
      if (dateRange?.[1]) params.end_date = dateRange[1].toISOString();
      if (usernameFilter.trim()) params.username_query = usernameFilter.trim();
      if (actionFilter) params.action_filter = actionFilter;
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const res = await listAuditLogs(params);
      setLogs(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, dateRange, usernameFilter, actionFilter]);

  useEffect(() => { startTransition(() => { fetchLogs(); }); }, [fetchLogs]);

  const handleRangeChange = (dates) => {
    setDateRange(dates);
    setPage(1);
  };

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 160,
      render: (ts) => formatDateTime(ts),
    },
    {
      title: 'Usuario',
      key: 'user',
      width: 180,
      render: (_, r) => `${r.user_full_name} (${r.user_username})`,
    },
    {
      title: 'Tipo de Movimiento',
      dataIndex: 'action',
      key: 'action',
      width: 160,
      render: (action) => (
        <Tag color={ACTION_COLORS[action] || 'default'}>{actionLabel(action)}</Tag>
      ),
    },
    {
      title: 'Detalles',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
      render: (details) => {
        if (!details) return '—';
        const text = JSON.stringify(details);
        return text.length > 60 ? `${text.slice(0, 60)}...` : text;
      },
    },
    {
      title: 'Acción',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => setDetailModal(record)}
        />
      ),
    },
  ];

  const renderChanges = (details) => {
    if (!details) return null;
    if (details.changes) {
      const entries = Object.entries(details.changes);
      if (entries.length === 0) return <p>Sin cambios detectados.</p>;
      return (
        <table className="audit-changes-table">
          <thead>
            <tr>
              <th>Campo</th>
              <th>Valor Anterior</th>
              <th>Valor Nuevo</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([field, change]) => (
              <tr key={field}>
                <td><strong>{field}</strong></td>
                <td style={{ color: '#860404' }}>{change.from ?? '—'}</td>
                <td style={{ color: '#1A8C06' }}>{change.to ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return (
      <pre className="audit-json-snippet">
        {JSON.stringify(details, null, 2)}
      </pre>
    );
  };

  return (
    <div className="admin-audit-page">
      <div className="audit-filters-bar">
        <RangePicker
          onChange={handleRangeChange}
          style={{ minWidth: 240 }}
        />
        <Input
          placeholder="Buscar por usuario..."
          prefix={<SearchOutlined />}
          value={usernameFilter}
          onChange={(e) => { setUsernameFilter(e.target.value); setPage(1); }}
          style={{ width: 220 }}
          allowClear
        />
        <Select
          allowClear
          placeholder="Tipo de movimiento"
          style={{ width: 200 }}
          value={actionFilter}
          onChange={(val) => { setActionFilter(val); setPage(1); }}
          options={[
            { label: 'Creación', value: 'CREATE_USER' },
            { label: 'Modificación', value: 'UPDATE_USER' },
            { label: 'Estado', value: 'TOGGLE_USER_STATUS' },
            { label: 'Contraseña', value: 'CHANGE_USER_PASSWORD' },
            { label: 'Creación Departamento', value: 'CREATE_DEPARTMENT' },
            { label: 'Modificación Departamento', value: 'UPDATE_DEPARTMENT' },
            { label: 'Eliminación Departamento', value: 'DELETE_DEPARTMENT' },
            { label: 'Inicio Sesión', value: 'login' },
          ]}
        />
      </div>

      <Table
        dataSource={logs}
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
          showTotal: (t) => `Total: ${t} movimientos`,
        }}
        className="admin-audit-table"
        size="middle"
      />

      <Modal
        title="Detalles del Movimiento"
        open={!!detailModal}
        onCancel={() => setDetailModal(null)}
        footer={
          <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setDetailModal(null)}>Cerrar</Button>
          </Space>
        }
        width={640}
        destroyOnClose
      >
        {detailModal && (
          <>
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="UUID" span={2}>{detailModal.id}</Descriptions.Item>
              <Descriptions.Item label="Fecha">{formatDateTime(detailModal.timestamp)}</Descriptions.Item>
              <Descriptions.Item label="Operador">{detailModal.user_full_name}</Descriptions.Item>
              <Descriptions.Item label="Usuario">{detailModal.user_username}</Descriptions.Item>
              <Descriptions.Item label="Tabla Afectada">{detailModal.affected_table || '—'}</Descriptions.Item>
              <Descriptions.Item label="Registro ID">{detailModal.record_id || '—'}</Descriptions.Item>
            </Descriptions>
            <h4 style={{ marginBottom: 8 }}>Detalles de la operación</h4>
            {renderChanges(detailModal.details)}
          </>
        )}
      </Modal>
    </div>
  );
}
