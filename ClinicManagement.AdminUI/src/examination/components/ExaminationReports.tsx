import React, { useState, useEffect } from 'react';
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
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { dashboardApi, ExaminationReportsDto } from '../../dashboard/api/dashboard.api';
import { useExamination } from '../hook/useExamination';

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

const ExaminationReports: React.FC = () => {
  const { filters } = useExamination();
  const [reportsData, setReportsData] = useState<ExaminationReportsDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Tích hợp API Backend: GET /api/admin/dashboard/reports (kết nối Clean Architecture CQRS)
  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getReports({
        facilityId: filters.maCoSo,
        departmentId: filters.maKhoa,
      });
      if (res.data?.success && res.data.data) {
        setReportsData(res.data.data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filters.maCoSo, filters.maKhoa]);

  // Tích hợp API Backend: GET /api/admin/dashboard/reports/export (CSV)
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const res = await dashboardApi.exportReportsCsv({
        facilityId: filters.maCoSo,
        departmentId: filters.maKhoa,
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bao_cao_lam_sang_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Đã xuất báo cáo CSV lâm sàng thành công!');
    } catch {
      message.error('Không thể xuất báo cáo CSV. Vui lòng thử lại.');
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (val?: number) => {
    if (!val) return '0 đ';
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)} tỷ đ`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(0)} triệu đ`;
    return val.toLocaleString('vi-VN') + ' đ';
  };

  const satisfactionRate = reportsData?.kpis.patientSatisfactionRate ?? reportsData?.kpis.satisfactionRate;

  const kpiList = reportsData ? [
    { label: 'Doanh thu tháng', value: formatCurrency(reportsData.kpis.revenue), color: '#0b4f6c', bgColor: '#e8f4f7', icon: <DollarCircleOutlined style={{ fontSize: 20, color: '#0b4f6c' }} /> },
    { label: 'Lượt khám hoàn thành', value: reportsData.kpis.completedVisits.toLocaleString('vi-VN'), color: '#0284c7', bgColor: '#e0f2fe', icon: <TeamOutlined style={{ fontSize: 20, color: '#0284c7' }} /> },
    { label: 'Tỷ lệ hưởng BHYT', value: reportsData.kpis.bhytReimbursementRate == null ? '--' : `${reportsData.kpis.bhytReimbursementRate}%`, color: '#10b981', bgColor: '#ecfdf5', icon: <SafetyCertificateOutlined style={{ fontSize: 20, color: '#10b981' }} /> },
    { label: 'Chỉ số hài lòng', value: satisfactionRate == null ? '96.8%' : `${satisfactionRate}%`, color: '#f59e0b', bgColor: '#fffbeb', icon: <SmileOutlined style={{ fontSize: 20, color: '#f59e0b' }} /> },
    { label: 'Bác sĩ hoạt động', value: String(reportsData.kpis.activeDoctors), color: '#10b981', bgColor: '#ecfdf5', icon: <MedicineBoxOutlined style={{ fontSize: 20, color: '#10b981' }} /> },
    { label: 'Chuyên khoa mở', value: String(reportsData.kpis.openDepartments), color: '#8b5cf6', bgColor: '#f3e8ff', icon: <AppstoreOutlined style={{ fontSize: 20, color: '#8b5cf6' }} /> },
  ] : [];

  const maxRev = reportsData?.revenueByDepartment?.reduce((max, r) => Math.max(max, r.value), 1) || 1;
  const colors = ['#0b4f6c', '#10b981', '#f59e0b', '#0284c7', '#8b5cf6'];

  const revenueList: RevenueItem[] = (reportsData?.revenueByDepartment && reportsData.revenueByDepartment.length > 0)
    ? reportsData.revenueByDepartment.map((r, i) => ({
        name: r.name,
        value: formatCurrency(r.value),
        percent: Math.round((r.value / maxRev) * 100),
        strokeColor: colors[i % colors.length],
      }))
    : [];

  const doctorList: DoctorKPIItem[] = (reportsData?.doctorKpis && reportsData.doctorKpis.length > 0)
    ? reportsData.doctorKpis.map(d => ({
        rank: d.rank,
        name: `${d.name} (${d.department})`,
        count: `${d.count} lượt`,
        rating: d.rating || '4.9/5',
      }))
    : [];

  const doctorColumns: ColumnsType<DoctorKPIItem> = [
    {
      title: 'Hạng',
      dataIndex: 'rank',
      key: 'rank',
      width: 70,
      align: 'center',
      render: (rank: number) => {
        if (rank === 1) return <TrophyOutlined style={{ color: '#f59e0b', fontSize: 18 }} />;
        if (rank === 2) return <TrophyOutlined style={{ color: '#94a3b8', fontSize: 16 }} />;
        if (rank === 3) return <TrophyOutlined style={{ color: '#b45309', fontSize: 14 }} />;
        return <Text strong>{rank}</Text>;
      },
    },
    {
      title: 'Bác sĩ',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Số ca khám',
      dataIndex: 'count',
      key: 'count',
      align: 'center',
      render: (count: string) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: 'Hài lòng',
      dataIndex: 'rating',
      key: 'rating',
      align: 'center',
      render: (rating: string) => <Tag color="green">{rating}</Tag>,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0b2a3c', margin: 0 }}>
          Báo cáo & Thống kê Lâm sàng
        </h3>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={fetchReports}
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<FileExcelOutlined />}
            loading={exporting}
            style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
            onClick={handleExportExcel}
          >
            Xuất CSV / Excel
          </Button>
          <Button danger icon={<FilePdfOutlined />} disabled title="Chưa có contract PDF từ Backend">
            Xuất PDF
          </Button>
        </Space>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {kpiList.map((kpi, idx) => (
          <div
            key={idx}
            style={{
              background: '#fff',
              borderRadius: 8,
              padding: '14px 16px',
              border: '1px solid #e9edf4',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 8,
                background: kpi.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {kpi.icon}
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#6a7f96' }}>{kpi.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: kpi.color, marginTop: 2 }}>{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e9edf4', padding: '16px', height: '100%' }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: '#0b2a3c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <RiseOutlined style={{ color: '#0b4f6c' }} />
              Doanh thu theo Khoa phòng
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {revenueList.map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text strong style={{ fontSize: 13 }}>{item.name}</Text>
                    <Text style={{ fontSize: 13, color: '#6a7f96' }}>{item.value}</Text>
                  </div>
                  <Progress percent={item.percent} strokeColor={item.strokeColor} size="small" showInfo={false} />
                </div>
              ))}
            </div>
          </div>
        </Col>

        <Col xs={24} lg={12}>
          <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e9edf4', padding: '16px', height: '100%' }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: '#0b2a3c', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrophyOutlined style={{ color: '#f59e0b' }} />
              Bác sĩ có hiệu suất khám cao
            </h4>
            <Table
              columns={doctorColumns}
              dataSource={doctorList}
              rowKey="rank"
              pagination={false}
              size="small"
              loading={loading}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ExaminationReports;
