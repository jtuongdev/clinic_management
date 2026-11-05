import React, { useState, useMemo } from 'react';
import type { ExamSidebarProps, BenhNhanListDto } from '../types/examination/queue.types';
import '../../styles/components/ExamPanel.css';
import { TransferSlipPrintModal } from './print/TransferSlipPrintModal';

interface ExamSidebarExtendedProps extends ExamSidebarProps {
  collapsed?: boolean;
  selectedRoom?: string;
  onRoomChange?: (room: string) => void;
}

export const ExamSidebar: React.FC<ExamSidebarExtendedProps> = ({
  patients = [],
  selectedPatient,
  searchQueue,
  onSearchChange,
  onSelectPatient,
  loading = false,
  collapsed = false,
  selectedRoom = 'Khoa khám bệnh > PK Nhi 1',
  onRoomChange,
}) => {
  const [printSlipPatient, setPrintSlipPatient] = useState<BenhNhanListDto | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'BHYT' | 'VIEN_PHI' | 'CHO_CLS'>('ALL');

  // Thống kê phân loại BHYT và Viện phí chuẩn Desktop EMR
  const stats = useMemo(() => {
    let bhCount = 0;
    let vpCount = 0;
    let clsCount = 0;

    (patients || []).forEach((p) => {
      const isBh = p.loaiDoiTuong === 'BHYT' || Boolean(p.soTheBHYT);
      if (isBh) bhCount++;
      else vpCount++;

      const status = String(p.trangThaiLuotKham || '').toLowerCase();
      if (status.includes('cls') || status.includes('can_lam_sang')) {
        clsCount++;
      }
    });

    return { total: patients.length, bhCount, vpCount, clsCount };
  }, [patients]);

  const filteredPatients = (patients || []).filter((p) => {
    const hoTenStr = p?.hoTen || '';
    const maBNStr = p?.maBenhNhanNoiBo || '';
    const searchStr = searchQueue || '';
    const matchesSearch =
      hoTenStr.toLowerCase().includes(searchStr.toLowerCase()) ||
      maBNStr.toLowerCase().includes(searchStr.toLowerCase());

    if (!matchesSearch) return false;

    const isBh = p.loaiDoiTuong === 'BHYT' || Boolean(p.soTheBHYT);
    const status = String(p.trangThaiLuotKham || '').toLowerCase();

    if (filterType === 'BHYT') return isBh;
    if (filterType === 'VIEN_PHI') return !isBh;
    if (filterType === 'CHO_CLS') return status.includes('cls') || status.includes('can_lam_sang');
    return true;
  });

  return (
    <div className={`exam-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* 1. Header Hàng đợi */}
      <div className="exam-sidebar-header">
        <div className="header-title-box">
          <i className="fa-solid fa-list-ol" style={{ color: '#0284c7' }}></i>
          <span className="sidebar-title-text">Hàng Đợi Khám</span>
        </div>
        <div className="header-stats-tag">
          <span>BH(<b>{stats.bhCount}</b>) VP(<b>{stats.vpCount}</b>)</span>
        </div>
      </div>

      {/* 2. Thanh lọc nhanh đối tượng (Desktop EMR style) */}
      <div className="exam-sidebar-filter-tabs">
        <button
          type="button"
          className={`filter-tab-btn ${filterType === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilterType('ALL')}
        >
          Tất cả ({stats.total})
        </button>
        <button
          type="button"
          className={`filter-tab-btn ${filterType === 'BHYT' ? 'active' : ''}`}
          onClick={() => setFilterType('BHYT')}
        >
          BHYT ({stats.bhCount})
        </button>
        <button
          type="button"
          className={`filter-tab-btn ${filterType === 'VIEN_PHI' ? 'active' : ''}`}
          onClick={() => setFilterType('VIEN_PHI')}
        >
          Viện phí ({stats.vpCount})
        </button>
        {stats.clsCount > 0 && (
          <button
            type="button"
            className={`filter-tab-btn alert-cls ${filterType === 'CHO_CLS' ? 'active' : ''}`}
            onClick={() => setFilterType('CHO_CLS')}
            title="Bệnh nhân chờ kết quả Cận Lâm Sàng"
          >
            CLS ({stats.clsCount})
          </button>
        )}
      </div>

      {/* 3. Ô tìm kiếm */}
      <div className="exam-sidebar-search">
        <div className="search">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            placeholder="Tìm theo tên hoặc mã BN..."
            value={searchQueue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQueue && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => onSearchChange('')}
              title="Xóa tìm kiếm"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
      </div>

      {/* 4. Danh sách bệnh nhân với đèn trạng thái 1:1 */}
      <div className="exam-sidebar-list">
        {loading ? (
          <div className="loading-state" style={{ padding: '24px 12px', textAlign: 'center', color: '#94a3b8' }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Đang tải danh sách...
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px 12px', textAlign: 'center', color: '#94a3b8' }}>
            <i className="fa-solid fa-users-slash" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}></i>
            Không có bệnh nhân phù hợp
          </div>
        ) : (
          filteredPatients.map((p, index) => {
            const rawStatus = String(p.trangThaiLuotKham || '').trim();
            const isExamining = ['DANG_KHAM', 'DangKham', 'exam', 'Dang_Kham'].includes(rawStatus);
            const isWaitingCls = ['CHO_CLS', 'ChoCls', 'Cho_Cls', 'CHO_CAN_LAM_SANG'].includes(rawStatus);
            const isCompleted = ['HOAN_THANH', 'HoanThanh', 'done'].includes(rawStatus);
            const isUrgent = p.trangThaiLuotKham === 'UuTien' || p.trangThaiLuotKham === 'urgent';
            const displayOrder = p.soThuTu ?? index + 1;
            const isBh = p.loaiDoiTuong === 'BHYT' || Boolean(p.soTheBHYT);

            return (
              <div
                key={p.id}
                className={`exam-queue-item ${selectedPatient?.id === p.id ? 'active' : ''} ${isExamining ? 'examining' : ''} ${isWaitingCls ? 'waiting-cls' : ''}`}
                onClick={() => onSelectPatient(p)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setPrintSlipPatient(p);
                }}
                title="Click chọn khám, chuột phải để in Phiếu Khám Bệnh A6"
              >
                {/* Đèn báo trạng thái hình học (Dot indicator) */}
                <div className="status-dot-column">
                  {isWaitingCls ? (
                    <span className="dot-indicator cls-orange pulsing" title="Chờ kết quả Cận Lâm Sàng"></span>
                  ) : isExamining ? (
                    <span className="dot-indicator exam-blue" title="Đang khám"></span>
                  ) : isCompleted ? (
                    <span className="dot-indicator done-green" title="Đã hoàn thành"></span>
                  ) : (
                    <span className="dot-indicator wait-grey" title="Chờ khám"></span>
                  )}
                  <span className="queue-stt">{displayOrder}</span>
                </div>

                {/* Thông tin bệnh nhân */}
                <div className="exam-queue-info">
                  <div className="exam-queue-name">
                    <span className="name-text">{p.hoTen}</span>
                    {isUrgent && (
                      <span className="urgent-badge" title="Bệnh nhân ưu tiên">ƯU TIÊN</span>
                    )}
                  </div>
                  <div className="exam-queue-code">
                    <span className="code-text">#{p.maBenhNhanNoiBo || '22000308'}</span>
                    <span className="sep">•</span>
                    <span>{p.tuoi ? `${p.tuoi}t` : '28t'} ({p.gioiTinh || 'Nữ'})</span>
                    <span className="sep">•</span>
                    <span className={`tag-type ${isBh ? 'bh' : 'vp'}`}>{isBh ? 'BHYT' : 'Viện phí'}</span>
                  </div>
                </div>

                {/* Cột hành động & trạng thái */}
                <div className="exam-queue-status">
                  {isWaitingCls ? (
                    <span className="status-pill cls">Chờ KQ</span>
                  ) : isExamining ? (
                    <span className="status-pill exam">Đang khám</span>
                  ) : isCompleted ? (
                    <span className="status-pill done">Đã khám</span>
                  ) : (
                    <span className="status-pill wait">Chờ</span>
                  )}
                  <button
                    type="button"
                    className="btn-print-slip"
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

      {/* 5. Dropdown chọn phòng khám cố định đáy sidebar */}
      <div className="exam-sidebar-footer">
        <i className="fa-solid fa-door-open" style={{ color: '#64748b', fontSize: '11px' }}></i>
        <select
          value={selectedRoom}
          onChange={(e) => onRoomChange?.(e.target.value)}
          className="room-select-dropdown"
        >
          <option value="Khoa khám bệnh > PK Nhi 1">PK Nhi 1 (Đang trực)</option>
          <option value="Khoa khám bệnh > PK Nội Tổng Quát">PK Nội Tổng Quát</option>
          <option value="Khoa khám bệnh > PK Ngoại Chuyên Khoa">PK Ngoại Chuyên Khoa</option>
          <option value="Khoa khám bệnh > PK Tai Mũi Họng">PK Tai Mũi Họng</option>
          <option value="Khoa khám bệnh > PK Răng Hàm Mặt">PK Răng Hàm Mặt</option>
        </select>
      </div>

      {/* Modal in phiếu khám bệnh A6 */}
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
