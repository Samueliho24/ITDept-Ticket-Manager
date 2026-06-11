import './History.scss';
import { useState, useEffect, useCallback, startTransition } from 'react';
import { Table, Select, DatePicker, Tag } from 'antd';
import { useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const searchQuery = location.state?.search || '';

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
      title: 'ID', dataIndex: 'id', key: 'id', width: 90,
      render: (id) => <span className="ticket-id">#{id?.slice(0, 8)}</span>,
    },
    { title: 'Título', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: 'Solicitante', dataIndex: 'requester_name', key: 'requester', width: 140, render: (v) => v || '—' },
    {
      title: 'Estado', dataIndex: 'status', key: 'status', width: 120,
      render: (s) => <Tag color={statusColor(s)}>{s}</Tag>,
    },
    { title: 'Categoría', dataIndex: 'category', key: 'category', width: 130, render: (v) => v || '—' },
    { title: 'Prioridad', dataIndex: 'priority', key: 'priority', width: 90 },
    {
      title: 'Fecha', dataIndex: 'opened_at', key: 'opened_at', width: 100,
      render: (d) => (d ? new Date(d).toLocaleDateString('es-ES') : '—'),
    },
  ];

  return (
    <div className="requestor-history">
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
