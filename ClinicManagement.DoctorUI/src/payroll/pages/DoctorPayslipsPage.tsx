import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { doctorScheduleApi, type PayslipItemDto } from '../../schedule/api/doctorSchedule.api';
import './DoctorPayslipsPage.css';

export const DoctorPayslipsPage: React.FC = () => {
  const [payslips, setPayslips] = useState<PayslipItemDto[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadPayslips = async () => {
    try {
      setLoading(true);
      const res = await doctorScheduleApi.getMyPayslips();
      if (res?.data) {
        setPayslips(res.data);
        if (res.data.length > 0 && selectedId === null) {
          setSelectedId(res.data[0].id);
        }
      }
    } catch (err: any) {
      console.error('Lỗi tải phiếu lương:', err);
      toast.error('Không thể tải phiếu lương cá nhân.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayslips();
  }, []);

  const currentPayslip = useMemo(() => {
    if (!selectedId) return payslips[0] || null;
    return payslips.find((p) => p.id === selectedId) || payslips[0] || null;
  }, [payslips, selectedId]);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  // Calculations for current selected payslip
  const totalIncome = useMemo(() => {
    if (!currentPayslip) return 0;
    return (
      (currentPayslip.luongTheoNgayCong || 0) +
      (currentPayslip.tienTangCa || 0) +
      (currentPayslip.tongPhuCap || 0)
    );
  }, [currentPayslip]);

  const totalDeductions = useMemo(() => {
    if (!currentPayslip) return 0;
    return (
      (currentPayslip.khauTruNghiKhongLuong || 0) +
      (currentPayslip.khauTruDiMuonVeSom || 0) +
      (currentPayslip.tienBaoHiem || 0) +
      (currentPayslip.tongKhauTru || 0)
    );
  }, [currentPayslip]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'DA_DUYET':
        return <span className="badge-status-tag on-time"><i className="fa-solid fa-circle-check"></i> Đã duyệt</span>;
      case 'DA_THANH_TOAN':
        return <span className="badge-status-tag paid"><i className="fa-solid fa-money-bill-wave"></i> Đã thanh toán</span>;
      case 'DA_KHOA':
        return <span className="badge-status-tag late"><i className="fa-solid fa-lock"></i> Đã khóa</span>;
      case 'NHAP':
        return <span className="badge-status-tag late"><i className="fa-regular fa-file-lines"></i> Dự thảo</span>;
      default:
        return <span className="badge-status-tag">{status || 'Chờ duyệt'}</span>;
    }
  };

  return (
    <div className="doctor-payslips-page">
      <div className="payslip-header">
        <div className="payslip-title">
          <i className="fa-solid fa-file-invoice-dollar" style={{ fontSize: '24px', color: 'var(--primary)' }}></i>
          <div>
            <h2>Phiếu Lương & Thu Nhập Bác Sĩ</h2>
            <div className="payslip-subtitle">Bảng kê chi tiết thu nhập, phụ cấp và các khoản khấu trừ theo kỳ lương</div>
          </div>
        </div>

        {payslips.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Kỳ lương:</label>
            <select
              value={selectedId ?? ''}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="select"
            >
              {payslips.map((p) => (
                <option key={p.id} value={p.id}>
                  Tháng {p.thang}/{p.nam} ({p.trangThaiKyLuong || 'Kỳ lương'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="empty-state" style={{ padding: '60px 0' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: 'var(--primary)' }}></i>
          <div>Đang tải bảng lương...</div>
        </div>
      ) : !currentPayslip ? (
        <div className="empty-state" style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '4px', padding: '60px 0' }}>
          <i className="fa-solid fa-receipt" style={{ fontSize: '36px', color: 'var(--line)' }}></i>
          <div>Chưa có dữ liệu bảng lương được công bố cho tài khoản của bạn.</div>
        </div>
      ) : (
        <>
          {/* Debt warning if TienNoKyNay > 0 */}
          {currentPayslip.tienNoKyNay > 0 && (
            <div className="debt-alert-banner">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <div>
                <strong>Cảnh báo phát sinh nợ kỳ này: {formatVND(currentPayslip.tienNoKyNay)}!</strong>
                <div>
                  Các khoản giảm trừ (nghỉ không lương, phạt đi muộn/về sớm) vượt quá thu nhập thực tế trong tháng {currentPayslip.thang}/{currentPayslip.nam}.
                  Khoản này được chuyển thành nợ lũy kế theo quy chế tài chính phòng khám.
                </div>
              </div>
            </div>
          )}

          {/* Top KPI row */}
          <div className="payslip-kpi-grid">
            <div className="kpi-stat-card net-pay">
              <div className="kpi-stat-label">Thực Lĩnh Kỳ Này</div>
              <div className="kpi-stat-val">{formatVND(currentPayslip.thucLinh)}</div>
              <div className="kpi-stat-sub" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Trạng thái: {currentPayslip.trangThaiKyLuong || 'Đang xử lý'}
              </div>
            </div>

            <div className="kpi-stat-card">
              <div className="kpi-stat-label">Lương Cơ Bản</div>
              <div className="kpi-stat-val">{formatVND(currentPayslip.luongCoBan)}</div>
              <div className="kpi-stat-sub">Mức lương theo hợp đồng</div>
            </div>

            <div className="kpi-stat-card">
              <div className="kpi-stat-label">Số Ngày Công</div>
              <div className="kpi-stat-val" style={{ color: 'var(--primary)' }}>
                {currentPayslip.soNgayCong} công
              </div>
              <div className="kpi-stat-sub">
                Nghỉ không lương: <strong>{currentPayslip.soNgayNghiKhongLuong}</strong> ngày
              </div>
            </div>

            {currentPayslip.tienNoKyNay > 0 ? (
              <div className="kpi-stat-card debt">
                <div className="kpi-stat-label" style={{ color: 'var(--danger)' }}>Nợ Chuyển Kỳ Sau</div>
                <div className="kpi-stat-val">{formatVND(currentPayslip.tienNoKyNay)}</div>
                <div className="kpi-stat-sub" style={{ color: 'var(--danger)' }}>Giảm trừ vượt thu nhập</div>
              </div>
            ) : (
              <div className="kpi-stat-card">
                <div className="kpi-stat-label">Tổng Khấu Trừ</div>
                <div className="kpi-stat-val" style={{ color: 'var(--warning)' }}>
                  {formatVND(totalDeductions)}
                </div>
                <div className="kpi-stat-sub">Bao gồm bảo hiểm & vi phạm</div>
              </div>
            )}
          </div>

          {/* Breakdown: Income vs Deductions */}
          <div className="breakdown-row">
            {/* Income Column */}
            <div className="breakdown-card">
              <div className="breakdown-card-head">
                <h3 style={{ color: 'var(--success)' }}>
                  <i className="fa-solid fa-circle-plus"></i> Các Khoản Thu Nhập (+)
                </h3>
              </div>
              <div className="breakdown-list">
                <div className="breakdown-item">
                  <span className="label">Lương theo ngày công thực tế</span>
                  <span className="val income">{formatVND(currentPayslip.luongTheoNgayCong)}</span>
                </div>
                <div className="breakdown-item">
                  <span className="label">Tiền làm thêm / Tăng ca (OT)</span>
                  <span className="val income">{formatVND(currentPayslip.tienTangCa)}</span>
                </div>
                <div className="breakdown-item">
                  <span className="label">Tổng phụ cấp (trách nhiệm, độc hại, ăn trưa...)</span>
                  <span className="val income">{formatVND(currentPayslip.tongPhuCap)}</span>
                </div>
              </div>
              <div className="breakdown-card-footer">
                <span>Tổng Thu Nhập Trước Giảm Trừ:</span>
                <span style={{ color: 'var(--success)' }}>{formatVND(totalIncome)}</span>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="breakdown-card">
              <div className="breakdown-card-head">
                <h3 style={{ color: 'var(--danger)' }}>
                  <i className="fa-solid fa-circle-minus"></i> Các Khoản Giảm Trừ (-)
                </h3>
              </div>
              <div className="breakdown-list">
                <div className="breakdown-item">
                  <span className="label">Khấu trừ nghỉ không lương</span>
                  <span className="val deduct">-{formatVND(currentPayslip.khauTruNghiKhongLuong)}</span>
                </div>
                <div className="breakdown-item">
                  <span className="label">Khấu trừ vi phạm đi muộn / về sớm</span>
                  <span className="val deduct">-{formatVND(currentPayslip.khauTruDiMuonVeSom)}</span>
                </div>
                <div className="breakdown-item">
                  <span className="label">Trích đóng BHXH, BHYT, BHTN</span>
                  <span className="val deduct">-{formatVND(currentPayslip.tienBaoHiem)}</span>
                </div>
                <div className="breakdown-item">
                  <span className="label">Khấu trừ khác (tạm ứng, đồng phục...)</span>
                  <span className="val deduct">-{formatVND(currentPayslip.tongKhauTru)}</span>
                </div>
              </div>
              <div className="breakdown-card-footer">
                <span>Tổng Các Khoản Giảm Trừ:</span>
                <span style={{ color: 'var(--danger)' }}>-{formatVND(totalDeductions)}</span>
              </div>
            </div>
          </div>

          {/* History table */}
          <div className="history-card">
            <div className="history-card-head">
              <span><i className="fa-solid fa-clock-rotate-left"></i> Lịch Sử Phiếu Lương Các Tháng Trước</span>
              <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--muted)' }}>
                Nhấn vào dòng để xem chi tiết
              </span>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Kỳ Lương</th>
                    <th>Lương Cơ Bản</th>
                    <th>Ngày Công</th>
                    <th>Tổng Thu Nhập</th>
                    <th>Tổng Khấu Trừ</th>
                    <th>Thực Lĩnh</th>
                    <th>Nợ Kỳ Này</th>
                    <th>Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  {payslips.map((p) => {
                    const rowIncome = (p.luongTheoNgayCong || 0) + (p.tienTangCa || 0) + (p.tongPhuCap || 0);
                    const rowDeduct = (p.khauTruNghiKhongLuong || 0) + (p.khauTruDiMuonVeSom || 0) + (p.tienBaoHiem || 0) + (p.tongKhauTru || 0);
                    const isSelected = p.id === selectedId;

                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSelectedId(p.id)}
                        style={{
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'var(--primary-soft)' : undefined,
                        }}
                      >
                        <td>
                          <strong>Tháng {p.thang}/{p.nam}</strong>
                        </td>
                        <td>{formatVND(p.luongCoBan)}</td>
                        <td>{p.soNgayCong} công</td>
                        <td style={{ color: 'var(--success)' }}>{formatVND(rowIncome)}</td>
                        <td style={{ color: 'var(--danger)' }}>-{formatVND(rowDeduct)}</td>
                        <td>
                          <strong style={{ color: 'var(--primary)' }}>{formatVND(p.thucLinh)}</strong>
                        </td>
                        <td>
                          {p.tienNoKyNay > 0 ? (
                            <span style={{ color: 'var(--danger)', fontWeight: 700 }}>
                              {formatVND(p.tienNoKyNay)}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--muted)' }}>0 ₫</span>
                          )}
                        </td>
                        <td>{renderStatusBadge(p.trangThaiKyLuong)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DoctorPayslipsPage;
