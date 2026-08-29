import React from 'react';
import { type ExamDetail } from '../../types';

interface PatientWorkspaceProps {
  data: ExamDetail;
}

const PatientWorkspace: React.FC<PatientWorkspaceProps> = ({ data }) => {
  const { patient, visit, department, room, status } = data;

  return (
    <div className="tab-panel active">
      <div className="summary-strip">
        <div className="summary-box"><div className="label">LƯỢT KHÁM</div><div className="value">{visit}</div></div>
        <div className="summary-box"><div className="label">KHOA</div><div className="value">{department}</div></div>
        <div className="summary-box"><div className="label">PHÒNG</div><div className="value">{room}</div></div>
        <div className="summary-box"><div className="label">TRẠNG THÁI</div><div className="value" style={{color: '#1f9d61'}}>{status}</div></div>
      </div>

      <div className="section">
        <div className="section-head"><h3><i className="fa-solid fa-user"></i> Thông tin bệnh nhân</h3></div>
        <div className="section-body">
          <div className="form-grid">
            <div className="field"><label>Họ và tên</label><input className="readonly" value={patient.name} readOnly /></div>
            <div className="field"><label>Mã bệnh nhân</label><input className="readonly" value={patient.code} readOnly /></div>
            <div className="field"><label>Ngày sinh</label><input className="readonly" value={patient.dob} readOnly /></div>
            <div className="field"><label>Giới tính</label><input className="readonly" value={patient.gender} readOnly /></div>
            <div className="field"><label>Số CCCD</label><input className="readonly" value={patient.cccd} readOnly /></div>
            <div className="field"><label>BHYT</label><input className="readonly" value={patient.bhyt} readOnly /></div>
            <div className="field wide"><label>Địa chỉ</label><input className="readonly" value={patient.address} readOnly /></div>
            <div className="field"><label>Số điện thoại</label><input className="readonly" value={patient.phone} readOnly /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientWorkspace;