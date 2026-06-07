import { useState } from 'react';
import { Modal, Form, Select, Descriptions, Button, Space, Tag } from 'antd';
import { useAppContext } from '../../../context/AppContext';
import { changeEquipmentStatus } from '../../../services/equipmentService';
import { equipmentStatusList } from '../../../constants/lists';

export default function DecommissionAssetModal({ open, onClose, onSuccess, equipment }) {
  const { messageApi } = useAppContext();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await changeEquipmentStatus(equipment.id, { status: values.status });
      messageApi.success(`Estado actualizado a "${values.status}".`);
      form.resetFields();
      onSuccess?.();
      onClose();
    } catch (err) {
      if (err?.response?.data?.detail) messageApi.error(err.response.data.detail);
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = {
    'En Mantenimiento': 'gold',
    'Dañado': 'red',
    'Desincorporado': 'red',
  };

  return (
    <Modal
      title="Cambiar Estado del Activo"
      open={open}
      onCancel={() => { form.resetFields(); onClose(); }}
      width={480}
      destroyOnClose
      footer={
        <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => { form.resetFields(); onClose(); }}>Cancelar</Button>
          <Button type="primary" danger loading={submitting} onClick={handleSubmit}>Confirmar Cambio</Button>
        </Space>
      }
    >
      {equipment && (
        <div style={{ marginBottom: 20 }}>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Código">{equipment.inventory_code}</Descriptions.Item>
            <Descriptions.Item label="Tipo">{equipment.equipment_type}</Descriptions.Item>
            <Descriptions.Item label="Estado Actual">
              <Tag color={statusColor[equipment.status] || 'green'}>{equipment.status}</Tag>
            </Descriptions.Item>
          </Descriptions>
        </div>
      )}
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          name="status"
          label="Nuevo Estado"
          rules={[{ required: true, message: 'Seleccione un estado' }]}
        >
          <Select
            placeholder="Seleccionar nuevo estado"
            options={equipmentStatusList.filter((s) => s.value !== 'Operativo')}
          />
        </Form.Item>
      </Form>
      <div className="decommission-notice">
        Esta acción cambiará el estado operativo del equipo y quedará registrada en la auditoría del sistema.
      </div>
    </Modal>
  );
}
