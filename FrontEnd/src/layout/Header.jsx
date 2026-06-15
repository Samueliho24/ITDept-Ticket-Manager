import './Header.scss';
import { useState, useRef, useEffect, useCallback, startTransition } from 'react';
import { Breadcrumb, Badge, Input, Popover, List, Empty, Spin, Tag, Drawer } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, Search } from 'lucide-react';
import { getNotifications, markAsRead, getStaleAlerts } from '../services/notificationService';
import { useModals } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';

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

const statusColor = (status) => {
  switch (status) {
    case 'Abierto': return 'red';
    case 'Asignado': return 'orange';
    case 'En Proceso': return 'gold';
    case 'Pendiente': return 'geekblue';
    case 'Resuelto': return 'green';
    case 'Cerrado': return 'default';
    case 'Anulado': return 'default';
    default: return 'default';
  }
};

export default function Header({ onMenuClick, isMobile }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTechOrAdmin = user?.role === 'technician' || user?.role === 'admin';
  const {
    searchText, setSearchText,
    searchResults, searchLoading,
    searchOpen, setSearchOpen,
    handleEnter, clearSearch,
    hasResults,
  } = useSearch();
  const { openDetail, openEquipmentDetail } = useModals();
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const pollRef = useRef(null);
  const searchInputRef = useRef(null);

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

  const current = breadcrumbMap[location.pathname] || workspaceMatch(location.pathname) || null;

  const handleResultClick = (item, type) => {
    clearSearch();
    if (type === 'ticket') {
      openDetail(item);
    } else if (type === 'equipment') {
      openEquipmentDetail(item);
    } else if (type === 'user') {
      navigate(`/users?q=${encodeURIComponent(item.username || '')}`);
    }
  };

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

  const renderSearchItem = (item, type) => {
    if (type === 'ticket') {
      return (
        <div key={item.id} className="search-item" onClick={() => handleResultClick(item, 'ticket')}>
          <span className="search-item-code">{item.ticket_number || `#${item.id.slice(0, 8)}`}</span>
          <span className="search-item-title">{item.title}</span>
          <Tag color={statusColor(item.status)} className="search-item-tag">{item.status}</Tag>
        </div>
      );
    }
    if (type === 'equipment') {
      return (
        <div key={item.id} className="search-item" onClick={() => handleResultClick(item, 'equipment')}>
          <span className="search-item-code">{item.inventory_code || `#${item.id.slice(0, 8)}`}</span>
          <span className="search-item-title">{item.brand} {item.model}</span>
          <Tag color="blue" className="search-item-tag">{item.equipment_type}</Tag>
        </div>
      );
    }
    if (type === 'user') {
      return (
        <div key={item.id} className="search-item" onClick={() => handleResultClick(item, 'user')}>
          <span className="search-item-code">{item.username}</span>
          <span className="search-item-title">{item.name} {item.lastname}</span>
          <Tag className="search-item-tag">{item.role}</Tag>
        </div>
      );
    }
    return null;
  };

  const searchDropdownContent = (
    <div className="search-dropdown">
      {searchLoading && !hasResults ? (
        <div className="search-loading"><Spin size="small" /></div>
      ) : !hasResults ? (
        <div className="search-empty">Sin resultados</div>
      ) : (
        <div className="search-results-scroll">
          {searchResults.tickets.length > 0 && (
            <div className="search-section">
              <div className="search-section-title">TICKETS</div>
              {searchResults.tickets.map((item) => renderSearchItem(item, 'ticket'))}
            </div>
          )}
          {searchResults.equipments.length > 0 && (
            <div className="search-section">
              <div className="search-section-title">EQUIPOS</div>
              {searchResults.equipments.map((item) => renderSearchItem(item, 'equipment'))}
            </div>
          )}
          {searchResults.users.length > 0 && (
            <div className="search-section">
              <div className="search-section-title">USUARIOS</div>
              {searchResults.users.map((item) => renderSearchItem(item, 'user'))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const desktopSearch = (
    <Popover
      content={searchDropdownContent}
      trigger="click"
      open={hasResults && searchOpen}
      onOpenChange={(v) => setSearchOpen(v)}
      placement="bottomLeft"
      overlayClassName="search-popover"
    >
      <Input
        placeholder="Buscar tickets, equipos..."
        className="header-search"
        variant="borderless"
        value={searchText}
        onChange={(e) => { setSearchText(e.target.value); setSearchOpen(true); }}
        onPressEnter={() => { handleEnter(); }}
        ref={searchInputRef}
        prefix={<Search size={16} className="search-input-icon" />}
        allowClear
      />
    </Popover>
  );

  const mobileSearchOverlay = (
    <Drawer
      placement="top"
      open={mobileSearchOpen}
      onClose={() => { setMobileSearchOpen(false); clearSearch(); }}
      height="100%"
      className="mobile-search-overlay"
      styles={{ body: { padding: '16px' } }}
    >
      <div className="mobile-search-overlay-header">
        <Input
          placeholder="Buscar tickets, equipos..."
          className="mobile-search-overlay-input"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={() => { handleEnter(); setMobileSearchOpen(false); }}
          prefix={<Search size={16} />}
          autoFocus
          allowClear
        />
      </div>
      <div className="mobile-search-overlay-results">
        {searchLoading && !hasResults ? (
          <div className="search-loading"><Spin size="small" /></div>
        ) : !hasResults && searchText.trim() ? (
          <div className="search-empty">Sin resultados</div>
        ) : (
          <>
            {searchResults.tickets.length > 0 && (
              <div className="search-section">
                <div className="search-section-title">TICKETS</div>
                {searchResults.tickets.map((item) => renderSearchItem(item, 'ticket'))}
              </div>
            )}
            {searchResults.equipments.length > 0 && (
              <div className="search-section">
                <div className="search-section-title">EQUIPOS</div>
                {searchResults.equipments.map((item) => renderSearchItem(item, 'equipment'))}
              </div>
            )}
            {searchResults.users.length > 0 && (
              <div className="search-section">
                <div className="search-section-title">USUARIOS</div>
                {searchResults.users.map((item) => renderSearchItem(item, 'user'))}
              </div>
            )}
          </>
        )}
      </div>
    </Drawer>
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
                      className="breadcrumb-section"
                      onClick={() => navigate('/dashboard')}
                    >
                      {current.section}
                    </span>
                  ),
                },
                { title: <span className="breadcrumb-item">{current.item}</span> },
              ]}
            />
          )}
          {!isMobile && desktopSearch}
        </div>
        <div className="actions">
          {isMobile && (
            <button
              type="button"
              className="mobile-search-btn"
              onClick={() => setMobileSearchOpen(true)}
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
      {isMobile && mobileSearchOverlay}
    </header>
  );
}
