import React, { useState } from 'react';
import '../../../styles/components/PrintModal.css';

export interface PatientBannerData {
  name: string;
  code: string;
  birthYear?: string | number;
  age?: string | number;
  gender: string;
  bhyt?: string;
  bhytRate?: string;
  invoiceCode?: string;
  address?: string;
  daysLeft?: string;
}

interface PrintStationWrapperProps {
  title: string;
  patientBanner?: PatientBannerData;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Khung cửa sổ trạm in chuẩn EHC HIS
 */
export const PrintStationWrapper: React.FC<PrintStationWrapperProps> = ({
  title,
  patientBanner,
  onClose,
  children,
}) => {
  const [zoom, setZoom] = useState<number>(100);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = () => {
    alert(`Đang xuất tệp: ${title.replace(/\s+/g, '_')}.pdf`);
  };

  const handleExportWord = () => {
    alert(`Đang xuất tệp Word: ${title.replace(/\s+/g, '_')}.docx`);
  };

  return (
    <div className="print-modal-overlay">
      <div className="print-station-window">
        {/* 1. TOP TOOLBAR */}
        <div className="print-station-header">
          <div className="print-header-actions">
            <button className="btn-print-action" onClick={handlePrint}>
              <i className="fa-solid fa-print"></i>
              <span>In Tài Liệu (F1)</span>
            </button>

            <div className="signature-check-group">
              <span>Loại chữ ký: <strong>---</strong></span>
              <span>Hiệu lực: <strong>---</strong></span>
              <button className="btn-verify-sig" onClick={() => alert('Chữ ký số hợp lệ và bảo toàn tính toàn vẹn.')}>
                <i className="fa-solid fa-check" style={{ color: '#16a34a', marginRight: 4 }}></i>
                Kiểm tra
              </button>
            </div>
          </div>

          {patientBanner && (
            <div className="print-header-patient">
              <div className="patient-banner-l1">
                {patientBanner.name} | {patientBanner.code} | {patientBanner.birthYear || ''} ({patientBanner.age || '--'} tuổi) | {patientBanner.gender}
                <span className="bhyt-badge">{patientBanner.bhytRate || 'BHYT 80%'}</span>
              </div>
              <div className="patient-banner-l2">
                Mã VP: {patientBanner.invoiceCode || '214348'} | {patientBanner.bhyt || 'DN-4-01-2929299222'} | {patientBanner.daysLeft || 'Còn hạn'}
              </div>
              <div className="patient-banner-l3">
                {patientBanner.address || 'Hà Nội'}
              </div>
            </div>
          )}
        </div>

        {/* 2. BODY: SIDEBAR + PAPERS */}
        <div className="print-station-body">
          {/* Cột trái: EMR Actions */}
          <div className="print-station-sidebar">
            <div className="sidebar-emr-title">Bệnh án điện tử</div>
            <button className="sidebar-emr-btn" onClick={() => alert('Đã ký số xác thực tài liệu điện tử!')}>
              <i className="fa-solid fa-signature" style={{ color: '#0284c7' }}></i>
              <span>Ký Tài Liệu</span>
            </button>

            <button className="sidebar-emr-btn" disabled>
              <i className="fa-solid fa-circle-check"></i>
              <span>Duyệt Tài Liệu</span>
            </button>

            <button className="sidebar-emr-btn" onClick={() => alert('Đã lưu tài liệu vào hồ sơ EMR.')}>
              <i className="fa-solid fa-floppy-disk" style={{ color: '#16a34a' }}></i>
              <span>Lưu Tài Liệu</span>
            </button>

            <button className="sidebar-emr-btn" disabled>
              <i className="fa-solid fa-xmark"></i>
              <span>Hủy Tài Liệu</span>
            </button>

            <div className="sidebar-export-label">Xuất file...</div>
            <div className="sidebar-export-row">
              <button className="sidebar-export-btn" onClick={handleExportPdf}>
                <i className="fa-solid fa-file-pdf" style={{ color: '#dc2626' }}></i>
                <span>PDF</span>
              </button>
              <button className="sidebar-export-btn" onClick={handleExportWord}>
                <i className="fa-solid fa-file-word" style={{ color: '#2563eb' }}></i>
                <span>DOC</span>
              </button>
            </div>

            <div className="sidebar-status-tag">Chưa ký 1</div>
          </div>

          {/* Vùng xem tài liệu cuộn + Zoom */}
          <div className="print-paper-viewport">
            <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform 0.15s ease' }}>
              {children}
            </div>
          </div>
        </div>

        {/* 3. FOOTER CONTROLS */}
        <div className="print-station-footer">
          <div className="footer-nav-group">
            <button className="footer-nav-btn">|◀</button>
            <button className="footer-nav-btn">◀</button>
            <span>Trang 1 / 1</span>
            <button className="footer-nav-btn">▶</button>
            <button className="footer-nav-btn">▶|</button>
          </div>

          <div className="footer-zoom-group">
            <button className="footer-nav-btn" onClick={() => setZoom((z) => Math.max(60, z - 10))}>-</button>
            <span>{zoom}%</span>
            <button className="footer-nav-btn" onClick={() => setZoom((z) => Math.min(150, z + 10))}>+</button>
            <button
              onClick={onClose}
              style={{
                marginLeft: 16,
                padding: '3px 12px',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Đóng (ESC)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Chữ ký mực xanh vector của Bác sĩ
 */
export const DoctorBlueSignature: React.FC<{ name?: string }> = ({ name: _name = 'tiennv' }) => {
  return (
    <div className="doctor-blue-signature">
      <svg width="120" height="46" viewBox="0 0 120 46" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M10 28 C25 8, 35 38, 48 18 C55 4, 62 35, 75 14 C85 2, 95 24, 110 18"
          stroke="#1042b4"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 38 C40 32, 70 34, 105 32"
          stroke="#1042b4"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

/**
 * Bộ tạo mã vạch Barcode mô phỏng Code 128
 */
export const BarcodeRenderer: React.FC<{ code: string }> = ({ code }) => {
  return (
    <div className="barcode-box">
      <div className="barcode-stripes">
        <div className="barcode-stripe thick" />
        <div className="barcode-stripe thin" />
        <div className="barcode-stripe" />
        <div className="barcode-stripe thick" />
        <div className="barcode-stripe thin" />
        <div className="barcode-stripe" />
        <div className="barcode-stripe thick" />
        <div className="barcode-stripe" />
        <div className="barcode-stripe thin" />
        <div className="barcode-stripe thick" />
        <div className="barcode-stripe" />
        <div className="barcode-stripe thin" />
        <div className="barcode-stripe thick" />
        <div className="barcode-stripe" />
      </div>
      <div className="barcode-text">*{code}*</div>
    </div>
  );
};
