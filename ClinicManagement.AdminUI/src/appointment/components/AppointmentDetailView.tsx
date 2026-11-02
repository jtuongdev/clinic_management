import React, { useState } from 'react';
import { Button, Tag, Space, App, Modal, Input, Alert } from 'antd';
import {
  DollarOutlined,
  CheckCircleOutlined,
  PrinterOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  IdcardOutlined,
  PhoneOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import type { LichHenDto } from '../types/appointment.types';
import { appointmentApi } from '../api/appointment.api';
import AppointmentReceiptModal from './AppointmentReceiptModal';

interface AppointmentDetailViewProps {
  appointment: LichHenDto | null;
  onRefresh: () => void;
}

export const AppointmentDetailView: React.FC<AppointmentDetailViewProps> = ({
  appointment,
  onRefresh,
}) => {
  const { message, modal } = App.useApp();
  const [loadingAction, setLoadingAction] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  if (!appointment) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#94a3b8',
          fontSize: 14,
        }}
      >
        <ClockCircleOutlined style={{ fontSize: 48, marginBottom: 12, color: '#cbd5e1' }} />
        <span>Vui lòng chọn một lịch hẹn từ danh sách bên trái để xem chi tiết.</span>
      </div>
    );
  }

  // Thu tiền mặt 100.000 VNĐ tại quầy
  const handleThuTienMat = () => {
    modal.confirm({
      title: 'Xác nhận thu tiền giữ chỗ tại quầy',
      content: (
        <div>
          <p>
            Xác nhận đã nhận <strong>100.000 VNĐ TIỀN MẶT</strong> từ bệnh nhân{' '}
            <strong>{appointment.tenBenhNhan}</strong>?
          </p>
          <p style={{ color: '#0369a1', fontSize: 12 }}>
            Sau khi xác nhận, hệ thống sẽ chuyển trạng thái lịch hẹn thành <strong>Đã giữ chỗ</strong>{' '}
            và phát sinh phiếu thu tiền mặt.
          </p>
        </div>
      ),
      okText: 'Xác nhận thu 100k',
      cancelText: 'Hủy',
      okButtonProps: { style: { background: '#0284c7', borderColor: '#0284c7' } },
      onOk: async () => {
        setLoadingAction(true);
        try {
          const res = await appointmentApi.thuTienMat(appointment.id);
          if (res.data.success) {
            message.success(res.data.message || 'Thu tiền thành công!');
            onRefresh();
            setShowReceipt(true);
          } else {
            message.error(res.data.message || 'Không thể xác nhận thu tiền');
          }
        } catch (err: any) {
          message.error(err.response?.data?.message || 'Lỗi khi thu tiền');
        } finally {
          setLoadingAction(false);
        }
      },
    });
  };

  // Tiếp nhận vào khám (Fast-track Queueing)
  const handleTiepNhan = () => {
    modal.confirm({
      title: 'Tiếp đón bệnh nhân vào khám (Fast-track Queue)',
      content: (
        <div>
          <p>
            Bệnh nhân <strong>{appointment.tenBenhNhan}</strong> đã có mặt tại quầy tiếp đón.
          </p>
          <ul style={{ fontSize: 12, color: '#475569', paddingLeft: 18 }}>
            <li>
              Hệ thống sẽ <strong>ưu tiên xếp vào STT #2</strong> của hàng đợi phòng khám (không cướp lượt bệnh nhân đang chuẩn bị vào).
            </li>
            <li>
              Tự động khởi tạo lượt khám và <strong>khấu trừ 100.000 VNĐ tiền cọc</strong> vào hóa đơn khám.
            </li>
            <li>
              Bệnh nhân được hướng dẫn đi thẳng vào phòng khám của <strong>{appointment.tenBacSi}</strong> mà không cần đóng thêm tiền khám ban đầu.
            </li>
          </ul>
        </div>
      ),
      okText: 'Tiếp nhận ngay',
      cancelText: 'Đóng',
      okButtonProps: { style: { background: '#16a34a', borderColor: '#16a34a' } },
      onOk: async () => {
        setLoadingAction(true);
        try {
          const res = await appointmentApi.tiepNhan(appointment.id);
          if (res.data.success) {
            message.success(res.data.message || 'Tiếp nhận thành công!');
            onRefresh();
          } else {
            message.error(res.data.message || 'Không thể tiếp nhận');
          }
        } catch (err: any) {
          message.error(err.response?.data?.message || 'Lỗi khi tiếp nhận');
        } finally {
          setLoadingAction(false);
        }
      },
    });
  };

  // Hủy lịch hẹn (Cọc không hoàn lại)
  const handleHuyLich = () => {
    let lyDo = '';
    Modal.confirm({
      title: 'Hủy lịch hẹn khám bệnh',
      content: (
        <div>
          <Alert
            style={{ marginBottom: 12 }}
            type="error"
            message="Chính sách tài chính:"
            description="Khoản phí 100.000 VNĐ giữ chỗ KHÔNG ĐƯỢC HOÀN LẠI trong mọi trường hợp hủy lịch theo quy định của phòng khám."
            showIcon
          />
          <Input.TextArea
            placeholder="Nhập lý do hủy (BN báo bận, no-show, v.v.)..."
            onChange={(e) => {
              lyDo = e.target.value;
            }}
            rows={2}
          />
        </div>
      ),
      okText: 'Xác nhận Hủy lịch',
      okType: 'danger',
      cancelText: 'Quay lại',
      onOk: async () => {
        setLoadingAction(true);
        try {
          const res = await appointmentApi.huyLich(appointment.id, lyDo);
          if (res.data.success) {
            message.success(res.data.message || 'Đã hủy lịch hẹn');
            onRefresh();
          } else {
            message.error(res.data.message || 'Không thể hủy lịch hẹn');
          }
        } catch (err: any) {
          message.error(err.response?.data?.message || 'Lỗi khi hủy');
        } finally {
          setLoadingAction(false);
        }
      },
    });
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'CHO_XAC_NHAN':
        return <Tag color="warning">Chờ thu tiền cọc</Tag>;
      case 'DA_XAC_NHAN':
        return <Tag color="processing">Đã giữ chỗ (100k)</Tag>;
      case 'DA_DEN':
        return <Tag color="cyan">Đã tiếp đón (Vào khám)</Tag>;
      case 'DANG_KHAM':
        return <Tag color="purple">Đang khám</Tag>;
      case 'HOAN_THANH':
        return <Tag color="success">Đã hoàn thành</Tag>;
      case 'DA_HUY':
        return <Tag color="error">Đã hủy (Không hoàn cọc)</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const isChoXacNhan = appointment.trangThai === 'CHO_XAC_NHAN';
  const isDaXacNhan = appointment.trangThai === 'DA_XAC_NHAN';
  const isDaHuy = appointment.trangThai === 'DA_HUY';
  const isCompletedOrExamining =
    appointment.trangThai === 'DA_DEN' ||
    appointment.trangThai === 'DANG_KHAM' ||
    appointment.trangThai === 'HOAN_THANH';

  return (
    <>
      <div className="appointment-detail-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
            Chi tiết Lịch hẹn #{appointment.id}
          </div>
          {getStatusTag(appointment.trangThai)}
        </div>

        {/* Action Buttons */}
        <Space>
          {isChoXacNhan && (
            <Button
              type="primary"
              icon={<DollarOutlined />}
              onClick={handleThuTienMat}
              loading={loadingAction}
              style={{ background: '#0284c7', borderColor: '#0284c7', fontWeight: 600 }}
            >
              Thu 100k tiền mặt
            </Button>
          )}

          {isDaXacNhan && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleTiepNhan}
              loading={loadingAction}
              style={{ background: '#16a34a', borderColor: '#16a34a', fontWeight: 600 }}
            >
              Tiếp nhận vào khám (Fast-track)
            </Button>
          )}

          {appointment.daThanhToanGiuCho && (
            <Button
              icon={<PrinterOutlined />}
              onClick={() => setShowReceipt(true)}
              style={{ fontWeight: 500 }}
            >
              In biên lai (100k)
            </Button>
          )}

          {!isDaHuy && !isCompletedOrExamining && (
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={handleHuyLich}
              loading={loadingAction}
            >
              Hủy lịch
            </Button>
          )}
        </Space>
      </div>

      <div className="appointment-detail-body">
        {/* Fast-track Banner if accepted */}
        {appointment.soThuTuHangDoi && (
          <Alert
            type="success"
            showIcon
            message={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  <strong>ĐÃ TIẾP ĐÓN THÀNH CÔNG:</strong> Bệnh nhân được xếp ưu tiên tại{' '}
                  <strong>STT #{appointment.soThuTuHangDoi}</strong> trong hàng đợi phòng khám.
                </span>
                {appointment.maLuotKham && (
                  <Tag color="green" style={{ fontSize: 12 }}>
                    Lượt khám #{appointment.maLuotKham}
                  </Tag>
                )}
              </div>
            }
            description="Phí 100.000 VNĐ tiền mặt đã được khấu trừ tự động vào hóa đơn khám bệnh."
          />
        )}

        {/* Section 1: Thông tin bệnh nhân */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <UserOutlined style={{ color: '#0284c7' }} /> THÔNG TIN BỆNH NHÂN
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px 16px',
              fontSize: 12.5,
            }}
          >
            <div>
              <div style={{ color: '#64748b' }}>Họ và tên:</div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 13.5, marginTop: 2 }}>
                {appointment.tenBenhNhan}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b' }}>Giới tính / Ngày sinh:</div>
              <div style={{ fontWeight: 500, color: '#1e293b', marginTop: 2 }}>
                {appointment.gioiTinh === 'F' || appointment.gioiTinh === 'Nữ' ? 'Nữ' : 'Nam'}{' '}
                {appointment.ngaySinh
                  ? `(${new Date(appointment.ngaySinh).toLocaleDateString('vi-VN')})`
                  : ''}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b' }}>Số điện thoại:</div>
              <div
                style={{
                  fontWeight: 600,
                  color: '#0f172a',
                  fontFamily: 'monospace',
                  marginTop: 2,
                }}
              >
                <PhoneOutlined style={{ marginRight: 4, color: '#0284c7' }} />
                {appointment.soDienThoai || '---'}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b' }}>CCCD / Định danh:</div>
              <div
                style={{
                  fontWeight: 500,
                  color: '#1e293b',
                  fontFamily: 'monospace',
                  marginTop: 2,
                }}
              >
                <IdcardOutlined style={{ marginRight: 4, color: '#64748b' }} />
                {appointment.soCCCD || '---'}
              </div>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ color: '#64748b' }}>Địa chỉ thường trú:</div>
              <div style={{ fontWeight: 500, color: '#1e293b', marginTop: 2 }}>
                <HomeOutlined style={{ marginRight: 4, color: '#64748b' }} />
                {appointment.diaChi || 'Chưa cập nhật'}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Thông tin lịch khám & Bác sĩ */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <ClockCircleOutlined style={{ color: '#0284c7' }} /> THÔNG TIN KHÁM BỆNH & KHUNG GIỜ
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px 16px',
              fontSize: 12.5,
            }}
          >
            <div>
              <div style={{ color: '#64748b' }}>Bác sĩ khám:</div>
              <div style={{ fontWeight: 600, color: '#0369a1', marginTop: 2 }}>
                {appointment.tenBacSi}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b' }}>Khoa / Chuyên khoa:</div>
              <div style={{ fontWeight: 500, color: '#1e293b', marginTop: 2 }}>
                {appointment.tenKhoa || 'Đa khoa'}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b' }}>Cơ sở phòng khám:</div>
              <div style={{ fontWeight: 500, color: '#1e293b', marginTop: 2 }}>
                {appointment.tenCoSo}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b' }}>Ngày hẹn khám:</div>
              <div style={{ fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                {appointment.ngayHen}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b' }}>Khung giờ (Slot 30p):</div>
              <div
                style={{
                  fontWeight: 700,
                  color: '#0284c7',
                  fontSize: 13.5,
                  marginTop: 2,
                }}
              >
                {appointment.khungGio}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b' }}>Nguồn đặt:</div>
              <div style={{ fontWeight: 500, color: '#1e293b', marginTop: 2 }}>
                <Tag>{appointment.nguonDat}</Tag>
              </div>
            </div>
            <div style={{ gridColumn: 'span 3' }}>
              <div style={{ color: '#64748b' }}>Lý do khám / Triệu chứng:</div>
              <div
                style={{
                  fontWeight: 500,
                  color: '#334155',
                  marginTop: 4,
                  background: '#f8fafc',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                }}
              >
                {appointment.lyDo || 'Không có ghi chú'}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Quản lý Tài chính giữ chỗ 100k */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <DollarOutlined style={{ color: '#0284c7' }} /> TÀI CHÍNH GIỮ CHỖ (100k TIỀN MẶT - KHÔNG HOÀN LẠI)
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px 16px',
              fontSize: 12.5,
            }}
          >
            <div>
              <div style={{ color: '#64748b' }}>Phí giữ chỗ:</div>
              <div style={{ fontWeight: 700, color: '#0284c7', fontSize: 14, marginTop: 2 }}>
                {(appointment.chiPhiGiuCho || 100000).toLocaleString('vi-VN')} VNĐ
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b' }}>Tình trạng thanh toán:</div>
              <div style={{ marginTop: 2 }}>
                {appointment.daThanhToanGiuCho ? (
                  <Tag color="success">Đã thu tiền mặt 100k</Tag>
                ) : (
                  <Tag color="warning">Chưa thu tiền</Tag>
                )}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b' }}>Số phiếu thu:</div>
              <div
                style={{
                  fontWeight: 600,
                  color: '#0f172a',
                  fontFamily: 'monospace',
                  marginTop: 2,
                }}
              >
                {appointment.soPhieuThu || '---'}
              </div>
            </div>
            {appointment.daThanhToanGiuCho && (
              <>
                <div>
                  <div style={{ color: '#64748b' }}>Thời gian thu tiền:</div>
                  <div style={{ fontWeight: 500, color: '#1e293b', marginTop: 2 }}>
                    {appointment.ngayThanhToan
                      ? new Date(appointment.ngayThanhToan).toLocaleString('vi-VN')
                      : '---'}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#64748b' }}>Thu ngân tiếp nhận:</div>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginTop: 2 }}>
                    {appointment.tenNguoiThuTien || `Nhân viên #${appointment.nguoiThuTien}`}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#64748b' }}>Hình thức thanh toán:</div>
                  <div style={{ fontWeight: 600, color: '#0369a1', marginTop: 2 }}>
                    100% TIỀN MẶT TẠI QUẦY
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Cancellation Notice if Cancelled */}
          {appointment.ghiChuHuy && (
            <Alert
              style={{ marginTop: 14 }}
              type="error"
              message="Lịch hẹn đã bị hủy"
              description={
                <div>
                  <p>Lý do: {appointment.ghiChuHuy}</p>
                  <p style={{ fontWeight: 600, margin: 0 }}>
                    Theo chính sách tài chính, phí 100.000 VNĐ đã thu được hạch toán vào doanh thu không hoàn lại của phòng khám. Tuyệt đối không sinh phiếu chi hoàn tiền.
                  </p>
                </div>
              }
              showIcon
            />
          )}
        </div>
      </div>

      {/* Printable Receipt Modal */}
      <AppointmentReceiptModal
        visible={showReceipt}
        appointment={appointment}
        onClose={() => setShowReceipt(false)}
      />
    </>
  );
};
export default AppointmentDetailView;
