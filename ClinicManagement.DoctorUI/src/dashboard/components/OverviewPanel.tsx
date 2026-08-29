import React from 'react';
import '../../styles/components/OverviewPanel.css'

// Dữ liệu mock
const mockData = {
  totalPatients: 18,
  waiting: 6,
  examining: 1,
  completed: 10,
  pending: 4,
  cancelled: 1,
  currentPatient: {
    name: 'Nguyễn Thị An',
    code: 'BN000123 · LK202608270001',
    avatar: 'NA',
    startTime: '08:20',
  },
  nextPatients: [
    { stt: 2, name: 'Trần Văn Bình', age: 47, gender: 'Nam', priority: 'normal' },
    { stt: 3, name: 'Lê Thị Hoa', age: 32, gender: 'Nữ', priority: 'normal' },
    { stt: 4, name: 'Phạm Văn Hùng', age: 59, gender: 'Nam', priority: 'urgent' },
  ],
  alerts: [
    { type: 'danger', icon: 'fa-circle-exclamation', title: 'Có bệnh nhân có cảnh báo y tế', msg: 'Nguyễn Thị An có thông tin dị ứng cần lưu ý', time: '08:12' },
    { type: 'warning', icon: 'fa-flask', title: 'Có kết quả xét nghiệm chờ xem', msg: '4 kết quả xét nghiệm chưa được bác sĩ xem', time: '08:20' },
    { type: 'success', icon: 'fa-users', title: 'Hàng đợi đang tăng', msg: 'Hiện có 6 bệnh nhân đang chờ khám', time: '08:25' },
  ],
  tasks: [
    { icon: 'fa-flask', title: 'Kết quả xét nghiệm cần xem', count: '4 kết quả', priority: 'high' },
    { icon: 'fa-prescription', title: 'Đơn thuốc chưa hoàn tất', count: '2 đơn', priority: 'medium' },
    { icon: 'fa-file-lines', title: 'Lượt khám chưa hoàn tất', count: '1 lượt', priority: 'high' },
  ],
  appointments: [
    { time: '08:00', name: 'Nguyễn Thị An', reason: 'Tái khám', status: 'done' },
    { time: '08:30', name: 'Trần Văn Bình', reason: 'Khám bệnh', status: 'exam' },
    { time: '09:00', name: 'Lê Thị Hoa', reason: 'Tái khám', status: 'wait' },
    { time: '09:30', name: 'Phạm Văn Hùng', reason: 'Khám mới', status: 'wait' },
  ],
  recentPatients: [
    { avatar: 'NA', name: 'Nguyễn Thị An', dx: 'Viêm đường hô hấp cấp', date: 'Hôm nay' },
    { avatar: 'DT', name: 'Đỗ Minh Tâm', dx: 'Viêm họng cấp', date: 'Hôm qua' },
    { avatar: 'NA', name: 'Nguyễn Văn A', dx: 'Tăng huyết áp', date: 'Hôm qua' },
  ],
  statsToday: { visits: 10, avgTime: '18 phút/lượt' },
  statsWeek: { patients: 82, completionRate: '92.7%' },
};

const OverviewPanel: React.FC = () => {
  return (
    <div className="panel-overview active">
      {/* Doctor strip */}
      <div className="doctor-strip">
        <div className="doc-info">
          <div className="doc-avatar">NT</div>
          <div>
            <div className="doc-name">BS. Nguyễn Văn Tuấn</div>
            <div className="doc-title">Bác sĩ · <span className="doc-dept">Khoa Nội</span></div>
          </div>
        </div>
        <div className="doc-meta">
          <span className="badge-status"><i className="fa-solid fa-circle" style={{fontSize: '8px', marginRight: '5px', color: '#1f9d61'}}></i>Đang làm việc</span>
          <span className="doc-time"><i className="fa-regular fa-clock"></i> Ca sáng: 07:30 – 11:30</span>
          <span className="doc-time"><i className="fa-regular fa-calendar"></i> Phòng PK01</span>
          <span className="doc-time" style={{background: '#f0f4f6', padding: '4px 10px', borderRadius: '6px'}}><i className="fa-regular fa-circle-check"></i> <strong>{mockData.totalPatients}</strong> bệnh nhân</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Tổng bệnh nhân</div>
          <div className="kpi-value">{mockData.totalPatients}</div>
          <div className="kpi-sub">Hôm nay</div>
        </div>
        <div className="kpi-card warning">
          <div className="kpi-label">Đang chờ</div>
          <div className="kpi-value">{mockData.waiting}</div>
          <div className="kpi-sub">Chưa được khám</div>
        </div>
        <div className="kpi-card success">
          <div className="kpi-label">Đang khám</div>
          <div className="kpi-value">{mockData.examining}</div>
          <div className="kpi-sub">Đang xử trí</div>
        </div>
        <div className="kpi-card primary">
          <div className="kpi-label">Đã hoàn thành</div>
          <div className="kpi-value">{mockData.completed}</div>
          <div className="kpi-sub">Đã kết thúc</div>
        </div>
        <div className="kpi-card info">
          <div className="kpi-label">Kết quả chờ</div>
          <div className="kpi-value">{mockData.pending}</div>
          <div className="kpi-sub">Xét nghiệm</div>
        </div>
        <div className="kpi-card danger">
          <div className="kpi-label">Đã hủy</div>
          <div className="kpi-value">{mockData.cancelled}</div>
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
              <span className="badge-count">Đang xử trí</span>
            </div>
            <div className="dash-card-body">
              <div className="current-patient">
                <div className="cp-avatar">{mockData.currentPatient.avatar}</div>
                <div className="cp-info">
                  <div className="cp-name">{mockData.currentPatient.name}</div>
                  <div className="cp-code">{mockData.currentPatient.code}</div>
                  <div className="cp-time"><i className="fa-regular fa-clock"></i> Bắt đầu: {mockData.currentPatient.startTime}</div>
                </div>
                <div>
                  <span className="cp-status">Đang khám</span>
                  <div style={{fontSize: '10px', color: 'var(--muted)', marginTop: '4px'}}>STT 01</div>
                </div>
              </div>
            </div>
          </div>

          {/* Next patients */}
          <div className="dash-card">
            <div className="dash-card-head">
              <h3><i className="fa-solid fa-list-ol"></i> Bệnh nhân tiếp theo</h3>
              <span className="badge-count">{mockData.nextPatients.length} người</span>
            </div>
            <div className="dash-card-body">
              <div className="queue-list-compact">
                {mockData.nextPatients.map(p => (
                  <div className="ql-item" key={p.stt}>
                    <div className="ql-num">{p.stt}</div>
                    <span className="ql-name">{p.name}</span>
                    <span className="ql-age">{p.age} tuổi · {p.gender}</span>
                    <span className={`ql-priority ${p.priority === 'normal' ? 'normal' : ''}`}>
                      {p.priority === 'urgent' && <><i className="fa-solid fa-triangle-exclamation" style={{fontSize: '8px'}}></i> Ưu tiên</>}
                      {p.priority === 'normal' && 'Bình thường'}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{marginTop: '8px', fontSize: '11px', color: 'var(--muted)'}}>
                <i className="fa-regular fa-clock"></i> Thời gian chờ trung bình: <strong>12 phút</strong>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="dash-card">
            <div className="dash-card-head">
              <h3><i className="fa-solid fa-triangle-exclamation" style={{color: 'var(--danger)'}}></i> Cảnh báo</h3>
              <span className="badge-count" style={{background: 'var(--danger-soft)', color: 'var(--danger)'}}>{mockData.alerts.length} mới</span>
            </div>
            <div className="dash-card-body">
              <div className="alert-list">
                {mockData.alerts.map((alert, idx) => (
                  <div className={`alert-item ${alert.type}`} key={idx}>
                    <div className="alert-icon"><i className={`fa-solid ${alert.icon}`}></i></div>
                    <div className="alert-content">
                      <div className="alert-title">{alert.title}</div>
                      <div className="alert-msg">{alert.msg}</div>
                    </div>
                    <span className="alert-time">{alert.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pending tasks */}
          <div className="dash-card">
            <div className="dash-card-head">
              <h3><i className="fa-solid fa-clock"></i> Công việc chờ</h3>
              <span className="badge-count">{mockData.tasks.length} việc</span>
            </div>
            <div className="dash-card-body">
              <div className="task-list">
                {mockData.tasks.map((task, idx) => (
                  <div className="task-item" key={idx}>
                    <div className="task-icon"><i className={`fa-solid ${task.icon}`}></i></div>
                    <div className="task-info">
                      <div className="task-title">{task.title}</div>
                      <div className="task-count">{task.count}</div>
                    </div>
                    <span className={`task-priority ${task.priority}`}>{task.priority.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="dash-col">
          {/* Appointments */}
          <div className="dash-card">
            <div className="dash-card-head">
              <h3><i className="fa-solid fa-calendar-check" style={{color: 'var(--primary)'}}></i> Lịch hẹn hôm nay</h3>
              <span className="badge-count">15 lịch</span>
            </div>
            <div className="dash-card-body">
              <div className="appt-list">
                {mockData.appointments.map((appt, idx) => (
                  <div className="appt-item" key={idx} style={appt.status === 'exam' ? {background: 'var(--primary-soft)', borderColor: 'var(--primary)'} : {}}>
                    <span className="appt-time">{appt.time}</span>
                    <span className="appt-name">{appt.name}</span>
                    <span className="appt-reason">{appt.reason}</span>
                    <span className={`appt-status ${appt.status}`}>
                      {appt.status === 'done' && 'Hoàn thành'}
                      {appt.status === 'exam' && 'Đang khám'}
                      {appt.status === 'wait' && 'Chờ'}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{marginTop: '8px', fontSize: '11px', color: 'var(--muted)'}}>
                <i className="fa-regular fa-circle-check" style={{color: 'var(--success)'}}></i> Tỷ lệ hoàn thành: <strong>66.7%</strong>
              </div>
            </div>
          </div>

          {/* Recent patients */}
          <div className="dash-card">
            <div className="dash-card-head">
              <h3><i className="fa-solid fa-clock-rotate-left"></i> Bệnh nhân gần đây</h3>
              <span className="badge-count">{mockData.recentPatients.length} người</span>
            </div>
            <div className="dash-card-body">
              <div className="recent-list">
                {mockData.recentPatients.map((p, idx) => (
                  <div className="recent-item" key={idx}>
                    <div className="recent-avatar">{p.avatar}</div>
                    <span className="recent-name">{p.name}</span>
                    <span className="recent-dx">{p.dx}</span>
                    <span className="recent-date">{p.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="dash-card">
            <div className="dash-card-head">
              <h3><i className="fa-solid fa-chart-simple"></i> Thống kê nhanh</h3>
            </div>
            <div className="dash-card-body">
              <div className="stats-row">
                <div className="stat-box">
                  <div className="stat-label">Hôm nay</div>
                  <div className="stat-value">{mockData.statsToday.visits} <span style={{fontSize: '13px', fontWeight: 400, color: 'var(--muted)'}}>lượt</span></div>
                  <div className="stat-sub">TB {mockData.statsToday.avgTime}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-label">Tuần này</div>
                  <div className="stat-value">{mockData.statsWeek.patients} <span style={{fontSize: '13px', fontWeight: 400, color: 'var(--muted)'}}>bệnh nhân</span></div>
                  <div className="stat-sub">Tỷ lệ hoàn thành {mockData.statsWeek.completionRate}</div>
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