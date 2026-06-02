import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const breadcrumbMap = {
  '/dashboard': 'Dashboard',
  '/tickets': 'Mis Tickets',
  '/tickets/assigned': 'Tickets Asignados',
  '/tickets/manage': 'Gestión de Tickets',
  '/equipment': 'Equipos',
  '/scan': 'Escanear QR',
  '/users': 'Usuarios',
  '/departments': 'Departamentos',
};

export default function Header({ onMenuClick, isMobile }) {
  const location = useLocation();
  const currentTitle = breadcrumbMap[location.pathname] || 'Dashboard';

  return (
    <header className="header">
      <div className="left">
        {isMobile && (
          <button className="mobile-menu-btn" onClick={onMenuClick}>
            <Menu size={22} />
          </button>
        )}
        <div className="breadcrumb">
          <span className="current">{currentTitle}</span>
        </div>
      </div>
      <div className="actions">
      </div>
    </header>
  );
}
