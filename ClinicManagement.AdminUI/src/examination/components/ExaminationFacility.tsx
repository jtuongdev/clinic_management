import React, { useState, useEffect } from 'react';

// TODO: Import API service

const mockFacility = {
  kpis: [
    { label: 'Tổng phòng', value: '28', color: 'primary' },
    { label: 'Đang sử dụng', value: '18', color: 'green' },
    { label: 'Trống', value: '8', color: 'blue' },
    { label: 'Bảo trì', value: '2', color: 'orange' },
    { label: 'Thiết bị hỏng', value: '1', color: 'red' },
    { label: 'Phòng khám', value: '5', color: 'primary' },
  ],
  rooms: [
    { name: 'P101', type: 'Nội', doctor: 'BS. Tuấn', patient: 'Nguyễn Văn An', status: 'doing' },
    { name: 'P205', type: 'Ngoại', doctor: 'BS. Hoa', patient: 'Ngô Thị Hoa', status: 'doing' },
    { name: 'P302', type: 'Nhi', doctor: 'BS. Minh', patient: 'Lê Văn Cường', status: 'alert' },
    { name: 'P408', type: 'Sản', doctor: 'BS. Lan', patient: 'Phạm Thị Dung', status: 'doing' },
    { name: 'P510', type: 'TMH', doctor: 'BS. Hùng', patient: '—', status: 'idle' },
  ],
};

const ExaminationFacility: React.FC = () => {
  const [data, setData] = useState(mockFacility);
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
      alert: 'Chờ lâu',
      idle: 'Trống',
    };
    return map[status] || 'Trống';
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-kicker">Cơ sở</div>
          <h1 className="page-title">Phòng khám</h1>
          <div className="page-desc">Trạng thái sử dụng, thiết bị, bảo trì</div>
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
        <div className="panel-header"><div className="panel-title"><i className="fa-solid fa-door-open" /> Bảng phòng khám</div></div>
        <div className="room-grid">
          {data.rooms.map((room, idx) => (
            <div key={idx} className="room-card">
              <div className="room-head">
                <div><div className="room-name">{room.name}</div><div className="room-type">{room.type}</div></div>
                <span className={`status ${getStatusClass(room.status)}`}><span className="dot" /> {getStatusLabel(room.status)}</span>
              </div>
              <div className="room-person">
                <div className="room-line"><span>BS</span><span>{room.doctor}</span></div>
                <div className="room-line"><span>BN</span><span>{room.patient}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ExaminationFacility;