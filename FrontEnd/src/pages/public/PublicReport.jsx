import './PublicReport.scss';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Form, Input, Select, Button, Alert, Modal, Typography } from 'antd';
import { UserOutlined, PhoneOutlined, HomeOutlined, FileTextOutlined, LoginOutlined } from '@ant-design/icons';
import { createPublicTicket, listPublicDepartments } from '../../services/publicService';

const { Text } = Typography;

export default function PublicReport() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState(null);
  const [successModal, setSuccessModal] = useState(false);
  const [ticketNumber, setTicketNumber] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deptCode = searchParams.get('dept');

  useEffect(() => {
    listPublicDepartments()
      .then((res) => {
        setDepartments(res.data);
        if (deptCode) {
          const found = res.data.find((d) => d.code === deptCode);
          if (found) {
            form.setFieldValue('department_id', found.id);
          }
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createPublicTicket(values);
      setTicketNumber(res.data.ticket_number);
      setSuccessModal(true);
      form.resetFields();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al enviar el reporte. Intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page login-gradient-bg">
      <div className="card">
        <div className="header">
          <div className="logo-zone">
            <div className="logo">TIC</div>
          </div>
          <h1 className="title">Reportar un Problema</h1>
          <p className="subtitle">Departamento de TIC - Facultad de Odontología LUZ</p>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="mb-16"
            closable
            onClose={() => setError(null)}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          requiredMark={false}
        >
          <Form.Item
            name="reporter_name"
            label="Nombre"
            rules={[{ required: true, message: 'Ingrese su nombre' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nombre completo" size="large" />
          </Form.Item>

          <Form.Item
            name="reporter_phone"
            label="Teléfono"
          >
            <Input prefix={<PhoneOutlined />} placeholder="0412-1234567" size="large" />
          </Form.Item>

          <Form.Item
            name="department_id"
            label="Área / Departamento"
          >
            <Select
              placeholder="Seleccione un departamento"
              size="large"
              showSearch
              optionFilterProp="children"
              allowClear
              prefix={<HomeOutlined />}
            >
              {departments.map((d) => (
                <Select.Option key={d.id} value={d.id}>
                  {d.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Descripción del problema"
            rules={[{ required: true, message: 'Describa el problema' }]}
          >
            <Input.TextArea
              prefix={<FileTextOutlined />}
              placeholder="Describa el problema que está presentando..."
              rows={4}
              maxLength={500}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} size="large" className="button">
              Enviar Reporte
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-8">
          <Button
            type="link"
            icon={<LoginOutlined />}
            onClick={() => navigate('/login')}
          >
            ¿Ya tiene un usuario? Iniciar sesión
          </Button>
        </div>
      </div>

      <div className="login-footer">
        <p>© {new Date().getFullYear()} Departamento de Tecnología, Información y Comunicación</p>
        <p>Facultad de Odontología · Universidad del Zulia</p>
      </div>

      <Modal
        title="Reporte Enviado"
        open={successModal}
        onCancel={() => setSuccessModal(false)}
        footer={[
          <Button key="view" type="primary" onClick={() => { setSuccessModal(false); navigate(`/reportar/${ticketNumber}`); }}>
            Ver estado del ticket
          </Button>,
          <Button key="close" onClick={() => setSuccessModal(false)}>
            Cerrar
          </Button>,
        ]}
      >
        <div className="public-success-body">
          <Text strong className="public-success-title">
            ¡Reporte recibido!
          </Text>
          <Text className="public-success-label">
            Su número de ticket es:
          </Text>
          <Text strong className="public-success-number">
            {ticketNumber}
          </Text>
          <Text className="public-success-hint">
            Guarde este número para dar seguimiento a su reporte.
          </Text>
          <Text className="public-success-hint mt-12">
            Si desea recibir notificaciones y ver el historial completo de sus tickets,
            contacte al departamento de TIC para que le creen un usuario.
          </Text>
        </div>
      </Modal>
    </div>
  );
}
