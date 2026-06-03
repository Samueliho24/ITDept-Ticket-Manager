import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Grid } from 'antd';
import Sidebar from './Sidebar';
import Header from './Header';

const { useBreakpoint } = Grid;

export default function MainLayout() {
  const screens = useBreakpoint();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isMobile = !screens.lg;

  const handleAction = (action) => {
    if (action === 'reportTicket') {
      // TODO: Abrir modal de reporte de ticket
    }
  };

  return (
    <div className="layout">
      <Sidebar
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onAction={handleAction}
      />
      <div className="main-content">
        <Header
          onMenuClick={() => setMobileOpen(true)}
          isMobile={isMobile}
        />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
