import React, { useState } from 'react';
import { Table, Tag, Typography, Button, Space, Tooltip, Modal } from 'antd';
import {
  DollarCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  FileTextOutlined,
  EyeOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Text } = Typography;

interface InvoiceItem {
  code: string;
  patient: string;
  total: string;
  remaining: string;
  status: 'unpaid' | 'partial' | 'paid';
}

const mockFinance = {
  kpis: [
    { label: 'Doanh thu tháng', value: '128,5 tr', color: '#0b4f6c', bgColor: '#e8f4f7', icon: <DollarCircleOutlined style={{ fontSize: 20, color: '#0b4f6c' }} /> },
    { label: 'Chưa thanh toán', value: '23,2 tr', color: '#f59e0b', bgColor: '#fffbeb', icon: <ClockCircleOutlined style={{ fontSize: 20, color: '#f59e0b' }} /> },
    { label: 'Đã thanh toán', value: '105,3 tr', color: '#10b981', bgColor: '#ecfdf5', icon: <CheckCircleOutlined style={{ fontSize: 20, color: '#10b981' }} /> },
    { label: 'BHYT chi trả', value: '42,1 tr', color: '#0284c7', bgColor: '#e0f2fe', icon: <SafetyCertificateOutlined style={{ fontSize: 20, color: '#0284c7' }} /> },
    { label: 'Công nợ quá hạn', value: '8,7 tr', color: '#ef4444', bgColor: '#fef2f2', icon: <WarningOutlined style={{ fontSize: 20, color: '#ef4444' }} /> },
    { label: 'Số hóa đơn viện phí', value: '56', color: '#8b5cf6', bgColor: '#f3e8ff', icon: <FileTextOutlined style={{ fontSize: 20, color: '#8b5cf6' }} /> },
  ],
  invoices: [
    { code: 'HD-001', patient: 'Nguyễn Văn An', total: '850.000 đ', remaining: '850.000 đ', status: 'unpaid' as const },
    { code: 'HD-002', patient: 'Trần Thị Mai', total: '2.400.000 đ', remaining: '0 đ', status: 'paid' as const },
    { code: 'HD-003', patient: 'Lê Văn Cường', total: '1.200.000 đ', remaining: '600.000 đ', status: 'partial' as const },
    { code: 'HD-004', patient: 'Phạm Hồng Ánh', total: '450.000 đ', remaining: '450.000 đ', status: 'unpaid' as const },
  ],
};

const ExaminationFinance: React.FC = () => {
  const [data] = useState(mockFinance);

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
      render: (val) => <Text strong>{val}</Text>,
    },
    {
      title: 'Còn lại',
      dataIndex: 'remaining',
      key: 'remaining',
      align: 'right',
      render: (val) => <Text style={{ color: val !== '0 đ' ? '#ef4444' : '#10b981' }}>{val}</Text>,
    },
    {
      title: 'Trạng thái thanh toán',
      dataIndex: 'status',
      key: 'status',
      width: 170,
      render: (status) => {
        if (status === 'unpaid') return <Tag color="error">Chưa thanh toán</Tag>;
        if (status === 'partial') return <Tag color="warning">Thanh toán 1 phần</Tag>;
        return <Tag color="success">Đã tất toán</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 90,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="Xem chi tiết hóa đơn">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() =>
              Modal.info({
                title: `Chi tiết hóa đơn: ${record.code}`,
                content: `Bệnh nhân: ${record.patient} | Tổng tiền: ${record.total} | Còn nợ: ${record.remaining}`,
              })
            }
          />
        </Tooltip>
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
        <Space size="middle">
          <Space size="small">
            <FileTextOutlined style={{ color: '#0b4f6c', fontSize: 16 }} />
            <Text strong style={{ fontSize: 14, color: '#0f172a' }}>
              Hóa đơn viện phí khám bệnh
            </Text>
          </Space>
          <Tag color="blue" style={{ borderRadius: 4, margin: 0 }}>
            {data.invoices.length} hóa đơn
          </Tag>
        </Space>
      </div>

      {/* Edge-to-Edge Data Grid */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <Table<InvoiceItem>
          rowKey="code"
          columns={columns}
          dataSource={data.invoices}
          size="middle"
          pagination={{ pageSize: 10, style: { padding: '8px 16px', margin: 0 } }}
        />
      </div>
    </div>
  );
};

export default ExaminationFinance;