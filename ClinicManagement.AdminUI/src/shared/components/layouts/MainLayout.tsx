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
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <Header />
        <Content
          style={{
            background: '#f1f5f9',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
            padding: 0,
            margin: 0,
          }}
        >
          {/* Scrollable page wrapper — từng page tự cuộn bên trong */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              minHeight: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Outlet />
          </div>
        </Content>
        {/* Status bar */}
        <div
          style={{
            padding: '6px 16px',
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