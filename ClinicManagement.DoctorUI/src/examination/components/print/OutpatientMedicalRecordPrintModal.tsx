import React from 'react';
import { PrintStationWrapper, DoctorBlueSignature, type PatientBannerData } from './PrintHelpers';

export interface OutpatientMedicalRecordPrintModalProps {
  open: boolean;
  onClose: () => void;
  patient?: any;
  examData?: any;
  doctorName?: string;
}

export const OutpatientMedicalRecordPrintModal: React.FC<OutpatientMedicalRecordPrintModalProps> = ({
  open,
  onClose,
  patient,
  examData,
  doctorName = 'tiennv',
}) => {
  if (!open) return null;

  const patientName = patient?.hoTen || patient?.name || 'NGUYỄN THỊ BÌNH AN';
  const patientCode = patient?.maBenhNhanNoiBo || patient?.code || '22000308';
  const patientAge = patient?.tuoi || '23';
  const patientGender = patient?.gioiTinh === 'F' ? 'Nữ' : 'Nam';
  const patientAddress = patient?.diaChi || 'Thị trấn Phố Mới, H. Quế Võ, Bắc Ninh';
  const patientBhyt = patient?.soBHYT || 'DN-4-01-8337377888';

  const bannerData: PatientBannerData = {
    name: patientName,
    code: patientCode,
    birthYear: '1999',
    age: patientAge,
    gender: patientGender,
    bhyt: patientBhyt,
    bhytRate: 'BHYT 80%',
    invoiceCode: '214333',
    address: patientAddress,
    daysLeft: 'Còn 664 ngày',
  };

  const reason = examData?.reason || 'Đau bụng âm ỉ hạ vị, sốt nhẹ 2 ngày nay';
  const icdMain = examData?.diagnosis?.icd || 'K29.0 - Viêm dạ dày cấp xuất huyết';

  return (
    <PrintStationWrapper
      title={`Bệnh Án Ngoại Trú - ${patientName}`}
      patientBanner={bannerData}
      onClose={onClose}
    >
      <div className="paper-sheet-a4">
        {/* HEADER */}
        <div className="sheet-header-grid">
          <div>
            <div style={{ fontSize: 11 }}>SỞ Y TẾ BẮC NINH</div>
            <div style={{ fontSize: 13, fontWeight: 'bold' }}>BỆNH VIỆN SẢN NHI</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12 }}>Số lưu trữ: <strong>22000089</strong></div>
            <div style={{ fontSize: 11 }}>Mã BN: {patientCode}</div>
          </div>
        </div>

        {/* TIÊU ĐỀ */}
        <div className="sheet-title-center">BỆNH ÁN NGOẠI TRÚ</div>
        <div className="sheet-subtitle-center">KHOA: Khoa Khám Bệnh - Bàn Khám Bác Sĩ</div>

        {/* PHẦN I. HÀNH CHÍNH */}
        <div style={{ fontWeight: 'bold', fontSize: 13, borderBottom: '1px solid #000', paddingBottom: 2, marginBottom: 6 }}>
          I. HÀNH CHÍNH
        </div>
        <table className="sheet-info-table">
          <tbody>
            <tr>
              <td style={{ width: '45%' }}>1. Họ và tên: <strong style={{ textTransform: 'uppercase' }}>{patientName}</strong></td>
              <td style={{ width: '25%' }}>2. Sinh ngày: 15/08/1999</td>
              <td>3. Giới tính: {patientGender}</td>
            </tr>
            <tr>
              <td>4. Nghề nghiệp: Công nhân</td>
              <td>5. Dân tộc: Kinh</td>
              <td>6. Quốc tịch: Việt Nam</td>
            </tr>
            <tr>
              <td colSpan={3}>7. Địa chỉ: {patientAddress}</td>
            </tr>
            <tr>
              <td colSpan={2}>8. Đối tượng: BHYT ({patientBhyt})</td>
              <td>Hạn BHYT: 31/12/2026</td>
            </tr>
          </tbody>
        </table>

        {/* PHẦN II. LÝ DO ĐẾN KHÁM & TIỀN SỬ */}
        <div style={{ fontWeight: 'bold', fontSize: 13, borderBottom: '1px solid #000', paddingBottom: 2, marginBottom: 6, marginTop: 10 }}>
          II. LÝ DO ĐẾN KHÁM VÀ BỆNH SỬ
        </div>
        <div style={{ fontSize: 12.5, lineHeight: 1.6 }}>
          <div><strong>1. Lý do vào viện:</strong> {reason}</div>
          <div><strong>2. Quá trình bệnh lý:</strong> Bệnh khởi phát cách đây 2 ngày, xuất hiện đau âm ỉ vùng thượng vị, kèm ợ chua, buồn nôn, tự mua thuốc uống không đỡ nên đến khám.</div>
          <div><strong>3. Tiền sử bản thân:</strong> Chưa ghi nhận tiền sử dị ứng thuốc; tiền sử viêm dạ dày tá tràng 1 năm trước.</div>
          <div><strong>4. Tiền sử gia đình:</strong> Khỏe mạnh, chưa phát hiện bệnh lý di truyền liên quan.</div>
        </div>

        {/* PHẦN III. KHÁM BỆNH */}
        <div style={{ fontWeight: 'bold', fontSize: 13, borderBottom: '1px solid #000', paddingBottom: 2, marginBottom: 6, marginTop: 10 }}>
          III. KHÁM BỆNH
        </div>
        <div style={{ fontSize: 12.5, lineHeight: 1.6 }}>
          <div><strong>1. Toàn thân:</strong> Bệnh nhân tỉnh táo, tiếp xúc tốt, da niêm mạc hồng, không phù, tuyến giáp không to.</div>
          
          {/* Bảng Sinh hiệu */}
          <table style={{ width: '100%', borderCollapse: 'collapse', margin: '8px 0', fontSize: 12 }}>
            <tbody>
              <tr style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
                <td style={{ padding: '6px 8px' }}>Mạch: <strong>78</strong> ck/phút</td>
                <td style={{ padding: '6px 8px' }}>Nhiệt độ: <strong>37.0</strong> °C</td>
                <td style={{ padding: '6px 8px' }}>Huyết áp: <strong>120/80</strong> mmHg</td>
                <td style={{ padding: '6px 8px' }}>Nhịp thở: <strong>18</strong> l/p</td>
                <td style={{ padding: '6px 8px' }}>SpO2: <strong>98</strong> %</td>
                <td style={{ padding: '6px 8px' }}>Cân nặng: <strong>52</strong> kg</td>
              </tr>
            </tbody>
          </table>

          <div><strong>2. Các bộ phận:</strong></div>
          <div style={{ paddingLeft: 12 }}>
            <div>- Tim mạch: T1, T2 đều rõ, không nghe tiếng tim bệnh lý.</div>
            <div>- Hô hấp: Rì rào phế nang êm dịu 2 phế trường, không rales.</div>
            <div>- Tiêu hóa: Bụng mềm, ấn tức nhẹ vùng thượng vị, gan lách không sờ thấy.</div>
            <div>- Thần kinh - Cơ xương khớp: Dấu hiệu màng não (-), vận động các khớp trong giới hạn bình thường.</div>
          </div>
        </div>

        {/* PHẦN IV. CHẨN ĐOÁN VÀ ĐIỀU TRỊ */}
        <div style={{ fontWeight: 'bold', fontSize: 13, borderBottom: '1px solid #000', paddingBottom: 2, marginBottom: 6, marginTop: 10 }}>
          IV. CHẨN ĐOÁN VÀ ĐIỀU TRỊ
        </div>
        <div style={{ fontSize: 12.5, lineHeight: 1.6 }}>
          <div><strong>1. Chẩn đoán xác định:</strong> <span style={{ color: '#0369a1', fontWeight: 'bold' }}>{icdMain}</span></div>
          <div><strong>2. Chẩn đoán kèm theo:</strong> K21.0 - Bệnh trào ngược dạ dày - thực quản có viêm thực quản</div>
          <div><strong>3. Hướng điều trị:</strong> Kê đơn thuốc điều trị ngoại trú 07 ngày, hướng dẫn chế độ ăn kiêng cay nóng, hẹn tái khám sau khi hết thuốc.</div>
        </div>

        {/* CHỮ KÝ */}
        <div className="sheet-signature-block">
          <div className="doctor-sign-box">
            <div className="sign-sub">Ngày 22 tháng 08 năm 2022</div>
            <div className="sign-title" style={{ marginTop: 4 }}>BÁC SĨ ĐIỀU TRỊ</div>
            <div className="sign-sub">(Ký, ghi rõ họ tên)</div>
            <DoctorBlueSignature name={doctorName} />
            <div className="doctor-sign-name">{doctorName}</div>
          </div>
        </div>
      </div>
    </PrintStationWrapper>
  );
};
export default OutpatientMedicalRecordPrintModal;
