import React from 'react';
import { usePatientVisits } from '../../../hook/usePatientVisits';
import './LabsTab.css';

interface LabsTabProps {
  patientId: number;
}

const LabsTab: React.FC<LabsTabProps> = ({ patientId }) => {
  const { items, loading } = usePatientVisits({ patientId, pageSize: 100 });

  // Lấy tất cả xét nghiệm từ các lượt khám
  const allLabs = items.flatMap(visit =>
    visit.chiDinhDichVus.map(lab => ({
      ...lab,
      visitId: visit.id,
      visitDate: visit.ngayKham,
      doctor: visit.bacSi,
      dept: visit.khoa,
    }))
  );

  if (loading) {
    return <div className="visits-loading"><i className="fas fa-spinner fa-spin"></i> Đang tải xét nghiệm...</div>;
  }

  if (allLabs.length === 0) {
    return (
      <div className="visits-empty">
        <i className="fas fa-microscope"></i>
        <p>Bệnh nhân chưa có xét nghiệm nào</p>
      </div>
    );
  }

  return (
    <div className="visits-tab">
      <div className="tab-header">
        <h2>Xét nghiệm</h2>
      </div>
      <div className="card">
        <div className="invoice-list">
          {allLabs.map((lab) => (
            <div className="invoice-row" key={lab.id}>
              <div>
                <b>XN #{lab.id}</b>
                <small>{new Date(lab.ngayChiDinh).toLocaleDateString('vi-VN')} · {lab.loaiDichVu}</small>
              </div>
              <div>
                <b>{lab.ketQuaChiTiet?.length || 0} chỉ số</b>
                <small>{lab.ketQuaChiTiet?.some(kq => kq.batThuong) ? '⚠ Có bất thường' : '✅ Bình thường'}</small>
              </div>
              <div>
                <span className={`tag ${lab.trangThai === 'CO_KET_QUA' ? 'tag-success' : 'tag-warning'}`}>
                  {lab.trangThai}
                </span>
              </div>
              <div>
                <button className="small-btn" onClick={() => alert(JSON.stringify(lab.ketQuaChiTiet, null, 2))}>
                  Xem
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LabsTab;