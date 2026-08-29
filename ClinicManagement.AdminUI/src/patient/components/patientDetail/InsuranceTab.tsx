import React from 'react';
import type { BaoHiemDto } from '../../type/profile.patient.type';
import './InsuranceTab.css';

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
      <div className="insurance-loading">
        <i className="fas fa-spinner fa-spin"></i> Đang tải bảo hiểm...
      </div>
    );
  }

  if (!insurances || insurances.length === 0) {
    return (
      <div className="insurance-empty">
        <i className="fas fa-shield-alt"></i>
        <p>Bệnh nhân chưa có bảo hiểm</p>
      </div>
    );
  }

  return (
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
                <th>Nhà cung cấp</th>
                <th>Số thẻ</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Mức hưởng</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {insurances.map((insurance) => {
                const status = getStatusInfo(insurance.isValid);
                return (
                  <tr key={insurance.id}>
                    <td><strong>{insurance.loaiBaoHiem}</strong></td>
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
  );
};

export default InsuranceTab;