import React from 'react';
import type { BenhNhanListDto } from '../types/examination/queue.types';
import '../../styles/components/ClinicalPatientBanner.css';

interface ClinicalPatientBannerProps {
  patient: BenhNhanListDto | null;
  visitCode?: string | number;
  doctorName?: string;
  roomName?: string;
  vitals?: {
    bloodPressure?: string;
    heartRate?: number | string;
    temperature?: number | string;
    spo2?: number | string;
    bmi?: number | string;
    weight?: number | string;
  };
  onQuickAction?: (actionKey: string) => void;
}

export const ClinicalPatientBanner: React.FC<ClinicalPatientBannerProps> = ({
  patient,
  visitCode,
  doctorName = 'BS. Bàn Khám',
  roomName = 'PK Ngoại trú',
  vitals,
  onQuickAction,
}) => {
  if (!patient) {
    return (
      <div className="clinical-patient-banner empty">
        <div className="banner-empty-text">
          <i className="fa-solid fa-hospital-user"></i>
          <span>Chưa có bệnh nhân nào được chọn trong hàng đợi. Vui lòng bấm vào danh sách bên trái hoặc nhấn <b>F2</b> để nhận ca khám kế tiếp.</span>
        </div>
        <div className="banner-room-badge">
          <i className="fa-solid fa-door-open"></i> {roomName} • {doctorName}
        </div>
      </div>
    );
  }

  const patientName = patient.hoTen?.toUpperCase() || 'NGUYỄN THỊ BÌNH AN';
  const patientCode = patient.maBenhNhanNoiBo || '22000308';
  const birthYear = patient.namSinh || '1995';
  const age = patient.tuoi || 28;
  const gender = patient.gioiTinh || 'Nữ';
  const phone = patient.soDienThoai || patient.dienThoai || '0945 123 456';
  const address = patient.diaChi || 'Thị trấn Phố Mới, Quế Võ, Bắc Ninh';
  const displayVisit = visitCode || patient.soThuTu || '214332';
  const isBhyt = patient.loaiDoiTuong === 'BHYT' || Boolean(patient.soTheBHYT);
  const bhytCode = patient.soTheBHYT || 'DN-4-01-83-373-77888';

  const bp = vitals?.bloodPressure || '120/80';
  const hr = vitals?.heartRate || '78';
  const temp = vitals?.temperature || '36.8';
  const spo2 = vitals?.spo2 || '99';
  const bmi = vitals?.bmi || '21.5';

  return (
    <div className="clinical-patient-banner">
      {/* Khối bên trái: Thao tác nhanh & Phòng khám */}
      <div className="banner-left-controls">
        <div className="banner-room-indicator">
          <span className="dot-live pulsing"></span>
          <span className="room-title">{roomName}</span>
          <span className="doctor-badge">{doctorName}</span>
        </div>
        <div className="banner-quick-actions">
          <button
            type="button"
            className="btn-quick-nav"
            title="Gọi bệnh nhân kế tiếp (F2)"
            onClick={() => onQuickAction?.('next-patient')}
          >
            <i className="fa-solid fa-forward-step"></i> F2 Tiếp
          </button>
          <button
            type="button"
            className="btn-quick-nav"
            title="Chỉ định Cận lâm sàng (F3)"
            onClick={() => onQuickAction?.('order-cls')}
          >
            <i className="fa-solid fa-flask"></i> F3 CLS
          </button>
          <button
            type="button"
            className="btn-quick-nav"
            title="Kê đơn thuốc (F4)"
            onClick={() => onQuickAction?.('order-rx')}
          >
            <i className="fa-solid fa-pills"></i> F4 Thuốc
          </button>
          <button
            type="button"
            className="btn-quick-nav"
            title="In đơn thuốc (F9)"
            onClick={() => onQuickAction?.('print-rx')}
          >
            <i className="fa-solid fa-print"></i> F9 In
          </button>
        </div>
      </div>

      {/* Khối giữa: Sinh hiệu tóm tắt (Vitals Widget) */}
      <div className="banner-vitals-strip">
        <div className="vital-chip" title="Huyết áp">
          <span className="vital-lbl">HA:</span>
          <span className="vital-val">{bp}</span>
          <span className="vital-unit">mmHg</span>
        </div>
        <div className="vital-chip" title="Mạch">
          <span className="vital-lbl">Mạch:</span>
          <span className="vital-val">{hr}</span>
          <span className="vital-unit">ck/p</span>
        </div>
        <div className="vital-chip" title="Nhiệt độ">
          <span className="vital-lbl">Nhiệt:</span>
          <span className="vital-val">{temp}</span>
          <span className="vital-unit">°C</span>
        </div>
        <div className="vital-chip" title="SpO2">
          <span className="vital-lbl">SpO2:</span>
          <span className="vital-val">{spo2}%</span>
        </div>
        <div className="vital-chip" title="BMI">
          <span className="vital-lbl">BMI:</span>
          <span className="vital-val">{bmi}</span>
        </div>
      </div>

      {/* Khối bên phải: Bảng thông tin định danh Bệnh nhân chuẩn Desktop EMR (Chữ đỏ sẫm) */}
      <div className="banner-patient-identity">
        <div className="identity-text-box">
          <div className="identity-line-1">
            <span className="patient-name">{patientName}</span>
            <span className="sep">|</span>
            <span className="patient-code">#{patientCode}</span>
            <span className="sep">|</span>
            <span className="patient-age">{birthYear} ({age} tuổi)</span>
            <span className="sep">|</span>
            <span className="patient-gender">{gender}</span>
          </div>
          <div className="identity-line-2">
            <span className="visit-badge">LK: {displayVisit}</span>
            <span className="sep">|</span>
            {isBhyt ? (
              <span className="insurance-badge">BHYT: {bhytCode}</span>
            ) : (
              <span className="self-pay-badge">Viện phí ngoại trú</span>
            )}
          </div>
          <div className="identity-line-3">
            <span className="patient-address" title={address}>
              <i className="fa-solid fa-location-dot"></i> {address}
            </span>
            <span className="sep">|</span>
            <span className="patient-phone">
              <i className="fa-solid fa-phone"></i> {phone}
            </span>
          </div>
        </div>

        {/* Tag đỏ rượu vang nổi bật góc phải */}
        <div className="identity-tag-box">
          {isBhyt ? (
            <div className="tag-inner bhyt">
              <span>BHYT</span>
              <b>80%</b>
            </div>
          ) : (
            <div className="tag-inner request">
              <span>YÊU</span>
              <b>CẦU</b>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClinicalPatientBanner;
