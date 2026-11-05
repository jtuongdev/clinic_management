import React from 'react';
import { PrintStationWrapper, DoctorBlueSignature, type PatientBannerData } from './PrintHelpers';

export interface PrescriptionPrintModalProps {
  open: boolean;
  onClose: () => void;
  patient?: any;
  prescription?: any;
  doctorName?: string;
}

export const PrescriptionPrintModal: React.FC<PrescriptionPrintModalProps> = ({
  open,
  onClose,
  patient,
  prescription,
  doctorName = 'tiennv',
}) => {
  if (!open) return null;

  const patientName = patient?.hoTen || patient?.name || 'TEST1';
  const patientCode = patient?.maBenhNhanNoiBo || patient?.code || '22000324';
  const patientAge = patient?.tuoi || '22';
  const patientGender = patient?.gioiTinh === 'F' ? 'Nữ' : 'Nam';
  const patientAddress = patient?.diaChi || 'Thị trấn Phố Mới, H. Quế Võ, Bắc Ninh';
  const patientBhyt = patient?.soBHYT || 'DN-4-01-2929299222';
  const patientExpiry = '01/01/2025';
  const diagnosis = prescription?.chanDoan || 'A00.1-Bệnh tả do Vibrio cholerae 01, typ sinh học eltor';

  const bannerData: PatientBannerData = {
    name: patientName,
    code: patientCode,
    birthYear: '2000',
    age: patientAge,
    gender: patientGender,
    bhyt: patientBhyt,
    bhytRate: 'BHYT 80%',
    invoiceCode: '214348',
    address: patientAddress,
    daysLeft: 'Còn 864 ngày',
  };

  const drugs = prescription?.items || [
    {
      tenThuoc: 'Lactulose (Duphalac) 10g/15ml',
      soLuong: '02',
      donViTinh: 'Gói',
      huongDan: 'Uống ngày 2 lần, mỗi lần 1 gói sau ăn',
    },
    {
      tenThuoc: 'Aciclovir (Aciclovir 5%) 5%/5g',
      soLuong: '01',
      donViTinh: 'Tuýp',
      huongDan: 'Dùng ngoài, bôi vùng tổn thương ngày 3 lần',
    },
  ];

  return (
    <PrintStationWrapper
      title={`Đơn Thuốc - ${patientName}`}
      patientBanner={bannerData}
      onClose={onClose}
    >
      <div className="paper-sheet-a4">
        {/* HEADER */}
        <div className="sheet-header-grid">
          <div>
            <div style={{ fontSize: 13, fontWeight: 'bold' }}>BỆNH VIỆN SẢN NHI</div>
            <div style={{ fontSize: 12 }}>PK Nhi 1</div>
            <div style={{ fontSize: 12 }}>Kho thuốc ngoại trú</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, fontWeight: 'bold' }}>Mã BN: {patientCode}</div>
          </div>
        </div>

        {/* TIÊU ĐỀ */}
        <div className="sheet-title-center">ĐƠN THUỐC</div>
        <div className="sheet-subtitle-center">(Ban hành theo Thông tư 04/2022/TT-BYT của Bộ Y Tế)</div>

        {/* THÔNG TIN HÀNH CHÍNH & LÂM SÀNG */}
        <table className="sheet-info-table">
          <tbody>
            <tr>
              <td style={{ width: '45%' }}>- Họ tên: <strong>{patientName}</strong></td>
              <td style={{ width: '20%' }}>Tuổi: {patientAge}</td>
              <td style={{ width: '20%' }}>Cân nặng: ........ kg</td>
              <td>Giới tính: {patientGender}</td>
            </tr>
            <tr>
              <td colSpan={4}>- Đối tượng: Bảo hiểm</td>
            </tr>
            <tr>
              <td colSpan={2}>- Số thẻ BHYT: {patientBhyt}</td>
              <td colSpan={2}>- Hạn thẻ đến: {patientExpiry}</td>
            </tr>
            <tr>
              <td colSpan={4}>- Địa chỉ: {patientAddress}</td>
            </tr>
            <tr>
              <td colSpan={4}>- Chẩn đoán: {diagnosis}</td>
            </tr>
            <tr>
              <td colSpan={4}>- Chẩn đoán kèm theo: ............................................................................................................................</td>
            </tr>
          </tbody>
        </table>

        {/* DANH SÁCH THUỐC */}
        <div style={{ marginTop: 18, marginBottom: 18 }}>
          {drugs.map((drug: any, index: number) => (
            <div key={index} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span>
                  <strong>{index + 1}.</strong> &nbsp;&nbsp; {drug.tenThuoc || drug.name}
                </span>
                <span>
                  <strong>{String(drug.soLuong || drug.quantity).padStart(2, '0')}</strong> &nbsp;
                  <strong>{drug.donViTinh || drug.unit || 'Viên'}</strong>
                </span>
              </div>
              <div style={{ fontSize: 12, fontStyle: 'italic', paddingLeft: 24, marginTop: 2, color: '#1e293b' }}>
                {drug.huongDan || drug.huongDanSuDung || 'Theo chỉ dẫn của bác sĩ'}
              </div>
            </div>
          ))}
        </div>

        {/* TỔNG KHOẢN & LỜI DẶN */}
        <div style={{ fontSize: 12, margin: '14px 0' }}>
          <div>* Tổng khoản: <strong>{String(drugs.length).padStart(2, '0')}</strong></div>
          <div style={{ marginTop: 6 }}>Lời dặn: Uống thuốc đúng giờ, tái khám khi có dấu hiệu bất thường.</div>
        </div>

        {/* KHỐI KÝ TÊN BÁC SĨ */}
        <div className="sheet-signature-block">
          <div className="doctor-sign-box">
            <div className="sign-sub">14:20 Ngày 22 tháng 08 năm 2022</div>
            <div className="sign-title" style={{ marginTop: 4 }}>BÁC SỸ KHÁM</div>
            <div className="sign-sub">(Ký, Họ tên)</div>
            <DoctorBlueSignature name={doctorName} />
            <div className="doctor-sign-name">{doctorName}</div>
          </div>
        </div>

        {/* CHÂN TRANG */}
        <div style={{ marginTop: 40, borderTop: '1px solid #e2e8f0', paddingTop: 8, fontSize: 11, fontStyle: 'italic' }}>
          <div>* Khám lại xin mang theo đơn này.</div>
          <div style={{ marginTop: 2 }}>- Tên bố hoặc mẹ của trẻ hoặc người đưa trẻ đến khám bệnh, chữa bệnh: ................................................</div>
        </div>
      </div>
    </PrintStationWrapper>
  );
};
export default PrescriptionPrintModal;
