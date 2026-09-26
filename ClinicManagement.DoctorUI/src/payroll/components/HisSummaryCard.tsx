import React, { useState, useEffect } from 'react';
import { doctorScheduleApi, type HisSummaryDto } from '../../schedule/api/doctorSchedule.api';

interface Props {
  bangLuongId: number;
  thang: number;
  nam: number;
}

export const HisSummaryCard: React.FC<Props> = ({ bangLuongId, thang, nam }) => {
  const [summary, setSummary] = useState<HisSummaryDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const formatVND = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  useEffect(() => {
    setLoading(true);
    doctorScheduleApi.getHisSummary(bangLuongId)
      .then(res => { if (res?.data) setSummary(res.data); })
      .catch(() => { /* HIS not configured yet */ })
      .finally(() => setLoading(false));
  }, [bangLuongId]);

  if (loading) return null;
  if (!summary || (summary.soLuotKhamHoanThanh === 0 && summary.soDichVuClsChiDinh === 0)) return null;

  return (
    <div className="history-card" style={{ marginBottom: 16 }}>
      <div className="history-card-head">
        <span><i className="fa-solid fa-stethoscope" /> Thống Kê HIS — Thù Lao Chuyên Môn Tháng {thang}/{nam}</span>
        <button
          className="btn-link"
          onClick={() => setShowDetails(!showDetails)}
          style={{ fontSize: 12, color: 'var(--primary)' }}
        >
          {showDetails ? 'Ẩn chi tiết' : 'Xem chi tiết lượt khám'}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, padding: '12px 16px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)' }}>{summary.soLuotKhamHoanThanh}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Lượt Khám Hoàn Thành</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--success)' }}>{formatVND(summary.tienThuLaoKham)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Thù Lao Khám Bệnh</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--warning)' }}>{summary.soDichVuClsChiDinh}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>DV Cận Lâm Sàng Chỉ Định</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--success)' }}>{formatVND(summary.tongHoaHongCls)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Hoa Hồng CLS</div>
        </div>
      </div>
      {showDetails && summary.chiTietLuotKhams.length > 0 && (
        <div style={{ padding: '0 16px 16px' }}>
          <table className="data-table" style={{ margin: 0, fontSize: 13 }}>
            <thead><tr><th>Ngày Khám</th><th>Bệnh Nhân</th><th>Trạng Thái</th></tr></thead>
            <tbody>
              {summary.chiTietLuotKhams.map((lk, i) => (
                <tr key={i}>
                  <td>{new Date(lk.ngayKham).toLocaleDateString('vi-VN')}</td>
                  <td>{lk.tenBenhNhan}</td>
                  <td><span style={{ color: 'var(--success)', fontWeight: 600 }}>Hoàn thành</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HisSummaryCard;
