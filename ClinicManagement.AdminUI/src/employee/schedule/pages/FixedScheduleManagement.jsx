import { useState } from 'react';
import { Button, Form, Input, Modal, Select, Space, Table, Tag } from 'antd';
import { CalendarDays, Plus } from 'lucide-react';
import dayjs from 'dayjs';

const dateFormat = 'YYYY-MM-DD';
const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

export const FixedScheduleManagement = ({
  employees, shifts, phongKhams, roomsLoading, selectedKhoa, fixedSchedules, fixedLoading,
  createFixed, bulkCreateFixed, updateFixed, removeFixed, generateSchedules, previewGenerate,
}) => {
  const [fixedModalOpen, setFixedModalOpen] = useState(false);
  const [editingFixed, setEditingFixed] = useState(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generatePreview, setGeneratePreview] = useState(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [fixedForm] = Form.useForm();
  const [bulkForm] = Form.useForm();
  const [generateForm] = Form.useForm();
  const dayOptions = dayNames.map((label, index) => ({ label, value: index === 6 ? 0 : index + 1 }));

  const openFixedModal = (item = null) => {
    setEditingFixed(item);
    fixedForm.setFieldsValue(item || {
      maNhanVien: undefined, maCaTruc: undefined, maPhongKham: undefined,
      thuTrongTuan: 1, tuNgay: dayjs().format(dateFormat), denNgay: undefined, ghiChu: '',
    });
    setFixedModalOpen(true);
  };

  const submitFixed = async (values) => {
    const payload = { ...values, maKhoa: selectedKhoa };
    if (editingFixed) await updateFixed(editingFixed.id, payload);
    else await createFixed(payload);
    setFixedModalOpen(false);
  };
  const submitBulk = async (values) => {
    const payloads = values.maNhanVien.flatMap((maNhanVien) => values.thuTrongTuan.flatMap((thuTrongTuan) => values.maCaTruc.map((maCaTruc) => ({
      maNhanVien,
      maKhoa: selectedKhoa,
      maCaTruc,
      maPhongKham: values.maPhongKham,
      thuTrongTuan,
      tuNgay: values.tuNgay,
      denNgay: values.denNgay,
      ghiChu: values.ghiChu || '',
    }))));
    await bulkCreateFixed(payloads);
    setBulkOpen(false);
    bulkForm.resetFields();
  };

  const getDayName = (value) => value === 0 ? 'Chủ nhật' : dayNames[value - 1];
  const fixedColumns = [
    { title: 'Nhân viên', dataIndex: 'tenNhanVien' },
    { title: 'Thứ', dataIndex: 'thuTrongTuan', render: (value) => getDayName(value) || value },
    { title: 'Ca', dataIndex: 'tenCa' },
    { title: 'Phòng', dataIndex: 'tenPhongKham', render: (value) => value || '-' },
    { title: 'Hiệu lực', render: (_, row) => `${dayjs(row.tuNgay).format('DD/MM/YYYY')} - ${row.denNgay ? dayjs(row.denNgay).format('DD/MM/YYYY') : 'Không giới hạn'}` },
    { title: 'Thao tác', render: (_, row) => <Space><Button size="small" onClick={() => openFixedModal(row)}>Sửa</Button><Button size="small" danger onClick={() => removeFixed(row.id)}>Xóa</Button></Space> },
  ];

  return (
    <div className="fixed-schedule-container">
      <div className="fixed-schedule-header">
        <div className="fixed-schedule-title">
          <strong style={{ fontSize: 15, color: '#0b2a3c' }}>Lịch làm việc cố định</strong>
          <span style={{ fontSize: 13, color: '#6a7f96', marginLeft: 8 }}>Lịch lặp theo thứ, ca và phòng khám</span>
        </div>
        <div className="fixed-schedule-actions">
          <Button icon={<CalendarDays size={16} />} onClick={() => setGenerateOpen(true)} disabled={!fixedSchedules.length} style={{ borderRadius: 8 }}>
            Sinh lịch ngày
          </Button>
          <Button type="primary" icon={<Plus size={16} />} onClick={() => openFixedModal()} disabled={!selectedKhoa} style={{ background: '#0b4f6c', borderColor: '#0b4f6c', borderRadius: 8 }}>
            Thêm lịch cố định
          </Button>
          <Button icon={<Plus size={16} />} onClick={() => setBulkOpen(true)} disabled={!selectedKhoa} style={{ borderRadius: 8 }}>
            Thêm nhiều lịch
          </Button>
        </div>
      </div>
      <Table
        className="fixed-schedule-table"
        rowKey="id"
        loading={fixedLoading}
        dataSource={fixedSchedules}
        columns={fixedColumns}
        pagination={false}
        locale={{ emptyText: 'Chưa có lịch cố định.' }}
        style={{ border: '1px solid #e9edf4', borderRadius: 10, overflow: 'hidden' }}
      />
      <Modal
        className="fixed-schedule-modal"
        title={editingFixed ? 'Sửa lịch cố định' : 'Thêm lịch cố định'}
        open={fixedModalOpen}
        onCancel={() => setFixedModalOpen(false)}
        footer={null}
      >
        <Form form={fixedForm} layout="vertical" onFinish={submitFixed}>
          <Form.Item name="maNhanVien" label="Nhân viên" rules={[{ required: true, message: 'Chọn nhân viên.' }]}>
            <Select options={employees.map((item) => ({ value: item.id, label: `${item.hoTen} (@${item.username})` }))} />
          </Form.Item>
          <Form.Item name="thuTrongTuan" label="Thứ trong tuần" rules={[{ required: true }]}>
            <Select options={dayOptions} />
          </Form.Item>
          <Form.Item name="maCaTruc" label="Ca trực" rules={[{ required: true }]}>
            <Select options={shifts.map((item) => ({ value: item.id, label: `${item.tenCa} (${item.thoiGianBatDau} - ${item.thoiGianKetThuc})` }))} />
          </Form.Item>
          <Form.Item name="maPhongKham" label="Phòng khám">
            <Select allowClear loading={roomsLoading} options={phongKhams.map((room) => ({ value: room.id, label: `${room.ma} - ${room.ten}` }))} />
          </Form.Item>
          <Space.Compact block>
            <Form.Item name="tuNgay" label="Từ ngày" rules={[{ required: true }]} style={{ width: '50%' }}>
              <Input type="date" />
            </Form.Item>
            <Form.Item name="denNgay" label="Đến ngày" style={{ width: '50%' }}>
              <Input type="date" />
            </Form.Item>
          </Space.Compact>
          <Form.Item name="ghiChu" label="Ghi chú">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>Lưu lịch cố định</Button>
        </Form>
      </Modal>
      <Modal
        title="Thêm nhiều lịch cố định"
        open={bulkOpen}
        onCancel={() => setBulkOpen(false)}
        footer={null}
      >
        <Form form={bulkForm} layout="vertical" onFinish={submitBulk}>
          <Form.Item name="maNhanVien" label="Nhân viên" rules={[{ required: true, message: 'Chọn ít nhất một nhân viên.' }]}>
            <Select mode="multiple" options={employees.map((item) => ({ value: item.id, label: `${item.hoTen} (@${item.username})` }))} />
          </Form.Item>
          <Form.Item name="thuTrongTuan" label="Các thứ áp dụng" rules={[{ required: true, message: 'Chọn ít nhất một thứ.' }]}>
            <Select mode="multiple" options={dayOptions} />
          </Form.Item>
          <Form.Item name="maCaTruc" label="Các ca trực" rules={[{ required: true, message: 'Chọn ít nhất một ca.' }]}>
            <Select mode="multiple" options={shifts.map((item) => ({ value: item.id, label: `${item.tenCa} (${item.thoiGianBatDau} - ${item.thoiGianKetThuc})` }))} />
          </Form.Item>
          <Form.Item name="maPhongKham" label="Phòng khám">
            <Select allowClear loading={roomsLoading} options={phongKhams.map((room) => ({ value: room.id, label: `${room.ma} - ${room.ten}` }))} />
          </Form.Item>
          <Space.Compact block>
            <Form.Item name="tuNgay" label="Từ ngày" rules={[{ required: true }]} style={{ width: '50%' }}><Input type="date" /></Form.Item>
            <Form.Item name="denNgay" label="Đến ngày" style={{ width: '50%' }}><Input type="date" /></Form.Item>
          </Space.Compact>
          <Form.Item name="ghiChu" label="Ghi chú"><Input.TextArea rows={2} /></Form.Item>
          <Tag color="blue">Hệ thống sẽ tạo một lịch cố định cho mỗi nhân viên, thứ và ca đã chọn.</Tag>
          <Button type="primary" htmlType="submit" block style={{ marginTop: 16 }}>Tạo lịch hàng loạt</Button>
        </Form>
      </Modal>
      <Modal
        title="Sinh lịch ngày từ lịch cố định"
        open={generateOpen}
        onCancel={() => setGenerateOpen(false)}
        footer={null}
      >
        <Form form={generateForm} layout="vertical" onFinish={async (values) => { setGeneratePreview((await previewGenerate(values.tuNgay, values.denNgay)).data.data); }}>
          <Form.Item name="tuNgay" label="Từ ngày" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item name="denNgay" label="Đến ngày" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          <Tag color="blue">Lịch ngày đã tồn tại sẽ không bị tạo trùng.</Tag>
          {generatePreview && <div style={{ marginTop: 16 }}>
            <p>Dự kiến tạo: <strong>{generatePreview.expectedCount}</strong></p>
            <p>Đã tồn tại: <strong>{generatePreview.existingCount}</strong></p>
            <p>Xung đột: <strong>{generatePreview.conflictCount}</strong></p>
            <p>Nhân viên không thuộc khoa: <strong>{generatePreview.unassignedEmployeeCount}</strong></p>
            <p>Ngoài thời hạn lịch cố định: <strong>{generatePreview.outsideEffectiveRangeCount}</strong></p>
            <Button type="primary" onClick={async () => { const values = generateForm.getFieldsValue(); await generateSchedules(values.tuNgay, values.denNgay); setGeneratePreview(null); setGenerateOpen(false); }}>Xác nhận sinh lịch</Button>
          </div>}
          {!generatePreview && <Button type="primary" htmlType="submit" block style={{ marginTop: 16 }}>Xem trước</Button>}
        </Form>
      </Modal>
    </div>
  );
};