import React, { useState } from 'react';
import type { ExamSidebarProps, BenhNhanListDto } from '../types/examination/queue.types';
import '../../styles/components/ExamPanel.css';
import { TransferSlipPrintModal } from './print/TransferSlipPrintModal';

interface ExamSidebarExtendedProps extends ExamSidebarProps {
  collapsed?: boolean;
}

const ExamSidebar: React.FC<ExamSidebarExtendedProps> = ({
  patients = [],
  selectedPatient,
  searchQueue,
  onSearchChange,
  onSelectPatient,
  loading = false,
  collapsed = false,
}) => {
  const [printSlipPatient, setPrintSlipPatient] = useState<BenhNhanListDto | null>(null);

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
    <div className={`exam-sidebar ${collapsed ? 'collapsed' : ''}`}>
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
          filteredPatients.map((p, index) => {
            const isExamining = p.trangThaiLuotKham === 'DangKham' || p.trangThaiLuotKham === 'exam';
            const isUrgent = p.trangThaiLuotKham === 'UuTien' || p.trangThaiLuotKham === 'urgent';
            const displayOrder = p.soThuTu ?? index + 1;

            return (
              <div
                key={p.id}
                className={`exam-queue-item ${selectedPatient?.id === p.id ? 'active' : ''} ${isExamining ? 'examining' : ''}`}
                onClick={() => onSelectPatient(p)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setPrintSlipPatient(p);
                }}
                title="Click để chọn khám, chuột phải để in Phiếu Khám Bệnh A6"
              >
                <div className="exam-queue-stt">{displayOrder}</div>
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
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: '2px 4px',
                      marginLeft: '4px',
                    }}
                    title="In phiếu khám A6 (F1)"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPrintSlipPatient(p);
                    }}
                  >
                    <i className="fa-solid fa-print"></i>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <TransferSlipPrintModal
        open={!!printSlipPatient}
        onClose={() => setPrintSlipPatient(null)}
        patientName={printSlipPatient?.hoTen}
        patientCode={printSlipPatient?.maBenhNhanNoiBo}
        queueNumber={printSlipPatient?.soThuTu || 1}
      />
    </div>
  );
};

export default ExamSidebar;