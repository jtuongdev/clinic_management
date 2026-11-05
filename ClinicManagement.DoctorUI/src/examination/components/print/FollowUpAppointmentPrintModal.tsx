import React from 'react';
import { PrintStationWrapper, BarcodeRenderer, DoctorBlueSignature, type PatientBannerData } from './PrintHelpers';

export interface FollowUpAppointmentPrintModalProps {
  open: boolean;
  onClose: () => void;
  patient?: any;
  appointmentTime?: string;
  doctorInstructions?: string;
  doctorName?: string;
}

export const FollowUpAppointmentPrintModal: React.FC<FollowUpAppointmentPrintModalProps> = ({
  open,
  onClose,
  patient,
  appointmentTime = '15 giờ 57 ngày 19 tháng 08 năm 2022',
  doctorInstructions = 'Tiếp tục dùng thuốc theo đơn, uống nhiều nước, nghỉ ngơi hợp lý. Tái khám đúng lịch.',
  doctorName = 'bieuCBT',
}) => {
  if (!open) return null;

  const patientName = patient?.hoTen || patient?.name || 'NGUYỄN THỊ LIÊN';
  const patientCode = patient?.maBenhNhanNoiBo || patient?.code || '22001770';
  const patientAge = patient?.tuoi || '38';
  const patientGender = patient?.gioiTinh === 'F' ? 'Nữ' : 'Nam';
  const patientAddress = patient?.diaChi || 'Xã Mường Lai, Huyện Lục Yên, Tỉnh Yên Bái';

  const bannerData: PatientBannerData = {
    name: patientName,
    code: patientCode,
    birthYear: '1984',
    age: patientAge,
    gender: patientGender,
    bhyt: 'DN-4-01-2929299222',
    address: patientAddress,
  };

  return (
    <PrintStationWrapper
      title={`Giấy Hẹn Tái Khám - ${patientName}`}
      patientBanner={bannerData}
      onClose={onClose}
    >
      <div className="paper-sheet-a4" style={{ minHeight: 700 }}>
        {/* HEADER VỚI LOGO TRÒN & BARCODE 1-436 */}
        <div className="sheet-header-grid">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                border: '2px solid #0369a1',
                color: '#0369a1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 'bold',
              }}
            >
              ✚
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 'bold' }}>TRUNG TÂM Y TẾ QUẾ VÕ</div>
              <div style={{ fontSize: 11, color: '#475569' }}>Thôn Đỉnh, TT.Phố Mới, H.Quế Võ, T.Bắc Ninh</div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <BarcodeRenderer code="1-436" />
          </div>
        </div>

        {/* TIÊU ĐỀ */}
        <div className="sheet-title-center" style={{ fontSize: 20, marginTop: 24 }}>
          PHIẾU HẸN TÁI KHÁM
        </div>
        <div className="sheet-subtitle-center" style={{ marginBottom: 20 }}>
          (Kèm theo hồ sơ bệnh án khám bệnh ngoại trú)
        </div>

        {/* THÔNG TIN HÀNH CHÍNH */}
        <table className="sheet-info-table" style={{ fontSize: 13.5, lineHeight: 1.8 }}>
          <tbody>
            <tr>
              <td style={{ width: '60%' }}>- Mã người bệnh: <strong>{patientCode}</strong></td>
              <td>- Tuổi: {patientAge} &nbsp;&nbsp;&nbsp;&nbsp; - Giới tính: {patientGender}</td>
            </tr>
            <tr>
              <td colSpan={2}>- Họ và tên: <strong style={{ textTransform: 'uppercase' }}>{patientName}</strong></td>
            </tr>
            <tr>
              <td colSpan={2}>- Địa chỉ: {patientAddress}</td>
            </tr>
            <tr>
              <td colSpan={2}>
                - Hẹn tái khám lúc: <strong style={{ color: '#0369a1', fontSize: 15 }}>{appointmentTime}</strong>
              </td>
            </tr>
            <tr>
              <td colSpan={2}>
                - Lời dặn của bác sĩ: <em>{doctorInstructions}</em>
              </td>
            </tr>
          </tbody>
        </table>

        {/* CHỮ KÝ BÁC SĨ */}
        <div className="sheet-signature-block" style={{ marginTop: 40 }}>
          <div className="doctor-sign-box">
            <div className="sign-sub">Ngày 12 tháng 08 năm 2022</div>
            <div className="sign-title" style={{ marginTop: 4 }}>BÁC SĨ KHÁM BỆNH</div>
            <div className="sign-sub">(Ký, Họ tên)</div>
            <DoctorBlueSignature name={doctorName} />
            <div className="doctor-sign-name">Họ tên: {doctorName}</div>
          </div>
        </div>

        {/* LƯU Ý CHÂN TRANG */}
        <div style={{ marginTop: 50, borderTop: '1px dashed #94a3b8', paddingTop: 8, fontSize: 12, fontStyle: 'italic', color: '#334155' }}>
          * Ghi chú: Người bệnh vui lòng mang theo phiếu này và đơn thuốc khi đi khám lại.
        </div>
      </div>
    </PrintStationWrapper>
  );
};
export default FollowUpAppointmentPrintModal;
