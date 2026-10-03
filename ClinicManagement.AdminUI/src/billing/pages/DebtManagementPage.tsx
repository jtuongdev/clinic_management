import React, { useMemo } from 'react';
import { Tabs, Space } from 'antd';
import { UserOutlined, ShopOutlined } from '@ant-design/icons';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import DebtsTable from '../components/DebtsTable';
import SupplierDebtsTable from '../components/SupplierDebtsTable';

type DebtTabKey = 'patient' | 'supplier';

export const DebtManagementPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const activeKey = useMemo((): DebtTabKey => {
    if (location.pathname.includes('/supplier') || searchParams.get('tab') === 'supplier') {
      return 'supplier';
    }
    return 'patient';
  }, [location.pathname, searchParams]);

  const handleTabChange = (key: string) => {
    if (location.pathname.startsWith('/billing/debts')) {
      navigate(`/billing/debts/${key}`);
    } else {
      navigate(`/debts/${key}`);
    }
  };

  const tabItems = [
    {
      key: 'patient',
      label: (
        <Space size={6}>
          <UserOutlined />
          <span>Công nợ bệnh nhân</span>
        </Space>
      ),
      children: <DebtsTable />,
    },
    {
      key: 'supplier',
      label: (
        <Space size={6}>
          <ShopOutlined />
          <span>Công nợ nhà cung cấp</span>
        </Space>
      ),
      children: <SupplierDebtsTable />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div
        style={{
          background: '#fff',
          padding: '4px 16px 0 16px',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
        }}
      >
        <Tabs
          activeKey={activeKey}
          onChange={handleTabChange}
          items={tabItems}
          type="line"
          size="middle"
          tabBarStyle={{
            marginBottom: 16,
            fontWeight: 600,
          }}
        />
      </div>
    </div>
  );
};

export default DebtManagementPage;
