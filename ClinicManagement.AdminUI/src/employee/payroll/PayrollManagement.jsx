import { useEffect, useState } from 'react';
import { App, Button, DatePicker, Form, Modal, Select, Space, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { payrollApi } from './payroll.api';
import { PayrollDetailPage } from './pages/PayrollDetailPage';
import { dateRangePresets } from '../../shared/utils/datePresets';

const statusLabels = {
  NHAP: 'Nháp',
  DA_DUYET: 'Đã duyệt',
  DA_CHOT: 'Đã chốt',
  DA_THANH_TOAN: 'Đã thanh toán',
};
const statusColors = { NHAP: 'default', DA_DUYET: 'blue', DA_CHOT: 'orange', DA_THANH_TOAN: 'green' };

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
    } catch (error) {
      message.error(error?.response?.data?.message || 'Không thể tải kỳ lương.');
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([payrollApi.getPeriods(), payrollApi.getAttendancePeriods()])
      .then(([periodResponse, attendanceResponse]) => {
        if (!active) return;
        setPeriods(periodResponse.data.data || []);
        setAttendancePeriods((attendanceResponse.data.data || []).filter((period) => period.daKhoa));
      })
      .catch((error) => {
        if (active) message.error(error?.response?.data?.message || 'Không thể tải kỳ lương.');
      });
    return () => {
      active = false;
    };
  }, [message]);

  const openDetail = async (id) => {
    try {
      const res = await payrollApi.getDetail(id);
      if (res.data.data) {
        setDetail(res.data.data);
      }
    } catch (error) {
      message.error(error?.response?.data?.message || 'Không thể tải chi tiết kỳ lương.');
    }
  };

  const action = async (name, id, success) => {
    try {
      if (name === 'generate') {
        const response = await payrollApi.generate(id);
        const data = response.data.data;
        const totalStaff = data?.soBangLuong || data?.bangLuongs?.length || 0;
        const debtStaff =
          data?.soNhanVienPhatSinhNo ||
          data?.bangLuongs?.filter((x) => Number(x.tienNoKyNay || 0) > 0).length ||
          0;
        if (debtStaff > 0) {
          message.warning(
            `Đã tính toán thành công ${totalStaff} nhân viên (Trong đó có ${debtStaff} nhân viên phát sinh dư nợ khấu trừ).`,
            6
          );
        } else {
          message.success(`Đã tính toán thành công ${totalStaff} nhân viên.`);
        }
        await load();
        if (detail?.id === id) setDetail(data);
        return;
      }
      await payrollApi[name](id);
      message.success(success);
      await load();
      if (detail?.id === id) setDetail((await payrollApi.getDetail(id)).data.data);
    } catch (error) {
      message.error(error?.response?.data?.message || 'Thao tác kỳ lương thất bại.');
    }
  };

  // NẾU ĐANG CHỌN XEM CHI TIẾT 1 KỲ LƯƠNG: HIỂN THỊ TOÀN TRANG PayrollDetailPage
  if (detail) {
    return (
      <PayrollDetailPage
        periodId={detail.id}
        initialDetail={detail}
        onBack={() => setDetail(null)}
        onPeriodUpdated={load}
      />
    );
  }

  const columns = [
    {
      title: 'Kỳ lương',
      render: (_, row) => (
        <a
          onClick={() => openDetail(row.id)}
          style={{ fontWeight: 600, color: '#0b4f6c' }}
        >
          Tháng {row.thang}/{row.nam}
        </a>
      ),
    },
    {
      title: 'Khoảng thời gian',
      render: (_, row) =>
        `${dayjs(row.tuNgay).format('DD/MM/YYYY')} - ${dayjs(row.denNgay).format('DD/MM/YYYY')}`,
    },
    { title: 'Số bảng lương', dataIndex: 'soBangLuong' },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      render: (value) => (
        <Tag color={statusColors[value] || 'default'}>
          {statusLabels[value] || value}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      render: (_, row) => (
        <Space wrap>
          <Button size="small" type="primary" ghost onClick={() => openDetail(row.id)}>
            Mở chi tiết & Điều chỉnh
          </Button>
          {row.trangThai === 'NHAP' && (
            <Button
              size="small"
              onClick={() => action('generate', row.id, 'Đã tạo bảng lương từ chấm công.')}
            >
              Tính lương
            </Button>
          )}
          {row.trangThai === 'NHAP' && row.soBangLuong > 0 && (
            <Button
              size="small"
              onClick={() => action('approve', row.id, 'Đã duyệt kỳ lương.')}
            >
              Duyệt
            </Button>
          )}
          {row.trangThai === 'DA_DUYET' && (
            <Button
              size="small"
              onClick={() => action('close', row.id, 'Đã chốt kỳ lương.')}
            >
              Chốt
            </Button>
          )}
          {row.trangThai === 'DA_CHOT' && (
            <Button
              size="small"
              type="primary"
              onClick={() => action('pay', row.id, 'Đã ghi nhận thanh toán.')}
            >
              Thanh toán
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="payroll-management">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <strong style={{ fontSize: 16, color: '#0b2a3c', display: 'block' }}>
            Quản lý tính lương nhân viên
          </strong>
          <span style={{ fontSize: 13, color: '#6a7f96' }}>
            Tính toán và phát hành bảng lương từ các kỳ chấm công đã chốt
          </span>
        </div>
        <Button
          type="primary"
          onClick={() => {
            form.resetFields();
            setOpen(true);
          }}
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
        locale={{ emptyText: 'Chưa có kỳ lương nào được tạo.' }}
        style={{ border: '1px solid #e9edf4', borderRadius: 10, overflow: 'hidden' }}
      />

      <Modal
        title="Tạo kỳ tính lương mới"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            try {
              await payrollApi.createPeriod({
                thang: values.month.month() + 1,
                nam: values.month.year(),
                tuNgay: values.range[0].format('YYYY-MM-DD'),
                denNgay: values.range[1].format('YYYY-MM-DD'),
                maKyChamCong: values.maKyChamCong,
              });
              message.success('Đã tạo kỳ lương thành công.');
              setOpen(false);
              await load();
            } catch (error) {
              message.error(error?.response?.data?.message || 'Không thể tạo kỳ lương.');
            }
          }}
        >
          <Form.Item name="month" label="Tháng" rules={[{ required: true, message: 'Chọn tháng' }]}>
            <DatePicker picker="month" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="range"
            label="Khoảng tính lương"
            rules={[{ required: true, message: 'Chọn khoảng ngày tính lương' }]}
          >
            <DatePicker.RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" presets={dateRangePresets} />
          </Form.Item>
          <Form.Item
            name="maKyChamCong"
            label="Kỳ chấm công đã khóa"
            rules={[{ required: true, message: 'Chọn kỳ chấm công đã khóa.' }]}
          >
            <Select
              placeholder="Chọn kỳ chấm công đã khóa"
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
          {selectedPeriod && (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 6,
              }}
            >
              <div>
                <strong>Kỳ chấm công đã khóa hợp lệ</strong>
              </div>
              <div>
                Khoảng công: {dayjs(selectedPeriod.tuNgay).format('DD/MM/YYYY')} -{' '}
                {dayjs(selectedPeriod.denNgay).format('DD/MM/YYYY')}
              </div>
              <div>Trạng thái: <Tag color="green">Sẵn sàng tính lương</Tag></div>
            </div>
          )}
          <Button type="primary" htmlType="submit" block style={{ background: '#0b4f6c' }}>
            Tạo kỳ tính lương
          </Button>
        </Form>
      </Modal>
    </div>
  );
};
