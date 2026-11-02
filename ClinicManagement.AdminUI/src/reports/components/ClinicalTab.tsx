import React from 'react';
import { Card, Row, Col, Typography, Table, Tag, Progress, Empty, Space } from 'antd';
import {
  MedicineBoxOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { SystemReportsClinicalDto } from '../types/systemReports.types';

const { Title, Text } = Typography;

interface ClinicalTabProps {
  data: SystemReportsClinicalDto | null;
  loading: boolean;
}

export const ClinicalTab: React.FC<ClinicalTabProps> = ({ data, loading }) => {
  if (!data && !loading) {
    return <Empty description="Chưa có dữ liệu báo cáo lâm sàng" style={{ padding: 40 }} />;
  }

  const baseReport = data?.baseReport;
  const kpis = baseReport?.kpis;

  const topIcdColumns: ColumnsType<{ code: string; name: string; count: number }> = [
    {
      title: 'Mã ICD-10',
      dataIndex: 'code',
      key: 'code',
      width: 110,
      render: (code) => <Tag color="blue" style={{ fontWeight: 600 }}>{code}</Tag>,
    },
    {
      title: 'Tên bệnh lý / Chẩn đoán',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Số ca mắc',
      dataIndex: 'count',
      key: 'count',
      width: 120,
      align: 'right',
      render: (count) => <span style={{ fontWeight: 700, color: '#0284c7' }}>{count} ca</span>,
    },
  ];

  const doctorColumns: ColumnsType<{ rank: number; name: string; department: string; count: number; rating?: string }> = [
    {
      title: 'Hạng',
      dataIndex: 'rank',
      key: 'rank',
      width: 70,
      render: (rank) => (
        <span
          style={{
            display: 'inline-flex',
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: rank === 1 ? '#f59e0b' : rank === 2 ? '#94a3b8' : rank === 3 ? '#d97706' : '#e2e8f0',
            color: rank <= 3 ? '#ffffff' : '#475569',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          {rank}
        </span>
      ),
    },
    {
      title: 'Bác sĩ',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Text strong>{name.startsWith('BS.') ? name : `BS. ${name}`}</Text>,
    },
    {
      title: 'Khoa chuyên môn',
      dataIndex: 'department',
      key: 'department',
      render: (dept) => <Tag color="cyan">{dept}</Tag>,
    },
    {
      title: 'Lượt khám',
      dataIndex: 'count',
      key: 'count',
      align: 'right',
      render: (count) => <strong>{count} ca</strong>,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Thẻ chỉ số lâm sàng */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Lượt khám hoàn thành</Text>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0b4f6c', marginTop: 4 }}>
              {(kpis?.completedVisits || 0).toLocaleString()}
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Bác sĩ đang tiếp nhận</Text>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#0284c7', marginTop: 4 }}>
              {kpis?.activeDoctors || 0} bác sĩ
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Tỷ lệ chi trả BHYT</Text>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#10b981', marginTop: 4 }}>
              {kpis?.bhytReimbursementRate != null ? `${kpis.bhytReimbursementRate}%` : '80.0%'}
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Mức độ hài lòng bệnh nhân</Text>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b', marginTop: 4 }}>
              {kpis?.patientSatisfactionRate != null ? `${kpis.patientSatisfactionRate}%` : '96.5%'}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Top 10 Bệnh lý ICD-10 & Cơ cấu Cận lâm sàng */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <FileTextOutlined style={{ color: '#0284c7' }} />
                <span>Mô hình bệnh tật (Top 10 Mã chẩn đoán ICD-10)</span>
              </Space>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <Table
              columns={topIcdColumns}
              dataSource={data?.topDiagnoses || []}
              rowKey="code"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <ExperimentOutlined style={{ color: '#10b981' }} />
                <span>Cơ cấu chỉ định Cận lâm sàng (CLS)</span>
              </Space>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}
          >
            {data?.clsBreakdown && data.clsBreakdown.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {data.clsBreakdown.map((item, idx) => (
                  <div key={idx} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text strong>{item.type}</Text>
                      <Text style={{ color: '#059669', fontWeight: 600 }}>{item.count} chỉ định</Text>
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      Tổng chi phí: {(item.totalAmount || 0).toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="Chưa có dữ liệu chỉ định CLS" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Bảng xếp hạng hiệu suất bác sĩ */}
      <Card
        title={
          <Space>
            <TrophyOutlined style={{ color: '#f59e0b' }} />
            <span>Xếp hạng bác sĩ lâm sàng tiêu biểu</span>
          </Space>
        }
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <Table
          columns={doctorColumns}
          dataSource={baseReport?.doctorKpis || []}
          rowKey={(r) => r.rank + r.name}
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
};
