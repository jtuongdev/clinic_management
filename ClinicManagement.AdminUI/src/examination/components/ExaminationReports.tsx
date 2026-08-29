import React, { useState, useEffect } from 'react';

// TODO: Import API service

const mockReports = {
  kpis: [
    { label: 'Doanh thu tháng', value: '2,8 tỷ', color: 'primary' },
    { label: 'Lượt khám', value: '3.247', color: 'blue' },
    { label: 'BHYT', value: '78%', color: 'green' },
    { label: 'Hài lòng', value: '4.8/5', color: 'orange' },
    { label: 'Bác sĩ', value: '12', color: 'green' },
    { label: 'Khoa', value: '5', color: 'primary' },
  ],
  revenue: [
    { name: 'Nội', value: '1,2 tỷ', percent: 100 },
    { name: 'Ngoại', value: '850tr', percent: 70, color: 'green' },
    { name: 'Nhi', value: '650tr', percent: 55, color: 'orange' },
    { name: 'Sản', value: '450tr', percent: 40, color: 'blue' },
    { name: 'TMH', value: '350tr', percent: 30, color: 'red' },
  ],
  doctors: [
    { name: 'BS. Tuấn', value: '142 lượt', rating: '98%' },
    { name: 'BS. Hoa', value: '128 lượt', rating: '96%' },
    { name: 'BS. Minh', value: '115 lượt', rating: '94%' },
  ],
};

const ExaminationReports: React.FC = () => {
  const [data, setData] = useState(mockReports);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Gọi API
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-kicker">Báo cáo</div>
          <h1 className="page-title">Phân tích tổng hợp</h1>
          <div className="page-desc">Doanh thu, lượt khám, KPI các khoa</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => alert('Xuất báo cáo Excel')}>
            <i className="fa-solid fa-file-excel" /> Excel
          </button>
          <button className="btn btn-primary" onClick={() => alert('Xuất báo cáo PDF')}>
            <i className="fa-solid fa-file-pdf" /> PDF
          </button>
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

      <div className="grid-2-eq">
        <div className="panel">
          <div className="panel-header"><div className="panel-title"><i className="fa-solid fa-chart-column" /> Doanh thu theo khoa</div></div>
          <div className="panel-body">
            <div className="bar-list">
              {data.revenue.map((item, idx) => (
                <div key={idx} className="bar-row">
                  <div className="bar-name">{item.name}</div>
                  <div className="bar-track"><div className={`bar-fill ${item.color || 'primary'}`} style={{ width: `${item.percent}%` }} /></div>
                  <div className="bar-value">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header"><div className="panel-title"><i className="fa-solid fa-user-doctor" /> KPI bác sĩ</div></div>
          <div className="summary-list">
            {data.doctors.map((doc, idx) => (
              <div key={idx} className="summary-row">
                <div className="summary-left"><div><div className="summary-name">{doc.name}</div></div></div>
                <div className="summary-value">{doc.value} · {doc.rating}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ExaminationReports;