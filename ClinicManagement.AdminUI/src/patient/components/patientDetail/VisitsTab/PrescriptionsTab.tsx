import React from 'react';
import { usePatientVisits } from '../../../hook/usePatientVisits';
import './PrescriptionsTab.css';

interface PrescriptionsTabProps {
  patientId: number;
}

const PrescriptionsTab: React.FC<PrescriptionsTabProps> = ({ patientId }) => {
  const { items, loading } = usePatientVisits({ patientId, pageSize: 100 });

  // Lấy tất cả đơn thuốc từ các lượt khám
  const allPrescriptions = items.flatMap(visit => 
    visit.donThuocs.map(dt => ({
      ...dt,
      visitId: visit.id,
      visitDate: visit.ngayKham,
      doctor: visit.bacSi,
      dept: visit.khoa,
    }))
  );

  if (loading) {
    return <div className="visits-loading"><i className="fas fa-spinner fa-spin"></i> Đang tải đơn thuốc...</div>;
  }

  if (allPrescriptions.length === 0) {
    return (
      <div className="visits-empty">
        <i className="fas fa-prescription"></i>
        <p>Bệnh nhân chưa có đơn thuốc nào</p>
      </div>
    );
  }

  return (
    <div className="visits-tab">
      <div className="tab-header">
        <h2>Đơn thuốc</h2>
      </div>
      <div className="card">
        <div className="invoice-list">
          {allPrescriptions.map((dt) => (
            <div className="invoice-row" key={dt.id}>
              <div>
                <b>Đơn #{dt.id}</b>
                <small>{new Date(dt.ngayKe).toLocaleDateString('vi-VN')} · {dt.dept}</small>
              </div>
              <div>
                <b>{dt.chiTiet?.length || 0} thuốc</b>
                <small>BS. {dt.doctor}</small>
              </div>
              <div>
                <span className={`tag ${dt.trangThai === 'DA_XUAT_HET' ? 'tag-success' : 'tag-warning'}`}>
                  {dt.trangThai}
                </span>
              </div>
              <div>
                <button className="small-btn" onClick={() => alert(JSON.stringify(dt.chiTiet, null, 2))}>
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

export default PrescriptionsTab;