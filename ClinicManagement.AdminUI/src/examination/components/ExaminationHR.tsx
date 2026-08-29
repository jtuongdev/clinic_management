import React, { useState, useEffect } from 'react';

// TODO: Import API service

const mockHR = {
  kpis: [
    { label: 'Tổng NV', value: '48', color: 'primary' },
    { label: 'Bác sĩ', value: '12', color: 'blue' },
    { label: 'Điều dưỡng', value: '28', color: 'green' },
    { label: 'Hành chính', value: '8', color: 'orange' },
    { label: 'Đang trực', value: '22', color: 'green' },
    { label: 'Nghỉ phép', value: '3', color: 'red' },
  ],
  doctors: [
    { name: 'BS. Nguyễn Minh', dept: 'Nội', room: 'P101', shift: '07:00-17:00', status: 'doing' },
    { name: 'BS. Trần Hoa', dept: 'Ngoại', room: 'P205', shift: '07:00-17:00', status: 'doing' },
    { name: 'BS. Lê Tuấn', dept: 'Nhi', room: 'P302', shift: '07:00-17:00', status: 'alert' },
    { name: 'BS. Phạm Lan', dept: 'Sản', room: 'P408', shift: '07:00-17:00', status: 'doing' },
    { name: 'BS. Văn Hùng', dept: 'TMH', room: 'P510', shift: '07:00-17:00', status: 'idle' },
  ],
};

const ExaminationHR: React.FC = () => {
  const [data, setData] = useState(mockHR);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Gọi API
  }, []);

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
      doing: 'Đang khám',
      alert: 'Quá tải',
      idle: 'Rảnh',
    };
    return map[status] || 'Rảnh';
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-kicker">Nhân sự</div>
          <h1 className="page-title">Bác sĩ & điều dưỡng</h1>
          <div className="page-desc">Số lượng, chuyên khoa, lịch trực</div>
        </div>
      </div>

      <div className="kpi-grid">
        {data.kpis.map((kpi, idx) => (
          <div key={idx} className={`kpi kpi-${kpi.color}`}>
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-header"><div className="panel-title"><i className="fa-solid fa-user-doctor" /> Danh sách bác sĩ</div><span className="panel-badge">{data.doctors.length}</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Tên</th><th>Chuyên khoa</th><th>Phòng</th><th>Ca trực</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {data.doctors.map((doc, idx) => (
                <tr key={idx}>
                  <td className="cell-main">{doc.name}</td>
                  <td>{doc.dept}</td>
                  <td>{doc.room}</td>
                  <td>{doc.shift}</td>
                  <td><span className={`status ${getStatusClass(doc.status)}`}><span className="dot" /> {getStatusLabel(doc.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ExaminationHR;