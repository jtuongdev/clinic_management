import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  doctorScheduleApi,
  type ScheduleItemDto,
  type AttendanceItemDto,
  type TodayStatusDto,
} from '../api/doctorSchedule.api';
import './DoctorSchedulePage.css';

export const DoctorSchedulePage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'schedule' | 'attendance'>('schedule');
  const [todayStatus, setTodayStatus] = useState<TodayStatusDto | null>(null);
  const [schedules, setSchedules] = useState<ScheduleItemDto[]>([]);
  const [attendances, setAttendances] = useState<AttendanceItemDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [note, setNote] = useState<string>('');

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
      if (schedRes?.data) setSchedules(schedRes.data);
      if (attRes?.data) setAttendances(attRes.data);
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

  // Selected shift for check-in if multiple shifts exist
  const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null);

  useEffect(() => {
    if (todayStatus?.schedule?.id) {
      setSelectedShiftId(todayStatus.schedule.id);
    }
  }, [todayStatus]);

  // Handle Check-in
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

  // Handle Check-out
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
  const formatDate = (dStr: string) => {
    if (!dStr) return '';
    const d = new Date(dStr);
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
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    return tStr.substring(0, 5);
  };

  const renderSourceBadge = (src: string) => {
    if (src === 'TU_DONG_THEO_LICH_MAU') {
      return <span className="badge-source auto"><i className="fa-solid fa-wand-magic-sparkles"></i> Lịch Mẫu</span>;
    }
    if (src === 'PHAT_SINH_THU_CONG') {
      return <span className="badge-source manual"><i className="fa-solid fa-hand"></i> Đột Xuất</span>;
    }
    if (src === 'DOI_CA') {
      return <span className="badge-source swap"><i className="fa-solid fa-arrow-right-arrow-left"></i> Đổi Ca</span>;
    }
    return <span className="badge-source">{src || 'Tiêu chuẩn'}</span>;
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
        return <span className="badge-status-tag late"><i className="fa-solid fa-triangle-exclamation"></i> Đi muộn/Về sớm</span>;
      case 'VANG_MAT':
        return <span className="badge-status-tag absent"><i className="fa-solid fa-circle-xmark"></i> Vắng mặt</span>;
      default:
        return <span className="badge-status-tag on-time">{status || 'Hoàn tất'}</span>;
    }
  };

  const currentActiveShift = todayStatus?.shifts?.find((s) => s.id === selectedShiftId) ||
    todayStatus?.shifts?.find((s) => s.isCurrentActive) ||
    todayStatus?.shifts?.[0];

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

          {/* If there are multiple shifts today, render shift selection pills */}
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
              onClick={() => setActiveTab('schedule')}
            >
              <i className="fa-solid fa-calendar-days"></i> Lịch Làm Việc ({schedules.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
              onClick={() => setActiveTab('attendance')}
            >
              <i className="fa-solid fa-clipboard-user"></i> Lịch Sử Chấm Công ({attendances.length})
            </button>
          </div>
        </div>

        <div className="table-container">
          {activeTab === 'schedule' ? (
            schedules.length === 0 ? (
              <div className="empty-state">
                <i className="fa-regular fa-calendar-xmark"></i>
                <div>Chưa có lịch làm việc được phân bổ.</div>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ngày Làm</th>
                    <th>Ca Trực</th>
                    <th>Khung Giờ</th>
                    <th>Khoa / Phòng Khám</th>
                    <th>Nguồn Lịch</th>
                    <th>Trạng Thái</th>
                    <th>Ghi Chú</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <strong>{formatDate(s.ngayLam)}</strong>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{s.tenCa}</span>
                      </td>
                      <td>
                        {s.thoiGianBatDau?.substring(0, 5)} - {s.thoiGianKetThuc?.substring(0, 5)} ({s.soGioLam}h)
                      </td>
                      <td>
                        <div>{s.tenKhoa || '---'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{s.tenPhongKham || 'Chưa gán phòng'}</div>
                      </td>
                      <td>{renderSourceBadge(s.nguonLich)}</td>
                      <td>
                        {s.trangThai === 'LAM_VIEC' ? (
                          <span className="badge-status-tag on-time">Làm việc</span>
                        ) : (
                          <span className="badge-status-tag absent">Nghỉ phép</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--muted)', fontSize: '12px' }}>{s.ghiChu || '---'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            attendances.length === 0 ? (
              <div className="empty-state">
                <i className="fa-regular fa-folder-open"></i>
                <div>Chưa có bản ghi chấm công nào trong kỳ này.</div>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ngày Chấm Công</th>
                    <th>Ca Trực</th>
                    <th>Giờ Check-in</th>
                    <th>Giờ Check-out</th>
                    <th>Giờ Thực Tế</th>
                    <th>Đi Muộn / Về Sớm</th>
                    <th>Trạng Thái</th>
                    <th>Ghi Chú</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.map((a) => (
                    <tr key={a.id}>
                      <td><strong>{formatDate(a.ngayChamCong)}</strong></td>
                      <td>{a.tenCa || 'Theo ca trực'}</td>
                      <td>
                        {a.checkIn ? (
                          <span style={{ fontWeight: 600, color: 'var(--success)' }}>
                            <i className="fa-solid fa-arrow-down-long" style={{ fontSize: '10px' }}></i> {formatTime(a.checkIn)}
                          </span>
                        ) : '---'}
                      </td>
                      <td>
                        {a.checkOut ? (
                          <span style={{ fontWeight: 600, color: 'var(--warning)' }}>
                            <i className="fa-solid fa-arrow-up-long" style={{ fontSize: '10px' }}></i> {formatTime(a.checkOut)}
                          </span>
                        ) : '---'}
                      </td>
                      <td>
                        {a.gioLamThucTe != null ? `${a.gioLamThucTe.toFixed(1)} giờ` : '---'}
                      </td>
                      <td>
                        {(a.phutDiMuon ?? 0) > 0 && (
                          <span style={{ color: 'var(--danger)', marginRight: '6px' }}>
                            Muộn {a.phutDiMuon}p
                          </span>
                        )}
                        {(a.phutVeSom ?? 0) > 0 && (
                          <span style={{ color: 'var(--warning)' }}>
                            Sớm {a.phutVeSom}p
                          </span>
                        )}
                        {!(a.phutDiMuon ?? 0) && !(a.phutVeSom ?? 0) && (
                          <span style={{ color: 'var(--muted)' }}>Không</span>
                        )}
                      </td>
                      <td>{renderAttendanceStatus(a.trangThai)}</td>
                      <td style={{ color: 'var(--muted)', fontSize: '12px' }}>{a.ghiChu || '---'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedulePage;
