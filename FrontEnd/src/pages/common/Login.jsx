import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
        </Form>

        <div className="footer">
          <h4>Departamento de Tecnología, Información y Comunicación</h4>
          <p>Facultad de Odontología · Universidad del Zulia</p>
        </div>
      </div>
    </div>
  );
}
