import React from 'react';
import { usePatientProfile } from '../../../hook/usePatientProfile';

const historyTabStyles = `
.visits-tab {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.visits-tab .tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.visits-tab .tab-header h2 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.visits-tab .tab-header .edit-btn {
  padding: 6px 16px;
  border: 1px solid #2c7da0;
  background: #fff;
  color: #2c7da0;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.visits-tab .tab-header .edit-btn:hover {
  background: #2c7da0;
  color: #fff;
}

.visits-tab .card {
  background: #fefefe;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 0;
}

.visits-tab .timeline {
  padding: 0;
}

.visits-tab .event {
  border-left: 2px solid #e2e8f0;
  padding: 12px 0 12px 24px;
  position: relative;
}

.visits-tab .event::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 18px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #2c7da0;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #d6eaf8;
}

.visits-tab .event-date {
  font-size: 11px;
  color: #7f8c8d;
  font-weight: 600;
}

.visits-tab .event-title {
  font-weight: 700;
  margin: 4px 0;
  font-size: 14px;
}

.visits-tab .event-text {
  font-size: 12px;
  color: #7f8c8d;
}

.visits-tab .tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.visits-tab .tag-danger {
  background: #fdedec;
  color: #c0392b;
}

.visits-tab .tag-primary {
  background: #d6eaf8;
  color: #21618c;
}

/* Loading & Empty states */
.visits-loading,
.visits-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #7f8c8d;
  gap: 12px;
}

.visits-loading i,
.visits-empty i {
  font-size: 32px;
  color: #cbd5e1;
}

.visits-loading i.fa-spinner {
  color: #2c7da0;
}

.visits-empty p {
  font-size: 14px;
  margin: 0;
}
`;

interface HistoryTabProps {
  patientId: number;
}

const HistoryTab: React.FC<HistoryTabProps> = ({ patientId }) => {
  const { profile, loading } = usePatientProfile(patientId);

  if (loading) {
    return (
      <>
        <style>{historyTabStyles}</style>
        <div className="visits-loading"><i className="fas fa-spinner fa-spin"></i> Đang tải tiền sử...</div>
      </>
    );
  }

  const histories = profile?.tienSuBenhs || [];

  if (histories.length === 0) {
    return (
      <>
        <style>{historyTabStyles}</style>
        <div className="visits-empty">
          <i className="fas fa-history"></i>
          <p>Bệnh nhân chưa có tiền sử bệnh</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{historyTabStyles}</style>
      <div className="visits-tab">
        <div className="tab-header">
          <h2>Tiền sử bệnh</h2>
        </div>
        <div className="card">
          <div className="timeline">
            {histories.map((h, idx) => (
              <div className="event" key={idx}>
                <div className="event-date">{new Date(h.ngayGhiNhan).toLocaleDateString('vi-VN')}</div>
                <div className="event-title">
                  {h.loaiTienSu === 'DI_UNG' ? '⚠️ Dị ứng' : h.loaiTienSu}
                  {h.loaiTienSu === 'DI_UNG' && <span className="tag tag-danger">QUAN TRỌNG</span>}
                </div>
                <div className="event-text">
                  <strong>{h.ten}</strong>
                  {h.ghiChu && ` — ${h.ghiChu}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default HistoryTab;