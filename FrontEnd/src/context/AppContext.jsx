import { createContext, useContext } from 'react';
import { App } from 'antd';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { message: messageApi, notification: notificationApi } = App.useApp();

  return (
    <AppContext.Provider value={{ messageApi, notificationApi }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext debe usarse dentro de AppProvider');
  }
  return context;
}
