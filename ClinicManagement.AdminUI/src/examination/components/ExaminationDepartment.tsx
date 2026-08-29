import React, { useEffect } from 'react';
import { useExamination } from '../hook/useExamination';
import { KhoaOverviewDto } from '../../department/type/department.type';

const ExaminationDepartment: React.FC = () => {
  const { 
    khoaOverview, 
    loadingKhoaOverview, 
    fetchKhoaOverview,
    filters 
  } = useExamination();

  // Gọi API khi component mount hoặc filters thay đổi
  useEffect(() => {
    fetchKhoaOverview();
  }, [filters]);

  // KPI từ dữ liệu khoa
  const kpis = khoaOverview.length > 0
    ? [
        { 
          label: 'Tổng lượt', 
          value: khoaOverview.reduce((sum, k) => sum + k.tongLuotKham, 0).toString(), 
          color: 'primary' 
        },
        { 
          label: 'Tổng chờ', 
          value: khoaOverview.reduce((sum, k) => sum + k.soLuotCho, 0).toString(), 
          color: 'blue' 
        },
        { 
          label: 'Số khoa', 
          value: khoaOverview.length.toString(), 
          color: 'green' 
        },
        { 
          label: 'Tổng bác sĩ', 
          value: khoaOverview.reduce((sum, k) => sum + k.soBacSi, 0).toString(), 
          color: 'orange' 
        },
        { 
          label: 'Khoa hoạt động', 
          value: khoaOverview.filter(k => k.trangThai === 'HoatDong').length.toString(), 
          color: 'green' 
        },
        { 
          label: 'Khoa quá tải', 
          value: khoaOverview.filter(k => k.trangThai === 'QuaTai').length.toString(), 
          color: 'red' 
        },
      ]
    : [];

  // Dữ liệu cho bảng danh sách khoa
  const departments = khoaOverview.map(k => ({
    name: k.tenKhoa,
    value: k.tongLuotKham,
    wait: k.soLuotCho,
    doctors: k.soBacSi,
    status: k.trangThai === 'QuaTai' ? 'alert' : k.trangThai === 'HoatDong' ? 'doing' : 'idle'
  }));

  // Dữ liệu cho bar chart số lượng chờ
  const maxWait = Math.max(...khoaOverview.map(k => k.soLuotCho), 1);
  const waitTimes = khoaOverview.map(k => ({
    name: k.tenKhoa,
    value: k.soLuotCho,
    percent: Math.round((k.soLuotCho / maxWait) * 100),
    color: k.soLuotCho >= 10 ? 'red' : k.soLuotCho >= 5 ? 'orange' : 'green'
  }));

  // Đánh giá hài lòng (mock, vì chưa có API)
  const satisfaction = khoaOverview.map(k => ({
    name: k.tenKhoa,
    rating: (4 + Math.random() * 0.8).toFixed(1)
  }));

  const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
      doing: 'status-doing',
      alert: 'status-alert',
      idle: 'status-idle',
    };
    return map[status] || 'status-idle';
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      doing: 'Hoạt động',
      alert: 'Quá tải',
      idle: 'Bình thường',
    };
    return map[status] || 'Bình thường';
  };

  if (loadingKhoaOverview) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  if (khoaOverview.length === 0 && !loadingKhoaOverview) {
    return <div className="empty">Không có dữ liệu khoa</div>;
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Hiệu suất các khoa</h1>
          <div className="page-desc">Lượt khám, thời gian chờ, mức độ hoạt động</div>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => alert('So sánh các khoa')}>
            <i className="fa-solid fa-chart-column" /> So sánh
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        {kpis.map((kpi, idx) => (
          <div key={idx} className={`kpi kpi-${kpi.color}`}>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Bảng danh sách khoa */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title"><i className="fa-solid fa-building" /> Danh sách khoa</div>
          <span className="panel-badge">{departments.length} khoa</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Khoa</th>
                <th>Lượt</th>
                <th>Chờ</th>
                <th>Bác sĩ</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, idx) => (
                <tr key={idx}>
                  <td className="cell-main">{dept.name}</td>
                  <td>{dept.value}</td>
                  <td>{dept.wait}</td>
                  <td>{dept.doctors}</td>
                  <td>
                    <span className={`status ${getStatusClass(dept.status)}`}>
                      <span className="dot" /> {getStatusLabel(dept.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid 2: Bar chart + Satisfaction */}
      <div className="grid-2-eq">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title"><i className="fa-regular fa-hourglass-half" /> Số lượng chờ theo khoa</div>
          </div>
          <div className="panel-body">
            <div className="bar-list">
              {waitTimes.map((item, idx) => (
                <div key={idx} className="bar-row">
                  <div className="bar-name">{item.name}</div>
                  <div className="bar-track">
                    <div className={`bar-fill ${item.color}`} style={{ width: `${item.percent}%` }} />
                  </div>
                  <div className="bar-value">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="panel-title"><i className="fa-regular fa-star" /> Đánh giá hài lòng</div>
          </div>
          <div className="summary-list">
            {satisfaction.map((item, idx) => (
              <div key={idx} className="summary-row">
                <div className="summary-left">
                  <div className="summary-icon green"><i className="fa-regular fa-star" /></div>
                  <div><div className="summary-name">{item.name}</div></div>
                </div>
                <div className="summary-value">{item.rating} ★</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ExaminationDepartment;