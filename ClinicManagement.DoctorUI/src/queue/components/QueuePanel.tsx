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
    .replace(/^(LK|KH)\s*[:\-]?\s*/i, '')
    .replace(/^LƯỢT\s+KHÁM\s*[:\-]?\s*/i, '')
    .replace(/\s+/g, '');

  return normalized;
};

const ALL_QUEUE_PAGE_SIZE = 1000;

export const QueuePanel: React.FC<QueuePanelProps> = ({ onOpenDetail }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [hoveredPatientVitals, setHoveredPatientVitals] = useState<{ id: number; vitals: any } | null>(null);

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

  const stats = useMemo(() => {
    const waiting = patients.filter(p => p.trangThai === 'CHO_KHAM').length;
    const examining = patients.filter(p => p.trangThai === 'DANG_KHAM').length;
    const cls = patients.filter(p => p.trangThai === 'CHO_CLS' || p.trangThai === 'CO_KET_QUA_CLS').length;
    const done = patients.filter(p => p.trangThai === 'HOAN_THANH').length;
    const emergency = patients.filter(p => p.priority === 'EMERGENCY' || p.priority === 'URGENT').length;
    return { waiting, examining, cls, done, emergency, total: patients.length };
  }, [patients]);

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
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">Mọi mức ưu tiên</option>
              <option value="emergency">🚨 Cấp cứu (Emergency)</option>
              <option value="urgent">⚡ Ưu tiên (Urgent)</option>
              <option value="normal">Bình thường</option>
            </select>
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

        <div className="table-wrap">
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
            <table className="queue-table">
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>STT</th>
                  <th style={{ minWidth: '220px' }}>Bệnh nhân</th>
                  <th style={{ width: '130px' }}>Giới tính / Tuổi</th>
                  <th style={{ width: '150px' }}>Lượt khám</th>
                  <th style={{ width: '140px' }}>Phân loại (Triage)</th>
                  <th style={{ width: '170px' }}>Sinh hiệu</th>
                  <th style={{ width: '130px' }}>Trạng thái</th>
                  <th style={{ width: '180px', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="queue-empty-state">
                        <i className="fa-regular fa-folder-open"></i>
                        <p>Không có bệnh nhân nào phù hợp với bộ lọc</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient, index) => {
                    const statusClass = getStatusClass(patient.trangThai);
                    const statusLabel = getStatusLabel(patient.trangThai);
                    const displayOrder = patient.soThuTu ?? index + 1;
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

                    return (
                      <tr key={patient.id} className={rowClass}>
                        <td style={{ textAlign: 'center' }}>
                          <div className="queue-no" style={{ margin: '0 auto' }}>{displayOrder}</div>
                        </td>
                        <td>
                          <div className="patient">
                            <div className="avatar-sm">
                              {patient.hoTen.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="patient-name">
                                <span>{patient.hoTen}</span>
                                {patient.hasAllergy && (
                                  <span className="allergy-badge" title="Có tiền sử dị ứng">
                                    <i className="fa-solid fa-triangle-exclamation"></i> Dị ứng
                                  </span>
                                )}
                              </div>
                              <div className="patient-code">{patient.maBenhNhanNoiBo}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="gender-age">
                            {patient.gioiTinh === 'M' ? 'Nam' : 'Nữ'} · {patient.tuoi} tuổi
                          </div>
                        </td>
                        <td>
                          <div className="visit">
                            <strong>{formatVisitCode(patient.maLuotKham)}</strong>
                            <div>{patient.tenKhoa}</div>
                          </div>
                        </td>
                        <td>
                          {isEmergency ? (
                            <span className="badge-priority emergency">
                              <i className="fa-solid fa-truck-medical"></i> CẤP CỨU
                            </span>
                          ) : isUrgent ? (
                            <span className="badge-priority urgent">
                              <i className="fa-solid fa-bolt"></i> ƯU TIÊN
                            </span>
                          ) : (
                            <span className="badge-priority normal">
                              Bình thường
                            </span>
                          )}
                        </td>
                        {/* Widget Vitals & Triage (Anchored Popover) */}
                        <td>
                          {vitals ? (
                            <div 
                              className="vitals-cell-container"
                              onMouseEnter={() => setHoveredPatientVitals({ id: patient.id, vitals })}
                              onMouseLeave={() => setHoveredPatientVitals(null)}
                            >
                              <div className="vitals-chip">
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
                        </td>
                        <td>
                          <span className={`status ${statusClass}`}>
                            <i className="fa-solid fa-circle"></i> {statusLabel}
                          </span>
                        </td>
                        <td>
                          <div className="action-group">
                            {patient.trangThai === 'DANG_KHAM' && (
                              <button
                                className="action exam"
                                onClick={() => handleOpenDetail(patient)}
                              >
                                <i className="fa-solid fa-stethoscope"></i> Vào khám
                              </button>
                            )}
                            {patient.trangThai === 'HOAN_THANH' && (
                              <button
                                className="action"
                                onClick={() => handleOpenDetail(patient)}
                              >
                                <i className="fa-regular fa-eye"></i> Xem hồ sơ
                              </button>
                            )}
                            {patient.trangThai !== 'DANG_KHAM' && patient.trangThai !== 'HOAN_THANH' && (
                              <>
                                <button
                                  className="action"
                                  onClick={() => handleOpenDetail(patient)}
                                  title="Xem nhanh chi tiết"
                                >
                                  <i className="fa-regular fa-eye"></i> Xem
                                </button>
                                <button
                                  className={`action call ${isEmergency ? 'emergency-cta' : ''}`}
                                  onClick={() => callPatient(patient)}
                                >
                                  <i className={isEmergency ? 'fa-solid fa-truck-medical' : 'fa-solid fa-bullhorn'}></i>
                                  {isEmergency ? 'Khám ngay' : 'Gọi khám'}
                                </button>
                              </>
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

        <div className="queue-footer">
          <div className="footer-note">
            <i className="fa-solid fa-arrows-rotate"></i>
            Tự động cập nhật mỗi 30s | Đang hiển thị {filteredPatients.length} / {totalCount} bệnh nhân
          </div>
        </div>
      </section>
    </div>
  );
};

export default QueuePanel;
