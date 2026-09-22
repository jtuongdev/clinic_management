import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip
} from 'antd';
import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Plus,
  Sparkles,
  UserCheck
} from 'lucide-react';
import dayjs from 'dayjs';

const dateFormat = 'YYYY-MM-DD';
const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const weekDaysList = [
  { label: 'Thứ 2', value: 1 },
  { label: 'Thứ 3', value: 2 },
  { label: 'Thứ 4', value: 3 },
  { label: 'Thứ 5', value: 4 },
  { label: 'Thứ 6', value: 5 },
  { label: 'Thứ 7', value: 6 },
  { label: 'Chủ nhật', value: 0 },
];

export const FixedScheduleManagement = ({
  employees,
  shifts,
  phongKhams,
  roomsLoading,
  selectedKhoa,
  fixedSchedules,
  fixedLoading,
  createFixed,
  bulkCreateFixed,
  setFixedSchedule,
  generateMonthlySchedule,
  updateFixed,
  removeFixed,
  generateSchedules,
  previewGenerate,
}) => {
  // Single item modal
  const [fixedModalOpen, setFixedModalOpen] = useState(false);
  const [editingFixed, setEditingFixed] = useState(null);
  const [fixedForm] = Form.useForm();

  // Bulk create modal
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkForm] = Form.useForm();

  // Date-range generate modal
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generatePreview, setGeneratePreview] = useState(null);
  const [generateForm] = Form.useForm();

  // Weekly Matrix template modal
  const [weeklyModalOpen, setWeeklyModalOpen] = useState(false);
  const [selectedWeeklyEmp, setSelectedWeeklyEmp] = useState(null);
  const [weeklyGrid, setWeeklyGrid] = useState({});
  const [savingWeekly, setSavingWeekly] = useState(false);

  // Monthly Schedule generate modal
  const [monthlyModalOpen, setMonthlyModalOpen] = useState(false);
  const [monthlyMonth, setMonthlyMonth] = useState(dayjs());
  const [monthlyEmp, setMonthlyEmp] = useState(undefined);
  const [monthlyResult, setMonthlyResult] = useState(null);
  const [generatingMonthly, setGeneratingMonthly] = useState(false);

  const dayOptions = dayNames.map((label, index) => ({ label, value: index === 6 ? 0 : index + 1 }));

  // --- Handlers for Single Modal ---
  const openFixedModal = (item = null) => {
    setEditingFixed(item);
    fixedForm.setFieldsValue(item || {
      maNhanVien: undefined,
      maCaTruc: undefined,
      maPhongKham: undefined,
      thuTrongTuan: 1,
      isActive: true,
      tuNgay: dayjs().format(dateFormat),
      denNgay: undefined,
      ghiChu: '',
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
    const payloads = values.maNhanVien.flatMap((maNhanVien) =>
      values.thuTrongTuan.flatMap((thuTrongTuan) =>
        values.maCaTruc.map((maCaTruc) => ({
          maNhanVien,
          maKhoa: selectedKhoa,
          maCaTruc,
          maPhongKham: values.maPhongKham,
          thuTrongTuan,
          isActive: true,
          tuNgay: values.tuNgay,
          denNgay: values.denNgay,
          ghiChu: values.ghiChu || '',
        }))
      )
    );
    await bulkCreateFixed(payloads);
    setBulkOpen(false);
    bulkForm.resetFields();
  };

  // --- Handlers for Weekly Matrix ---
  const openWeeklyMatrixModal = (empId = null) => {
    const targetEmpId = empId || employees[0]?.id;
    setSelectedWeeklyEmp(targetEmpId);
    initWeeklyGridForEmp(targetEmpId);
    setWeeklyModalOpen(true);
  };

  const initWeeklyGridForEmp = (empId) => {
    if (!empId) {
      setWeeklyGrid({});
      return;
    }
    const empFixed = fixedSchedules.filter((f) => f.maNhanVien === empId);
    const grid = {};
    empFixed.forEach((f) => {
      grid[`${f.thuTrongTuan}_${f.maCaTruc}`] = {
        active: f.isActive !== false,
        maPhongKham: f.maPhongKham,
      };
    });
    setWeeklyGrid(grid);
  };

  const handleEmpChangeInWeekly = (empId) => {
    setSelectedWeeklyEmp(empId);
    initWeeklyGridForEmp(empId);
  };

  const toggleWeeklyCell = (dayValue, shiftId, checked) => {
    const key = `${dayValue}_${shiftId}`;
    setWeeklyGrid((prev) => ({
      ...prev,
      [key]: {
        active: checked,
        maPhongKham: prev[key]?.maPhongKham,
      },
    }));
  };

  const setWeeklyCellRoom = (dayValue, shiftId, roomId) => {
    const key = `${dayValue}_${shiftId}`;
    setWeeklyGrid((prev) => ({
      ...prev,
      [key]: {
        active: prev[key]?.active ?? true,
        maPhongKham: roomId,
      },
    }));
  };

  const submitWeeklyMatrix = async () => {
    if (!selectedWeeklyEmp) return;
    setSavingWeekly(true);
    try {
      const shiftsPayload = [];
      Object.entries(weeklyGrid).forEach(([key, value]) => {
        if (value.active) {
          const [dayStr, shiftStr] = key.split('_');
          shiftsPayload.push({
            thuTrongTuan: Number(dayStr),
            maCaTruc: Number(shiftStr),
            maPhongKham: value.maPhongKham || undefined,
          });
        }
      });
      await setFixedSchedule({
        maNhanVien: selectedWeeklyEmp,
        shifts: shiftsPayload,
      });
      setWeeklyModalOpen(false);
    } finally {
      setSavingWeekly(false);
    }
  };

  // --- Handlers for Monthly Schedule Generation ---
  const handleGenerateMonthly = async () => {
    if (!monthlyMonth) return;
    setGeneratingMonthly(true);
    try {
      const result = await generateMonthlySchedule({
        thang: monthlyMonth.month() + 1,
        nam: monthlyMonth.year(),
        maKhoa: selectedKhoa,
        maNhanVien: monthlyEmp,
      });
      if (result) {
        setMonthlyResult(result);
      }
    } finally {
      setGeneratingMonthly(false);
    }
  };

  const getDayName = (value) => (value === 0 ? 'Chủ nhật' : dayNames[value - 1]);

  const fixedColumns = [
    {
      title: 'Nhân viên',
      dataIndex: 'tenNhanVien',
      render: (val, row) => (
        <span style={{ fontWeight: 600, color: '#0f172a' }}>
          {val || `NV #${row.maNhanVien}`}
        </span>
      ),
    },
    {
      title: 'Thứ',
      dataIndex: 'thuTrongTuan',
      render: (value) => (
        <Tag color={value === 0 ? 'magenta' : 'geekblue'}>
          {getDayName(value) || value}
        </Tag>
      ),
    },
    {
      title: 'Ca trực',
      dataIndex: 'tenCa',
      render: (val) => <Tag color="blue">{val || 'Ca trực'}</Tag>,
    },
    {
      title: 'Phòng khám',
      dataIndex: 'tenPhongKham',
      render: (value) => value ? <Tag color="cyan">{value}</Tag> : <span style={{ color: '#94a3b8' }}>-</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      render: (val) => (
        <Tag color={val !== false ? 'green' : 'default'}>
          {val !== false ? 'Đang áp dụng' : 'Tạm dừng'}
        </Tag>
      ),
    },
    {
      title: 'Hiệu lực',
      render: (_, row) => (
        <span style={{ fontSize: 13, color: '#475569' }}>
          {dayjs(row.tuNgay).format('DD/MM/YYYY')} -{' '}
          {row.denNgay ? dayjs(row.denNgay).format('DD/MM/YYYY') : 'Vô thời hạn'}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      render: (_, row) => (
        <Space>
          <Button size="small" onClick={() => openFixedModal(row)}>
            Sửa
          </Button>
          <Button
            size="small"
            icon={<CalendarCheck size={12} />}
            onClick={() => openWeeklyMatrixModal(row.maNhanVien)}
          >
            Lịch tuần
          </Button>
          <Button size="small" danger onClick={() => removeFixed(row.id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="fixed-schedule-container">
      <div className="fixed-schedule-header">
        <div className="fixed-schedule-title">
          <strong style={{ fontSize: 16, color: '#0b2a3c', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarCheck size={18} color="#0b4f6c" /> Lịch làm việc cố định (Khuôn mẫu tuần hoàn)
          </strong>
          <span style={{ fontSize: 13, color: '#6a7f96', marginTop: 2, display: 'block' }}>
            Thiết lập lịch trực tuần mẫu và tự động sinh lịch ngày thực tế theo tháng
          </span>
        </div>
        <div className="fixed-schedule-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Tooltip title={!fixedSchedules.length ? 'Cần ít nhất 1 lịch cố định để sinh lịch tháng' : 'Tự động sinh lịch cho cả tháng dựa trên lịch mẫu'}>
            <span>
              <Button
                type="primary"
                icon={<Sparkles size={16} />}
                onClick={() => {
                  setMonthlyResult(null);
                  setMonthlyModalOpen(true);
                }}
                disabled={!fixedSchedules.length}
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  borderColor: '#1d4ed8',
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                Sinh lịch tháng tự động
              </Button>
            </span>
          </Tooltip>

          <Tooltip title={!selectedKhoa ? 'Vui lòng chọn Khoa phòng ở thanh công cụ' : !employees.length ? 'Khoa chưa có nhân viên nào' : 'Cấu hình lịch tuần trực quan theo ma trận'}>
            <span>
              <Button
                icon={<UserCheck size={16} />}
                onClick={() => openWeeklyMatrixModal()}
                disabled={!selectedKhoa || !employees.length}
                style={{ borderRadius: 8, borderColor: '#0284c7', color: '#0284c7', fontWeight: 500 }}
              >
                Cấu hình lịch tuần nhân viên
              </Button>
            </span>
          </Tooltip>

          <Tooltip title={!fixedSchedules.length ? 'Cần ít nhất 1 lịch cố định để sinh lịch' : 'Sinh lịch ngày theo khoảng thời gian tùy chọn'}>
            <span>
              <Button
                icon={<CalendarDays size={16} />}
                onClick={() => setGenerateOpen(true)}
                disabled={!fixedSchedules.length}
                style={{ borderRadius: 8 }}
              >
                Sinh theo khoảng ngày
              </Button>
            </span>
          </Tooltip>

          <Tooltip title={!selectedKhoa ? 'Vui lòng chọn Khoa phòng ở thanh công cụ' : 'Thêm 1 ca trực cố định cho nhân viên'}>
            <span>
              <Button
                type="primary"
                icon={<Plus size={16} />}
                onClick={() => openFixedModal()}
                disabled={!selectedKhoa}
                style={{ background: '#0b4f6c', borderColor: '#0b4f6c', borderRadius: 8 }}
              >
                Thêm lịch lẻ
              </Button>
            </span>
          </Tooltip>

          <Tooltip title={!selectedKhoa ? 'Vui lòng chọn Khoa phòng ở thanh công cụ' : 'Gán ca trực cho nhiều nhân viên/nhiều thứ'}>
            <span>
              <Button
                icon={<Plus size={16} />}
                onClick={() => setBulkOpen(true)}
                disabled={!selectedKhoa}
                style={{ borderRadius: 8 }}
              >
                Gán hàng loạt
              </Button>
            </span>
          </Tooltip>
        </div>
      </div>

      {!selectedKhoa ? (
        <Alert
          type="warning"
          showIcon
          message="Vui lòng chọn Khoa phòng"
          description="Hãy chọn Cơ sở và Khoa phòng ở thanh công cụ phía trên để xem và kích hoạt các chức năng thiết lập lịch làm việc."
          style={{ marginBottom: 14, borderRadius: 8 }}
        />
      ) : !fixedLoading && !fixedSchedules.length ? (
        <Alert
          type="info"
          showIcon
          message="Chưa có khuôn mẫu lịch cố định nào cho khoa này"
          description="Bấm 'Cấu hình lịch tuần nhân viên' hoặc 'Thêm lịch lẻ' ở góc phải để bắt đầu thiết lập lịch trực mẫu cho nhân viên."
          style={{ marginBottom: 14, borderRadius: 8 }}
        />
      ) : null}

      <Table
        className="fixed-schedule-table"
        rowKey="id"
        loading={fixedLoading}
        dataSource={fixedSchedules}
        columns={fixedColumns}
        pagination={{ pageSize: 15, showTotal: (t) => `Tổng cộng ${t} lịch cố định` }}
        locale={{ emptyText: 'Chưa có khuôn mẫu lịch cố định nào cho khoa này.' }}
        style={{ border: '1px solid #e9edf4', borderRadius: 10, overflow: 'hidden', marginTop: 12 }}
      />

      {/* --- MODAL 1: CẤU HÌNH LỊCH TUẦN NHÂN VIÊN (WEEKLY MATRIX) --- */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0f172a' }}>
            <UserCheck size={18} color="#0284c7" />
            <span>Thiết lập lịch làm việc tuần hoàn cho nhân viên</span>
          </div>
        }
        open={weeklyModalOpen}
        onCancel={() => setWeeklyModalOpen(false)}
        width={980}
        footer={[
          <Button key="cancel" onClick={() => setWeeklyModalOpen(false)}>
            Đóng
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={savingWeekly}
            onClick={submitWeeklyMatrix}
            style={{ background: '#0b4f6c', borderColor: '#0b4f6c' }}
          >
            Lưu toàn bộ lịch tuần
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600, display: 'block', marginBottom: 6, color: '#334155' }}>
            Chọn nhân viên cần thiết lập:
          </label>
          <Select
            style={{ width: '100%', maxWidth: 420 }}
            value={selectedWeeklyEmp}
            onChange={handleEmpChangeInWeekly}
            showSearch
            optionFilterProp="label"
            options={employees.map((item) => ({
              value: item.id,
              label: `${item.hoTen} (@${item.username}) - ${item.chucVu || 'Nhân viên'}`,
            }))}
          />
        </div>

        <Alert
          type="info"
          showIcon
          message="Hướng dẫn cấu hình"
          description="Đánh dấu tick vào các ô ca trực tương ứng với các thứ trong tuần mà nhân viên sẽ làm việc cố định. Bạn có thể chọn phòng khám mặc định cho từng ca. Khi lưu, hệ thống sẽ tự động đồng bộ trọn vẹn lịch tuần của nhân sự này."
          style={{ marginBottom: 16 }}
        />

        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', minWidth: 160, color: '#475569' }}>
                  Ca làm việc
                </th>
                {weekDaysList.map((day) => (
                  <th
                    key={day.value}
                    style={{
                      padding: '10px 8px',
                      textAlign: 'center',
                      minWidth: 105,
                      color: day.value === 0 ? '#e11d48' : '#0369a1',
                      borderLeft: '1px solid #f1f5f9',
                    }}
                  >
                    {day.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shifts.map((shift) => (
                <tr key={shift.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px', background: '#fafafa', borderRight: '1px solid #f1f5f9' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{shift.tenCa}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      {shift.thoiGianBatDau} - {shift.thoiGianKetThuc}
                    </div>
                  </td>
                  {weekDaysList.map((day) => {
                    const key = `${day.value}_${shift.id}`;
                    const cell = weeklyGrid[key] || { active: false, maPhongKham: undefined };
                    return (
                      <td
                        key={day.value}
                        style={{
                          padding: '8px 6px',
                          textAlign: 'center',
                          borderLeft: '1px solid #f1f5f9',
                          background: cell.active ? '#f0fdf4' : 'transparent',
                        }}
                      >
                        <Checkbox
                          checked={cell.active}
                          onChange={(e) => toggleWeeklyCell(day.value, shift.id, e.target.checked)}
                        >
                          <span style={{ fontSize: 12 }}>Trực</span>
                        </Checkbox>
                        {cell.active && (
                          <div style={{ marginTop: 6 }}>
                            <Select
                              size="small"
                              placeholder="Phòng"
                              allowClear
                              style={{ width: '100%', fontSize: 11 }}
                              value={cell.maPhongKham}
                              onChange={(val) => setWeeklyCellRoom(day.value, shift.id, val)}
                              options={phongKhams.map((r) => ({
                                value: r.id,
                                label: r.ten,
                              }))}
                            />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* --- MODAL 2: SINH LỊCH THÁNG TỰ ĐỘNG --- */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} color="#2563eb" />
            <span>Sinh lịch làm việc tháng tự động (Auto-Generate Monthly Schedule)</span>
          </div>
        }
        open={monthlyModalOpen}
        onCancel={() => setMonthlyModalOpen(false)}
        footer={null}
        width={620}
      >
        {!monthlyResult ? (
          <div>
            <Alert
              type="info"
              showIcon
              message="Nguyên lý hoạt động độc lập"
              description={
                <ul style={{ margin: '6px 0 0 0', paddingLeft: 18, fontSize: 12, lineHeight: 1.6 }}>
                  <li>
                    Hệ thống duyệt qua toàn bộ các ngày trong tháng đã chọn và so khớp với các <strong>Lịch Cố Định</strong> đang kích hoạt.
                  </li>
                  <li>
                    Lịch ngày được sinh ra mang nguồn: <strong>Lịch mẫu (TU_DONG_THEO_LICH_MAU)</strong>.
                  </li>
                  <li>
                    Các ca trực đã tồn tại sẵn trong ngày sẽ <strong>tự động được giữ nguyên</strong> (không sinh đè).
                  </li>
                  <li>
                    Sau khi sinh, lịch làm việc thực tế hoàn toàn <strong>độc lập</strong> với khuôn mẫu (quản trị viên có thể đổi ca, hủy ca tùy ý).
                  </li>
                </ul>
              }
              style={{ marginBottom: 18 }}
            />

            <Form layout="vertical">
              <Form.Item label="Chọn Tháng / Năm cần sinh lịch:" required>
                <DatePicker
                  picker="month"
                  value={monthlyMonth}
                  onChange={(val) => setMonthlyMonth(val)}
                  format="MM/YYYY"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item label="Áp dụng cho nhân viên (tùy chọn):">
                <Select
                  allowClear
                  placeholder="Tất cả nhân viên có lịch cố định trong khoa"
                  value={monthlyEmp}
                  onChange={(val) => setMonthlyEmp(val)}
                  showSearch
                  optionFilterProp="label"
                  options={employees.map((item) => ({
                    value: item.id,
                    label: `${item.hoTen} (@${item.username})`,
                  }))}
                />
              </Form.Item>

              <Button
                type="primary"
                icon={<Sparkles size={16} />}
                loading={generatingMonthly}
                onClick={handleGenerateMonthly}
                block
                style={{
                  height: 42,
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  borderColor: '#1d4ed8',
                  fontSize: 15,
                  fontWeight: 600,
                  borderRadius: 8,
                }}
              >
                Bắt đầu sinh lịch tháng
              </Button>
            </Form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <CheckCircle2 size={54} color="#16a34a" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ color: '#0f172a', marginBottom: 6 }}>Sinh Lịch Tháng Thành Công!</h3>
            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>
              Đã hoàn tất phân ca tháng {monthlyResult.thang}/{monthlyResult.nam} ({monthlyResult.totalDays} ngày)
            </p>

            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Card bordered={false} style={{ background: '#f0fdf4', borderRadius: 8 }}>
                  <Statistic
                    title={<span style={{ fontSize: 12, color: '#166534' }}>Ca sinh mới</span>}
                    value={monthlyResult.totalSchedulesGenerated}
                    valueStyle={{ color: '#16a34a', fontWeight: 700 }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false} style={{ background: '#f8fafc', borderRadius: 8 }}>
                  <Statistic
                    title={<span style={{ fontSize: 12, color: '#475569' }}>Ca đã có (Bỏ qua)</span>}
                    value={monthlyResult.totalSchedulesSkipped}
                    valueStyle={{ color: '#64748b', fontWeight: 600 }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false} style={{ background: '#eff6ff', borderRadius: 8 }}>
                  <Statistic
                    title={<span style={{ fontSize: 12, color: '#1e40af' }}>Nhân sự áp dụng</span>}
                    value={monthlyResult.totalEmployeesScheduled}
                    valueStyle={{ color: '#2563eb', fontWeight: 700 }}
                  />
                </Card>
              </Col>
            </Row>

            <Button
              type="primary"
              onClick={() => {
                setMonthlyModalOpen(false);
                setMonthlyResult(null);
              }}
              style={{ minWidth: 140, borderRadius: 8 }}
            >
              Hoàn tất & Đóng
            </Button>
          </div>
        )}
      </Modal>

      {/* --- MODAL 3: THÊM / SỬA LỊCH CỐ ĐỊNH LẺ --- */}
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
          <Button type="primary" htmlType="submit" block>
            Lưu lịch cố định
          </Button>
        </Form>
      </Modal>

      {/* --- MODAL 4: GÁN LỊCH HÀNG LOẠT --- */}
      <Modal title="Thêm nhiều lịch cố định" open={bulkOpen} onCancel={() => setBulkOpen(false)} footer={null}>
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
            <Form.Item name="tuNgay" label="Từ ngày" rules={[{ required: true }]} style={{ width: '50%' }}>
              <Input type="date" />
            </Form.Item>
            <Form.Item name="denNgay" label="Đến ngày" style={{ width: '50%' }}>
              <Input type="date" />
            </Form.Item>
          </Space.Compact>
          <Form.Item name="ghiChu" label="Ghi chú">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Tag color="blue">Hệ thống sẽ tạo một lịch cố định cho mỗi nhân viên, thứ và ca đã chọn.</Tag>
          <Button type="primary" htmlType="submit" block style={{ marginTop: 16 }}>
            Tạo lịch hàng loạt
          </Button>
        </Form>
      </Modal>

      {/* --- MODAL 5: SINH LỊCH THEO KHOẢNG NGÀY --- */}
      <Modal title="Sinh lịch ngày từ lịch cố định" open={generateOpen} onCancel={() => setGenerateOpen(false)} footer={null}>
        <Form
          form={generateForm}
          layout="vertical"
          onFinish={async (values) => {
            setGeneratePreview((await previewGenerate(values.tuNgay, values.denNgay)).data.data);
          }}
        >
          <Form.Item name="tuNgay" label="Từ ngày" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          <Form.Item name="denNgay" label="Đến ngày" rules={[{ required: true }]}>
            <Input type="date" />
          </Form.Item>
          <Tag color="blue">Lịch ngày đã tồn tại sẽ không bị tạo trùng.</Tag>
          {generatePreview && (
            <div style={{ marginTop: 16 }}>
              <p>Dự kiến tạo: <strong>{generatePreview.expectedCount}</strong></p>
              <p>Đã tồn tại: <strong>{generatePreview.existingCount}</strong></p>
              <p>Xung đột: <strong>{generatePreview.conflictCount}</strong></p>
              <p>Nhân viên không thuộc khoa: <strong>{generatePreview.unassignedEmployeeCount}</strong></p>
              <p>Ngoài thời hạn lịch cố định: <strong>{generatePreview.outsideEffectiveRangeCount}</strong></p>
              <Button
                type="primary"
                onClick={async () => {
                  const values = generateForm.getFieldsValue();
                  await generateSchedules(values.tuNgay, values.denNgay);
                  setGeneratePreview(null);
                  setGenerateOpen(false);
                }}
              >
                Xác nhận sinh lịch
              </Button>
            </div>
          )}
          {!generatePreview && (
            <Button type="primary" htmlType="submit" block style={{ marginTop: 16 }}>
              Xem trước
            </Button>
          )}
        </Form>
      </Modal>
    </div>
  );
};