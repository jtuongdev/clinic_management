import React, { useState, useEffect } from 'react';
import { doctorScheduleApi, type AttendanceDrillDownItemDto } from '../../schedule/api/doctorSchedule.api';
import { useExcelGridResizer } from '../../shared/hooks/useExcelGridResizer';
import toast from 'react-hot-toast';

interface Props {
  bangLuongId: number | null;
  thang: number;
  nam: number;
  onClose: () => void;
}

export const AttendanceDrilldownModal: React.FC<Props> = ({ bangLuongId, thang, nam, onClose }) => {
  const [rows, setRows] = useState<AttendanceDrillDownItemDto[]>([]);
  const [loading, setLoading] = useState(false);

  const { colWidths, startColResize } = useExcelGridResizer({
    stt: 48,
    ngay: 110,
    tenCa: 140,
    gioVao: 85,
    gioRa: 85,
    gioThucTe: 95,
    ot: 80,
    phutTre: 90,
    phutSom: 90,
    trangThai: 160,
  });

  useEffect(() => {
    if (!bangLuongId) return;
    setLoading(true);
    doctorScheduleApi.getAttendanceDrilldown(bangLuongId)
      .then(res => { if (res?.data) setRows(res.data); })
      .catch(() => toast.error('Không thể tải chi tiết ngày công.'))
      .finally(() => setLoading(false));
  }, [bangLuongId]);

  const formatTime = (dt?: string) => {
    if (!dt) return '--:--';
    return new Date(dt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dt: string) => {
    return new Date(dt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', weekday: 'short' });
  };

  const getStatusBadgeClass = (trangThai: string) => {
    switch (trangThai) {
      case 'DI_DUNG_GIO': return 'excel-badge success';
      case 'DI_MUON':
      case 'VE_SOM':
      case 'DI_MUON_VE_SOM': return 'excel-badge warning';
      case 'VANG_MAT':
      case 'THIEU_CHECK_OUT':
      case 'THIEU_CHECKOUT': return 'excel-badge danger';
      case 'NGHI_PHEP': return 'excel-badge info';
      default: return 'excel-badge';
    }
  };

  if (!bangLuongId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 1060, width: '95vw', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-header" style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fa-solid fa-calendar-check" style={{ color: '#0284c7', fontSize: 16 }} />
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
              BẢNG ĐỐI SOÁT CHI TIẾT NGÀY CÔNG & CHẤM CÔNG — THÁNG {thang}/{nam}
            </h3>
            <span className="excel-badge info" style={{ marginLeft: 8 }}>{rows.length} ca</span>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#64748b' }}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="modal-body" style={{ padding: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 26, color: '#0284c7' }} />
              <div style={{ marginTop: 8, fontSize: 12 }}>Đang trích xuất dữ liệu quẹt thẻ...</div>
            </div>
          ) : rows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
              Không tìm thấy dữ liệu chấm công đã chốt trong kỳ này.
            </div>
          ) : (
            <div className="excel-grid-container" style={{ flex: 1, minHeight: 320, maxHeight: '68vh' }}>
              <table className="excel-table">
                <thead>
                  <tr className="h-9">
                    <th className="col-stt" style={{ width: colWidths.stt }}>
                      STT
                      <div className="col-resizer" onMouseDown={e => startColResize('stt', e)} />
                    </th>
                    <th className="text-center" style={{ width: colWidths.ngay }}>
                      Ngày làm việc
                      <div className="col-resizer" onMouseDown={e => startColResize('ngay', e)} />
                    </th>
                    <th className="text-left" style={{ width: colWidths.tenCa }}>
                      Ca làm việc
                      <div className="col-resizer" onMouseDown={e => startColResize('tenCa', e)} />
                    </th>
                    <th className="text-center" style={{ width: colWidths.gioVao }}>
                      Giờ vào
                      <div className="col-resizer" onMouseDown={e => startColResize('gioVao', e)} />
                    </th>
                    <th className="text-center" style={{ width: colWidths.gioRa }}>
                      Giờ ra
                      <div className="col-resizer" onMouseDown={e => startColResize('gioRa', e)} />
                    </th>
                    <th className="text-right" style={{ width: colWidths.gioThucTe }}>
                      Giờ thực tế
                      <div className="col-resizer" onMouseDown={e => startColResize('gioThucTe', e)} />
                    </th>
                    <th className="text-right" style={{ width: colWidths.ot }}>
                      Giờ OT
                      <div className="col-resizer" onMouseDown={e => startColResize('ot', e)} />
                    </th>
                    <th className="text-right" style={{ width: colWidths.phutTre }}>
                      Phút trễ
                      <div className="col-resizer" onMouseDown={e => startColResize('phutTre', e)} />
                    </th>
                    <th className="text-right" style={{ width: colWidths.phutSom }}>
                      Phút về sớm
                      <div className="col-resizer" onMouseDown={e => startColResize('phutSom', e)} />
                    </th>
                    <th className="text-center" style={{ width: colWidths.trangThai }}>
                      Trạng thái công
                      <div className="col-resizer" onMouseDown={e => startColResize('trangThai', e)} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="h-9">
                      <td className="col-stt">{i + 1}</td>
                      <td className="text-center font-mono">
                        <span className="excel-cell-text" title={formatDate(r.ngay)}>{formatDate(r.ngay)}</span>
                      </td>
                      <td className="text-left">
                        <span className="excel-cell-text font-semibold" title={r.tenCa}>{r.tenCa}</span>
                      </td>
                      <td className="text-center font-mono" style={{ color: r.gioVao ? '#047857' : '#94a3b8' }}>
                        {formatTime(r.gioVao)}
                      </td>
                      <td className="text-center font-mono" style={{ color: r.gioRa ? '#0369a1' : '#b45309' }}>
                        {formatTime(r.gioRa)}
                      </td>
                      <td className="text-right font-mono font-semibold">
                        {r.soGioLamThucTe > 0 ? `${r.soGioLamThucTe.toFixed(1)}h` : '—'}
                      </td>
                      <td className="text-right font-mono" style={{ color: r.soGioOT > 0 ? '#047857' : '#94a3b8', fontWeight: r.soGioOT > 0 ? 600 : 400 }}>
                        {r.soGioOT > 0 ? `+${r.soGioOT.toFixed(1)}h` : '—'}
                      </td>
                      <td className="text-right font-mono" style={{ color: r.phutDiMuon > 0 ? '#b45309' : '#94a3b8', fontWeight: r.phutDiMuon > 0 ? 600 : 400 }}>
                        {r.phutDiMuon > 0 ? `${r.phutDiMuon}p` : '0p'}
                      </td>
                      <td className="text-right font-mono" style={{ color: r.phutVeSom > 0 ? '#b45309' : '#94a3b8', fontWeight: r.phutVeSom > 0 ? 600 : 400 }}>
                        {r.phutVeSom > 0 ? `${r.phutVeSom}p` : '0p'}
                      </td>
                      <td className="text-center">
                        <span className={getStatusBadgeClass(r.trangThai)} title={r.loaiCong}>
                          {r.loaiCong}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ padding: '8px 16px', background: '#f8fafc', borderTop: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: '#64748b' }}>
          <span>* Dữ liệu quẹt thẻ thực tế trích xuất từ phân hệ Chấm công theo kỳ khóa số.</span>
          <button className="btn btn-outline" onClick={onClose} style={{ fontSize: 12, padding: '4px 14px' }}>
            Đóng bảng tra cứu
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDrilldownModal;
