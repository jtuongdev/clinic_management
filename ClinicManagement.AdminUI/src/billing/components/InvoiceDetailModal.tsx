import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  Button,
  Tag,
  Space,
  Typography,
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Divider,
  Spin,
  Alert,
  App,
} from 'antd';
import {
  DollarOutlined,
  PrinterOutlined,
  CloseOutlined,
  SafetyCertificateOutlined,
  StopOutlined,
  HistoryOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  HoaDonDetailDto,
  ChiTietHoaDonDto,
  PhieuThuDto,
} from '../types/billing.types';
import { billingApi } from '../api/billing.api';
import RecordPaymentModal from './RecordPaymentModal';
import ApplyInsuranceModal from './ApplyInsuranceModal';
import CancelInvoiceModal from './CancelInvoiceModal';
import InvoicePrintModal from './InvoicePrintModal';

const { Text, Title } = Typography;

interface InvoiceDetailModalProps {
  open: boolean;
  invoiceId: number | null;
  onClose: () => void;
  onInvoiceUpdated?: (updated: HoaDonDetailDto) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  open,
  invoiceId,
  onClose,
  onInvoiceUpdated,
}) => {
  const { message } = App.useApp();
  const [detail, setDetail] = useState<HoaDonDetailDto | null>(null);
  const [loading, setLoading] = useState(false);

  // Sub-modals
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [insModalOpen, setInsModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  const fetchDetail = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res = await billingApi.getInvoiceById(id);
      if (res.data.success && res.data.data) {
        setDetail(res.data.data);
      } else {
        message.error(res.data.message || 'Không tìm thấy thông tin hóa đơn');
      }
    } catch {
      message.error('Lỗi khi tải dữ liệu chi tiết hóa đơn');
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    if (open && invoiceId) {
      fetchDetail(invoiceId);
    } else {
      setDetail(null);
    }
  }, [open, invoiceId, fetchDetail]);

  const handleUpdateSuccess = (updated: HoaDonDetailDto) => {
    setDetail(updated);
    onInvoiceUpdated?.(updated);
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '0 ₫';
    return amount.toLocaleString('vi-VN') + ' ₫';
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

  const getStatusTag = (status?: string) => {
    switch (status) {
      case 'CHO_THANH_TOAN':
        return <Tag color="warning">Chờ thanh toán</Tag>;
      case 'THANH_TOAN_MOT_PHAN':
        return <Tag color="processing">Thanh toán một phần</Tag>;
      case 'DA_THANH_TOAN':
        return <Tag color="success">Đã thanh toán</Tag>;
      case 'DA_HUY':
        return <Tag color="error">Đã hủy</Tag>;
      default:
        return <Tag>{status || '--'}</Tag>;
    }
  };

  const conNo = detail
    ? detail.soTienBenhNhanChiTra - detail.daThanhToan
    : 0;

  const canPay = detail && detail.trangThai !== 'DA_HUY' && conNo > 0;
  const canCancel = detail && detail.trangThai !== 'DA_HUY' && detail.daThanhToan === 0;

  // Item columns
  const itemColumns: ColumnsType<ChiTietHoaDonDto> = [
    {
      title: 'STT',
      key: 'stt',
      width: 50,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Nội dung mục chi phí',
      dataIndex: 'moTa',
      key: 'moTa',
      render: (moTa, r) => (
        <div>
          <Text strong>{moTa}</Text>
          <div style={{ fontSize: 11, color: '#8a9fb0' }}>
            {r.loaiDoiTuong === 'THUOC'
              ? 'Thuốc / Dược phẩm'
              : r.loaiDoiTuong === 'DICH_VU'
              ? 'Dịch vụ kỹ thuật / Khám'
              : 'Vật tư y tế'}
          </div>
        </div>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'soLuong',
      key: 'soLuong',
      width: 90,
      align: 'center',
    },
    {
      title: 'Đơn giá',
      dataIndex: 'donGia',
      key: 'donGia',
      width: 120,
      align: 'right',
      render: (val) => formatCurrency(val),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'thanhTien',
      key: 'thanhTien',
      width: 140,
      align: 'right',
      render: (val) => <Text strong>{formatCurrency(val)}</Text>,
    },
  ];

  // Payment receipts columns
  const paymentColumns: ColumnsType<PhieuThuDto> = [
    {
      title: 'Mã phiếu thu',
      dataIndex: 'soPhieuThu',
      key: 'soPhieuThu',
      render: (code) => <Text strong style={{ color: '#0b4f6c' }}>{code}</Text>,
    },
    {
      title: 'Ngày thu',
      dataIndex: 'ngayThu',
      key: 'ngayThu',
      render: (d) => formatDate(d),
    },
    {
      title: 'Phương thức',
      dataIndex: 'phuongThuc',
      key: 'phuongThuc',
      render: (p) => {
        const map: Record<string, string> = {
          TIEN_MAT: 'Tiền mặt',
          CHUYEN_KHOAN: 'Chuyển khoản',
          THE: 'Thẻ POS',
          BAO_HIEM: 'Bảo lãnh',
        };
        return <Tag color="blue">{map[p] || p}</Tag>;
      },
    },
    {
      title: 'Người thu',
      dataIndex: 'nguoiThu',
      key: 'nguoiThu',
      render: (val) => val || '--',
    },
    {
      title: 'Số tiền',
      dataIndex: 'soTien',
      key: 'soTien',
      align: 'right',
      render: (val) => (
        <Text strong style={{ color: '#16a34a' }}>
          {formatCurrency(val)}
        </Text>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={900}
      style={{ top: 20 }}
      title={
        detail ? (
          <Space align="center" wrap>
            <FileTextOutlined style={{ color: '#0b4f6c' }} />
            <span>Hóa đơn {detail.soHoaDon}</span>
            {getStatusTag(detail.trangThai)}
          </Space>
        ) : (
          'Chi tiết hóa đơn'
        )
      }
      footer={[
        <Button key="close" icon={<CloseOutlined />} onClick={onClose}>
          Đóng
        </Button>,
        detail && (
          <Button
            key="print"
            icon={<PrinterOutlined />}
            onClick={() => setPrintModalOpen(true)}
          >
            In hóa đơn
          </Button>
        ),
        canCancel && (
          <Button
            key="cancel"
            danger
            icon={<StopOutlined />}
            onClick={() => setCancelModalOpen(true)}
          >
            Hủy hóa đơn
          </Button>
        ),
        detail && detail.trangThai !== 'DA_HUY' && (
          <Button
            key="insurance"
            icon={<SafetyCertificateOutlined />}
            onClick={() => setInsModalOpen(true)}
          >
            Áp dụng BHYT
          </Button>
        ),
        canPay && (
          <Button
            key="pay"
            type="primary"
            icon={<DollarOutlined />}
            style={{ background: '#16a34a' }}
            onClick={() => setPayModalOpen(true)}
          >
            Thu tiền
          </Button>
        ),
      ]}
      styles={{
        body: { maxHeight: 'calc(100vh - 160px)', overflowY: 'auto', padding: '16px 20px' },
      }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" description="Đang tải dữ liệu hóa đơn..." />
        </div>
      ) : detail ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Status Alert for canceled invoices */}
          {detail.trangThai === 'DA_HUY' && (
            <Alert
              type="error"
              showIcon
              message="Hóa đơn này đã bị hủy"
              description={detail.ghiChu ? `Lý do: ${detail.ghiChu}` : undefined}
            />
          )}

          {/* Meta header card */}
          <Card size="small">
            <Row gutter={[16, 8]}>
              <Col span={8}>
                <Text type="secondary">Bệnh nhân: </Text>
                <Text strong>{detail.tenBenhNhan || `BN #${detail.maBenhNhan}`}</Text>
              </Col>
              <Col span={8}>
                <Text type="secondary">Lượt khám: </Text>
                <Text strong>{detail.maLuotKham > 0 ? `#${detail.maLuotKham}` : '--'}</Text>
              </Col>
              <Col span={8}>
                <Text type="secondary">Ngày lập: </Text>
                <Text strong>{formatDate(detail.ngayLap)}</Text>
              </Col>
              {detail.ghiChu && (
                <Col span={24}>
                  <Text type="secondary">Ghi chú: </Text>
                  <Text>{detail.ghiChu}</Text>
                </Col>
              )}
            </Row>
          </Card>

          {/* Financial summary row */}
          <Row gutter={12}>
            <Col span={6}>
              <Card size="small" style={{ background: '#f8fafc' }}>
                <Statistic
                  title={<span style={{ fontSize: 12 }}>Tổng chi phí</span>}
                  value={detail.tongTien}
                  precision={0}
                  suffix="₫"
                  styles={{ content: { fontSize: 16, fontWeight: 700 } }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ background: '#f0f9ff' }}>
                <Statistic
                  title={<span style={{ fontSize: 12 }}>BHYT chi trả</span>}
                  value={detail.soTienBaoHiemChiTra}
                  precision={0}
                  suffix="₫"
                  styles={{ content: { fontSize: 16, color: '#0284c7', fontWeight: 700 } }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ background: '#f6ffed' }}>
                <Statistic
                  title={<span style={{ fontSize: 12 }}>Đã thanh toán</span>}
                  value={detail.daThanhToan}
                  precision={0}
                  suffix="₫"
                  styles={{ content: { fontSize: 16, color: '#16a34a', fontWeight: 700 } }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card
                size="small"
                style={{ background: conNo > 0 ? '#fff1f0' : '#f8fafc' }}
              >
                <Statistic
                  title={<span style={{ fontSize: 12 }}>Còn nợ</span>}
                  value={conNo}
                  precision={0}
                  suffix="₫"
                  styles={{
                    content: {
                      fontSize: 16,
                      color: conNo > 0 ? '#cf1322' : '#16a34a',
                      fontWeight: 700,
                    },
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* Line items section */}
          <div>
            <Title level={5} style={{ marginBottom: 8, color: '#0b4f6c' }}>
              Danh sách khoản mục chi phí ({detail.chiTiet?.length || 0})
            </Title>
            <Table<ChiTietHoaDonDto>
              rowKey={(r) => String(r.id)}
              columns={itemColumns}
              dataSource={detail.chiTiet || []}
              pagination={false}
              size="small"
              bordered
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4} align="right">
                      <Text strong>Tổng cộng:</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Text strong style={{ color: '#0b4f6c' }}>
                        {formatCurrency(detail.tongTien)}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </div>

          {/* Payment receipts section */}
          <div>
            <Title level={5} style={{ marginBottom: 8, color: '#0b4f6c' }}>
              <HistoryOutlined style={{ marginRight: 6 }} />
              Lịch sử phiếu thu tiền ({detail.phieuThus?.length || 0})
            </Title>
            <Table<PhieuThuDto>
              rowKey={(r) => String(r.id)}
              columns={paymentColumns}
              dataSource={detail.phieuThus || []}
              pagination={false}
              size="small"
              bordered
              locale={{
                emptyText: (
                  <div style={{ padding: '12px 0', color: '#94a3b8' }}>
                    Chưa có phiếu thu nào được ghi nhận
                  </div>
                ),
              }}
            />
          </div>
        </div>
      ) : null}

      {/* Sub-modals */}
      <RecordPaymentModal
        open={payModalOpen}
        invoice={detail}
        onClose={() => setPayModalOpen(false)}
        onSuccess={handleUpdateSuccess}
      />

      <ApplyInsuranceModal
        open={insModalOpen}
        invoice={detail}
        onClose={() => setInsModalOpen(false)}
        onSuccess={handleUpdateSuccess}
      />

      <CancelInvoiceModal
        open={cancelModalOpen}
        invoice={detail}
        onClose={() => setCancelModalOpen(false)}
        onSuccess={handleUpdateSuccess}
      />

      <InvoicePrintModal
        open={printModalOpen}
        data={detail}
        onClose={() => setPrintModalOpen(false)}
      />
    </Modal>
  );
};

export default InvoiceDetailModal;
