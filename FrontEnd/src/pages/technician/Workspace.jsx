import './Workspace.scss';
import { useState, useEffect, useCallback, startTransition } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Input, Select, Button, Spin, Tag, message, Divider } from 'antd';
import { ArrowLeft, Search, Wrench } from 'lucide-react';
import { getTicket, updateTicketStatus, updateTicketCategory } from '../../services/ticketService';
import { listEquipments } from '../../services/equipmentService';
import { listCategories } from '../../services/categoryService';
import ResolveTicketModal from './modals/ResolveTicketModal';

export default function Workspace() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticketStatus, setTicketStatus] = useState(null);
  const [category, setCategory] = useState(null);
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [equipmentResults, setEquipmentResults] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [equipSearching, setEquipSearching] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [categoryUpdating, setCategoryUpdating] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    if (!ticketId) return;
    startTransition(() => setLoading(true));
    getTicket(ticketId)
      .then((res) => {
        const t = res.data;
        setTicket(t);
        setCategory(t.category || null);
        setTicketStatus(t.status);
        if (t.equipment_id) setSelectedEquipment(t.equipment_id);
        if (t.status === 'Asignado') {
          updateTicketStatus(ticketId, { status: 'En Proceso' })
            .then(() => { setTicket((prev) => ({ ...prev, status: 'En Proceso' })); })
            .catch(() => {});
        }
      })
      .catch(() => { message.error('Error al cargar ticket'); navigate('/dashboard'); })
      .finally(() => setLoading(false));
  }, [ticketId, navigate]);

  useEffect(() => {
    listCategories({ limit: 100 })
      .then((res) => {
        const items = res.data.items || [];
        setCategoryOptions(
          items
            .filter((c) => c.is_active)
            .map((c) => ({ label: c.name, value: c.name })),
        );
      })
      .catch(() => {});
  }, []);

  const handleCategoryChange = async (val) => {
    setCategory(val);
    setCategoryUpdating(true);
    try {
      await updateTicketCategory(ticketId, { category: val || null });
      message.success('Categoría actualizada correctamente.');
    } catch {
      message.error('Error al actualizar la categoría.');
      setCategory(ticket?.category || null);
    } finally {
      setCategoryUpdating(false);
    }
  };

  const handleEquipSearch = useCallback(async (value) => {
    setEquipmentSearch(value);
    if (!value.trim()) { setEquipmentResults([]); return; }
    setEquipSearching(true);
    try {
      const res = await listEquipments({ search: value, limit: 8 });
      setEquipmentResults(res.data.items || []);
    } catch (err) { console.error('Error al buscar equipos:', err); setEquipmentResults([]); }
    finally { setEquipSearching(false); }
  }, []);

  const handleStatusChange = async (newStatus) => {
    setTicketStatus(newStatus);
    setStatusUpdating(true);
    try {
      await updateTicketStatus(ticketId, { status: newStatus });
      setTicket((prev) => ({ ...prev, status: newStatus }));
      message.success(`Estado actualizado a "${newStatus}".`);
    } catch {
      message.error('Error al cambiar el estado del ticket.');
      setTicketStatus(ticket?.status || null);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleSelectEquipment = (eq) => {
    setSelectedEquipment(eq.id);
    setEquipmentSearch(`${eq.inventory_code} — ${eq.brand || ''} ${eq.model || ''}`.trim());
    setEquipmentResults([]);
    message.success(`Equipo ${eq.inventory_code} asociado`);
  };

  if (loading) {
    return <div className="loading-center"><Spin size="large" /></div>;
  }

  if (!ticket) return null;

  return (
    <div className="workspace-layout">
      <div className="workspace-header">
        <Button type="text" icon={<ArrowLeft size={18} />} onClick={() => navigate('/dashboard')}>
          Volver al Dashboard
        </Button>
        <Tag color="blue" className="workspace-id">Ticket {ticket.ticket_number || `#${ticket.id.slice(0, 8)}`}</Tag>
      </div>

      <div className="workspace-panels">
        <Card className="workspace-left" title="Información del Ticket">
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Solicitante">{ticket.requester_name || '—'}</Descriptions.Item>
            <Descriptions.Item label="Departamento">{ticket.department_name || '—'}</Descriptions.Item>
            <Descriptions.Item label="Estado"><Tag>{ticket.status}</Tag></Descriptions.Item>
            <Descriptions.Item label="Prioridad">{ticket.priority}</Descriptions.Item>
            <Descriptions.Item label="Categoría">{ticket.category || '—'}</Descriptions.Item>
          </Descriptions>
          <Divider />
          <div className="workspace-desc">
            <h4>Descripción de la Falla</h4>
            <p>{ticket.description || 'Sin descripción'}</p>
          </div>
        </Card>

        <Card className="workspace-right" title="Herramientas de Soporte">
          <div className="workspace-tool-section">
            <h4>Buscar Equipo</h4>
            <Input
              placeholder="Código, marca o ubicación..."
              prefix={<Search size={16} />}
              value={equipmentSearch}
              onChange={(e) => handleEquipSearch(e.target.value)}
              className="equip-search-input"
            />
            {equipSearching && <Spin size="small" className="mt-8" />}
            {equipmentResults.length > 0 && (
              <div className="equip-search-results">
                {equipmentResults.map((eq) => (
                  <div
                    key={eq.id}
                    className={`equip-result-item${selectedEquipment === eq.id ? ' selected' : ''}`}
                    onClick={() => handleSelectEquipment(eq)}
                  >
                    <strong>{eq.inventory_code}</strong>
                    <span>{eq.brand} {eq.model}</span>
                    <Tag>{eq.equipment_type}</Tag>
                  </div>
                ))}
              </div>
            )}
            {selectedEquipment && !equipmentSearch && (
              <Tag closable onClose={() => setSelectedEquipment(null)} className="mt-8">
                Equipo asociado
              </Tag>
            )}
          </div>

          <Divider />

          <div className="workspace-tool-section">
            <h4>Categoría de Soporte</h4>
            <Select
              placeholder="Seleccione una categoría"
              className="w-100"
              value={category}
              onChange={handleCategoryChange}
              options={categoryOptions}
              loading={categoryUpdating}
              allowClear
            />
          </div>

          <Divider />

          <div className="workspace-tool-section">
            <h4>Estado del Soporte</h4>
            <Select
              placeholder="Cambiar estado"
              className="w-100"
              value={ticketStatus}
              onChange={handleStatusChange}
              options={[
                { label: 'En Proceso', value: 'En Proceso' },
                { label: 'Pendiente', value: 'Pendiente' },
              ]}
              loading={statusUpdating}
            />
          </div>

          <Divider />

          <Button
            type="primary"
            icon={<Wrench size={18} />}
            block
            size="large"
            className="btn-resolve"
            onClick={() => setShowResolveModal(true)}
          >
            Finalizar Soporte
          </Button>
        </Card>
      </div>
      <ResolveTicketModal
        ticketId={ticketId}
        open={showResolveModal}
        onClose={() => setShowResolveModal(false)}
      />
    </div>
  );
}
