import { useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { resolveTicket } from '../../../services/ticketService';
import { useNavigate } from 'react-router-dom';

const EQUIPMENT_FINAL_STATUS = [
  { label: 'Operativo', value: 'Operativo' },
  { label: 'En Observación', value: 'En Observación' },
  { label: 'Inoperativo - Daño Total', value: 'Inoperativo' },
];

export default function ResolveTicketModal({ ticketId, open, onClose }) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await resolveTicket(ticketId, {
        technical_notes: [values.diagnostico, values.acciones]
            .filter(Boolean)
            .join('\n\n--- Acciones Realizadas ---\n'),
        equipment_status: values.estado_final,
        spare_parts_used: values.repuestos || null,
      });
      message.success('¡Ticket cerrado exitosamente!');
      form.resetFields();
      onClose();
      navigate('/dashboard');
    } catch (err) {
      if (err.errorFields) return;
      message.error('Error al cerrar el ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Finalizar Soporte"
      open={open}
      onOk={handleOk}
      onCancel={() => { form.resetFields(); onClose(); }}
      confirmLoading={submitting}
      okText="Cerrar Ticket"
      cancelText="Cancelar"
      width={580}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="diagnostico"
          label="Diagnóstico Técnico Encontrado"
          rules={[{ required: true, message: 'Campo obligatorio' }]}
        >
          <Input.TextArea rows={3} maxLength={500} showCount />
        </Form.Item>
        <Form.Item
          name="acciones"
          label="Acciones Correctivas Realizadas"
        >
          <Input.TextArea
            rows={3}
            maxLength={500}
            showCount
            placeholder="Describe las acciones realizadas"
          />
        </Form.Item>
        <Form.Item
          name="repuestos"
          label="Repuestos o Insumos Utilizados"
        >
          <Input placeholder="Ej: Pasta térmica, Conector RJ45, Fuente ATX" />
        </Form.Item>
        <Form.Item
          name="estado_final"
          label="Estado Final del Activo"
          rules={[{ required: true, message: 'Seleccione el estado final' }]}
        >
          <Select placeholder="Seleccione..." options={EQUIPMENT_FINAL_STATUS} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
