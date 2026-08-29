import React from 'react';
import { type BenhNhanProfileDto } from '../../type/profile.patient.type';

interface OverviewTabProps {
  patient: BenhNhanProfileDto;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ patient }) => {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount: number) => {
    if (amount === 0) return '0 ₫';
    return amount.toLocaleString('vi-VN') + ' ₫';
  };

  const genderMap: Record<string, string> = {
    'M': 'Nam',
    'F': 'Nữ',
    'O': 'Khác',
  };

  const statusMap: Record<string, string> = {
    'CHO_KHAM': 'Chờ khám',
    'DANG_KHAM': 'Đang khám',
    'DA_KHAM': 'Đã khám',
    'KET_LUAN': 'Kết luận',
    'HOAN_THANH': 'Hoàn thành',
    'DA_HUY': 'Đã hủy',
  };

  // Tính tuổi
  const birthDate = new Date(patient.ngaySinh);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

  const currentInsurance = patient.baoHiems.find(bh => bh.isValid);
  const insuranceStatus = currentInsurance
    ? `${currentInsurance.loaiBaoHiem} ${currentInsurance.mucHuong}% còn hiệu lực`
    : 'Không có bảo hiểm hiệu lực';

  const lastVisit = patient.luotKhamGanNhat.length > 0 ? patient.luotKhamGanNhat[0] : null;

  // Cảnh báo
  const alerts: any[] = [];
  patient.tienSuBenhs.forEach(ts => {
    if (ts.loaiTienSu === 'DI_UNG') {
      alerts.push({
        type: 'danger',
        title: 'Dị ứng thuốc',
        desc: `${ts.ten}${ts.ghiChu ? ' — ' + ts.ghiChu : ''}`,
      });
    }
  });
  patient.baoHiems.forEach(bh => {
    if (!bh.isValid) {
      alerts.push({
        type: 'warning',
        title: 'Bảo hiểm hết hạn',
        desc: `${bh.loaiBaoHiem} — hết hạn ${formatDate(bh.ngayKetThuc)}`,
      });
    }
  });
  if (alerts.length === 0) {
    alerts.push({
      type: 'info',
      title: 'Thông tin',
      desc: 'Không có cảnh báo nào',
    });
  }

  const getTagClass = (type: string) => {
    const map: Record<string, string> = {
      'success': 'tag-success',
      'danger': 'tag-danger',
      'primary': 'tag-primary',
      'warning': 'tag-warning',
      'info': 'tag-primary',
    };
    return map[type] || 'tag-primary';
  };

  return (
    <>
      <div className="tab-header">
        <h2>Tổng quan hồ sơ</h2>
      </div>
      <div className="card">
        <div style={{display:'flex', gap:'16px', flexWrap:'wrap'}}>
          <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
            <div className="avatar-big" style={{width:60,height:60,borderRadius:'50%',background:'linear-gradient(135deg,#2c7da0,#1a5f7a)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:700}}>
              {patient.hoTen.split(' ').map(w => w[0]).join('')}
            </div>
            <div>
              <h2 style={{fontSize:22,fontWeight:700,margin:0}}>{patient.hoTen}</h2>
              <div style={{fontSize:13,color:'#7f8c8d'}}>Mã BN: <strong>{patient.maBenhNhanNoiBo}</strong></div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'6px 18px',marginTop:4,fontSize:13}}>
                <span><strong>{genderMap[patient.gioiTinh] || patient.gioiTinh}</strong> · {age} tuổi</span>
                <span>{formatDate(patient.ngaySinh)}</span>
                <span>CCCD: <strong>{patient.soCCCD}</strong></span>
                <span>SĐT: <strong>{patient.dienThoai}</strong></span>
              </div>
              <div style={{marginTop:8}}>
                <span className={`tag ${getTagClass('success')}`}>● {patient.isDeleted ? 'Đã xóa' : 'Đang hoạt động'}</span>
                <span className={`tag ${getTagClass('primary')}`}>{insuranceStatus}</span>
                {alerts.some(a => a.type === 'danger') && (
                  <span className={`tag ${getTagClass('danger')}`}>⚠ Dị ứng</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="summary-grid" style={{marginTop:16}}>
          <div className="summary-box"><small>Lượt khám</small><b>{patient.thongTinTongQuan.tongLuotKham}</b></div>
          <div className="summary-box"><small>Lần khám gần nhất</small><b>{lastVisit ? formatDate(lastVisit.ngayKham) : 'Chưa có'}</b></div>
          <div className="summary-box"><small>Đơn thuốc</small><b>0</b></div>
          <div className="summary-box"><small>Lịch hẹn</small><b>0</b></div>
          <div className="summary-box"><small>Công nợ</small><b style={{color: patient.thongTinTongQuan.tongTienConNo > 0 ? '#c0392b' : '#27ae60'}}>
            {formatCurrency(patient.thongTinTongQuan.tongTienConNo)}
          </b></div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginTop:12}}>
          {alerts.map((alert, idx) => (
            <div key={idx} style={{borderLeft:`4px solid ${alert.type === 'danger' ? '#e74c3c' : alert.type === 'warning' ? '#f39c12' : '#2c7da0'}`, background:'#fefefe',borderRadius:8,padding:'12px 16px',border:'1px solid #e2e8f0'}}>
              <strong>⚠ {alert.title}</strong>
              <span style={{display:'block',fontSize:12,color:'#7f8c8d'}}>{alert.desc}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="section-title"><i className="fas fa-heartbeat"></i> Sinh hiệu gần nhất</div>
          <div className="vitals-grid">
            <div className="vital-item"><small>Huyết áp</small><b>--/--</b></div>
            <div className="vital-item"><small>Mạch</small><b>--</b></div>
            <div className="vital-item"><small>Nhiệt độ</small><b>--</b></div>
            <div className="vital-item"><small>SpO₂</small><b>--</b></div>
            <div className="vital-item"><small>Cân nặng</small><b>--</b></div>
            <div className="vital-item"><small>Chiều cao</small><b>--</b></div>
          </div>
        </div>
        <div className="card">
          <div className="section-title"><i className="fas fa-calendar-check"></i> Lịch hẹn sắp tới</div>
          <div><b>Chưa có lịch hẹn</b></div>
        </div>
      </div>
    </>
  );
};

export default OverviewTab;