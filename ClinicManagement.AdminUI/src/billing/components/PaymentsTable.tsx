import React, { useState } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Typography,
  InputNumber,
  App,
} from 'antd';
import {
  SearchOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { PhieuThuDto } from '../types/billing.types';
import { billingApi } from '../api/billing.api';

const { Text } = Typography;

export const PaymentsTable: React.FC = () => {
  const { message } = App.useApp();

  const [invoiceIdInput, setInvoiceIdInput] = useState<number | null>(null);
  const [payments, setPayments] = useState<PhieuThuDto[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = async () => {
    if (!invoiceIdInput) {
      message.warning('Vui lòng nhập mã hóa đơn cần tra cứu phiếu thu');
      return;
    }
    setLoading(true);
    try {
      const res = await billingApi.getInvoicePayments(invoiceIdInput);
      if (res.data.success && res.data.data) {
        setPayments(res.data.data);
      } else {
        setPayments([]);
      }
    } catch {
      message.error('Lỗi khi tải lịch sử phiếu thu');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '0 ₫';
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  const columns: ColumnsType<PhieuThuDto> = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Số phiếu thu',
      dataIndex: 'soPhieuThu',
      key: 'soPhieuThu',
      render: (val) => <Text strong style={{ color: '#0b4f6c' }}>{val}</Text>,
    },
    {
      title: 'Ngày thu',
      dataIndex: 'ngayThu',
      key: 'ngayThu',
      render: (d) => formatDate(d),
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'phuongThuc',
      key: 'phuongThuc',
      render: (p) => {
        const map: Record<string, string> = {
          TIEN_MAT: '💵 Tiền mặt',
          CHUYEN_KHOAN: '💳 Chuyển khoản',
          THE: '🏧 Thẻ POS',
          BAO_HIEM: '🛡️ Bảo lãnh viện phí',
        };
        return <Tag color="blue">{map[p] || p}</Tag>;
      },
    },
    {
      title: 'Người thu tiền',
      dataIndex: 'nguoiThu',
      key: 'nguoiThu',
      render: (name) => name || 'Thu ngân',
    },
    {
      title: 'Số tiền thu',
      dataIndex: 'soTien',
      key: 'soTien',
      align: 'right',
      render: (val) => (
        <Text strong style={{ color: '#16a34a', fontSize: 14 }}>
          {formatCurrency(val)}
        </Text>
      ),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'ghiChu',
      key: 'ghiChu',
      render: (val) => val || <Text type="secondary">--</Text>,
    },
  ];

  const totalPaid = payments.reduce((sum, p) => sum + (p.soTien || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Search Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          background: '#fff',
          padding: '12px 16px',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
        }}
      >
        <Space wrap size="middle">
          <InputNumber
            placeholder="Nhập ID hóa đơn..."
            value={invoiceIdInput}
            onChange={(val) => setInvoiceIdInput(val)}
            style={{ width: 220 }}
            min={1}
            onPressEnter={fetchPayments}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={fetchPayments} loading={loading}>
            Tìm phiếu thu
          </Button>
        </Space>
      </div>

      {/* Summary */}
      {payments.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <AuditOutlined style={{ color: '#0b4f6c' }} />
            <Text strong>Phiếu thu của hóa đơn #{invoiceIdInput}</Text>
            <Tag color="green">{payments.length} phiếu</Tag>
          </Space>
          <div>
            <Text type="secondary">Tổng tiền đã thu: </Text>
            <Text strong style={{ color: '#16a34a', fontSize: 16 }}>
              {formatCurrency(totalPaid)}
            </Text>
          </div>
        </div>
      )}

      {/* Table */}
      <Table<PhieuThuDto>
        rowKey={(r) => String(r.id)}
        columns={columns}
        dataSource={payments}
        loading={loading}
        size="middle"
        locale={{
          emptyText: (
            <div style={{ padding: '32px 0', color: '#94a3b8' }}>
              {invoiceIdInput
                ? 'Không tìm thấy phiếu thu nào cho hóa đơn này'
                : 'Nhập ID hóa đơn ở thanh tìm kiếm để tra cứu các phiếu thu đã phát sinh'}
            </div>
          ),
        }}
      />
    </div>
  );
};

export default PaymentsTable;
