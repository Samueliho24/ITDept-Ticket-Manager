import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { SearchProvider } from './context/SearchContext';
import App from './App.jsx';
import './styles/global.scss';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#006699',
            colorLink: '#006699',
            borderRadius: 8,
          },
          components: {
            Button: {
              colorPrimaryHover: '#660099',
            },
            Input: {
              hoverBorderColor: '#660099',
              activeBorderColor: '#660099',
              activeShadow: '0 0 0 2px rgba(102, 0, 153, 0.1)',
            },
            InputNumber: {
              hoverBorderColor: '#660099',
              activeBorderColor: '#660099',
            },
            Select: {
              hoverBorderColor: '#660099',
              activeBorderColor: '#660099',
            },
          },
        }}
      >
        <AntApp>
          <AuthProvider>
            <AppProvider>
              <SearchProvider>
                <App />
              </SearchProvider>
            </AppProvider>
          </AuthProvider>
        </AntApp>
      </ConfigProvider>
    </BrowserRouter>
  </StrictMode>,
);
