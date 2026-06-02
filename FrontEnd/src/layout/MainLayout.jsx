import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Grid } from 'antd';
import Sidebar from './Sidebar';
import Header from './Header';

const { useBreakpoint } = Grid;

export default function MainLayout() {
  const screens = useBreakpoint();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isMobile = !screens.md;
  const isTablet = !screens.lg && screens.md;

  return (
    <div className="layout">
      <Sidebar
        collapsed={isTablet ? true : collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
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
