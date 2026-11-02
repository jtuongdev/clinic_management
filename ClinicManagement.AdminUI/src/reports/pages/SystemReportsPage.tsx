import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, Select, DatePicker, Button, Space, Typography, Tag, Dropdown, MenuProps, message, Spin } from 'antd';
import {
  DashboardOutlined,
  MedicineBoxOutlined,
  DollarCircleOutlined,
  DatabaseOutlined,
  TeamOutlined,
  ReloadOutlined,
  DownloadOutlined,
  PrinterOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

import { systemReportsApi, ReportQueryParams } from '../api/systemReports.api';
import {
  SystemReportsOverviewDto,
  SystemReportsClinicalDto,
  SystemReportsFinanceDto,
  SystemReportsInventoryDto,
  SystemReportsProductivityDto,
} from '../types/systemReports.types';

import { OverviewTab } from '../components/OverviewTab';
import { ClinicalTab } from '../components/ClinicalTab';
import { FinanceTab } from '../components/FinanceTab';
import { InventoryTab } from '../components/InventoryTab';
import { ProductivityTab } from '../components/ProductivityTab';
import { examinationApi } from '../../examination/api/examination.api';
import { CoSoDto, KhoaDto } from '../../examination/type/examination.types';

const { Text } = Typography;
const { RangePicker } = DatePicker;

export const SystemReportsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab hiện tại (mặc định overview)
  const activeTab = searchParams.get('tab') || 'overview';

  // State bộ lọc phạm vi
  const [coSos, setCoSos] = useState<CoSoDto[]>([]);
  const [khoas, setKhoas] = useState<KhoaDto[]>([]);
  const [selectedCoSo, setSelectedCoSo] = useState<number | undefined>(undefined);
  const [selectedKhoa, setSelectedKhoa] = useState<number | undefined>(undefined);

  // State thời gian: mặc định 30 ngày gần nhất
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(29, 'day').startOf('day'),
    dayjs().endOf('day'),
  ]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(dayjs().format('HH:mm:ss'));

  // Data states cho từng tab
  const [overviewData, setOverviewData] = useState<SystemReportsOverviewDto | null>(null);
  const [clinicalData, setClinicalData] = useState<SystemReportsClinicalDto | null>(null);
  const [financeData, setFinanceData] = useState<SystemReportsFinanceDto | null>(null);
  const [inventoryData, setInventoryData] = useState<SystemReportsInventoryDto | null>(null);
  const [productivityData, setProductivityData] = useState<SystemReportsProductivityDto | null>(null);

  // Tải danh sách Cơ sở khi khởi động
  useEffect(() => {
    (async () => {
      try {
        const res = await examinationApi.getCoSos();
        if (res.data?.data) {
          setCoSos(res.data.data);
        }
      } catch {
        // Fallback
      }
    })();
  }, []);

  // Khi chọn cơ sở -> tải danh sách Khoa tương ứng
  const handleCoSoChange = async (val?: number) => {
    setSelectedCoSo(val);
    setSelectedKhoa(undefined);
    if (val && val > 0) {
      try {
        const res = await examinationApi.getKhoas(val);
        if (res.data?.data) setKhoas(res.data.data);
      } catch {
        setKhoas([]);
      }
    } else {
      setKhoas([]);
    }
  };

  // Chuẩn bị params query
  const queryParams: ReportQueryParams = useMemo(() => {
    return {
      facilityId: selectedCoSo,
      departmentId: selectedKhoa,
      fromDate: dateRange[0].format('YYYY-MM-DD'),
      toDate: dateRange[1].format('YYYY-MM-DD'),
    };
  }, [selectedCoSo, selectedKhoa, dateRange]);

  // Hàm tải dữ liệu tương ứng với Tab đang active
  const fetchCurrentTabData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await systemReportsApi.getOverview(queryParams);
        if (res.data?.data) setOverviewData(res.data.data);
      } else if (activeTab === 'clinical') {
        const res = await systemReportsApi.getClinical(queryParams);
        if (res.data?.data) setClinicalData(res.data.data);
      } else if (activeTab === 'finance') {
        const res = await systemReportsApi.getFinance(queryParams);
        if (res.data?.data) setFinanceData(res.data.data);
      } else if (activeTab === 'inventory') {
        const res = await systemReportsApi.getInventory({ facilityId: selectedCoSo });
        if (res.data?.data) setInventoryData(res.data.data);
      } else if (activeTab === 'productivity') {
        const res = await systemReportsApi.getProductivity(queryParams);
        if (res.data?.data) setProductivityData(res.data.data);
      }
      setLastUpdated(dayjs().format('HH:mm:ss'));
    } catch (err: any) {
      message.error(err.message || 'Lỗi khi tải dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  }, [activeTab, queryParams, selectedCoSo]);

  useEffect(() => {
    fetchCurrentTabData();
  }, [fetchCurrentTabData]);

  // Đổi tab và đồng bộ vào URL
  const handleTabChange = (key: string) => {
    setSearchParams({ tab: key });
  };

  // Xuất file báo cáo
  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      message.loading({ content: 'Đang trích xuất báo cáo...', key: 'export' });
      await systemReportsApi.exportReport(activeTab, queryParams);
      message.success({ content: 'Đã xuất file báo cáo thành công!', key: 'export' });
    } catch {
      message.error({ content: 'Không thể xuất báo cáo', key: 'export' });
    }
  };

  const exportMenuProps: MenuProps = {
    items: [
      { key: 'csv', label: 'Xuất file CSV (Chuẩn UTF-8)' },
      { key: 'excel', label: 'Xuất bảng tính Excel (.xlsx)' },
    ],
    onClick: ({ key }) => handleExport(key as 'csv' | 'xlsx'),
  };

  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <DashboardOutlined /> Tổng quan Điều hành
        </span>
      ),
      children: <OverviewTab data={overviewData} loading={loading} />,
    },
    {
      key: 'clinical',
      label: (
        <span>
          <MedicineBoxOutlined /> Lâm sàng & ICD-10
        </span>
      ),
      children: <ClinicalTab data={clinicalData} loading={loading} />,
    },
    {
      key: 'finance',
      label: (
        <span>
          <DollarCircleOutlined /> Doanh thu & Viện phí
        </span>
      ),
      children: <FinanceTab data={financeData} loading={loading} />,
    },
    {
      key: 'inventory',
      label: (
        <span>
          <DatabaseOutlined /> Dược & Kho vật tư
        </span>
      ),
      children: <InventoryTab data={inventoryData} loading={loading} />,
    },
    {
      key: 'productivity',
      label: (
        <span>
          <TeamOutlined /> Hiệu suất Bác sĩ
        </span>
      ),
      children: <ProductivityTab data={productivityData} loading={loading} />,
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: '#f8fafc',
        overflow: 'hidden',
      }}
    >
      {/* 1. Global Docked Header & Control Ribbon */}
      <div
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          flexShrink: 0,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0b2a3c', margin: 0 }}>
              Trung tâm Báo cáo & Thống kê Hệ thống
            </h2>
            <Tag color="blue" style={{ borderRadius: 4, fontWeight: 600 }}>
              ENTERPRISE BI
            </Tag>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Hệ thống báo cáo điều hành hợp nhất đa phân hệ: Lâm sàng, Tài chính, Kho dược và Năng suất nhân sự
          </Text>
        </div>

        {/* Thanh công cụ hành động */}
        <Space wrap size="small">
          <Tag color="success" style={{ padding: '3px 8px', borderRadius: 4 }}>
            Cập nhật lúc {lastUpdated}
          </Tag>
          <Button icon={<ReloadOutlined />} onClick={fetchCurrentTabData} loading={loading}>
            Làm mới
          </Button>
          <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
            In báo cáo
          </Button>
          <Dropdown menu={exportMenuProps}>
            <Button type="primary" icon={<DownloadOutlined />}>
              Xuất dữ liệu
            </Button>
          </Dropdown>
        </Space>
      </div>

      {/* 2. Secondary Filter Bar (Cơ sở, Khoa, Dải ngày) */}
      <div
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <Space wrap size="small" align="center">
          <Space size={4}>
            <EnvironmentOutlined style={{ color: '#0b4f6c' }} />
            <Text strong style={{ fontSize: 12, textTransform: 'uppercase', color: '#0b4f6c' }}>
              Cơ sở:
            </Text>
          </Space>
          <Select
            placeholder="-- Toàn hệ thống --"
            value={selectedCoSo}
            onChange={handleCoSoChange}
            allowClear
            style={{ width: 190 }}
            options={coSos.map((cs) => ({ value: cs.id, label: cs.ten }))}
          />

          <Select
            placeholder="-- Tất cả các khoa --"
            value={selectedKhoa}
            onChange={setSelectedKhoa}
            allowClear
            disabled={!selectedCoSo}
            style={{ width: 180 }}
            options={khoas.map((k) => ({ value: k.id, label: k.ten }))}
          />

          <Space size={4} style={{ marginLeft: 8 }}>
            <CalendarOutlined style={{ color: '#0b4f6c' }} />
            <Text strong style={{ fontSize: 12, textTransform: 'uppercase', color: '#0b4f6c' }}>
              Thời gian:
            </Text>
          </Space>
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setDateRange([dates[0], dates[1]]);
              }
            }}
            format="DD/MM/YYYY"
            allowClear={false}
            style={{ width: 240 }}
          />

          {/* Nút Preset thời gian nhanh */}
          <Space size={4}>
            <Button
              size="small"
              onClick={() => setDateRange([dayjs().startOf('day'), dayjs().endOf('day')])}
            >
              Hôm nay
            </Button>
            <Button
              size="small"
              onClick={() =>
                setDateRange([dayjs().subtract(6, 'day').startOf('day'), dayjs().endOf('day')])
              }
            >
              7 ngày
            </Button>
            <Button
              size="small"
              onClick={() =>
                setDateRange([dayjs().subtract(29, 'day').startOf('day'), dayjs().endOf('day')])
              }
            >
              30 ngày
            </Button>
            <Button
              size="small"
              onClick={() =>
                setDateRange([dayjs().startOf('month'), dayjs().endOf('month')])
              }
            >
              Tháng này
            </Button>
          </Space>
        </Space>
      </div>

      {/* 3. Docked Tabs Bar & Tab Body Canvas */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
          padding: '16px 20px',
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          type="card"
          tabBarStyle={{ marginBottom: 16 }}
        />
      </div>
    </div>
  );
};

export default SystemReportsPage;
