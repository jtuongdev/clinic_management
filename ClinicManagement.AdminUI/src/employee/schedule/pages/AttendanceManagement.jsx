import { useState } from 'react';
import { Button, DatePicker, Form, Input, Modal, Space, Table, Tag } from 'antd';
import dayjs from 'dayjs';

export const AttendanceManagement = ({
  schedules,
  attendance,
  checkIn,
  checkOut,
  loading,
  adjustments = [],
  periods = [],
  requestAdjustment,
  reviewAdjustment,
  createPeriod,
  togglePeriod,
  attendanceLabels = {},
  attendanceKpi,
}) => {
  const [adjustmentRow, setAdjustmentRow] = useState(null);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [adjustmentForm] = Form.useForm();
  const [periodForm] = Form.useForm();
  const rows = schedules.map((schedule) => {
    const item = attendance.find((entry) => entry.maLichLamViec === schedule.id);
    return { ...schedule, attendance: item };
  });
  const columns = [
    { title: 'Ngày', dataIndex: 'ngayLam', render: (value) => dayjs(value).format('DD/MM/YYYY') },
    { title: 'Nhân viên', dataIndex: 'tenNhanVien' },
    { title: 'Ca', render: (_, row) => `${row.tenCa} (${row.thoiGianBatDau} - ${row.thoiGianKetThuc})` },
    { title: 'Check-in', render: (_, row) => row.attendance?.checkIn ? dayjs(row.attendance.checkIn).format('HH:mm:ss') : '-' },
    { title: 'Check-out', render: (_, row) => row.attendance?.checkOut ? dayjs(row.attendance.checkOut).format('HH:mm:ss') : '-' },
    { title: 'Trạng thái', render: (_, row) => {
      const status = row.attendance?.trangThai || (row.trangThai === 'NGHI' ? 'NGHI_TRONG_NGAY' : 'CHUA_CHAM_CONG');
      const colors = { VANG_MAT: 'red', NGHI_PHEP: 'orange', NGHI_TRONG_NGAY: 'gold', THIEU_CHECK_OUT: 'volcano', CHO_XAC_NHAN: 'purple', DI_MUON: 'orange', DI_MUON_VE_SOM: 'orange' };
      return <Tag color={colors[status] || 'blue'}>{attendanceLabels[status] || status}</Tag>;
    } },
    { title: 'Đi muộn', render: (_, row) => `${row.attendance?.phutDiMuon || 0} phút` },
    { title: 'Về sớm', render: (_, row) => `${row.attendance?.phutVeSom || 0} phút` },
    { title: 'Giờ thực tế', render: (_, row) => row.attendance?.checkOut ? `${row.attendance.gioLamThucTe} giờ` : '-' },
    { title: 'Yêu cầu điều chỉnh', render: (_, row) => {
      const request = adjustments.find((item) => item.maChamCong === row.attendance?.id);
      if (!row.attendance) return '-';
      if (request?.trangThai === 'CHO_DUYET') return <Tag color="gold">Chờ duyệt</Tag>;
      return <Button size="small" onClick={() => {
        adjustmentForm.setFieldsValue({
          checkIn: row.attendance.checkIn ? dayjs(row.attendance.checkIn) : null,
          checkOut: row.attendance.checkOut ? dayjs(row.attendance.checkOut) : null,
          lyDo: '',
        });
        setAdjustmentRow(row);
      }}>Điều chỉnh</Button>;
    } },
    { title: 'Thao tác', render: (_, row) => {
      const item = row.attendance;
      if (row.trangThai === 'NGHI' || item?.trangThai === 'NGHI_PHEP' || item?.trangThai === 'VANG_MAT') return '-';
      return (
        <Space>
          {!item?.checkIn && <Button size="small" type="primary" onClick={() => checkIn(row.id)}>Check-in</Button>}
          {item?.checkIn && !item?.checkOut && <Button size="small" onClick={() => checkOut(row.id)}>Check-out</Button>}
        </Space>
      );
    } },
  ];
  const exportCsv = () => {
    const header = ['Ngày', 'Nhân viên', 'Ca', 'Check-in', 'Check-out', 'Trạng thái', 'Đi muộn (phút)', 'Về sớm (phút)', 'Giờ thực tế'];
    const lines = rows.map((row) => {
      const status = row.attendance?.trangThai || (row.trangThai === 'NGHI' ? 'NGHI_TRONG_NGAY' : 'CHUA_CHAM_CONG');
      return [
        dayjs(row.ngayLam).format('DD/MM/YYYY'),
        row.tenNhanVien,
        `${row.tenCa} (${row.thoiGianBatDau} - ${row.thoiGianKetThuc})`,
        row.attendance?.checkIn ? dayjs(row.attendance.checkIn).format('HH:mm:ss') : '',
        row.attendance?.checkOut ? dayjs(row.attendance.checkOut).format('HH:mm:ss') : '',
        attendanceLabels[status] || status,
        row.attendance?.phutDiMuon || 0,
        row.attendance?.phutVeSom || 0,
        row.attendance?.gioLamThucTe || 0,
      ].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',');
    });
    const blob = new Blob([`\uFEFF${[header.join(','), ...lines].join('\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bao-cao-cham-cong-${dayjs().format('YYYYMMDD-HHmm')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <>
      {attendanceKpi && (
        <div className="schedule-stats">
          <div className="schedule-stat-card"><span className="stat-value">{attendanceKpi.tongLich}</span><span className="stat-label">Tổng ca</span></div>
          <div className="schedule-stat-card"><span className="stat-value">{attendanceKpi.daCheckIn}</span><span className="stat-label">Đã check-in</span></div>
          <div className="schedule-stat-card"><span className="stat-value">{attendanceKpi.daCheckOut}</span><span className="stat-label">Đã check-out</span></div>
          <div className="schedule-stat-card"><span className="stat-value">{attendanceKpi.thieuCheckOut}</span><span className="stat-label">Thiếu check-out</span></div>
          <div className="schedule-stat-card"><span className="stat-value">{attendanceKpi.vangMat}</span><span className="stat-label">Vắng mặt</span></div>
          <div className="schedule-stat-card"><span className="stat-value">{attendanceKpi.diMuon}</span><span className="stat-label">Đi muộn</span></div>
          <div className="schedule-stat-card"><span className="stat-value">{Number(attendanceKpi.tongGioLam || 0).toFixed(2)}</span><span className="stat-label">Giờ thực tế</span></div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <strong style={{ fontSize: 15, color: '#0b2a3c' }}>Bảng theo dõi chấm công</strong>
          <span style={{ fontSize: 13, color: '#6a7f96', marginLeft: 8 }}>Kiểm tra vào/ra và điều chỉnh giờ làm</span>
        </div>
        <Space wrap>
          <Button onClick={() => setPeriodOpen(true)} style={{ borderRadius: 8 }}>
            Quản lý kỳ chấm công
          </Button>
          <Button onClick={exportCsv} disabled={!rows.length} style={{ borderRadius: 8 }}>
            Xuất báo cáo CSV
          </Button>
        </Space>
      </div>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={rows}
        columns={columns}
        pagination={{ pageSize: 15, showSizeChanger: true }}
        locale={{ emptyText: 'Chưa có lịch để chấm công.' }}
        style={{ border: '1px solid #e9edf4', borderRadius: 10, overflow: 'hidden' }}
      />
      <Modal
        title={`Điều chỉnh chấm công - ${adjustmentRow?.tenNhanVien || ''}`}
        open={!!adjustmentRow}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
        onCancel={() => setAdjustmentRow(null)}
        onOk={async () => {
          const values = await adjustmentForm.validateFields();
          await requestAdjustment({
            maChamCong: adjustmentRow.attendance.id,
            checkIn: values.checkIn?.toISOString() || null,
            checkOut: values.checkOut?.toISOString() || null,
            lyDo: values.lyDo,
          });
          setAdjustmentRow(null);
        }}
      >
        <Form form={adjustmentForm} layout="vertical">
          <Form.Item name="checkIn" label="Check-in mới">
            <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="checkOut" label="Check-out mới">
            <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="lyDo" label="Lý do" rules={[{ required: true, message: 'Vui lòng nhập lý do.' }]}>
            <Input.TextArea rows={3} maxLength={500} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Kỳ chấm công"
        open={periodOpen}
        footer={null}
        onCancel={() => setPeriodOpen(false)}
        width={720}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form form={periodForm} layout="inline" onFinish={async (values) => {
            await createPeriod({
              tuNgay: values.range[0].startOf('day').toISOString(),
              denNgay: values.range[1].endOf('day').toISOString(),
              ghiChu: values.ghiChu,
            });
            periodForm.resetFields();
          }}>
            <Form.Item name="range" rules={[{ required: true, message: 'Chọn khoảng kỳ.' }]}>
              <DatePicker.RangePicker format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item name="ghiChu"><Input placeholder="Ghi chú" /></Form.Item>
            <Button type="primary" htmlType="submit">Tạo kỳ</Button>
          </Form>
          <Table
            rowKey="id"
            size="small"
            dataSource={periods}
            pagination={false}
            columns={[
              { title: 'Từ ngày', render: (_, item) => dayjs(item.tuNgay).format('DD/MM/YYYY') },
              { title: 'Đến ngày', render: (_, item) => dayjs(item.denNgay).format('DD/MM/YYYY') },
              { title: 'Trạng thái', render: (_, item) => <Tag color={item.daKhoa ? 'red' : 'green'}>{item.daKhoa ? 'Đã khóa' : 'Đang mở'}</Tag> },
              { title: 'Thao tác', render: (_, item) => <Button size="small" onClick={() => togglePeriod(item)}>{item.daKhoa ? 'Mở khóa' : 'Khóa kỳ'}</Button> },
            ]}
          />
          {adjustments.length > 0 && (
            <Table
              rowKey="id"
              size="small"
              dataSource={adjustments}
              pagination={{ pageSize: 5 }}
              title={() => 'Yêu cầu điều chỉnh gần đây'}
              columns={[
                { title: 'Mã chấm công', dataIndex: 'maChamCong' },
                { title: 'Lý do', dataIndex: 'lyDo' },
                { title: 'Trạng thái', dataIndex: 'trangThai' },
                { title: 'Thao tác', render: (_, item) => item.trangThai === 'CHO_DUYET' ? <Space><Button size="small" type="primary" onClick={() => reviewAdjustment(item.id, true)}>Duyệt</Button><Button size="small" danger onClick={() => reviewAdjustment(item.id, false)}>Từ chối</Button></Space> : '-' },
              ]}
            />
          )}
        </Space>
      </Modal>
    </>
  );
};
