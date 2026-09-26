import { useState, useEffect, useMemo } from 'react';
import { Button, Space, Table, Tag, Tooltip } from 'antd';
import dayjs from 'dayjs';

import { AttendanceQuickClock } from '../components/attendance/AttendanceQuickClock';
import { AttendanceFilterToolbar } from '../components/attendance/AttendanceFilterToolbar';
import { AttendanceAdjustmentModal } from '../components/attendance/AttendanceAdjustmentModal';
import { AttendanceAdjustmentsListModal } from '../components/attendance/AttendanceAdjustmentsListModal';
import { AttendancePeriodModal } from '../components/attendance/AttendancePeriodModal';

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
  const [pagination, setPagination] = useState({ current: 1, pageSize: 15 });

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
  // 1. Lấy mảng attendance làm trung tâm: bất kỳ ai đã check-in đều xuất hiện 100%
  // 2. Bổ sung các ca làm việc trong schedules chưa được chấm công
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
        chucDanh: att.chucDanh || emp?.chuyenKhoa || '',
        maKhoa: att.maKhoa || matchedSchedule?.maKhoa,
        tenKhoa: att.tenKhoa || matchedSchedule?.tenKhoa || '',
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

  // =========================================================================
  // QUẢN LÝ ĐỘ RỘNG CỘT & RESIZER CHO BẢNG EXCEL DATA GRID
  // =========================================================================
  const [colWidths, setColWidths] = useState({
    stt: 55,
    ngayLam: 105,
    tenNhanVien: 210,
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

  const startColResize = (colKey, e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = colWidths[colKey] || 100;

    const onMouseMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX;
      const minWidthMap = {
        stt: 50,
        ngayLam: 95,
        tenNhanVien: 160,
        tenCa: 140,
        checkIn: 85,
        checkOut: 85,
        trangThai: 120,
        diMuon: 75,
        veSom: 75,
        gioThucTe: 90,
        dieuChinh: 120,
        thaoTac: 120,
      };
      const minWidth = minWidthMap[colKey] || 70;
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

  const renderHeader = (title, key, align = 'left') => (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        width: '100%',
        paddingRight: 6,
        userSelect: 'none',
      }}
    >
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
      <div
        className="excel-col-resizer"
        onMouseDown={(e) => startColResize(key, e)}
      />
    </div>
  );

  const totalTableWidth = useMemo(
    () => Object.values(colWidths).reduce((sum, w) => sum + w, 0),
    [colWidths]
  );

  const columns = [
    {
      title: renderHeader('STT', 'stt', 'center'),
      width: colWidths.stt,
      minWidth: 50,
      align: 'center',
      fixed: 'left',
      className: 'excel-stt-cell',
      render: (_, __, index) => (
        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#64748b' }}>
          {(pagination.current - 1) * pagination.pageSize + index + 1}
        </span>
      ),
    },
    {
      title: renderHeader('Ngày', 'ngayLam', 'center'),
      dataIndex: 'ngayLam',
      width: colWidths.ngayLam,
      minWidth: 95,
      align: 'center',
      className: 'excel-date-cell',
      render: (value) => (
        value ? (
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            {dayjs(value).format('DD/MM/YYYY')}
          </span>
        ) : '-'
      ),
    },
    {
      title: renderHeader('Nhân viên', 'tenNhanVien', 'left'),
      dataIndex: 'tenNhanVien',
      width: colWidths.tenNhanVien,
      minWidth: 160,
      render: (text, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
          <strong
            style={{ color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            title={text}
          >
            {text}
          </strong>
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
                    lineHeight: '18px',
                    border: '1px solid #a5f3fc',
                    background: '#ecfeff',
                    color: '#0e7490',
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
      ),
    },
    {
      title: renderHeader('Ca làm việc', 'tenCa', 'left'),
      width: colWidths.tenCa,
      minWidth: 140,
      render: (_, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <strong
            style={{ color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            title={row.tenCa}
          >
            {row.tenCa}
          </strong>
          {row.thoiGianBatDau && row.thoiGianKetThuc ? (
            <span style={{ color: '#64748b', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>
              {row.thoiGianBatDau.substring(0, 5)} - {row.thoiGianKetThuc.substring(0, 5)}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      title: renderHeader('Check-in', 'checkIn', 'center'),
      width: colWidths.checkIn,
      minWidth: 85,
      align: 'center',
      className: 'excel-date-cell',
      render: (_, row) =>
        row.attendance?.checkIn ? (
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#047857' }}>
            {dayjs(row.attendance.checkIn).format('HH:mm:ss')}
          </span>
        ) : (
          <span style={{ color: '#94a3b8' }}>-</span>
        ),
    },
    {
      title: renderHeader('Check-out', 'checkOut', 'center'),
      width: colWidths.checkOut,
      minWidth: 85,
      align: 'center',
      className: 'excel-date-cell',
      render: (_, row) =>
        row.attendance?.checkOut ? (
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#0284c7' }}>
            {dayjs(row.attendance.checkOut).format('HH:mm:ss')}
          </span>
        ) : (
          <span style={{ color: '#94a3b8' }}>-</span>
        ),
    },
    {
      title: renderHeader('Trạng thái', 'trangThai', 'center'),
      width: colWidths.trangThai,
      minWidth: 120,
      align: 'center',
      render: (_, row) => {
        const status = row.attendance?.trangThai || (row.trangThaiLich === 'NGHI' ? 'NGHI_PHEP' : 'CHUA_CHAM_CONG');
        const label = attendanceLabels[status] || (status === 'CHUA_CHAM_CONG' ? 'Chưa chấm công' : status);
        const isMissingCheckout = status === 'THIEU_CHECK_OUT' || status === 'THIEU_CHECKOUT';
        const violationMinutes = (row.attendance?.phutDiMuon || 0) + (row.attendance?.phutVeSom || 0);

        let badgeStyle = {
          padding: '2px 8px',
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
            badgeStyle = { ...badgeStyle, background: '#fffbeb', color: '#b45309', borderColor: '#fde68a' };
            break;
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
      },
    },
    {
      title: renderHeader('Đi muộn', 'diMuon', 'right'),
      width: colWidths.diMuon,
      minWidth: 75,
      align: 'right',
      className: 'excel-num-cell',
      render: (_, row) =>
        row.attendance?.phutDiMuon > 0 ? (
          <span style={{ color: '#b45309', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {row.attendance.phutDiMuon}p
          </span>
        ) : (
          <span style={{ color: '#94a3b8' }}>0p</span>
        ),
    },
    {
      title: renderHeader('Về sớm', 'veSom', 'right'),
      width: colWidths.veSom,
      minWidth: 75,
      align: 'right',
      className: 'excel-num-cell',
      render: (_, row) =>
        row.attendance?.phutVeSom > 0 ? (
          <span style={{ color: '#b45309', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {row.attendance.phutVeSom}p
          </span>
        ) : (
          <span style={{ color: '#94a3b8' }}>0p</span>
        ),
    },
    {
      title: renderHeader('Giờ thực tế', 'gioThucTe', 'right'),
      width: colWidths.gioThucTe,
      minWidth: 90,
      align: 'right',
      className: 'excel-num-cell',
      render: (_, row) =>
        row.attendance?.checkOut ? (
          <span style={{ fontWeight: 600, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
            {Number(row.attendance.gioLamThucTe || 0).toFixed(1)}h
          </span>
        ) : (
          row.attendance?.trangThai === 'THIEU_CHECK_OUT' || row.attendance?.trangThai === 'THIEU_CHECKOUT' ? (
            <span style={{ color: '#b45309', fontWeight: 600, fontSize: 11 }}>0.0 (Chưa chốt)</span>
          ) : (
            <span style={{ color: '#94a3b8' }}>-</span>
          )
        ),
    },
    {
      title: renderHeader('Điều chỉnh', 'dieuChinh', 'center'),
      width: colWidths.dieuChinh,
      minWidth: 120,
      align: 'center',
      render: (_, row) => {
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
        const missingCheckout = row.attendance.trangThai === 'THIEU_CHECK_OUT'
          || row.attendance.trangThai === 'THIEU_CHECKOUT';
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
      },
    },
    {
      title: renderHeader('Thao tác', 'thaoTac', 'center'),
      width: colWidths.thaoTac,
      minWidth: 120,
      align: 'center',
      render: (_, row) => {
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
      },
    },
  ];

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

      {/* BẢNG QUÉT CHẤM CÔNG TỰ ĐỘNG KHỚP CA & ĐỒNG HỒ SỐ */}
      <AttendanceQuickClock
        employees={employees}
        schedules={schedules}
        checkIn={checkIn}
        checkOut={checkOut}
      />

      {/* THANH BỘ LỌC NỘI BỘ TAB CHẤM CÔNG & NÚT THAO TÁC */}
      <AttendanceFilterToolbar
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
        deptFilter={deptFilter}
        setDeptFilter={setDeptFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        khoas={khoas}
        abnormalCount={abnormalCount}
        totalRows={rows.length}
        pendingAdjustmentsCount={pendingAdjustmentsCount}
        onOpenAdjustmentsModal={() => setAdjustmentsModalOpen(true)}
        onOpenPeriodModal={() => setPeriodOpen(true)}
        onExportCsv={exportCsv}
      />

      {/* BẢNG DỮ LIỆU EXCEL DATA GRID */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={rows}
          columns={columns}
          className="excel-data-grid"
          tableLayout="fixed"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['15', '30', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} dòng`,
          }}
          onChange={(p) => setPagination({ current: p.current || 1, pageSize: p.pageSize || 15 })}
          locale={{ emptyText: 'Chưa có dữ liệu chấm công hoặc ca làm việc phù hợp.' }}
          style={{ border: '1px solid #cbd5e1', borderRadius: 6, overflow: 'hidden' }}
          scroll={{ x: totalTableWidth }}
        />
      </div>

      {/* MODAL 1: ĐIỀU CHỈNH CHẤM CÔNG — TOÀN MÀN HÌNH */}
      <AttendanceAdjustmentModal
        open={!!adjustmentRow}
        adjustmentRow={adjustmentRow}
        adjustmentDefaults={adjustmentDefaults}
        attendanceLabels={attendanceLabels}
        onClose={() => setAdjustmentRow(null)}
        onSubmit={async (payload) => {
          await requestAdjustment(payload);
          setAdjustmentRow(null);
        }}
      />

      {/* MODAL 2: DANH SÁCH ĐƠN DUYỆT ĐIỀU CHỈNH CHẤM CÔNG */}
      <AttendanceAdjustmentsListModal
        open={adjustmentsModalOpen}
        adjustments={adjustments}
        employees={employees}
        pendingCount={pendingAdjustmentsCount}
        onClose={() => setAdjustmentsModalOpen(false)}
        onReview={reviewAdjustment}
      />

      {/* MODAL 3: KỲ CHẤM CÔNG */}
      <AttendancePeriodModal
        open={periodOpen}
        periods={periods}
        onClose={() => setPeriodOpen(false)}
        onCreatePeriod={createPeriod}
        onTogglePeriod={togglePeriod}
      />
    </>
  );
};
