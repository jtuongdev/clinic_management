import { useEffect, useState } from 'react';
import { App, Button, DatePicker, Form, Input, Modal, Select, Space, Table } from 'antd';
import { CalendarPlus, RefreshCw, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import { scheduleApi } from '../api/schedule.api';

const dateFormat = 'YYYY-MM-DD';

const apiError = (error) => error?.response?.data?.message || error?.response?.data?.detail || 'Thao tác lịch làm việc thất bại.';

export const ScheduleManagement = () => {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(dayjs().startOf('month'));
  const [toDate, setToDate] = useState(dayjs().endOf('month'));
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const response = await scheduleApi.get({ fromDate: fromDate.format(dateFormat), toDate: toDate.format(dateFormat) });
      setSchedules(response.data.data || []);
    } catch (error) {
      message.error(apiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const response = await scheduleApi.get({
          fromDate: fromDate.format(dateFormat),
          toDate: toDate.format(dateFormat),
        });
        if (active) setSchedules(response.data.data || []);
      } catch (error) {
        if (active) message.error(apiError(error));
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchSchedules();
    return () => { active = false; };
  }, [fromDate, toDate, message]);

  useEffect(() => {
    Promise.all([scheduleApi.getEmployees(), scheduleApi.getShifts()]).then(([employeeResponse, shiftResponse]) => {
      setEmployees(employeeResponse.data.data?.items || []);
      setShifts(shiftResponse.data.data || []);
    }).catch((error) => message.error(apiError(error)));
  }, [message]);

  const create = async (values) => {
    try {
      const payload = { ...values, ngayLam: values.ngayLam.format(dateFormat) };
      if (editing) {
        await scheduleApi.update(editing.id, { maCaTruc: payload.maCaTruc, ngayLam: payload.ngayLam, ghiChu: payload.ghiChu });
        message.success('Cập nhật lịch làm việc thành công.');
      } else {
        await scheduleApi.create(payload);
        message.success('Tạo lịch làm việc thành công.');
      }
      setCreateOpen(false);
      setEditing(null);
      form.resetFields();
      await load();
    } catch (error) {
      message.error(apiError(error));
    }
  };

  const openEdit = (schedule) => {
    setEditing(schedule);
    form.setFieldsValue({ maNhanVien: schedule.maNhanVien, maCaTruc: schedule.maCaTruc, ngayLam: dayjs(schedule.ngayLam), ghiChu: schedule.ghiChu });
    setCreateOpen(true);
  };

  const remove = (schedule) => {
    modal.confirm({
      title: 'Xóa lịch làm việc?',
      content: `${schedule.tenNhanVien} - ${schedule.tenCa}`,
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await scheduleApi.remove(schedule.id);
          message.success('Đã xóa lịch làm việc.');
          await load();
        } catch (error) {
          message.error(apiError(error));
        }
      },
    });
  };

  const columns = [
    { title: 'Ngày', dataIndex: 'ngayLam', render: (value) => dayjs(value).format('DD/MM/YYYY') },
    { title: 'Nhân viên', dataIndex: 'tenNhanVien' },
    { title: 'Ca', dataIndex: 'tenCa' },
    { title: 'Thời gian', render: (_, row) => `${row.thoiGianBatDau} - ${row.thoiGianKetThuc}` },
    { title: 'Số giờ', dataIndex: 'soGioLam' },
    { title: 'Ghi chú', dataIndex: 'ghiChu', render: (value) => value || '-' },
    { title: 'Thao tác', render: (_, row) => <Space><Button onClick={() => openEdit(row)}>Sửa</Button><Button danger icon={<Trash2 size={15} />} onClick={() => remove(row)}>Xóa</Button></Space> },
  ];

  return <div style={{ padding: 24, height: '100%', overflow: 'auto' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
      <div><h1 style={{ margin: 0 }}>Lịch làm việc</h1><span style={{ color: '#718096' }}>Theo dõi và phân công ca làm việc cho nhân viên</span></div>
      <Space><Button icon={<RefreshCw size={16} />} onClick={load}>Làm mới</Button><Button type="primary" icon={<CalendarPlus size={16} />} onClick={() => { setEditing(null); form.resetFields(); setCreateOpen(true); }}>Tạo lịch</Button></Space>
    </div>
    <Space style={{ marginBottom: 16 }}><DatePicker value={fromDate} format="DD/MM/YYYY" onChange={(value) => value && setFromDate(value)} /><span>đến</span><DatePicker value={toDate} format="DD/MM/YYYY" onChange={(value) => value && setToDate(value)} /></Space>
    <Table rowKey="id" loading={loading} columns={columns} dataSource={schedules} pagination={{ pageSize: 20 }} />
    <Modal title={editing ? 'Sửa lịch làm việc' : 'Tạo lịch làm việc'} open={createOpen} onCancel={() => { setCreateOpen(false); setEditing(null); }} onOk={() => form.submit()} okText="Lưu" cancelText="Hủy" destroyOnHidden>
      <Form form={form} layout="vertical" onFinish={create}>
        <Form.Item name="maNhanVien" label="Nhân viên" rules={[{ required: true }]}><Select disabled={!!editing} options={employees.map((employee) => ({ value: employee.id, label: `${employee.hoTen} (${employee.username})` }))} /></Form.Item>
        <Form.Item name="maCaTruc" label="Ca làm việc" rules={[{ required: true }]}><Select options={shifts.map((shift) => ({ value: shift.id, label: `${shift.tenCa} (${shift.thoiGianBatDau} - ${shift.thoiGianKetThuc})` }))} /></Form.Item>
        <Form.Item name="ngayLam" label="Ngày làm" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" /></Form.Item>
        <Form.Item name="ghiChu" label="Ghi chú"><Input.TextArea rows={3} maxLength={500} /></Form.Item>
      </Form>
    </Modal>
  </div>;
};
