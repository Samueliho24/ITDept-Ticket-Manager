import './History.scss';
import { useState, useEffect, useCallback, startTransition } from 'react';
import { Table, Select, DatePicker, Space, Tag, Button, Tooltip } from 'antd';
import { Eye } from 'lucide-react';
import { listTickets } from '../../services/ticketService';
import { ticketStatusList } from '../../constants/lists';
import { useModals } from '../../context/ModalContext';
import { useSearchParams } from 'react-router-dom';

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

export default function RequestorHistory() {
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [searchParams] = useSearchParams();
  const { openDetail, openCancel } = useModals();

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
      setTickets(res.data.items);
      setTotal(res.data.total);
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
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (_, record) => <span className="ticket-id">{record.ticket_number || `#${record.id.slice(0, 8)}`}</span>,
    },
    {
      title: 'Descripción',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => <Tag className="history-status-tag" color={statusColor(status)}>{status}</Tag>,
    },
    {
      title: 'Fecha',
      dataIndex: 'opened_at',
      key: 'opened_at',
      width: 110,
      responsive: ['md' ],
      render: (date) => date ? new Date(date).toLocaleDateString('es-ES') : '—',
    },
    {
      title: 'Acción',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Ver detalle">
            <Button type="text" icon={<Eye size={18} />} onClick={() => openDetail(record)} />
          </Tooltip>
          {(record.status === 'Abierto') && (
            <a onClick={() => openCancel(record)} className="history-cancel-link">Anular</a>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="requestor-history">
      <h2 className="page-title">HISTORIAL DE TICKETS</h2>
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
          current: page,
          pageSize,
          total,
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
