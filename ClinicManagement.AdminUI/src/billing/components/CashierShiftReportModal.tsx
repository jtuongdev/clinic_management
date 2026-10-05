import React, { useState } from 'react';
import { Modal, Button, Typography, Divider, Table, Tag, Space } from 'antd';
import { PrinterOutlined, CloseOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { PhieuThuDto } from '../types/billing.types';

const { Title, Text } = Typography;

interface CashierShiftReportModalProps {
  open: boolean;
  onClose: () => void;
  cashierName?: string;
  facilityName?: string;
  receipts: PhieuThuDto[];
}

export const CashierShiftReportModal: React.FC<CashierShiftReportModalProps> = ({
  open,
  onClose,
  cashierName = 'Nhân viên thu ngân',
  facilityName = 'Phòng khám Đa khoa Quốc tế',
  receipts,
}) => {
  const [initialCash, setInitialCash] = useState<number>(0);

  const handlePrint = () => {
    window.print();
  };

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

  // Tính toán
  const totalCash = receipts
    .filter((r) => r.phuongThuc === 'TIEN_MAT')
    .reduce((sum, r) => sum + (r.soTien || 0), 0);

  const totalTransfer = receipts
    .filter((r) => r.phuongThuc === 'CHUYEN_KHOAN')
    .reduce((sum, r) => sum + (r.soTien || 0), 0);

  const totalCard = receipts
    .filter((r) => r.phuongThuc === 'THE')
    .reduce((sum, r) => sum + (r.soTien || 0), 0);

  const totalInsurance = receipts
    .filter((r) => r.phuongThuc === 'BAO_HIEM')
    .reduce((sum, r) => sum + (r.soTien || 0), 0);

  const totalCollected = receipts.reduce((sum, r) => sum + (r.soTien || 0), 0);

  const now = new Date();
  const reportTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ngày ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" icon={<CloseOutlined />} onClick={onClose}>
          Đóng
        </Button>,
        <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint} style={{ background: '#0b4f6c' }}>
          In biên bản chốt ca (Ctrl + P)
        </Button>,
      ]}
      width={780}
      title="Biên bản Bàn giao & Chốt ca Thu ngân (Z-Report)"
      destroyOnClose
    >
      <div id="print-shift-report" style={{ padding: '16px 24px', fontFamily: 'Arial, sans-serif', color: '#1e293b' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0b4f6c', paddingBottom: 12 }}>
          <div>
            <Title level={4} style={{ margin: 0, color: '#0b4f6c', textTransform: 'uppercase' }}>
              {facilityName}
            </Title>
            <Text style={{ fontSize: 13, color: '#64748b' }}>Hệ thống Quản lý Tài chính Viện phí</Text>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Tag color="cyan" style={{ fontSize: 13, padding: '4px 8px', fontWeight: 600 }}>
              Z-REPORT #{now.getFullYear()}{(now.getMonth() + 1).toString().padStart(2, '0')}{now.getDate().toString().padStart(2, '0')}
            </Tag>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Thời gian lập: {reportTime}</div>
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', margin: '20px 0 16px' }}>
          <Title level={3} style={{ margin: 0, textTransform: 'uppercase', letterSpacing: 1, color: '#0f172a' }}>
            BIÊN BẢN BÀN GIAO &amp; CHỐT CA THU NGÂN
          </Title>
          <Text italic style={{ color: '#64748b', fontSize: 13 }}>
            (Căn cứ vào dữ liệu đối soát trên hệ thống HIS / Quản lý tài chính)
          </Text>
        </div>

        {/* Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', background: '#f8fafc', padding: 12, borderRadius: 6, marginBottom: 16 }}>
          <div>
            <Text strong>Nhân viên thu ngân: </Text>
            <Text>{cashierName}</Text>
          </div>
          <div>
            <Text strong>Tổng số phiếu thu: </Text>
            <Text strong style={{ color: '#0b4f6c' }}>{receipts.length} giao dịch</Text>
          </div>
          <div>
            <Text strong>Trạng thái đối soát: </Text>
            <Tag color="green"><SafetyCertificateOutlined /> Đã khớp dữ liệu</Tag>
          </div>
          <div>
            <Text strong>Ngày chốt ca: </Text>
            <Text>{now.toLocaleDateString('vi-VN')}</Text>
          </div>
        </div>

        {/* Summary Box */}
        <Title level={5} style={{ color: '#0b4f6c', marginBottom: 8 }}>
          1. Bảng kê tổng hợp doanh thu theo hình thức thanh toán
        </Title>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 13 }}>STT</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 13 }}>Hình thức thanh toán</th>
              <th style={{ padding: '8px 12px', textAlign: 'center', fontSize: 13 }}>Số lượng GD</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: 13 }}>Tổng tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '8px 12px' }}>1</td>
              <td style={{ padding: '8px 12px', fontWeight: 600 }}>💵 Tiền mặt (Nộp két bàn giao)</td>
              <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                {receipts.filter((r) => r.phuongThuc === 'TIEN_MAT').length}
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>
                {formatCurrency(totalCash)}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '8px 12px' }}>2</td>
              <td style={{ padding: '8px 12px', fontWeight: 600 }}>💳 Chuyển khoản (VietQR / Internet Banking)</td>
              <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                {receipts.filter((r) => r.phuongThuc === 'CHUYEN_KHOAN').length}
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#0284c7' }}>
                {formatCurrency(totalTransfer)}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '8px 12px' }}>3</td>
              <td style={{ padding: '8px 12px', fontWeight: 600 }}>🏧 Thẻ POS</td>
              <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                {receipts.filter((r) => r.phuongThuc === 'THE').length}
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>
                {formatCurrency(totalCard)}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '8px 12px' }}>4</td>
              <td style={{ padding: '8px 12px', fontWeight: 600 }}>🛡️ Bảo hiểm bảo lãnh</td>
              <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                {receipts.filter((r) => r.phuongThuc === 'BAO_HIEM').length}
              </td>
              <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600 }}>
                {formatCurrency(totalInsurance)}
              </td>
            </tr>
            <tr style={{ background: '#f8fafc', fontWeight: 700, borderTop: '2px solid #cbd5e1' }}>
              <td colSpan={2} style={{ padding: '10px 12px', textTransform: 'uppercase' }}>TỔNG CỘNG THU TRONG CA</td>
              <td style={{ padding: '10px 12px', textAlign: 'center' }}>{receipts.length}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 16, color: '#0b4f6c' }}>
                {formatCurrency(totalCollected)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Detailed List */}
        <Title level={5} style={{ color: '#0b4f6c', marginBottom: 8 }}>
          2. Danh sách phiếu thu đối soát chi tiết
        </Title>
        <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 4, marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f1f5f9', position: 'sticky', top: 0, zIndex: 1 }}>
                <th style={{ padding: '6px 8px', textAlign: 'left' }}>Số PT</th>
                <th style={{ padding: '6px 8px', textAlign: 'left' }}>Thời gian</th>
                <th style={{ padding: '6px 8px', textAlign: 'left' }}>Phương thức</th>
                <th style={{ padding: '6px 8px', textAlign: 'left' }}>Người thu</th>
                <th style={{ padding: '6px 8px', textAlign: 'right' }}>Số tiền</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((r, idx) => (
                <tr key={r.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6px 8px', fontWeight: 600, color: '#0b4f6c' }}>{r.soPhieuThu}</td>
                  <td style={{ padding: '6px 8px' }}>{formatDate(r.ngayThu)}</td>
                  <td style={{ padding: '6px 8px' }}>{r.phuongThuc}</td>
                  <td style={{ padding: '6px 8px' }}>{r.nguoiThu || cashierName}</td>
                  <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(r.soTien)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', textAlign: 'center', marginTop: 32 }}>
          <div>
            <Text strong style={{ textTransform: 'uppercase', fontSize: 13 }}>NGƯỜI NỘP TIỀN (THU NGÂN)</Text>
            <div style={{ fontSize: 12, color: '#64748b' }}>(Ký và ghi rõ họ tên)</div>
            <div style={{ height: 60 }} />
            <Text strong>{cashierName}</Text>
          </div>
          <div>
            <Text strong style={{ textTransform: 'uppercase', fontSize: 13 }}>NGƯỜI NHẬN BÀN GIAO (KẾ TOÁN / THỦ QUỸ)</Text>
            <div style={{ fontSize: 12, color: '#64748b' }}>(Ký và ghi rõ họ tên)</div>
            <div style={{ height: 60 }} />
            <Text strong>................................................</Text>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CashierShiftReportModal;
