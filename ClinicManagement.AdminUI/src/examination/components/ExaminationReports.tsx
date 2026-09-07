import React, { useState } from 'react';
import { Row, Col, Progress, Typography, Button, Space, Table, Tag, message } from 'antd';
import {
  DollarCircleOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  SmileOutlined,
  MedicineBoxOutlined,
  AppstoreOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  TrophyOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

interface RevenueItem {
  name: string;
  value: string;
  percent: number;
  strokeColor: string;
}

interface DoctorKPIItem {
  rank: number;
  name: string;
  count: string;
  rating: string;
}

const mockReports = {
  kpis: [
    { label: 'Doanh thu tháng', value: '2,8 tỷ đ', color: '#0b4f6c', bgColor: '#e8f4f7', icon: <DollarCircleOutlined style={{ fontSize: 20, color: '#0b4f6c' }} /> },
    { label: 'Lượt khám hoàn thành', value: '3.247', color: '#0284c7', bgColor: '#e0f2fe', icon: <TeamOutlined style={{ fontSize: 20, color: '#0284c7' }} /> },
    { label: 'Tỷ lệ hưởng BHYT', value: '78%', color: '#10b981', bgColor: '#ecfdf5', icon: <SafetyCertificateOutlined style={{ fontSize: 20, color: '#10b981' }} /> },
    { label: 'Chỉ số hài lòng', value: '4.8 / 5', color: '#f59e0b', bgColor: '#fffbeb', icon: <SmileOutlined style={{ fontSize: 20, color: '#f59e0b' }} /> },
    { label: 'Bác sĩ hoạt động', value: '12', color: '#10b981', bgColor: '#ecfdf5', icon: <MedicineBoxOutlined style={{ fontSize: 20, color: '#10b981' }} /> },
    { label: 'Chuyên khoa mở', value: '5', color: '#8b5cf6', bgColor: '#f3e8ff', icon: <AppstoreOutlined style={{ fontSize: 20, color: '#8b5cf6' }} /> },
  ],
  revenue: [
    { name: 'Khoa Nội tổng quát', value: '1,2 tỷ đ', percent: 100, strokeColor: '#0b4f6c' },
    { name: 'Khoa Ngoại khoa', value: '850 triệu đ', percent: 70, strokeColor: '#10b981' },
    { name: 'Khoa Nhi', value: '650 triệu đ', percent: 55, strokeColor: '#f59e0b' },
    { name: 'Khoa Sản phụ', value: '450 triệu đ', percent: 40, strokeColor: '#0284c7' },
    { name: 'Khoa Tai Mũi Họng', value: '350 triệu đ', percent: 30, strokeColor: '#8b5cf6' },
  ] as RevenueItem[],
  doctors: [
    { rank: 1, name: 'BS. Tuấn (Nội)', count: '142 lượt', rating: '98%' },
    { rank: 2, name: 'BS. Hoa (Ngoại)', count: '128 lượt', rating: '96%' },
    { rank: 3, name: 'BS. Minh (Nhi)', count: '115 lượt', rating: '94%' },
  ] as DoctorKPIItem[],
};

const ExaminationReports: React.FC = () => {
  const [data] = useState(mockReports);

  const handleExportExcel = () => {
    message.success('Đang khởi tạo tệp báo cáo tổng hợp Excel...');
  };

  const handleExportPdf = () => {
    message.info('Đang kết xuất báo cáo PDF tổng quan...');
  };

  const doctorColumns: ColumnsType<DoctorKPIItem> = [
    {
      title: 'Hạng',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      align: 'center',
      render: (rank) => {
        if (rank === 1) return <Tag color="gold" style={{ fontWeight: 700 }}>#1</Tag>;
        if (rank === 2) return <Tag color="cyan" style={{ fontWeight: 700 }}>#2</Tag>;
        return <Tag color="orange" style={{ fontWeight: 700 }}>#3</Tag>;
      },
    },
    {
      title: 'Bác sĩ & Khoa',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Text strong style={{ color: '#0b4f6c' }}>{name}</Text>,
    },
    {
      title: 'Lượt khám hoàn thành',
      dataIndex: 'count',
      key: 'count',
      align: 'right',
      render: (count) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: 'Tỷ lệ hài lòng',
      dataIndex: 'rating',
      key: 'rating',
      align: 'right',
      render: (rating) => (
        <Space>
          <Text strong style={{ color: '#10b981' }}>{rating}</Text>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        background: '#ffffff',
      }}
    >
      {/* Metric Ribbon / Stat Bar */}
      <div
        style={{
          height: 42,
          minHeight: 42,
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          overflowX: 'auto',
          flexShrink: 0,
        }}
      >
        {data.kpis.map((kpi, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <div style={{ width: 1, height: 16, background: '#cbd5e1' }} />}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
              <span style={{ display: 'flex', alignItems: 'center' }}>{kpi.icon}</span>
              <span style={{ fontSize: 12, color: '#64748b' }}>{kpi.label}:</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: kpi.color }}>
                {kpi.value}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Control Toolbar */}
      <div
        style={{
          minHeight: 46,
          padding: '6px 16px',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginRight: 12 }}>
            Báo cáo & Thống kê điều hành khám chữa bệnh
          </span>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Tổng hợp doanh thu, lượt phục vụ, BHYT và xếp hạng KPI lâm sàng
          </Text>
        </div>

        <Space size="small">
          <Button
            type="primary"
            style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
            icon={<FileExcelOutlined />}
            onClick={handleExportExcel}
            size="middle"
          >
            Xuất Excel
          </Button>
          <Button
            type="default"
            icon={<FilePdfOutlined style={{ color: '#ef4444' }} />}
            onClick={handleExportPdf}
            size="middle"
          >
            Xuất PDF
          </Button>
        </Space>
      </div>

      {/* Analysis Grid Body */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <Row style={{ minHeight: '100%' }}>
          {/* Revenue by Department */}
          <Col xs={24} lg={12} style={{ borderRight: '1px solid #e2e8f0', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <RiseOutlined style={{ color: '#0b4f6c', fontSize: 16 }} />
              <Text strong style={{ fontSize: 14, color: '#0f172a' }}>
                Doanh thu theo chuyên khoa
              </Text>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {data.revenue.map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text strong style={{ color: '#1e293b' }}>{item.name}</Text>
                    <Text strong style={{ color: '#0b4f6c' }}>{item.value}</Text>
                  </div>
                  <Progress
                    percent={item.percent}
                    strokeColor={item.strokeColor}
                    size={['100%', 8]}
                    showInfo={false}
                  />
                </div>
              ))}
            </div>
          </Col>

          {/* Doctor KPIs */}
          <Col xs={24} lg={12}>
            <div
              style={{
                height: 44,
                padding: '0 16px',
                borderBottom: '1px solid #e2e8f0',
                background: '#fafbfc',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Space size="small">
                <TrophyOutlined style={{ color: '#f59e0b', fontSize: 16 }} />
                <Text strong style={{ fontSize: 14, color: '#0f172a' }}>
                  Bác sĩ tiêu biểu trong tháng
                </Text>
              </Space>
            </div>
            <Table<DoctorKPIItem>
              columns={doctorColumns}
              dataSource={data.doctors.map((d, i) => ({ ...d, key: i }))}
              pagination={false}
              size="middle"
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ExaminationReports;