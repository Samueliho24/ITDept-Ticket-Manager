import './PublicTicketView.scss';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Descriptions, Tag, Typography, Alert, Spin } from 'antd';
import { SearchOutlined, LoginOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { getPublicTicket } from '../../services/publicService';

const { Text } = Typography;

const statusColors = {
  Abierto: 'blue',
  Asignado: 'orange',
  'En Proceso': 'geekblue',
  Pendiente: 'gold',
  Resuelto: 'green',
  Cerrado: 'default',
  Anulado: 'red',
};

export default function PublicTicketView() {
  const { ticketNumber: paramNumber } = useParams();
  const [form] = Form.useForm();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async (values) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPublicTicket(values.ticket_number);
      setTicket(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Ticket no encontrado. Verifique el número ingresado.');
      } else {
        setError('Error al consultar el ticket. Intente de nuevo.');
      }
      setTicket(null);
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
          <h1 className="title">Consultar Ticket</h1>
          <p className="subtitle">Ingrese el número de ticket para ver su estado</p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSearch}
          autoComplete="off"
          requiredMark={false}
          initialValues={{ ticket_number: paramNumber || '' }}
        >
          <Form.Item
            name="ticket_number"
            rules={[{ required: true, message: 'Ingrese el número de ticket' }]}
          >
            <Input
              prefix={<SearchOutlined />}
              placeholder="Ej: TIC-140626-01"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} size="large" className="button">
              Consultar
            </Button>
          </Form.Item>
        </Form>

        {error && (
          <Alert message={error} type="error" showIcon className="mb-16" closable onClose={() => setError(null)} />
        )}

        {loading && (
          <div className="public-loading-center">
            <Spin />
          </div>
        )}

        {ticket && !loading && (
          <Card size="small" className="public-result-card">
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Ticket N°">
                <Text strong>{ticket.ticket_number}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Estado">
                <Tag color={statusColors[ticket.status] || 'default'}>{ticket.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Departamento">
                {ticket.department_name || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Reportado por">
                {ticket.reporter_name || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Fecha">
                {ticket.opened_at ? new Date(ticket.opened_at).toLocaleDateString('es-ES', {
                  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                }) : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Descripción">
                {ticket.description || '—'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        <div className="public-nav-row">
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/reportar')}
            className="mr-16"
          >
            Nuevo reporte
          </Button>
          <Button
            type="link"
            icon={<LoginOutlined />}
            onClick={() => navigate('/login')}
          >
            Iniciar sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
