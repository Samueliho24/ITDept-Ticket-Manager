import { useState } from 'react';
import { Breadcrumb, Badge, Input } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, Search } from 'lucide-react';

const breadcrumbMap = {
  '/dashboard': { section: 'PRINCIPAL', item: 'Inicio' },
  '/equipment': { section: 'GESTIÓN', item: 'Inventario' },
  '/history': { section: 'GESTIÓN', item: 'Historial' },
  '/assign': { section: 'GESTIÓN', item: 'Asignación' },
  '/users': { section: 'ADMINISTRACIÓN', item: 'Usuarios' },
  '/audit': { section: 'ADMINISTRACIÓN', item: 'Auditoría' },
  '/settings': { section: 'ADMINISTRACIÓN', item: 'Configuración' },
  '/help': { section: 'SOPORTE', item: 'Ayuda' },
};

export default function Header({ onMenuClick, isMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  const current = breadcrumbMap[location.pathname] || null;

  return (
    <header className="header gradient-header">
      <div className="header-main">
        <div className="left">
          {isMobile && (
            <button type="button" className="mobile-menu-btn" onClick={onMenuClick}>
              <Menu size={22} />
            </button>
          )}
          <div className="title">Sistema de Gestión de Ticket TIC</div>
          {current && !isMobile && (
            <Breadcrumb
              className="breadcrumb"
              items={[
                {
                  title: (
                    <span
                      style={{ color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
                      onClick={() => navigate('/dashboard')}
                    >
                      {current.section}
                    </span>
                  ),
                },
                { title: <span style={{ color: '#fff' }}>{current.item}</span> },
              ]}
            />
          )}
        </div>
        <div className="actions">
          {!isMobile ? (
            <Input.Search
              placeholder="Buscar..."
              className="header-search"
              variant="borderless"
              style={{ color: 'rgba(255,255,255,0.6)' }}
              size={16}
              onSearch={() => {}}
            />
          ) : (
            <button
              type="button"
              className="mobile-search-btn"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Buscar"
            >
              <Search size={20} />
            </button>
          )}
          <Badge count={3} size="small" className="notification-badge" offset={[-2, 2]}>
            <Bell size={20} className="notification-icon" />
          </Badge>
        </div>
      </div>
      {isMobile && searchOpen && (
        <div className="mobile-search-bar">
          <Input
            placeholder="Buscar..."
            variant="borderless"
            style={{ color: 'rgba(255,255,255,0.6)' }}
            prefix={<Search size={16} />}
            className="mobile-search-input"
            onPressEnter={() => {}}
          />
        </div>
      )}
    </header>
  );
}
