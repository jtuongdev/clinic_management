import { useEffect, useState } from 'react';
import { App, Button, DatePicker, Form, Modal, Select, Space, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { payrollApi } from './payroll.api';

const statusLabels = {
  NHAP: 'Nháp',
  DA_DUYET: 'Đã duyệt',
  DA_CHOT: 'Đã chốt',
  DA_THANH_TOAN: 'Đã thanh toán',
};
const statusColors = { NHAP: 'default', DA_DUYET: 'blue', DA_CHOT: 'orange', DA_THANH_TOAN: 'green' };
const money = (value) => `${Number(value || 0).toLocaleString('vi-VN')} đ`;

export const PayrollManagement = () => {
  const { message } = App.useApp();
  const [periods, setPeriods] = useState([]);
  const [attendancePeriods, setAttendancePeriods] = useState([]);
  const [detail, setDetail] = useState(null);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const selectedAttendancePeriod = Form.useWatch('maKyChamCong', form);
  const selectedPeriod = attendancePeriods.find((period) => period.id === selectedAttendancePeriod);

  const load = async () => {
    try {
      const response = await payrollApi.getPeriods();
      setPeriods(response.data.data || []);
    } catch (error) { message.error(error?.response?.data?.message || 'Không thể tải kỳ lương.'); }
  };
  useEffect(() => {
    let active = true;
    Promise.all([payrollApi.getPeriods(), payrollApi.getAttendancePeriods()]).then(([periodResponse, attendanceResponse]) => {
      if (!active) return;
      setPeriods(periodResponse.data.data || []);
      setAttendancePeriods((attendanceResponse.data.data || []).filter((period) => period.daKhoa));
    }).catch((error) => {
      if (active) message.error(error?.response?.data?.message || 'Không thể tải kỳ lương.');
    });
    return () => { active = false; };
  }, [message]);
  const action = async (name, id, success) => {
    try { await payrollApi[name](id); message.success(success); await load(); if (detail?.id === id) setDetail((await payrollApi.getDetail(id)).data.data); }
    catch (error) { message.error(error?.response?.data?.message || 'Thao tác kỳ lương thất bại.'); }
  };
  const exportPayroll = () => {
    if (!detail?.bangLuongs?.length) return;
    const header = ['Nhân viên', 'Ngày công', 'Nghỉ không lương', 'Lương cơ bản', 'Phụ cấp', 'Khấu trừ', 'Thực lĩnh'];
    const lines = detail.bangLuongs.map((row) => [row.tenNhanVien, row.soNgayCong, row.soNgayNghiKhongLuong, row.luongCoBan, row.tongPhuCap, row.tongKhauTru, row.thucLinh]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','));
    const blob = new Blob([`\uFEFF${[header.join(','), ...lines].join('\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bang-luong-${detail.thang}-${detail.nam}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const columns = [
    { title: 'Kỳ', render: (_, row) => `${row.thang}/${row.nam}` },
    { title: 'Thời gian', render: (_, row) => `${dayjs(row.tuNgay).format('DD/MM/YYYY')} - ${dayjs(row.denNgay).format('DD/MM/YYYY')}` },
    { title: 'Số bảng lương', dataIndex: 'soBangLuong' },
    { title: 'Trạng thái', dataIndex: 'trangThai', render: (value) => <Tag color={statusColors[value] || 'default'}>{statusLabels[value] || value}</Tag> },
    { title: 'Thao tác', render: (_, row) => <Space wrap>
      <Button size="small" onClick={async () => setDetail((await payrollApi.getDetail(row.id)).data.data)}>Chi tiết</Button>
      {row.trangThai === 'NHAP' && <Button size="small" onClick={() => action('generate', row.id, 'Đã tạo bảng lương từ chấm công.')}>Tính lương</Button>}
      {row.trangThai === 'NHAP' && row.soBangLuong > 0 && <Button size="small" onClick={() => action('approve', row.id, 'Đã duyệt kỳ lương.')}>Duyệt</Button>}
      {row.trangThai === 'DA_DUYET' && <Button size="small" onClick={() => action('close', row.id, 'Đã chốt kỳ lương.')}>Chốt</Button>}
      {row.trangThai === 'DA_CHOT' && <Button size="small" type="primary" onClick={() => action('pay', row.id, 'Đã ghi nhận thanh toán.')}>Thanh toán</Button>}
    </Space> },
  ];
  return (
    <div className="payroll-management">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <strong style={{ fontSize: 16, color: '#0b2a3c', display: 'block' }}>Quản lý tính lương nhân viên</strong>
          <span style={{ fontSize: 13, color: '#6a7f96' }}>Tính lương tự động từ kỳ chấm công đã chốt và khóa</span>
        </div>
        <Button
          type="primary"
          onClick={() => { form.resetFields(); setOpen(true); }}
          style={{ background: '#0b4f6c', borderColor: '#0b4f6c', borderRadius: 8 }}
        >
          + Tạo kỳ tính lương
        </Button>
      </div>
      <Table
        rowKey="id"
        dataSource={periods}
        columns={columns}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'Chưa có kỳ lương.' }}
        style={{ border: '1px solid #e9edf4', borderRadius: 10, overflow: 'hidden' }}
      />
    <Modal title="Tạo kỳ tính lương" open={open} onCancel={() => setOpen(false)} footer={null}>
      <Form form={form} layout="vertical" onFinish={async (values) => {
        try {
          await payrollApi.createPeriod({ thang: values.month.month() + 1, nam: values.month.year(), tuNgay: values.range[0].format('YYYY-MM-DD'), denNgay: values.range[1].format('YYYY-MM-DD'), maKyChamCong: values.maKyChamCong });
          message.success('Đã tạo kỳ lương.'); setOpen(false); await load();
        } catch (error) { message.error(error?.response?.data?.message || 'Không thể tạo kỳ lương.'); }
      }}>
        <Form.Item name="month" label="Tháng" rules={[{ required: true }]}><DatePicker picker="month" style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="range" label="Khoảng tính lương" rules={[{ required: true }]}><DatePicker.RangePicker style={{ width: '100%' }} /></Form.Item>
        <Form.Item name="maKyChamCong" label="Kỳ chấm công đã khóa" rules={[{ required: true, message: 'Chọn kỳ chấm công đã khóa.' }]}>
          <Select
            placeholder="Chọn kỳ chấm công"
            onChange={(value) => {
              const period = attendancePeriods.find((item) => item.id === value);
              if (period) {
                form.setFieldsValue({
                  range: [dayjs(period.tuNgay), dayjs(period.denNgay)],
                  month: dayjs(period.tuNgay),
                });
              }
            }}
            options={attendancePeriods.map((period) => ({
              value: period.id,
              label: `${dayjs(period.tuNgay).format('DD/MM/YYYY')} - ${dayjs(period.denNgay).format('DD/MM/YYYY')}`,
            }))}
            notFoundContent="Chưa có kỳ chấm công đã khóa"
          />
        </Form.Item>
        {selectedPeriod && <div style={{ marginBottom: 16, padding: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6 }}>
          <div><strong>Kỳ chấm công đã khóa</strong></div>
          <div>Khoảng công: {dayjs(selectedPeriod.tuNgay).format('DD/MM/YYYY')} - {dayjs(selectedPeriod.denNgay).format('DD/MM/YYYY')}</div>
          <div>Số nhân viên: {selectedPeriod.soNhanVien ?? 0}</div>
          <div>Trạng thái: <Tag color="green">Sẵn sàng tính lương</Tag></div>
        </div>}
        <Button type="primary" htmlType="submit" block>Tạo kỳ tính lương</Button>
      </Form>
    </Modal>
    <Modal title={`Chi tiết kỳ lương ${detail ? `${detail.thang}/${detail.nam}` : ''}`} open={!!detail} onCancel={() => setDetail(null)} footer={null} width={1000}>
      <Space style={{ marginBottom: 12 }}>
        <Button onClick={exportPayroll}>Xuất CSV</Button>
        <Button onClick={() => window.print()}>In bảng lương</Button>
        <Tag color="blue">Tổng thực lĩnh: {money((detail?.bangLuongs || []).reduce((total, row) => total + Number(row.thucLinh || 0), 0))}</Tag>
      </Space>
      <Table rowKey="id" dataSource={detail?.bangLuongs || []} pagination={{ pageSize: 10 }} columns={[
        { title: 'Nhân viên', dataIndex: 'tenNhanVien' },
        { title: 'Ngày công', dataIndex: 'soNgayCong' },
        { title: 'Nghỉ không lương', dataIndex: 'soNgayNghiKhongLuong' },
        { title: 'Lương cơ bản', dataIndex: 'luongCoBan', render: money },
        { title: 'Lương theo công', dataIndex: 'luongTheoNgayCong', render: money },
        { title: 'Tăng ca', dataIndex: 'tienTangCa', render: money },
        { title: 'Phụ cấp', dataIndex: 'tongPhuCap', render: money },
        { title: 'Bảo hiểm', dataIndex: 'tienBaoHiem', render: money },
        { title: 'Khấu trừ nghỉ/đi muộn', render: (_, row) => money(Number(row.khauTruNghiKhongLuong || 0) + Number(row.khauTruDiMuonVeSom || 0)) },
        { title: 'Khấu trừ', dataIndex: 'tongKhauTru', render: money },
        { title: 'Thực lĩnh', dataIndex: 'thucLinh', render: money },
      ]} />
      </Modal>
    </div>
  );
};
