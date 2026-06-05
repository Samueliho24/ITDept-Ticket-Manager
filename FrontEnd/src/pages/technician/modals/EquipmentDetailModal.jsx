import { useState, useEffect, startTransition } from 'react';
import { Modal, Descriptions, Tag, Table, Spin } from 'antd';
import { listTickets } from '../../../services/ticketService';

const SPEC_LABELS = {
  processor: 'Procesador',
  ram: 'Memoria RAM',
  storage: 'Almacenamiento',
  os: 'Sistema Operativo',
  graphics: 'Tarjeta Gráfica',
  printer_type: 'Tipo de Tecnología',
  connection_type: 'Conectividad',
  color_mode: 'Soporte de Color',
  toner_model: 'Modelo de Consumible',
  ports_count: 'Puertos',
  max_speed: 'Velocidad Máxima',
  poe_support: 'PoE',
  device_type: 'Subcategoría',
  cpu_cores: 'Núcleos/CPU',
  ram_capacity: 'RAM Total',
  raid_config: 'Configuración RAID',
  power_supplies: 'Fuentes de Poder',
  capacity_va: 'Capacidad (VA)',
  outlets_count: 'Tomas Protegidas',
  battery_status: 'Estado Batería',
};

export default function EquipmentDetailModal({ equipment, open, onClose }) {
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(false);

  useEffect(() => {
    if (open && equipment?.id) {
      startTransition(() => setHistLoading(true));
      listTickets({ equipment_id: equipment.id, status: 'Resuelto', limit: 20 })
        .then((res) => setMaintenanceHistory(res.data.items || []))
        .catch(() => setMaintenanceHistory([]))
        .finally(() => setHistLoading(false));
    }
  }, [open, equipment?.id]);

  const specs = equipment?.technical_specifications || {};
  const specEntries = Object.entries(specs).filter(([k]) => SPEC_LABELS[k]);

  const maintColumns = [
    { title: 'Fecha', dataIndex: 'closed_at', key: 'date', width: 100,
      render: (d) => (d ? new Date(d).toLocaleDateString('es-ES') : '—') },
    { title: 'Técnico', dataIndex: 'assigned_to_name', key: 'tech', width: 140,
      render: (v) => v || '—' },
    { title: 'Acciones Realizadas', dataIndex: 'title', key: 'actions',
      render: (v) => v || '—' },
  ];

  return (
    <Modal
      title={`Ficha Técnica — ${equipment?.inventory_code || ''}`}
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnClose
    >
      {!equipment ? null : (
        <div className="equipment-detail-modal">
          <div className="equip-detail-block">
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="Tipo de Equipo" span={2}>
                <Tag color="blue">{equipment.equipment_type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Marca">{equipment.brand || '—'}</Descriptions.Item>
              <Descriptions.Item label="Modelo">{equipment.model || '—'}</Descriptions.Item>
              <Descriptions.Item label="Ubicación">{equipment.department_name || '—'}</Descriptions.Item>
              <Descriptions.Item label="Persona Asignada">
                {equipment.assigned_person || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Estado" span={2}>
                <Tag color={equipment.status === 'Operativo' ? 'green' : equipment.status === 'En Observación' ? 'gold' : 'red'}>
                  {equipment.status}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </div>

          {specEntries.length > 0 && (
            <div className="equip-detail-block">
              <h4>Especificaciones Técnicas</h4>
              <div className="specs-grid">
                {specEntries.map(([key, val]) => (
                  <div key={key} className="spec-item">
                    <span className="spec-label">{SPEC_LABELS[key] || key}</span>
                    <span className="spec-value">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="equip-detail-block">
            <h4>Historial de Mantenimiento</h4>
            {histLoading ? (
              <Spin />
            ) : (
              <Table
                dataSource={maintenanceHistory}
                columns={maintColumns}
                rowKey="id"
                pagination={false}
                size="small"
                locale={{ emptyText: 'Sin historial de mantenimiento' }}
              />
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
