import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Input,
  Select,
  DatePicker,
  Card,
  Row,
  Col,
  Statistic,
  App,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  AuditOutlined,
  PrinterOutlined,
  DollarCircleOutlined,
  CreditCardOutlined,
  SafetyCertificateOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { PhieuThuDto, HoaDonListItemDto } from '../types/billing.types';
import { billingApi } from '../api/billing.api';
import { useCoSoOptions } from '../../facility/hook/useCoSoOptions';
import { dateRangePresets } from '../../shared/utils/datePresets';
import CashierShiftReportModal from './CashierShiftReportModal';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

export const PaymentsTable: React.FC = () => {
  const { message } = App.useApp();

  // Filters
  const { coSos } = useCoSoOptions(0);
  const [facilityId, setFacilityId] = useState<number>(0);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('day'),
    dayjs().endOf('day'),
  ]);
  const [paymentMethod, setPaymentMethod] = useState<string>('ALL');
  const [keyword, setKeyword] = useState<string>('');

  // Data
  const [payments, setPayments] = useState<PhieuThuDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [shiftModalOpen, setShiftModalOpen] = useState<boolean>(false);

  // Load danh sách phiếu thu
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      // Lấy danh sách hóa đơn trong khoảng ngày
      const fromDateStr = dateRange[0]?.format('YYYY-MM-DD');
      const toDateStr = dateRange[1]?.format('YYYY-MM-DD');

      const res = await billingApi.getInvoices({
        facilityId: facilityId > 0 ? facilityId : 0,
        fromDate: fromDateStr,
        toDate: toDateStr,
        pageSize: 100, // Lấy số lượng đủ rộng để tổng hợp ca
      });

      if (res.data?.success && res.data.data?.items) {
        const invoices = res.data.data.items;
        
        // Thu thập các phiếu thu từ các hóa đơn đã thanh toán hoặc thanh toán một phần
        const collectedPayments: PhieuThuDto[] = [];
        
        // Gọi chi tiết để lấy danh sách phiếu thu thực tế
        const invoicePromises = invoices
          .filter((inv) => inv.daThanhToan > 0)
          .map((inv) =>
            billingApi.getInvoicePayments(inv.id).then((r) => ({
              invoice: inv,
              payments: r.data?.data || [],
            })).catch(() => ({ invoice: inv, payments: [] }))
          );

        const results = await Promise.all(invoicePromises);

        results.forEach(({ invoice, payments: pList }) => {
          if (pList && pList.length > 0) {
            pList.forEach((p) => {
              collectedPayments.push({
                ...p,
                ghiChu: p.ghiChu || `Thu tiền hóa đơn #${invoice.soHoaDon} - ${invoice.tenBenhNhan || ''}`,
              });
            });
          } else if (invoice.daThanhToan > 0) {
            // Trường hợp hóa đơn có ghi nhận đã thanh toán nhưng chưa có dòng chi tiết phiếu thu riêng
            collectedPayments.push({
              id: invoice.id,
              soPhieuThu: `PT-${invoice.soHoaDon}`,
              soTien: invoice.daThanhToan,
              ngayThu: invoice.ngayLap,
              phuongThuc: invoice.soTienBaoHiemChiTra > 0 ? 'BAO_HIEM' : 'TIEN_MAT',
              nguoiThu: 'Thu ngân',
              ghiChu: `Hóa đơn #${invoice.soHoaDon} - ${invoice.tenBenhNhan || ''}`,
            });
          }
        });

        setPayments(collectedPayments);
      } else {
        setPayments([]);
      }
    } catch {
      message.error('Lỗi khi tải nhật ký thu tiền');
    } finally {
      setLoading(false);
    }
  }, [dateRange, facilityId, message]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Lọc theo keyword & method
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchMethod = paymentMethod === 'ALL' || p.phuongThuc === paymentMethod;
      const matchKw =
        !keyword ||
        p.soPhieuThu.toLowerCase().includes(keyword.toLowerCase()) ||
        (p.nguoiThu && p.nguoiThu.toLowerCase().includes(keyword.toLowerCase())) ||
        (p.ghiChu && p.ghiChu.toLowerCase().includes(keyword.toLowerCase()));
      return matchMethod && matchKw;
    });
  }, [payments, paymentMethod, keyword]);

  // Tổng hợp tiền
  const totalCash = filteredPayments
    .filter((r) => r.phuongThuc === 'TIEN_MAT')
    .reduce((sum, r) => sum + (r.soTien || 0), 0);

  const totalTransfer = filteredPayments
    .filter((r) => r.phuongThuc === 'CHUYEN_KHOAN')
    .reduce((sum, r) => sum + (r.soTien || 0), 0);

  const totalCollected = filteredPayments.reduce((sum, r) => sum + (r.soTien || 0), 0);

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '0 ₫';
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('vi-VN');
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
      width: 140,
      render: (val) => <Text strong style={{ color: '#0b4f6c' }}>{val}</Text>,
    },
    {
      title: 'Ngày & Giờ thu',
      dataIndex: 'ngayThu',
      key: 'ngayThu',
      width: 150,
      render: (d) => formatDate(d),
    },
    {
      title: 'Phương thức',
      dataIndex: 'phuongThuc',
      key: 'phuongThuc',
      width: 150,
      render: (p) => {
        const map: Record<string, { label: string; color: string }> = {
          TIEN_MAT: { label: '💵 Tiền mặt', color: 'green' },
          CHUYEN_KHOAN: { label: '💳 Chuyển khoản', color: 'blue' },
          THE: { label: '🏧 Thẻ POS', color: 'purple' },
          BAO_HIEM: { label: '🛡️ Bảo lãnh viện phí', color: 'cyan' },
        };
        const config = map[p] || { label: p, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Người thu',
      dataIndex: 'nguoiThu',
      key: 'nguoiThu',
      width: 140,
      render: (name) => name || 'Thu ngân',
    },
    {
      title: 'Số tiền thu',
      dataIndex: 'soTien',
      key: 'soTien',
      width: 140,
      align: 'right',
      render: (val) => (
        <Text strong style={{ color: '#16a34a', fontSize: 14 }}>
          {formatCurrency(val)}
        </Text>
      ),
    },
    {
      title: 'Nội dung thu',
      dataIndex: 'ghiChu',
      key: 'ghiChu',
      render: (val) => val || <Text type="secondary">Thu tiền viện phí</Text>,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* KPI Cards: Tổng quan ca thu ngân */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ borderRadius: 8, borderLeft: '4px solid #16a34a' }}>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#64748b' }}>💵 Tiền mặt thu ngân (Két)</span>}
              value={totalCash}
              precision={0}
              suffix="₫"
              valueStyle={{ color: '#16a34a', fontWeight: 700 }}
              formatter={(v) => Number(v).toLocaleString('vi-VN')}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ borderRadius: 8, borderLeft: '4px solid #0284c7' }}>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#64748b' }}>💳 Chuyển khoản / VietQR</span>}
              value={totalTransfer}
              precision={0}
              suffix="₫"
              valueStyle={{ color: '#0284c7', fontWeight: 700 }}
              formatter={(v) => Number(v).toLocaleString('vi-VN')}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ borderRadius: 8, borderLeft: '4px solid #0b4f6c' }}>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#64748b' }}>📊 Tổng thu trong kỳ ({filteredPayments.length} GD)</span>}
              value={totalCollected}
              precision={0}
              suffix="₫"
              valueStyle={{ color: '#0b4f6c', fontWeight: 700 }}
              formatter={(v) => Number(v).toLocaleString('vi-VN')}
            />
          </Card>
        </Col>
      </Row>

      {/* Toolbar lọc & hành động */}
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
          <RangePicker
            value={dateRange}
            onChange={(dates) => dates && setDateRange(dates as [Dayjs, Dayjs])}
            format="DD/MM/YYYY"
            presets={dateRangePresets}
            allowClear={false}
            style={{ width: 260 }}
          />
          {coSos.length > 1 && (
            <Select
              value={facilityId}
              onChange={setFacilityId}
              style={{ width: 170 }}
              options={[{ value: 0, label: 'Tất cả cơ sở' }, ...coSos.map((c) => ({ value: c.id, label: c.tenCoSo }))]}
            />
          )}
          <Select
            value={paymentMethod}
            onChange={setPaymentMethod}
            style={{ width: 160 }}
            options={[
              { value: 'ALL', label: 'Tất cả phương thức' },
              { value: 'TIEN_MAT', label: '💵 Tiền mặt' },
              { value: 'CHUYEN_KHOAN', label: '💳 Chuyển khoản' },
              { value: 'THE', label: '🏧 Thẻ POS' },
              { value: 'BAO_HIEM', label: '🛡️ Bảo lãnh' },
            ]}
          />
          <Input
            placeholder="Tìm số phiếu, người thu..."
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 220 }}
            allowClear
          />
          <Button icon={<ReloadOutlined />} onClick={fetchPayments} loading={loading}>
            Tải lại
          </Button>
        </Space>

        <Space>
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            style={{ background: '#0b4f6c', borderColor: '#0b4f6c' }}
            onClick={() => setShiftModalOpen(true)}
            disabled={filteredPayments.length === 0}
          >
            In Biên Bản Chốt Ca (Z-Report)
          </Button>
        </Space>
      </div>

      {/* Table */}
      <Table<PhieuThuDto>
        rowKey={(r) => String(r.id || r.soPhieuThu)}
        columns={columns}
        dataSource={filteredPayments}
        loading={loading}
        size="middle"
        pagination={{ pageSize: 15, showTotal: (total) => `Tổng ${total} phiếu thu` }}
        locale={{
          emptyText: (
            <div style={{ padding: '32px 0', color: '#94a3b8' }}>
              Không có giao dịch thu tiền nào phát sinh trong khoảng thời gian đã chọn
            </div>
          ),
        }}
      />

      {/* Modal Chốt Ca Thu Ngân Z-Report */}
      <CashierShiftReportModal
        open={shiftModalOpen}
        onClose={() => setShiftModalOpen(false)}
        receipts={filteredPayments}
      />
    </div>
  );
};

export default PaymentsTable;
