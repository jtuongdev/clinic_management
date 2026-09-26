import React, { useState, useMemo, useEffect } from 'react';
import { useQueueExtended } from '../hook/useQueuExaminationList';
import { type HangDoiDto } from '../type/queue.type';
import { examinationApi } from '../../examination/api/examination.api';
import '../../styles/components/QueuePanel.css';

interface QueuePanelProps {
  onOpenDetail?: (patient: HangDoiDto) => void;
}

const formatVisitCode = (value?: string | number | null) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const raw = String(value).trim();
  const normalized = raw
    .replace(/^(LK|KH)\s*[:-]?\s*/i, '')
    .replace(/^LƯỢT\s+KHÁM\s*[:-]?\s*/i, '')
    .replace(/\s+/g, '');

  return normalized;
};

const formatQueueTime = (value?: string | null) => {
  if (!value) return '--:--';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return '--:--';
  }
};

const getWaitDuration = (value?: string | null) => {
  if (!value) return '';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    const diffMs = Math.max(0, Date.now() - d.getTime());
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins} phút trước`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}p trước`;
  } catch {
    return '';
  }
};

const ALL_QUEUE_PAGE_SIZE = 1000;
const DEFAULT_ROW_HEIGHT = 40;

const DEFAULT_QUEUE_COL_WIDTHS: Record<string, number> = {
  stt: 54,
  maBenhNhan: 115,
  maLuotKham: 115,
  hoTen: 230,
  gioiTinhTuoi: 110,
  khoaPhong: 150,
  phanLoai: 130,
  sinhHieu: 155,
  thoiGian: 105,
  trangThai: 130,
  thaoTac: 180,
};

const QUEUE_COLUMNS = [
  { key: 'stt', label: 'STT', align: 'text-center' },
  { key: 'maBenhNhan', label: 'Mã BN', align: 'text-center' },
  { key: 'maLuotKham', label: 'Mã LK', align: 'text-center' },
  { key: 'hoTen', label: 'Bệnh nhân', align: 'text-left' },
  { key: 'gioiTinhTuoi', label: 'Phái / Tuổi', align: 'text-center' },
  { key: 'khoaPhong', label: 'Khoa / Buồng', align: 'text-left' },
  { key: 'phanLoai', label: 'Phân loại', align: 'text-center' },
  { key: 'sinhHieu', label: 'Sinh hiệu', align: 'text-center' },
  { key: 'thoiGian', label: 'Tiếp nhận', align: 'text-right' },
  { key: 'trangThai', label: 'Trạng thái', align: 'text-center' },
  { key: 'thaoTac', label: 'Thao tác', align: 'text-center' },
];

export const QueuePanel: React.FC<QueuePanelProps> = ({ onOpenDetail }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [hoveredPatientVitals, setHoveredPatientVitals] = useState<{ id: number; vitals: any } | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);

  // Column and Row Resizing states
  const [colWidths, setColWidths] = useState<Record<string, number>>(DEFAULT_QUEUE_COL_WIDTHS);
  const [rowHeights, setRowHeights] = useState<Record<number, number>>({});

  // Pagination states
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const {
    patients,
    totalCount,
    loading,
    error,
    refresh,
  } = useQueueExtended({
    autoFetch: true,
    initialPage: 1,
    initialPageSize: ALL_QUEUE_PAGE_SIZE,
  });

  // Tự động làm mới hàng đợi định kỳ (Polling 30s)
  useEffect(() => {
    const timer = setInterval(() => {
      refresh();
    }, 30000);
    return () => clearInterval(timer);
  }, [refresh]);

  // Đóng menu thao tác khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openActionMenuId !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest('.action-menu-trigger') && !target.closest('.action-menu-dropdown')) {
          setOpenActionMenuId(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openActionMenuId]);

  // Lọc và sắp xếp theo độ ưu tiên (CẤP CỨU -> ƯU TIÊN -> THƯỜNG)
  const filteredPatients = useMemo(() => {
    let result = patients;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        p => p.hoTen.toLowerCase().includes(q) ||
             p.maBenhNhanNoiBo.toLowerCase().includes(q) ||
             p.maLuotKham.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      const statusMap: Record<string, string[]> = {
        wait: ['CHO_KHAM'],
        exam: ['DANG_KHAM'],
        cls: ['CHO_CLS', 'CO_KET_QUA_CLS'],
        done: ['HOAN_THANH'],
        cancel: ['DA_HUY'],
      };
      const allowedStatuses = statusMap[statusFilter] || [];
      result = result.filter(p => allowedStatuses.includes(p.trangThai));
    }

    if (priorityFilter !== 'all') {
      result = result.filter(p => (p.priority || 'NORMAL').toLowerCase() === priorityFilter.toLowerCase());
    }

    // Sắp xếp ưu tiên: EMERGENCY lên đầu, tiếp đến URGENT, cuối cùng NORMAL
    const priorityWeight: Record<string, number> = {
      EMERGENCY: 1,
      URGENT: 2,
      NORMAL: 3,
    };

    return [...result].sort((a, b) => {
      const wA = priorityWeight[a.priority || 'NORMAL'] || 3;
      const wB = priorityWeight[b.priority || 'NORMAL'] || 3;
      if (wA !== wB) return wA - wB;
      return (a.soThuTu || 999) - (b.soThuTu || 999);
    });
  }, [patients, search, statusFilter, priorityFilter]);



  // Pagination calculation
  const totalFiltered = filteredPatients.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

  const pagedPatients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPatients.slice(start, start + pageSize);
  }, [filteredPatients, currentPage, pageSize]);

  const stats = useMemo(() => {
    const waiting = patients.filter(p => p.trangThai === 'CHO_KHAM').length;
    const examining = patients.filter(p => p.trangThai === 'DANG_KHAM').length;
    const cls = patients.filter(p => p.trangThai === 'CHO_CLS' || p.trangThai === 'CO_KET_QUA_CLS').length;
    const done = patients.filter(p => p.trangThai === 'HOAN_THANH').length;
    const emergency = patients.filter(p => p.priority === 'EMERGENCY' || p.priority === 'URGENT').length;
    return { waiting, examining, cls, done, emergency, total: patients.length };
  }, [patients]);

  // =========================================================================
  // EXCEL RESIZING ENGINE (COLUMN & ROW DRAG HANDLERS)
  // =========================================================================

  const handleColResizeStart = (e: React.MouseEvent, colKey: string) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const currentWidth = colWidths[colKey] || DEFAULT_QUEUE_COL_WIDTHS[colKey] || 100;

    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(50, currentWidth + deltaX); // Safe bound minWidth: 50px
      setColWidths((prev) => ({ ...prev, [colKey]: newWidth }));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.classList.remove('is-resizing-col');
    };

    document.body.classList.add('is-resizing-col');
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleRowResizeStart = (e: React.MouseEvent, patientId: number, currentRowHeight: number) => {
    e.preventDefault();
    e.stopPropagation();

    const startY = e.clientY;
    const startHeight = currentRowHeight || DEFAULT_ROW_HEIGHT;

    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(32, startHeight + deltaY); // Safe bound minHeight: 32px
      setRowHeights((prev) => ({ ...prev, [patientId]: newHeight }));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.classList.remove('is-resizing-row');
    };

    document.body.classList.add('is-resizing-row');
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleResetGridSizes = () => {
    setColWidths(DEFAULT_QUEUE_COL_WIDTHS);
    setRowHeights({});
  };

  const callPatient = async (patient: HangDoiDto) => {
    if (window.confirm(`Gọi bệnh nhân ${patient.hoTen} vào phòng khám ngay?`)) {
      try {
        await examinationApi.startExam(patient.id);
        alert(`Đã gọi bệnh nhân ${patient.hoTen} vào khám.`);
        refresh();
      } catch {
        alert(`Đã kích hoạt gọi ${patient.hoTen}.`);
      }
    }
  };

  const handleOpenDetail = (patient: HangDoiDto) => {
    if (onOpenDetail) {
      onOpenDetail(patient);
    }
  };

  const handleRefresh = () => {
    refresh();
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      CHO_KHAM: 'Đang chờ',
      DANG_KHAM: 'Đang khám',
      CHO_CLS: 'Đang làm CLS',
      CO_KET_QUA_CLS: 'Đã có KQ CLS',
      HOAN_THANH: 'Đã khám',
      DA_HUY: 'Đã hủy',
    };
    return map[status] || status;
  };

  const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
      CHO_KHAM: 'wait',
      DANG_KHAM: 'exam',
      CHO_CLS: 'wait',
      CO_KET_QUA_CLS: 'exam',
      HOAN_THANH: 'done',
      DA_HUY: 'cancel',
    };
    return map[status] || 'wait';
  };

  return (
    <div className="panel-queue">
      {/* KPI Ribbon */}
      <section className="kpis">
        <div className="kpi info">
          <div>
            <div className="kpi-label">Tổng lượt hôm nay</div>
            <div className="kpi-value">{totalCount}</div>
          </div>
          <div className="kpi-icon"><i className="fa-solid fa-users"></i></div>
        </div>
        <div className="kpi warning">
          <div>
            <div className="kpi-label">Đang chờ khám</div>
            <div className="kpi-value">{stats.waiting}</div>
          </div>
          <div className="kpi-icon"><i className="fa-solid fa-clock"></i></div>
        </div>
        <div className="kpi cls">
          <div>
            <div className="kpi-label">Đang làm CLS</div>
            <div className="kpi-value">{stats.cls}</div>
          </div>
          <div className="kpi-icon"><i className="fa-solid fa-flask"></i></div>
        </div>
        <div className={`kpi emergency ${stats.emergency > 0 ? 'has-emergency' : ''}`}>
          <div>
            <div className="kpi-label">Cấp cứu / Ưu tiên</div>
            <div className="kpi-value">{stats.emergency}</div>
          </div>
          <div className="kpi-icon"><i className="fa-solid fa-triangle-exclamation"></i></div>
        </div>
      </section>

      {/* Danh sách hàng đợi */}
      <section className="queue-card">
        <div className="queue-header">
          <div className="queue-title">
            <i className="fa-solid fa-list-ol"></i>
            <span>Hàng đợi tiếp nhận buồng khám</span>
            <span className="queue-count">{filteredPatients.length} bệnh nhân</span>
          </div>
          <div className="filters">
            <div className="search">
              <i className="fa-solid fa-search"></i>
              <input
                type="text"
                placeholder="Tìm tên, mã BN, lượt khám..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <select
              className="select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="wait">Đang chờ khám</option>
              <option value="exam">Đang khám</option>
              <option value="cls">Cận lâm sàng (CLS)</option>
              <option value="done">Đã khám</option>
              <option value="cancel">Đã hủy</option>
            </select>
            <select
              className="select"
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Mọi mức ưu tiên</option>
              <option value="emergency">🚨 Cấp cứu (Emergency)</option>
              <option value="urgent">⚡ Ưu tiên (Urgent)</option>
              <option value="normal">Bình thường</option>
            </select>
            <button
              type="button"
              className="btn-reset-grid"
              onClick={handleResetGridSizes}
              title="Khôi phục kích thước cột và hàng về mặc định"
            >
              <i className="fa-solid fa-arrows-rotate"></i>
              <span>Đặt lại cỡ ô</span>
            </button>
            <button 
              className="icon-btn" 
              onClick={handleRefresh} 
              title="Làm mới hàng đợi"
              disabled={loading}
            >
              <i className={`fa-solid fa-rotate ${loading ? 'fa-spin' : ''}`}></i>
            </button>
          </div>
        </div>

        <div className="summary">
          <span><i className="dot wait"></i> Chờ khám: {stats.waiting}</span>
          <span><i className="dot exam"></i> Đang khám: {stats.examining}</span>
          <span><i className="dot cls"></i> CLS: {stats.cls}</span>
          <span><i className="dot done"></i> Đã khám: {stats.done}</span>
          {stats.emergency > 0 && (
            <span><i className="dot emergency"></i> Cấp cứu: {stats.emergency}</span>
          )}
        </div>

        {/* Excel High-Density Table with Resizing */}
        <div className="queue-table-wrap w-full overflow-x-auto border border-slate-300 rounded-none bg-white">
          {loading ? (
            <div className="queue-empty-state">
              <i className="fa-solid fa-circle-notch fa-spin"></i>
              <p>Đang tải danh sách hàng đợi...</p>
            </div>
          ) : error ? (
            <div className="queue-empty-state" style={{ color: '#dc2626' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ color: '#dc2626' }}></i>
              <p>{error}</p>
            </div>
          ) : (
            <table className="table-fixed w-max min-w-full border-collapse border border-slate-300 divide-x divide-y divide-slate-300 bg-white">
              <colgroup>
                {QUEUE_COLUMNS.map((col) => (
                  <col
                    key={col.key}
                    style={{
                      width: colWidths[col.key] || DEFAULT_QUEUE_COL_WIDTHS[col.key] || 100,
                    }}
                  />
                ))}
              </colgroup>
              <thead>
                <tr>
                  {QUEUE_COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      style={{
                        width: colWidths[col.key] || DEFAULT_QUEUE_COL_WIDTHS[col.key] || 100,
                      }}
                      className={`sticky top-0 z-10 bg-slate-100 border-b-2 border-slate-400 text-slate-800 font-bold text-xs uppercase tracking-tight px-2 py-2 select-none relative align-middle ${col.align}`}
                    >
                        <div
                          className={`w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap ${col.align}`}
                          title={col.label}
                        >
                          {col.label}
                        </div>
                        {/* Resizer Handle */}
                        <div
                          className="col-resizer"
                          onMouseDown={(e) => handleColResizeStart(e, col.key)}
                          title="Kéo chuột để chỉnh độ rộng cột"
                        />
                      </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={QUEUE_COLUMNS.length} className="border border-slate-300 text-center py-8">
                      <div className="queue-empty-state">
                        <i className="fa-regular fa-folder-open"></i>
                        <p>Không có bệnh nhân nào phù hợp với bộ lọc</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pagedPatients.map((patient, index) => {
                    const statusClass = getStatusClass(patient.trangThai);
                    const statusLabel = getStatusLabel(patient.trangThai);
                    const globalIndex = (currentPage - 1) * pageSize + index + 1;
                    const displayOrder = patient.soThuTu ?? globalIndex;
                    const isEmergency = patient.priority === 'EMERGENCY';
                    const isUrgent = patient.priority === 'URGENT';
                    const rowClass = isEmergency 
                      ? 'row-emergency' 
                      : isUrgent 
                      ? 'row-urgent' 
                      : statusClass === 'exam' 
                      ? 'current' 
                      : '';

                    const vitals = patient.vitals;
                    const rowHeight = rowHeights[patient.id] || DEFAULT_ROW_HEIGHT;

                    return (
                      <tr key={patient.id} className={rowClass} style={{ height: rowHeight }}>
                        {/* 1. STT Column with Row Resizer */}
                        <td
                          className="w-[54px] min-w-[54px] max-w-[54px] text-center font-mono font-bold text-slate-800 bg-slate-100 align-middle select-none relative"
                          style={{ height: rowHeight }}
                        >
                          <div
                            className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-1 flex items-center justify-center font-mono font-bold text-xs"
                            title={`STT: ${displayOrder}`}
                          >
                            {displayOrder}
                          </div>
                          {/* Row Resizer Handle */}
                          <div
                            className="row-resizer"
                            onMouseDown={(e) => handleRowResizeStart(e, patient.id, rowHeight)}
                            title="Kéo chuột để chỉnh chiều cao hàng"
                          />
                        </td>

                        {/* 2. Mã BN */}
                        <td className="text-center align-middle" style={{ height: rowHeight }}>
                          <div
                            className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-2 py-1 font-mono text-xs font-semibold text-slate-700"
                            title={patient.maBenhNhanNoiBo}
                          >
                            {patient.maBenhNhanNoiBo}
                          </div>
                        </td>

                        {/* 3. Mã LK */}
                        <td className="text-center align-middle" style={{ height: rowHeight }}>
                          <div
                            className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-2 py-1 font-mono text-xs font-bold text-slate-800"
                            title={formatVisitCode(patient.maLuotKham)}
                          >
                            {formatVisitCode(patient.maLuotKham)}
                          </div>
                        </td>

                        {/* 4. Họ tên Bệnh Nhân */}
                        <td className="text-left align-middle" style={{ height: rowHeight }}>
                          <div
                            className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-2 py-1 flex items-center gap-2"
                            title={`${patient.hoTen}${patient.hasAllergy ? ' (Có tiền sử dị ứng)' : ''}`}
                          >
                            <span className="font-semibold text-slate-900 text-sm truncate">
                              {patient.hoTen}
                            </span>
                            {patient.hasAllergy && (
                              <span className="allergy-badge-excel" title="Có tiền sử dị ứng">
                                <i className="fa-solid fa-triangle-exclamation"></i> Dị ứng
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 5. Giới tính / Tuổi */}
                        <td className="text-center align-middle" style={{ height: rowHeight }}>
                          <div
                            className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-2 py-1 text-slate-700 text-xs"
                            title={`${patient.gioiTinh === 'M' ? 'Nam' : 'Nữ'} · ${patient.tuoi} tuổi`}
                          >
                            {patient.gioiTinh === 'M' ? 'Nam' : 'Nữ'} · {patient.tuoi} tuổi
                          </div>
                        </td>

                        {/* 6. Khoa / Buồng khám */}
                        <td className="text-left align-middle" style={{ height: rowHeight }}>
                          <div
                            className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-2 py-1 text-slate-800 text-xs font-medium"
                            title={patient.tenKhoa || 'Chưa phân bổ'}
                          >
                            {patient.tenKhoa || '--'}
                          </div>
                        </td>

                        {/* 7. Phân loại (Triage) */}
                        <td className="text-center align-middle" style={{ height: rowHeight }}>
                          <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-1 flex items-center justify-center">
                            {isEmergency ? (
                              <span className="badge-priority emergency" title="Cấp cứu">
                                <i className="fa-solid fa-truck-medical"></i> CẤP CỨU
                              </span>
                            ) : isUrgent ? (
                              <span className="badge-priority urgent" title="Ưu tiên">
                                <i className="fa-solid fa-bolt"></i> ƯU TIÊN
                              </span>
                            ) : (
                              <span className="badge-priority normal" title="Bình thường">
                                Thường
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 8. Sinh hiệu */}
                        <td className="text-center align-middle" style={{ height: rowHeight }}>
                          <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-1 flex items-center justify-center">
                            {vitals ? (
                              <div 
                                className="vitals-cell-container"
                                onMouseEnter={() => setHoveredPatientVitals({ id: patient.id, vitals })}
                                onMouseLeave={() => setHoveredPatientVitals(null)}
                              >
                                <div className="vitals-chip-excel">
                                  <span style={{ 
                                    color: (vitals.spo2 ?? 0) > 0 && (vitals.spo2 ?? 0) < 95 ? '#dc2626' : 'inherit', 
                                    fontWeight: (vitals.spo2 ?? 0) > 0 && (vitals.spo2 ?? 0) < 95 ? 700 : 500 
                                  }}>
                                    SpO2: {vitals.spo2 ?? '--'}%
                                  </span>
                                  <span style={{ color: '#cbd5e1' }}>|</span>
                                  <span>HA: {vitals.huyetAp || '--'}</span>
                                </div>

                                {hoveredPatientVitals?.id === patient.id && (
                                  <div className="vitals-popover">
                                    <div className="vitals-popover-title">
                                      <i className="fa-solid fa-heart-pulse" style={{ color: '#f87171' }}></i>
                                      Sinh hiệu tiếp đón
                                    </div>
                                    <div className="vitals-popover-grid">
                                      <div>Mạch: <strong>{vitals.mach || '--'}</strong> bpm</div>
                                      <div>Huyết áp: <strong>{vitals.huyetAp || '--'}</strong> mmHg</div>
                                      <div>SpO2: <strong style={{ color: (vitals.spo2 ?? 0) > 0 && (vitals.spo2 ?? 0) < 95 ? '#f87171' : '#4ade80' }}>{vitals.spo2 ?? '--'}%</strong></div>
                                      <div>Nhiệt độ: <strong>{vitals.nhietDo || '--'}</strong>°C</div>
                                      <div>BMI: <strong>{vitals.bmi || '--'}</strong> kg/m²</div>
                                      <div>Nhịp thở: <strong>{vitals.nhipTho || '--'}</strong> l/p</div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>Chưa đo</span>
                            )}
                          </div>
                        </td>

                        {/* 9. Tiếp nhận */}
                        <td className="text-right align-middle" style={{ height: rowHeight }}>
                          <div 
                            className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-2 py-1 font-mono text-xs text-slate-700"
                            title={patient.thoiGianCapNhat ? `Thời gian: ${patient.thoiGianCapNhat}${getWaitDuration(patient.thoiGianCapNhat) ? ` (${getWaitDuration(patient.thoiGianCapNhat)})` : ''}` : 'Chưa có thông tin'}
                          >
                            {formatQueueTime(patient.thoiGianCapNhat)}
                          </div>
                        </td>

                        {/* 10. Trạng thái */}
                        <td className="text-center align-middle" style={{ height: rowHeight }}>
                          <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-1 flex items-center justify-center">
                            <span className={`status ${statusClass}`} title={statusLabel}>
                              <i className="fa-solid fa-circle"></i> {statusLabel}
                            </span>
                          </div>
                        </td>

                        {/* 11. Thao tác - dạng menu ... */}
                        <td className="text-center align-middle" style={{ height: rowHeight, position: 'relative' }}>
                          <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-1 flex items-center justify-center">
                            <button
                              type="button"
                              className="action-menu-trigger"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionMenuId(openActionMenuId === patient.id ? null : patient.id);
                              }}
                              title="Thao tác"
                              style={{
                                background: 'transparent',
                                border: '1px solid #cbd5e1',
                                borderRadius: '4px',
                                padding: '2px 8px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                lineHeight: 1,
                                color: '#475569',
                              }}
                            >
                              <i className="fa-solid fa-ellipsis"></i>
                            </button>

                            {openActionMenuId === patient.id && (
                              <div
                                className="action-menu-dropdown"
                                style={{
                                  position: 'absolute',
                                  top: '100%',
                                  right: 0,
                                  zIndex: 1000,
                                  background: 'white',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '4px',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                  padding: '6px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '6px',
                                  minWidth: '150px',
                                  marginTop: '2px',
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {patient.trangThai === 'DANG_KHAM' && (
                                  <button
                                    type="button"
                                    className="action exam"
                                    onClick={() => {
                                      handleOpenDetail(patient);
                                      setOpenActionMenuId(null);
                                    }}
                                    style={{ width: '100%', justifyContent: 'flex-start' }}
                                  >
                                    <i className="fa-solid fa-stethoscope"></i> Vào khám
                                  </button>
                                )}
                                {patient.trangThai === 'HOAN_THANH' && (
                                  <button
                                    type="button"
                                    className="action"
                                    onClick={() => {
                                      handleOpenDetail(patient);
                                      setOpenActionMenuId(null);
                                    }}
                                    style={{ width: '100%', justifyContent: 'flex-start' }}
                                  >
                                    <i className="fa-regular fa-eye"></i> Xem hồ sơ
                                  </button>
                                )}
                                {patient.trangThai !== 'DANG_KHAM' && patient.trangThai !== 'HOAN_THANH' && (
                                  <>
                                    <button
                                      type="button"
                                      className="action"
                                      onClick={() => {
                                        handleOpenDetail(patient);
                                        setOpenActionMenuId(null);
                                      }}
                                      title="Xem nhanh chi tiết"
                                      style={{ width: '100%', justifyContent: 'flex-start' }}
                                    >
                                      <i className="fa-regular fa-eye"></i> Xem
                                    </button>
                                    <button
                                      type="button"
                                      className={`action call ${isEmergency ? 'emergency-cta' : ''}`}
                                      onClick={() => {
                                        callPatient(patient);
                                        setOpenActionMenuId(null);
                                      }}
                                      style={{ width: '100%', justifyContent: 'flex-start' }}
                                    >
                                      <i className={isEmergency ? 'fa-solid fa-truck-medical' : 'fa-solid fa-bullhorn'}></i>
                                      {isEmergency ? 'Khám ngay' : 'Gọi khám'}
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Excel Standard Pagination & Status Footer */}
        <div className="queue-footer">
          <div className="pagination-info">
            <span>Hiển thị</span>
            <strong>{totalFiltered === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalFiltered)}</strong>
            <span>trên tổng số</span>
            <strong>{totalFiltered.toLocaleString('vi-VN')}</strong>
            <span>bệnh nhân trong hàng đợi</span>
          </div>

          <div className="pagination-controls">
            <div className="page-size-selector">
              <span>Dòng/trang:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="page-buttons">
              <button
                type="button"
                className="page-nav-btn"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(1)}
                title="Về trang đầu"
              >
                <i className="fa-solid fa-angles-left"></i>
              </button>
              <button
                type="button"
                className="page-nav-btn"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                title="Trang trước"
              >
                <i className="fa-solid fa-angle-left"></i>
              </button>

              <span className="page-current">
                Trang <strong>{currentPage}</strong> / {totalPages}
              </span>

              <button
                type="button"
                className="page-nav-btn"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                title="Trang sau"
              >
                <i className="fa-solid fa-angle-right"></i>
              </button>
              <button
                type="button"
                className="page-nav-btn"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(totalPages)}
                title="Đến trang cuối"
              >
                <i className="fa-solid fa-angles-right"></i>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default QueuePanel;