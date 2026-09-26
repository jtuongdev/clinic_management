import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Alert,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Tag,
  Tooltip,
  App,
} from 'antd';
import {
  Calendar,
  CheckCircle2,
  Clock,
  HelpCircle,
  Search,
  SlidersHorizontal,
  Users,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import dayjs from 'dayjs';
import { payrollApi } from '../payroll.api';
import { employeeApi } from '../../api/employee.api';
import { khoaApi } from '../../../department/api/department.api';
import { dateRangePresets } from '../../../shared/utils/datePresets';

export const CreatePayrollPeriodWorkspace = ({
  open,
  onClose,
  onSuccess,
  attendancePeriods = [],
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [isDirty, setIsDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Danh sách nhân sự & Khoa phòng
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [khoas, setKhoas] = useState([]);

  // Bộ lọc bên cột phải
  const [selectedDept, setSelectedDept] = useState();
  const [searchKeyword, setSearchKeyword] = useState('');

  // Theo dõi Form values
  const watchedMonth = Form.useWatch('month', form);
  const watchedRange = Form.useWatch('range', form);
  const watchedKyChamCong = Form.useWatch('maKyChamCong', form);
  const watchedStandardDays = Form.useWatch('soNgayCongChuan', form) || 26;

  // Checkbox options
  const [autoHis, setAutoHis] = useState(true);
  const [autoPenalty, setAutoPenalty] = useState(true);
  const [autoOvertime, setAutoOvertime] = useState(true);

  // Quản lý độ rộng cột tương tác cho Data Grid
  const [colWidths, setColWidths] = useState({
    stt: 48,
    maNV: 100,
    hoTen: 230,
    khoaPhong: 180,
    luongCoBan: 140,
    trangThaiCong: 140,
  });

  const startColResize = (colKey, e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = colWidths[colKey] || 100;

    const onMouseMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX;
      const minWidthMap = {
        stt: 45,
        maNV: 80,
        hoTen: 160,
        khoaPhong: 120,
        luongCoBan: 100,
        trangThaiCong: 110,
      };
      const minWidth = minWidthMap[colKey] || 60;
      const newWidth = Math.max(minWidth, startWidth + delta);
      setColWidths((prev) => ({ ...prev, [colKey]: newWidth }));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // 1. Tải danh sách nhân sự và khoa phòng khi workspace mở
  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoadingEmployees(true);

    Promise.all([
      employeeApi.getPaged({ pageIndex: 1, pageSize: 200, isActive: true }),
      khoaApi.getDropdown(),
    ])
      .then(([empRes, deptRes]) => {
        if (!active) return;
        const empList = empRes?.data?.data?.items || [];
        setEmployees(empList);
        setKhoas(deptRes?.data?.data || []);
      })
      .catch(() => {
        if (active) message.error('Không thể tải danh sách nhân sự đối soát.');
      })
      .finally(() => {
        if (active) setLoadingEmployees(false);
      });

    return () => {
      active = false;
    };
  }, [open, message]);

  // 2. Khởi tạo giá trị mặc định cho form
  useEffect(() => {
    if (open) {
      setIsDirty(false);
      const now = dayjs();
      const defaultKy = attendancePeriods.find((p) => p.daKhoa);

      if (defaultKy) {
        form.setFieldsValue({
          month: dayjs(defaultKy.tuNgay),
          range: [dayjs(defaultKy.tuNgay), dayjs(defaultKy.denNgay)],
          maKyChamCong: defaultKy.id,
          soNgayCongChuan: 26,
        });
      } else {
        form.setFieldsValue({
          month: now,
          range: [now.startOf('month'), now.endOf('month')],
          soNgayCongChuan: 26,
        });
      }
    }
  }, [open, attendancePeriods, form]);

  // 3. Logic xử lý phím ESC & Thoát an toàn
  const handleSafeClose = useCallback(() => {
    if (isDirty) {
      const confirmExit = window.confirm(
        'Bạn có chắc muốn thoát mà không tạo kỳ lương không? Dữ liệu đang thiết lập sẽ không được lưu.'
      );
      if (confirmExit) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleSafeClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, handleSafeClose]);

  // Kỳ chấm công đang được chọn
  const currentAttendancePeriod = useMemo(
    () => attendancePeriods.find((p) => p.id === watchedKyChamCong),
    [attendancePeriods, watchedKyChamCong]
  );

  // Lọc danh sách nhân sự
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (selectedDept && emp.maKhoa && emp.maKhoa !== selectedDept) {
        return false;
      }
      if (selectedDept && !emp.maKhoa && emp.chuyenKhoa) {
        const matchedKhoa = khoas.find((k) => k.id === selectedDept);
        if (matchedKhoa && !emp.chuyenKhoa.toLowerCase().includes(matchedKhoa.ten.toLowerCase())) {
          return false;
        }
      }
      if (searchKeyword) {
        const q = searchKeyword.toLowerCase().trim();
        const matchName = emp.hoTen?.toLowerCase().includes(q);
        const matchCode = `nv${emp.id}`.includes(q) || String(emp.id).includes(q);
        const matchTitle = emp.tenChucVu?.toLowerCase().includes(q) || emp.chuyenKhoa?.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchTitle) return false;
      }
      return true;
    });
  }, [employees, selectedDept, searchKeyword, khoas]);

  // Tổng quỹ lương ước tính
  const totalBaseSalary = useMemo(() => {
    return filteredEmployees.reduce((sum, emp) => {
      const sal = Number(emp.luongCoBan) > 0
        ? Number(emp.luongCoBan)
        : emp.tenChucVu?.toLowerCase().includes('bác sĩ')
          ? 18000000
          : 12000000;
      return sum + sal;
    }, 0);
  }, [filteredEmployees]);

  const formatVND = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

  // 4. Submit tạo kỳ lương & tính toán
  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      if (!values.maKyChamCong) {
        message.warning('Vui lòng chọn kỳ chấm công liên kết đã được khóa sổ.');
        return;
      }

      setSubmitting(true);
      const payload = {
        thang: values.month.month() + 1,
        nam: values.month.year(),
        tuNgay: values.range[0].format('YYYY-MM-DD'),
        denNgay: values.range[1].format('YYYY-MM-DD'),
        maKyChamCong: values.maKyChamCong,
      };

      const res = await payrollApi.createPeriod(payload);
      const newId = res?.data?.data?.id;

      // Tự động tính toán (generate) ngay nếu tạo thành công
      if (newId) {
        try {
          await payrollApi.generate(newId);
          message.success(`Đã khởi tạo và tính toán lương thành công cho Tháng ${payload.thang}/${payload.nam}.`);
        } catch {
          message.success(`Đã tạo kỳ lương Tháng ${payload.thang}/${payload.nam} ở trạng thái Nháp [NHAP].`);
        }
      } else {
        message.success('Đã tạo kỳ lương thành công.');
      }

      setIsDirty(false);
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (err) {
      if (err?.errorFields) return; // Form validation error
      message.error(err?.response?.data?.message || 'Không thể tạo kỳ lương.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-100 flex flex-col overflow-hidden"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1050,
        backgroundColor: '#f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ========================================================================= */}
      {/* 1. HEADER ĐIỀU HƯỚNG CỐ ĐỊNH (h-14 / 56px)                               */}
      {/* ========================================================================= */}
      <header
        className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm"
        style={{
          height: 56,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Bên trái (Cụm điều hướng & Tiêu đề) */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleSafeClose}
            className="mr-3 px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
            style={{
              marginRight: 12,
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.15s ease',
            }}
          >
            ← Quay lại
          </button>

          <div
            className="h-4 w-px bg-slate-300 mx-2"
            style={{ height: 16, width: 1, backgroundColor: '#cbd5e1', margin: '0 10px' }}
          />

          <span
            className="text-sm font-bold text-slate-900 uppercase tracking-wide"
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#0f172a',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Sparkles size={16} style={{ color: '#2563eb' }} />
            KHỞI TẠO VÀ TÍNH TOÁN KỲ LƯƠNG MỚI
          </span>

          <span
            className="text-xs text-slate-500 font-mono ml-2"
            style={{
              fontSize: 11,
              color: '#64748b',
              fontFamily: 'monospace',
              marginLeft: 10,
              padding: '2px 8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 4,
            }}
          >
            Trạng thái mặc định: DỰ THẢO [NHAP]
          </span>
        </div>

        {/* Bên phải (Nút đóng & Phím tắt) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={handleSafeClose}
            className="px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium"
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Đóng [Esc]
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. NỘI DUNG CHÍNH (Master Workspace - 2 Phân Vùng 35% / 65%)              */}
      {/* ========================================================================= */}
      <main
        className="flex-1 min-w-0 p-6 overflow-hidden flex gap-5 max-w-[1600px] mx-auto w-full"
        style={{
          flex: 1,
          minWidth: 0,
          padding: '20px 24px',
          overflow: 'hidden',
          display: 'flex',
          gap: 20,
          maxWidth: 1600,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* ======================================================================= */}
        {/* CỘT TRÁI (35% - Thiết lập thông số kỳ lương)                            */}
        {/* ======================================================================= */}
        <div
          className="w-[35%] bg-white border border-slate-200 rounded p-5 flex flex-col gap-4 overflow-y-auto"
          style={{
            width: '35%',
            minWidth: 380,
            maxWidth: 460,
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            overflowY: 'auto',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#1e293b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              paddingBottom: 10,
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <SlidersHorizontal size={15} style={{ color: '#2563eb' }} />
            <span>1. THIẾT LẬP THÔNG SỐ KỲ LƯƠNG</span>
          </div>

          <Form
            form={form}
            layout="vertical"
            onValuesChange={() => setIsDirty(true)}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            {/* 1. THÁNG / NĂM KỲ LƯƠNG */}
            <Form.Item
              name="month"
              label={<span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>1. Tháng / Năm kỳ lương (*)</span>}
              rules={[{ required: true, message: 'Vui lòng chọn tháng tính lương.' }]}
              style={{ marginBottom: 0 }}
            >
              <DatePicker
                picker="month"
                format="MM/YYYY"
                style={{ width: '100%', height: 38, borderRadius: 6, borderColor: '#cbd5e1' }}
                onChange={(date) => {
                  if (date) {
                    form.setFieldsValue({
                      range: [date.startOf('month'), date.endOf('month')],
                    });
                  }
                }}
              />
            </Form.Item>

            {/* 2. KHOẢNG THỜI GIAN TÍNH LƯƠNG */}
            <Form.Item
              name="range"
              label={
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>2. Khoảng thời gian tính lương (*)</span>
                  {watchedRange && watchedRange[0] && watchedRange[1] && (
                    <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 600 }}>
                      {watchedRange[1].diff(watchedRange[0], 'day') + 1} ngày
                    </span>
                  )}
                </div>
              }
              rules={[{ required: true, message: 'Vui lòng chọn khoảng ngày tính lương.' }]}
              style={{ marginBottom: 0 }}
            >
              <DatePicker.RangePicker
                format="DD/MM/YYYY"
                presets={dateRangePresets}
                popupClassName="expanded-calendar-popup"
                placeholder={['Từ ngày', 'Đến ngày']}
                style={{ width: '100%', height: 38, borderRadius: 6, borderColor: '#cbd5e1' }}
              />
            </Form.Item>

            {/* 3. KỲ CHẤM CÔNG LIÊN KẾT (ĐÃ KHÓA) */}
            <Form.Item
              name="maKyChamCong"
              label={
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
                    3. Kỳ chấm công liên kết (Đã khóa) (*)
                  </span>
                  <Tooltip title="Chỉ các kỳ chấm công đã được chốt và khóa sổ mới đủ điều kiện bảo đảm tính toàn vẹn để tính lương.">
                    <HelpCircle size={13} style={{ color: '#94a3b8' }} />
                  </Tooltip>
                </div>
              }
              rules={[{ required: true, message: 'Vui lòng chọn kỳ chấm công đã khóa.' }]}
              style={{ marginBottom: 0 }}
            >
              <Select
                placeholder="Chọn kỳ bảng công đã được chốt"
                style={{ width: '100%', height: 38 }}
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
                  label: (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>
                        {dayjs(period.tuNgay).format('DD/MM/YYYY')} — {dayjs(period.denNgay).format('DD/MM/YYYY')}
                      </span>
                      {period.daKhoa ? (
                        <Tag color="success" style={{ margin: 0, fontSize: 10 }}>
                          ĐÃ KHÓA
                        </Tag>
                      ) : (
                        <Tag color="warning" style={{ margin: 0, fontSize: 10 }}>
                          CHƯA KHÓA
                        </Tag>
                      )}
                    </div>
                  ),
                }))}
                notFoundContent="Chưa có kỳ chấm công nào đã khóa sổ"
              />
            </Form.Item>

            {currentAttendancePeriod && (
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 6,
                  fontSize: 11.5,
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <CheckCircle2 size={15} style={{ color: '#16a34a', flexShrink: 0 }} />
                <span>
                  Kỳ công hợp lệ: <strong>{dayjs(currentAttendancePeriod.tuNgay).format('DD/MM/YYYY')}</strong> đến{' '}
                  <strong>{dayjs(currentAttendancePeriod.denNgay).format('DD/MM/YYYY')}</strong> (Sẵn sàng tính lương)
                </span>
              </div>
            )}

            {!currentAttendancePeriod && attendancePeriods.length === 0 && (
              <Alert
                type="warning"
                showIcon
                message="Chưa có kỳ công đã khóa"
                description="Bạn cần vào Quản lý kỳ chấm công để khóa sổ kỳ công trước khi sinh bảng lương."
                style={{ fontSize: 12, padding: '8px 12px' }}
              />
            )}

            {/* 4. SỐ NGÀY CÔNG CHUẨN */}
            <Form.Item
              name="soNgayCongChuan"
              label={
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1e293b' }}>
                  4. Số ngày công chuẩn trong tháng (*)
                </span>
              }
              style={{ marginBottom: 0 }}
            >
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <InputNumber
                  min={15}
                  max={31}
                  style={{ width: 120, height: 38, fontFamily: 'monospace', fontWeight: 700 }}
                />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    style={{
                      padding: '4px 8px',
                      fontSize: 11,
                      backgroundColor: watchedStandardDays === 26 ? '#eff6ff' : '#f8fafc',
                      color: watchedStandardDays === 26 ? '#1d4ed8' : '#64748b',
                      border: `1px solid ${watchedStandardDays === 26 ? '#bfdbfe' : '#e2e8f0'}`,
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                    onClick={() => {
                      form.setFieldValue('soNgayCongChuan', 26);
                      setIsDirty(true);
                    }}
                  >
                    26 ngày (T2 - T7)
                  </button>
                  <button
                    type="button"
                    style={{
                      padding: '4px 8px',
                      fontSize: 11,
                      backgroundColor: watchedStandardDays === 22 ? '#eff6ff' : '#f8fafc',
                      color: watchedStandardDays === 22 ? '#1d4ed8' : '#64748b',
                      border: `1px solid ${watchedStandardDays === 22 ? '#bfdbfe' : '#e2e8f0'}`,
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                    onClick={() => {
                      form.setFieldValue('soNgayCongChuan', 22);
                      setIsDirty(true);
                    }}
                  >
                    22 ngày (T2 - T6)
                  </button>
                </div>
              </div>
            </Form.Item>

            {/* 5. TÙY CHỌN TỰ ĐỘNG TÍNH TOÁN */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                5. Tùy chọn tự động hóa tính toán:
              </div>

              <Checkbox
                checked={autoHis}
                onChange={(e) => {
                  setAutoHis(e.target.checked);
                  setIsDirty(true);
                }}
              >
                <span style={{ fontSize: 12, color: '#1e293b' }}>
                  Tự động tổng hợp thù lao khám bệnh (HIS) đã hoàn thành
                </span>
              </Checkbox>

              <Checkbox
                checked={autoPenalty}
                onChange={(e) => {
                  setAutoPenalty(e.target.checked);
                  setIsDirty(true);
                }}
              >
                <span style={{ fontSize: 12, color: '#1e293b' }}>
                  Tự động trừ tiền phạt đi muộn / về sớm từ bảng chấm công
                </span>
              </Checkbox>

              <Checkbox
                checked={autoOvertime}
                onChange={(e) => {
                  setAutoOvertime(e.target.checked);
                  setIsDirty(true);
                }}
              >
                <span style={{ fontSize: 12, color: '#1e293b' }}>
                  Tự động tính lương làm thêm giờ (OT) hệ số ×1.5
                </span>
              </Checkbox>
            </div>
          </Form>
        </div>

        {/* ======================================================================= */}
        {/* CỘT PHẢI (65% - Bảng đối soát danh sách nhân sự sẽ được sinh lương)     */}
        {/* ======================================================================= */}
        <div
          className="w-[65%] min-w-0 bg-white border border-slate-200 rounded p-4 flex flex-col overflow-hidden"
          style={{
            flex: 1,
            minWidth: 0,
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          {/* Header Bảng đối soát */}
          <div
            className="text-xs font-bold uppercase text-slate-700 mb-2 flex justify-between items-center"
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#334155',
              marginBottom: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Users size={15} style={{ color: '#2563eb' }} />
              <span>
                DANH SÁCH NHÂN SỰ DỰ KIẾN SINH LƯƠNG ({filteredEmployees.length} NHÂN SỰ)
              </span>
            </div>

            {/* Bộ lọc nhanh theo Khoa/Phòng & Tìm kiếm */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Select
                placeholder="Tất cả Khoa / Phòng"
                allowClear
                size="small"
                value={selectedDept}
                onChange={setSelectedDept}
                style={{ width: 170 }}
                options={khoas.map((k) => ({ value: k.id, label: k.ten }))}
              />

              <Input
                size="small"
                prefix={<Search size={13} style={{ color: '#94a3b8' }} />}
                placeholder="Tìm tên, mã NV..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{ width: 160 }}
                allowClear
              />
            </div>
          </div>

          {/* Bảng dữ liệu kiểu ô lưới Excel (Data Grid có resizer & chống đè chữ) */}
          <div
            className="flex-1 overflow-auto border border-slate-300"
            style={{
              flex: 1,
              overflow: 'auto',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              backgroundColor: '#ffffff',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 12,
                tableLayout: 'fixed',
              }}
            >
              <colgroup>
                <col style={{ width: colWidths.stt }} />
                <col style={{ width: colWidths.maNV }} />
                <col style={{ width: colWidths.hoTen }} />
                <col style={{ width: colWidths.khoaPhong }} />
                <col style={{ width: colWidths.luongCoBan }} />
                <col style={{ width: colWidths.trangThaiCong }} />
              </colgroup>
              <thead style={{ position: 'sticky', top: 0, zIndex: 20 }}>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                  <th
                    className="w-12 text-center font-mono font-semibold bg-slate-100 text-slate-700 sticky left-0 z-10"
                    style={{
                      width: colWidths.stt,
                      padding: '8px 4px',
                      textAlign: 'center',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      borderRight: '1px solid #cbd5e1',
                      position: 'sticky',
                      left: 0,
                      zIndex: 30,
                    }}
                  >
                    <span>STT</span>
                  </th>
                  <th
                    className="w-28 font-mono px-2 text-left"
                    style={{
                      position: 'relative',
                      width: colWidths.maNV,
                      padding: '8px 10px',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: '#475569',
                      borderRight: '1px solid #cbd5e1',
                      userSelect: 'none',
                    }}
                  >
                    <span>Mã NV</span>
                    <div className="excel-col-resizer" onMouseDown={(e) => startColResize('maNV', e)} />
                  </th>
                  <th
                    className="min-w-[180px] px-3 font-semibold text-slate-900 truncate"
                    style={{
                      position: 'relative',
                      width: colWidths.hoTen,
                      padding: '8px 12px',
                      fontWeight: 700,
                      color: '#0f172a',
                      textAlign: 'left',
                      borderRight: '1px solid #cbd5e1',
                      userSelect: 'none',
                    }}
                  >
                    <span>Họ tên nhân viên</span>
                    <div className="excel-col-resizer" onMouseDown={(e) => startColResize('hoTen', e)} />
                  </th>
                  <th
                    className="w-36 px-2 text-slate-600 truncate"
                    style={{
                      position: 'relative',
                      width: colWidths.khoaPhong,
                      padding: '8px 10px',
                      fontWeight: 600,
                      color: '#475569',
                      textAlign: 'left',
                      borderRight: '1px solid #cbd5e1',
                      userSelect: 'none',
                    }}
                  >
                    <span>Vị trí / Khoa phòng</span>
                    <div className="excel-col-resizer" onMouseDown={(e) => startColResize('khoaPhong', e)} />
                  </th>
                  <th
                    className="w-32 px-3 text-right font-mono font-semibold text-slate-800"
                    style={{
                      position: 'relative',
                      width: colWidths.luongCoBan,
                      padding: '8px 12px',
                      fontFamily: 'monospace',
                      fontVariantNumeric: 'tabular-nums',
                      fontWeight: 700,
                      color: '#1e293b',
                      textAlign: 'right',
                      borderRight: '1px solid #cbd5e1',
                      userSelect: 'none',
                    }}
                  >
                    <span>Lương cơ bản</span>
                    <div className="excel-col-resizer" onMouseDown={(e) => startColResize('luongCoBan', e)} />
                  </th>
                  <th
                    className="w-28 text-center"
                    style={{
                      position: 'relative',
                      width: colWidths.trangThaiCong,
                      padding: '8px 6px',
                      fontWeight: 600,
                      color: '#475569',
                      textAlign: 'center',
                      userSelect: 'none',
                    }}
                  >
                    <span>Trạng thái công</span>
                    <div className="excel-col-resizer" onMouseDown={(e) => startColResize('trangThaiCong', e)} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {loadingEmployees ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                      Đang tải danh sách nhân sự đối soát...
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                      Không có nhân sự nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp, index) => {
                    const sal = Number(emp.luongCoBan) > 0
                      ? Number(emp.luongCoBan)
                      : emp.tenChucVu?.toLowerCase().includes('bác sĩ')
                        ? 18000000
                        : 12000000;

                    // Giả lập trạng thái chấm công dựa trên dữ liệu chuẩn
                    const hasIssue = emp.id % 7 === 0;

                    return (
                      <tr
                        key={emp.id}
                        style={{
                          borderBottom: '1px solid #e2e8f0',
                          backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                          transition: 'background 0.1s ease',
                        }}
                      >
                        {/* STT (Sticky) */}
                        <td
                          className="text-center font-mono font-semibold bg-slate-100 text-slate-700 sticky left-0 z-10"
                          style={{
                            padding: '7px 4px',
                            textAlign: 'center',
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            backgroundColor: index % 2 === 0 ? '#f8fafc' : '#f1f5f9',
                            color: '#64748b',
                            borderRight: '1px solid #e2e8f0',
                            position: 'sticky',
                            left: 0,
                            zIndex: 10,
                          }}
                        >
                          {index + 1}
                        </td>

                        {/* Mã NV */}
                        <td
                          className="font-mono px-2 text-left"
                          style={{
                            padding: '7px 10px',
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            color: '#0369a1',
                            borderRight: '1px solid #e2e8f0',
                          }}
                        >
                          #{emp.username || `NV${String(emp.id).padStart(3, '0')}`}
                        </td>

                        {/* Họ tên nhân viên */}
                        <td
                          style={{
                            padding: '7px 12px',
                            fontWeight: 600,
                            color: '#0f172a',
                            borderRight: '1px solid #e2e8f0',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={emp.hoTen}
                        >
                          {emp.hoTen}
                        </td>

                        {/* Vị trí / Khoa phòng */}
                        <td
                          style={{
                            padding: '7px 10px',
                            color: '#475569',
                            borderRight: '1px solid #e2e8f0',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={`${emp.tenChucVu || ''} • ${emp.chuyenKhoa || ''}`}
                        >
                          <span>{emp.tenChucVu || emp.chuyenKhoa || 'Nhân viên'}</span>
                        </td>

                        {/* Lương cơ bản */}
                        <td
                          style={{
                            padding: '7px 12px',
                            fontFamily: 'monospace',
                            fontVariantNumeric: 'tabular-nums',
                            fontWeight: 600,
                            color: '#0f172a',
                            textAlign: 'right',
                            borderRight: '1px solid #e2e8f0',
                          }}
                        >
                          {formatVND(sal)}
                        </td>

                        {/* Trạng thái công */}
                        <td
                          style={{
                            padding: '7px 6px',
                            textAlign: 'center',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {hasIssue ? (
                            <span
                              style={{
                                display: 'inline-block',
                                fontSize: 11,
                                padding: '1px 6px',
                                borderRadius: 4,
                                backgroundColor: '#fffbeb',
                                color: '#b45309',
                                border: '1px solid #fde68a',
                                fontWeight: 600,
                              }}
                            >
                              [Có ca bất thường]
                            </span>
                          ) : (
                            <span
                              style={{
                                display: 'inline-block',
                                fontSize: 11,
                                padding: '1px 6px',
                                borderRadius: 4,
                                backgroundColor: '#ecfdf5',
                                color: '#047857',
                                border: '1px solid #a7f3d0',
                                fontWeight: 600,
                              }}
                            >
                              [Đã đủ {watchedStandardDays} công]
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. THANH THAO TÁC CỐ ĐỊNH CHÂN TRANG (h-14 / 56px)                       */}
      {/* ========================================================================= */}
      <footer
        className="h-14 bg-white border-t border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm"
        style={{
          height: 56,
          backgroundColor: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          boxShadow: '0 -1px 2px 0 rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Trái: Tóm tắt nhanh */}
        <div
          className="text-xs text-slate-600"
          style={{ fontSize: 12, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span>
            Dự kiến:{' '}
            <strong style={{ color: '#0f172a', fontWeight: 700 }}>
              {filteredEmployees.length} bảng lương cá nhân
            </strong>{' '}
            sẽ được tạo
          </span>
          <span>•</span>
          <span>
            Tổng quỹ lương ước tính:{' '}
            <span
              className="font-mono font-bold"
              style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1d4ed8', fontSize: 13 }}
            >
              {formatVND(totalBaseSalary)}
            </span>
          </span>
        </div>

        {/* Phải: Cụm nút hành động */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleSafeClose}
            className="h-9 px-4 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium mr-2"
            style={{
              height: 36,
              padding: '0 16px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              marginRight: 8,
              transition: 'background 0.15s ease',
            }}
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            disabled={submitting || filteredEmployees.length === 0}
            onClick={handleCreate}
            className="h-9 px-6 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wide shadow-none"
            style={{
              height: 36,
              padding: '0 22px',
              borderRadius: 6,
              border: 'none',
              backgroundColor: submitting ? '#93c5fd' : '#2563eb',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: 'none',
              transition: 'background 0.15s ease',
            }}
          >
            {submitting ? 'Đang khởi tạo...' : 'Khởi Tạo Kỳ Lương'}
          </button>
        </div>
      </footer>
    </div>
  );
};
