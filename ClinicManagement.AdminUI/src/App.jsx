import { ConfigProvider, App as AntApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AppRoutes } from './routes/AppRoutes';
import { AuthProvider } from './Auth/context/AuthProvider';
import './index.css';

function App() {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#0b4f6c',
          borderRadius: 8,
          fontFamily: 'Inter, -apple-system, sans-serif',
        },
        components: {
          DatePicker: {
            colorPrimary: '#0b4f6c',
            cellHoverBg: '#e8f4f8',
            cellActiveWithRangeBg: '#e6f4fa',
            cellRangeBorderColor: '#0b4f6c',
            hoverBorderColor: '#0b4f6c',
            activeBorderColor: '#0b4f6c',
            activeShadow: '0 0 0 2px rgba(11, 79, 108, 0.15)',
          },
        },
      }}
    >
      <AntApp>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;