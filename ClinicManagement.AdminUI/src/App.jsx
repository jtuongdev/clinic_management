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