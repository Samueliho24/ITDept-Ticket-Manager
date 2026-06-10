import { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, Space } from 'antd';
const { TextArea } = Input;
import { useAppContext } from '../../../context/AppContext';
import { updateEquipment } from '../../../services/equipmentService';
import { equipmentTypeList } from '../../../constants/lists';
import { SPECS_FIELDS } from '../../../constants/specsConfig';

export default function EditAssetModal({ open, onClose, onSuccess, departments, equipment }) {
  const { messageApi } = useAppContext();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  const fields = SPECS_FIELDS[selectedType] || [];

  useEffect(() => {
    if (equipment && open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedType(equipment.equipment_type);
      const specs = equipment.technical_specifications || {};
      const values = {
        equipment_type: equipment.equipment_type,
        brand: equipment.brand || undefined,
        model: equipment.model || undefined,
        serial: equipment.serial || undefined,
        assigned_person: equipment.assigned_person || undefined,
        department_id: equipment.department_id || undefined,
      };
      SPECS_FIELDS[equipment.equipment_type]?.forEach((f) => {
        values[`spec_${f.key}`] = specs[f.key] ?? undefined;
      });
      form.setFieldsValue(values);
    }
  }, [equipment, open, form]);

  const handleTypeChange = (value) => {
    setSelectedType(value);
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
      await updateEquipment(equipment.id, {
        equipment_type: values.equipment_type,
        brand: values.brand || null,
        model: values.model || null,
        serial: values.serial || null,
        assigned_person: values.assigned_person || null,
        technical_specifications: Object.keys(technical_specifications).length > 0 ? technical_specifications : null,
      });
      messageApi.success('Equipo actualizado correctamente.');
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
    if (field.type === 'textarea') {
      return (
        <Form.Item key={field.key} name={name} label={field.label} style={{ flex: 1 }}>
          <TextArea rows={3} placeholder={field.label} />
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
      title={`Editar Activo — ${equipment?.inventory_code || ''}`}
      open={open}
      onCancel={onClose}
      width={640}
      destroyOnClose
      footer={
        <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="primary" loading={submitting} onClick={handleSubmit}>Guardar Cambios</Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Space style={{ width: '100%' }} size="middle">
          <Form.Item label="Código de Inventario" style={{ flex: 1 }}>
            <Input value={equipment?.inventory_code || ''} disabled />
          </Form.Item>
          <Form.Item name="equipment_type" label="Tipo de Activo" rules={[{ required: true, message: 'Campo requerido' }]} style={{ flex: 1 }}>
            <Select options={equipmentTypeList} onChange={handleTypeChange} />
          </Form.Item>
        </Space>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item name="brand" label="Marca" style={{ flex: 1 }}>
            <Input />
          </Form.Item>
          <Form.Item name="model" label="Modelo" style={{ flex: 1 }}>
            <Input />
          </Form.Item>
          <Form.Item name="serial" label="N. Serie (Opcional)" style={{ flex: 1 }}>
            <Input placeholder="Ej: SN-12345678" />
          </Form.Item>
        </Space>

        <Space style={{ width: '100%' }} size="middle">
          <Form.Item name="assigned_person" label="Persona Asignada (Opcional)" style={{ flex: 1 }}>
            <Input />
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
