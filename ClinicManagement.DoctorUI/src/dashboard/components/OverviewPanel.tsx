import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import '../../styles/components/OverviewPanel.css';
import { useAuth } from '../../Auth/context/AuthProvider';
import { doctorScheduleApi, type TodayStatusDto } from '../../schedule/api/doctorSchedule.api';
import { examinationApi } from '../../examination/api/examination.api';
import type { BenhNhanListDto } from '../../examination/types/examination/index';

const OverviewPanel: React.FC = () => {
  const { user } = useAuth();
  const [todayStatus, setTodayStatus] = useState<TodayStatusDto | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [queuePatients, setQueuePatients] = useState<BenhNhanListDto[]>([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const res = await doctorScheduleApi.getTodayStatus();
      if (res?.data) setTodayStatus(res.data);
    } catch (err) {
      console.error('Không thể tải trạng thái hôm nay:', err);
    }
  }, []);

  const loadQueue = useCallback(async () => {
    setIsLoadingQueue(true);
    try {
      const res = await examinationApi.getHangDoi({ 
        maBacSi: user?.id || 0,
        pageSize: 50 
      });
      const items = res.data?.data?.items || [];
      setQueuePatients(items);
    } catch (err) {
      console.error('Không thể tải hàng đợi hôm nay:', err);
    } finally {
      setIsLoadingQueue(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadStatus();
    loadQueue();
  }, [loadStatus, loadQueue]);

  useEffect(() => {
    const refreshStatus = () => {
      if (document.visibilityState === 'visible') {
        void loadStatus();
      }
    };
    const timer = window.setInterval(refreshStatus, 30_000);
    window.addEventListener('focus', refreshStatus);
    document.addEventListener('visibilitychange', refreshStatus);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshStatus);
      document.removeEventListener('visibilitychange', refreshStatus);
    };
  }, [loadStatus]);

  const handleQuickCheck = async (isCheckIn: boolean) => {
    try {
      setActionLoading(true);
      if (isCheckIn) {
        const res = await doctorScheduleApi.checkIn('Check-in nhanh từ Dashboard');
        toast.success(res.message || 'Check-in thành công!');
      } else {
        const res = await doctorScheduleApi.checkOut('Check-out nhanh từ Dashboard');
        toast.success(res.message || 'Check-out thành công!');
      }
      await loadStatus();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Thao tác thất bại';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'BS';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Tính toán KPI thực tế từ hàng đợi CSDL
  const totalPatients = queuePatients.length;
  const waitingPatients = queuePatients.filter(p => p.trangThaiLuotKham === 'CHO_KHAM');
  const examiningPatients = queuePatients.filter(p => p.trangThaiLuotKham === 'DANG_KHAM');
  const completedPatients = queuePatients.filter(p => p.trangThaiLuotKham === 'HOAN_THANH');
  const pendingClsPatients = queuePatients.filter(p => p.trangThaiLuotKham === 'CHO_KET_QUA_CLS');
  const cancelledPatients = queuePatients.filter(p => p.trangThaiLuotKham === 'DA_HUY');

  // Bệnh nhân đang khám hiện tại
  const currentExamPatient = examiningPatients[0] || null;

  // 4 bệnh nhân tiếp theo đang chờ
  const nextPatients = waitingPatients.slice(0, 4);

  // 3 bệnh nhân hoàn tất gần đây nhất
  const recentCompleted = completedPatients.slice(0, 3);

  return (
    <div className="panel-overview active">
      {/* Doctor strip */}
      <div className="doctor-strip">
        <div className="doc-info">
          <div className="doc-avatar">{getInitials(user?.fullName)}</div>
          <div>
            <div className="doc-name">{user?.fullName || 'Bác sĩ điều trị'}</div>
            <div className="doc-title">
              Bác sĩ · <span className="doc-dept">{user?.chuyenKhoa || todayStatus?.schedule?.tenKhoa || 'Khoa Khám Bệnh'}</span>
            </div>
          </div>
        </div>
        <div className="doc-meta" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {todayStatus?.attendance?.checkIn && !todayStatus?.attendance?.checkOut ? (
            <span className="badge-status" style={{ background: '#ecfdf5', color: '#16834f' }}>
              <i className="fa-solid fa-circle" style={{ fontSize: '8px', marginRight: '5px', color: '#1f9d61' }}></i>
              Đang trong ca
            </span>
          ) : todayStatus?.attendance?.checkOut ? (
            <span className="badge-status" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
              <i className="fa-solid fa-circle-check" style={{ marginRight: '5px' }}></i>
              Đã hoàn thành ca
            </span>
          ) : todayStatus?.hasSchedule ? (
            <span className="badge-status" style={{ background: '#fffbeb', color: '#b45309' }}>
              <i className="fa-regular fa-clock" style={{ marginRight: '5px' }}></i>
              Chưa Check-in
            </span>
          ) : (
            <span className="badge-status" style={{ background: '#f1f5f9', color: '#64748b' }}>
              Không có ca hôm nay
            </span>
          )}

          {todayStatus?.schedule && (
            <>
              <span className="doc-time">
                <i className="fa-regular fa-clock"></i> {todayStatus.schedule.tenCa}: {todayStatus.schedule.thoiGianBatDau?.substring(0, 5)} – {todayStatus.schedule.thoiGianKetThuc?.substring(0, 5)}
              </span>
              <span className="doc-time">
                <i className="fa-regular fa-calendar"></i> {todayStatus.schedule.tenPhongKham || 'Phòng khám'}
              </span>
            </>
          )}

          {/* Nút check-in / check-out nhanh */}
          {todayStatus?.hasSchedule && !todayStatus?.attendance?.checkIn && (
            <button
              className="btn btn-sm btn-primary"
              style={{ padding: '4px 10px', fontSize: '12px', background: '#1f9d61', borderColor: '#1f9d61', color: '#fff' }}
              disabled={actionLoading}
              onClick={() => handleQuickCheck(true)}
            >
              <i className="fa-solid fa-right-to-bracket"></i> Vào Ca Ngay
            </button>
          )}

          {todayStatus?.attendance?.checkIn && !todayStatus?.attendance?.checkOut && (
            <button
              className="btn btn-sm btn-secondary"
              style={{ padding: '4px 10px', fontSize: '12px' }}
              disabled={actionLoading}
              onClick={() => handleQuickCheck(false)}
            >
              <i className="fa-solid fa-right-from-bracket"></i> Check-out Ca
            </button>
          )}

          <span className="doc-time" style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '3px' }}>
            <i className="fa-regular fa-circle-check"></i> <strong>{totalPatients}</strong> bệnh nhân trong ca
          </span>
          <button 
            className="btn" 
            style={{ padding: '2px 8px', fontSize: '11px' }}
            onClick={() => { loadStatus(); loadQueue(); }}
            title="Làm mới dữ liệu"
          >
            <i className={`fa-solid fa-arrows-rotate ${isLoadingQueue ? 'fa-spin' : ''}`}></i>
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Tổng bệnh nhân</div>
          <div className="kpi-value">{totalPatients}</div>
          <div className="kpi-sub">Trong ca làm việc</div>
        </div>
        <div className="kpi-card warning">
          <div className="kpi-label">Đang chờ</div>
          <div className="kpi-value">{waitingPatients.length}</div>
          <div className="kpi-sub">Chưa được khám</div>
        </div>
        <div className="kpi-card success">
          <div className="kpi-label">Đang khám</div>
          <div className="kpi-value">{examiningPatients.length}</div>
          <div className="kpi-sub">Đang xử trí</div>
        </div>
        <div className="kpi-card primary">
          <div className="kpi-label">Đã hoàn thành</div>
          <div className="kpi-value">{completedPatients.length}</div>
          <div className="kpi-sub">Đã đóng bệnh án</div>
        </div>
        <div className="kpi-card info">
          <div className="kpi-label">Chờ CLS</div>
          <div className="kpi-value">{pendingClsPatients.length}</div>
          <div className="kpi-sub">Xét nghiệm / CĐHA</div>
        </div>
        <div className="kpi-card danger">
          <div className="kpi-label">Đã hủy</div>
          <div className="kpi-value">{cancelledPatients.length}</div>
          <div className="kpi-sub">Hủy lượt khám</div>
        </div>
      </div>

      {/* Dashboard 2-col */}
      <div className="dash-grid">
        <div className="dash-col">
          {/* Current patient */}
          <div className="dash-card">
            <div className="dash-card-head">
              <h3><i className="fa-solid fa-user-doctor" style={{color: 'var(--success)'}}></i> Bệnh nhân đang khám</h3>
              <span className="badge-count">{currentExamPatient ? 'Đang xử trí' : 'Trống'}</span>
            </div>
            <div className="dash-card-body">
              {currentExamPatient ? (
                <div className="current-patient">
                  <div className="cp-avatar">{getInitials(currentExamPatient.hoTen)}</div>
                  <div className="cp-info">
                    <div className="cp-name">{currentExamPatient.hoTen}</div>
                    <div className="cp-code">{currentExamPatient.maBenhNhanNoiBo} · {currentExamPatient.maLuotKhamGanNhat}</div>
                    <div className="cp-time">
                      <i className="fa-regular fa-clock"></i> Giới tính: {currentExamPatient.gioiTinh === 'M' ? 'Nam' : 'Nữ'} · {currentExamPatient.tuoi} tuổi
                    </div>
                  </div>
                  <div>
                    <span className="cp-status">Đang khám</span>
                    <div style={{fontSize: '11px', color: 'var(--muted)', marginTop: '4px', textAlign: 'right'}}>
                      STT #{currentExamPatient.soThuTu ?? 1}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '18px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                  Hiện tại không có bệnh nhân nào đang trong phòng khám.
                </div>
              )}
            </div>
          </div>

          {/* Next patients */}
          <div className="dash-card">
            <div className="dash-card-head">
              <h3><i className="fa-solid fa-list-ol"></i> Bệnh nhân tiếp theo</h3>
              <span className="badge-count">{waitingPatients.length} người chờ</span>
            </div>
            <div className="dash-card-body">
              {nextPatients.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                  Hàng đợi đang trống.
                </div>
              ) : (
                <div className="queue-list-compact">
                  {nextPatients.map(p => (
                    <div className="ql-item" key={p.id}>
                      <div className="ql-num">{p.soThuTu ?? '-'}</div>
                      <span className="ql-name">{p.hoTen}</span>
                      <span className="ql-age">{p.tuoi} tuổi · {p.gioiTinh === 'M' ? 'Nam' : 'Nữ'}</span>
                      <span className="ql-priority normal">
                        Bình thường
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dash-col">
          {/* Recent patients */}
          <div className="dash-card">
            <div className="dash-card-head">
              <h3><i className="fa-solid fa-clock-rotate-left"></i> Bệnh nhân đã hoàn thành gần đây</h3>
              <span className="badge-count">{completedPatients.length} lượt</span>
            </div>
            <div className="dash-card-body">
              {recentCompleted.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                  Chưa có bệnh nhân nào hoàn tất khám trong ca này.
                </div>
              ) : (
                <div className="recent-list">
                  {recentCompleted.map(p => (
                    <div className="recent-item" key={p.id}>
                      <div className="recent-avatar">{getInitials(p.hoTen)}</div>
                      <span className="recent-name">{p.hoTen}</span>
                      <span className="recent-dx">{p.khoa || 'Đã hoàn tất'}</span>
                      <span className="recent-date">{p.maBenhNhanNoiBo}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="dash-card">
            <div className="dash-card-head">
              <h3><i className="fa-solid fa-chart-simple"></i> Thống kê tiến độ ca trực</h3>
            </div>
            <div className="dash-card-body">
              <div className="stats-row">
                <div className="stat-box">
                  <div className="stat-label">Tổng lượt tiếp nhận</div>
                  <div className="stat-value">{totalPatients} <span style={{fontSize: '13px', fontWeight: 400, color: 'var(--muted)'}}>ca</span></div>
                  <div className="stat-sub">Phòng: {todayStatus?.schedule?.tenPhongKham || 'Phòng khám'}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">Tiến độ giải quyết</div>
                  <div className="stat-value">
                    {totalPatients > 0 ? Math.round((completedPatients.length / totalPatients) * 100) : 0}%
                  </div>
                  <div className="stat-sub">{completedPatients.length} / {totalPatients} bệnh nhân đã khám xong</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPanel;