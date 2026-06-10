import { useState, useEffect, useCallback, startTransition } from 'react';
import { Table, Select, Button, Tag, Avatar, Space } from 'antd';
import { Check, Users, Clock, AlertCircle, User } from 'lucide-react';
import { listTickets, assignTicket } from '../../services/ticketService';
import { listUsers } from '../../services/userService';
import { useAppContext } from '../../context/AppContext';
import { priorityList } from '../../constants/lists';

function getDaysElapsed(dateStr) {
  if (!dateStr) return 0;
  const then = new Date(dateStr);
  const now = new Date();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function TicketAssignment() {
  const { messageApi } = useAppContext();
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(new Set());
  const [assignments, setAssignments] = useState({});
  const [priorities, setPriorities] = useState({});
  const [counts, setCounts] = useState({
    unassigned: 0,
    freeTechs: 0,
    inProgress: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [unassignedRes, usersRes, inProgressRes] = await Promise.all([
        listTickets({ status: 'Abierto', limit: 50 }),
        listUsers({ limit: 1000 }),
        listTickets({ status: 'En Proceso', limit: 1 }),
      ]);
      const allUsers = usersRes.data.items || [];
      const techsAndAdmins = allUsers.filter(
        (u) => u.active && (u.role === 'technician' || u.role === 'admin'),
      );
      setTickets(unassignedRes.data.items || []);
      setUsers(techsAndAdmins);
      setCounts({
        unassigned: unassignedRes.data.total || 0,
        freeTechs: techsAndAdmins.length,
        inProgress: inProgressRes.data.total || 0,
      });
    } catch (err) {
      console.error('Error al cargar datos de asignación:', err);
      setTickets([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    startTransition(() => { fetchData(); });
  }, [fetchData]);

  const handleAssign = async (ticketId) => {
    const technicianId = assignments[ticketId];
    if (!technicianId) {
      messageApi.warning('Seleccione un técnico antes de asignar.');
      return;
    }
    setConfirming((prev) => new Set(prev).add(ticketId));
    try {
      const payload = { technician_id: technicianId };
      if (priorities[ticketId]) payload.priority = priorities[ticketId];
      await assignTicket(ticketId, payload);
      const tech = users.find((u) => u.id === technicianId);
      messageApi.success(`Ticket asignado a ${tech?.name || ''} ${tech?.lastname || ''}.`);
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      setCounts((prev) => ({
        ...prev,
        unassigned: prev.unassigned - 1,
        freeTechs: prev.freeTechs,
      }));
      setAssignments((prev) => {
        const next = { ...prev };
        delete next[ticketId];
        return next;
      });
    } catch {
      messageApi.error('Error al asignar el ticket.');
    } finally {
      setConfirming((prev) => {
        const next = new Set(prev);
        next.delete(ticketId);
        return next;
      });
    }
  };

  const columns = [
    {
      title: 'Ticket ID',
      dataIndex: 'ticket_number',
      key: 'ticket_number',
      width: 160,
      render: (v) => <span className="ticket-id" style={{ fontSize: 12 }}>{v || '—'}</span>,
    },
    {
      title: 'Solicitante',
      dataIndex: 'requester_name',
      key: 'requester_name',
      width: 150,
      render: (v) => v || '—',
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (v) => {
        if (!v) return '—';
        return v.length > 60 ? `${v.slice(0, 60)}...` : v;
      },
    },
    {
      title: 'Prioridad',
      key: 'priority',
      width: 120,
      render: (_, record) => (
        <Select
          placeholder={record.priority || '—'}
          size="small"
          style={{ width: '100%' }}
          value={priorities[record.id] || record.priority || undefined}
          onChange={(val) => setPriorities((prev) => ({ ...prev, [record.id]: val }))}
          options={priorityList}
        />
      ),
    },
    {
      title: 'Ubicación',
      dataIndex: 'department_name',
      key: 'department_name',
      width: 140,
      render: (v) => v || '—',
    },
    {
      title: 'Fecha',
      key: 'date',
      width: 110,
      render: (_, r) => {
        const days = getDaysElapsed(r.opened_at);
        return (
          <div>
            <div style={{ fontSize: 13, lineHeight: 1.3 }}>{formatDate(r.opened_at)}</div>
            <div style={{
              fontSize: 11, color: days >= 5 ? '#860404' : '#64748B',
              fontWeight: days >= 5 ? 600 : 400,
            }}>
              {days} {days === 1 ? 'Día' : 'Días'}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Asignar Técnico',
      key: 'technician',
      width: 240,
      render: (_, record) => (
        <Select
          placeholder={
            <Space size={4}>
              <User size={14} />
              <span>Seleccionar Técnico...</span>
            </Space>
          }
          showSearch
          optionFilterProp="label"
          size="small"
          style={{ width: '100%' }}
          value={assignments[record.id] || undefined}
          onChange={(val) => setAssignments((prev) => ({ ...prev, [record.id]: val }))}
          options={users.map((u) => ({
            label: `${u.name} ${u.lastname}`,
            value: u.id,
            role: u.role,
            initials: `${u.name[0]}${u.lastname[0]}`,
          }))}
          optionRender={(option) => (
            <Space size={8}>
              <Avatar size={20} style={{ backgroundColor: '#006699', fontSize: 10, flexShrink: 0 }}>
                {option.data.initials}
              </Avatar>
              <span style={{ fontSize: 13 }}>{option.data.label}</span>
              {option.data.role === 'admin' && (
                <Tag color="blue" style={{ fontSize: 10, lineHeight: '16px', padding: '0 4px' }}>Admin</Tag>
              )}
            </Space>
          )}
        />
      ),
    },
    {
      title: 'Acción',
      key: 'action',
      width: 110,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<Check size={14} />}
          loading={confirming.has(record.id)}
          disabled={!assignments[record.id]}
          onClick={() => handleAssign(record.id)}
        >
          Asignar
        </Button>
      ),
    },
  ];

  const METRICS = [
    {
      key: 'unassigned',
      label: 'Tickets sin Asignar',
      value: counts.unassigned,
      icon: AlertCircle,
      color: '#860404',
    },
    {
      key: 'freeTechs',
      label: 'Técnicos Libres',
      value: counts.freeTechs,
      icon: Users,
      color: '#006699',
    },
    {
      key: 'inProgress',
      label: 'Tickets en Proceso',
      value: counts.inProgress,
      icon: Clock,
      color: '#B8860B',
    },
  ];

  return (
    <div className="ticket-assignment-page">
      <h2 className="page-title">ASIGNACIÓN DE TICKETS</h2>

      <div className="metrics-row">
        {METRICS.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.key} className="kpi-card" style={{ borderLeft: `4px solid ${m.color}` }}>
              <div className="icon-wrapper" style={{ backgroundColor: `${m.color}18` }}>
                <Icon size={24} style={{ color: m.color }} />
              </div>
              <div className="info">
                <div className="label">{m.label}</div>
                <div className="value">{m.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="assignment-card">
        <h3>Tickets pendientes por asignar:</h3>
        <Table
          dataSource={tickets}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (t) => `Total: ${t} tickets`,
          }}
          size="middle"
          locale={{ emptyText: 'No hay tickets pendientes por asignar.' }}
        />
      </div>
    </div>
  );
}
