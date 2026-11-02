import { useState, useEffect, useMemo } from 'react';
import { Button, Tag, Tooltip } from 'antd';
import { HolderOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { AttendanceQuickClock } from '../components/attendance/AttendanceQuickClock';
import { AttendanceFilterToolbar } from '../components/attendance/AttendanceFilterToolbar';
import { AttendanceAdjustmentModal } from '../components/attendance/AttendanceAdjustmentModal';
import { AttendanceAdjustmentsListModal } from '../components/attendance/AttendanceAdjustmentsListModal';
import { AttendancePeriodModal } from '../components/attendance/AttendancePeriodModal';
import { useExcelGridResizer } from '../../../shared/hooks/useExcelGridResizer';
import '../../../styles/excel-grid.css';

const ALL_COLUMNS = [
  { key: 'stt', label: 'STT', align: 'center', isFixed: true },
  { key: 'ngayLam', label: 'NGÀY', align: 'center' },
  { key: 'tenNhanVien', label: 'NHÂN VIÊN', align: 'left' },
  { key: 'tenCa', label: 'CA LÀM VIỆC', align: 'left' },
  { key: 'checkIn', label: 'CHECK-IN', align: 'center' },
  { key: 'checkOut', label: 'CHECK-OUT', align: 'center' },
  { key: 'trangThai', label: 'TRẠNG THÁI', align: 'center' },
  { key: 'diMuon', label: 'ĐI MUỘN', align: 'right' },
  { key: 'veSom', label: 'VỀ SỚM', align: 'right' },
  { key: 'gioThucTe', label: 'GIỜ THỰC TẾ', align: 'right' },
  { key: 'dieuChinh', label: 'ĐIỀU CHỈNH', align: 'center' },
  { key: 'thaoTac', label: 'THAO TÁC', align: 'center', isFixed: true },
];

const DEFAULT_COL_ORDER = [
  'stt',
  'ngayLam',
  'tenNhanVien',
  'tenCa',
  'checkIn',
  'checkOut',
  'trangThai',
  'diMuon',
  'veSom',
  'gioThucTe',
  'dieuChinh',
  'thaoTac',
];

export const AttendanceManagement = ({
  schedules = [],
  attendance = [],
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
  employees = [],
  khoas = [],
  selectedKhoa,
}) => {
  const [adjustmentRow, setAdjustmentRow] = useState(null);
  const [adjustmentDefaults, setAdjustmentDefaults] = useState(null);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [adjustmentsModalOpen, setAdjustmentsModalOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Bộ lọc nội bộ cho Bảng Chấm công
  const [deptFilter, setDeptFilter] = useState(selectedKhoa || undefined);
  const [statusFilter, setStatusFilter] = useState();
  const [searchKeyword, setSearchKeyword] = useState('');

  // Đồng bộ deptFilter nếu selectedKhoa thay đổi từ ngoài
  useEffect(() => {
    if (selectedKhoa) {
      setDeptFilter(selectedKhoa);
    }
  }, [selectedKhoa]);

  const pendingAdjustmentsCount = useMemo(
    () => (adjustments || []).filter((a) => a.trangThai === 'CHO_DUYET').length,
    [adjustments]
  );

  const openAdjustmentModal = (row, defaults = {}) => {
    setAdjustmentRow(row);
    setAdjustmentDefaults(defaults);
  };

  const handleQuickApproveCheckOut = (row) => {
    let defaultCheckOut = null;
    if (row.ngayLam && row.thoiGianKetThuc) {
      const datePart = dayjs(row.ngayLam).format('YYYY-MM-DD');
      const timePart = row.thoiGianKetThuc.length === 5 ? `${row.thoiGianKetThuc}:00` : row.thoiGianKetThuc;
      let targetTime = dayjs(`${datePart}T${timePart}`);
      if (row.thoiGianBatDau && row.thoiGianKetThuc <= row.thoiGianBatDau) {
        targetTime = targetTime.add(1, 'day');
      }
      defaultCheckOut = targetTime.isValid() ? targetTime : dayjs();
    } else {
      defaultCheckOut = dayjs();
    }

    const checkInVal = row.attendance?.checkIn && dayjs(row.attendance.checkIn).isValid()
      ? dayjs(row.attendance.checkIn)
      : (row.ngayLam && row.thoiGianBatDau ? dayjs(`${dayjs(row.ngayLam).format('YYYY-MM-DD')}T${row.thoiGianBatDau.substring(0, 5)}:00`) : null);

    openAdjustmentModal(row, {
      checkIn: checkInVal,
      checkOut: defaultCheckOut,
      lyDo: 'Quản trị viên duyệt bổ sung giờ ra ca chuẩn trước khi chốt công.',
    });
  };

  // =========================================================================
  // THUẬT TOÁN GỘP DỮ LIỆU ATTENDANCE-FIRST MERGE
  // =========================================================================
  const rows = useMemo(() => {
    // 1. Nhóm từ attendance API
    const attendanceRows = (attendance || []).map((att) => {
      const matchedSchedule = (schedules || []).find((s) => s.id === att.maLichLamViec);
      const emp = (employees || []).find((e) => e.id === att.maNhanVien);
      return {
        id: `att-${att.id}`,
        attendanceId: att.id,
        maLichLamViec: att.maLichLamViec,
        maNhanVien: att.maNhanVien,
        tenNhanVien: att.tenNhanVien || emp?.hoTen || emp?.name || `Nhân viên #${att.maNhanVien}`,
        chucDanh: att.chucDanh || emp?.chucVu || emp?.chuyenKhoa || emp?.vaiTro || '',
        maKhoa: att.maKhoa || matchedSchedule?.maKhoa || emp?.maKhoa,
        tenKhoa: att.tenKhoa || matchedSchedule?.tenKhoa || emp?.tenKhoa || '',
        ngayLam: att.ngayChamCong || matchedSchedule?.ngayLam,
        tenCa: att.tenCa || matchedSchedule?.tenCa || 'Theo phân ca',
        thoiGianBatDau: att.thoiGianBatDau || matchedSchedule?.thoiGianBatDau || '',
        thoiGianKetThuc: att.thoiGianKetThuc || matchedSchedule?.thoiGianKetThuc || '',
        attendance: att,
        trangThaiLich: matchedSchedule?.trangThai || 'LAM_VIEC',
        isFromAttendance: true,
      };
    });

    // 2. Nhóm từ schedules nhưng chưa chấm công
    const attendedScheduleIds = new Set((attendance || []).map((a) => a.maLichLamViec).filter(Boolean));
    const uncompletedScheduleRows = (schedules || [])
      .filter((s) => !attendedScheduleIds.has(s.id) && s.trangThai === 'LAM_VIEC')
      .map((s) => ({
        id: `sch-${s.id}`,
        attendanceId: null,
        maLichLamViec: s.id,
        maNhanVien: s.maNhanVien,
        tenNhanVien: s.tenNhanVien,
        chucDanh: '',
        maKhoa: s.maKhoa,
        tenKhoa: s.tenKhoa || '',
        ngayLam: s.ngayLam,
        tenCa: s.tenCa,
        thoiGianBatDau: s.thoiGianBatDau || '',
        thoiGianKetThuc: s.thoiGianKetThuc || '',
        attendance: null,
        trangThaiLich: s.trangThai,
        isFromAttendance: false,
      }));

    const allMerged = [...attendanceRows, ...uncompletedScheduleRows];

    // Lọc theo bộ lọc nội bộ của tab Chấm công
    return allMerged.filter((row) => {
      if (deptFilter && row.maKhoa && row.maKhoa !== deptFilter) return false;
      if (statusFilter) {
        const rowStatus = row.attendance?.trangThai || (row.trangThaiLich === 'NGHI' ? 'NGHI_PHEP' : 'CHUA_CHAM_CONG');
        if (statusFilter === 'ABNORMAL' && !['THIEU_CHECK_OUT', 'THIEU_CHECKOUT', 'VANG_MAT', 'DI_MUON_VE_SOM'].includes(rowStatus)) return false;
        if (statusFilter === 'CHUA_CHAM_CONG' && rowStatus !== 'CHUA_CHAM_CONG') return false;
        if (statusFilter === 'DA_CHECK_IN' && !row.attendance?.checkIn) return false;
        if (statusFilter === 'DA_CHECK_OUT' && !row.attendance?.checkOut) return false;
        if (statusFilter !== 'CHUA_CHAM_CONG' && statusFilter !== 'DA_CHECK_IN' && statusFilter !== 'DA_CHECK_OUT' && rowStatus !== statusFilter) return false;
      }
      if (searchKeyword) {
        const q = searchKeyword.toLowerCase().trim();
        const matchName = row.tenNhanVien?.toLowerCase().includes(q);
        const matchCa = row.tenCa?.toLowerCase().includes(q);
        const matchKhoa = row.tenKhoa?.toLowerCase().includes(q);
        if (!matchName && !matchCa && !matchKhoa) return false;
      }
      return true;
    });
  }, [attendance, schedules, employees, deptFilter, statusFilter, searchKeyword]);

  // Hook resize cột Excel Grid
  const { colWidths, startColResize } = useExcelGridResizer({
    stt: 50,
    ngayLam: 105,
    tenNhanVien: 200,
    tenCa: 175,
    checkIn: 95,
    checkOut: 95,
    trangThai: 155,
    diMuon: 85,
    veSom: 85,
    gioThucTe: 105,
    dieuChinh: 145,
    thaoTac: 135,
  });

  // Column Reordering (Drag & Drop)
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

  // Row reordering (Drag & Drop)
  const [orderedRows, setOrderedRows] = useState([]);
  const [draggedRowId, setDraggedRowId] = useState(null);

  useEffect(() => {
    setOrderedRows(rows);
  }, [rows]);

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
    const current = [...orderedRows];
    const fromIdx = current.findIndex((i) => i.id === draggedRowId);
    const toIdx = current.findIndex((i) => i.id === targetId);
    if (fromIdx !== -1 && toIdx !== -1) {
      const [moved] = current.splice(fromIdx, 1);
      current.splice(toIdx, 0, moved);
      setOrderedRows(current);
    }
    setDraggedRowId(null);
  };

  const exportCsv = () => {
    const header = ['Ngày', 'Nhân viên', 'Khoa phòng', 'Ca', 'Check-in', 'Check-out', 'Trạng thái', 'Đi muộn (phút)', 'Về sớm (phút)', 'Giờ thực tế'];
    const lines = rows.map((row) => {
      const status = row.attendance?.trangThai || (row.trangThaiLich === 'NGHI' ? 'NGHI_PHEP' : 'CHUA_CHAM_CONG');
      return [
        row.ngayLam ? dayjs(row.ngayLam).format('DD/MM/YYYY') : '',
        row.tenNhanVien,
        row.tenKhoa || '',
        `${row.tenCa} (${row.thoiGianBatDau || ''} - ${row.thoiGianKetThuc || ''})`,
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

  const abnormalCount = rows.filter((row) => {
    const status = row.attendance?.trangThai;
    return status === 'THIEU_CHECK_OUT' || status === 'THIEU_CHECKOUT'
      || status === 'VANG_MAT' || status === 'DI_MUON_VE_SOM';
  }).length;

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

      case 'ngayLam':
        return row.ngayLam ? (
          <span style={{ fontVariantNumeric: 'tabular-nums', color: '#334155' }}>
            {dayjs(row.ngayLam).format('DD/MM/YYYY')}
          </span>
        ) : '-';

      case 'tenNhanVien':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            <span
              style={{ fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              title={row.tenNhanVien}
            >
              {row.tenNhanVien}
            </span>
            {(row.chucDanh || row.tenKhoa) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 11, color: '#64748b' }}>
                {row.chucDanh && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.chucDanh}</span>}
                {row.chucDanh && row.tenKhoa && <span>•</span>}
                {row.tenKhoa && (
                  <Tag
                    color="cyan"
                    style={{
                      fontSize: 10,
                      padding: '0 4px',
                      margin: 0,
                      borderRadius: 3,
                      lineHeight: '16px',
                      maxWidth: 120,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {row.tenKhoa}
                  </Tag>
                )}
              </div>
            )}
          </div>
        );

      case 'tenCa':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            <span
              style={{ fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              title={row.tenCa}
            >
              {row.tenCa}
            </span>
            {row.thoiGianBatDau && row.thoiGianKetThuc ? (
              <span style={{ color: '#64748b', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>
                {row.thoiGianBatDau.substring(0, 5)} - {row.thoiGianKetThuc.substring(0, 5)}
              </span>
            ) : null}
          </div>
        );

      case 'checkIn':
        return row.attendance?.checkIn ? (
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#047857' }}>
            {dayjs(row.attendance.checkIn).format('HH:mm:ss')}
          </span>
        ) : (
          <span style={{ color: '#94a3b8' }}>-</span>
        );

      case 'checkOut':
        return row.attendance?.checkOut ? (
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#0284c7' }}>
            {dayjs(row.attendance.checkOut).format('HH:mm:ss')}
          </span>
        ) : (
          <span style={{ color: '#94a3b8' }}>-</span>
        );

      case 'trangThai': {
        const status = row.attendance?.trangThai || (row.trangThaiLich === 'NGHI' ? 'NGHI_PHEP' : 'CHUA_CHAM_CONG');
        const label = attendanceLabels[status] || (status === 'CHUA_CHAM_CONG' ? 'Chưa chấm công' : status);
        const isMissingCheckout = status === 'THIEU_CHECK_OUT' || status === 'THIEU_CHECKOUT';
        const violationMinutes = (row.attendance?.phutDiMuon || 0) + (row.attendance?.phutVeSom || 0);

        let badgeStyle = {
          padding: '1px 6px',
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 600,
          border: '1px solid',
          whiteSpace: 'nowrap',
          display: 'inline-block',
        };

        switch (status) {
          case 'DI_DUNG_GIO':
            badgeStyle = { ...badgeStyle, background: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' };
            break;
          case 'DI_MUON':
          case 'VE_SOM':
          case 'DI_MUON_VE_SOM':
          case 'THIEU_CHECK_OUT':
          case 'THIEU_CHECKOUT':
            badgeStyle = { ...badgeStyle, background: '#fffbeb', color: '#b45309', borderColor: '#fde68a' };
            break;
          case 'VANG_MAT':
            badgeStyle = { ...badgeStyle, background: '#fff1f2', color: '#be123c', borderColor: '#fecdd3' };
            break;
          case 'NGHI_PHEP':
            badgeStyle = { ...badgeStyle, background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' };
            break;
          default:
            badgeStyle = { ...badgeStyle, background: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' };
            break;
        }

        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
            <span style={badgeStyle}>
              {isMissingCheckout ? 'Thiếu check-out' : label}
            </span>
            {status === 'DI_MUON_VE_SOM' && violationMinutes > 0 && (
              <span style={{ color: '#b45309', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>
                {violationMinutes}p
              </span>
            )}
          </div>
        );
      }

      case 'diMuon':
        return row.attendance?.phutDiMuon > 0 ? (
          <span style={{ color: '#b45309', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {row.attendance.phutDiMuon}p
          </span>
        ) : (
          <span style={{ color: '#94a3b8' }}>0p</span>
        );

      case 'veSom':
        return row.attendance?.phutVeSom > 0 ? (
          <span style={{ color: '#b45309', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {row.attendance.phutVeSom}p
          </span>
        ) : (
          <span style={{ color: '#94a3b8' }}>0p</span>
        );

      case 'gioThucTe':
        return row.attendance?.checkOut ? (
          <span style={{ fontWeight: 600, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
            {Number(row.attendance.gioLamThucTe || 0).toFixed(1)}h
          </span>
        ) : (
          row.attendance?.trangThai === 'THIEU_CHECK_OUT' || row.attendance?.trangThai === 'THIEU_CHECKOUT' ? (
            <span style={{ color: '#b45309', fontWeight: 600, fontSize: 11 }}>0.0 (Chưa chốt)</span>
          ) : (
            <span style={{ color: '#94a3b8' }}>-</span>
          )
        );

      case 'dieuChinh': {
        if (!row.attendance) return <span style={{ color: '#94a3b8' }}>-</span>;
        const request = adjustments.find((item) => item.maChamCong === row.attendance?.id);
        if (request?.trangThai === 'CHO_DUYET') {
          return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tag style={{ margin: 0, fontSize: 11, padding: '1px 6px', background: '#fffbeb', color: '#b45309', borderColor: '#fde68a' }}>
                Chờ duyệt
              </Tag>
            </div>
          );
        }
        const missingCheckout = row.attendance.trangThai === 'THIEU_CHECK_OUT' || row.attendance.trangThai === 'THIEU_CHECKOUT';
        if (missingCheckout) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tooltip title="Duyệt bổ sung giờ ra ca chuẩn">
                <Button
                  size="small"
                  type="primary"
                  style={{
                    background: '#f59e0b',
                    borderColor: '#f59e0b',
                    color: '#fff',
                    fontSize: 11,
                    padding: '0 8px',
                    height: 24,
                    whiteSpace: 'nowrap',
                  }}
                  onClick={() => handleQuickApproveCheckOut(row)}
                >
                  Bổ sung giờ ra
                </Button>
              </Tooltip>
            </div>
          );
        }
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Button
              size="small"
              style={{ fontSize: 11, padding: '0 8px', height: 24, whiteSpace: 'nowrap' }}
              onClick={() => openAdjustmentModal(row)}
            >
              Điều chỉnh
            </Button>
          </div>
        );
      }

      case 'thaoTac': {
        const item = row.attendance;
        if (row.trangThaiLich === 'NGHI' || item?.trangThai === 'NGHI_PHEP' || item?.trangThai === 'VANG_MAT') {
          return <span style={{ color: '#94a3b8' }}>-</span>;
        }
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, whiteSpace: 'nowrap' }}>
            {!item?.checkIn && (
              <Button
                size="small"
                type="primary"
                style={{ background: '#10b981', borderColor: '#10b981', fontSize: 11, height: 24, padding: '0 8px' }}
                onClick={() => checkIn({ maNhanVien: row.maNhanVien })}
              >
                Check-in
              </Button>
            )}
            {item?.checkIn && !item?.checkOut && (
              <Button
                size="small"
                type="primary"
                style={{ background: '#0284c7', borderColor: '#0284c7', fontSize: 11, height: 24, padding: '0 8px' }}
                onClick={() => checkOut({ maNhanVien: row.maNhanVien })}
              >
                Check-out
              </Button>
            )}
            {item?.checkIn && item?.checkOut && (
              <span style={{ color: '#64748b', fontSize: 11 }}>Đã hoàn thành</span>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  const totalRecords = rows.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedRows = orderedRows.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
  const startItemIdx = totalRecords === 0 ? 0 : (pageIndex - 1) * pageSize + 1;
  const endItemIdx = Math.min(pageIndex * pageSize, totalRecords);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        right: isFullscreen ? 0 : 'auto',
        bottom: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 9999 : 'auto',
        background: '#ffffff',
        width: isFullscreen ? '100vw' : '100%',
        maxHeight: isFullscreen ? '100vh' : '100%',
        padding: isFullscreen ? '16px' : 0,
      }}
    >
      {/* KPI Stats Ribbon */}
      {!isFullscreen && attendanceKpi && (
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

      {/* BẢNG QUÉT CHẤM CÔNG TỰ ĐỘNG KHỚP CA & ĐỒNG HỒ SỐ */}
      {!isFullscreen && (
        <AttendanceQuickClock
          employees={employees}
          schedules={schedules}
          checkIn={checkIn}
          checkOut={checkOut}
        />
      )}

      {/* THANH BỘ LỌC NỘI BỘ TAB CHẤM CÔNG & NÚT THAO TÁC */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <AttendanceFilterToolbar
            searchKeyword={searchKeyword}
            setSearchKeyword={(val) => {
              setSearchKeyword(val);
              setPageIndex(1);
            }}
            deptFilter={deptFilter}
            setDeptFilter={(val) => {
              setDeptFilter(val);
              setPageIndex(1);
            }}
            statusFilter={statusFilter}
            setStatusFilter={(val) => {
              setStatusFilter(val);
              setPageIndex(1);
            }}
            khoas={khoas}
            abnormalCount={abnormalCount}
            totalRows={rows.length}
            pendingAdjustmentsCount={pendingAdjustmentsCount}
            onOpenAdjustmentsModal={() => setAdjustmentsModalOpen(true)}
            onOpenPeriodModal={() => setPeriodOpen(true)}
            onExportCsv={exportCsv}
          />
        </div>

        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          style={{
            height: 32,
            padding: '0 10px',
            borderRadius: 6,
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#334155',
            fontSize: 12,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            whiteSpace: 'nowrap',
            marginBottom: 14,
          }}
          title={isFullscreen ? 'Thu nhỏ bảng' : 'Mở rộng bảng toàn màn hình'}
        >
          {isFullscreen ? <FullscreenExitOutlined style={{ fontSize: 12 }} /> : <FullscreenOutlined style={{ fontSize: 12 }} />}
          <span>{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
        </button>
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
            {loading ? (
              <tr>
                <td colSpan={colOrder.length} style={{ padding: 40, textAlign: 'center', background: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#64748b' }}>
                    <span style={{ fontSize: 18 }}>⏳</span>
                    <span>Đang nạp dữ liệu chấm công...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={colOrder.length} style={{ padding: 40, textAlign: 'center', background: '#fff' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#64748b' }}>
                    <span style={{ fontSize: 24 }}>📋</span>
                    <span>Không có dữ liệu chấm công phù hợp.</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedRows.map((row, index) => {
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
            <strong>{totalRecords}</strong> bản ghi
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
              <option value={20}>20 dòng</option>
              <option value={50}>50 dòng</option>
              <option value={100}>100 dòng</option>
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

      {/* MODALS */}
      <AttendanceAdjustmentModal
        open={Boolean(adjustmentRow)}
        onCancel={() => {
          setAdjustmentRow(null);
          setAdjustmentDefaults(null);
        }}
        row={adjustmentRow}
        initialValues={adjustmentDefaults}
        onSubmit={requestAdjustment}
      />
      <AttendanceAdjustmentsListModal
        open={adjustmentsModalOpen}
        onCancel={() => setAdjustmentsModalOpen(false)}
        adjustments={adjustments}
        onReview={reviewAdjustment}
      />
      <AttendancePeriodModal
        open={periodOpen}
        onCancel={() => setPeriodOpen(false)}
        periods={periods}
        onCreate={createPeriod}
        onToggle={togglePeriod}
      />
    </div>
  );
};
