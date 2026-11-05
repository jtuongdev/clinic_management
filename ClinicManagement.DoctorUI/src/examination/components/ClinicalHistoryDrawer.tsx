import React, { useState } from 'react';
import '../../styles/components/ClinicalHistoryDrawer.css';

export interface HistoryVisitRecord {
  id: number | string;
  ngayKham: string;
  khoaPhong: string;
  bacSi: string;
  chanDoan: string;
  canLamSang: string;
  donThuoc: string;
  trangThai: string;
  soHoaDon?: string;
}

interface ClinicalHistoryDrawerProps {
  patientId?: number | string;
  patientName?: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelectVisit?: (visit: HistoryVisitRecord) => void;
}

export const ClinicalHistoryDrawer: React.FC<ClinicalHistoryDrawerProps> = ({
  patientName,
  isOpen,
  onToggle,
  onSelectVisit,
}) => {
  const [activeTab, setActiveTab] = useState<'VISITS' | 'PRESCRIPTIONS' | 'LAB_RESULTS'>('VISITS');

  // Dữ liệu mô phỏng lịch sử khám cũ chuẩn Desktop EMR (EHC Hospital)
  const visitsHistory: HistoryVisitRecord[] = [
    {
      id: 1,
      ngayKham: '11/08/2022 15:37',
      khoaPhong: 'Khoa khám bệnh > PK Nhi 1',
      bacSi: 'BS. Sennv',
      chanDoan: 'A02.0 - Viêm ruột do Salmonella',
      canLamSang: 'Tổng phân tích TB máu ngoại vi, C-Reactive Protein (CRP), Soi cặn nước tiểu',
      donThuoc: 'Ciprofloxacin 500mg (10 viên), Men vi sinh Enterogermina (20 ống), Oresol 245mg',
      trangThai: 'Đã hoàn thành',
      soHoaDon: '214332',
    },
    {
      id: 2,
      ngayKham: '22/05/2022 09:15',
      khoaPhong: 'Khoa Tai Mũi Họng > PK 201',
      bacSi: 'BS. Nguyễn Văn An',
      chanDoan: 'J02.9 - Viêm họng cấp không đặc hiệu',
      canLamSang: 'Nội soi Tai Mũi Họng ống mềm',
      donThuoc: 'Augmentin 1g (14 viên), Paracetamol 500mg, Alpha Choay (20 viên)',
      trangThai: 'Đã hoàn thành',
      soHoaDon: '198752',
    },
    {
      id: 3,
      ngayKham: '14/12/2021 14:00',
      khoaPhong: 'Khoa Nội Tổng Quát > PK 103',
      bacSi: 'BS. Trần Thị Mai',
      chanDoan: 'K29.7 - Viêm dạ dày không xác định',
      canLamSang: 'Nội soi dạ dày tá tràng có test HP (Âm tính)',
      donThuoc: 'Esomeprazole 40mg (28 viên), Phosphalugel (30 gói)',
      trangThai: 'Đã hoàn thành',
      soHoaDon: '184320',
    },
  ];

  return (
    <div className={`clinical-history-drawer ${isOpen ? 'open' : 'collapsed'}`}>
      {/* Thanh Header Drawer kéo thả */}
      <div className="drawer-header-bar" onClick={onToggle}>
        <div className="drawer-title-group">
          <i className={`fa-solid ${isOpen ? 'fa-chevron-down' : 'fa-chevron-up'}`}></i>
          <span className="drawer-main-title">
            Lịch Sử Khám & Điều Trị Cũ {patientName ? `– ${patientName}` : ''}
          </span>
          <span className="drawer-badge-count">{visitsHistory.length} đợt khám</span>
        </div>

        {isOpen && (
          <div className="drawer-subtabs" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={`drawer-tab-btn ${activeTab === 'VISITS' ? 'active' : ''}`}
              onClick={() => setActiveTab('VISITS')}
            >
              <i className="fa-solid fa-clock-rotate-left"></i> Các đợt khám
            </button>
            <button
              type="button"
              className={`drawer-tab-btn ${activeTab === 'PRESCRIPTIONS' ? 'active' : ''}`}
              onClick={() => setActiveTab('PRESCRIPTIONS')}
            >
              <i className="fa-solid fa-pills"></i> Toa thuốc cũ
            </button>
            <button
              type="button"
              className={`drawer-tab-btn ${activeTab === 'LAB_RESULTS' ? 'active' : ''}`}
              onClick={() => setActiveTab('LAB_RESULTS')}
            >
              <i className="fa-solid fa-flask"></i> Kết quả Cận lâm sàng
            </button>
          </div>
        )}

        <div className="drawer-action-controls">
          <span className="hotkey-tip">Nhấn để {isOpen ? 'thu gọn' : 'mở rộng lịch sử'}</span>
        </div>
      </div>

      {/* Nội dung bảng lịch sử lưới trắng chuẩn Desktop */}
      {isOpen && (
        <div className="drawer-body">
          {activeTab === 'VISITS' && (
            <div className="history-table-wrapper">
              <table className="desktop-grid-table">
                <thead>
                  <tr>
                    <th style={{ width: 45, textAlign: 'center' }}>STT</th>
                    <th style={{ width: 140 }}>NGÀY KHÁM</th>
                    <th style={{ width: 180 }}>KHOA / PHÒNG</th>
                    <th style={{ width: 140 }}>BÁC SĨ KHÁM</th>
                    <th style={{ width: 220 }}>CHẨN ĐOÁN (ICD-10)</th>
                    <th>CẬN LÂM SÀNG & KẾT QUẢ</th>
                    <th>ĐƠN THUỐC ĐÃ CẤP</th>
                    <th style={{ width: 110, textAlign: 'center' }}>TRẠNG THÁI</th>
                    <th style={{ width: 80, textAlign: 'center' }}>THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {visitsHistory.map((item, index) => (
                    <tr key={item.id} className="history-row" onClick={() => onSelectVisit?.(item)}>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{index + 1}</td>
                      <td className="cell-date">
                        <i className="fa-regular fa-calendar" style={{ marginRight: 4, color: '#0284c7' }}></i>
                        {item.ngayKham}
                      </td>
                      <td className="cell-dept">{item.khoaPhong}</td>
                      <td className="cell-doctor">{item.bacSi}</td>
                      <td className="cell-diagnosis">
                        <b>{item.chanDoan}</b>
                      </td>
                      <td className="cell-cls">{item.canLamSang}</td>
                      <td className="cell-rx">{item.donThuoc}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge-done">{item.trangThai}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn-view-detail"
                          title="Sao chép đơn cũ vào đợt khám này"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Đã sao chép đơn thuốc từ đợt khám ${item.ngayKham}!`);
                          }}
                        >
                          <i className="fa-regular fa-copy"></i> Copy
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'PRESCRIPTIONS' && (
            <div className="history-prescriptions-list">
              <div className="tab-empty-msg">
                <i className="fa-solid fa-receipt"></i>
                <span>Tổng hợp 3 đơn thuốc ngoại trú đã được thanh toán và cấp phát tại Kho Dược viện. Bác sĩ có thể bấm <b>Copy</b> để kê lại nhanh.</span>
              </div>
            </div>
          )}

          {activeTab === 'LAB_RESULTS' && (
            <div className="history-lab-list">
              <div className="tab-empty-msg">
                <i className="fa-solid fa-chart-line"></i>
                <span>Xem biểu đồ xu hướng các chỉ số xét nghiệm (Đường huyết, Men gan ALT/AST, Cholesterol, Acid Uric) qua các lần khám.</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClinicalHistoryDrawer;
