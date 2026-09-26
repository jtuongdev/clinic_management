import { useEffect, useState } from 'react';
import { App, Button, Space, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { payrollApi } from './payroll.api';
import { PayrollDetailPage } from './pages/PayrollDetailPage';
import { CreatePayrollPeriodWorkspace } from './components/CreatePayrollPeriodWorkspace';

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
      .then(async ([periodResponse, attendanceResponse]) => {
        if (!active) return;
        const periodList = periodResponse.data.data || [];
        setPeriods(periodList);
        setAttendancePeriods((attendanceResponse.data.data || []).filter((period) => period.daKhoa));

        // Tự động nạp kỳ lương mới nhất để hiển thị trực tiếp Bảng lương Excel
        if (periodList.length > 0) {
          try {
            const res = await payrollApi.getDetail(periodList[0].id);
            if (active && res.data.data) {
              setDetail(res.data.data);
            }
          } catch {
            // fallback
          }
        }
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
      title: 'STT',
      width: 55,
      align: 'center',
      className: 'excel-stt-cell',
      render: (_, __, idx) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#64748b' }}>
          {idx + 1}
        </span>
      ),
    },
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
      render: (value, row) => (
        <Space size={4} direction="vertical">
          <Tag color={statusColors[value] || 'default'}>
            {statusLabels[value] || value}
          </Tag>
          {row.isPublished
            ? <Tag color="cyan" style={{ fontSize: 11 }}>✓ Đã công bố</Tag>
            : (value === 'DA_CHOT' || value === 'DA_THANH_TOAN')
              ? <Tag color="default" style={{ fontSize: 11, color: '#94a3b8' }}>Chưa công bố</Tag>
              : null
          }
        </Space>
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
              onClick={() => action('close', row.id, 'Đã chốt sổ kỳ lương. Bác sĩ đã có thể tra cứu phiếu lương cá nhân.')}
              style={{ background: '#d97706', borderColor: '#d97706', color: '#fff', fontWeight: 600 }}
            >
              Chốt sổ kỳ lương
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
          {(row.trangThai === 'DA_CHOT' || row.trangThai === 'DA_THANH_TOAN') && !row.isPublished && (
            <Button
              size="small"
              type="primary"
              style={{ background: '#0891b2', borderColor: '#0891b2' }}
              onClick={() => action('publish', row.id, 'Đã công bố phiếu lương cho nhân viên.')}
            >
              🔓 Công bố
            </Button>
          )}
          {row.isPublished && row.trangThai === 'DA_CHOT' && (
            <Button
              size="small"
              danger
              onClick={() => action('unpublish', row.id, 'Đã hủy công bố kỳ lương.')}
            >
              Hủy công bố
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
            Quản lý tính lương 
          </strong>
          <span style={{ fontSize: 13, color: '#6a7f96' }}>
            Tính toán và phát hành bảng lương từ các kỳ chấm công đã chốt
          </span>
        </div>
        <Button
          type="primary"
          onClick={() => setOpen(true)}
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

      {/* KHÔNG GIAN LÀM VIỆC TOÀN MÀN HÌNH KHỞI TẠO KỲ LƯƠNG MỚI */}
      <CreatePayrollPeriodWorkspace
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={load}
        attendancePeriods={attendancePeriods}
      />
    </div>
  );
};
