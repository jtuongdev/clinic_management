import React from 'react';
import { usePatientVisits } from '../../../hook/usePatientVisits';

const labsTabStyles = `
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

.visits-tab .invoice-list {
  display: grid;
  gap: 10px;
  padding: 12px 0;
}

.visits-tab .invoice-row {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 14px 16px;
  display: grid;
  grid-template-columns: 1.4fr 0.8fr 0.8fr auto;
  align-items: center;
  gap: 12px;
  transition: 0.2s;
}

.visits-tab .invoice-row:hover {
  border-color: #2c7da0;
  background: #f8f9ff;
}

.visits-tab .invoice-row b {
  font-size: 14px;
}

.visits-tab .invoice-row small {
  display: block;
  color: #7f8c8d;
  font-size: 11px;
  margin-top: 2px;
}

.visits-tab .tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.visits-tab .tag-success {
  background: #d4efdf;
  color: #1e8449;
}

.visits-tab .tag-danger {
  background: #fdedec;
  color: #c0392b;
}

.visits-tab .tag-primary {
  background: #d6eaf8;
  color: #21618c;
}

.visits-tab .tag-warning {
  background: #fef9e7;
  color: #b7950b;
}

.visits-tab .tag-default {
  background: #f1f5f9;
  color: #475569;
}

.visits-tab .small-btn {
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  background: #fff;
  cursor: pointer;
  transition: 0.2s;
}

.visits-tab .small-btn:hover {
  background: #f1f5f9;
}

.visits-tab .lab-result-detail {
  font-size: 12px;
  color: #4a5568;
  margin-top: 4px;
  padding-left: 8px;
  border-left: 2px solid #e2e8f0;
}

.visits-tab .lab-result-detail .result-item {
  display: flex;
  justify-content: space-between;
  padding: 2px 0;
  border-bottom: 1px dashed #f0f2f5;
}

.visits-tab .lab-result-detail .result-item:last-child {
  border-bottom: none;
}

.visits-tab .lab-result-detail .result-name {
  font-weight: 500;
}

.visits-tab .lab-result-detail .result-value {
  color: #0f172a;
}

.visits-tab .lab-result-detail .result-value.abnormal {
  color: #c0392b;
  font-weight: 600;
}

.visits-tab .lab-result-detail .result-ref {
  color: #7f8c8d;
  font-size: 10px;
}

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

@media (max-width: 768px) {
  .visits-tab .invoice-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
`;

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
    return (
      <>
        <style>{labsTabStyles}</style>
        <div className="visits-loading"><i className="fas fa-spinner fa-spin"></i> Đang tải xét nghiệm...</div>
      </>
    );
  }

  if (allLabs.length === 0) {
    return (
      <>
        <style>{labsTabStyles}</style>
        <div className="visits-empty">
          <i className="fas fa-microscope"></i>
          <p>Bệnh nhân chưa có xét nghiệm nào</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{labsTabStyles}</style>
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
    </>
  );
};

export default LabsTab;