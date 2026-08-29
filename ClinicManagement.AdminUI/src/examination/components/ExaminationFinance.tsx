import React, { useState, useEffect } from 'react';

// TODO: Import API service

const mockFinance = {
  kpis: [
    { label: 'Doanh thu', value: '128,5tr', color: 'primary' },
    { label: 'Chưa thu', value: '23,2tr', color: 'blue' },
    { label: 'Đã thu', value: '105,3tr', color: 'green' },
    { label: 'BHYT', value: '42,1tr', color: 'orange' },
    { label: 'Công nợ', value: '8,7tr', color: 'red' },
    { label: 'Số hóa đơn', value: '56', color: 'primary' },
  ],
  invoices: [
    { code: 'HD-001', patient: 'Nguyễn Văn An', total: '850.000đ', remaining: '850.000đ', status: 'unpaid' },
    { code: 'HD-003', patient: 'Lê Văn Cường', total: '1.200.000đ', remaining: '600.000đ', status: 'partial' },
  ],
};

const ExaminationFinance: React.FC = () => {
  const [data, setData] = useState(mockFinance);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Gọi API
  }, []);

  const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
      unpaid: 'status-alert',
      partial: 'status-orange',
      paid: 'status-done',
    };
    return map[status] || 'status-idle';
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      unpaid: 'Chưa thanh toán',
      partial: 'Thanh toán 1 phần',
      paid: 'Đã thanh toán',
    };
    return map[status] || 'Chưa thanh toán';
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-kicker">Tài chính</div>
          <h1 className="page-title">Doanh thu & công nợ</h1>
          <div className="page-desc">Theo dõi hóa đơn, thanh toán, BHYT</div>
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
        <div className="panel-header"><div className="panel-title"><i className="fa-regular fa-list" /> Hóa đơn chờ thanh toán</div><span className="panel-badge">{data.invoices.length}</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Mã HD</th><th>Bệnh nhân</th><th>Tổng tiền</th><th>Còn lại</th><th>Trạng thái</th><th></th></tr></thead>
            <tbody>
              {data.invoices.map((inv, idx) => (
                <tr key={idx}>
                  <td className="cell-code">{inv.code}</td>
                  <td className="cell-main">{inv.patient}</td>
                  <td>{inv.total}</td>
                  <td>{inv.remaining}</td>
                  <td><span className={`status ${getStatusClass(inv.status)}`}><span className="dot" /> {getStatusLabel(inv.status)}</span></td>
                  <td><button className="row-action"><i className="fa-solid fa-eye" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ExaminationFinance;