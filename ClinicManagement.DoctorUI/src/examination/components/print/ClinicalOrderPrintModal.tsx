import React from 'react';
import { PrintStationWrapper, BarcodeRenderer, DoctorBlueSignature, type PatientBannerData } from './PrintHelpers';

export interface ClinicalOrderPrintModalProps {
  open: boolean;
  onClose: () => void;
  patient?: any;
  services?: any[];
  doctorName?: string;
}

export const ClinicalOrderPrintModal: React.FC<ClinicalOrderPrintModalProps> = ({
  open,
  onClose,
  patient,
  services,
  doctorName = 'tiennv',
}) => {
  if (!open) return null;

  const patientName = patient?.hoTen || patient?.name || 'TEST1';
  const patientCode = patient?.maBenhNhanNoiBo || patient?.code || '22000324';
  const patientAge = patient?.tuoi || '22';
  const patientGender = patient?.gioiTinh === 'F' ? 'Nữ' : 'Nam';
  const patientAddress = patient?.diaChi || 'Thị trấn Phố Mới, H. Quế Võ, Bắc Ninh';
  const patientBhyt = patient?.soBHYT || 'DN-4-01-2929299222';
  const diagnosis = 'A01.1-Bệnh tả do Vibrio cholerae 01, typ sinh học eltor';

  const bannerData: PatientBannerData = {
    name: patientName,
    code: patientCode,
    birthYear: '2000',
    age: patientAge,
    gender: patientGender,
    bhyt: patientBhyt,
    bhytRate: 'BHYT 80%',
    invoiceCode: '214341',
    address: patientAddress,
    daysLeft: 'Còn 11 ngày',
  };

  const serviceList = services && services.length > 0 ? services : [
    { tenDichVu: 'Xét nghiệm dịch / tả', nhom: 'PHÒNG LẤY MẪU BỆNH PHẨM', phong: 'P.102 - Tầng 1', gia: 120000 },
    { tenDichVu: 'Nhuộm soi tế bào dịch tiết', nhom: 'PHÒNG LẤY MẪU BỆNH PHẨM', phong: 'P.102 - Tầng 1', gia: 85000 },
    { tenDichVu: 'Chụp X-quang Hirtz', nhom: 'DT CHẨN ĐOÁN HÌNH ẢNH', phong: 'P. X-quang KTS', gia: 150000 },
    { tenDichVu: 'Chụp xương chính mũi nghiêng', nhom: 'DT CHẨN ĐOÁN HÌNH ẢNH', phong: 'P. X-quang KTS', gia: 140000 },
  ];

  const group1 = serviceList.filter((s: any) => s.nhom?.includes('MẪU') || s.loaiDichVu?.includes('XET_NGHIEM') || !s.nhom);
  const group2 = serviceList.filter((s: any) => s.nhom?.includes('HÌNH ẢNH') || s.loaiDichVu?.includes('CDHA'));

  return (
    <PrintStationWrapper
      title={`Phiếu Chỉ Định - ${patientName}`}
      patientBanner={bannerData}
      onClose={onClose}
    >
      <div className="paper-sheet-a4">
        {/* HEADER VỚI LOGO & BARCODE */}
        <div className="sheet-header-grid">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#be123c',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: 18,
              }}
            >
              ✚
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 'bold' }}>BỆNH VIỆN SẢN NHI</div>
              <div style={{ fontSize: 11 }}>Khoa Khám Bệnh - Phòng Khám Nhi 1</div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <BarcodeRenderer code={patientCode} />
            <div style={{ fontSize: 11, marginTop: 2 }}>Số BA: 22000063</div>
          </div>
        </div>

        {/* TIÊU ĐỀ */}
        <div className="sheet-title-center">PHIẾU CHỈ ĐỊNH CẬN LÂM SÀNG</div>
        <div className="sheet-subtitle-center">11:47, ngày 22 tháng 08 năm 2022</div>

        {/* HÀNH CHÍNH */}
        <table className="sheet-info-table">
          <tbody>
            <tr>
              <td style={{ width: '45%' }}>- Họ tên: <strong>{patientName}</strong></td>
              <td style={{ width: '25%' }}>Năm sinh: 2000 ({patientAge} tuổi)</td>
              <td>Giới tính: {patientGender}</td>
            </tr>
            <tr>
              <td colSpan={2}>- Địa chỉ: {patientAddress}</td>
              <td>- Đối tượng: Bảo hiểm</td>
            </tr>
            <tr>
              <td colSpan={2}>- Số thẻ BHYT: {patientBhyt}</td>
              <td>- Khoa/Phòng: PK Nhi 1</td>
            </tr>
            <tr>
              <td colSpan={3}>- Chẩn đoán: {diagnosis}</td>
            </tr>
          </tbody>
        </table>

        {/* BẢNG DỊCH VỤ CẬN LÂM SÀNG */}
        <table className="sheet-grid-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>STT</th>
              <th>Tên dịch vụ kỹ thuật / Chỉ định</th>
              <th style={{ width: 140 }}>Nơi thực hiện</th>
              <th style={{ width: 110 }}>Đơn giá (VNĐ)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
              <td colSpan={4}>I. PHÒNG LẤY MẪU BỆNH PHẨM (XÉT NGHIỆM)</td>
            </tr>
            {group1.map((item: any, idx: number) => (
              <tr key={`g1-${idx}`}>
                <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                <td>{item.tenDichVu}</td>
                <td>{item.phong || 'Phòng Xét Nghiệm'}</td>
                <td style={{ textAlign: 'right' }}>{(item.gia || 100000).toLocaleString('vi-VN')}</td>
              </tr>
            ))}

            <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
              <td colSpan={4}>II. DT CHẨN ĐOÁN HÌNH ẢNH (X-QUANG / SIÊU ÂM)</td>
            </tr>
            {(group2.length > 0 ? group2 : [
              { tenDichVu: 'Chụp X-quang Hirtz', phong: 'P. X-quang KTS', gia: 150000 },
              { tenDichVu: 'Chụp xương chính mũi nghiêng', phong: 'P. X-quang KTS', gia: 140000 },
            ]).map((item: any, idx: number) => (
              <tr key={`g2-${idx}`}>
                <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                <td>{item.tenDichVu}</td>
                <td>{item.phong || 'Phòng CĐHA'}</td>
                <td style={{ textAlign: 'right' }}>{(item.gia || 140000).toLocaleString('vi-VN')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* CHỮ KÝ */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
          <div style={{ textAlign: 'center', width: 220 }}>
            <div style={{ fontSize: 12, fontWeight: 'bold' }}>KỸ THUẬT VIÊN THỰC HIỆN</div>
            <div style={{ fontSize: 11, fontStyle: 'italic' }}>(Ký, ghi rõ họ tên)</div>
          </div>

          <div style={{ textAlign: 'center', width: 220 }}>
            <div style={{ fontSize: 11, fontStyle: 'italic' }}>Ngày 22 tháng 08 năm 2022</div>
            <div style={{ fontSize: 12, fontWeight: 'bold', marginTop: 2 }}>BÁC SĨ CHỈ ĐỊNH</div>
            <div style={{ fontSize: 11, fontStyle: 'italic' }}>(Ký, ghi rõ họ tên)</div>
            <DoctorBlueSignature name={doctorName} />
            <div className="doctor-sign-name">{doctorName}</div>
          </div>
        </div>
      </div>
    </PrintStationWrapper>
  );
};
export default ClinicalOrderPrintModal;
