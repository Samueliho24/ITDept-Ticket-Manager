import { NavLink, useLocation } from 'react-router-dom';
import { Drawer } from 'antd';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Ticket,
  QrCode,
  Users,
  Building2,
  ClipboardList,
  Server,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard size={20} />,
    path: '/dashboard',
    roles: ['admin', 'technician', 'requestor'],
  },
  {
    section: 'Tickets',
    roles: ['admin', 'technician', 'requestor'],
  },
  {
    label: 'Mis Tickets',
    icon: <Ticket size={20} />,
    path: '/tickets',
    roles: ['requestor'],
  },
  {
    label: 'Asignados',
    icon: <Ticket size={20} />,
    path: '/tickets/assigned',
    roles: ['admin', 'technician'],
  },
  {
    label: 'Gestión',
    icon: <ClipboardList size={20} />,
    path: '/tickets/manage',
    roles: ['admin'],
  },
  {
    section: 'Inventario',
    roles: ['admin', 'technician'],
  },
  {
    label: 'Equipos',
    icon: <Server size={20} />,
    path: '/equipment',
    roles: ['admin', 'technician'],
  },
  {
    label: 'Escanear QR',
    icon: <QrCode size={20} />,
    path: '/scan',
    roles: ['technician'],
  },
  {
    section: 'Administración',
    roles: ['admin'],
  },
  {
    label: 'Usuarios',
    icon: <Users size={20} />,
    path: '/users',
    roles: ['admin'],
  },
  {
    label: 'Departamentos',
    icon: <Building2 size={20} />,
    path: '/departments',
    roles: ['admin'],
  },
];

function SidebarContent({ collapsed, onToggle, isMobile }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div className="logo">
        <div className="logo-icon">TIC</div>
        {!isMobile && (
          <div className="logo-text">
            Gestión de Tickets
            <div className="logo-subtitle">TIC - LUZ</div>
          </div>
        )}
      </div>

      <nav className="nav">
        {navItems.map((item, index) => {
          if (item.section) {
            if (!item.roles.includes(user?.role)) return null;
            return (
              <div key={index} className="section-label">
                {!collapsed && item.section}
              </div>
            );
          }

          if (!item.roles.includes(user?.role)) return null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`item${isActive(item.path) ? ' active' : ''}`}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="footer">
        <div className="user-info">
          <div className="user-avatar">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <span className="user-name">{user?.username}</span>
        </div>

        <button className="item" onClick={logout}>
          <span className="icon"><LogOut size={20} /></span>
          <span className="label">Cerrar sesión</span>
        </button>

        {!isMobile && (
          <button className="toggle" onClick={onToggle}>
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
      </div>
    </>
  );
}

export default function Sidebar({ collapsed, onToggle, isMobile, mobileOpen, onMobileClose }) {
  if (isMobile) {
    return (
      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={onMobileClose}
        width={280}
        styles={{ body: { padding: 0 } }}
      >
        <div className="sidebar">
          <SidebarContent isMobile />
        </div>
      </Drawer>
    );
  }

  return (
    <div className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <SidebarContent collapsed={collapsed} onToggle={onToggle} />
    </div>
  );
}
