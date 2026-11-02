import { useCallback, useEffect, useState, useMemo } from 'react';
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
import { HolderOutlined, SearchOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useExcelGridResizer } from '../../../shared/hooks/useExcelGridResizer';
import '../../../styles/excel-grid.css';

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
  const [weeklyDirty, setWeeklyDirty] = useState(false);

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
    setWeeklyDirty(false);
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
    setWeeklyDirty(true);
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
    setWeeklyDirty(true);
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
      setWeeklyDirty(false);
      setWeeklyModalOpen(false);
    } finally {
      setSavingWeekly(false);
    }
  };

  const handleCloseWeekly = useCallback(() => {
    if (weeklyDirty && !window.confirm('Các thay đổi chưa được lưu sẽ bị mất. Bạn có chắc muốn đóng form không?')) {
      return;
    }
    setWeeklyModalOpen(false);
  }, [weeklyDirty]);

  useEffect(() => {
    if (!weeklyModalOpen) return undefined;
    const handleEscape = (event) => {
      if (event.key === 'Escape') handleCloseWeekly();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [weeklyModalOpen, handleCloseWeekly]);

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

  const ALL_COLUMNS = [
    { key: 'stt', label: 'STT', align: 'center', isFixed: true },
    { key: 'tenNhanVien', label: 'NHÂN VIÊN', align: 'left' },
    { key: 'thuTrongTuan', label: 'THỨ', align: 'center' },
    { key: 'tenCa', label: 'CA TRỰC', align: 'center' },
    { key: 'tenPhongKham', label: 'PHÒNG KHÁM', align: 'center' },
    { key: 'isActive', label: 'TRẠNG THÁI', align: 'center' },
    { key: 'hieuLuc', label: 'HIỆU LỰC', align: 'center' },
    { key: 'thaoTac', label: 'THAO TÁC', align: 'center', isFixed: true },
  ];

  const DEFAULT_COL_ORDER = [
    'stt',
    'tenNhanVien',
    'thuTrongTuan',
    'tenCa',
    'tenPhongKham',
    'isActive',
    'hieuLuc',
    'thaoTac',
  ];

  const [searchKeyword, setSearchKeyword] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [dayFilter, setDayFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const { colWidths, startColResize } = useExcelGridResizer({
    stt: 50,
    tenNhanVien: 200,
    thuTrongTuan: 110,
    tenCa: 130,
    tenPhongKham: 160,
    isActive: 130,
    hieuLuc: 180,
    thaoTac: 180,
  });

  const [colOrder, setColOrder] = useState(DEFAULT_COL_ORDER);
  const [draggedCol, setDraggedCol] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const handleColDragStart = (e, colKey) => {
    if (colKey === 'stt' || colKey === 'thaoTac') return;
    setDraggedCol(colKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColDragOver = (e, colKey) => {
    e.preventDefault();
    if (colKey === 'stt' || colKey === 'thaoTac' || !draggedCol || draggedCol === colKey) return;
    setDragOverCol(colKey);
  };

  const handleColDrop = (e, targetCol) => {
    e.preventDefault();
    if (!draggedCol || draggedCol === targetCol || targetCol === 'stt' || targetCol === 'thaoTac') {
      setDraggedCol(null);
      setDragOverCol(null);
      return;
    }
    const newOrder = [...colOrder];
    const fromIdx = newOrder.indexOf(draggedCol);
    const toIdx = newOrder.indexOf(targetCol);
    if (fromIdx !== -1 && toIdx !== -1) {
      newOrder.splice(fromIdx, 1);
      newOrder.splice(toIdx, 0, draggedCol);
      setColOrder(newOrder);
    }
    setDraggedCol(null);
    setDragOverCol(null);
  };

  // TDZ-safe: displayedSchedules before orderedSchedules
  const displayedSchedules = useMemo(() => {
    let list = fixedSchedules || [];
    if (dayFilter !== '') {
      list = list.filter((item) => String(item.thuTrongTuan) === String(dayFilter));
    }
    if (statusFilter !== '') {
      list = list.filter((item) => (statusFilter === 'active' ? item.isActive !== false : item.isActive === false));
    }
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase().trim();
      list = list.filter((item) =>
        item.tenNhanVien?.toLowerCase().includes(q) ||
        item.tenCa?.toLowerCase().includes(q) ||
        item.tenPhongKham?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [fixedSchedules, dayFilter, statusFilter, searchKeyword]);

  // Row reordering
  const [orderedSchedules, setOrderedSchedules] = useState([]);
  const [draggedRowId, setDraggedRowId] = useState(null);

  useEffect(() => {
    setOrderedSchedules(displayedSchedules);
  }, [displayedSchedules]);

  const handleRowDragStart = (e, id) => {
    setDraggedRowId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleRowDragOver = (e) => {
    e.preventDefault();
  };

  const handleRowDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggedRowId || draggedRowId === targetId) {
      setDraggedRowId(null);
      return;
    }
    const current = [...orderedSchedules];
    const fromIdx = current.findIndex((i) => i.id === draggedRowId);
    const toIdx = current.findIndex((i) => i.id === targetId);
    if (fromIdx !== -1 && toIdx !== -1) {
      const [moved] = current.splice(fromIdx, 1);
      current.splice(toIdx, 0, moved);
      setOrderedSchedules(current);
    }
    setDraggedRowId(null);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchKeyword(keywordInput);
    setPageIndex(1);
  };

  const renderCellContent = (colKey, row, index) => {
    switch (colKey) {
      case 'stt':
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <span title="Kéo thả đổi vị trí dòng" style={{ cursor: 'grab', color: '#94a3b8' }}>
              <HolderOutlined style={{ fontSize: 11 }} />
            </span>
            <span style={{ fontWeight: 600, color: '#475569' }}>
              {(pageIndex - 1) * pageSize + index + 1}
            </span>
          </div>
        );

      case 'tenNhanVien':
        return (
          <span
            style={{ fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}
            title={row.tenNhanVien}
          >
            {row.tenNhanVien || `NV #${row.maNhanVien}`}
          </span>
        );

      case 'thuTrongTuan':
        return (
          <Tag color={row.thuTrongTuan === 0 ? 'magenta' : 'geekblue'} style={{ margin: 0, fontSize: 11 }}>
            {getDayName(row.thuTrongTuan) || row.thuTrongTuan}
          </Tag>
        );

      case 'tenCa':
        return <Tag color="blue" style={{ margin: 0, fontSize: 11 }}>{row.tenCa || 'Ca trực'}</Tag>;

      case 'tenPhongKham':
        return row.tenPhongKham ? <Tag color="cyan" style={{ margin: 0, fontSize: 11 }}>{row.tenPhongKham}</Tag> : <span style={{ color: '#94a3b8' }}>-</span>;

      case 'isActive':
        return (
          <Tag color={row.isActive !== false ? 'green' : 'default'} style={{ margin: 0, fontSize: 11 }}>
            {row.isActive !== false ? 'Đang áp dụng' : 'Tạm dừng'}
          </Tag>
        );

      case 'hieuLuc':
        return (
          <span style={{ fontSize: 12, color: '#475569', whiteSpace: 'nowrap' }}>
            {dayjs(row.tuNgay).format('DD/MM/YYYY')} -{' '}
            {row.denNgay ? dayjs(row.denNgay).format('DD/MM/YYYY') : 'Vô thời hạn'}
          </span>
        );

      case 'thaoTac':
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Button size="small" style={{ fontSize: 11, height: 24, padding: '0 8px' }} onClick={() => openFixedModal(row)}>
              Sửa
            </Button>
            <Button
              size="small"
              icon={<CalendarCheck size={12} />}
              style={{ fontSize: 11, height: 24, padding: '0 8px' }}
              onClick={() => openWeeklyMatrixModal(row.maNhanVien)}
            >
              Lịch tuần
            </Button>
            <Button size="small" danger style={{ fontSize: 11, height: 24, padding: '0 8px' }} onClick={() => removeFixed(row.id)}>
              Xóa
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const totalRecords = displayedSchedules.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedSchedules = orderedSchedules.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
  const startItemIdx = totalRecords === 0 ? 0 : (pageIndex - 1) * pageSize + 1;
  const endItemIdx = Math.min(pageIndex * pageSize, totalRecords);

  return (
    <div className="fixed-schedule-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
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

      {/* ── HIGH DENSITY TOOLBAR ────────────────────────────────────────────── */}
      <div
        style={{
          minHeight: 44,
          padding: '6px 14px',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          flexShrink: 0,
          marginTop: 8,
          marginBottom: 10,
          borderRadius: 6,
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 5,
                padding: '0 8px',
                height: 30,
                gap: 6,
                width: 220,
              }}
            >
              <SearchOutlined style={{ fontSize: 13, color: '#94a3b8' }} />
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="Tìm nhân viên, ca, phòng..."
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: 12,
                  color: '#0f172a',
                  width: '100%',
                }}
              />
              {keywordInput && (
                <button
                  type="button"
                  onClick={() => {
                    setKeywordInput('');
                    setSearchKeyword('');
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Xoá tìm kiếm"
                >
                  <CloseOutlined style={{ fontSize: 10 }} />
                </button>
              )}
            </div>
            <button
              type="submit"
              style={{
                height: 30,
                padding: '0 10px',
                borderRadius: 5,
                border: 'none',
                background: '#0b4f6c',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Lọc
            </button>
          </form>

          <select
            value={dayFilter}
            onChange={(e) => {
              setDayFilter(e.target.value);
              setPageIndex(1);
            }}
            style={{
              height: 30,
              borderRadius: 5,
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: 12,
              color: '#334155',
              padding: '0 8px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">Tất cả các thứ</option>
            <option value="1">Thứ 2</option>
            <option value="2">Thứ 3</option>
            <option value="3">Thứ 4</option>
            <option value="4">Thứ 5</option>
            <option value="5">Thứ 6</option>
            <option value="6">Thứ 7</option>
            <option value="0">Chủ nhật</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPageIndex(1);
            }}
            style={{
              height: 30,
              borderRadius: 5,
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: 12,
              color: '#334155',
              padding: '0 8px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang áp dụng</option>
            <option value="inactive">Tạm dừng</option>
          </select>

          {(searchKeyword || keywordInput || dayFilter || statusFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchKeyword('');
                setKeywordInput('');
                setDayFilter('');
                setStatusFilter('');
                setPageIndex(1);
              }}
              style={{
                height: 30,
                padding: '0 8px',
                borderRadius: 5,
                border: '1px dashed #ef4444',
                background: '#fef2f2',
                color: '#ef4444',
                fontSize: 12,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
              title="Khôi phục bộ lọc"
            >
              <CloseOutlined style={{ fontSize: 10 }} />
              <span>Đặt lại</span>
            </button>
          )}
        </div>

        <div>
          <span
            style={{
              fontSize: 12,
              color: '#475569',
              background: '#f1f5f9',
              padding: '3px 8px',
              borderRadius: 4,
              border: '1px solid #e2e8f0',
            }}
          >
            Tổng: <strong>{totalRecords}</strong> lịch cố định
          </span>
        </div>
      </div>

      {/* ── EXCEL DATA GRID CONTAINER (RESIZE, REORDER) ───────────────────────── */}
      <div
        className="w-full flex-1 min-h-0 bg-white border border-slate-300 rounded-lg shadow-sm overflow-x-auto overflow-y-auto excel-grid-container"
        style={{ margin: 0 }}
      >
        <table className="excel-table w-full min-w-full">
          <colgroup>
            {colOrder.map((colKey) => (
              <col
                key={colKey}
                style={{
                  width: colWidths[colKey] || 100,
                  minWidth: colKey === 'thaoTac' ? colWidths.thaoTac : undefined,
                }}
              />
            ))}
          </colgroup>

          {/* Sticky Header */}
          <thead style={{ position: 'sticky', top: 0, zIndex: 15 }}>
            <tr className="h-9">
              {colOrder.map((colKey) => {
                const colDef = ALL_COLUMNS.find((c) => c.key === colKey);
                if (!colDef) return null;
                const isDragging = draggedCol === colKey;
                const isDragOver = dragOverCol === colKey;
                const isFixed = colDef.isFixed;

                return (
                  <th
                    key={colKey}
                    className={`${colKey === 'stt' ? 'col-stt' : ''} text-${colDef.align}`}
                    style={{
                      width: colWidths[colKey] || 100,
                      cursor: !isFixed ? 'grab' : 'default',
                      userSelect: 'none',
                      backgroundColor: isDragging ? '#e2e8f0' : undefined,
                      borderLeft: isDragOver ? '2px solid #2563eb' : undefined,
                    }}
                    draggable={!isFixed}
                    onDragStart={(e) => handleColDragStart(e, colKey)}
                    onDragOver={(e) => handleColDragOver(e, colKey)}
                    onDrop={(e) => handleColDrop(e, colKey)}
                    title={!isFixed ? 'Bấm giữ và kéo thả để đổi thứ tự cột' : undefined}
                  >
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        width: '100%',
                        justifyContent:
                          colDef.align === 'center'
                            ? 'center'
                            : colDef.align === 'right'
                            ? 'flex-end'
                            : 'flex-start',
                      }}
                    >
                      {!isFixed && (
                        <HolderOutlined style={{ fontSize: 10, color: '#94a3b8', cursor: 'grab' }} />
                      )}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {colDef.label}
                      </span>
                    </div>
                    <div className="col-resizer" onMouseDown={(e) => startColResize(colKey, e)} />
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Dữ liệu các dòng */}
          <tbody>
            {fixedLoading ? (
              <tr>
                <td colSpan={colOrder.length} style={{ padding: 40, textAlign: 'center', background: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#64748b' }}>
                    <span style={{ fontSize: 18 }}>⏳</span>
                    <span>Đang nạp dữ liệu lịch cố định...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedSchedules.length === 0 ? (
              <tr>
                <td colSpan={colOrder.length} style={{ padding: 40, textAlign: 'center', background: '#fff' }}>
                  <span style={{ color: '#64748b', fontSize: 13 }}>Chưa có khuôn mẫu lịch cố định nào phù hợp.</span>
                </td>
              </tr>
            ) : (
              paginatedSchedules.map((row, index) => {
                const isRowDragging = draggedRowId === row.id;
                return (
                  <tr
                    key={row.id}
                    className="h-9 hover:bg-slate-50 transition-colors"
                    style={{
                      opacity: isRowDragging ? 0.35 : 1,
                      backgroundColor: isRowDragging ? '#f1f5f9' : undefined,
                    }}
                    draggable
                    onDragStart={(e) => handleRowDragStart(e, row.id)}
                    onDragOver={handleRowDragOver}
                    onDrop={(e) => handleRowDrop(e, row.id)}
                  >
                    {colOrder.map((colKey) => {
                      const colDef = ALL_COLUMNS.find((c) => c.key === colKey);
                      if (!colDef) return null;
                      return (
                        <td
                          key={colKey}
                          className={`${colKey === 'stt' ? 'col-stt' : ''} text-${colDef.align}`}
                          style={{
                            width: colWidths[colKey] || 100,
                            padding: '4px 8px',
                            verticalAlign: 'middle',
                          }}
                        >
                          {renderCellContent(colKey, row, index)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── FOOTER PAGINATION BAR ────────────────────────────────────────────── */}
      <div
        style={{
          height: 40,
          minHeight: 40,
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          padding: '0 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          marginTop: 8,
          borderRadius: 6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Hiển thị <strong>{startItemIdx}</strong> - <strong>{endItemIdx}</strong> /{' '}
            <strong>{totalRecords}</strong> lịch cố định
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>Cỡ trang:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageIndex(1);
              }}
              style={{
                height: 26,
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: 12,
                color: '#334155',
                padding: '0 6px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value={10}>10 dòng</option>
              <option value={15}>15 dòng</option>
              <option value={30}>30 dòng</option>
              <option value={50}>50 dòng</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              disabled={pageIndex <= 1}
              onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
              style={{
                height: 26,
                padding: '0 8px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: 12,
                color: '#334155',
                cursor: pageIndex <= 1 ? 'not-allowed' : 'pointer',
                opacity: pageIndex <= 1 ? 0.4 : 1,
              }}
              title="Trang trước"
            >
              ‹ Trước
            </button>

            <span style={{ fontSize: 12, color: '#475569' }}>
              Trang <strong>{pageIndex}</strong> / <strong>{totalPages}</strong>
            </span>

            <button
              type="button"
              disabled={pageIndex >= totalPages}
              onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
              style={{
                height: 26,
                padding: '0 8px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: 12,
                color: '#334155',
                cursor: pageIndex >= totalPages ? 'not-allowed' : 'pointer',
                opacity: pageIndex >= totalPages ? 0.4 : 1,
              }}
              title="Trang sau"
            >
              Sau ›
            </button>
          </div>
        </div>
      </div>

      {/* --- MODAL 1: CẤU HÌNH LỊCH TUẦN NHÂN VIÊN (WEEKLY MATRIX) --- */}
      {weeklyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col overflow-hidden">
          <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center min-w-0">
              <button
                type="button"
                onClick={handleCloseWeekly}
                className="mr-3 px-2.5 py-1.5 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
              >
                ← Quay lại
              </button>
              <span className="h-4 w-px bg-slate-300 mx-2" />
              <UserCheck size={17} color="#0284c7" className="mr-2 shrink-0" />
              <span className="text-sm font-bold text-slate-900 uppercase tracking-wide truncate">
                Cấu hình lịch làm việc cố định
              </span>
              {selectedWeeklyEmp && (
                <span className="text-xs text-slate-500 font-mono ml-2 truncate">
                  Nhân viên: {employees.find((item) => item.id === selectedWeeklyEmp)?.hoTen || `#${selectedWeeklyEmp}`}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleCloseWeekly}
              className="px-3 py-1.5 rounded border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium flex items-center gap-1.5 shrink-0"
            >
              Đóng [Esc]
            </button>
          </header>

          <main className="flex-1 min-w-0 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
            <section className="bg-white border border-slate-200 rounded-lg p-5 mb-5">
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
            </section>

            <section className="bg-white border border-slate-200 rounded-lg p-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Ma trận ca theo tuần</h3>
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
            </section>
          </main>

          <footer className="h-14 bg-white border-t border-slate-200 px-6 flex items-center justify-between shrink-0">
            <span className={`text-xs font-medium ${weeklyDirty ? 'text-amber-700' : 'text-slate-500'}`}>
              {weeklyDirty ? 'Chưa lưu thay đổi' : 'Đã đồng bộ lịch tuần'}
            </span>
            <div>
              <button
                type="button"
                onClick={handleCloseWeekly}
                className="h-9 px-4 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium mr-2"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={submitWeeklyMatrix}
                disabled={savingWeekly}
                className="h-9 px-5 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold shadow-none"
              >
                {savingWeekly ? 'Đang lưu...' : 'Lưu cấu hình'}
              </button>
            </div>
          </footer>
        </div>
      )}

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
                    Ngày đã có lịch được xếp trước hoặc có đơn nghỉ phép đã duyệt sẽ <strong>được bỏ qua an toàn</strong>; hệ thống không tạo ca trùng hoặc ghi đè.
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
                    title={<span style={{ fontSize: 12, color: '#475569' }}>Ca đã có / nghỉ phép (Bỏ qua)</span>}
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
            <Alert
              type="warning"
              showIcon
              message="Các ca bị bỏ qua không phải lỗi"
              description="Số ca bỏ qua bao gồm ngày đã có lịch trước đó hoặc ngày nhân viên có đơn nghỉ phép đã được duyệt. Bạn có thể kiểm tra lại tại Bảng chấm công trước khi chốt kỳ."
              style={{ textAlign: 'left', marginBottom: 20 }}
            />

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
            <Select
              showSearch
              optionFilterProp="label"
              options={employees.map((item) => ({ value: item.id, label: `${item.hoTen} (@${item.maNhanVien || item.username}) - ${item.chucVu || 'Nhân viên'}` }))}
            />
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
            <Select
              mode="multiple"
              showSearch
              optionFilterProp="label"
              options={employees.map((item) => ({ value: item.id, label: `${item.hoTen} (@${item.maNhanVien || item.username}) - ${item.chucVu || 'Nhân viên'}` }))}
            />
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