import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { type LichHenDto, appointmentApi } from '../api/appointment.api';

interface AppointmentDetailModalProps {
  appointment: LichHenDto | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onRefresh,
}) => {
  const [loading, setLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);

  if (!isOpen || !appointment) return null;

  const calculateAge = (dobString?: string) => {
    if (!dobString) return '--';
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return '--';
    const ageDifMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '--';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const handleTiepNhan = async () => {
    try {
      setLoading(true);
      const res = await appointmentApi.tiepNhan(appointment.id);
      if (res.data.success) {
        toast.success(res.data.message || `Đã tiếp nhận bệnh nhân vào lượt khám #${res.data.data.maLuotKham}!`);
        onRefresh();
        onClose();
      } else {
        toast.error(res.data.message || 'Không thể tiếp nhận lịch hẹn');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi tiếp nhận lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleHuyLichHen = async () => {
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy hẹn');
      return;
    }
    try {
      setLoading(true);
      const res = await appointmentApi.huyLichHen(appointment.id, cancelReason.trim());
      if (res.data.success) {
        toast.success('Đã hủy lịch hẹn thành công');
        setShowCancelPrompt(false);
        setCancelReason('');
        onRefresh();
        onClose();
      } else {
        toast.error(res.data.message || 'Không thể hủy lịch hẹn');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi hủy lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DA_DEN':
        return <span className="status-badge green"><i className="fa-solid fa-check"></i> Đã tiếp nhận</span>;
      case 'DA_XAC_NHAN':
        return <span className="status-badge blue"><i className="fa-solid fa-calendar-check"></i> Đã xác nhận (Cọc)</span>;
      case 'CHO_XAC_NHAN':
        return <span className="status-badge orange"><i className="fa-solid fa-clock"></i> Chờ xác nhận</span>;
      case 'DA_HUY':
        return <span className="status-badge red"><i className="fa-solid fa-ban"></i> Đã hủy</span>;
      default:
        return <span className="status-badge gray">{status}</span>;
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog appointment-detail-dialog">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <i className="fa-solid fa-calendar-days text-primary"></i>
            <div>
              <h3>Chi tiết Lịch hẹn #{appointment.id}</h3>
              <span className="modal-subtitle">
                {appointment.ngayHen} • {appointment.khungGio}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {getStatusBadge(appointment.trangThai)}
            <button className="btn-close-modal" onClick={onClose} title="Đóng">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <div className="modal-body">
          {/* Card Thông tin Bệnh nhân */}
          <div className="detail-section">
            <h4 className="section-title">
              <i className="fa-solid fa-user"></i> Thông tin bệnh nhân
            </h4>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Họ và tên:</span>
                <span className="value strong">{appointment.tenBenhNhan}</span>
              </div>
              <div className="detail-item">
                <span className="label">Mã bệnh nhân:</span>
                <span className="value font-mono">BN-{appointment.maBenhNhan}</span>
              </div>
              <div className="detail-item">
                <span className="label">Số điện thoại:</span>
                <span className="value font-mono">{appointment.soDienThoai || '--'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Số CCCD / CMND:</span>
                <span className="value font-mono">{appointment.soCCCD || '--'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Giới tính / Tuổi:</span>
                <span className="value">
                  {appointment.gioiTinh === 'M' || appointment.gioiTinh === '1' ? 'Nam' : 'Nữ'} • {calculateAge(appointment.ngaySinh)} tuổi
                </span>
              </div>
              <div className="detail-item full-width">
                <span className="label">Địa chỉ:</span>
                <span className="value">{appointment.diaChi || 'Chưa cập nhật'}</span>
              </div>
            </div>
          </div>

          {/* Card Thông tin Lịch hẹn & Bác sĩ */}
          <div className="detail-section">
            <h4 className="section-title">
              <i className="fa-solid fa-stethoscope"></i> Thông tin khám & Bác sĩ
            </h4>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Bác sĩ phụ trách:</span>
                <span className="value strong text-primary">{appointment.tenBacSi || 'Bác sĩ phòng khám'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Chuyên khoa:</span>
                <span className="value">{appointment.tenKhoa || 'Đa khoa'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Cơ sở khám:</span>
                <span className="value">{appointment.tenCoSo || 'Cơ sở chính'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Khung giờ hẹn:</span>
                <span className="value font-mono text-emerald">
                  <i className="fa-regular fa-clock"></i> {appointment.khungGio} ({appointment.ngayHen})
                </span>
              </div>
              <div className="detail-item full-width">
                <span className="label">Lý do khám / Triệu chứng:</span>
                <span className="value reason-box">
                  {appointment.lyDo || 'Đăng ký khám sức khỏe theo hẹn'}
                </span>
              </div>
            </div>
          </div>

          {/* Card Đặt cọc & Trạng thái Hàng đợi */}
          <div className="detail-section">
            <h4 className="section-title">
              <i className="fa-solid fa-receipt"></i> Đặt cọc & Hàng đợi khám
            </h4>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Tiền giữ chỗ (Cọc):</span>
                <span className="value strong">
                  {(appointment.chiPhiGiuCho || 100000).toLocaleString('vi-VN')} ₫
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Thanh toán cọc:</span>
                <span className="value">
                  {appointment.daThanhToanGiuCho ? (
                    <span className="text-emerald font-semibold">
                      <i className="fa-solid fa-circle-check"></i> Đã thanh toán (Số PT: {appointment.soPhieuThu || '---'})
                    </span>
                  ) : (
                    <span className="text-amber font-semibold">
                      <i className="fa-solid fa-clock"></i> Chưa thu tiền
                    </span>
                  )}
                </span>
              </div>
              {appointment.maLuotKham && (
                <div className="detail-item">
                  <span className="label">Mã lượt khám phát sinh:</span>
                  <span className="value strong text-primary font-mono">
                    #{appointment.maLuotKham} (STT: {appointment.soThuTuHangDoi || '--'})
                  </span>
                </div>
              )}
              {appointment.ngayThanhToan && (
                <div className="detail-item">
                  <span className="label">Thời gian nộp cọc:</span>
                  <span className="value font-mono">{formatDateTime(appointment.ngayThanhToan)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Cảnh báo lý do hủy (nếu có) */}
          {appointment.trangThai === 'DA_HUY' && appointment.ghiChuHuy && (
            <div className="alert-box-danger">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <div>
                <strong>Lịch hẹn đã bị hủy:</strong> {appointment.ghiChuHuy}
              </div>
            </div>
          )}

          {/* Form nhập lý do hủy hẹn (nếu bấm nút Hủy) */}
          {showCancelPrompt && (
            <div className="cancel-prompt-box">
              <label>Lý do hủy lịch hẹn <span className="text-danger">*</span>:</label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Nhập lý do bác sĩ hoặc người bệnh yêu cầu hủy hẹn..."
                className="cancel-textarea"
              />
              <div className="cancel-prompt-actions">
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => setShowCancelPrompt(false)}
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={handleHuyLichHen}
                  disabled={loading}
                >
                  {loading ? 'Đang hủy...' : 'Xác nhận hủy lịch'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Đóng
          </button>

          {appointment.trangThai !== 'DA_HUY' && appointment.trangThai !== 'DA_DEN' && !showCancelPrompt && (
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={() => setShowCancelPrompt(true)}
            >
              <i className="fa-solid fa-ban"></i> Hủy lịch hẹn
            </button>
          )}

          {appointment.trangThai !== 'DA_HUY' && appointment.trangThai !== 'DA_DEN' && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleTiepNhan}
              disabled={loading}
            >
              <i className="fa-solid fa-user-check"></i>
              {loading ? 'Đang tiếp nhận...' : 'Tiếp nhận vào khám ngay'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal;
