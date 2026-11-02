import React from 'react';
import { Modal, Button, Typography, Divider } from 'antd';
import { PrinterOutlined, CloseOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { PrescriptionPrintDto } from '../types/inventory.types';

const { Title, Text } = Typography;

interface PrescriptionPrintModalProps {
  open: boolean;
  data: PrescriptionPrintDto | null;
  loading?: boolean;
  onClose: () => void;
}

export const PrescriptionPrintModal: React.FC<PrescriptionPrintModalProps> = ({
  open,
  data,
  loading = false,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '--';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  /** Ngày hiện tại định dạng VN */
  const todayFormatted = () =>
    new Date().toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={860}
      style={{ top: 20 }}
      loading={loading}
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0b4f6c' }}>
          <MedicineBoxOutlined />
          Xem trước &amp; In đơn thuốc
        </span>
      }
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
          In đơn thuốc
        </Button>,
      ]}
      styles={{
        body: { maxHeight: 'calc(100vh - 180px)', overflowY: 'auto', padding: '12px 20px' },
      }}
    >
      {data ? (
        <div id="prescription-print-document" className="prescription-print-container">

          {/* ── HEADER: SYT / Cơ sở (trái) — Mã đơn / BN / LK (phải) ── */}
          <div className="print-header">
            <div className="print-facility-info">
              <div className="print-upper-title">
                {data.header?.soYTe || 'SỞ Y TẾ TP. HỒ CHÍ MINH'}
              </div>
              <div className="print-facility-name">
                {data.header?.coSo?.ten || 'PHÒNG KHÁM ĐA KHOA'}
              </div>
              <div className="print-facility-meta">
                {data.header?.coSo?.diaChi && <span>{data.header.coSo.diaChi}</span>}
                {data.header?.coSo?.hotline && (
                  <span>&nbsp;|&nbsp;☎ {data.header.coSo.hotline}</span>
                )}
              </div>
            </div>

            <div className="print-code-info">
              <div>
                <Text strong>Mã đơn:&nbsp;</Text>
                <span className="mono-code">{data.header?.maDonThuoc || '--'}</span>
              </div>
              <div>
                <Text strong>Mã LK:&nbsp;</Text>
                <span className="mono-code">{data.header?.maLuotKham || '--'}</span>
              </div>
              <div>
                <Text strong>Mã BN:&nbsp;</Text>
                <span className="mono-code">{data.header?.maBenhNhan || '--'}</span>
              </div>
            </div>
          </div>

          {/* ── TIÊU ĐỀ ── */}
          <div className="print-main-title">
            <Title
              level={3}
              style={{ margin: 0, textTransform: 'uppercase', color: '#0b4f6c', fontFamily: 'Arial, sans-serif' }}
            >
              {data.header?.tieuDe || 'PHIẾU CẤP PHÁT THUỐC'}
            </Title>
            {data.header?.phuDe && (
              <div className="print-sub-title">{data.header.phuDe}</div>
            )}
          </div>

          {/* ── THÔNG TIN BỆNH NHÂN ── */}
          <div className="print-section print-patient-box">
            {/* Hàng 1: Họ tên | Tuổi | Giới tính */}
            <div className="print-grid-row">
              <div className="print-grid-col col-6">
                <Text>Họ và tên: </Text>
                <Text strong style={{ fontSize: 14, textTransform: 'uppercase' }}>
                  {data.benhNhan?.hoTen || '--'}
                </Text>
              </div>
              <div className="print-grid-col col-3">
                <Text>Tuổi: </Text>
                <Text strong>{data.benhNhan?.tuoi ?? '--'}</Text>
              </div>
              <div className="print-grid-col col-3">
                <Text>Giới tính: </Text>
                <Text strong>{data.benhNhan?.gioiTinh || '--'}</Text>
              </div>
            </div>

            {/* Hàng 2: CCCD / BHYT | Điện thoại */}
            <div className="print-grid-row">
              <div className="print-grid-col col-6">
                <Text>CCCD / BHYT: </Text>
                <Text strong>{data.benhNhan?.soCccdBhyt || '--'}</Text>
              </div>
              <div className="print-grid-col col-6">
                <Text>Điện thoại: </Text>
                <Text strong>{data.benhNhan?.dienThoai || '--'}</Text>
              </div>
            </div>

            {/* Hàng 3: Địa chỉ */}
            <div className="print-grid-row">
              <div className="print-grid-col col-12">
                <Text>Địa chỉ: </Text>
                <Text>{data.benhNhan?.diaChi || '--'}</Text>
              </div>
            </div>

            {/* Hàng 4: Chẩn đoán */}
            <div className="print-grid-row print-diagnosis-row">
              <div className="print-grid-col col-12">
                <Text>Chẩn đoán: </Text>
                <Text strong>
                  {data.chanDoan?.tenChanDoan || '--'}
                  {(data.chanDoan?.maICD || data.chanDoan?.maIcd) && (
                    <span style={{ color: '#0284c7', marginLeft: 6, fontWeight: 400 }}>
                      (ICD: {data.chanDoan.maICD || data.chanDoan.maIcd})
                    </span>
                  )}
                </Text>
              </div>
            </div>
          </div>

          {/* ── DANH SÁCH THUỐC CẤP PHÁT ── */}
          <div className="print-section print-items-section">
            <div className="print-section-title">DANH SÁCH THUỐC CẤP PHÁT</div>
            <table className="print-table">
              <thead>
                <tr>
                  <th style={{ width: 36, textAlign: 'center' }}>STT</th>
                  <th style={{ textAlign: 'left' }}>Tên thuốc — Hàm lượng — Cách dùng</th>
                  <th style={{ width: 80, textAlign: 'center' }}>Dạng BC</th>
                  <th style={{ width: 60, textAlign: 'center' }}>SL</th>
                  <th style={{ width: 52, textAlign: 'center' }}>ĐVT</th>
                  <th style={{ width: 162, textAlign: 'left' }}>Lô &amp; HSD (FEFO)</th>
                </tr>
              </thead>
              <tbody>
                {data.danhSachThuoc?.map((item) => (
                  <tr key={item.stt ?? item.maThuoc}>
                    <td style={{ textAlign: 'center', verticalAlign: 'top' }}>{item.stt}</td>
                    <td>
                      <div className="item-name-row">
                        <Text strong style={{ fontSize: 13 }}>{item.tenThuoc}</Text>
                        <span className="item-code">({item.maThuoc})</span>
                      </div>
                      {item.cachDung && (
                        <div className="item-usage-instruction">
                          ↳ {item.cachDung}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', verticalAlign: 'top' }}>
                      {item.dangBaoChe || '--'}
                    </td>
                    <td style={{ textAlign: 'center', verticalAlign: 'top' }}>
                      <Text strong style={{ fontSize: 13 }}>{item.soLuong}</Text>
                      {item.soLuongChu && (
                        <div style={{ fontSize: 10, color: '#6b7280', fontStyle: 'italic' }}>
                          ({item.soLuongChu})
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', verticalAlign: 'top' }}>{item.donViTinh}</td>
                    <td style={{ verticalAlign: 'top' }}>
                      {item.loHang && item.loHang.length > 0 ? (
                        <div className="batch-alloc-list">
                          {item.loHang.map((batch, bIdx) => (
                            <div key={bIdx} className="batch-alloc-item">
                              <span className="batch-number">Lô: {batch.soLo}</span>
                              <span className="batch-exp"> HSD: {formatDate(batch.hanSuDung)}</span>
                              <span className="batch-qty"> ×{batch.soLuong} {item.donViTinh}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Text type="secondary" style={{ fontSize: 11 }}>--</Text>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── LỜI DẶN CỦA BÁC SĨ ── */}
          {data.loiDan && data.loiDan.length > 0 && (
            <div className="print-section print-advice-box">
              <Text strong>Lời dặn của bác sĩ:</Text>
              <ul className="advice-list">
                {data.loiDan.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ── CHỮ KÝ XÁC NHẬN: 3 cột (Dược sĩ | Người nhận | Bác sĩ) ── */}
          <div className="print-section print-signature-section">
            <div className="print-signature-row">

              {/* Cột 1 — Dược sĩ phát thuốc */}
              <div className="print-sign-block">
                <div className="sign-title">DƯỢC SĨ PHÁT THUỐC</div>
                {/* Hiện trên màn hình */}
                <div style={{ marginTop: 4 }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    background: '#f6ffed',
                    border: '1px solid #b7eb8f',
                    borderRadius: 4,
                    color: '#389e0d',
                    fontSize: 12,
                  }}>
                    {data.xacNhan?.duocSiPhatThuoc?.trangThaiCapPhat || 'ĐÃ CẤP PHÁT'}
                  </span>
                </div>
                {/* Thay thế khi in (CSS ẩn trên screen, hiện khi print) */}
                <div className="sign-status-text" style={{ display: 'none' }}>
                  ({data.xacNhan?.duocSiPhatThuoc?.trangThaiCapPhat || 'Đã cấp phát'})
                </div>
                <div className="sign-spacer" />
                <div className="sign-name">
                  <Text strong>{data.xacNhan?.duocSiPhatThuoc?.hoTen || '---'}</Text>
                </div>
              </div>

              {/* Cột 2 — Người nhận thuốc */}
              <div className="print-sign-block">
                <div className="sign-date">Ngày cấp phát: {todayFormatted()}</div>
                <div className="sign-title">NGƯỜI NHẬN THUỐC</div>
                <div className="sign-spacer" />
                <div className="sign-name">
                  <Text style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>
                    (Ký, ghi rõ họ tên)
                  </Text>
                </div>
              </div>

              {/* Cột 3 — Bác sĩ kê đơn */}
              <div className="print-sign-block">
                <div className="sign-date">
                  Ngày kê đơn: {formatDate(data.xacNhan?.ngayKe)}
                </div>
                <div className="sign-title">BÁC SĨ KÊ ĐƠN</div>
                <div className="sign-spacer" />
                <div className="sign-name">
                  <Text strong>{data.xacNhan?.bacSiKeDon?.hoTen || '---'}</Text>
                  {(data.xacNhan?.bacSiKeDon?.maCCHN || data.xacNhan?.bacSiKeDon?.maCchn) && (
                    <div className="sign-cchn">
                      CCHN: {data.xacNhan?.bacSiKeDon?.maCCHN || data.xacNhan?.bacSiKeDon?.maCchn}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* ── GHI CHÚ CHÂN TRANG ── */}
          {data.ghiChuChanTrang && data.ghiChuChanTrang.length > 0 && (
            <div className="print-footer-notes">
              <Divider style={{ margin: '10px 0 6px', borderColor: '#cbd5e1' }} />
              {data.ghiChuChanTrang.map((footerNote, fIdx) => (
                <div key={fIdx} className="footer-note-line">* {footerNote}</div>
              ))}
            </div>
          )}

        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
          <MedicineBoxOutlined style={{ fontSize: 52, marginBottom: 14 }} />
          <div style={{ fontSize: 14 }}>Không có dữ liệu đơn thuốc để xem trước</div>
        </div>
      )}
    </Modal>
  );
};

export default PrescriptionPrintModal;
