import { useState, useEffect } from 'react';
import { Modal, Form, Select, Input, message } from 'antd';
import { listDepartments } from '../../../services/departmentService';
import { createTicket } from '../../../services/ticketService';
import { useModals } from '../../../context/ModalContext';

export default function ReportTicketModal({ onSuccess }) {
  const { reportOpen, closeReport } = useModals();
  const [form] = Form.useForm();
  const [departments, setDepartments] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (reportOpen) {
      listDepartments({ limit: 100 })
        .then((res) => { setDepartments(res.data.items || res.data); })
        .catch(() => message.error('Error al cargar departamentos'));
    }
  }, [reportOpen]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const data = {
        title: values.description.slice(0, 80) || 'Sin título',
        description: values.description,
        department_id: values.department_id || null,
      };
      await createTicket(data);
      message.success('Ticket creado exitosamente');
      form.resetFields();
      closeReport();
      if (onSuccess) onSuccess();
    } catch (err) {
      if (err.errorFields) return;
      message.error('Error al crear el ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    closeReport();
  };

  return (
    <Modal
      title="Reportar Falla"
      open={reportOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={submitting}
      okText="Reportar"
      cancelText="Cancelar"
      destroyOnClose
    >
      <Form form={form} layout="vertical" requiredMark={false}>
        <Form.Item
          name="department_id"
          label="Área / Departamento"
        >
          <Select
            placeholder="Selecciona un área"
            allowClear
            showSearch
            optionFilterProp="label"
            options={departments.map((d) => ({ label: d.name, value: d.id }))}
          />
        </Form.Item>
        <Form.Item
          name="description"
          label="Descripción del problema"
          rules={[{ required: true, message: 'Describe el problema' }]}
        >
          <Input.TextArea rows={4} maxLength={500} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
}
