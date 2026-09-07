import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Card, Select, Button, Tabs, Space, Tag, Typography, App } from 'antd';
import {
  DashboardOutlined,
  ApartmentOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  DollarCircleOutlined,
  UserOutlined,
  BuildOutlined,
  BarChartOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { useExamination } from '../hook/useExamination';
import '../components/style/Examination.css';

const { Text } = Typography;

type TabKey =
  | 'overview'
  | 'department'
  | 'patients'
  | 'list'
  | 'cls'
  | 'pharmacy'
  | 'finance'
  | 'hr'
  | 'facility'
  | 'reports';

const ExaminationManagement: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const {
    coSos,
    khoas,
    fetchCoSos,
    fetchKhoas,
    fetchThongKe,
    setFilters,
    filters,
  } = useExamination();

  const [selectedCoSo, setSelectedCoSo] = useState<number | undefined>(undefined);
  const [selectedKhoa, setSelectedKhoa] = useState<number | undefined>(undefined);
  const [lastUpdated, setLastUpdated] = useState<string>('08:45:12');

  // Load danh sách cơ sở khi component mount
  useEffect(() => {
    fetchCoSos();
    setLastUpdated(new Date().toLocaleTimeString('vi-VN'));
  }, []);

  // Khi chọn cơ sở, load danh sách khoa tương ứng và cập nhật filter
  const handleCoSoChange = (val?: number) => {
    setSelectedCoSo(val);
    if (val && val > 0) {
      fetchKhoas(val);
    } else {
      setSelectedKhoa(undefined);
    }
    setFilters({ maCoSo: val && val > 0 ? val : undefined, maKhoa: selectedKhoa });
  };

  // Khi chọn khoa, cập nhật filter và gọi thống kê
  const handleKhoaChange = (val?: number) => {
    setSelectedKhoa(val);
    setFilters({ maCoSo: selectedCoSo, maKhoa: val && val > 0 ? val : undefined });
  };

  // Khi filters thay đổi, gọi API thống kê
  useEffect(() => {
    fetchThongKe();
  }, [filters]);

  const handleRefresh = async () => {
    await fetchThongKe();
    setLastUpdated(new Date().toLocaleTimeString('vi-VN'));
    message.success('Đã làm mới dữ liệu khám bệnh');
  };

  const getActiveTab = (): TabKey => {
    const path = location.pathname;
    if (path.includes('/examination/overview')) return 'overview';
    if (path.includes('/examination/department')) return 'department';
    if (path.includes('/examination/patients')) return 'patients';
    if (path.includes('/examination/list')) return 'list';
    if (path.includes('/examination/cls')) return 'cls';
    if (path.includes('/examination/pharmacy')) return 'pharmacy';
    if (path.includes('/examination/finance')) return 'finance';
    if (path.includes('/examination/hr')) return 'hr';
    if (path.includes('/examination/facility')) return 'facility';
    if (path.includes('/examination/reports')) return 'reports';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState<TabKey>(getActiveTab);

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  const tabItems = useMemo(
    () => [
      {
        key: 'overview',
        label: (
          <span>
            <DashboardOutlined /> Tổng quan
          </span>
        ),
      },
      {
        key: 'department',
        label: (
          <span>
            <ApartmentOutlined /> Khoa
          </span>
        ),
      },
      {
        key: 'patients',
        label: (
          <span>
            <TeamOutlined /> Bệnh nhân
          </span>
        ),
      },
      {
        key: 'list',
        label: (
          <span>
            <MedicineBoxOutlined /> Khám bệnh
          </span>
        ),
      },
      {
        key: 'cls',
        label: (
          <span>
            <ExperimentOutlined /> CLS
          </span>
        ),
      },
      {
        key: 'pharmacy',
        label: (
          <span>
            <MedicineBoxOutlined /> Dược
          </span>
        ),
      },
      {
        key: 'finance',
        label: (
          <span>
            <DollarCircleOutlined /> Tài chính
          </span>
        ),
      },
      {
        key: 'hr',
        label: (
          <span>
            <UserOutlined /> Nhân sự
          </span>
        ),
      },
      {
        key: 'facility',
        label: (
          <span>
            <BuildOutlined /> Cơ sở & Phòng
          </span>
        ),
      },
      {
        key: 'reports',
        label: (
          <span>
            <BarChartOutlined /> Báo cáo
          </span>
        ),
      },
    ],
    []
  );

  const handleTabClick = (key: string) => {
    navigate(`/examination/${key}`);
  };

  return (
    <div
      className="examination-module"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        background: '#ffffff',
      }}
    >
      {/* Enterprise Integrated Scope Ribbon */}
      <div
        style={{
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <Space wrap size="small" orientation="horizontal" align="center">
          <Space size={6}>
            <EnvironmentOutlined style={{ color: '#0b4f6c', fontSize: 14 }} />
            <Text strong style={{ fontSize: 12, textTransform: 'uppercase', color: '#0b4f6c', letterSpacing: '0.4px' }}>
              Phạm vi:
            </Text>
          </Space>
          <Select
            placeholder="-- Chọn cơ sở --"
            value={selectedCoSo}
            onChange={handleCoSoChange}
            allowClear
            size="middle"
            style={{ width: 200 }}
            options={coSos.map((cs) => ({ value: cs.id, label: cs.ten }))}
          />
          <Select
            placeholder="Tất cả khoa"
            value={selectedKhoa}
            onChange={handleKhoaChange}
            allowClear
            size="middle"
            style={{ width: 180 }}
            disabled={!selectedCoSo}
            options={khoas.map((k) => ({ value: k.id, label: k.ten }))}
          />
          <Select
            defaultValue="today"
            size="middle"
            style={{ width: 130 }}
            options={[
              { value: 'today', label: 'Hôm nay' },
              { value: 'yesterday', label: 'Hôm qua' },
              { value: 'this_week', label: 'Tuần này' },
            ]}
          />
          <Select
            defaultValue="shift_all"
            size="middle"
            style={{ width: 150 }}
            options={[
              { value: 'shift_all', label: 'Tất cả ca trực' },
              { value: 'shift_morning', label: '07:00 — 17:00' },
              { value: 'shift_evening', label: '13:00 — 21:00' },
            ]}
          />
        </Space>

        <Space size="middle" align="center">
          <Tag color="success" icon={<CheckCircleOutlined />} style={{ padding: '2px 8px', borderRadius: 4, margin: 0 }}>
            Cập nhật {lastUpdated}
          </Tag>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} size="middle">
            Làm mới
          </Button>
        </Space>
      </div>

      {/* Docked System Tabs */}
      <div
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          paddingLeft: 16,
          paddingRight: 16,
          flexShrink: 0,
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={handleTabClick}
          items={tabItems}
          style={{ marginBottom: -1 }}
        />
      </div>

      {/* Tab Content Body - Full Canvas */}
      <div
        className="tab-content"
        style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default ExaminationManagement;