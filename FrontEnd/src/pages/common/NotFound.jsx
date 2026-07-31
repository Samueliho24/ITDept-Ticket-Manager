import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="login-page login-gradient-bg" style={{ justifyContent: 'center' }}>
      <div className="card" style={{ textAlign: 'center' }}>
        <Result
          status="404"
          title="404"
          subTitle="La página que busca no existe."
          extra={
            <Button
              type="primary"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login', { replace: true })}
            >
              {isAuthenticated ? 'Ir al Inicio' : 'Iniciar Sesión'}
            </Button>
          }
        />
      </div>
    </div>
  );
}
