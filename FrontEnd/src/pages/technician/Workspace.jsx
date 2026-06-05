import { useState, useEffect, useCallback, startTransition } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Input, Select, Button, Spin, Tag, message, Divider } from 'antd';
import { ArrowLeft, Search, Wrench } from 'lucide-react';
import { getTicket, updateTicketStatus } from '../../services/ticketService';
import { listEquipments } from '../../services/equipmentService';
import ResolveTicketModal from './modals/ResolveTicketModal';

const CATEGORY_OPTIONS = [
  { label: 'Soporte de Software', value: 'Soporte de Software' },
  { label: 'Falla de Hardware', value: 'Falla de Hardware' },
  { label: 'Conectividad y Redes', value: 'Conectividad y Redes' },
  { label: 'Mantenimiento Preventivo', value: 'Mantenimiento Preventivo' },
];

export default function Workspace() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [equipmentResults, setEquipmentResults] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [equipSearching, setEquipSearching] = useState(false);

  useEffect(() => {
    if (!ticketId) return;
    startTransition(() => setLoading(true));
    getTicket(ticketId)
      .then((res) => {
        const t = res.data;
        setTicket(t);
        setCategory(t.category || null);
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

  const handleEquipSearch = useCallback(async (value) => {
    setEquipmentSearch(value);
    if (!value.trim()) { setEquipmentResults([]); return; }
    setEquipSearching(true);
    try {
      const res = await listEquipments({ search: value, limit: 8 });
      setEquipmentResults(res.data.items || []);
    } catch { setEquipmentResults([]); }
    finally { setEquipSearching(false); }
  }, []);

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
        <Tag color="blue" className="workspace-id">Ticket #{ticket.id.slice(0, 8)}</Tag>
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
            {equipSearching && <Spin size="small" style={{ marginTop: 8 }} />}
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
              <Tag closable onClose={() => setSelectedEquipment(null)} style={{ marginTop: 8 }}>
                Equipo asociado
              </Tag>
            )}
          </div>

          <Divider />

          <div className="workspace-tool-section">
            <h4>Categoría de Soporte</h4>
            <Select
              placeholder="Seleccione una categoría"
              style={{ width: '100%' }}
              value={category}
              onChange={(val) => setCategory(val)}
              options={CATEGORY_OPTIONS}
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
