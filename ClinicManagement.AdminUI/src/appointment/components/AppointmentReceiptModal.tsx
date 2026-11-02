import React from 'react';
import { Modal, Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import type { LichHenDto } from '../types/appointment.types';

interface AppointmentReceiptModalProps {
  visible: boolean;
  appointment: LichHenDto | null;
  onClose: () => void;
}

export const AppointmentReceiptModal: React.FC<AppointmentReceiptModalProps> = ({
  visible,
  appointment,
  onClose,
}) => {
  if (!appointment) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedAmount = (appointment.chiPhiGiuCho || 100000).toLocaleString('vi-VN');

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
        <Button
          key="print"
          type="primary"
          icon={<PrinterOutlined />}
          onClick={handlePrint}
          style={{ background: '#0284c7', borderColor: '#0284c7' }}
        >
          In phiếu thu (A5/A6)
        </Button>,
      ]}
      width={520}
      title="Biên lai thu tiền giữ chỗ đặt lịch"
    >
      <div className="printable-receipt">
        <div className="receipt-container">
          {/* Header */}
          <div className="receipt-header">
            <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>
              HỆ THỐNG PHÒNG KHÁM ĐA KHOA
            </div>
            <div className="receipt-sub">
              {appointment.tenCoSo || 'Cơ sở chính'} | SĐT: 1900 8888
            </div>
            <div className="receipt-title">PHIẾU THU TIỀN GIỮ CHỖ ĐẶT LỊCH</div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
              Mã phiếu: <strong>{appointment.soPhieuThu || `PT-LH${appointment.id}`}</strong>
            </div>
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="receipt-row">
              <span className="receipt-row-label">Bệnh nhân:</span>
              <span className="receipt-row-value">{appointment.tenBenhNhan}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-row-label">SĐT / CCCD:</span>
              <span className="receipt-row-value">
                {appointment.soDienThoai} {appointment.soCCCD ? `| ${appointment.soCCCD}` : ''}
              </span>
            </div>
            <div className="receipt-row">
              <span className="receipt-row-label">Bác sĩ khám:</span>
              <span className="receipt-row-value">
                {appointment.tenBacSi} {appointment.tenKhoa ? `(${appointment.tenKhoa})` : ''}
              </span>
            </div>
            <div className="receipt-row">
              <span className="receipt-row-label">Ngày khám:</span>
              <span className="receipt-row-value">{appointment.ngayHen}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-row-label">Khung giờ hẹn:</span>
              <span className="receipt-row-value">{appointment.khungGio}</span>
            </div>
            <div className="receipt-row">
              <span className="receipt-row-label">Phương thức thanh toán:</span>
              <span className="receipt-row-value" style={{ color: '#0369a1' }}>
                100% TIỀN MẶT TẠI QUẦY
              </span>
            </div>
            {appointment.tenNguoiThuTien && (
              <div className="receipt-row">
                <span className="receipt-row-label">Thu ngân tiếp nhận:</span>
                <span className="receipt-row-value">{appointment.tenNguoiThuTien}</span>
              </div>
            )}
          </div>

          {/* Amount Box */}
          <div className="receipt-amount-box">
            <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
              Số tiền thu giữ chỗ:
            </span>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#0284c7' }}>
              {formattedAmount} VNĐ
            </span>
          </div>

          {/* Non-refundable warning clause */}
          <div className="receipt-warning-clause">
            ⚠️ <strong>ĐIỀU KHOẢN QUAN TRỌNG:</strong>
            <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
              <li>
                Khoản phí đặt lịch <strong>100.000 VNĐ KHÔNG HOÀN LẠI</strong> trong mọi trường hợp hủy lịch hoặc không đến đúng hẹn (No-show).
              </li>
              <li>
                Khoản tiền này sẽ được <strong>khấu trừ 100%</strong> vào tiền công khám tại quầy tiếp đón khi bệnh nhân đến khám.
              </li>
              <li>
                Quý khách vui lòng đến trước giờ hẹn 10-15 phút để làm thủ tục tiếp nhận ưu tiên vào thẳng phòng khám.
              </li>
            </ul>
          </div>

          {/* Footer signature */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 20,
              paddingTop: 10,
              fontSize: 11,
              color: '#64748b',
              textAlign: 'center',
            }}
          >
            <div>
              <div>Người nộp tiền</div>
              <div style={{ marginTop: 36, fontStyle: 'italic' }}>
                {appointment.tenBenhNhan}
              </div>
            </div>
            <div>
              <div>Thu ngân phòng khám</div>
              <div style={{ marginTop: 36, fontStyle: 'italic', fontWeight: 600 }}>
                {appointment.tenNguoiThuTien || 'Ký và ghi rõ họ tên'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
export default AppointmentReceiptModal;
