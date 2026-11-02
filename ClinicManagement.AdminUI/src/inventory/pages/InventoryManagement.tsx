import React, { useMemo } from 'react';
import '../inventory.css';
import { Tabs, Typography, Space } from 'antd';
import {
  MedicineBoxOutlined,
  DatabaseOutlined,
  ImportOutlined,
  SendOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Title } = Typography;

type TabKey = 'items' | 'stock' | 'import' | 'dispense' | 'dept-dispense' | 'stocktake' | 'suppliers';

const TAB_ITEMS = [
  {
    key: 'items',
    label: (
      <Space size={6}>
        <MedicineBoxOutlined />
        Danh mục thuốc &amp; Vật tư
      </Space>
    ),
  },
  {
    key: 'stock',
    label: (
      <Space size={6}>
        <DatabaseOutlined />
        Tồn kho
      </Space>
    ),
  },
  {
    key: 'import',
    label: (
      <Space size={6}>
        <ImportOutlined />
        Nhập kho
      </Space>
    ),
  },
  {
    key: 'dispense',
    label: (
      <Space size={6}>
        <SendOutlined />
        Cấp phát &amp; Xuất kho
      </Space>
    ),
  },
  {
    key: 'dept-dispense',
    label: (
      <Space size={6}>
        <SendOutlined />
        Xuất Khoa/Phòng
      </Space>
    ),
  },
  {
    key: 'stocktake',
    label: (
      <Space size={6}>
        <AuditOutlined />
        Kiểm kê
      </Space>
    ),
  },
  {
    key: 'suppliers',
    label: (
      <Space size={6}>
        <DatabaseOutlined />
        Nhà cung cấp
      </Space>
    ),
  },
];

const PATH_MAP: Record<TabKey, string> = {
  items:           '/inventory',
  stock:           '/inventory/stock',
  import:          '/inventory/import',
  dispense:        '/inventory/dispense',
  'dept-dispense': '/inventory/dept-dispense',
  stocktake:       '/inventory/stocktake',
  suppliers:       '/inventory/suppliers',
};

const InventoryManagement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeKey = useMemo((): TabKey => {
    const path = location.pathname;
    if (path.includes('/stocktake'))     return 'stocktake';
    if (path.includes('/dept-dispense')) return 'dept-dispense';
    if (path.includes('/dispense'))      return 'dispense';
    if (path.includes('/import'))        return 'import';
    if (path.includes('/stock'))         return 'stock';
    if (path.includes('/suppliers'))     return 'suppliers';
    return 'items';
  }, [location.pathname]);

  const handleTabChange = (key: string) => {
    navigate(PATH_MAP[key as TabKey]);
  };

  return (
    <div className="inventory-page">
      {/* Header */}
      <div className="inventory-header">
        <Space align="center" style={{ marginBottom: 2 }}>
          <MedicineBoxOutlined style={{ fontSize: 20, color: '#0b4f6c' }} />
          <Title level={5} style={{ margin: 0, color: '#0b2a3c', fontWeight: 700 }}>
            Quản lý Kho Dược
          </Title>
        </Space>

        <Tabs
          className="inventory-tabs"
          activeKey={activeKey}
          items={TAB_ITEMS}
          onChange={handleTabChange}
          style={{ marginTop: 4 }}
          tabBarStyle={{ marginBottom: 0, borderBottom: 'none' }}
        />
      </div>

      {/* Routed content */}
      <div className="inventory-content">
        <div className={`inventory-tab-content ${activeKey === 'dept-dispense' || activeKey === 'suppliers' || activeKey === 'items' || activeKey === 'stock' || activeKey === 'dispense' ? 'inventory-fullwidth-tab' : ''}`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
