import React from 'react';
import { type ExamDetail } from '../../types/index';

interface ExaminationWorkspaceProps {
  data: ExamDetail;
  onChange?: (field: string, value: any) => void;
}

const ExaminationWorkspace: React.FC<ExaminationWorkspaceProps> = ({ data, onChange }) => {
  const { reason, history, vitals, clinicalExam, symptoms, initialAssessment } = data.examination;

  // TODO: Thêm onChange để update state khi edit

  return (
    <div className="tab-panel active">
      <div className="section">
        <div className="section-head"><h3><i className="fa-solid fa-notes-medical"></i> Lý do khám & Bệnh sử</h3></div>
        <div className="section-body">
          <div className="grid-2">
            <div className="field"><label>Lý do khám</label><textarea defaultValue={reason} rows={3} /></div>
            <div className="field"><label>Bệnh sử</label><textarea defaultValue={history} rows={3} /></div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-head"><h3><i className="fa-solid fa-heart-pulse"></i> Sinh hiệu</h3></div>
        <div className="section-body">
          <div className="grid-4">
            <div className="field"><label>Nhiệt độ (°C)</label><input defaultValue={vitals.temperature} /></div>
            <div className="field"><label>Mạch (nhịp/phút)</label><input defaultValue={vitals.pulse} /></div>
            <div className="field"><label>Huyết áp (mmHg)</label><input defaultValue={vitals.bloodPressure} /></div>
            <div className="field"><label>Nhịp thở (lần/phút)</label><input defaultValue={vitals.respiration} /></div>
            <div className="field"><label>SpO2 (%)</label><input defaultValue={vitals.spo2} /></div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-head"><h3><i className="fa-solid fa-stethoscope"></i> Khám lâm sàng</h3></div>
        <div className="section-body">
          <div className="grid-2">
            <div className="field"><label>Khám lâm sàng</label><textarea defaultValue={clinicalExam} rows={3} /></div>
            <div className="field"><label>Triệu chứng</label><textarea defaultValue={symptoms} rows={3} /></div>
          </div>
          <div style={{marginTop: '10px'}}>
            <div className="field"><label>Nhận định ban đầu</label><textarea defaultValue={initialAssessment} rows={2} /></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExaminationWorkspace;