import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { useUIStore } from '../../stores/ui.store';

const { Content } = Layout;

export const MainLayout = () => {
  const { collapsed, mobileOpen, setMobileOpen } = useUIStore();

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden', background: '#f5f7fb' }}>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            zIndex: 99,
          }}
        />
      )}

      <Sidebar />

      <Layout
        style={{
          marginLeft: collapsed ? 64 : 250,
          transition: 'margin-left 0.25s ease',
          background: '#f5f7fb',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <Header />
        <Content
          style={{
            padding: '0 0 0 16px',
            background: '#f5f7fb',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 12,
              flex: 1,
              border: '1px solid #e9edf4',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <Outlet />
          </div>
        </Content>
        {/* Status bar */}
        <div
          style={{
            padding: '8px 24px',
            background: '#fafcfe',
            borderTop: '1px solid #e9edf4',
            fontSize: 12,
            color: '#6a7f96',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
            flexWrap: 'wrap',
            gap: 4,
          }}
        >
          <span>
            <span style={{ marginRight: 6 }}>🟢</span> Kết nối CSDL: Đang hoạt động
          </span>
          <span>👥 5 người dùng đang trực tuyến</span>
          <span>© HIS Bệnh viện Đa khoa v2.0</span>
        </div>
      </Layout>
    </Layout>
  );
};