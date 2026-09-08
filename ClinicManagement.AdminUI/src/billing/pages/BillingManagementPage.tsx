import React, { useMemo } from 'react';
import { Tabs, Typography, Space } from 'antd';
import {
  FileText,
  Receipt,
  HandCoins,
} from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import '../billing.css';

const { Title } = Typography;

type TabKey = 'invoices' | 'receipts' | 'debts';

const TAB_ITEMS = [
  {
    key: 'invoices',
    label: (
      <Space size={6}>
        <FileText size={16} />
        Hóa đơn viện phí
      </Space>
    ),
  },
  {
    key: 'receipts',
    label: (
      <Space size={6}>
        <Receipt size={16} />
        Phiếu thu tiền
      </Space>
    ),
  },
  {
    key: 'debts',
    label: (
      <Space size={6}>
        <HandCoins size={16} />
        Quản lý công nợ
      </Space>
    ),
  },
];

const PATH_MAP: Record<TabKey, string> = {
  invoices: '/invoices',
  receipts: '/receipts',
  debts: '/debts',
};

export const BillingManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeKey = useMemo((): TabKey => {
    const path = location.pathname;
    if (path.includes('/debts')) return 'debts';
    if (path.includes('/receipts')) return 'receipts';
    return 'invoices';
  }, [location.pathname]);

  const handleTabChange = (key: string) => {
    navigate(PATH_MAP[key as TabKey]);
  };

  return (
    <div className="billing-page">
      {/* Header */}
      <div className="billing-header">
        <Space align="center" style={{ marginBottom: 2 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: '#e8f4fd',
              color: '#0b4f6c',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}
          >
            ₫
          </div>
          <Title level={5} style={{ margin: 0, color: '#0b2a3c', fontWeight: 700 }}>
            Quản lý Tài chính &amp; Viện phí
          </Title>
        </Space>

        <Tabs
          className="billing-tabs"
          activeKey={activeKey}
          items={TAB_ITEMS}
          onChange={handleTabChange}
          style={{ marginTop: 4 }}
          tabBarStyle={{ marginBottom: 0, borderBottom: 'none' }}
        />
      </div>

      {/* Routed content */}
      <div className="billing-content">
        <div className="billing-tab-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default BillingManagementPage;
