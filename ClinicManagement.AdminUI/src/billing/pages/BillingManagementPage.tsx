import React, { useMemo } from 'react';
import { Tabs, Typography, Space, Button } from 'antd';
import {
  FileText,
  Receipt,
  HandCoins,
  BookOpen,
  LineChart,
} from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import './style/Billing.css';

const { Title } = Typography;

type TabKey = 'invoices' | 'receipts' | 'cashbook' | 'debts';

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
        Sổ thu ngân &amp; Chốt ca
      </Space>
    ),
  },
  {
    key: 'cashbook',
    label: (
      <Space size={6}>
        <BookOpen size={16} />
        Sổ quỹ dòng tiền
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
  cashbook: '/cashbook',
  debts: '/debts',
};

export const BillingManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeKey = useMemo((): TabKey => {
    const path = location.pathname;
    if (path.includes('/debts')) return 'debts';
    if (path.includes('/cashbook')) return 'cashbook';
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <Space align="center">
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
            <div>
              <Title level={5} style={{ margin: 0, color: '#0b2a3c', fontWeight: 700 }}>
                Trung tâm Quản lý Tài chính &amp; Viện phí
              </Title>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                Quản lý hóa đơn, đối soát ca thu ngân, sổ cái dòng tiền và công nợ
              </span>
            </div>
          </Space>

          <Button
            type="default"
            icon={<LineChart size={14} style={{ marginRight: 4 }} />}
            onClick={() => navigate('/finance-reports')}
            style={{ borderRadius: 6, borderColor: '#cbd5e1' }}
          >
            Báo cáo P&amp;L Tài chính
          </Button>
        </div>

        <Tabs
          className="billing-tabs"
          activeKey={activeKey}
          items={TAB_ITEMS}
          onChange={handleTabChange}
          style={{ marginTop: 6 }}
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
