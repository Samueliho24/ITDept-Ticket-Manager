import { useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, Space } from 'antd';
import { useAppContext } from '../../../context/AppContext';
import { createEquipment } from '../../../services/equipmentService';
import { equipmentTypeList } from '../../../constants/lists';
import { SPECS_FIELDS } from '../../../constants/specsConfig';

export default function AddAssetModal({ open, onClose, onSuccess, departments }) {
  const { messageApi } = useAppContext();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  const fields = SPECS_FIELDS[selectedType] || [];

  const resetForm = () => {
    form.resetFields();
    setSelectedType(null);
  };

  const handleTypeChange = (value) => {
    setSelectedType(value);
    const current = form.getFieldsValue();
    const clean = {};
    Object.keys(current).forEach((k) => {
      if (!k.startsWith('spec_')) clean[k] = current[k];
    });
    form.setFieldsValue(clean);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const technical_specifications = {};
      fields.forEach((f) => {
        const val = values[`spec_${f.key}`];
        if (val !== undefined && val !== null && val !== '') technical_specifications[f.key] = val;
      });
      setSubmitting(true);
      await createEquipment({
        inventory_code: values.inventory_code,
        equipment_type: values.equipment_type,
        brand: values.brand || null,
        model: values.model || null,
        assigned_person: values.assigned_person || null,
        department_id: values.department_id || null,
        technical_specifications: Object.keys(technical_specifications).length > 0 ? technical_specifications : null,
      });
      messageApi.success('Equipo registrado correctamente.');
      resetForm();
      onSuccess?.();
      onClose();
    } catch (err) {
      if (err?.response?.data?.detail) messageApi.error(err.response.data.detail);
    } finally {
      setSubmitting(false);
    }
  };

  const renderSpecField = (field) => {
    const name = `spec_${field.key}`;
    if (field.type === 'select') {
      return (
        <Form.Item key={field.key} name={name} label={field.label} style={{ flex: 1 }}>
          <Select placeholder={`Seleccionar ${field.label.toLowerCase()}`} allowClear>
            {field.options.map((opt) => (
              <Select.Option key={opt} value={opt}>{opt}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      );
    }
    if (field.type === 'number') {
      return (
        <Form.Item key={field.key} name={name} label={field.label} style={{ flex: 1 }}>
          <InputNumber placeholder={field.label} style={{ width: '100%' }} />
        </Form.Item>
      );
    }
    return (
      <Form.Item key={field.key} name={name} label={field.label} style={{ flex: 1 }}>
        <Input placeholder={field.label} />
      </Form.Item>
    );
  };

  return (
    <Modal
      title="Registrar Nuevo Activo"
      open={open}
      onCancel={() => { resetForm(); onClose(); }}
      width={640}
      destroyOnClose
      footer={
        <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => { resetForm(); onClose(); }}>Cancelar</Button>
          <Button type="primary" loading={submitting} onClick={handleSubmit}>Registrar</Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" preserve={false}>
        <div className="auto-code-notice">
          El código de inventario se generará automáticamente.
        </div>
        <Form.Item name="equipment_type" label="Tipo de Activo" rules={[{ required: true, message: 'Campo requerido' }]}>
          <Select placeholder="Seleccionar tipo" options={equipmentTypeList} onChange={handleTypeChange} />
        </Form.Item>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item name="brand" label="Marca" style={{ flex: 1 }}>
            <Input placeholder="Ej: Dell" />
          </Form.Item>
          <Form.Item name="model" label="Modelo" style={{ flex: 1 }}>
            <Input placeholder="Ej: Latitude 5540" />
          </Form.Item>
        </Space>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item name="assigned_person" label="Persona Asignada (Opcional)" style={{ flex: 1 }}>
            <Input placeholder="Nombre del custodio" />
          </Form.Item>
          <Form.Item name="department_id" label="Ubicación / Departamento" style={{ flex: 1 }}>
            <Select
              allowClear
              placeholder="Seleccionar departamento"
              options={departments.map((d) => ({ label: d.name, value: d.id }))}
            />
          </Form.Item>
        </Space>

        {fields.length > 0 && (
          <div className="equipment-modal-specs">
            <div className="specs-header">
              <h4>Especificaciones Técnicas</h4>
            </div>
            <div className="specs-grid">
              {fields.map(renderSpecField)}
            </div>
          </div>
        )}
      </Form>
    </Modal>
  );
}
