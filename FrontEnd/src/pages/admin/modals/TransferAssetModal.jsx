import { useState } from 'react';
import { Modal, Form, Select, Descriptions, Button, Space } from 'antd';
import { useAppContext } from '../../../context/AppContext';
import { transferEquipment } from '../../../services/equipmentService';

export default function TransferAssetModal({ open, onClose, onSuccess, departments, equipment }) {
  const { messageApi } = useAppContext();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await transferEquipment(equipment.id, { department_id: values.department_id });
      messageApi.success('Equipo trasladado correctamente.');
      form.resetFields();
      onSuccess?.();
      onClose();
    } catch (err) {
      if (err?.response?.data?.detail) messageApi.error(err.response.data.detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Trasladar Activo"
      open={open}
      onCancel={() => { form.resetFields(); onClose(); }}
      width={480}
      destroyOnClose
      footer={
        <Space className="flex-space-between">
          <Button onClick={() => { form.resetFields(); onClose(); }}>Cancelar</Button>
          <Button type="primary" loading={submitting} onClick={handleSubmit}>Trasladar</Button>
        </Space>
      }
    >
      {equipment && (
        <div className="mb-20">
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Código">{equipment.inventory_code}</Descriptions.Item>
            <Descriptions.Item label="Tipo">{equipment.equipment_type}</Descriptions.Item>
            <Descriptions.Item label="Ubicación Actual">{equipment.department_name || '—'}</Descriptions.Item>
          </Descriptions>
        </div>
      )}
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          name="department_id"
          label="Departamento Destino"
          rules={[{ required: true, message: 'Seleccione un departamento destino' }]}
        >
          <Select
            placeholder="Seleccionar departamento"
            options={departments.map((d) => ({ label: d.name, value: d.id }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
