import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { doctorScheduleApi, type PayslipItemDto } from '../../schedule/api/doctorSchedule.api';
import { AttendanceDrilldownModal } from '../components/AttendanceDrilldownModal';
import { HisSummaryCard } from '../components/HisSummaryCard';
import './DoctorPayslipsPage.css';

export const DoctorPayslipsPage: React.FC = () => {
  const [payslips, setPayslips] = useState<PayslipItemDto[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDrilldown, setShowDrilldown] = useState<boolean>(false);

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

  const totalIncome = currentPayslip?.tongThuNhap ?? 0;
  const totalDeductions = currentPayslip?.tongGiamTru ?? 0;

  const handlePrint = () => {
    window.print();
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'DA_CHOT':
        return <span className="badge-status-tag late"><i className="fa-solid fa-lock" /> Đã chốt</span>;
      case 'DA_THANH_TOAN':
        return <span className="badge-status-tag paid"><i className="fa-solid fa-money-bill-wave" /> Đã chi trả</span>;
      default:
        return <span className="badge-status-tag">{status}</span>;
    }
  };

  return (
    <div className="doctor-payslips-page">
      {/* HEADER KHÔNG IN */}
      <div className="payslip-header no-print">
        <div className="payslip-title">
          <i className="fa-solid fa-file-invoice-dollar" style={{ fontSize: 20, color: '#0284c7' }} />
          <div>
            <h2>PHIẾU LƯƠNG & THU NHẬP BÁC SĨ</h2>
            <div className="payslip-subtitle">Phân hệ đối soát thù lao chuyên môn, công trực và bảo hiểm</div>
          </div>
        </div>

        {currentPayslip && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              Bác sĩ: <strong>{currentPayslip.tenNhanVien}</strong> | {currentPayslip.chucDanh || 'Bác sĩ'}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }} className="no-print">
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28, color: '#0284c7' }} />
          <div style={{ marginTop: 10, fontSize: 13 }}>Đang tải bảng lương...</div>
        </div>
      ) : payslips.length === 0 ? (
        <div className="no-print" style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 4, padding: '60px 0', textAlign: 'center' }}>
          <i className="fa-solid fa-receipt" style={{ fontSize: 36, color: '#94a3b8' }} />
          <div style={{ marginTop: 12, color: '#334155', fontSize: 14, fontWeight: 600 }}>
            Chưa có kỳ lương nào được khóa sổ hoặc chi trả cho tài khoản của bạn.
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
            Hệ thống chỉ hiển thị các kỳ lương đã được Phòng Nhân sự chốt số liệu chính thức (DA_CHOT hoặc DA_THANH_TOAN).
          </div>
        </div>
      ) : (
        /* BỐ CỤC MASTER-DETAIL (28% CỘT TRÁI - 72% CỘT PHẢI) */
        <div className="payslip-master-detail">
          {/* CỘT TRÁI (28%): LỊCH SỬ CÁC KỲ LƯƠNG ĐÃ CHỐT */}
          <div className="payslip-master-sidebar no-print">
            <div className="master-sidebar-header">
              <span><i className="fa-solid fa-clock-rotate-left" /> Kỳ Lương Đã Chốt</span>
              <span className="excel-badge info">{payslips.length}</span>
            </div>
            <div className="master-sidebar-list">
              {payslips.map((p) => {
                const isSelected = p.id === currentPayslip?.id;
                return (
                  <div
                    key={p.id}
                    className={`master-period-card ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedId(p.id)}
                  >
                    <div className="master-card-head">
                      <span className="master-period-title">Tháng {p.thang}/{p.nam}</span>
                      {renderStatusBadge(p.trangThaiKyLuong)}
                    </div>
                    <div className="master-period-net">{formatVND(p.thucLinh)}</div>
                    <div className="master-period-meta">
                      <span>Công làm: <strong>{p.soNgayCong}</strong></span>
                      {p.tienNoKyNay > 0 && (
                        <span style={{ color: '#dc2626', fontWeight: 600 }}>Nợ: {formatVND(p.tienNoKyNay)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CỘT PHẢI (72%): CHI TIẾT BẢNG KÊ THU NHẬP */}
          {currentPayslip && (
            <div className="payslip-detail-main">
              {/* Toolbar hành động */}
              <div className="detail-action-toolbar no-print">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    Chi tiết phiếu lương Tháng {currentPayslip.thang}/{currentPayslip.nam}
                  </span>
                  {renderStatusBadge(currentPayslip.trangThaiKyLuong)}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn btn-outline"
                    onClick={() => setShowDrilldown(true)}
                    style={{ fontSize: 12, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <i className="fa-solid fa-calendar-check" />
                    Chi tiết ngày công
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handlePrint}
                    style={{ fontSize: 12, padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 6, background: '#0284c7', borderColor: '#0284c7', color: '#fff' }}
                  >
                    <i className="fa-solid fa-print" />
                    In phiếu lương A4
                  </button>
                </div>
              </div>

              {/* Cảnh báo nợ nếu có */}
              {currentPayslip.tienNoKyNay > 0 && (
                <div className="debt-alert-banner no-print">
                  <i className="fa-solid fa-triangle-exclamation" />
                  <div>
                    <strong>Cảnh báo dư nợ chuyển kỳ sau: {formatVND(currentPayslip.tienNoKyNay)}</strong>
                    <div>Tổng các khoản giảm trừ (nghỉ không lương, phạt giờ) vượt quá thu nhập thực nhận trong tháng.</div>
                  </div>
                </div>
              )}

              {/* KHUNG THỰC LĨNH NỔI BẬT */}
              <div className="thuc-linh-hero-box no-print">
                <div>
                  <div className="thuc-linh-hero-label">Thực Lĩnh Kỳ Này</div>
                  <div style={{ fontSize: 11, color: '#0369a1', marginTop: 2 }}>
                    Lương cơ bản: {formatVND(currentPayslip.luongCoBan)} • Số ngày công: {currentPayslip.soNgayCong} ngày
                  </div>
                </div>
                <div className="thuc-linh-hero-amount">
                  {formatVND(currentPayslip.thucLinh)}
                </div>
              </div>

              {/* HIS Summary Card */}
              <div className="no-print">
                <HisSummaryCard
                  bangLuongId={currentPayslip.id}
                  thang={currentPayslip.thang}
                  nam={currentPayslip.nam}
                />
              </div>

              {/* BẢNG BÓC TÁCH: THU NHẬP (+) vs GIẢM TRỪ (-) */}
              <div className="breakdown-row no-print">
                {/* Thu nhập (+) */}
                <div className="breakdown-card">
                  <div className="breakdown-card-head">
                    <h3 style={{ color: '#059669' }}>
                      <i className="fa-solid fa-circle-plus" style={{ marginRight: 6 }} />
                      Các Khoản Thu Nhập (+)
                    </h3>
                  </div>
                  <div className="breakdown-list">
                    <div className="breakdown-item">
                      <span className="label">Lương theo ngày công thực tế ({currentPayslip.soNgayCong} công)</span>
                      <span className="val income">{formatVND(currentPayslip.luongTheoNgayCong)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="label">Tiền làm thêm giờ (OT)</span>
                      <span className="val income">{formatVND(currentPayslip.tienTangCa)}</span>
                    </div>
                    {(currentPayslip.tienThuLaoKham || 0) > 0 && (
                      <div className="breakdown-item">
                        <span className="label">Thù lao khám bệnh trực tiếp (HIS)</span>
                        <span className="val income">{formatVND(currentPayslip.tienThuLaoKham)}</span>
                      </div>
                    )}
                    {(currentPayslip.tienHoaHongCls || 0) > 0 && (
                      <div className="breakdown-item">
                        <span className="label">Hoa hồng cận lâm sàng (CLS)</span>
                        <span className="val income">{formatVND(currentPayslip.tienHoaHongCls)}</span>
                      </div>
                    )}
                    {/* Danh sách phụ cấp từ chi tiết */}
                    {(currentPayslip.chiTiets || [])
                      .filter((c) => c.loaiKhoan === 'PHU_CAP')
                      .map((c, idx) => (
                        <div className="breakdown-item" key={c.id || idx}>
                          <span className="label">{c.tenKhoan}</span>
                          <span className="val income">{formatVND(c.soTien)}</span>
                        </div>
                      ))}
                    <div className="breakdown-item">
                      <span className="label">Phụ cấp cố định / Khác</span>
                      <span className="val income">{formatVND(currentPayslip.tongPhuCap)}</span>
                    </div>
                  </div>
                  <div className="breakdown-card-footer">
                    <span>Tổng Thu Nhập:</span>
                    <span style={{ color: '#059669' }}>{formatVND(totalIncome)}</span>
                  </div>
                </div>

                {/* Giảm trừ (-) */}
                <div className="breakdown-card">
                  <div className="breakdown-card-head">
                    <h3 style={{ color: '#dc2626' }}>
                      <i className="fa-solid fa-circle-minus" style={{ marginRight: 6 }} />
                      Các Khoản Giảm Trừ (-)
                    </h3>
                  </div>
                  <div className="breakdown-list">
                    <div className="breakdown-item">
                      <span className="label">Khấu trừ nghỉ không lương ({currentPayslip.soNgayNghiKhongLuong} ngày)</span>
                      <span className="val deduct">-{formatVND(currentPayslip.khauTruNghiKhongLuong)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="label">Phạt đi muộn (50.000đ/lần)</span>
                      <span className="val deduct">-{formatVND(currentPayslip.khauTruDiMuonVeSom)}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="label">Trích nộp BHXH, BHYT, BHTN</span>
                      <span className="val deduct">-{formatVND(currentPayslip.tienBaoHiem)}</span>
                    </div>
                    {/* Danh sách khấu trừ thủ công */}
                    {(currentPayslip.chiTiets || [])
                      .filter((c) => c.loaiKhoan === 'KHAU_TRU')
                      .map((c, idx) => (
                        <div className="breakdown-item" key={c.id || idx}>
                          <span className="label">{c.tenKhoan}</span>
                          <span className="val deduct">-{formatVND(c.soTien)}</span>
                        </div>
                      ))}
                    <div className="breakdown-item">
                      <span className="label">Khấu trừ khác / Tạm ứng</span>
                      <span className="val deduct">-{formatVND(currentPayslip.tongKhauTru)}</span>
                    </div>
                  </div>
                  <div className="breakdown-card-footer">
                    <span>Tổng Giảm Trừ:</span>
                    <span style={{ color: '#dc2626' }}>-{formatVND(totalDeductions)}</span>
                  </div>
                </div>
              </div>

              {/* BẢN IN CHUẨN A4 (@media print ONLY) */}
              <div className="print-only a4-print-sheet">
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: '11pt', fontWeight: 'bold' }}>PHÒNG KHÁM ĐA KHOA QUỐC TẾ</div>
                  <div style={{ fontSize: '9pt', color: '#444' }}>HỆ THỐNG QUẢN TRỊ BỆNH VIỆN & NHÂN SỰ HIS/HRM</div>
                  <div style={{ fontSize: '14pt', fontWeight: 'bold', marginTop: 10, textTransform: 'uppercase' }}>
                    PHIẾU THANH TOÁN LƯƠNG & THU NHẬP
                  </div>
                  <div style={{ fontSize: '10pt', fontStyle: 'italic', marginTop: 2 }}>
                    Kỳ lương: Tháng {currentPayslip.thang} năm {currentPayslip.nam}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5pt', marginBottom: 12 }}>
                  <div>
                    <div>Họ và tên: <strong>{currentPayslip.tenNhanVien}</strong></div>
                    <div>Mã nhân viên: <strong>#{currentPayslip.maNhanVien}</strong></div>
                  </div>
                  <div>
                    <div>Chức danh: <strong>{currentPayslip.chucDanh || 'Bác sĩ'}</strong></div>
                    <div>Khoa / Phòng: <strong>{currentPayslip.tenKhoa || 'Khối Điều trị'}</strong></div>
                  </div>
                </div>

                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '8%', textAlign: 'center' }}>STT</th>
                      <th style={{ width: '62%' }}>Nội dung khoản mục</th>
                      <th style={{ width: '30%', textAlign: 'right' }}>Số tiền (VNĐ)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ textAlign: 'center' }}><strong>I</strong></td>
                      <td><strong>CÁC KHOẢN THU NHẬP (+)</strong></td>
                      <td style={{ textAlign: 'right' }}><strong>{formatVND(totalIncome)}</strong></td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'center' }}>1</td>
                      <td>Lương theo ngày công thực tế ({currentPayslip.soNgayCong} công / 26 ngày chuẩn)</td>
                      <td style={{ textAlign: 'right' }}>{formatVND(currentPayslip.luongTheoNgayCong)}</td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'center' }}>2</td>
                      <td>Tiền làm thêm giờ (Tăng ca OT)</td>
                      <td style={{ textAlign: 'right' }}>{formatVND(currentPayslip.tienTangCa)}</td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'center' }}>3</td>
                      <td>Thù lao khám bệnh trực tiếp (HIS)</td>
                      <td style={{ textAlign: 'right' }}>{formatVND(currentPayslip.tienThuLaoKham || 0)}</td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'center' }}>4</td>
                      <td>Hoa hồng chỉ định cận lâm sàng (CLS)</td>
                      <td style={{ textAlign: 'right' }}>{formatVND(currentPayslip.tienHoaHongCls || 0)}</td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'center' }}>5</td>
                      <td>Phụ cấp chức vụ / Phụ cấp cố định / Khác</td>
                      <td style={{ textAlign: 'right' }}>{formatVND(currentPayslip.tongPhuCap)}</td>
                    </tr>

                    <tr>
                      <td style={{ textAlign: 'center' }}><strong>II</strong></td>
                      <td><strong>CÁC KHOẢN GIẢM TRỪ (-)</strong></td>
                      <td style={{ textAlign: 'right' }}><strong>-{formatVND(totalDeductions)}</strong></td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'center' }}>1</td>
                      <td>Khấu trừ nghỉ không lương ({currentPayslip.soNgayNghiKhongLuong} ngày)</td>
                      <td style={{ textAlign: 'right' }}>-{formatVND(currentPayslip.khauTruNghiKhongLuong)}</td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'center' }}>2</td>
                      <td>Phạt đi muộn (50.000đ/lần)</td>
                      <td style={{ textAlign: 'right' }}>-{formatVND(currentPayslip.khauTruDiMuonVeSom)}</td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'center' }}>3</td>
                      <td>Trích nộp BHXH, BHYT, BHTN bắt buộc</td>
                      <td style={{ textAlign: 'right' }}>-{formatVND(currentPayslip.tienBaoHiem)}</td>
                    </tr>
                    <tr>
                      <td style={{ textAlign: 'center' }}>4</td>
                      <td>Các khoản giảm trừ khác / Tạm ứng</td>
                      <td style={{ textAlign: 'right' }}>-{formatVND(currentPayslip.tongKhauTru)}</td>
                    </tr>

                    <tr style={{ background: '#f8fafc' }}>
                      <td style={{ textAlign: 'center' }}><strong>III</strong></td>
                      <td style={{ fontSize: '10.5pt', fontWeight: 'bold' }}>SỐ TIỀN THỰC LĨNH (I - II)</td>
                      <td style={{ textAlign: 'right', fontSize: '11pt', fontWeight: 'bold' }}>
                        {formatVND(currentPayslip.thucLinh)}
                      </td>
                    </tr>
                    {currentPayslip.tienNoKyNay > 0 && (
                      <tr>
                        <td style={{ textAlign: 'center' }}>*</td>
                        <td style={{ color: '#dc2626' }}>Số tiền âm lũy kế chuyển nợ kỳ sau</td>
                        <td style={{ textAlign: 'right', color: '#dc2626', fontWeight: 'bold' }}>
                          {formatVND(currentPayslip.tienNoKyNay)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div className="a4-signatures">
                  <div className="signature-box">
                    <strong>Người lập biểu</strong>
                    <div style={{ fontSize: '8.5pt', fontStyle: 'italic', marginTop: 2 }}>(Ký, ghi rõ họ tên)</div>
                  </div>
                  <div className="signature-box">
                    <strong>Kế toán trưởng</strong>
                    <div style={{ fontSize: '8.5pt', fontStyle: 'italic', marginTop: 2 }}>(Ký, ghi rõ họ tên)</div>
                  </div>
                  <div className="signature-box">
                    <strong>Bác sĩ nhận lương</strong>
                    <div style={{ fontSize: '8.5pt', fontStyle: 'italic', marginTop: 2 }}>(Ký, ghi rõ họ tên)</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Attendance Drilldown */}
      {showDrilldown && currentPayslip && (
        <AttendanceDrilldownModal
          bangLuongId={currentPayslip.id}
          thang={currentPayslip.thang}
          nam={currentPayslip.nam}
          onClose={() => setShowDrilldown(false)}
        />
      )}
    </div>
  );
};

export default DoctorPayslipsPage;
