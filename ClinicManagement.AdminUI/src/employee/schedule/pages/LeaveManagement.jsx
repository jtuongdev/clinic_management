import { useState } from 'react';
import { Button, Form, Input, Modal, Select, Space, Table, Tag } from 'antd';
import dayjs from 'dayjs';

const leaveTypes = [
  { value: 'PHEP_NAM', label: 'Phép năm' },
  { value: 'PHEP_BENH', label: 'Phép bệnh' },
  { value: 'PHEP_RIENG', label: 'Phép riêng' },
  { value: 'KHONG_LUONG', label: 'Không lương' },
];

export const LeaveManagement = ({ employees, leaves, createLeave, reviewLeave, cancelLeave, statusLabels = {} }) => {
  const [open, setOpen] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [form] = Form.useForm();

  const submit = async (values) => {
    await createLeave(values);
    setOpen(false);
    form.resetFields();
  };

  const columns = [
    {
      title: 'STT',
      width: 50,
      align: 'center',
      className: 'excel-stt-cell',
      render: (_, __, idx) => (pagination.current - 1) * pagination.pageSize + idx + 1,
    },
    {
      title: 'Nhân viên',
      dataIndex: 'tenNhanVien',
      width: 190,
      render: (v) => <strong style={{ color: '#0f172a' }}>{v}</strong>,
    },
    {
      title: 'Thời gian nghỉ',
      width: 220,
      align: 'center',
      className: 'excel-date-cell',
      render: (_, row) => (
        <span>
          {dayjs(row.tuNgay).format('DD/MM/YYYY')} — {dayjs(row.denNgay).format('DD/MM/YYYY')}
        </span>
      ),
    },
    {
      title: 'Loại nghỉ',
      dataIndex: 'loaiNghi',
      width: 130,
      align: 'center',
      render: (value) => (
        <Tag color="cyan">
          {leaveTypes.find(item => item.value === value)?.label || value}
        </Tag>
      ),
    },
    {
      title: 'Lý do',
      dataIndex: 'lyDo',
      render: (v) => <span style={{ color: '#334155' }}>{v}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      width: 120,
      align: 'center',
      render: (value) => (
        <Tag color={value === 'DA_DUYET' ? 'green' : value === 'TU_CHOI' ? 'red' : value === 'HUY' ? 'default' : 'gold'}>
          {statusLabels[value] || value}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      width: 160,
      align: 'center',
      render: (_, row) => (
        <Space size={6}>
          {row.trangThai === 'CHO_DUYET' && (
            <>
              <Button size="small" type="primary" style={{ background: '#10b981', borderColor: '#10b981' }} onClick={() => reviewLeave(row.id, true)}>
                Duyệt
              </Button>
              <Button size="small" danger onClick={() => reviewLeave(row.id, false)}>
                Từ chối
              </Button>
            </>
          )}
          {row.trangThai === 'CHO_DUYET' && (
            <Button size="small" onClick={() => cancelLeave(row.id)}>
              Hủy
            </Button>
          )}
          {row.trangThai !== 'CHO_DUYET' && (
            <span style={{ color: '#94a3b8' }}>Đã xử lý</span>
          )}
        </Space>
      ),
    },
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
        className="excel-data-grid"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn`,
        }}
        onChange={(p) => setPagination({ current: p.current || 1, pageSize: p.pageSize || 10 })}
        locale={{ emptyText: 'Chưa có đơn nghỉ trong tuần.' }}
        style={{ border: '1px solid #cbd5e1', borderRadius: 6, overflow: 'hidden' }}
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
