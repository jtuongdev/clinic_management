import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Tooltip,
  Alert,
  Empty,
  Spin,
} from 'antd';
import {
  PrinterOutlined,
  DollarOutlined,
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
import RecordPaymentModal from './RecordPaymentModal';
import ApplyInsuranceModal from './ApplyInsuranceModal';
import CancelInvoiceModal from './CancelInvoiceModal';
import InvoicePrintModal from './InvoicePrintModal';

export interface InvoiceDetailViewProps {
  invoice: HoaDonDetailDto | null;
  loading: boolean;
  onInvoiceUpdated?: (updated: HoaDonDetailDto) => void;
  onPaymentSuccess?: () => void;
}

const statusBadgeConfig: Record<string, { color: string; bg: string; text: string; border: string }> = {
  CHO_THANH_TOAN: {
    color: '#713F12',
    bg: '#FEFCE8',
    text: 'Chờ thanh toán',
    border: '#EAB308',
  },
  THANH_TOAN_MOT_PHAN: {
    color: '#0369A1',
    bg: '#F0F9FF',
    text: 'Thanh toán 1 phần',
    border: '#BAE6FD',
  },
  DA_THANH_TOAN: {
    color: '#14532D',
    bg: '#F0FDF4',
    text: 'Đã thanh toán',
    border: '#86EFAC',
  },
  DA_HUY: {
    color: '#374151',
    bg: '#F3F4F6',
    text: 'Đã hủy',
    border: '#D1D5DB',
  },
};

export const InvoiceDetailView: React.FC<InvoiceDetailViewProps> = ({
  invoice,
  loading,
  onInvoiceUpdated,
  onPaymentSuccess,
}) => {
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [insModalOpen, setInsModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '0 ₫';
    return amount.toLocaleString('vi-VN') + ' ₫';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="invoice-detail-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" description="Đang tải dữ liệu hóa đơn..." />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="invoice-detail-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <Empty
          image={<FileTextOutlined style={{ fontSize: 44, color: '#94a3b8' }} />}
          description={
            <div>
              <div style={{ fontWeight: 600, fontSize: 13.5, color: '#334155', marginTop: 8 }}>
                Chưa chọn hóa đơn viện phí
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, maxWidth: 320 }}>
                Chọn một dòng trong danh sách bên trái để đối soát viện phí, thu tiền hoặc in hóa đơn.
              </div>
            </div>
          }
        />
      </div>
    );
  }

  const conNo = invoice ? Math.max(0, invoice.soTienBenhNhanChiTra - invoice.daThanhToan) : 0;
  const canPay = invoice && invoice.trangThai !== 'DA_HUY' && conNo > 0;
  const canCancel = invoice && invoice.trangThai !== 'DA_HUY' && invoice.daThanhToan === 0;

  const statusCfg = statusBadgeConfig[invoice.trangThai] ?? {
    color: '#374151',
    bg: '#F3F4F6',
    text: invoice.trangThai,
    border: '#D1D5DB',
  };

  const itemColumns: ColumnsType<ChiTietHoaDonDto> = [
    {
      title: 'STT',
      key: 'stt',
      width: 45,
      align: 'center',
      render: (_, __, i) => <span style={{ color: '#64748b', fontSize: 11.5 }}>{i + 1}</span>,
    },
    {
      title: 'Khoản mục chi phí / Dịch vụ',
      dataIndex: 'moTa',
      key: 'moTa',
      minWidth: 180,
      render: (moTa, r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 12.5, color: '#0f172a' }}>{moTa}</div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
            Phân loại:{' '}
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
      width: 75,
      align: 'center',
      render: (val: number) => (
        <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 600, fontSize: 12 }}>
          {val}
        </span>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'donGia',
      key: 'donGia',
      width: 110,
      align: 'right',
      render: (val: number) => (
        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#334155' }}>
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      title: 'Thành tiền',
      dataIndex: 'thanhTien',
      key: 'thanhTien',
      width: 125,
      align: 'right',
      render: (val: number) => (
        <span
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 700,
            fontSize: 12,
            color: '#0f172a',
          }}
        >
          {formatCurrency(val)}
        </span>
      ),
    },
  ];

  const paymentColumns: ColumnsType<PhieuThuDto> = [
    {
      title: 'Mã phiếu thu',
      dataIndex: 'soPhieuThu',
      key: 'soPhieuThu',
      width: 120,
      render: (code) => (
        <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: '#0284c7', fontSize: 11.5 }}>
          {code}
        </span>
      ),
    },
    {
      title: 'Ngày thu',
      dataIndex: 'ngayThu',
      key: 'ngayThu',
      width: 110,
      render: (d) => (
        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11.5, color: '#475569' }}>
          {formatDate(d)}
        </span>
      ),
    },
    {
      title: 'Phương thức',
      dataIndex: 'phuongThuc',
      key: 'phuongThuc',
      width: 105,
      render: (p) => {
        const map: Record<string, string> = {
          TIEN_MAT: 'Tiền mặt',
          CHUYEN_KHOAN: 'Chuyển khoản',
          THE: 'Thẻ POS',
          BAO_HIEM: 'Bảo lãnh',
        };
        return (
          <span style={{ fontSize: 11, background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '1px 6px', borderRadius: 3, fontWeight: 500 }}>
            {map[p] || p}
          </span>
        );
      },
    },
    {
      title: 'Người thu',
      dataIndex: 'nguoiThu',
      key: 'nguoiThu',
      render: (val) => <span style={{ fontSize: 12, color: '#334155' }}>{val || '--'}</span>,
    },
    {
      title: 'Số tiền',
      dataIndex: 'soTien',
      key: 'soTien',
      width: 120,
      align: 'right',
      render: (val) => (
        <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: '#16a34a', fontSize: 12 }}>
          {formatCurrency(val)}
        </span>
      ),
    },
  ];

  return (
    <div className="invoice-detail-panel">
      {/* Detail Header */}
      <div className="invoice-detail-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 15, fontFamily: 'ui-monospace, monospace' }}>
            Hóa đơn #{invoice.soHoaDon}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 8px',
              borderRadius: 3,
              fontSize: 11.5,
              fontWeight: 600,
              color: statusCfg.color,
              background: statusCfg.bg,
              border: `1px solid ${statusCfg.border}`,
            }}
          >
            {statusCfg.text}
          </span>
          {invoice.maLuotKham > 0 && (
            <Tag style={{ margin: 0, fontSize: 11.5, background: '#F9FAFB', borderColor: '#E5E7EB', color: '#475569', borderRadius: 3 }}>
              Lượt khám #{invoice.maLuotKham}
            </Tag>
          )}
        </div>

        {/* Corporate Action Buttons */}
        <Space size="small">
          <Tooltip title="In hóa đơn viện phí tiêu chuẩn A4">
            <Button
              size="small"
              icon={<PrinterOutlined />}
              onClick={() => setPrintModalOpen(true)}
              className="corporate-action-btn"
              style={{ fontSize: 12, height: 28 }}
            >
              In hóa đơn
            </Button>
          </Tooltip>

          {invoice.trangThai !== 'DA_HUY' && (
            <Button
              size="small"
              icon={<SafetyCertificateOutlined />}
              onClick={() => setInsModalOpen(true)}
              className="corporate-action-btn"
              style={{ fontSize: 12, height: 28 }}
            >
              Áp dụng BHYT
            </Button>
          )}

          {canCancel && (
            <Button
              size="small"
              danger
              icon={<StopOutlined />}
              onClick={() => setCancelModalOpen(true)}
              className="corporate-cancel-btn"
              style={{ fontSize: 12, height: 28, fontWeight: 500 }}
            >
              Hủy hóa đơn
            </Button>
          )}

          {canPay && (
            <Button
              size="small"
              type="primary"
              icon={<DollarOutlined />}
              onClick={() => setPayModalOpen(true)}
              style={{ fontSize: 12, height: 28, background: '#16a34a', borderColor: '#16a34a', fontWeight: 600 }}
            >
              Thu tiền ngay
            </Button>
          )}
        </Space>
      </div>

      {/* Detail Body */}
      <div className="invoice-detail-body">
        {invoice.trangThai === 'DA_HUY' && (
          <Alert
            type="error"
            showIcon
            message="Hóa đơn này đã bị hủy"
            description={invoice.ghiChu ? `Lý do: ${invoice.ghiChu}` : undefined}
            style={{ borderRadius: 6, flexShrink: 0 }}
          />
        )}

        {/* CHỨNG TỪ & HÀNH CHÍNH (3-Column Grid) */}
        <div
          style={{
            background: '#ffffff',
            padding: '12px 14px',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>THÔNG TIN CHỨNG TỪ & BỆNH NHÂN</span>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 400, textTransform: 'none' }}>
              Mã hồ sơ: <strong style={{ color: '#334155' }}>#{invoice.maBenhNhan}</strong>
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              columnGap: 24,
              rowGap: 8,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: '10px 14px',
              fontSize: 12,
            }}
          >
            <div>
              <span style={{ color: '#64748b', marginRight: 6 }}>Số hóa đơn:</span>
              <span style={{ color: '#0F172A', fontFamily: 'ui-monospace, monospace', fontWeight: 700 }}>
                {invoice.soHoaDon}
              </span>
            </div>

            <div>
              <span style={{ color: '#64748b', marginRight: 6 }}>Bệnh nhân:</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>
                {invoice.tenBenhNhan || `BN #${invoice.maBenhNhan}`}
              </span>
            </div>

            <div>
              <span style={{ color: '#64748b', marginRight: 6 }}>Ngày lập HĐ:</span>
              <span style={{ color: '#1e293b', fontFamily: 'ui-monospace, monospace' }}>
                {formatDate(invoice.ngayLap)}
              </span>
            </div>

            <div>
              <span style={{ color: '#64748b', marginRight: 6 }}>Lượt khám:</span>
              <span style={{ color: '#0284c7', fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}>
                {invoice.maLuotKham > 0 ? `#${invoice.maLuotKham}` : '---'}
              </span>
            </div>

            <div>
              <span style={{ color: '#64748b', marginRight: 6 }}>Trạng thái:</span>
              <span style={{ fontWeight: 600, color: statusCfg.color }}>
                {statusCfg.text}
              </span>
            </div>

            <div>
              <span style={{ color: '#64748b', marginRight: 6 }}>BHYT áp dụng:</span>
              <span style={{ color: invoice.soTienBaoHiemChiTra > 0 ? '#0284c7' : '#94a3b8', fontWeight: 600 }}>
                {invoice.soTienBaoHiemChiTra > 0 ? formatCurrency(invoice.soTienBaoHiemChiTra) : 'Không có'}
              </span>
            </div>

            {invoice.ghiChu && (
              <div style={{ gridColumn: 'span 3', borderTop: '1px dashed #e2e8f0', paddingTop: 6, marginTop: 2 }}>
                <span style={{ color: '#64748b', marginRight: 6 }}>Ghi chú:</span>
                <span style={{ color: '#475569', fontStyle: 'italic' }}>{invoice.ghiChu}</span>
              </div>
            )}
          </div>
        </div>

        {/* 4 Financial KPI Mini-Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 6, padding: '8px 12px' }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>TỔNG CHI PHÍ</div>
            <div style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, fontSize: 14.5, color: '#0f172a', marginTop: 2 }}>
              {formatCurrency(invoice.tongTien)}
            </div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #bae6fd', borderRadius: 6, padding: '8px 12px' }}>
            <div style={{ fontSize: 11, color: '#0284c7', fontWeight: 500 }}>BHYT CHI TRẢ</div>
            <div style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, fontSize: 14.5, color: '#0284c7', marginTop: 2 }}>
              {formatCurrency(invoice.soTienBaoHiemChiTra)}
            </div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: 6, padding: '8px 12px' }}>
            <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 500 }}>ĐÃ THANH TOÁN</div>
            <div style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, fontSize: 14.5, color: '#16a34a', marginTop: 2 }}>
              {formatCurrency(invoice.daThanhToan)}
            </div>
          </div>
          <div style={{ background: conNo > 0 ? '#fff1f2' : '#ffffff', border: `1px solid ${conNo > 0 ? '#fecdd3' : '#e2e8f0'}`, borderRadius: 6, padding: '8px 12px' }}>
            <div style={{ fontSize: 11, color: conNo > 0 ? '#e11d48' : '#64748b', fontWeight: 500 }}>CÒN PHẢI THU</div>
            <div style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 800, fontSize: 14.5, color: conNo > 0 ? '#e11d48' : '#16a34a', marginTop: 2 }}>
              {invoice.trangThai === 'DA_HUY' ? '--' : formatCurrency(conNo)}
            </div>
          </div>
        </div>

        {/* Line Items Table (Flex-1, Scrollable) */}
        <div
          style={{
            background: '#ffffff',
            padding: '12px 14px',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
              DANH SÁCH KHOẢN MỤC CHI PHÍ ({invoice.chiTiet?.length || 0})
            </span>
            <span style={{ fontSize: 11.5, color: '#64748b' }}>
              Tổng cộng:{' '}
              <strong style={{ color: '#0f172a', fontFamily: 'ui-monospace, monospace' }}>
                {formatCurrency(invoice.tongTien)}
              </strong>
            </span>
          </div>

          <div style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
            <Table<ChiTietHoaDonDto>
              className="drawer-detail-table"
              rowKey={(r) => String(r.id)}
              columns={itemColumns}
              dataSource={invoice.chiTiet || []}
              pagination={false}
              size="small"
              bordered
              scroll={{ x: 650, y: 220 }}
              locale={{
                emptyText: (
                  <div style={{ padding: '20px 0', color: '#94a3b8' }}>
                    Không có khoản mục chi phí nào
                  </div>
                ),
              }}
            />
          </div>
        </div>

        {/* Payment Receipts History */}
        <div
          style={{
            background: '#ffffff',
            padding: '12px 14px',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.3px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <HistoryOutlined style={{ color: '#0284c7' }} />
              LỊCH SỬ PHIẾU THU TIỀN ({invoice.phieuThus?.length || 0})
            </span>
            <span style={{ fontSize: 11.5, color: '#16a34a', fontWeight: 600 }}>
              Đã thu: {formatCurrency(invoice.daThanhToan)}
            </span>
          </div>

          <Table<PhieuThuDto>
            className="drawer-detail-table"
            rowKey={(r) => String(r.id)}
            columns={paymentColumns}
            dataSource={invoice.phieuThus || []}
            pagination={false}
            size="small"
            bordered
            scroll={{ x: 550 }}
            locale={{
              emptyText: (
                <div style={{ padding: '12px 0', color: '#94a3b8', fontSize: 12 }}>
                  Chưa có phiếu thu nào được ghi nhận cho hóa đơn này
                </div>
              ),
            }}
          />
        </div>
      </div>

      {/* Detail Footer */}
      <div className="invoice-detail-footer">
        <div>
          <div style={{ fontSize: 12, color: '#334155' }}>
            BN: <strong>{invoice.tenBenhNhan || `BN #${invoice.maBenhNhan}`}</strong> • Khoản mục: <strong>{invoice.chiTiet?.length || 0}</strong>
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
            Đã thanh toán: <strong style={{ color: '#16a34a' }}>{formatCurrency(invoice.daThanhToan)}</strong> • Trạng thái: <strong>{statusCfg.text}</strong>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>CÒN LẠI CẦN THU:</div>
          <div
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontVariantNumeric: 'tabular-nums',
              fontSize: 16,
              fontWeight: 800,
              color: conNo > 0 ? '#e11d48' : '#16a34a',
            }}
          >
            {invoice.trangThai === 'DA_HUY' ? '--' : formatCurrency(conNo)}
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      <RecordPaymentModal
        open={payModalOpen}
        invoice={invoice}
        onClose={() => setPayModalOpen(false)}
        onSuccess={(updated) => {
          onInvoiceUpdated?.(updated);
          onPaymentSuccess?.();
        }}
      />

      <ApplyInsuranceModal
        open={insModalOpen}
        invoice={invoice}
        onClose={() => setInsModalOpen(false)}
        onSuccess={(updated) => onInvoiceUpdated?.(updated)}
      />

      <CancelInvoiceModal
        open={cancelModalOpen}
        invoice={invoice}
        onClose={() => setCancelModalOpen(false)}
        onSuccess={(updated) => onInvoiceUpdated?.(updated)}
      />

      <InvoicePrintModal
        open={printModalOpen}
        data={invoice}
        onClose={() => setPrintModalOpen(false)}
      />
    </div>
  );
};

export default InvoiceDetailView;
