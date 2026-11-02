import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  appointmentApi,
  type LichHenDto,
  type ThongKeLichHenDto,
} from '../api/appointment.api';
import { useAuth } from '../../Auth/context/AuthProvider';
import AppointmentDetailModal from '../components/AppointmentDetailModal';
import './DoctorAppointmentPage.css';

// Default column widths in pixels
const DEFAULT_COL_WIDTHS: Record<string, number> = {
  stt: 50,
  khungGio: 130,
  ngayHen: 110,
  benhNhan: 240,
  soDienThoai: 120,
  khoaPhong: 160,
  lyDo: 260,
  tienCoc: 140,
  trangThai: 150,
  thaoTac: 130,
};

// Column definitions
const APPT_COLUMNS = [
  { key: 'stt', label: 'STT', align: 'text-center' },
  { key: 'khungGio', label: 'Khung Giờ', align: 'text-center' },
  { key: 'ngayHen', label: 'Ngày Hẹn', align: 'text-center' },
  { key: 'benhNhan', label: 'Bệnh Nhân', align: 'text-left' },
  { key: 'soDienThoai', label: 'SĐT Liên Hệ', align: 'text-center' },
  { key: 'khoaPhong', label: 'Chuyên Khoa', align: 'text-left' },
  { key: 'lyDo', label: 'Triệu Chứng / Lý Do Khám', align: 'text-left' },
  { key: 'tienCoc', label: 'Cọc Giữ Chỗ', align: 'text-right' },
  { key: 'trangThai', label: 'Trạng Thái', align: 'text-center' },
  { key: 'thaoTac', label: 'Thao Tác', align: 'text-center' },
];

export const DoctorAppointmentPage: React.FC = () => {
  const { user } = useAuth();

  // Data states
  const [appointments, setAppointments] = useState<LichHenDto[]>([]);
  const [orderedAppointments, setOrderedAppointments] = useState<LichHenDto[]>([]);
  const [stats, setStats] = useState<ThongKeLichHenDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [datePreset, setDatePreset] = useState<'today' | 'tomorrow' | 'week' | 'all'>('today');

  // Pagination states
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Layout states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<LichHenDto | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Column Resizing states
  const [colWidths, setColWidths] = useState<Record<string, number>>(DEFAULT_COL_WIDTHS);
  const resizingColRef = useRef<string | null>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  // Column Reordering states
  const [colOrder, setColOrder] = useState<string[]>(() => APPT_COLUMNS.map((c) => c.key));
  const [draggedColKey, setDraggedColKey] = useState<string | null>(null);
  const [dragOverColKey, setDragOverColKey] = useState<string | null>(null);

  // Row Reordering states
  const [draggedRowId, setDraggedRowId] = useState<number | null>(null);
  const [dragOverRowId, setDragOverRowId] = useState<number | null>(null);

  // Determine date bounds based on preset
  const { tuNgay, denNgay } = useMemo(() => {
    const now = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    if (datePreset === 'today') {
      const todayStr = formatDate(now);
      return { tuNgay: todayStr, denNgay: todayStr };
    }
    if (datePreset === 'tomorrow') {
      const tmr = new Date(now);
      tmr.setDate(tmr.getDate() + 1);
      const tmrStr = formatDate(tmr);
      return { tuNgay: tmrStr, denNgay: tmrStr };
    }
    if (datePreset === 'week') {
      const start = formatDate(now);
      const end = new Date(now);
      end.setDate(end.getDate() + 7);
      return { tuNgay: start, denNgay: formatDate(end) };
    }
    return { tuNgay: undefined, denNgay: undefined };
  }, [datePreset]);

  // Fetch appointments (chỉ hiển thị lịch của bác sĩ đăng nhập)
  const fetchAppointments = useCallback(async () => {
    const doctorId = user?.id;
    if (!doctorId) {
      setAppointments([]);
      setOrderedAppointments([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await appointmentApi.getAppointments({
        keyword: keyword.trim() || undefined,
        trangThai: statusFilter !== 'ALL' ? statusFilter : undefined,
        tuNgay,
        denNgay,
        maBacSi: doctorId,
        pageIndex,
        pageSize,
      });

      if (res.data.success && res.data.data) {
        const rawItems = res.data.data.items || [];
        // Lớp bảo vệ bổ sung: chỉ hiển thị lịch của đúng bác sĩ này
        const items = rawItems.filter(
          (item) => !item.maBacSi || item.maBacSi === doctorId
        );
        setAppointments(items);
        setOrderedAppointments(items);
        setTotalCount(res.data.data.totalCount || items.length);
      } else {
        setAppointments([]);
        setOrderedAppointments([]);
        setTotalCount(0);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể tải danh sách lịch hẹn');
      setAppointments([]);
      setOrderedAppointments([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [keyword, statusFilter, tuNgay, denNgay, user?.id, pageIndex, pageSize]);

  // Fetch stats (chỉ thống kê cho lịch của bác sĩ đăng nhập)
  const fetchStats = useCallback(async () => {
    const doctorId = user?.id;
    if (!doctorId) return;

    try {
      const res = await appointmentApi.getStats(doctorId, tuNgay);
      if (res.data.success && res.data.data) {
        setStats(res.data.data);
      }
    } catch {
      // Ignore background stats load failure
    }
  }, [user?.id, tuNgay]);

  useEffect(() => {
    fetchAppointments();
    fetchStats();
  }, [fetchAppointments, fetchStats]);

  // Fast-track Check-in
  const handleQuickAccept = async (e: React.MouseEvent, appt: LichHenDto) => {
    e.stopPropagation();
    try {
      const res = await appointmentApi.tiepNhan(appt.id);
      if (res.data.success) {
        toast.success(`Đã tiếp nhận ${appt.tenBenhNhan} (LK #${res.data.data.maLuotKham}, STT: ${res.data.data.soThuTu})!`);
        fetchAppointments();
        fetchStats();
      } else {
        toast.error(res.data.message || 'Lỗi khi tiếp nhận lịch hẹn');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi tiếp nhận lịch hẹn');
    }
  };

  // Open detail modal
  const handleOpenDetail = (appt: LichHenDto) => {
    setSelectedAppointment(appt);
    setDetailModalOpen(true);
  };

  // Reset grid
  const handleResetGrid = () => {
    setColWidths(DEFAULT_COL_WIDTHS);
    setColOrder(APPT_COLUMNS.map((c) => c.key));
    setOrderedAppointments(appointments);
    toast.success('Đã đặt lại giao diện bảng về mặc định');
  };

  // Export CSV
  const handleExportCSV = () => {
    if (orderedAppointments.length === 0) {
      toast.error('Không có dữ liệu lịch hẹn để xuất');
      return;
    }

    const headers = [
      'STT',
      'Mã Lịch Hẹn',
      'Khung Giờ',
      'Ngày Hẹn',
      'Tên Bệnh Nhân',
      'Mã BN',
      'SĐT',
      'CCCD',
      'Bác Sĩ',
      'Chuyên Khoa',
      'Lý Do Khám',
      'Tiền Cọc (VNĐ)',
      'Đã Thu Cọc',
      'Trạng Thái',
    ];

    const rows = orderedAppointments.map((a, idx) => [
      idx + 1,
      a.id,
      `"${a.khungGio}"`,
      `"${a.ngayHen}"`,
      `"${a.tenBenhNhan}"`,
      `"BN-${a.maBenhNhan}"`,
      `"${a.soDienThoai || ''}"`,
      `"${a.soCCCD || ''}"`,
      `"${a.tenBacSi || ''}"`,
      `"${a.tenKhoa || ''}"`,
      `"${(a.lyDo || '').replace(/"/g, '""')}"`,
      a.chiPhiGiuCho || 100000,
      a.daThanhToanGiuCho ? 'Đã thu' : 'Chưa thu',
      `"${a.trangThaiText || a.trangThai}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `lich_hen_bac_si_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Đã xuất file dữ liệu thành công!');
  };

  // Column Resizing handlers
  const handleMouseDownResize = (e: React.MouseEvent, colKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    resizingColRef.current = colKey;
    startXRef.current = e.clientX;
    startWidthRef.current = colWidths[colKey] || 100;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizingColRef.current) return;
      const diff = moveEvent.clientX - startXRef.current;
      const newWidth = Math.max(40, startWidthRef.current + diff);
      setColWidths((prev) => ({
        ...prev,
        [resizingColRef.current!]: newWidth,
      }));
    };

    const handleMouseUp = () => {
      resizingColRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Column Drag & Drop
  const handleColDragStart = (e: React.DragEvent, colKey: string) => {
    setDraggedColKey(colKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColDragOver = (e: React.DragEvent, colKey: string) => {
    e.preventDefault();
    if (draggedColKey && draggedColKey !== colKey) {
      setDragOverColKey(colKey);
    }
  };

  const handleColDrop = (e: React.DragEvent, targetColKey: string) => {
    e.preventDefault();
    if (!draggedColKey || draggedColKey === targetColKey) {
      setDraggedColKey(null);
      setDragOverColKey(null);
      return;
    }

    setColOrder((prevOrder) => {
      const newOrder = [...prevOrder];
      const fromIndex = newOrder.indexOf(draggedColKey);
      const toIndex = newOrder.indexOf(targetColKey);
      if (fromIndex !== -1 && toIndex !== -1) {
        newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, draggedColKey);
      }
      return newOrder;
    });

    setDraggedColKey(null);
    setDragOverColKey(null);
  };

  // Row Drag & Drop
  const handleRowDragStart = (e: React.DragEvent, rowId: number) => {
    setDraggedRowId(rowId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleRowDragOver = (e: React.DragEvent, rowId: number) => {
    e.preventDefault();
    if (draggedRowId && draggedRowId !== rowId) {
      setDragOverRowId(rowId);
    }
  };

  const handleRowDrop = (e: React.DragEvent, targetRowId: number) => {
    e.preventDefault();
    if (!draggedRowId || draggedRowId === targetRowId) {
      setDraggedRowId(null);
      setDragOverRowId(null);
      return;
    }

    setOrderedAppointments((prevList) => {
      const newList = [...prevList];
      const fromIndex = newList.findIndex((r) => r.id === draggedRowId);
      const toIndex = newList.findIndex((r) => r.id === targetRowId);
      if (fromIndex !== -1 && toIndex !== -1) {
        const [moved] = newList.splice(fromIndex, 1);
        newList.splice(toIndex, 0, moved);
      }
      return newList;
    });

    setDraggedRowId(null);
    setDragOverRowId(null);
  };

  // Helper calculate age
  const calculateAge = (dobString?: string) => {
    if (!dobString) return '';
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return '';
    const ageDifMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDifMs);
    return `${Math.abs(ageDate.getUTCFullYear() - 1970)}t`;
  };

  // Render cell content
  const renderCell = (colKey: string, appt: LichHenDto, index: number) => {
    switch (colKey) {
      case 'stt':
        return (
          <div
            className="stt-cell"
            draggable
            onDragStart={(e) => handleRowDragStart(e, appt.id)}
            onDragOver={(e) => handleRowDragOver(e, appt.id)}
            onDrop={(e) => handleRowDrop(e, appt.id)}
            title="Kéo thả để sắp xếp hàng"
          >
            <i className="fa-solid fa-grip-vertical row-drag-handle"></i>
            <span className="font-mono">{(pageIndex - 1) * pageSize + index + 1}</span>
          </div>
        );

      case 'khungGio':
        return (
          <span className="font-mono font-bold text-primary" style={{ fontSize: '12px' }}>
            <i className="fa-regular fa-clock" style={{ marginRight: 4 }}></i>
            {appt.khungGio}
          </span>
        );

      case 'ngayHen':
        return (
          <span className="font-mono text-slate-700" style={{ fontWeight: 600 }}>
            {appt.ngayHen}
          </span>
        );

      case 'benhNhan':
        return (
          <div className="patient-cell" onClick={() => handleOpenDetail(appt)} style={{ cursor: 'pointer' }}>
            <span className="patient-name hover:underline text-primary">{appt.tenBenhNhan}</span>
            <div className="patient-sub font-mono">
              <span>BN-{appt.maBenhNhan}</span>
              <span>•</span>
              <span>{appt.gioiTinh === 'M' || appt.gioiTinh === '1' ? 'Nam' : 'Nữ'}</span>
              {appt.ngaySinh && <span>• {calculateAge(appt.ngaySinh)}</span>}
            </div>
          </div>
        );

      case 'soDienThoai':
        return (
          <span className="font-mono text-slate-600">
            {appt.soDienThoai || '--'}
          </span>
        );

      case 'bacSi':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="fa-solid fa-user-doctor text-primary" style={{ fontSize: '11px' }}></i>
            <span className="font-semibold text-slate-800">{appt.tenBacSi || 'Bác sĩ phụ trách'}</span>
          </div>
        );

      case 'khoaPhong':
        return (
          <span className="text-slate-600">
            {appt.tenKhoa || 'Đa khoa'}
          </span>
        );

      case 'lyDo':
        return (
          <div className="reason-truncate" title={appt.lyDo}>
            {appt.lyDo || 'Khám bệnh tổng quát theo hẹn'}
          </div>
        );

      case 'tienCoc':
        return (
          <div style={{ textAlign: 'right' }}>
            <div className="font-mono font-bold text-slate-900">
              {(appt.chiPhiGiuCho || 100000).toLocaleString('vi-VN')} ₫
            </div>
            <div style={{ fontSize: '10px' }}>
              {appt.daThanhToanGiuCho ? (
                <span className="text-emerald font-semibold">
                  <i className="fa-solid fa-check"></i> Đã cọc
                </span>
              ) : (
                <span className="text-amber">Chưa nộp</span>
              )}
            </div>
          </div>
        );

      case 'trangThai': {
        switch (appt.trangThai) {
          case 'DA_DEN':
            return <span className="status-badge green"><i className="fa-solid fa-check"></i> Đã tiếp nhận</span>;
          case 'DA_XAC_NHAN':
            return <span className="status-badge blue"><i className="fa-solid fa-calendar-check"></i> Đã xác nhận</span>;
          case 'CHO_XAC_NHAN':
            return <span className="status-badge orange"><i className="fa-solid fa-clock"></i> Chờ xác nhận</span>;
          case 'DA_HUY':
            return <span className="status-badge red"><i className="fa-solid fa-ban"></i> Đã hủy</span>;
          default:
            return <span className="status-badge gray">{appt.trangThaiText || appt.trangThai}</span>;
        }
      }

      case 'thaoTac':
        return (
          <div className="action-buttons">
            <button
              type="button"
              className="btn-action-icon view"
              title="Xem chi tiết lịch hẹn"
              onClick={() => handleOpenDetail(appt)}
            >
              <i className="fa-solid fa-eye"></i>
            </button>

            {appt.trangThai !== 'DA_HUY' && appt.trangThai !== 'DA_DEN' && (
              <button
                type="button"
                className="btn-action-icon accept"
                title="Tiếp nhận vào khám ngay"
                onClick={(e) => handleQuickAccept(e, appt)}
              >
                <i className="fa-solid fa-user-check"></i> Tiếp nhận
              </button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className={`doctor-appointment-page ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {/* 1. Header Trang */}
      <div className="appt-header">
        <div className="appt-title-wrap">
          <div className="appt-title-icon">
            <i className="fa-solid fa-calendar-days"></i>
          </div>
          <div className="appt-title">
            <h2>LỊCH HẸN BỆNH NHÂN</h2>
            <div className="appt-subtitle">
              Danh sách người bệnh đặt lịch hẹn khám chuyên khoa theo khung giờ cố định
            </div>
          </div>
        </div>

        <div className="appt-header-actions">
          <div className="doctor-badge-info" title="Chỉ hiển thị lịch hẹn của bác sĩ đang đăng nhập">
            <i className="fa-solid fa-user-doctor"></i>
            <span>BS: <strong>{user?.fullName || 'Bác sĩ phụ trách'}</strong></span>
          </div>

          <button
            type="button"
            className="btn-tool"
            onClick={() => {
              fetchAppointments();
              fetchStats();
              toast.success('Đã làm mới danh sách lịch hẹn');
            }}
            title="Làm mới dữ liệu"
          >
            <i className={`fa-solid fa-arrows-rotate ${loading ? 'fa-spin' : ''}`}></i>
            Làm mới
          </button>

          <button
            type="button"
            className="btn-tool"
            onClick={handleExportCSV}
            title="Xuất file CSV"
          >
            <i className="fa-solid fa-file-excel"></i>
            Xuất Excel
          </button>

          <button
            type="button"
            className="btn-tool"
            onClick={handleResetGrid}
            title="Đặt lại độ rộng và thứ tự cột"
          >
            <i className="fa-solid fa-rotate-left"></i>
            Đặt lại cột
          </button>

          <button
            type="button"
            className="btn-tool"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
          >
            <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
          </button>
        </div>
      </div>

      {/* 2. Thẻ KPI Thống Kê Nhanh */}
      <div className="appt-kpi-row">
        <div className="appt-kpi-card blue">
          <div className="appt-kpi-info">
            <span className="kpi-label">Tổng Lịch Hẹn</span>
            <span className="kpi-value">{stats?.tongLichHen ?? totalCount}</span>
          </div>
          <div className="appt-kpi-icon">
            <i className="fa-solid fa-calendar-check"></i>
          </div>
        </div>

        <div className="appt-kpi-card green">
          <div className="appt-kpi-info">
            <span className="kpi-label">Đã Tiếp Nhận / Đến</span>
            <span className="kpi-value">{stats?.daTiepNhan ?? 0}</span>
          </div>
          <div className="appt-kpi-icon">
            <i className="fa-solid fa-user-check"></i>
          </div>
        </div>

        <div className="appt-kpi-card purple">
          <div className="appt-kpi-info">
            <span className="kpi-label">Đã Xác Nhận (Cọc)</span>
            <span className="kpi-value">{stats?.daXacNhan ?? 0}</span>
          </div>
          <div className="appt-kpi-icon">
            <i className="fa-solid fa-circle-check"></i>
          </div>
        </div>

        <div className="appt-kpi-card amber">
          <div className="appt-kpi-info">
            <span className="kpi-label">Chờ Xác Nhận</span>
            <span className="kpi-value">{stats?.choThuTien ?? 0}</span>
          </div>
          <div className="appt-kpi-icon">
            <i className="fa-solid fa-clock"></i>
          </div>
        </div>

        <div className="appt-kpi-card red">
          <div className="appt-kpi-info">
            <span className="kpi-label">Lịch Đã Hủy</span>
            <span className="kpi-value">{stats?.daHuy ?? 0}</span>
          </div>
          <div className="appt-kpi-icon">
            <i className="fa-solid fa-ban"></i>
          </div>
        </div>
      </div>

      {/* 3. Toolbar & Bộ Lọc */}
      <div className="appt-toolbar">
        <div className="appt-toolbar-left">
          {/* Ô tìm kiếm từ khóa */}
          <div className="search-input-wrap">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              placeholder="Tìm theo tên bệnh nhân, SĐT, CCCD, mã BN..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPageIndex(1);
              }}
            />
            {keyword && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => {
                  setKeyword('');
                  setPageIndex(1);
                }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          {/* Lọc trạng thái */}
          <select
            className="toolbar-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPageIndex(1);
            }}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="DA_XAC_NHAN">Đã xác nhận (Có cọc)</option>
            <option value="CHO_XAC_NHAN">Chờ xác nhận</option>
            <option value="DA_DEN">Đã tiếp nhận vào khám</option>
            <option value="DA_HUY">Đã hủy</option>
          </select>

          {/* Lọc preset ngày hẹn */}
          <div className="date-preset-group">
            <button
              type="button"
              className={`date-preset-btn ${datePreset === 'today' ? 'active' : ''}`}
              onClick={() => {
                setDatePreset('today');
                setPageIndex(1);
              }}
            >
              Hôm nay
            </button>
            <button
              type="button"
              className={`date-preset-btn ${datePreset === 'tomorrow' ? 'active' : ''}`}
              onClick={() => {
                setDatePreset('tomorrow');
                setPageIndex(1);
              }}
            >
              Ngày mai
            </button>
            <button
              type="button"
              className={`date-preset-btn ${datePreset === 'week' ? 'active' : ''}`}
              onClick={() => {
                setDatePreset('week');
                setPageIndex(1);
              }}
            >
              7 ngày tới
            </button>
            <button
              type="button"
              className={`date-preset-btn ${datePreset === 'all' ? 'active' : ''}`}
              onClick={() => {
                setDatePreset('all');
                setPageIndex(1);
              }}
            >
              Tất cả
            </button>
          </div>
        </div>

        <div className="appt-toolbar-right">
          <span style={{ fontSize: '11.5px', color: '#64748b' }}>
            Tổng số: <strong style={{ color: '#0f172a' }}>{totalCount}</strong> cuộc hẹn
          </span>
        </div>
      </div>

      {/* 4. Excel Data Grid Container */}
      <div className="appt-grid-container">
        <div className="appt-table-wrap">
          <table className="appt-table">
            <thead>
              <tr>
                {colOrder.map((colKey) => {
                  const colDef = APPT_COLUMNS.find((c) => c.key === colKey);
                  if (!colDef) return null;
                  const width = colWidths[colKey] || 100;
                  const isDragging = draggedColKey === colKey;
                  const isDragOver = dragOverColKey === colKey;

                  return (
                    <th
                      key={colKey}
                      style={{
                        width: `${width}px`,
                        minWidth: `${width}px`,
                        opacity: isDragging ? 0.4 : 1,
                        borderLeft: isDragOver ? '2px dashed #0284c7' : undefined,
                      }}
                      className={colDef.align}
                    >
                      <div
                        className="th-content"
                        draggable={colKey !== 'stt' && colKey !== 'thaoTac'}
                        onDragStart={(e) => handleColDragStart(e, colKey)}
                        onDragOver={(e) => handleColDragOver(e, colKey)}
                        onDrop={(e) => handleColDrop(e, colKey)}
                      >
                        <span className="th-label">
                          {colKey !== 'stt' && colKey !== 'thaoTac' && (
                            <i className="fa-solid fa-grip-vertical th-drag-handle"></i>
                          )}
                          {colDef.label}
                        </span>
                      </div>
                      {/* Resizer handle */}
                      <div
                        className="col-resizer"
                        onMouseDown={(e) => handleMouseDownResize(e, colKey)}
                      />
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={colOrder.length} style={{ padding: '60px 0', textAlign: 'center' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, color: '#0284c7' }}></i>
                    <div style={{ marginTop: 8, fontSize: 13, color: '#64748b' }}>
                      Đang tải danh sách lịch hẹn...
                    </div>
                  </td>
                </tr>
              ) : orderedAppointments.length === 0 ? (
                <tr>
                  <td colSpan={colOrder.length}>
                    <div className="empty-table-wrap">
                      <i className="fa-regular fa-calendar-xmark"></i>
                      <span>Không tìm thấy lịch hẹn nào theo điều kiện lọc hiện tại</span>
                    </div>
                  </td>
                </tr>
              ) : (
                orderedAppointments.map((appt, idx) => {
                  const isRowDragging = draggedRowId === appt.id;
                  const isRowDragOver = dragOverRowId === appt.id;

                  return (
                    <tr
                      key={appt.id}
                      className={`${isRowDragging ? 'row-dragging' : ''} ${isRowDragOver ? 'row-drag-over' : ''}`}
                    >
                      {colOrder.map((colKey) => {
                        const colDef = APPT_COLUMNS.find((c) => c.key === colKey);
                        return (
                          <td key={colKey} className={colDef?.align || ''}>
                            {renderCell(colKey, appt, idx)}
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

        {/* 5. Pagination Bar */}
        <div className="appt-pagination-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>
              Hiển thị{' '}
              <strong>{totalCount > 0 ? (pageIndex - 1) * pageSize + 1 : 0}</strong> -{' '}
              <strong>{Math.min(pageIndex * pageSize, totalCount)}</strong> trong tổng số{' '}
              <strong>{totalCount}</strong> lịch hẹn
            </span>

            <select
              className="toolbar-select"
              style={{ height: 26, fontSize: 11, padding: '0 6px' }}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageIndex(1);
              }}
            >
              <option value={10}>10 dòng / trang</option>
              <option value={20}>20 dòng / trang</option>
              <option value={50}>50 dòng / trang</option>
              <option value={100}>100 dòng / trang</option>
            </select>
          </div>

          <div className="pagination-controls">
            <button
              type="button"
              className="btn-page-nav"
              disabled={pageIndex <= 1}
              onClick={() => setPageIndex(1)}
              title="Trang đầu"
            >
              <i className="fa-solid fa-angles-left"></i>
            </button>
            <button
              type="button"
              className="btn-page-nav"
              disabled={pageIndex <= 1}
              onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
              title="Trang trước"
            >
              <i className="fa-solid fa-angle-left"></i>
            </button>

            <span style={{ margin: '0 8px', fontWeight: 600 }}>
              Trang {pageIndex} / {totalPages}
            </span>

            <button
              type="button"
              className="btn-page-nav"
              disabled={pageIndex >= totalPages}
              onClick={() => setPageIndex((p) => Math.min(totalPages, p + 1))}
              title="Trang sau"
            >
              <i className="fa-solid fa-angle-right"></i>
            </button>
            <button
              type="button"
              className="btn-page-nav"
              disabled={pageIndex >= totalPages}
              onClick={() => setPageIndex(totalPages)}
              title="Trang cuối"
            >
              <i className="fa-solid fa-angles-right"></i>
            </button>
          </div>
        </div>
      </div>

      {/* 6. Chi tiết Lịch hẹn Modal */}
      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedAppointment(null);
        }}
        onRefresh={() => {
          fetchAppointments();
          fetchStats();
        }}
      />
    </div>
  );
};

export default DoctorAppointmentPage;
