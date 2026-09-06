import { useState } from 'react';
import { Button, Form, Input, Modal, Select, Space, Table, Tag } from 'antd';

const leaveTypes = [
  { value: 'PHEP_NAM', label: 'Phép năm' },
  { value: 'PHEP_BENH', label: 'Phép bệnh' },
  { value: 'PHEP_RIENG', label: 'Phép riêng' },
  { value: 'KHONG_LUONG', label: 'Không lương' },
];

export const LeaveManagement = ({ employees, leaves, createLeave, reviewLeave, cancelLeave, statusLabels = {} }) => {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const submit = async (values) => {
    await createLeave(values);
    setOpen(false);
    form.resetFields();
  };
  const columns = [
    { title: 'Nhân viên', dataIndex: 'tenNhanVien' },
    { title: 'Thời gian', render: (_, row) => `${row.tuNgay} - ${row.denNgay}` },
    { title: 'Loại nghỉ', dataIndex: 'loaiNghi', render: (value) => leaveTypes.find(item => item.value === value)?.label || value },
    { title: 'Trạng thái', dataIndex: 'trangThai', render: (value) => <Tag color={value === 'DA_DUYET' ? 'green' : value === 'TU_CHOI' ? 'red' : 'blue'}>{statusLabels[value] || value}</Tag> },
    { title: 'Lý do', dataIndex: 'lyDo' },
    { title: 'Thao tác', render: (_, row) => (
      <Space>
        {row.trangThai === 'CHO_DUYET' && <><Button size="small" type="primary" onClick={() => reviewLeave(row.id, true)}>Duyệt</Button><Button size="small" danger onClick={() => reviewLeave(row.id, false)}>Từ chối</Button></>}
        {row.trangThai === 'CHO_DUYET' && <Button size="small" onClick={() => cancelLeave(row.id)}>Hủy</Button>}
      </Space>
    ) },
  ];
  return (
    <div className="schedule-leave-panel">
      <div className="schedule-fixed-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <strong style={{ fontSize: 15, color: '#0b2a3c' }}>Đơn nghỉ phép</strong>
          <span style={{ fontSize: 13, color: '#6a7f96', marginLeft: 8 }}>Quản lý, duyệt và đồng bộ nghỉ vào lịch ngày</span>
        </div>
        <Button type="primary" onClick={() => setOpen(true)} style={{ background: '#0b4f6c', borderColor: '#0b4f6c', borderRadius: 8 }}>
          Tạo đơn nghỉ
        </Button>
      </div>
      <Table
        rowKey="id"
        dataSource={leaves}
        columns={columns}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'Chưa có đơn nghỉ trong tuần.' }}
        style={{ border: '1px solid #e9edf4', borderRadius: 10, overflow: 'hidden' }}
      />
      <Modal title="Tạo đơn nghỉ phép" open={open} onCancel={() => setOpen(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={submit}>
          <Form.Item name="maNhanVien" label="Nhân viên" rules={[{ required: true }]}>
            <Select options={employees.map((item) => ({ value: item.id, label: item.hoTen }))} />
          </Form.Item>
          <Space.Compact block>
            <Form.Item name="tuNgay" label="Từ ngày" rules={[{ required: true }]} style={{ width: '50%' }}>
              <Input type="date" />
            </Form.Item>
            <Form.Item name="denNgay" label="Đến ngày" rules={[{ required: true }]} style={{ width: '50%' }}>
              <Input type="date" />
            </Form.Item>
          </Space.Compact>
          <Form.Item name="loaiNghi" label="Loại nghỉ" rules={[{ required: true }]}>
            <Select options={leaveTypes} />
          </Form.Item>
          <Form.Item name="lyDo" label="Lý do" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block style={{ background: '#0b4f6c', borderColor: '#0b4f6c', borderRadius: 8 }}>
            Tạo đơn
          </Button>
        </Form>
      </Modal>
    </div>
  );
};
