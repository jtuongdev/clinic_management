import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  doctorScheduleApi,
  type ScheduleItemDto,
  type AttendanceItemDto,
  type TodayStatusDto,
} from '../api/doctorSchedule.api';
import './DoctorSchedulePage.css';

// Default column widths for Schedule tab
const DEFAULT_SCHED_COL_WIDTHS: Record<string, number> = {
  stt: 48,
  ngayLam: 140,
  tenCa: 120,
  khungGio: 140,
  soGioLam: 80,
  khoaPhong: 230,
  nguonLich: 120,
  trangThai: 110,
  ghiChu: 260,
};

// Default column widths for Attendance tab
const DEFAULT_ATT_COL_WIDTHS: Record<string, number> = {
  stt: 48,
  ngayChamCong: 140,
  tenCa: 120,
  checkIn: 110,
  checkOut: 110,
  gioThucTe: 96,
  diMuonVeSom: 140,
  trangThai: 110,
  ghiChu: 260,
};

export const DoctorSchedulePage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'schedule' | 'attendance'>('schedule');
  const [todayStatus, setTodayStatus] = useState<TodayStatusDto | null>(null);
  const [schedules, setSchedules] = useState<ScheduleItemDto[]>([]);
  const [attendances, setAttendances] = useState<AttendanceItemDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [note, setNote] = useState<string>('');

  // Pagination states
  const [schedPage, setSchedPage] = useState<number>(1);
  const [schedPageSize, setSchedPageSize] = useState<number>(25);
  const [attPage, setAttPage] = useState<number>(1);
  const [attPageSize, setAttPageSize] = useState<number>(25);

  // Column Resizing states (pixel widths)
  const [schedColWidths, setSchedColWidths] = useState<Record<string, number>>(DEFAULT_SCHED_COL_WIDTHS);
  const [attColWidths, setAttColWidths] = useState<Record<string, number>>(DEFAULT_ATT_COL_WIDTHS);

  // Row Resizing states (pixel heights per row key)
  const [schedRowHeights, setSchedRowHeights] = useState<Record<string, number>>({});
  const [attRowHeights, setAttRowHeights] = useState<Record<string, number>>({});

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [todayRes, schedRes, attRes] = await Promise.all([
        doctorScheduleApi.getTodayStatus(),
        doctorScheduleApi.getMySchedule(),
        doctorScheduleApi.getMyAttendance(),
      ]);

      if (todayRes?.data) setTodayStatus(todayRes.data);

      const schedData = Array.isArray(schedRes?.data)
        ? schedRes.data
        : (Array.isArray(schedRes) ? schedRes : []);
      setSchedules(schedData);

      const attData = Array.isArray(attRes?.data)
        ? attRes.data
        : (Array.isArray(attRes) ? attRes : []);
      setAttendances(attData);
    } catch (err: any) {
      console.error('Lỗi tải dữ liệu lịch và chấm công:', err);
      toast.error('Không thể tải dữ liệu lịch làm việc. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') {
        void loadData();
      }
    };
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [loadData]);

  // Selected shift for check-in if multiple shifts exist
  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null);

  useEffect(() => {
    if (todayStatus?.schedule?.id) {
      setSelectedShiftId(todayStatus.schedule.id);
    }
  }, [todayStatus]);

  // =========================================================================
  // EXCEL RESIZING ENGINE (COLUMN & ROW DRAG HANDLERS)
  // =========================================================================

  const handleColResizeStart = (e: React.MouseEvent, colKey: string) => {
    e.preventDefault();
    e.stopPropagation();

    const isAttendance = activeTab === 'attendance';
    const startX = e.clientX;
    const currentWidth = isAttendance
      ? (attColWidths[colKey] || DEFAULT_ATT_COL_WIDTHS[colKey] || 100)
      : (schedColWidths[colKey] || DEFAULT_SCHED_COL_WIDTHS[colKey] || 100);

    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(50, currentWidth + deltaX); // Safe bound minWidth: 50px
      if (isAttendance) {
        setAttColWidths((prev) => ({ ...prev, [colKey]: newWidth }));
      } else {
        setSchedColWidths((prev) => ({ ...prev, [colKey]: newWidth }));
      }
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

  const handleRowResizeStart = (e: React.MouseEvent, rowKey: string, currentRowHeight: number) => {
    e.preventDefault();
    e.stopPropagation();

    const isAttendance = activeTab === 'attendance';
    const startY = e.clientY;
    const startHeight = currentRowHeight || 36;

    const onMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(32, startHeight + deltaY); // Safe bound minHeight: 32px
      if (isAttendance) {
        setAttRowHeights((prev) => ({ ...prev, [rowKey]: newHeight }));
      } else {
        setSchedRowHeights((prev) => ({ ...prev, [rowKey]: newHeight }));
      }
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
    if (activeTab === 'schedule') {
      setSchedColWidths(DEFAULT_SCHED_COL_WIDTHS);
      setSchedRowHeights({});
    } else {
      setAttColWidths(DEFAULT_ATT_COL_WIDTHS);
      setAttRowHeights({});
    }
    toast.success('Đã khôi phục kích thước ô lưới mặc định');
  };

  // Handle Check-in / Check-out
  const handleCheckIn = async (shiftId?: number) => {
    try {
      setActionLoading(true);
      const targetId = shiftId || selectedShiftId || todayStatus?.schedule?.id;
      const res = await doctorScheduleApi.checkIn(note, targetId || undefined);
      toast.success(res.message || 'Check-in thành công!');
      setNote('');
      await loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Check-in thất bại.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      const res = await doctorScheduleApi.checkOut(note);
      toast.success(res.message || 'Check-out thành công!');
      setNote('');
      await loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Check-out thất bại.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dStr?: string) => {
    if (!dStr) return '--';
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return dStr;
    return d.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (tStr?: string) => {
    if (!tStr) return '--:--';
    if (tStr.includes('T')) {
      const d = new Date(tStr);
      if (isNaN(d.getTime())) return tStr;
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
    return tStr.substring(0, 5);
  };

  const formatTimeSpan = (t?: string | any) => {
    if (!t) return '--:--';
    if (typeof t === 'string') return t.substring(0, 5);
    return String(t).substring(0, 5);
  };

  const renderSourceBadge = (src: string) => {
    if (src === 'TU_DONG_THEO_LICH_MAU') {
      return <span className="badge-source auto" title="Tự động sinh theo lịch mẫu"><i className="fa-solid fa-wand-magic-sparkles"></i> Lịch Mẫu</span>;
    }
    if (src === 'PHAT_SINH_THU_CONG') {
      return <span className="badge-source manual" title="Phân công đột xuất"><i className="fa-solid fa-hand"></i> Đột Xuất</span>;
    }
    if (src === 'DOI_CA') {
      return <span className="badge-source swap" title="Lịch được đổi ca"><i className="fa-solid fa-arrow-right-arrow-left"></i> Đổi Ca</span>;
    }
    return <span className="badge-source" title={src}>{src || 'Tiêu chuẩn'}</span>;
  };

  const renderAttendanceStatus = (status: string) => {
    switch (status) {
      case 'DUNG_GIO':
        return <span className="badge-status-tag on-time"><i className="fa-solid fa-circle-check"></i> Đúng giờ</span>;
      case 'DI_MUON':
        return <span className="badge-status-tag late"><i className="fa-solid fa-clock"></i> Đi muộn</span>;
      case 'VE_SOM':
        return <span className="badge-status-tag late"><i className="fa-solid fa-person-walking-arrow-right"></i> Về sớm</span>;
      case 'DI_MUON_VE_SOM':
        return <span className="badge-status-tag late"><i className="fa-solid fa-triangle-exclamation"></i> Muộn/Sớm</span>;
      case 'VANG_MAT':
        return <span className="badge-status-tag absent"><i className="fa-solid fa-circle-xmark"></i> Vắng mặt</span>;
      default:
        return <span className="badge-status-tag on-time">{status || 'Hoàn tất'}</span>;
    }
  };

  const currentActiveShift = todayStatus?.shifts?.find((s) => s.id === selectedShiftId) ||
    todayStatus?.shifts?.find((s) => s.isCurrentActive) ||
    todayStatus?.shifts?.[0];

  // Paginated data
  const schedTotal = schedules.length;
  const schedTotalPages = Math.max(1, Math.ceil(schedTotal / schedPageSize));
  const paginatedSchedules = useMemo(() => {
    const start = (schedPage - 1) * schedPageSize;
    return schedules.slice(start, start + schedPageSize);
  }, [schedules, schedPage, schedPageSize]);

  const attTotal = attendances.length;
  const attTotalPages = Math.max(1, Math.ceil(attTotal / attPageSize));
  const paginatedAttendances = useMemo(() => {
    const start = (attPage - 1) * attPageSize;
    return attendances.slice(start, start + attPageSize);
  }, [attendances, attPage, attPageSize]);

  return (
    <div className="doctor-schedule-page">
      <div className="sched-header">
        <div className="sched-title">
          <i className="fa-solid fa-calendar-check" style={{ fontSize: '24px', color: 'var(--primary)' }}></i>
          <div>
            <h2>Lịch Làm Việc & Chấm Công</h2>
            <div className="sched-subtitle">Theo dõi lịch phân ca và chấm công tự động khớp ca theo thời gian thực</div>
          </div>
        </div>
        <button className="btn" onClick={loadData} disabled={loading}>
          <i className={`fa-solid fa-arrows-rotate ${loading ? 'fa-spin' : ''}`}></i> Làm mới
        </button>
      </div>

      {/* Top Cards: Digital Clock & Check-in action */}
      <div className="top-cards-row">
        {/* Digital Clock */}
        <div className="clock-card">
          <div className="clock-badge">
            <i className="fa-solid fa-satellite-dish"></i> Đồng hồ hệ thống
          </div>
          <div>
            <div className="clock-time">
              {currentTime.toLocaleTimeString('vi-VN', { hour12: false })}
            </div>
            <div className="clock-date">
              {currentTime.toLocaleDateString('vi-VN', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>

        {/* Action Check-in Card */}
        <div className="action-card">
          <div className="action-card-header">
            <h3>
              <i className="fa-solid fa-fingerprint" style={{ color: 'var(--primary)' }}></i>
              Chấm Công Ca Làm Việc Hôm Nay
            </h3>
            {todayStatus?.attendance?.checkIn && !todayStatus.attendance.checkOut && (
              <span className="badge-status-tag on-time">
                <i className="fa-solid fa-circle-notch fa-spin"></i> Đang trong ca
              </span>
            )}
            {todayStatus?.attendance?.checkOut && (
              <span className="badge-status-tag on-time">
                <i className="fa-solid fa-circle-check"></i> Đã hoàn thành ca
              </span>
            )}
            {!todayStatus?.attendance?.checkIn && todayStatus?.hasSchedule && (
              <span className="badge-status-tag late">
                <i className="fa-solid fa-circle-pause"></i> Chưa Check-in
              </span>
            )}
            {!todayStatus?.hasSchedule && (
              <span className="badge-status-tag" style={{ background: '#f1f5f9', color: '#64748b' }}>
                Hôm nay không có ca
              </span>
            )}
          </div>

          {/* Multiple Shifts pills */}
          {todayStatus?.shifts && todayStatus.shifts.length > 1 && (
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
              {todayStatus.shifts.map((shift) => {
                const isSelected = (selectedShiftId === shift.id) || (!selectedShiftId && shift.isCurrentActive);
                let badgeClass = 'badge-status-tag on-time';
                let statusLabel = 'Chưa check-in';
                if (shift.checkIn && !shift.checkOut) {
                  statusLabel = 'Đang trực';
                  badgeClass = 'badge-status-tag on-time';
                } else if (shift.checkOut) {
                  statusLabel = 'Đã hoàn thành';
                  badgeClass = 'badge-status-tag on-time';
                } else if (shift.isExpired) {
                  statusLabel = 'Đã quá hạn';
                  badgeClass = 'badge-status-tag absent';
                } else if (shift.canCheckIn) {
                  statusLabel = 'Sẵn sàng check-in';
                  badgeClass = 'badge-status-tag on-time';
                }

                return (
                  <button
                    key={shift.id}
                    type="button"
                    onClick={() => setSelectedShiftId(shift.id)}
                    style={{
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--line)',
                      background: isSelected ? 'var(--primary-soft)' : '#fff',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: isSelected ? 700 : 500,
                    }}
                  >
                    <span>{shift.tenCa} ({shift.thoiGianBatDau.substring(0, 5)} - {shift.thoiGianKetThuc.substring(0, 5)})</span>
                    <span className={badgeClass} style={{ fontSize: '9px', padding: '1px 5px' }}>{statusLabel}</span>
                  </button>
                );
              })}
            </div>
          )}

          {currentActiveShift ? (
            <div className="shift-info-box">
              <div>
                <div className="shift-title">
                  <i className="fa-regular fa-clock"></i> {currentActiveShift.tenCa} ({currentActiveShift.thoiGianBatDau.substring(0, 5)} - {currentActiveShift.thoiGianKetThuc.substring(0, 5)})
                </div>
                <div className="shift-details">
                  <span><i className="fa-solid fa-hospital-user"></i> Khoa: <strong>{currentActiveShift.tenKhoa || 'Đang cập nhật'}</strong></span>
                  <span><i className="fa-solid fa-door-open"></i> Phòng: <strong>{currentActiveShift.tenPhongKham || 'Chưa xếp'}</strong></span>
                  <span>Nguồn: {renderSourceBadge(currentActiveShift.nguonLich)}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '12px' }}>
                {currentActiveShift.checkIn && (
                  <div>Vào: <strong>{formatTime(currentActiveShift.checkIn)}</strong></div>
                )}
                {currentActiveShift.checkOut && (
                  <div>Ra: <strong>{formatTime(currentActiveShift.checkOut)}</strong></div>
                )}
              </div>
            </div>
          ) : todayStatus?.schedule ? (
            <div className="shift-info-box">
              <div>
                <div className="shift-title">
                  <i className="fa-regular fa-clock"></i> {todayStatus.schedule.tenCa} ({todayStatus.schedule.thoiGianBatDau?.substring(0, 5)} - {todayStatus.schedule.thoiGianKetThuc?.substring(0, 5)})
                </div>
                <div className="shift-details">
                  <span><i className="fa-solid fa-hospital-user"></i> Khoa: <strong>{todayStatus.schedule.tenKhoa || 'Đang cập nhật'}</strong></span>
                  <span><i className="fa-solid fa-door-open"></i> Phòng: <strong>{todayStatus.schedule.tenPhongKham || 'Chưa xếp'}</strong></span>
                  <span>Nguồn: {renderSourceBadge(todayStatus.schedule.nguonLich)}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '12px' }}>
                {todayStatus.attendance?.checkIn && (
                  <div>Vào: <strong>{formatTime(todayStatus.attendance.checkIn)}</strong></div>
                )}
                {todayStatus.attendance?.checkOut && (
                  <div>Ra: <strong>{formatTime(todayStatus.attendance.checkOut)}</strong></div>
                )}
              </div>
            </div>
          ) : (
            <div className="shift-info-box" style={{ background: '#f8fafc', borderLeftColor: '#94a3b8' }}>
              <span style={{ color: 'var(--muted)' }}>
                <i className="fa-solid fa-info-circle"></i> Bạn không có lịch trực được phân bổ trong ngày hôm nay ({new Date().toLocaleDateString('vi-VN')}).
              </span>
            </div>
          )}

          <div className="action-buttons-row">
            <input
              type="text"
              placeholder="Ghi chú chấm công (tùy chọn)..."
              className="note-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={actionLoading}
            />
            <button
              className="btn-checkin"
              onClick={() => handleCheckIn(selectedShiftId || undefined)}
              disabled={actionLoading || !(currentActiveShift ? currentActiveShift.canCheckIn : todayStatus?.canCheckIn)}
              title={!(currentActiveShift ? currentActiveShift.canCheckIn : todayStatus?.canCheckIn) ? 'Hiện không thể check-in' : 'Bấm để Check-in vào ca'}
            >
              <i className="fa-solid fa-right-to-bracket"></i> Check-in Ca
            </button>
            <button
              className="btn-checkout"
              onClick={handleCheckOut}
              disabled={actionLoading || !(currentActiveShift ? currentActiveShift.canCheckOut : todayStatus?.canCheckOut)}
              title={!(currentActiveShift ? currentActiveShift.canCheckOut : todayStatus?.canCheckOut) ? 'Chỉ check-out sau khi đã check-in' : 'Bấm để Check-out kết thúc ca'}
            >
              <i className="fa-solid fa-right-from-bracket"></i> Check-out Ca
            </button>
          </div>
        </div>
      </div>

      {/* Main Table / Tabs */}
      <div className="content-card">
        <div className="card-nav-tabs">
          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('schedule');
                setSchedPage(1);
              }}
            >
              <i className="fa-solid fa-calendar-days"></i> Lịch Làm Việc ({schedules.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('attendance');
                setAttPage(1);
              }}
            >
              <i className="fa-solid fa-clipboard-user"></i> Lịch Sử Chấm Công ({attendances.length})
            </button>
          </div>

          <div className="table-toolbar">
            <span style={{ fontSize: '11px', color: 'var(--muted)', marginRight: '4px' }}>
              <i className="fa-solid fa-arrows-left-right-to-line"></i> Kéo mép cột/hàng để đổi kích cỡ
            </span>
            <button
              type="button"
              className="btn-reset-grid"
              onClick={handleResetGridSizes}
              title="Đặt lại độ rộng cột và chiều cao hàng về mặc định"
            >
              <i className="fa-solid fa-table-cells"></i> Đặt lại cỡ ô
            </button>
          </div>
        </div>

        <div className="table-container">
          {activeTab === 'schedule' ? (
            <div className="sched-table-wrap w-full overflow-auto border border-slate-300 rounded-none bg-white">
              <table className="table-fixed w-max min-w-full border-collapse border border-slate-300 divide-x divide-y divide-slate-300">
                <colgroup>
                  <col style={{ width: `${schedColWidths.stt}px` }} />
                  <col style={{ width: `${schedColWidths.ngayLam}px` }} />
                  <col style={{ width: `${schedColWidths.tenCa}px` }} />
                  <col style={{ width: `${schedColWidths.khungGio}px` }} />
                  <col style={{ width: `${schedColWidths.soGioLam}px` }} />
                  <col style={{ width: `${schedColWidths.khoaPhong}px` }} />
                  <col style={{ width: `${schedColWidths.nguonLich}px` }} />
                  <col style={{ width: `${schedColWidths.trangThai}px` }} />
                  <col style={{ width: `${schedColWidths.ghiChu}px` }} />
                </colgroup>
                <thead>
                  <tr>
                    <th
                      style={{ width: schedColWidths.stt }}
                      className="relative w-12 text-center font-mono font-semibold text-slate-500 bg-slate-100 align-middle px-2 py-1.5 border border-slate-300 select-none uppercase text-xs"
                    >
                      <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" title="Số thứ tự">
                        STT
                      </div>
                      <div
                        className="col-resizer w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 select-none z-20"
                        onMouseDown={(e) => handleColResizeStart(e, 'stt')}
                        onClick={(e) => e.stopPropagation()}
                        title="Kéo chuột để đổi độ rộng cột"
                      />
                    </th>

                    <th
                      style={{ width: schedColWidths.ngayLam }}
                      className="relative bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle px-2 py-1.5 border border-slate-300 select-none text-center"
                    >
                      <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" title="Ngày Làm">
                        Ngày Làm
                      </div>
                      <div
                        className="col-resizer w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 select-none z-20"
                        onMouseDown={(e) => handleColResizeStart(e, 'ngayLam')}
                        onClick={(e) => e.stopPropagation()}
                        title="Kéo chuột để đổi độ rộng cột"
                      />
                    </th>

                    <th
                      style={{ width: schedColWidths.tenCa }}
                      className="relative bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle px-2 py-1.5 border border-slate-300 select-none text-center"
                    >
                      <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" title="Ca Trực">
                        Ca Trực
                      </div>
                      <div
                        className="col-resizer w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 select-none z-20"
                        onMouseDown={(e) => handleColResizeStart(e, 'tenCa')}
                        onClick={(e) => e.stopPropagation()}
                        title="Kéo chuột để đổi độ rộng cột"
                      />
                    </th>

                    <th
                      style={{ width: schedColWidths.khungGio }}
                      className="relative bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle px-2 py-1.5 border border-slate-300 select-none text-center"
                    >
                      <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" title="Khung Giờ">
                        Khung Giờ
                      </div>
                      <div
                        className="col-resizer w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 select-none z-20"
                        onMouseDown={(e) => handleColResizeStart(e, 'khungGio')}
                        onClick={(e) => e.stopPropagation()}
                        title="Kéo chuột để đổi độ rộng cột"
                      />
                    </th>

                    <th
                      style={{ width: schedColWidths.soGioLam }}
                      className="relative bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle px-2 py-1.5 border border-slate-300 select-none text-right"
                    >
                      <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" title="Số Giờ">
                        Số Giờ
                      </div>
                      <div
                        className="col-resizer w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 select-none z-20"
                        onMouseDown={(e) => handleColResizeStart(e, 'soGioLam')}
                        onClick={(e) => e.stopPropagation()}
                        title="Kéo chuột để đổi độ rộng cột"
                      />
                    </th>

                    <th
                      style={{ width: schedColWidths.khoaPhong }}
                      className="relative bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle px-2 py-1.5 border border-slate-300 select-none text-left"
                    >
                      <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" title="Khoa / Phòng Khám">
                        Khoa / Phòng Khám
                      </div>
                      <div
                        className="col-resizer w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 select-none z-20"
                        onMouseDown={(e) => handleColResizeStart(e, 'khoaPhong')}
                        onClick={(e) => e.stopPropagation()}
                        title="Kéo chuột để đổi độ rộng cột"
                      />
                    </th>

                    <th
                      style={{ width: schedColWidths.nguonLich }}
                      className="relative bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle px-2 py-1.5 border border-slate-300 select-none text-center"
                    >
                      <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" title="Nguồn Lịch">
                        Nguồn Lịch
                      </div>
                      <div
                        className="col-resizer w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 select-none z-20"
                        onMouseDown={(e) => handleColResizeStart(e, 'nguonLich')}
                        onClick={(e) => e.stopPropagation()}
                        title="Kéo chuột để đổi độ rộng cột"
                      />
                    </th>

                    <th
                      style={{ width: schedColWidths.trangThai }}
                      className="relative bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle px-2 py-1.5 border border-slate-300 select-none text-center"
                    >
                      <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" title="Trạng Thái">
                        Trạng Thái
                      </div>
                      <div
                        className="col-resizer w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 select-none z-20"
                        onMouseDown={(e) => handleColResizeStart(e, 'trangThai')}
                        onClick={(e) => e.stopPropagation()}
                        title="Kéo chuột để đổi độ rộng cột"
                      />
                    </th>

                    <th
                      style={{ width: schedColWidths.ghiChu }}
                      className="relative bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle px-2 py-1.5 border border-slate-300 select-none text-left"
                    >
                      <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" title="Ghi Chú">
                        Ghi Chú
                      </div>
                      <div
                        className="col-resizer w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 select-none z-20"
                        onMouseDown={(e) => handleColResizeStart(e, 'ghiChu')}
                        onClick={(e) => e.stopPropagation()}
                        title="Kéo chuột để đổi độ rộng cột"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="text-center align-middle h-24 py-8 border border-slate-300 text-slate-500">
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i> Đang tải dữ liệu lịch làm việc...
                      </td>
                    </tr>
                  ) : paginatedSchedules.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center align-middle h-24 py-8 border border-slate-300 text-slate-400">
                        Chưa có lịch làm việc được phân bổ.
                      </td>
                    </tr>
                  ) : (
                    paginatedSchedules.map((s, idx) => {
                      const stt = (schedPage - 1) * schedPageSize + idx + 1;
                      const rowKey = `sched-row-${s.id || idx}`;
                      const rowHeight = schedRowHeights[rowKey] || 36;
                      const startTime = formatTimeSpan(s.thoiGianBatDau);
                      const endTime = formatTimeSpan(s.thoiGianKetThuc);
                      const clinicRoom = s.tenPhongKham ? ` - ${s.tenPhongKham}` : '';
                      const fullLocation = `${s.tenKhoa || '---'}${clinicRoom}`;

                      return (
                        <tr
                          key={s.id || idx}
                          style={{ height: `${rowHeight}px` }}
                          className="even:bg-slate-50/50 hover:bg-sky-50/60 transition-colors"
                        >
                          {/* STT Cell with Row Resizer Handle */}
                          <td className="relative w-12 text-center font-mono font-semibold text-slate-500 bg-slate-100 align-middle px-2 py-1.5 border border-slate-300 select-none">
                            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-center" title={`Dòng ${stt}`}>
                              {stt}
                            </div>
                            <div
                              className="row-resizer h-1.5 w-full absolute left-0 bottom-0 cursor-row-resize hover:bg-blue-500 active:bg-blue-600 select-none z-20"
                              onMouseDown={(e) => handleRowResizeStart(e, rowKey, rowHeight)}
                              onClick={(e) => e.stopPropagation()}
                              title="Kéo chuột để đổi chiều cao dòng"
                            />
                          </td>

                          <td className="text-center align-middle px-2 py-1.5 border border-slate-300">
                            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-center font-semibold text-slate-800" title={formatDate(s.ngayLam)}>
                              {formatDate(s.ngayLam)}
                            </div>
                          </td>

                          <td className="text-center align-middle px-2 py-1.5 border border-slate-300">
                            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-center font-semibold text-sky-800" title={s.tenCa || 'Theo ca'}>
                              {s.tenCa || 'Theo ca'}
                            </div>
                          </td>

                          <td className="text-center align-middle px-2 py-1.5 border border-slate-300 font-mono text-xs text-slate-700">
                            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-center" title={`${startTime} - ${endTime}`}>
                              {startTime} - {endTime}
                            </div>
                          </td>

                          <td className="text-right align-middle px-2 py-1.5 border border-slate-300 font-mono font-semibold text-slate-900">
                            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-end" title={`${Number(s.soGioLam || 0).toFixed(1)} giờ`}>
                              {s.soGioLam != null ? `${Number(s.soGioLam).toFixed(1)}h` : '--'}
                            </div>
                          </td>

                          <td className="text-left align-middle px-2 py-1.5 border border-slate-300">
                            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-start text-slate-800" title={fullLocation}>
                              <strong>{s.tenKhoa || '---'}</strong>
                              {s.tenPhongKham && <span className="text-slate-500 font-normal ml-1">({s.tenPhongKham})</span>}
                            </div>
                          </td>

                          <td className="text-center align-middle px-2 py-1.5 border border-slate-300">
                            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-center" title={s.nguonLich}>
                              {renderSourceBadge(s.nguonLich)}
                            </div>
                          </td>

                          <td className="text-center align-middle px-2 py-1.5 border border-slate-300">
                            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-center" title={s.trangThai === 'LAM_VIEC' ? 'Làm việc' : 'Nghỉ phép'}>
                              {s.trangThai === 'LAM_VIEC' ? (
                                <span className="badge-status-tag on-time" title="Trực ca làm việc">Làm việc</span>
                              ) : (
                                <span className="badge-status-tag absent" title="Nghỉ phép">Nghỉ phép</span>
                              )}
                            </div>
                          </td>

                          <td className="text-left align-middle px-2 py-1.5 border border-slate-300">
                            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-start text-slate-500 text-xs" title={s.ghiChu || '---'}>
                              {s.ghiChu || '---'}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="sched-table-wrap w-full overflow-auto border border-slate-300 rounded-none bg-white">
              <table className="table-fixed w-max min-w-full border-collapse border border-slate-300 divide-x divide-y divide-slate-300">
                <colgroup>
                  <col style={{ width: `${attColWidths.stt}px` }} />
                  <col style={{ width: `${attColWidths.ngayChamCong}px` }} />
                  <col style={{ width: `${attColWidths.tenCa}px` }} />
                  <col style={{ width: `${attColWidths.checkIn}px` }} />
                  <col style={{ width: `${attColWidths.checkOut}px` }} />
                  <col style={{ width: `${attColWidths.gioThucTe}px` }} />
                  <col style={{ width: `${attColWidths.diMuonVeSom}px` }} />
                  <col style={{ width: `${attColWidths.trangThai}px` }} />
                  <col style={{ width: `${attColWidths.ghiChu}px` }} />
                </colgroup>
                <thead>
                  <tr>
                    <th
                      style={{ width: attColWidths.stt }}
                      className="relative w-12 text-center font-mono font-semibold text-slate-500 bg-slate-100 align-middle px-2 py-1.5 border border-slate-300 select-none uppercase text-xs"
                    >
                      <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" title="Số thứ tự">
                        STT
                      </div>
                      <div
                        className="col-resizer w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 select-none z-20"
                        onMouseDown={(e) => handleColResizeStart(e, 'stt')}
                        onClick={(e) => e.stopPropagation()}
                        title="Kéo chuột để đổi độ rộng cột"
                      />
                    </th>

                    <th
                      style={{ width: attColWidths.ngayChamCong }}
                      className="relative bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle px-2 py-1.5 border border-slate-300 select-none text-center"
                    >
                      <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" title="Ngày Chấm Công">
                        Ngày Chấm Công
                      </div>
                      <div
                        className="col-resizer w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 select-none z-20"
                        onMouseDown={(e) => handleColResizeStart(e, 'ngayChamCong')}
                        onClick={(e) => e.stopPropagation()}
                        title="Kéo chuột để đổi độ rộng cột"
                      />
                    </th>

                    <th
                      style={{ width: attColWidths.tenCa }}
                      className="relative bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle px-2 py-1.5 border border-slate-300 select-none text-center"
                    >
                      <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" title="Ca Trực">
                        Ca Trực
                      </div>
                      <div
                        className="col-resizer w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 select-none z-20"
                        onMouseDown={(e) => handleColResizeStart(e, 'tenCa')}
                        onClick={(e) => e.stopPropagation()}
                        title="Kéo chuột để đổi độ rộng cột"
                      />
                    </th>

                    <th
                      style={{ width: attColWidths.checkIn }}
                      className="relative bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle px-2 py-1.5 border border-slate-300 select-none text-center"
                    >
                      <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" title="Giờ Check-in">
                        Check-in
                      </div>
                      <div
                        className="col-resizer w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 select-none z-20"
                        onMouseDown={(e) => handleColResizeStart(e, 'checkIn')}
                        onClick={(e) => e.stopPropagation()}
                        title="Kéo chuột để đổi độ rộng cột"
                      />
                    </th>

                    <th
                      style={{ width: attColWidths.checkOut }}
                      className="relative bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle px-2 py-1.5 border border-slate-300 select-none text-center"
                    >
                      <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" title="Giờ Check-out">
                        Check-out
                      </div>
                      <div
                        className="col-resizer w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 select-none z-20"
                        onMouseDown={(e) => handleColResizeStart(e, 'checkOut')}
                        onClick={(e) => e.stopPropagation()}
                        title="Kéo chuột để đổi độ rộng cột"
                      />
                    </th>

                    <th
                      style={{ width: attColWidths.gioThucTe }}
                      className="relative bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle px-2 py-1.5 border border-slate-300 select-none text-right"
                    >
                      <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" title="Giờ Thực Tế">
                        Giờ Thực Tế
                      </div>
                      <div
                        className="col-resizer w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 select-none z-20"
                        onMouseDown={(e) => handleColResizeStart(e, 'gioThucTe')}
                        onClick={(e) => e.stopPropagation()}
                        title="Kéo chuột để đổi độ rộng cột"
                      />
                    </th>

                    <th
                      style={{ width: attColWidths.diMuonVeSom }}
                      className="relative bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle px-2 py-1.5 border border-slate-300 select-none text-center"
                    >
                      <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" title="Đi Muộn / Về Sớm">
                        Đi Muộn / Về Sớm
                      </div>
                      <div
                        className="col-resizer w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 select-none z-20"
                        onMouseDown={(e) => handleColResizeStart(e, 'diMuonVeSom')}
                        onClick={(e) => e.stopPropagation()}
                        title="Kéo chuột để đổi độ rộng cột"
                      />
                    </th>

                    <th
                      style={{ width: attColWidths.trangThai }}
                      className="relative bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle px-2 py-1.5 border border-slate-300 select-none text-center"
                    >
                      <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" title="Trạng Thái">
                        Trạng Thái
                      </div>
                      <div
                        className="col-resizer w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 select-none z-20"
                        onMouseDown={(e) => handleColResizeStart(e, 'trangThai')}
                        onClick={(e) => e.stopPropagation()}
                        title="Kéo chuột để đổi độ rộng cột"
                      />
                    </th>

                    <th
                      style={{ width: attColWidths.ghiChu }}
                      className="relative bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-tight border-b-2 border-slate-400 sticky top-0 z-10 align-middle px-2 py-1.5 border border-slate-300 select-none text-left"
                    >
                      <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap" title="Ghi Chú">
                        Ghi Chú
                      </div>
                      <div
                        className="col-resizer w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-500 active:bg-blue-600 select-none z-20"
                        onMouseDown={(e) => handleColResizeStart(e, 'ghiChu')}
                        onClick={(e) => e.stopPropagation()}
                        title="Kéo chuột để đổi độ rộng cột"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="text-center align-middle h-24 py-8 border border-slate-300 text-slate-500">
                        <i className="fa-solid fa-spinner fa-spin mr-2"></i> Đang tải lịch sử chấm công...
                      </td>
                    </tr>
                  ) : paginatedAttendances.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center align-middle h-24 py-8 border border-slate-300 text-slate-400">
                        Chưa có bản ghi chấm công nào trong kỳ này.
                      </td>
                    </tr>
                  ) : (
                    paginatedAttendances.map((a, idx) => {
                      const stt = (attPage - 1) * attPageSize + idx + 1;
                      const rowKey = `att-row-${a.id || idx}`;
                      const rowHeight = attRowHeights[rowKey] || 36;
                      const lateMin = a.phutDiMuon ?? 0;
                      const earlyMin = a.phutVeSom ?? 0;

                      return (
                        <tr
                          key={a.id || idx}
                          style={{ height: `${rowHeight}px` }}
                          className="even:bg-slate-50/50 hover:bg-sky-50/60 transition-colors"
                        >
                          {/* STT Cell with Row Resizer Handle */}
                          <td className="relative w-12 text-center font-mono font-semibold text-slate-500 bg-slate-100 align-middle px-2 py-1.5 border border-slate-300 select-none">
                            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-center" title={`Dòng ${stt}`}>
                              {stt}
                            </div>
                            <div
                              className="row-resizer h-1.5 w-full absolute left-0 bottom-0 cursor-row-resize hover:bg-blue-500 active:bg-blue-600 select-none z-20"
                              onMouseDown={(e) => handleRowResizeStart(e, rowKey, rowHeight)}
                              onClick={(e) => e.stopPropagation()}
                              title="Kéo chuột để đổi chiều cao dòng"
                            />
                          </td>

                          <td className="text-center align-middle px-2 py-1.5 border border-slate-300">
                            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-center font-semibold text-slate-800" title={formatDate(a.ngayChamCong)}>
                              {formatDate(a.ngayChamCong)}
                            </div>
                          </td>

                          <td className="text-center align-middle px-2 py-1.5 border border-slate-300">
                            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-center text-slate-800 font-medium" title={a.tenCa || 'Theo ca trực'}>
                              {a.tenCa || 'Theo ca trực'}
                            </div>
                          </td>

                          <td className="text-center align-middle px-2 py-1.5 border border-slate-300 font-mono text-xs">
                            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-center" title={a.checkIn ? formatTime(a.checkIn) : 'Chưa check-in'}>
                              {a.checkIn ? (
                                <span className="font-semibold text-emerald-700">
                                  <i className="fa-solid fa-arrow-down-long text-[10px] mr-1"></i>
                                  {formatTime(a.checkIn)}
                                </span>
                              ) : (
                                <span className="text-slate-400">---</span>
                              )}
                            </div>
                          </td>

                          <td className="text-center align-middle px-2 py-1.5 border border-slate-300 font-mono text-xs">
                            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-center" title={a.checkOut ? formatTime(a.checkOut) : 'Chưa check-out'}>
                              {a.checkOut ? (
                                <span className="font-semibold text-amber-700">
                                  <i className="fa-solid fa-arrow-up-long text-[10px] mr-1"></i>
                                  {formatTime(a.checkOut)}
                                </span>
                              ) : (
                                <span className="text-slate-400">---</span>
                              )}
                            </div>
                          </td>

                          <td className="text-right align-middle px-2 py-1.5 border border-slate-300 font-mono font-semibold text-slate-900">
                            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-end" title={a.gioLamThucTe != null ? `${Number(a.gioLamThucTe).toFixed(1)} giờ` : '---'}>
                              {a.gioLamThucTe != null ? `${Number(a.gioLamThucTe).toFixed(1)}h` : '---'}
                            </div>
                          </td>

                          <td className="text-center align-middle px-2 py-1.5 border border-slate-300 text-xs">
                            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-center" title={lateMin > 0 || earlyMin > 0 ? `Muộn: ${lateMin}p, Sớm: ${earlyMin}p` : 'Đúng giờ'}>
                              {lateMin > 0 && (
                                <span className="text-rose-600 font-semibold mr-1.5">
                                  Muộn {lateMin}p
                                </span>
                              )}
                              {earlyMin > 0 && (
                                <span className="text-amber-600 font-semibold">
                                  Sớm {earlyMin}p
                                </span>
                              )}
                              {lateMin === 0 && earlyMin === 0 && (
                                <span className="text-slate-400">Không</span>
                              )}
                            </div>
                          </td>

                          <td className="text-center align-middle px-2 py-1.5 border border-slate-300">
                            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-center" title={a.trangThai}>
                              {renderAttendanceStatus(a.trangThai)}
                            </div>
                          </td>

                          <td className="text-left align-middle px-2 py-1.5 border border-slate-300">
                            <div className="w-full h-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center justify-start text-slate-500 text-xs" title={a.ghiChu || '---'}>
                              {a.ghiChu || '---'}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Excel Status Bar & Pagination Footer */}
          {activeTab === 'schedule' ? (
            <div className="sched-pagination">
              <div className="pagination-info">
                <span>Hiển thị</span>
                <strong>{schedTotal === 0 ? 0 : (schedPage - 1) * schedPageSize + 1} - {Math.min(schedPage * schedPageSize, schedTotal)}</strong>
                <span>trên tổng số</span>
                <strong>{schedTotal.toLocaleString('vi-VN')}</strong>
                <span>ca làm việc</span>
              </div>

              <div className="pagination-controls">
                <div className="page-size-selector">
                  <span>Dòng/trang:</span>
                  <select
                    value={schedPageSize}
                    onChange={(e) => {
                      setSchedPageSize(Number(e.target.value));
                      setSchedPage(1);
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
                    disabled={schedPage <= 1}
                    onClick={() => setSchedPage(1)}
                    title="Về trang đầu"
                  >
                    <i className="fa-solid fa-angles-left"></i>
                  </button>
                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={schedPage <= 1}
                    onClick={() => setSchedPage(p => Math.max(1, p - 1))}
                    title="Trang trước"
                  >
                    <i className="fa-solid fa-angle-left"></i>
                  </button>

                  <span className="page-current">
                    Trang <strong>{schedPage}</strong> / {schedTotalPages}
                  </span>

                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={schedPage >= schedTotalPages}
                    onClick={() => setSchedPage(p => Math.min(schedTotalPages, p + 1))}
                    title="Trang sau"
                  >
                    <i className="fa-solid fa-angle-right"></i>
                  </button>
                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={schedPage >= schedTotalPages}
                    onClick={() => setSchedPage(schedTotalPages)}
                    title="Đến trang cuối"
                  >
                    <i className="fa-solid fa-angles-right"></i>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="sched-pagination">
              <div className="pagination-info">
                <span>Hiển thị</span>
                <strong>{attTotal === 0 ? 0 : (attPage - 1) * attPageSize + 1} - {Math.min(attPage * attPageSize, attTotal)}</strong>
                <span>trên tổng số</span>
                <strong>{attTotal.toLocaleString('vi-VN')}</strong>
                <span>bản ghi chấm công</span>
              </div>

              <div className="pagination-controls">
                <div className="page-size-selector">
                  <span>Dòng/trang:</span>
                  <select
                    value={attPageSize}
                    onChange={(e) => {
                      setAttPageSize(Number(e.target.value));
                      setAttPage(1);
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
                    disabled={attPage <= 1}
                    onClick={() => setAttPage(1)}
                    title="Về trang đầu"
                  >
                    <i className="fa-solid fa-angles-left"></i>
                  </button>
                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={attPage <= 1}
                    onClick={() => setAttPage(p => Math.max(1, p - 1))}
                    title="Trang trước"
                  >
                    <i className="fa-solid fa-angle-left"></i>
                  </button>

                  <span className="page-current">
                    Trang <strong>{attPage}</strong> / {attTotalPages}
                  </span>

                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={attPage >= attTotalPages}
                    onClick={() => setAttPage(p => Math.min(attTotalPages, p + 1))}
                    title="Trang sau"
                  >
                    <i className="fa-solid fa-angle-right"></i>
                  </button>
                  <button
                    type="button"
                    className="page-nav-btn"
                    disabled={attPage >= attTotalPages}
                    onClick={() => setAttPage(attTotalPages)}
                    title="Đến trang cuối"
                  >
                    <i className="fa-solid fa-angles-right"></i>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedulePage;
