import { NavLink, useLocation } from 'react-router-dom';
import { Drawer, Modal } from 'antd';
import { LogOut } from 'lucide-react';
import {
  Home,
  Package,
  History,
  GitBranch,
  Users,
  FileText,
  Settings,
  HelpCircle,
  PlusCircle,
} from 'lucide-react';
import { useAuth, ROLE_LABELS } from '../context/AuthContext';

function canAccess(userRole, allowedRoles) {
  return allowedRoles?.includes(userRole);
}

const navSections = [
  {
    label: 'PRINCIPAL',
    items: [
      { label: 'Inicio', icon: <Home size={20} />, path: '/dashboard', roles: ['admin', 'technician', 'requestor'] },
      { label: 'Reportar', icon: <PlusCircle size={20} />, action: 'reportTicket', roles: ['requestor'] },
    ],
  },
  {
    label: 'GESTIÓN',
    items: [
      { label: 'Inventario', icon: <Package size={20} />, path: '/equipment', roles: ['admin', 'technician'] },
      { label: 'Historial', icon: <History size={20} />, path: '/history', roles: ['admin', 'technician', 'requestor'] },
      { label: 'Asignación', icon: <GitBranch size={20} />, path: '/assign', roles: ['admin'] },
    ],
  },
  {
    label: 'ADMINISTRACIÓN',
    items: [
      { label: 'Usuarios', icon: <Users size={20} />, path: '/users', roles: ['admin'] },
      { label: 'Auditoría', icon: <FileText size={20} />, path: '/audit', roles: ['admin'] },
      { label: 'Configuración', icon: <Settings size={20} />, path: '/settings', roles: ['admin'] },
    ],
  },
  {
    label: 'SOPORTE',
    items: [
      { label: 'Ayuda', icon: <HelpCircle size={20} />, path: '/help', roles: ['admin', 'technician', 'requestor'] },
    ],
  },
];

function SidebarContent({ onAction }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="sidebar-inner">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">TIC</div>
          <div className="logo-text">
            <span className="logo-subtitle">Sistema de Gestión</span>
            <p>Ticket TIC</p>
          </div>
        </div>
      </div>

      <nav className="nav" aria-label="Menú principal">
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => canAccess(user?.role, item.roles));
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.label}>
              <div className="section-label">{section.label}</div>
              {visibleItems.map((item) =>
                item.path ? (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`item${isActive(item.path) ? ' active' : ''}`}
                  >
                    <span className="icon">{item.icon}</span>
                    <span className="label">{item.label}</span>
                  </NavLink>
                ) : (
                  <button
                    key={item.action}
                    type="button"
                    className="item"
                    onClick={() => onAction?.(item.action)}
                  >
                    <span className="icon">{item.icon}</span>
                    <span className="label">{item.label}</span>
                  </button>
                )
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="footer-avatar">
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div className="footer-info">
          <div className="footer-name">{user?.username || 'Usuario'}</div>
          <div className="footer-role">{ROLE_LABELS[user?.role] || ''}</div>
        </div>
        <button
          type="button"
          className="footer-logout"
          onClick={() => {
            Modal.confirm({
              title: 'Cerrar sesión',
              content: '¿Está seguro de que desea cerrar sesión?',
              okText: 'Sí, cerrar sesión',
              cancelText: 'Cancelar',
              okButtonProps: { danger: true },
              onOk: logout,
            });
          }}
          aria-label="Cerrar sesión"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ isMobile, mobileOpen, onMobileClose, onAction }) {
  if (isMobile) {
    return (
      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={onMobileClose}
        width={280}
        styles={{ body: { padding: 0 } }}
      >
        <div className="sidebar in-drawer">
          <SidebarContent onAction={onAction} />
        </div>
      </Drawer>
    );
  }

  return (
    <div className="sidebar">
      <SidebarContent onAction={onAction} />
    </div>
  );
}
