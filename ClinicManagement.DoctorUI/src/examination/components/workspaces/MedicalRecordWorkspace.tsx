import React from 'react';
import { type ExamDetail } from '../../types';

interface MedicalRecordWorkspaceProps {
  data: ExamDetail;
}

const MedicalRecordWorkspace: React.FC<MedicalRecordWorkspaceProps> = ({ data }) => {
  const { personalHistory, allergies, underlyingDiseases, familyHistory, visitHistory } = data.medicalRecord;

  return (
    <div className="tab-panel active">
      <div className="grid-2col">
        <div>
          <div className="section">
            <div className="section-head"><h3><i className="fa-solid fa-notes-medical"></i> Tiền sử bệnh</h3></div>
            <div className="section-body">
              <div className="field"><label>Tiền sử bản thân</label><textarea defaultValue={personalHistory} rows={2} /></div>
              <div style={{marginTop: '10px'}}>
                <div className="field"><label>Dị ứng</label>
                  <div className="alert-box" style={{borderColor: '#f0d6d2', background: '#fff5f3', color: '#9f3e35'}}>
                    <strong>⚠️</strong> {allergies}
                  </div>
                </div>
              </div>
              <div style={{marginTop: '10px'}}>
                <div className="field"><label>Bệnh nền</label><textarea defaultValue={underlyingDiseases} rows={2} /></div>
              </div>
            </div>
          </div>

          <div className="section">
            <div className="section-head"><h3><i className="fa-solid fa-people-group"></i> Tiền sử gia đình</h3></div>
            <div className="section-body">
              <div className="field"><label>Tiền sử gia đình</label><textarea defaultValue={familyHistory} rows={3} /></div>
            </div>
          </div>
        </div>

        <div>
          <div className="section">
            <div className="section-head"><h3><i className="fa-solid fa-clock-rotate-left"></i> Lịch sử khám</h3></div>
            <div className="section-body table-wrap">
              <table className="data-table">
                <thead><tr><th>Ngày</th><th>Lượt khám</th><th>Chẩn đoán</th><th>Bác sĩ</th><th>Trạng thái</th></tr></thead>
                <tbody>
                  {visitHistory.map((h, i) => (
                    <tr key={i}>
                      <td>{h.date}</td>
                      <td>{h.visit}</td>
                      <td>{h.diagnosis}</td>
                      <td>{h.doctor}</td>
                      <td><span className="badge green">{h.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordWorkspace;