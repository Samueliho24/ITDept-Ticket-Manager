import { createContext, useContext, useState, useCallback } from 'react';

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [reportOpen, setReportOpen] = useState(false);
  const [detailTicket, setDetailTicket] = useState(null);
  const [cancelTicket, setCancelTicket] = useState(null);

  const openReport = useCallback(() => setReportOpen(true), []);
  const closeReport = useCallback(() => setReportOpen(false), []);

  const openDetail = useCallback((ticket) => setDetailTicket(ticket), []);
  const closeDetail = useCallback(() => setDetailTicket(null), []);

  const openCancel = useCallback((ticket) => setCancelTicket(ticket), []);
  const closeCancel = useCallback(() => setCancelTicket(null), []);

  return (
    <ModalContext.Provider
      value={{
        reportOpen, openReport, closeReport,
        detailTicket, openDetail, closeDetail,
        cancelTicket, openCancel, closeCancel,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModals() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModals debe usarse dentro de ModalProvider');
  return ctx;
}
