import { useState, useRef, useEffect, useCallback, startTransition } from 'react';
import { Breadcrumb, Badge, Input, Popover, List, Empty, Spin } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, Search } from 'lucide-react';
import { getNotifications, markAsRead, getStaleAlerts } from '../services/notificationService';
import { useModals } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';

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

const workspaceMatch = (path) => {
  if (path.startsWith('/workspace/')) {
    return { section: 'PRINCIPAL', item: 'Atención de Ticket' };
  }
  return null;
};

export default function Header({ onMenuClick, isMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { openDetail } = useModals();
  const pollRef = useRef(null);

  const isTechOrAdmin = user?.role === 'technician' || user?.role === 'admin';

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const res = await getNotifications({ limit: 20 });
      let items = res.data.items || [];
      if (isTechOrAdmin) {
        try {
          const staleRes = await getStaleAlerts();
          const staleAlerts = (staleRes.data || []).map((a) => ({
            id: `stale-${a.ticket_id}`,
            message: a.message,
            ticket_id: a.ticket_id,
            read_at: null,
            created_at: a.opened_at,
          }));
          items = [...staleAlerts, ...items];
        } catch {}
      }
      setNotifications(items);
    } catch {
      setNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  }, [isTechOrAdmin]);

  useEffect(() => {
    startTransition(() => { fetchNotifications(); });
    pollRef.current = setInterval(() => {
      startTransition(() => { fetchNotifications(); });
    }, 30000);
    return () => clearInterval(pollRef.current);
  }, [fetchNotifications]);

  const handleMarkRead = async (notif) => {
    if (notif.id.startsWith('stale-')) {
      openDetail({ id: notif.ticket_id });
      setNotifOpen(false);
      return;
    }
    try {
      await markAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      openDetail({ id: notif.ticket_id });
    } catch {
      openDetail({ id: notif.ticket_id });
    }
    setNotifOpen(false);
  };

  const handleSearch = (value) => {
    if (!value.trim()) return;
    navigate('/history', { state: { search: value.trim() } });
  };

  const current = breadcrumbMap[location.pathname] || workspaceMatch(location.pathname) || null;

  const notifContent = (
    <div className="notif-dropdown">
      {notifLoading && notifications.length === 0 ? (
        <div className="notif-loading"><Spin size="small" /></div>
      ) : notifications.length === 0 ? (
        <Empty description="Sin notificaciones" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <List
          dataSource={notifications.slice(0, 10)}
          renderItem={(item) => (
            <List.Item
              className={`notif-item${item.read_at ? ' read' : ' unread'}`}
              onClick={() => handleMarkRead(item)}
            >
              <div className="notif-item-content">
                <div className="notif-msg">{item.message}</div>
                <div className="notif-date">
                  {item.created_at ? new Date(item.created_at).toLocaleDateString('es-ES') : ''}
                </div>
              </div>
              {!item.read_at && <span className="notif-dot" />}
            </List.Item>
          )}
        />
      )}
    </div>
  );

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
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
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
          <Popover
            content={notifContent}
            trigger="click"
            open={notifOpen}
            onOpenChange={(v) => { setNotifOpen(v); if (v) fetchNotifications(); }}
            placement="bottomRight"
            overlayClassName="notif-popover"
          >
            <Badge count={unreadCount} size="small" className="notification-badge" offset={[-2, 2]}>
              <Bell size={20} className="notification-icon" />
            </Badge>
          </Popover>
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
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={() => handleSearch(searchText)}
          />
        </div>
      )}
    </header>
  );
}
