import React from 'react';
import { usePatientProfile } from '../../../hook/usePatientProfile';
import './HistoryTab.css';

interface HistoryTabProps {
  patientId: number;
}

const HistoryTab: React.FC<HistoryTabProps> = ({ patientId }) => {
  const { profile, loading } = usePatientProfile(patientId);

  if (loading) {
    return <div className="visits-loading"><i className="fas fa-spinner fa-spin"></i> Đang tải tiền sử...</div>;
  }

  const histories = profile?.tienSuBenhs || [];

  if (histories.length === 0) {
    return (
      <div className="visits-empty">
        <i className="fas fa-history"></i>
        <p>Bệnh nhân chưa có tiền sử bệnh</p>
      </div>
    );
  }

  return (
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
  );
};

export default HistoryTab;