import { Bell, Mail } from 'lucide-react';
import { Dropdown, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from '../../../../Auth/context/AuthProvider';

export const Header = () => {
  const menuItems: MenuProps['items'] = [
    { key: 'profile', label: 'Thông tin cá nhân', icon: <UserOutlined /> },
    { type: 'divider' },
    { key: 'logout', label: 'Đăng xuất', danger: true },
  ];
  const { user } = useAuth();
  return (
    <div
      style={{
        padding: '8px 24px',
        background: '#ffffff',
        borderBottom: '1px solid #e9edf4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        flexWrap: 'wrap',
        gap: 8,
        minHeight: 56,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 600, fontSize: 16, color: '#0b2a3c' }}>
          🏥 Bệnh viện Đa khoa{' '}
          <span style={{ color: '#6a7f96', fontWeight: 400, fontSize: 13 }}>| HIS v2.0</span>
        </div>
        <div style={{ width: 1, height: 24, background: '#dce3ec' }} />
        <div
          style={{
            fontSize: 13,
            color: '#3d566e',
            background: '#f0f4fa',
            padding: '2px 12px',
            borderRadius: 12,
            fontWeight: 500,
          }}
        >
          🔬 Khoa Nội - Hồi sức
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            color: '#4a637a',
            fontSize: 16,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#dc3545',
              border: '2px solid #fff',
            }}
          />
        </button>
        <button
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            color: '#4a637a',
            fontSize: 16,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Mail size={18} />
        </button>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            paddingLeft: 12,
            borderLeft: '1px solid #e9edf4',
          }}
        >
          <span style={{ fontWeight: 500, fontSize: 13 }}>{user?.fullName || 'Bác sĩ'}</span>
          <Dropdown menu={{ items: menuItems }} placement="bottomRight">
            <Avatar
              size={32}
              style={{
                backgroundColor: '#0b4f6c',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              BS
            </Avatar>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};