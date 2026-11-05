import React from 'react';
import { PrintStationWrapper, BarcodeRenderer } from './PrintHelpers';

export interface TransferSlipPrintModalProps {
  open: boolean;
  onClose: () => void;
  patientName?: string;
  patientCode?: string;
  targetRoom?: string;
  queueNumber?: number | string;
}

export const TransferSlipPrintModal: React.FC<TransferSlipPrintModalProps> = ({
  open,
  onClose,
  patientName = 'NGUYỄN ĐÌNH PHONG',
  patientCode = '22000306',
  targetRoom = 'Tầng 2 - A223',
  queueNumber = '1',
}) => {
  if (!open) return null;

  return (
    <PrintStationWrapper
      title={`Phiếu Khám Bệnh A6 - ${patientName}`}
      onClose={onClose}
    >
      <div className="paper-sheet-a6">
        {/* HEADER SỞ Y TẾ */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11 }}>SỞ Y TẾ BẮC NINH</div>
          <div style={{ fontSize: 13, fontWeight: 'bold' }}>BỆNH VIỆN SẢN NHI</div>
          <div style={{ borderTop: '1.5px solid #102a6e', margin: '4px auto', width: '85%' }}></div>
        </div>

        {/* TIÊU ĐỀ */}
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 'bold' }}>PHIẾU KHÁM BỆNH</div>
          <div style={{ fontSize: 10 }}>NGÀY KHÁM: 10:58 11/08/2022</div>
          <div style={{ borderTop: '1px dashed #102a6e', margin: '6px auto', width: '90%' }}></div>
        </div>

        {/* PHÒNG KHÁM & SỐ THỨ TỰ TO */}
        <div style={{ textAlign: 'center', marginTop: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>PK hẹn: {targetRoom}</div>
          <div style={{ fontSize: 38, fontWeight: 'bold', margin: '6px 0', letterSpacing: 1 }}>
            SỐ: {queueNumber}
          </div>
          <div style={{ borderTop: '1px dashed #102a6e', margin: '6px auto', width: '90%' }}></div>
        </div>

        {/* THÔNG TIN BỆNH NHÂN */}
        <div style={{ marginTop: 10, fontSize: 11.5, lineHeight: 1.6 }}>
          <div>MÃ BỆNH NHÂN: <strong>{patientCode}</strong></div>
          <div>HỌ TÊN: <strong style={{ textTransform: 'uppercase' }}>{patientName}</strong></div>
          <div>Giới tính NS: Nam / 1989 (33 tuổi)</div>
        </div>

        {/* MÃ VẠCH VÀ LỄ TÂN */}
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <BarcodeRenderer code={patientCode} />
          </div>
          <div style={{ textAlign: 'center', fontSize: 11 }}>
            <div style={{ fontWeight: 'bold' }}>LỄ TÂN</div>
            <div style={{ fontStyle: 'italic', marginTop: 2 }}>tiennv</div>
          </div>
        </div>
      </div>
    </PrintStationWrapper>
  );
};
export default TransferSlipPrintModal;
