import React from 'react';
import { Modal, Button, Typography, Divider } from 'antd';
import { PrinterOutlined, CloseOutlined } from '@ant-design/icons';
import { HoaDonDetailDto } from '../types/billing.types';

const { Title, Text } = Typography;

interface InvoicePrintModalProps {
  open: boolean;
  data: HoaDonDetailDto | null;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  open,
  data,
  onClose,
}) => {
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
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const nowFormatted = () => {
    const d = new Date();
    return `Ngày ${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`;
  };

  // Convert numbers to Vietnamese words for amount
  const numberToWordsVN = (total: number): string => {
    if (!total || total === 0) return 'Không đồng';
    const units = ['', 'nghìn', 'triệu', 'tỷ'];
    const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

    const readThree = (n: number, showZero: boolean): string => {
      const c = Math.floor(n / 100);
      const b = Math.floor((n % 100) / 10);
      const a = n % 10;
      let res = '';
      if (c > 0 || showZero) {
        res += `${digits[c]} trăm `;
      }
      if (b === 0 && a > 0 && (c > 0 || showZero)) {
        res += 'lẻ ';
      } else if (b === 1) {
        res += 'mười ';
      } else if (b > 1) {
        res += `${digits[b]} mươi `;
      }
      if (a === 1 && b > 1) {
        res += 'mốt';
      } else if (a === 5 && b > 0) {
        res += 'lăm';
      } else if (a > 0) {
        res += digits[a];
      }
      return res.trim();
    };

    let s = '';
    let temp = Math.abs(Math.round(total));
    let groupIdx = 0;
    while (temp > 0) {
      const tri = temp % 1000;
      if (tri > 0) {
        const textTri = readThree(tri, temp >= 1000);
        s = `${textTri} ${units[groupIdx]} ${s}`.trim();
      }
      temp = Math.floor(temp / 1000);
      groupIdx++;
    }
    s = s.trim();
    return s.charAt(0).toUpperCase() + s.slice(1) + ' đồng';
  };

  const tongChiPhi = data?.tongTien ?? 0;
  const baoHiem = data?.soTienBaoHiemChiTra ?? 0;
  const benhNhanTra = data?.soTienBenhNhanChiTra ?? (tongChiPhi - baoHiem);
  const daThu = data?.daThanhToan ?? 0;
  const conNo = benhNhanTra - daThu;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={860}
      style={{ top: 20 }}
      title="Xem trước & In hóa đơn thanh toán"
      footer={[
        <Button key="close" icon={<CloseOutlined />} onClick={onClose}>
          Đóng
        </Button>,
        <Button
          key="print"
          type="primary"
          icon={<PrinterOutlined />}
          onClick={handlePrint}
          disabled={!data}
        >
          In hóa đơn
        </Button>,
      ]}
      styles={{
        body: { maxHeight: 'calc(100vh - 180px)', overflowY: 'auto', padding: '12px 20px' },
      }}
    >
      {data ? (
        <div id="invoice-print-document" className="invoice-print-container">
          {/* Header */}
          <div className="invoice-print-header">
            <div className="invoice-facility-info">
              <div className="invoice-upper-title">SỞ Y TẾ TP. HỒ CHÍ MINH</div>
              <div className="invoice-facility-name">PHÒNG KHÁM ĐA KHOA QUỐC TẾ</div>
              <div className="invoice-facility-meta">
                Địa chỉ: 123 Nguyễn Thị Minh Khai, Quận 1, TP. HCM | Hotline: 1900 6868
              </div>
            </div>

            <div className="invoice-code-info">
              <div>
                <Text strong>Mã HĐ:&nbsp;</Text>
                <span className="mono-code">{data.soHoaDon}</span>
              </div>
              {data.maLuotKham > 0 && (
                <div>
                  <Text strong>Lượt khám:&nbsp;</Text>
                  <span className="mono-code">#{data.maLuotKham}</span>
                </div>
              )}
              {data.maBenhNhan > 0 && (
                <div>
                  <Text strong>Mã BN:&nbsp;</Text>
                  <span className="mono-code">BN-{data.maBenhNhan.toString().padStart(5, '0')}</span>
                </div>
              )}
              <div>
                <Text strong>Ngày lập:&nbsp;</Text>
                <span>{formatDate(data.ngayLap)}</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="invoice-main-title">
            <Title
              level={3}
              style={{
                margin: 0,
                textTransform: 'uppercase',
                color: '#0b4f6c',
                fontFamily: 'Arial, sans-serif',
              }}
            >
              HÓA ĐƠN THANH TOÁN VIỆN PHÍ
            </Title>
            <div className="invoice-sub-title">
              (Liên lưu &amp; Giao cho người nộp tiền)
            </div>
          </div>

          {/* Patient info */}
          <div className="invoice-patient-box">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 24px', fontSize: 13 }}>
              <div>
                <Text>Họ và tên: </Text>
                <Text strong style={{ fontSize: 14, textTransform: 'uppercase' }}>
                  {data.tenBenhNhan || `Bệnh nhân #${data.maBenhNhan}`}
                </Text>
              </div>
              {data.maLuotKham > 0 && (
                <div>
                  <Text>Mã hồ sơ khám: </Text>
                  <Text strong>LK-{data.maLuotKham.toString().padStart(4, '0')}</Text>
                </div>
              )}
              {data.ghiChu && (
                <div style={{ width: '100%' }}>
                  <Text>Ghi chú: </Text>
                  <Text italic>{data.ghiChu}</Text>
                </div>
              )}
            </div>
          </div>

          {/* Line items table */}
          <div style={{ marginBottom: 14 }}>
            <table className="invoice-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>STT</th>
                  <th style={{ textAlign: 'left' }}>Nội dung chi phí (Thuốc / Dịch vụ kỹ thuật)</th>
                  <th style={{ width: 80 }}>Loại</th>
                  <th style={{ width: 60 }}>SL</th>
                  <th style={{ width: 110, textAlign: 'right' }}>Đơn giá</th>
                  <th style={{ width: 120, textAlign: 'right' }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {data.chiTiet && data.chiTiet.length > 0 ? (
                  data.chiTiet.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                      <td>{item.moTa}</td>
                      <td style={{ textAlign: 'center', fontSize: 11 }}>
                        {item.loaiDoiTuong === 'THUOC'
                          ? 'Thuốc'
                          : item.loaiDoiTuong === 'DICH_VU'
                          ? 'Dịch vụ'
                          : item.loaiDoiTuong === 'VAT_TU'
                          ? 'Vật tư'
                          : item.loaiDoiTuong}
                      </td>
                      <td style={{ textAlign: 'center' }}>{item.soLuong}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(item.donGia)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {formatCurrency(item.thanhTien)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: 16 }}>
                      Hóa đơn tổng hợp không liệt kê chi tiết dòng
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Financial summary */}
          <div className="invoice-summary-box">
            <div className="invoice-summary-row">
              <span>Tổng chi phí phát sinh:</span>
              <Text strong style={{ fontSize: 13 }}>{formatCurrency(tongChiPhi)}</Text>
            </div>
            {baoHiem > 0 && (
              <div className="invoice-summary-row" style={{ color: '#0284c7' }}>
                <span>BHYT / Bảo lãnh viện phí hỗ trợ chi trả:</span>
                <Text strong style={{ color: '#0284c7' }}>- {formatCurrency(baoHiem)}</Text>
              </div>
            )}
            <div className="invoice-summary-row" style={{ borderTop: '1px dashed #cbd5e1', paddingTop: 4, marginTop: 4 }}>
              <span style={{ fontWeight: 600 }}>Số tiền người bệnh phải thanh toán:</span>
              <Text strong style={{ fontSize: 14, color: '#0b4f6c' }}>{formatCurrency(benhNhanTra)}</Text>
            </div>
            <div className="invoice-summary-row">
              <span>Đã thanh toán (qua các phiếu thu):</span>
              <Text strong style={{ color: '#16a34a' }}>{formatCurrency(daThu)}</Text>
            </div>
            <div className="invoice-summary-row" style={{ borderTop: '1.5px solid #94a3b8', paddingTop: 4, marginTop: 4 }}>
              <span style={{ fontWeight: 700 }}>Số tiền còn lại (công nợ):</span>
              <Text strong style={{ fontSize: 15, color: conNo > 0 ? '#cf1322' : '#16a34a' }}>
                {formatCurrency(conNo)}
              </Text>
            </div>
            <div style={{ marginTop: 8, fontStyle: 'italic', fontSize: 12, color: '#475569' }}>
              (Bằng chữ: {numberToWordsVN(benhNhanTra)})
            </div>
          </div>

          {/* Payment receipt history if any */}
          {data.phieuThus && data.phieuThus.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4, color: '#0b4f6c' }}>
                LỊCH SỬ THU TIỀN:
              </div>
              <table className="invoice-table" style={{ fontSize: 12 }}>
                <thead>
                  <tr>
                    <th>Mã phiếu thu</th>
                    <th>Ngày thu</th>
                    <th>Phương thức</th>
                    <th>Người thu</th>
                    <th style={{ textAlign: 'right' }}>Số tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {data.phieuThus.map((p) => (
                    <tr key={p.id}>
                      <td style={{ textAlign: 'center', fontFamily: 'monospace' }}>{p.soPhieuThu}</td>
                      <td style={{ textAlign: 'center' }}>{formatDate(p.ngayThu)}</td>
                      <td style={{ textAlign: 'center' }}>{p.phuongThuc}</td>
                      <td>{p.nguoiThu || 'Thu ngân'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>
                        {formatCurrency(p.soTien)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Signatures */}
          <div className="invoice-sign-row">
            <div className="invoice-sign-block">
              <div className="invoice-sign-title">NGƯỜI NỘP TIỀN</div>
              <div style={{ fontSize: 11, color: '#6b7280', fontStyle: 'italic' }}>
                (Ký, ghi rõ họ tên)
              </div>
              <div className="invoice-sign-spacer" />
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {data.tenBenhNhan || 'Bệnh nhân / Người nhà'}
              </div>
            </div>

            <div className="invoice-sign-block">
              <div style={{ fontSize: 11, color: '#6b7280', fontStyle: 'italic', marginBottom: 2 }}>
                {nowFormatted()}
              </div>
              <div className="invoice-sign-title">THU NGÂN / KẾ TOÁN</div>
              <div style={{ fontSize: 11, color: '#6b7280', fontStyle: 'italic' }}>
                (Ký, đóng dấu, ghi rõ họ tên)
              </div>
              <div className="invoice-sign-spacer" />
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {data.phieuThus?.[data.phieuThus.length - 1]?.nguoiThu || 'Bộ phận Thu ngân'}
              </div>
            </div>
          </div>

          <Divider style={{ margin: '16px 0 6px', borderColor: '#cbd5e1' }} />
          <div style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic', textAlign: 'center' }}>
            * Quý khách vui lòng kiểm tra lại hóa đơn và các chứng từ trước khi rời khỏi quầy thu ngân.
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default InvoicePrintModal;
