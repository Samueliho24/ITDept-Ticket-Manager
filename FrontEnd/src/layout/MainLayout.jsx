import { useState, useCallback } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import { Grid } from 'antd';
import Sidebar from './Sidebar';
import Header from './Header';
import { ModalProvider, useModals } from '../context/ModalContext';
import ReportTicketModal from '../pages/requestor/modals/ReportTicketModal';
import TicketDetailModal from '../pages/requestor/modals/TicketDetailModal';
import CancelTicketModal from '../pages/requestor/modals/CancelTicketModal';

const { useBreakpoint } = Grid;

function LayoutInner() {
  const screens = useBreakpoint();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { openReport } = useModals();

  const isMobile = !screens.lg;

  const handleAction = useCallback((action) => {
    if (action === 'reportTicket') {
      openReport();
    }
  }, [openReport]);

  const handleSuccess = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

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
          <Outlet context={{ refreshKey }} />
        </div>
        <footer className="app-footer">
          <h4>Departamento de Tecnología, Información y Comunicación</h4>
          <p>Facultad de Odontología · Universidad del Zulia</p>
        </footer>
      </div>
      <ReportTicketModal onSuccess={handleSuccess} />
      <TicketDetailModal />
      <CancelTicketModal onSuccess={handleSuccess} />
    </div>
  );
}

export function useLayoutContext() {
  return useOutletContext();
}

export default function MainLayout() {
  return (
    <ModalProvider>
      <LayoutInner />
    </ModalProvider>
  );
}
