import './History.scss';
import { useState, useEffect, useCallback, startTransition } from 'react';
import { Table, Select, DatePicker, Space, Tag, Button, Tooltip } from 'antd';
import { Eye } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { listTickets } from '../../services/ticketService';
import { ticketStatusList } from '../../constants/lists';

const { RangePicker } = DatePicker;

const statusColor = (status) => {
  switch (status) {
    case 'Abierto': return 'red';
    case 'Asignado': return 'orange';
    case 'En Proceso': return 'gold';
    case 'Pendiente': return 'geekblue';
    case 'Resuelto': return 'green';
    case 'Cerrado': return 'default';
    case 'Anulado': return 'default';
    default: return 'default';
  }
};

export default function TechnicianHistory() {
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        limit: pageSize,
        offset: (page - 1) * pageSize,
        status: statusFilter || undefined,
        date_from: dateRange?.[0]?.format('YYYY-MM-DD'),
        date_to: dateRange?.[1]?.format('YYYY-MM-DD'),
        search: searchQuery || undefined,
      };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const res = await listTickets(params);
      setTickets(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, dateRange, searchQuery]);

  useEffect(() => {
    startTransition(() => { fetchTickets(); });
  }, [fetchTickets]);

  const columns = [
    {
      title: 'ID', dataIndex: 'id', key: 'id', width: 100,
      render: (_, record) => <span className="ticket-id">{record.ticket_number || `#${record.id.slice(0, 8)}`}</span>,
    },
    { title: 'Descripción', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: 'Solicitante', dataIndex: 'requester_name', key: 'requester', width: 150, render: (v) => v || '—', responsive: ['md' ] },
    {
      title: 'Estado', dataIndex: 'status', key: 'status', width: 120,
      render: (s) => <Tag color={statusColor(s)}>{s}</Tag>,
    },
    { title: 'Prioridad', dataIndex: 'priority', key: 'priority', width: 100, responsive: ['lg' ] },
    {
      title: 'Fecha', dataIndex: 'opened_at', key: 'opened_at', width: 110,
      render: (d) => (d ? new Date(d).toLocaleDateString('es-ES') : '—'),
      responsive: ['md' ],
    },
    {
      title: 'Acción', key: 'action', width: 140,
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver detalle">
            <Button type="text" icon={<Eye size={18} />} onClick={() => navigate(`/workspace/${record.ticket_number || record.id}`)} />
          </Tooltip>
          {record.status !== 'Resuelto' && record.status !== 'Cerrado' && (
            <a onClick={() => navigate(`/workspace/${record.ticket_number || record.id}`)} className="history-atender-link">Atender</a>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="technician-history">
      <h2 className="page-title">HISTORIAL DE TICKETS ASIGNADOS</h2>
      <div className="history-filter-bar">
        <Select
          allowClear
          placeholder="Filtrar por estado"
          className="history-filter-status"
          value={statusFilter}
          onChange={(val) => { setStatusFilter(val); setPage(1); }}
          options={ticketStatusList}
        />
        <RangePicker
          className="history-filter-date"
          onChange={(dates) => { setDateRange(dates); setPage(1); }}
        />
      </div>
      <Table
        dataSource={tickets}
        columns={columns}
        rowKey="id"
        loading={loading}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: page, pageSize, total,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
          showTotal: (t) => `Total: ${t} tickets`,
        }}
        className="history-table"
        size="middle"
      />
    </div>
  );
}
