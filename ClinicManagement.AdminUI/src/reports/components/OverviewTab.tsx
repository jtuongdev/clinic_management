import React from 'react';
import { Card, Row, Col, Typography, Tag, Progress, Table, Empty, Space } from 'antd';
import {
  MedicineBoxOutlined,
  DollarCircleOutlined,
  DatabaseOutlined,
  TeamOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { SystemReportsOverviewDto } from '../types/systemReports.types';

const { Title, Text } = Typography;

interface OverviewTabProps {
  data: SystemReportsOverviewDto | null;
  loading: boolean;
}

const formatCurrency = (val: number) => {
  return (val || 0).toLocaleString('vi-VN') + ' đ';
};

export const OverviewTab: React.FC<OverviewTabProps> = ({ data, loading }) => {
  if (!data && !loading) {
    return <Empty description="Chưa có dữ liệu báo cáo" style={{ padding: 40 }} />;
  }

  const kpis = data?.kpis;

  // Max value cho xu hướng ngày
  const maxRevenue = Math.max(...(data?.trends.map((t) => t.revenue) || [1]), 1);
  const maxVisits = Math.max(...(data?.trends.map((t) => t.visits) || [1]), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 4 Nhóm Card KPI Lớn */}
      <Row gutter={[16, 16]}>
        {/* Nhóm 1: Lâm sàng */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #0b4f6c 0%, #0284c7 100%)',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(11, 79, 108, 0.15)',
            }}
            styles={{ body: { padding: '16px 20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Lâm sàng & Khám bệnh
              </Text>
              <MedicineBoxOutlined style={{ fontSize: 22, color: '#ffffff' }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, margin: '10px 0 4px' }}>
              {(kpis?.totalVisits || 0).toLocaleString()} <span style={{ fontSize: 14, fontWeight: 400 }}>lượt</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
              <span>Hoàn thành: <strong>{kpis?.completedVisits || 0}</strong> ({kpis?.completionRate || 0}%)</span>
              <span>Đang chờ: <strong>{kpis?.pendingVisits || 0}</strong></span>
            </div>
          </Card>
        </Col>

        {/* Nhóm 2: Tài chính */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)',
            }}
            styles={{ body: { padding: '16px 20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Doanh thu viện phí
              </Text>
              <DollarCircleOutlined style={{ fontSize: 22, color: '#ffffff' }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, margin: '10px 0 4px' }}>
              {formatCurrency(kpis?.totalRevenue || 0)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
              <span>Thực thu: <strong>{formatCurrency(kpis?.collectedRevenue || 0)}</strong></span>
              <span>BHYT: <strong>{formatCurrency(kpis?.insurancePaid || 0)}</strong></span>
            </div>
          </Card>
        </Col>

        {/* Nhóm 3: Dược & Kho */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
            }}
            styles={{ body: { padding: '16px 20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Kho Dược & Vật tư
              </Text>
              <DatabaseOutlined style={{ fontSize: 22, color: '#ffffff' }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, margin: '10px 0 4px' }}>
              {formatCurrency(kpis?.inventoryValue || 0)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
              <span>Tổng SKU: <strong>{kpis?.totalMedicines || 0}</strong></span>
              <span>Cảnh báo hết: <strong style={{ color: '#fed7aa' }}>{kpis?.lowStockMedicines || 0}</strong></span>
            </div>
          </Card>
        </Col>

        {/* Nhóm 4: Nhân sự */}
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)',
            }}
            styles={{ body: { padding: '16px 20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Nhân sự hoạt động
              </Text>
              <TeamOutlined style={{ fontSize: 22, color: '#ffffff' }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, margin: '10px 0 4px' }}>
              {kpis?.staffCount || 0} <span style={{ fontSize: 14, fontWeight: 400 }}>nhân viên</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
              <span>Bác sĩ phụ trách: <strong>{kpis?.doctorsCount || 0}</strong></span>
              <span>Nợ viện phí: <strong style={{ color: '#fee2e2' }}>{formatCurrency(kpis?.pendingDebt || 0)}</strong></span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ xu hướng và Phân bổ nguồn thu */}
      <Row gutter={[16, 16]}>
        {/* Xu hướng hàng ngày */}
        <Col xs={24} lg={15}>
          <Card
            title={
              <Space>
                <ArrowUpOutlined style={{ color: '#0284c7' }} />
                <span>Xu hướng Lượt khám & Doanh thu theo thời gian</span>
              </Space>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            {data?.trends && data.trends.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Visual Bars mini chart */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    height: 180,
                    gap: 6,
                    padding: '10px 0',
                    borderBottom: '1px solid #f1f5f9',
                    overflowX: 'auto',
                  }}
                >
                  {data.trends.map((item, idx) => {
                    const heightPercent = Math.max(10, Math.round((item.revenue / maxRevenue) * 140));
                    return (
                      <div
                        key={idx}
                        style={{
                          flex: 1,
                          minWidth: 28,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 4,
                        }}
                        title={`${item.date}: ${item.visits} lượt khám, ${formatCurrency(item.revenue)}`}
                      >
                        <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>{item.visits}</div>
                        <div
                          style={{
                            width: '100%',
                            height: heightPercent,
                            background: 'linear-gradient(180deg, #0284c7 0%, #38bdf8 100%)',
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.3s ease',
                          }}
                        />
                        <div style={{ fontSize: 10, color: '#94a3b8', whiteSpace: 'nowrap' }}>{item.date}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#64748b' }}>
                  <span><Tag color="blue">Cột xanh</Tag> Doanh thu lũy kế theo ngày</span>
                  <span><Tag color="cyan">Số trên đầu</Tag> Lượt bệnh nhân tiếp nhận</span>
                </div>
              </div>
            ) : (
              <Empty description="Chưa có dữ liệu xu hướng" />
            )}
          </Card>
        </Col>

        {/* Cơ cấu doanh thu theo khoa */}
        <Col xs={24} lg={9}>
          <Card
            title="Cơ cấu doanh thu theo Khoa lâm sàng"
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}
          >
            {data?.departmentRevenue && data.departmentRevenue.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {data.departmentRevenue.map((dept, idx) => {
                  const percent = Math.min(100, Math.round((dept.value / (kpis?.totalRevenue || 1)) * 100));
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text strong style={{ color: '#0f172a' }}>{dept.name}</Text>
                        <Text style={{ color: '#0284c7', fontWeight: 600 }}>{formatCurrency(dept.value)}</Text>
                      </div>
                      <Progress
                        percent={percent}
                        status="active"
                        strokeColor={{ '0%': '#0b4f6c', '100%': '#0284c7' }}
                        size="small"
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <Empty description="Chưa có dữ liệu cơ cấu khoa" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
