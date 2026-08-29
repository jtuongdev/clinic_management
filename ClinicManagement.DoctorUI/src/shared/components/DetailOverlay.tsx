import React from 'react';
import '../../styles/components/DetailOverlay.css'

interface DetailOverlayProps {
  patient: any;
  onClose: () => void;
  onGoExam: () => void;
}

const DetailOverlay: React.FC<DetailOverlayProps> = ({ patient, onClose, onGoExam }) => {
  if (!patient) return null;

  return (
    <div className={`detail-overlay ${patient ? 'show' : ''}`} onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <aside className="detail-panel">
        <div className="detail-head">
          <strong>Thông tin lượt khám</strong>
          <button className="close" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        </div>
        <div className="detail-body">
          <div className="profile">
            <div className="avatar-lg">{patient.avatar || 'NA'}</div>
            <div>
              <div className="profile-name">{patient.name || 'Nguyễn Thị An'}</div>
              <div className="profile-code">{patient.code || 'BN-10234'} · {patient.visit || 'LK-20260826-001'}</div>
            </div>
          </div>
          <div className="detail-grid">
            <div className="info-box"><div className="info-label">Giới tính</div><div className="info-value">{patient.gender || 'Nữ'} · {patient.age || 39} tuổi</div></div>
            <div className="info-box"><div className="info-label">Số thứ tự</div><div className="info-value">{patient.stt || '01'}</div></div>
            <div className="info-box"><div className="info-label">Khoa</div><div className="info-value">Khoa Nội</div></div>
            <div className="info-box"><div className="info-label">Phòng</div><div className="info-value">Phòng khám 1</div></div>
            <div className="info-box"><div className="info-label">Đối tượng</div><div className="info-value">BHYT</div></div>
            <div className="info-box"><div className="info-label">Tiếp nhận</div><div className="info-value">{patient.time || '08:12'} · 26/08/2026</div></div>
          </div>
          <div className="detail-section">
            <h4>Thông tin cảnh báo</h4>
            <div className="alert"><i className="fa-solid fa-triangle-exclamation"></i> Dị ứng Penicillin. Vui lòng kiểm tra trước khi kê đơn thuốc.</div>
          </div>
          <div className="detail-section">
            <h4>Lý do đến khám</h4>
            <div className="info-box">Ho khan, khó thở nhẹ, sốt 2 ngày.</div>
          </div>
          <div className="detail-section">
            <h4>Thông tin lượt khám</h4>
            <div className="info-box">
              <div className="info-label">Loại lượt khám</div>
              <div className="info-value">Khám nội tổng quát</div>
              <div style={{height: '8px'}}></div>
              <div className="info-label">Bác sĩ phụ trách</div>
              <div className="info-value">BS. Nguyễn Văn Tuấn</div>
            </div>
          </div>
        </div>
        <div className="detail-actions">
          <button className="btn" onClick={onClose}>Đóng</button>
          <button className="btn primary" onClick={onGoExam}><i className="fa-solid fa-stethoscope"></i> Vào khám</button>
        </div>
      </aside>
    </div>
  );
};

export default DetailOverlay;