import React from 'react';
import { usePatientWorkspace } from '../../hooks/usePatientWorkspace';
import type { PatientWorkspaceProps } from '../../types/examination.types';

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

const PatientWorkspace: React.FC<PatientWorkspaceProps> = ({ data, luotKhamId }) => {
  if (!luotKhamId || !data) {
    return (
      <div className="tab-panel active">
        <div className="empty" style={{ padding: '30px', textAlign: 'center', color: '#94a2ad', background: '#fafcfd', border: '1px dashed #d8e1e6', borderRadius: '6px' }}>
          <i className="fa-solid fa-user" style={{ fontSize: '23px', marginBottom: '8px', display: 'block', color: '#aab8c1' }}></i>
          Vui lòng chọn bệnh nhân trong hàng đợi khám để xem thông tin.
        </div>
      </div>
    );
  }

  const fallbackData = {
    luotKhamId,
    maLuotKham: data.visit,
    khoa: data.department,
    phong: data.room,
    trangThai: data.status,
    hoTen: data.patient.name,
    maBenhNhanNoiBo: data.patient.code,
    ngaySinh: data.patient.dob,
    gioiTinh: data.patient.gender,
    soCCCD: data.patient.cccd,
    bhyt: data.patient.bhyt,
    diaChi: data.patient.address,
    dienThoai: data.patient.phone,
  };

  const { data: patientApiData, loading, error } = usePatientWorkspace({
    luotKhamId,
    fallbackData,
  });

  const resolved = patientApiData ?? fallbackData;
  const { patient, visit, department, room, status } = data;

  return (
    <div className="tab-panel active">
      {error && (
        <div className="api-error-banner" style={{ background: '#fff7ed', color: '#c2410c', padding: '8px 12px', marginBottom: '12px', borderRadius: '6px' }}>
          {error}
        </div>
      )}

      <div className="summary-strip">
        <div className="summary-box"><div className="label">LƯỢT KHÁM</div><div className="value">{formatVisitCode(resolved.maLuotKham || visit)}</div></div>
        <div className="summary-box"><div className="label">KHOA</div><div className="value">{resolved.khoa || department}</div></div>
        <div className="summary-box"><div className="label">PHÒNG</div><div className="value">{resolved.phong || room}</div></div>
        <div className="summary-box"><div className="label">TRẠNG THÁI</div><div className="value" style={{color: '#1f9d61'}}>{resolved.trangThai || status}</div></div>
      </div>

      <div className="section">
        <div className="section-head"><h3><i className="fa-solid fa-user"></i> Thông tin bệnh nhân</h3></div>
        <div className="section-body">
          {loading ? (
            <div className="empty" style={{ padding: '20px', textAlign: 'center', color: '#667085' }}>Đang tải thông tin bệnh nhân...</div>
          ) : (
            <div className="form-grid">
              <div className="field"><label>Họ và tên</label><input className="readonly" value={resolved.hoTen || patient.name} readOnly /></div>
              <div className="field"><label>Mã bệnh nhân</label><input className="readonly" value={resolved.maBenhNhanNoiBo || patient.code} readOnly /></div>
              <div className="field"><label>Ngày sinh</label><input className="readonly" value={resolved.ngaySinh || patient.dob} readOnly /></div>
              <div className="field"><label>Giới tính</label><input className="readonly" value={resolved.gioiTinh || patient.gender} readOnly /></div>
              <div className="field"><label>Số CCCD</label><input className="readonly" value={resolved.soCCCD || patient.cccd} readOnly /></div>
              <div className="field"><label>BHYT</label><input className="readonly" value={resolved.bhyt || patient.bhyt} readOnly /></div>
              <div className="field wide"><label>Địa chỉ</label><input className="readonly" value={resolved.diaChi || patient.address} readOnly /></div>
              <div className="field"><label>Số điện thoại</label><input className="readonly" value={resolved.dienThoai || patient.phone} readOnly /></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientWorkspace;