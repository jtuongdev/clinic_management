import React, { useState, useEffect } from 'react';
import { Table, Tag, Typography, Button, Space, Tooltip, Modal } from 'antd';
import {
  DollarCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  FileTextOutlined,
  EyeOutlined,
  SafetyCertificateOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { dashboardApi, ExaminationFinanceDto } from '../../dashboard/api/dashboard.api';

const { Text } = Typography;

interface InvoiceItem {
  code: string;
  patient: string;
  total: string;
  remaining: string;
  status: 'unpaid' | 'partial' | 'paid';
}

const ExaminationFinance: React.FC = () => {
  const [financeData, setFinanceData] = useState<ExaminationFinanceDto | null>(null);
  const [loading, setLoading] = useState(false);

  // Tích hợp API Backend: GET /api/admin/dashboard/finance
  const fetchFinance = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getFinance({ facilityId: 1 });
      if (res.data?.success && res.data.data) {
        setFinanceData(res.data.data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const formatMillions = (val?: number) => {
    if (!val) return '0 tr';
    return (val / 1000000).toFixed(1) + ' tr';
  };

  const kpiList = financeData ? [
    { label: 'Doanh thu tháng', value: formatMillions(financeData.kpis.revenue), color: '#0b4f6c', bgColor: '#e8f4f7', icon: <DollarCircleOutlined style={{ fontSize: 20, color: '#0b4f6c' }} /> },
    { label: 'Chưa thanh toán', value: formatMillions(financeData.kpis.unpaid), color: '#f59e0b', bgColor: '#fffbeb', icon: <ClockCircleOutlined style={{ fontSize: 20, color: '#f59e0b' }} /> },
    { label: 'Đã thanh toán', value: formatMillions(financeData.kpis.paid), color: '#10b981', bgColor: '#ecfdf5', icon: <CheckCircleOutlined style={{ fontSize: 20, color: '#10b981' }} /> },
    { label: 'BHYT chi trả', value: formatMillions(financeData.kpis.insurance), color: '#0284c7', bgColor: '#e0f2fe', icon: <SafetyCertificateOutlined style={{ fontSize: 20, color: '#0284c7' }} /> },
    { label: 'Công nợ quá hạn', value: formatMillions(financeData.kpis.overdue), color: '#ef4444', bgColor: '#fef2f2', icon: <WarningOutlined style={{ fontSize: 20, color: '#ef4444' }} /> },
    { label: 'Số hóa đơn viện phí', value: String(financeData.kpis.invoiceCount), color: '#8b5cf6', bgColor: '#f3e8ff', icon: <FileTextOutlined style={{ fontSize: 20, color: '#8b5cf6' }} /> },
  ] : [];

  const invoiceList: InvoiceItem[] = financeData?.invoices
    ? financeData.invoices.map(inv => ({
        code: inv.code,
        patient: inv.patient,
        total: typeof inv.total === 'number' ? inv.total.toLocaleString('vi-VN') + ' đ' : inv.total,
        remaining: typeof inv.remaining === 'number' ? inv.remaining.toLocaleString('vi-VN') + ' đ' : inv.remaining,
        status: inv.status,
      }))
    : [];

  const columns: ColumnsType<InvoiceItem> = [
    {
      title: 'Mã hóa đơn',
      dataIndex: 'code',
      key: 'code',
      width: 130,
      render: (text) => <Text code strong>{text}</Text>,
    },
    {
      title: 'Bệnh nhân',
      dataIndex: 'patient',
      key: 'patient',
      render: (text) => <Text strong style={{ color: '#0b4f6c' }}>{text}</Text>,
    },
    {
      title: 'Tổng chi phí',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Còn lại',
      dataIndex: 'remaining',
      key: 'remaining',
      align: 'right',
      render: (text, record) => (
        <Text type={record.remaining !== '0 đ' && record.remaining !== '0' ? 'danger' : 'secondary'}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: string) => {
        if (status === 'paid') return <Tag color="success">Đã thanh toán</Tag>;
        if (status === 'partial') return <Tag color="warning">Thanh toán 1 phần</Tag>;
        return <Tag color="error">Chưa thanh toán</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết hóa đơn">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                Modal.info({
                  title: `Chi tiết hóa đơn ${record.code}`,
                  content: (
                    <div>
                      <p><strong>Bệnh nhân:</strong> {record.patient}</p>
                      <p><strong>Tổng tiền:</strong> {record.total}</p>
                      <p><strong>Còn lại:</strong> {record.remaining}</p>
                    </div>
                  ),
                });
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0b2a3c', margin: 0 }}>
          Tài chính & Doanh thu Khám bệnh
        </h3>
        <Button
          icon={<ReloadOutlined />}
          loading={loading}
          onClick={fetchFinance}
        >
          Làm mới
        </Button>
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

      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e9edf4', padding: '16px' }}>
        <Table
          columns={columns}
          dataSource={invoiceList}
          rowKey="code"
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      </div>
    </div>
  );
};

export default ExaminationFinance;
