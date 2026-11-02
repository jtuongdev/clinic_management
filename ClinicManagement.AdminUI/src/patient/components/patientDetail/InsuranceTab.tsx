import type { BaoHiemDto } from '../../type/profile.patient.type';

const insuranceTabStyles = `
.insurance-tab {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.insurance-tab .tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.insurance-tab .tab-header h2 {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}
.insurance-tab .card {
  background: #fefefe;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 0;
}
.insurance-tab .table-wrap {
  overflow-x: auto;
}
.insurance-tab table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.insurance-tab th {
  text-align: left;
  padding: 8px 8px 8px 0;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 1px solid #e2e8f0;
}
.insurance-tab td {
  padding: 8px 8px 8px 0;
  border-bottom: 1px solid #f0f2f5;
  vertical-align: middle;
}
.insurance-tab .tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}
.insurance-tab .tag-success {
  background: #d4efdf;
  color: #1e8449;
}
.insurance-tab .tag-danger {
  background: #fdedec;
  color: #c0392b;
}
.insurance-tab .tag-primary {
  background: #d6eaf8;
  color: #21618c;
}
.insurance-loading,
.insurance-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #7f8c8d;
  gap: 12px;
}
.insurance-loading i,
.insurance-empty i {
  font-size: 32px;
  color: #cbd5e1;
}
.insurance-loading i.fa-spinner {
  color: #2c7da0;
}
.insurance-empty p {
  font-size: 14px;
  margin: 0;
}
`;
interface InsuranceTabProps {
  insurances: BaoHiemDto[];
  loading?: boolean;
}

const InsuranceTab: React.FC<InsuranceTabProps> = ({ insurances, loading }) => {
  // Helper: format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN');
  };

  // Helper: get status info
  const getStatusInfo = (isValid: boolean) => {
    return {
      label: isValid ? 'Còn hiệu lực' : 'Hết hạn',
      className: isValid ? 'tag-success' : 'tag-danger',
    };
  };

  if (loading) {
    return (
      <>
        <style>{insuranceTabStyles}</style>
        <div className="insurance-loading">
          <i className="fas fa-spinner fa-spin"></i> Đang tải bảo hiểm...
        </div>
      </>
    );
  }

  if (!insurances || insurances.length === 0) {
    return (
      <>
        <style>{insuranceTabStyles}</style>
        <div className="insurance-empty">
          <i className="fas fa-shield-alt"></i>
          <p>Bệnh nhân chưa có bảo hiểm</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{insuranceTabStyles}</style>
      <div className="insurance-tab">
        <div className="tab-header">
          <h2>Danh sách bảo hiểm</h2>
        </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Loại bảo hiểm</th>
                <th>Số thẻ</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Mức hưởng</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {insurances.map((insurance) => {
                const status = getStatusInfo(insurance.coHieuLuc);
                return (
                  <tr key={insurance.id}>
                    <td>{insurance.tenNhaCungCap}</td>
                    <td>{insurance.soThe}</td>
                    <td>{formatDate(insurance.ngayBatDau)}</td>
                    <td>{formatDate(insurance.ngayKetThuc)}</td>
                    <td>{insurance.mucHuong}%</td>
                    <td>
                      <span className={`tag ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
};

export default InsuranceTab;