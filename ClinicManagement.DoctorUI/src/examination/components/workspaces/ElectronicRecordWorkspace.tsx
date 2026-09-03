import React from 'react';
import type { ElectronicRecordWorkspaceProps } from '../../types/examination/electronic-record.types';

const ElectronicRecordWorkspace: React.FC<ElectronicRecordWorkspaceProps> = ({ data, onFinish }) => {
  const { patient, visit, department, examination, treatment } = data;

  return (
    <div className="tab-panel active">
      <div className="section">
        <div className="section-head"><h3><i className="fa-solid fa-file-medical"></i> Bệnh án điện tử</h3>
          <span className="badge green">Sẵn sàng</span>
        </div>
        <div className="section-body">
          <div className="form-grid">
            <div className="field"><label>Mã bệnh nhân</label><input className="readonly" value={patient.code} readOnly /></div>
            <div className="field"><label>Họ tên</label><input className="readonly" value={patient.name} readOnly /></div>
            <div className="field"><label>Ngày sinh</label><input className="readonly" value={patient.dob} readOnly /></div>
            <div className="field"><label>Giới tính</label><input className="readonly" value={patient.gender} readOnly /></div>
            <div className="field"><label>Lượt khám</label><input className="readonly" value={visit} readOnly /></div>
            <div className="field"><label>Khoa</label><input className="readonly" value={department} readOnly /></div>
          </div>
        </div>
      </div>

      <div className="grid-2col">
        <div>
          <div className="section">
            <div className="section-head"><h3><i className="fa-solid fa-stethoscope"></i> Khám bệnh</h3></div>
            <div className="section-body">
              <div className="field"><label>Lý do khám</label><input className="readonly" value={examination.reason} readOnly /></div>
              <div style={{marginTop: '8px'}}>
                <div className="field"><label>Triệu chứng</label><input className="readonly" value={examination.symptoms} readOnly /></div>
              </div>
              <div style={{marginTop: '8px'}}>
                <div className="field"><label>Nhận định</label><input className="readonly" value={examination.initialAssessment} readOnly /></div>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-head"><h3><i className="fa-solid fa-disease"></i> Chẩn đoán</h3></div>
            <div className="section-body">
              <div className="field"><label>Mã ICD</label><input className="readonly" value={treatment.diagnosis.icd} readOnly /></div>
              <div style={{marginTop: '8px'}}>
                <div className="field"><label>Chẩn đoán</label><input className="readonly" value={treatment.diagnosis.diagnosis} readOnly /></div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="section">
            <div className="section-head"><h3><i className="fa-solid fa-prescription-bottle-medical"></i> Đơn thuốc</h3></div>
            <div className="section-body">
              {treatment.drugs.map((d, i) => (
                <div key={i} style={{borderBottom: '1px solid var(--line)', padding: '6px 0'}}>
                  <strong>{d.name}</strong> - {d.dose} {d.unit}, {d.freq}, {d.days} ngày
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <div className="section-head"><h3><i className="fa-solid fa-flask"></i> Dịch vụ</h3></div>
            <div className="section-body">
              {treatment.services.map((s, i) => (
                <div key={i} style={{borderBottom: '1px solid var(--line)', padding: '6px 0'}}>
                  {s.name} - {s.status}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="footer-actions">
        <div className="save-state"><i className="fa-solid fa-circle-check"></i> Đã lưu lần cuối lúc 08:28</div>
        <div className="actions">
          <button className="btn"><i className="fa-solid fa-print"></i> In bệnh án</button>
          <button className="btn success"><i className="fa-solid fa-floppy-disk"></i> Lưu bệnh án</button>
          <button className="btn danger" onClick={onFinish}><i className="fa-solid fa-check-circle"></i> Xác nhận & hoàn tất</button>
        </div>
      </div>
    </div>
  );
};

export default ElectronicRecordWorkspace;