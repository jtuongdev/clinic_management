import React from 'react';
import { type BenhNhanListDto } from '../types/queue.examination.type';
import '../../styles/components/ExamPanel.css';

interface ExamSidebarProps {
  patients: BenhNhanListDto[];
  selectedPatient: BenhNhanListDto | null;
  searchQueue: string;
  onSearchChange: (value: string) => void;
  onSelectPatient: (patient: BenhNhanListDto) => void;
  loading?: boolean;
}

const ExamSidebar: React.FC<ExamSidebarProps> = ({
  patients = [],
  selectedPatient,
  searchQueue,
  onSearchChange,
  onSelectPatient,
  loading = false,
}) => {
  // Lọc danh sách an toàn tuyệt đối chống lỗi null/undefined từ API
  const filteredPatients = (patients || []).filter((p) => {
    const hoTenStr = p?.hoTen || '';
    const maBNStr = p?.maBenhNhanNoiBo || '';
    const searchStr = searchQueue || '';

    return (
      hoTenStr.toLowerCase().includes(searchStr.toLowerCase()) ||
      maBNStr.toLowerCase().includes(searchStr.toLowerCase())
    );
  });

  return (
    <div className="exam-sidebar">
      <div className="exam-sidebar-header">
        <h4><i className="fa-solid fa-list-ol"></i> Hàng đợi khám</h4>
        <span className="badge-count">{filteredPatients.length} bệnh nhân</span>
      </div>
      <div className="exam-sidebar-search">
        <div className="search">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            placeholder="Tìm theo tên hoặc mã BN..."
            value={searchQueue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <div className="exam-sidebar-list">
        {loading ? (
          <div className="loading-state" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Đang tải hàng đợi...
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="empty-state" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
            <i className="fa-solid fa-users-slash" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}></i>
            Không có bệnh nhân trong danh sách
          </div>
        ) : (
          filteredPatients.map((p) => {
            const isExamining = p.trangThaiLuotKham === 'DangKham' || p.trangThaiLuotKham === 'exam';
            const isUrgent = p.trangThaiLuotKham === 'UuTien' || p.trangThaiLuotKham === 'urgent';

            return (
              <div
                key={p.id}
                className={`exam-queue-item ${selectedPatient?.id === p.id ? 'active' : ''} ${isExamining ? 'examining' : ''}`}
                onClick={() => onSelectPatient(p)}
              >
                {/* Số thứ tự từ database backend */}
                <div className="exam-queue-stt">{p.soThuTu ?? '-'}</div>
                <div className="exam-queue-info">
                  <div className="exam-queue-name">
                    {p.hoTen}
                    {isUrgent && (
                      <i className="fa-solid fa-circle-exclamation" style={{ color: 'var(--danger)', fontSize: '10px', marginLeft: '4px' }}></i>
                    )}
                  </div>
                  <div className="exam-queue-code">{p.maBenhNhanNoiBo} • {p.tuoi} tuổi ({p.gioiTinh})</div>
                </div>
                <div className="exam-queue-status">
                  {isExamining && <span className="status exam">Đang khám</span>}
                  {isUrgent && <span className="priority urgent">Ưu tiên</span>}
                  {!isExamining && !isUrgent && <span className="status waiting" style={{ fontSize: '11px', color: '#64748b' }}>{p.trangThaiLuotKham}</span>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ExamSidebar;
