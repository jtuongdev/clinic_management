import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Select,
  DatePicker,
  Input,
  Alert,
  Spin,
  App,
} from 'antd';
import dayjs from 'dayjs';
import { appointmentApi } from '../api/appointment.api';
import { patientApi } from '../../patient/api/patient.api';
import { employeeApi } from '../../employee/api/employee.api';
import { coSoApi } from '../../facility/api/facility.api';
import type { TimeSlotDto, CreateLichHenRequest } from '../types/appointment.types';

interface CreateAppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Dropdown data
  const [patients, setPatients] = useState<{ label: string; value: number }[]>([]);
  const [doctors, setDoctors] = useState<{ label: string; value: number }[]>([]);
  const [facilities, setFacilities] = useState<{ label: string; value: number }[]>([]);

  // Slot data
  const [slots, setSlots] = useState<TimeSlotDto[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotDto | null>(null);

  // Watch doctor & date changes to re-fetch slots
  const selectedDoctor = Form.useWatch('maBacSi', form);
  const selectedDate = Form.useWatch('ngayKham', form);

  // Load facilities & initial doctor list
  useEffect(() => {
    if (visible) {
      coSoApi.getDropdown().then((res) => {
        if (res.data.success && res.data.data) {
          setFacilities(
            res.data.data.map((c) => ({
              label: c.tenCoSo || c.maCoSo,
              value: c.id,
            }))
          );
          if (res.data.data.length > 0) {
            form.setFieldsValue({ maCoSo: res.data.data[0].id });
          }
        }
      });

      employeeApi.getPaged({ pageIndex: 1, pageSize: 100, isActive: true }).then((res) => {
        if (res.data.success && res.data.data) {
          const list = (res.data.data.items || []).map((emp) => ({
            label: `${emp.hoTen} (${emp.chucVu || 'Bác sĩ'})`,
            value: emp.id,
          }));
          setDoctors(list);
        }
      });

      // Default date = today
      form.setFieldsValue({
        ngayKham: dayjs(),
        nguonDat: 'LE_TAN',
      });
      setSelectedSlot(null);
    }
  }, [visible, form]);

  // Load slots when doctor or date changes
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      setLoadingSlots(true);
      setSelectedSlot(null);
      const formattedDate = dayjs(selectedDate).format('YYYY-MM-DD');
      appointmentApi
        .getSlots(selectedDoctor, formattedDate)
        .then((res) => {
          if (res.data.success && res.data.data) {
            setSlots(res.data.data);
          } else {
            setSlots([]);
          }
        })
        .catch(() => setSlots([]))
        .finally(() => setLoadingSlots(false));
    } else {
      setSlots([]);
      setSelectedSlot(null);
    }
  }, [selectedDoctor, selectedDate]);

  // Search patients
  const handleSearchPatient = (val: string) => {
    if (val.trim().length >= 2) {
      patientApi.search(val).then((res) => {
        if (res.data.success && res.data.data) {
          setPatients(
            res.data.data.map((p) => ({
              label: `${p.ho} ${p.ten} - ${p.dienThoai || p.soCCCD || `BN#${p.id}`}`,
              value: p.id,
            }))
          );
        }
      });
    }
  };

  const handleFinish = async (values: any) => {
    if (!selectedSlot) {
      message.error('Vui lòng chọn khung giờ khám.');
      return;
    }

    setLoading(true);
    try {
      const payload: CreateLichHenRequest = {
        maBenhNhan: values.maBenhNhan,
        maBacSi: values.maBacSi,
        maCoSo: values.maCoSo,
        thoiGianBatDau: selectedSlot.thoiGianBatDau,
        thoiGianKetThuc: selectedSlot.thoiGianKetThuc,
        lyDo: values.lyDo || 'Khám bệnh theo lịch hẹn',
        nguonDat: values.nguonDat || 'LE_TAN',
      };

      const res = await appointmentApi.create(payload);
      if (res.data.success) {
        message.success(
          res.data.message ||
            'Tạo lịch hẹn thành công. Vui lòng thu tiền cọc 100.000 VNĐ tại quầy!'
        );
        form.resetFields();
        setSelectedSlot(null);
        onSuccess();
        onClose();
      } else {
        message.error(res.data.message || 'Không thể tạo lịch hẹn');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Lỗi khi tạo lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      title="Đặt lịch hẹn khám bệnh mới"
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={680}
      okText="Xác nhận & Giữ chỗ (100k)"
      cancelText="Hủy"
      okButtonProps={{
        style: { background: '#0284c7', borderColor: '#0284c7', fontWeight: 600 },
      }}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        {/* Row 1: Bệnh nhân & Cơ sở */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item
            name="maBenhNhan"
            label="Bệnh nhân"
            rules={[{ required: true, message: 'Vui lòng chọn bệnh nhân' }]}
          >
            <Select
              showSearch
              placeholder="Nhập tên, SĐT, hoặc CCCD bệnh nhân..."
              filterOption={false}
              onSearch={handleSearchPatient}
              options={patients}
              notFoundContent="Gõ ít nhất 2 ký tự để tìm bệnh nhân"
            />
          </Form.Item>

          <Form.Item
            name="maCoSo"
            label="Cơ sở phòng khám"
            rules={[{ required: true, message: 'Vui lòng chọn cơ sở' }]}
          >
            <Select placeholder="Chọn cơ sở" options={facilities} />
          </Form.Item>
        </div>

        {/* Row 2: Bác sĩ & Ngày khám */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Form.Item
            name="maBacSi"
            label="Bác sĩ phụ trách"
            rules={[{ required: true, message: 'Vui lòng chọn bác sĩ' }]}
          >
            <Select
              showSearch
              placeholder="Chọn bác sĩ khám"
              options={doctors}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            name="ngayKham"
            label="Ngày hẹn khám"
            rules={[{ required: true, message: 'Vui lòng chọn ngày khám' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              disabledDate={(current) =>
                current && current < dayjs().startOf('day')
              }
            />
          </Form.Item>
        </div>

        {/* Slot selection grid */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
            Khung giờ hẹn (Slot 30 phút, tối đa 2 BN/slot):
          </label>
          <div style={{ marginTop: 6 }}>
            {loadingSlots ? (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <Spin tip="Đang kiểm tra lịch làm việc & slot trống..." />
              </div>
            ) : slots.length === 0 ? (
              <div
                style={{
                  padding: 16,
                  textAlign: 'center',
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: 6,
                  color: '#64748b',
                  fontSize: 12,
                }}
              >
                {selectedDoctor
                  ? 'Không tìm thấy slot khám khả dụng cho ngày này.'
                  : 'Vui lòng chọn Bác sĩ và Ngày khám để xem danh sách slot.'}
              </div>
            ) : (
              <div className="slot-grid">
                {slots.map((slot, index) => {
                  const isSelected =
                    selectedSlot?.thoiGianBatDau === slot.thoiGianBatDau;
                  const isFull = !slot.conTrong;
                  return (
                    <div
                      key={index}
                      className={`slot-item ${
                        isSelected ? 'slot-selected' : ''
                      } ${isFull ? 'slot-full' : ''}`}
                      onClick={() => {
                        if (!isFull) setSelectedSlot(slot);
                      }}
                    >
                      <span className="slot-time">{slot.label}</span>
                      <span className="slot-capacity">
                        {isFull
                          ? 'Đã đầy'
                          : `Còn ${slot.soLuongToiDa - slot.soLuongDaDat} chỗ (${slot.soLuongDaDat}/${slot.soLuongToiDa})`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Financial Section: Fixed 100k Cash Only */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>
                Phí giữ chỗ đặt lịch (Cố định):
              </label>
              <Input
                value="100.000 VNĐ"
                disabled
                style={{
                  marginTop: 4,
                  fontWeight: 700,
                  color: '#0284c7',
                  background: '#ffffff',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>
                Hình thức thanh toán:
              </label>
              <Input
                value="100% TIỀN MẶT TẠI QUẦY"
                disabled
                style={{
                  marginTop: 4,
                  fontWeight: 600,
                  color: '#0369a1',
                  background: '#ffffff',
                }}
              />
            </div>
          </div>

          <Alert
            style={{ marginTop: 10 }}
            message="Chính sách tài chính giữ chỗ:"
            description={
              <span style={{ fontSize: 11.5 }}>
                Khoản phí 100.000 VNĐ là phí đảm bảo giữ slot khám, <strong>tuyệt đối KHÔNG HOÀN LẠI</strong> nếu hủy lịch hoặc không đến (no-show). Toàn bộ 100.000 VNĐ này sẽ được hệ thống <strong>khấu trừ trực tiếp</strong> vào tiền khám khi bệnh nhân có mặt tại quầy tiếp đón.
              </span>
            }
            type="warning"
            showIcon
          />
        </div>

        {/* Reason / Notes */}
        <Form.Item name="lyDo" label="Lý do khám / Triệu chứng">
          <Input.TextArea
            rows={2}
            placeholder="Ví dụ: Đau họng, sốt nhẹ 2 ngày nay..."
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default CreateAppointmentModal;
