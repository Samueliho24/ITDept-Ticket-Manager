import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Alert, Modal } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    try {
      await login(values.username, values.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Error al iniciar sesión. Verifica tus credenciales.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page login-gradient-bg">
      <div className="card">
        <div className="header">
          <div className='log-zone'>
            <div className="logo">TIC</div>
          </div>
          <h1 className="title">Sistema de Gestión de Tickets</h1>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
            closable
            onClose={() => setError(null)}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          className="form"
          requiredMark={false}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Ingresa tu usuario' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nombre de usuario"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Ingresa tu contraseña' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Contraseña"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              className="button"
            >
              Ingresar
            </Button>
          </Form.Item>

          <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
            <Button type="link" onClick={() => setForgotModalOpen(true)}>
              ¿Olvidó su usuario o contraseña?
            </Button>
          </Form.Item>
        </Form>
      </div>

      <div className="login-footer">
        <h4>Departamento de Tecnología, Información y Comunicación</h4>
        <p>Facultad de Odontología · Universidad del Zulia</p>
      </div>

      <Modal
        title="Recuperación de Credenciales"
        open={forgotModalOpen}
        onCancel={() => setForgotModalOpen(false)}
        footer={<Button type="primary" onClick={() => setForgotModalOpen(false)}>Cerrar</Button>}
      >
        <p>
          Para restablecer su usuario o contraseña, comuníquese al Departamento de Tecnología,
          Información y Comunicación de la Facultad de Odontología a través del correo electrónico:
        </p>
        <p style={{ fontWeight: 600, textAlign: 'center', fontSize: 16, marginTop: 12 }}>
          tic.odontologia@luz.edu.ve
        </p>
      </Modal>
    </div>
  );
}
