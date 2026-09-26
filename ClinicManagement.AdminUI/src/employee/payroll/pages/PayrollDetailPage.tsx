import React, { useMemo, useState } from 'react';
import {
  App,
  Button,
  Card,
  Col,
  Dropdown,
  Input,
  Pagination,
  Row,
  Select,
  Space,
  Steps,
  Tag,
  Tooltip,
} from 'antd';
import {
  ArrowLeft,
  FileSpreadsheet,
  Printer,
  RefreshCw,
  CheckCircle2,
  Lock,
  CreditCard,
  Search,
  SlidersHorizontal,
  FileText,
  AlertTriangle,
  Eye,
  EyeOff,
  MoreHorizontal,
} from 'lucide-react';
import dayjs from 'dayjs';
import { payrollApi, type PayrollDetail, type PayrollLine } from '../payroll.api';
import { PayrollKpiDashboard } from '../components/PayrollKpiDashboard';
import { PayslipDrawer } from '../components/PayslipDrawer';
import { PayslipPrintModal } from '../components/PayslipPrintModal';

interface PayrollDetailPageProps {
  periodId: number;
  initialDetail: PayrollDetail;
  onBack: () => void;
  onPeriodUpdated: () => void;
}

const statusLabels: Record<string, string> = {
  NHAP: 'Nháp',
  DA_DUYET: 'Đã duyệt',
  DA_CHOT: 'Đã chốt',
  DA_THANH_TOAN: 'Đã thanh toán',
};

const statusColors: Record<string, string> = {
  NHAP: 'default',
  DA_DUYET: 'blue',
  DA_CHOT: 'orange',
  DA_THANH_TOAN: 'green',
};

const money = (val?: number) => `${Number(val || 0).toLocaleString('vi-VN')} đ`;

export const PayrollDetailPage: React.FC<PayrollDetailPageProps> = ({
  periodId,
  initialDetail,
  onBack,
  onPeriodUpdated,
}) => {
  const { message } = App.useApp();
  const [detail, setDetail] = useState<PayrollDetail>(initialDetail);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Bộ lọc
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedKhoa, setSelectedKhoa] = useState<string>('ALL');
  const [quickFilter, setQuickFilter] = useState<string>('ALL');

  // Phân trang
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20 });

  // Drawer & Print Modal State
  const [drawerLine, setDrawerLine] = useState<PayrollLine | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [printLine, setPrintLine] = useState<PayrollLine | null>(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  // =========================================================================
  // RESIZE 3 TẦNG: TẦNG 2 (ĐỘ RỘNG CỘT) & TẦNG 3 (CHIỀU CAO HÀNG)
  // =========================================================================
  const [colWidths, setColWidths] = useState<Record<string, number>>({
    stt: 48,
    maNhanVien: 95,
    tenNhanVien: 200,
    chucDanh: 130,
    khoa: 125,
    luongCoBan: 120,
    ngayCong: 85,
    luongTheoNgayCong: 125,
    tienTangCa: 105,
    tongPhuCap: 115,
    tienThuLaoHis: 120,
    tienBaoHiem: 120,
    khauTru: 120,
    thucLinh: 135,
    thaoTac: 65,
  });

  const [rowHeights, setRowHeights] = useState<Record<number, number>>({});

  const handleColResize = (colKey: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = colWidths[colKey] || 100;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const minWidth = colKey === 'stt' ? 45 : 50;
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

  const handleRowResize = (rowId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const startHeight = rowHeights[rowId] || 40;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientY - startY;
      const newHeight = Math.max(34, Math.min(120, startHeight + delta));
      setRowHeights((prev) => ({ ...prev, [rowId]: newHeight }));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const reloadDetail = async () => {
    setLoading(true);
    try {
      const res = await payrollApi.getDetail(periodId);
      if (res.data.data) {
        setDetail(res.data.data);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không thể tải chi tiết kỳ lương.');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodAction = async (
    actionName: 'generate' | 'approve' | 'close' | 'pay' | 'publish' | 'unpublish',
    successMsg: string
  ) => {
    setActionLoading(true);
    try {
      if (actionName === 'generate') {
        const res = await payrollApi.generate(periodId);
        message.success(successMsg);
        if (res.data.data) {
          setDetail(res.data.data);
        }
      } else {
        await payrollApi[actionName](periodId);
        message.success(successMsg);
        await reloadDetail();
      }
      onPeriodUpdated();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Thao tác kỳ lương thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecalculateSingle = async (lineId: number) => {
    try {
      const res = await payrollApi.recalculate(lineId);
      message.success('Đã tính lại lương cho nhân viên.');
      if (res.data.data) {
        setDetail((prev) => ({
          ...prev,
          bangLuongs: prev.bangLuongs.map((l) => (l.id === lineId ? res.data.data! : l)),
        }));
        await reloadDetail();
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Tính lại lương thất bại.');
    }
  };

  const handleLineUpdated = (updated: PayrollLine) => {
    setDetail((prev) => ({
      ...prev,
      bangLuongs: prev.bangLuongs.map((l) => (l.id === updated.id ? updated : l)),
    }));
    setDrawerLine(updated);
    reloadDetail();
  };

  // Danh sách các khoa để lọc
  const departmentOptions = useMemo(() => {
    const list = Array.from(
      new Set(detail.bangLuongs.map((l) => l.tenKhoa).filter(Boolean))
    );
    return [
      { value: 'ALL', label: 'Tất cả các Khoa' },
      ...list.map((k) => ({ value: k!, label: k! })),
    ];
  }, [detail.bangLuongs]);

  const abnormalLines = useMemo(
    () =>
      detail.bangLuongs.filter(
        (line) =>
          Number(line.soCaBatThuong || 0) > 0 ||
          Number(line.soCaThieuCheckOut || 0) > 0 ||
          Number(line.soCaVangMat || 0) > 0
      ),
    [detail.bangLuongs]
  );

  // Lọc dữ liệu bảng
  const filteredLines = useMemo(() => {
    return detail.bangLuongs.filter((line) => {
      // Tìm kiếm theo tên hoặc mã NV
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const matchName = line.tenNhanVien?.toLowerCase().includes(kw);
        const matchCode = line.maNhanVien?.toString().includes(kw);
        if (!matchName && !matchCode) return false;
      }

      // Lọc theo khoa
      if (selectedKhoa !== 'ALL') {
        if (line.tenKhoa !== selectedKhoa) return false;
      }

      // Bộ lọc nhanh
      if (quickFilter === 'HAS_OT' && Number(line.tienTangCa || 0) <= 0) return false;
      if (quickFilter === 'HAS_LATE' && Number(line.khauTruDiMuonVeSom || 0) <= 0) return false;
      if (quickFilter === 'HAS_DEBT' && Number(line.tienNoKyNay || 0) <= 0) return false;
      if (quickFilter === 'ABNORMAL' && !abnormalLines.some((item) => item.id === line.id)) return false;

      return true;
    });
  }, [detail.bangLuongs, searchKeyword, selectedKhoa, quickFilter, abnormalLines]);

  // Phân trang danh sách hiển thị
  const paginatedLines = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize;
    return filteredLines.slice(start, start + pagination.pageSize);
  }, [filteredLines, pagination]);

  const exportCsv = () => {
    if (!detail.bangLuongs?.length) return;
    const header = [
      'STT',
      'Mã NV',
      'Họ và tên',
      'Khoa/Phòng',
      'Chức danh',
      'Lương cơ bản',
      'Số công',
      'Nghỉ không lương',
      'Lương ngày công',
      'Tăng ca OT',
      'Tổng phụ cấp',
      'Thù lao HIS',
      'Hoa hồng CLS',
      'Bảo hiểm (10.5%)',
      'Khấu trừ nghỉ/trễ',
      'Khấu trừ khác',
      'Thực lĩnh',
      'Nợ kỳ này',
    ];

    const lines = filteredLines.map((row, idx) => [
      idx + 1,
      row.maNhanVien,
      row.tenNhanVien,
      row.tenKhoa || '',
      row.chucDanh || '',
      row.luongCoBan,
      row.soNgayCong,
      row.soNgayNghiKhongLuong,
      row.luongTheoNgayCong,
      row.tienTangCa,
      row.tongPhuCap,
      row.tienThuLaoKham || 0,
      row.tienHoaHongCls || 0,
      row.tienBaoHiem,
      Number(row.khauTruNghiKhongLuong || 0) + Number(row.khauTruDiMuonVeSom || 0),
      row.tongKhauTru,
      Number(row.tienNoKyNay || 0) > 0 ? 0 : row.thucLinh,
      row.tienNoKyNay || 0,
    ].map((v) => `"${String(v).replaceAll('"', '""')}"`).join(','));

    const blob = new Blob([`\uFEFF${[header.join(','), ...lines].join('\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bang-luong-thang-${detail.thang}-${detail.nam}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Stepper current step
  const stepCurrent = useMemo(() => {
    switch (detail.trangThai) {
      case 'NHAP':
        return detail.bangLuongs.length > 0 ? 1 : 0;
      case 'DA_DUYET':
        return 2;
      case 'DA_CHOT':
        return detail.isPublished ? 4 : 3;
      case 'DA_THANH_TOAN':
        return detail.isPublished ? 5 : 4;
      default:
        return 0;
    }
  }, [detail.trangThai, detail.bangLuongs.length, detail.isPublished]);

  return (
    <div style={{ padding: '4px 0 24px 0' }}>
      {/* HEADER ĐIỀU HƯỚNG & HÀNH ĐỘNG */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 16,
          background: '#ffffff',
          padding: '14px 20px',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <ArrowLeft size={14} />
            Quay lại danh sách
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                Kỳ Lương Tháng {detail.thang}/{detail.nam}
              </span>
              <Tag color={statusColors[detail.trangThai] || 'default'} style={{ fontSize: 12, padding: '2px 8px' }}>
                {statusLabels[detail.trangThai] || detail.trangThai}
              </Tag>
              {detail.isPublished && (
                <Tag color="cyan" style={{ fontSize: 12 }}>✓ Đã công bố</Tag>
              )}
              {!detail.isPublished && (detail.trangThai === 'DA_CHOT' || detail.trangThai === 'DA_THANH_TOAN') && (
                <Tag color="default" style={{ fontSize: 12, color: '#94a3b8' }}>Chưa công bố</Tag>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Chu kỳ công: {dayjs(detail.tuNgay).format('DD/MM/YYYY')} — {dayjs(detail.denNgay).format('DD/MM/YYYY')}
            </div>
          </div>
        </div>

        {/* CÁC NÚT THAO TÁC THEO MÁY TRẠNG THÁI */}
        <Space wrap>
          {detail.trangThai === 'NHAP' && (
            <Button
              type="primary"
              loading={actionLoading}
              icon={<RefreshCw size={14} />}
              onClick={() => handlePeriodAction('generate', 'Đã tính toán bảng lương từ kỳ chấm công.')}
              style={{ background: '#0284c7', fontSize: 12, height: 32 }}
            >
              {detail.bangLuongs.length > 0 ? 'Tính lại toàn bộ' : 'Tính lương'}
            </Button>
          )}

          {detail.trangThai === 'NHAP' && detail.bangLuongs.length > 0 && (
            <Button
              type="primary"
              loading={actionLoading}
              icon={<CheckCircle2 size={14} />}
              onClick={() => handlePeriodAction('approve', 'Đã duyệt kỳ lương thành công.')}
              style={{ background: '#2563eb', fontSize: 12, height: 32 }}
            >
              Duyệt kỳ lương
            </Button>
          )}

          {detail.trangThai === 'DA_DUYET' && (
            <Button
              type="primary"
              loading={actionLoading}
              icon={<Lock size={14} />}
              onClick={() => handlePeriodAction('close', 'Đã chốt sổ kỳ lương.')}
              style={{ background: '#d97706', borderColor: '#d97706', fontSize: 12, height: 32 }}
            >
              Chốt sổ kỳ lương
            </Button>
          )}

          {detail.trangThai === 'DA_CHOT' && (
            <Button
              type="primary"
              loading={actionLoading}
              icon={<CreditCard size={14} />}
              onClick={() => handlePeriodAction('pay', 'Đã đánh dấu hoàn tất thanh toán kỳ lương.')}
              style={{ background: '#16a34a', fontSize: 12, height: 32 }}
            >
              Xác nhận thanh toán
            </Button>
          )}

          {(detail.trangThai === 'DA_CHOT' || detail.trangThai === 'DA_THANH_TOAN') && !detail.isPublished && (
            <Button
              type="primary"
              loading={actionLoading}
              icon={<Eye size={14} />}
              onClick={() => handlePeriodAction('publish', 'Đã công bố phiếu lương cho nhân viên xem.')}
              style={{ background: '#0891b2', fontSize: 12, height: 32 }}
            >
              Công bố cho nhân viên
            </Button>
          )}

          {detail.isPublished && detail.trangThai === 'DA_CHOT' && (
            <Button
              loading={actionLoading}
              icon={<EyeOff size={14} />}
              danger
              onClick={() => handlePeriodAction('unpublish', 'Đã hủy công bố kỳ lương.')}
              style={{ fontSize: 12, height: 32 }}
            >
              Hủy công bố
            </Button>
          )}

          <Button
            icon={<FileSpreadsheet size={14} />}
            onClick={exportCsv}
            disabled={!detail.bangLuongs?.length}
            style={{ fontSize: 12, height: 32 }}
          >
            Xuất Excel
          </Button>
        </Space>
      </div>

      {/* STEPPER TIẾN TRÌNH KỲ LƯƠNG */}
      <Card size="small" style={{ marginBottom: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
        <Steps
          size="small"
          current={stepCurrent}
          items={[
            { title: '1. Khởi tạo', description: 'Tạo kỳ nháp' },
            { title: '2. Tính lương', description: 'Tổng hợp công & OT' },
            { title: '3. Phê duyệt', description: 'Kế toán & Trưởng phòng' },
            { title: '4. Chốt số liệu', description: 'Đóng băng dữ liệu' },
            { title: '5. Thanh toán', description: 'Ghi nhận chi trả' },
            { title: '6. Công bố', description: 'Phát hành cho NV xem' },
          ]}
        />
      </Card>

      {/* KHU 1: KPI DASHBOARD (CHUẨN KẾ TOÁN, TRIỆT TIÊU MÀU LÒE LOẸT) */}
      <PayrollKpiDashboard kpi={detail.kpi} />

      {/* KHU 2: BỘ LỌC ĐA TIÊU CHÍ */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          padding: '12px 16px',
          marginBottom: 14,
        }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm kiếm theo Tên hoặc Mã nhân viên..."
              prefix={<Search size={14} style={{ color: '#94a3b8' }} />}
              value={searchKeyword}
              onChange={(e) => {
                setSearchKeyword(e.target.value);
                setPagination((p) => ({ ...p, current: 1 }));
              }}
              allowClear
              style={{ height: 36, fontSize: 12 }}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%', height: 36 }}
              value={selectedKhoa}
              onChange={(val) => {
                setSelectedKhoa(val);
                setPagination((p) => ({ ...p, current: 1 }));
              }}
              options={departmentOptions}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%', height: 36 }}
              value={quickFilter}
              onChange={(val) => {
                setQuickFilter(val);
                setPagination((p) => ({ ...p, current: 1 }));
              }}
              options={[
                { value: 'ALL', label: 'Tất cả trạng thái công' },
                { value: 'ABNORMAL', label: `Ca bất thường cần xử lý (${abnormalLines.length})` },
                { value: 'HAS_OT', label: 'Nhân viên có làm thêm OT' },
                { value: 'HAS_LATE', label: 'Nhân viên bị phạt đi muộn' },
                { value: 'HAS_DEBT', label: 'Nhân viên phát sinh nợ lương' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={4} style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              Hiển thị: <strong>{filteredLines.length}</strong> / {detail.bangLuongs.length} nhân viên
            </span>
          </Col>
        </Row>
      </div>

      {/* ===================================================================== */}
      {/* KHU 3: BẢNG LƯƠNG EXCEL CHỐNG TRÀN CHỮ & KÉO THẢ RESIZE 3 TẦNG        */}
      {/* ===================================================================== */}
      {/* TẦNG 1: KHUNG CHỨA RESIZE CẢ BẢNG (resize: both, minWidth 700) */}
      <div
        style={{
          resize: 'both',
          overflow: 'auto',
          minWidth: 700,
          minHeight: 320,
          maxHeight: 'calc(100vh - 160px)',
          border: '2px solid #cbd5e1',
          borderRadius: 8,
          position: 'relative',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <table
          className="table-fixed w-max min-w-full border-collapse border border-slate-300 divide-x divide-y divide-slate-300 bg-white"
          style={{
            tableLayout: 'fixed',
            width: 'max-content',
            minWidth: '100%',
            borderCollapse: 'collapse',
            backgroundColor: '#ffffff',
          }}
        >
          {/* CẤU TRÚC ĐỘ RỘNG CỘT CỐ ĐỊNH CHỐNG PHÌNH VỠ */}
          <colgroup>
            <col style={{ width: colWidths.stt }} />
            <col style={{ width: colWidths.maNhanVien }} />
            <col style={{ width: colWidths.tenNhanVien }} />
            <col style={{ width: colWidths.chucDanh }} />
            <col style={{ width: colWidths.khoa }} />
            <col style={{ width: colWidths.luongCoBan }} />
            <col style={{ width: colWidths.ngayCong }} />
            <col style={{ width: colWidths.luongTheoNgayCong }} />
            <col style={{ width: colWidths.tienTangCa }} />
            <col style={{ width: colWidths.tongPhuCap }} />
            <col style={{ width: colWidths.tienThuLaoHis }} />
            <col style={{ width: colWidths.tienBaoHiem }} />
            <col style={{ width: colWidths.khauTru }} />
            <col style={{ width: colWidths.thucLinh }} />
            <col style={{ width: colWidths.thaoTac }} />
          </colgroup>

          {/* THEAD CÓ RESIZER TỪNG CỘT (TẦNG 2) */}
          <thead style={{ position: 'sticky', top: 0, zIndex: 30 }}>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
              {/* STT (STICKY TRÁI) */}
              <th
                className="w-12 min-w-[48px] max-w-[48px] text-center font-mono font-semibold bg-slate-100 text-slate-700 sticky left-0 z-30 border-r border-slate-300"
                style={{
                  width: colWidths.stt,
                  minWidth: 48,
                  maxWidth: 48,
                  textAlign: 'center',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  borderRight: '1px solid #cbd5e1',
                  borderBottom: '1px solid #cbd5e1',
                  position: 'sticky',
                  left: 0,
                  zIndex: 40,
                  padding: '8px 2px',
                  userSelect: 'none',
                }}
              >
                <span>STT</span>
              </th>

              {/* MÃ NV */}
              <th
                style={{
                  position: 'relative',
                  width: colWidths.maNhanVien,
                  textAlign: 'left',
                  padding: '8px 8px',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: '#475569',
                  borderRight: '1px solid #cbd5e1',
                  borderBottom: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  userSelect: 'none',
                }}
              >
                <div className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">Mã NV</div>
                <div
                  className="w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-600 active:bg-blue-700 z-20 select-none"
                  style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, cursor: 'col-resize', zIndex: 20 }}
                  onMouseDown={(e) => handleColResize('maNhanVien', e)}
                />
              </th>

              {/* HỌ VÀ TÊN */}
              <th
                style={{
                  position: 'relative',
                  width: colWidths.tenNhanVien,
                  textAlign: 'left',
                  padding: '8px 10px',
                  fontWeight: 700,
                  color: '#0f172a',
                  borderRight: '1px solid #cbd5e1',
                  borderBottom: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  userSelect: 'none',
                }}
              >
                <div className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">Họ tên nhân viên</div>
                <div
                  className="w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-600 active:bg-blue-700 z-20 select-none"
                  style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, cursor: 'col-resize', zIndex: 20 }}
                  onMouseDown={(e) => handleColResize('tenNhanVien', e)}
                />
              </th>

              {/* CHỨC DANH */}
              <th
                style={{
                  position: 'relative',
                  width: colWidths.chucDanh,
                  textAlign: 'left',
                  padding: '8px 8px',
                  fontWeight: 600,
                  color: '#475569',
                  borderRight: '1px solid #cbd5e1',
                  borderBottom: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  userSelect: 'none',
                }}
              >
                <div className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">Chức danh</div>
                <div
                  className="w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-600 active:bg-blue-700 z-20 select-none"
                  style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, cursor: 'col-resize', zIndex: 20 }}
                  onMouseDown={(e) => handleColResize('chucDanh', e)}
                />
              </th>

              {/* KHOA / PHÒNG */}
              <th
                style={{
                  position: 'relative',
                  width: colWidths.khoa,
                  textAlign: 'left',
                  padding: '8px 8px',
                  fontWeight: 600,
                  color: '#475569',
                  borderRight: '1px solid #cbd5e1',
                  borderBottom: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  userSelect: 'none',
                }}
              >
                <div className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">Khoa / Phòng</div>
                <div
                  className="w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-600 active:bg-blue-700 z-20 select-none"
                  style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, cursor: 'col-resize', zIndex: 20 }}
                  onMouseDown={(e) => handleColResize('khoa', e)}
                />
              </th>

              {/* LƯƠNG CƠ BẢN */}
              <th
                style={{
                  position: 'relative',
                  width: colWidths.luongCoBan,
                  textAlign: 'right',
                  padding: '8px 10px',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: '#1e293b',
                  borderRight: '1px solid #cbd5e1',
                  borderBottom: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  userSelect: 'none',
                }}
              >
                <div className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-right">Lương cơ bản</div>
                <div
                  className="w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-600 active:bg-blue-700 z-20 select-none"
                  style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, cursor: 'col-resize', zIndex: 20 }}
                  onMouseDown={(e) => handleColResize('luongCoBan', e)}
                />
              </th>

              {/* NGÀY CÔNG */}
              <th
                style={{
                  position: 'relative',
                  width: colWidths.ngayCong,
                  textAlign: 'center',
                  padding: '8px 4px',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: '#475569',
                  borderRight: '1px solid #cbd5e1',
                  borderBottom: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  userSelect: 'none',
                }}
              >
                <div className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-center">Ngày công</div>
                <div
                  className="w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-600 active:bg-blue-700 z-20 select-none"
                  style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, cursor: 'col-resize', zIndex: 20 }}
                  onMouseDown={(e) => handleColResize('ngayCong', e)}
                />
              </th>

              {/* LƯƠNG THEO CÔNG */}
              <th
                style={{
                  position: 'relative',
                  width: colWidths.luongTheoNgayCong,
                  textAlign: 'right',
                  padding: '8px 10px',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: '#1e293b',
                  borderRight: '1px solid #cbd5e1',
                  borderBottom: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  userSelect: 'none',
                }}
              >
                <div className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-right">Lương ngày công</div>
                <div
                  className="w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-600 active:bg-blue-700 z-20 select-none"
                  style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, cursor: 'col-resize', zIndex: 20 }}
                  onMouseDown={(e) => handleColResize('luongTheoNgayCong', e)}
                />
              </th>

              {/* TĂNG CA OT */}
              <th
                style={{
                  position: 'relative',
                  width: colWidths.tienTangCa,
                  textAlign: 'right',
                  padding: '8px 8px',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: '#1e293b',
                  borderRight: '1px solid #cbd5e1',
                  borderBottom: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  userSelect: 'none',
                }}
              >
                <div className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-right">Tăng ca OT</div>
                <div
                  className="w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-600 active:bg-blue-700 z-20 select-none"
                  style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, cursor: 'col-resize', zIndex: 20 }}
                  onMouseDown={(e) => handleColResize('tienTangCa', e)}
                />
              </th>

              {/* PHỤ CẤP */}
              <th
                style={{
                  position: 'relative',
                  width: colWidths.tongPhuCap,
                  textAlign: 'right',
                  padding: '8px 8px',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: '#1e293b',
                  borderRight: '1px solid #cbd5e1',
                  borderBottom: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  userSelect: 'none',
                }}
              >
                <div className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-right">Phụ cấp</div>
                <div
                  className="w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-600 active:bg-blue-700 z-20 select-none"
                  style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, cursor: 'col-resize', zIndex: 20 }}
                  onMouseDown={(e) => handleColResize('tongPhuCap', e)}
                />
              </th>

              {/* THÙ LAO HIS */}
              <th
                style={{
                  position: 'relative',
                  width: colWidths.tienThuLaoHis,
                  textAlign: 'right',
                  padding: '8px 8px',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: '#1e293b',
                  borderRight: '1px solid #cbd5e1',
                  borderBottom: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  userSelect: 'none',
                }}
              >
                <div className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-right">Thù lao HIS</div>
                <div
                  className="w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-600 active:bg-blue-700 z-20 select-none"
                  style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, cursor: 'col-resize', zIndex: 20 }}
                  onMouseDown={(e) => handleColResize('tienThuLaoHis', e)}
                />
              </th>

              {/* BẢO HIỂM */}
              <th
                style={{
                  position: 'relative',
                  width: colWidths.tienBaoHiem,
                  textAlign: 'right',
                  padding: '8px 8px',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: '#be123c',
                  borderRight: '1px solid #cbd5e1',
                  borderBottom: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  userSelect: 'none',
                }}
              >
                <div className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-right">Bảo hiểm (10.5%)</div>
                <div
                  className="w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-600 active:bg-blue-700 z-20 select-none"
                  style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, cursor: 'col-resize', zIndex: 20 }}
                  onMouseDown={(e) => handleColResize('tienBaoHiem', e)}
                />
              </th>

              {/* KHẤU TRỪ */}
              <th
                style={{
                  position: 'relative',
                  width: colWidths.khauTru,
                  textAlign: 'right',
                  padding: '8px 8px',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: '#be123c',
                  borderRight: '1px solid #cbd5e1',
                  borderBottom: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  userSelect: 'none',
                }}
              >
                <div className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-right">Khấu trừ</div>
                <div
                  className="w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-600 active:bg-blue-700 z-20 select-none"
                  style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, cursor: 'col-resize', zIndex: 20 }}
                  onMouseDown={(e) => handleColResize('khauTru', e)}
                />
              </th>

              {/* THỰC LĨNH */}
              <th
                style={{
                  position: 'relative',
                  width: colWidths.thucLinh,
                  textAlign: 'right',
                  padding: '8px 10px',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: '#0f172a',
                  borderRight: '1px solid #cbd5e1',
                  borderBottom: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  userSelect: 'none',
                }}
              >
                <div className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-right">Thực lĩnh</div>
                <div
                  className="w-1.5 h-full absolute right-0 top-0 cursor-col-resize hover:bg-blue-600 active:bg-blue-700 z-20 select-none"
                  style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, cursor: 'col-resize', zIndex: 20 }}
                  onMouseDown={(e) => handleColResize('thucLinh', e)}
                />
              </th>

              {/* THAO TÁC (•••) */}
              <th
                style={{
                  width: colWidths.thaoTac,
                  textAlign: 'center',
                  padding: '8px 2px',
                  fontWeight: 600,
                  color: '#475569',
                  borderBottom: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  userSelect: 'none',
                }}
              >
                <span>•••</span>
              </th>
            </tr>
          </thead>

          {/* TBODY CÓ KHÓA CHỐNG TRÀN CHỮ VÀ RESIZER CHIỀU CAO HÀNG (TẦNG 3) */}
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={15} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                  Đang tải bảng lương...
                </td>
              </tr>
            ) : paginatedLines.length === 0 ? (
              <tr>
                <td colSpan={15} style={{ textAlign: 'center', padding: '50px 0', color: '#94a3b8' }}>
                  Chưa có bảng lương. Hãy bấm nút "Tính lương" để hệ thống tính toán tự động.
                </td>
              </tr>
            ) : (
              paginatedLines.map((row, index) => {
                const globalIndex = (pagination.current - 1) * pagination.pageSize + index + 1;
                const rHeight = rowHeights[row.id] || 40;
                const hisTotal = Number(row.tongThuLaoHis || 0);
                const deductTotal = Math.max(0, Number(row.tongGiamTru || 0) - Number(row.tienBaoHiem || 0));
                const debt = Number(row.tienNoKyNay || 0);

                return (
                  <tr
                    key={row.id}
                    style={{
                      position: 'relative',
                      height: rHeight,
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                      transition: 'background 0.1s ease',
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    {/* CỘT STT (STICKY TRÁI) */}
                    <td
                      className="w-12 min-w-[48px] max-w-[48px] text-center font-mono font-semibold bg-slate-100 text-slate-700 sticky left-0 z-30 border-r border-slate-300"
                      style={{
                        height: rHeight,
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        backgroundColor: index % 2 === 0 ? '#f8fafc' : '#f1f5f9',
                        color: '#64748b',
                        borderRight: '1px solid #cbd5e1',
                        borderBottom: '1px solid #e2e8f0',
                        position: 'sticky',
                        left: 0,
                        zIndex: 25,
                        verticalAlign: 'middle',
                        padding: 0,
                      }}
                    >
                      <div className="w-full text-center">{globalIndex}</div>
                    </td>

                    {/* MÃ NV */}
                    <td
                      style={{
                        height: rHeight,
                        verticalAlign: 'middle',
                        borderRight: '1px solid #cbd5e1',
                        borderBottom: '1px solid #e2e8f0',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        color: '#0369a1',
                        padding: 0,
                      }}
                    >
                      <div
                        className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-2"
                        title={`#${row.maNhanVien}`}
                      >
                        #{row.maNhanVien}
                      </div>
                    </td>

                    {/* HỌ TÊN NHÂN VIÊN */}
                    <td
                      style={{
                        height: rHeight,
                        verticalAlign: 'middle',
                        borderRight: '1px solid #cbd5e1',
                        borderBottom: '1px solid #e2e8f0',
                        fontWeight: 600,
                        color: '#0f172a',
                        padding: 0,
                      }}
                    >
                      <div
                        className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-2"
                        title={row.tenNhanVien}
                      >
                        {row.tenNhanVien}
                      </div>
                    </td>

                    {/* CHỨC DANH */}
                    <td
                      style={{
                        height: rHeight,
                        verticalAlign: 'middle',
                        borderRight: '1px solid #cbd5e1',
                        borderBottom: '1px solid #e2e8f0',
                        color: '#475569',
                        padding: 0,
                      }}
                    >
                      <div
                        className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-2"
                        title={row.chucDanh || ''}
                      >
                        {row.chucDanh || '—'}
                      </div>
                    </td>

                    {/* KHOA / PHÒNG */}
                    <td
                      style={{
                        height: rHeight,
                        verticalAlign: 'middle',
                        borderRight: '1px solid #cbd5e1',
                        borderBottom: '1px solid #e2e8f0',
                        color: '#475569',
                        padding: 0,
                      }}
                    >
                      <div
                        className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-2"
                        title={row.tenKhoa || ''}
                      >
                        {row.tenKhoa || '—'}
                      </div>
                    </td>

                    {/* LƯƠNG CƠ BẢN */}
                    <td
                      style={{
                        height: rHeight,
                        verticalAlign: 'middle',
                        borderRight: '1px solid #cbd5e1',
                        borderBottom: '1px solid #e2e8f0',
                        fontFamily: 'monospace',
                        fontVariantNumeric: 'tabular-nums',
                        color: '#1e293b',
                        padding: 0,
                      }}
                    >
                      <div
                        className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-2 text-right"
                        title={money(row.luongCoBan)}
                      >
                        {money(row.luongCoBan)}
                      </div>
                    </td>

                    {/* NGÀY CÔNG (CĂN GIỮA) */}
                    <td
                      style={{
                        height: rHeight,
                        verticalAlign: 'middle',
                        borderRight: '1px solid #cbd5e1',
                        borderBottom: '1px solid #e2e8f0',
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        fontVariantNumeric: 'tabular-nums',
                        padding: 0,
                      }}
                    >
                      <div
                        className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-1 text-center"
                        title={`${row.soNgayCong}/26 công`}
                      >
                        <strong style={{ color: '#0f172a' }}>{row.soNgayCong}</strong>/26
                      </div>
                    </td>

                    {/* LƯƠNG NGÀY CÔNG */}
                    <td
                      style={{
                        height: rHeight,
                        verticalAlign: 'middle',
                        borderRight: '1px solid #cbd5e1',
                        borderBottom: '1px solid #e2e8f0',
                        fontFamily: 'monospace',
                        fontVariantNumeric: 'tabular-nums',
                        color: '#1e293b',
                        padding: 0,
                      }}
                    >
                      <div
                        className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-2 text-right"
                        title={money(row.luongTheoNgayCong)}
                      >
                        {money(row.luongTheoNgayCong)}
                      </div>
                    </td>

                    {/* TĂNG CA OT */}
                    <td
                      style={{
                        height: rHeight,
                        verticalAlign: 'middle',
                        borderRight: '1px solid #cbd5e1',
                        borderBottom: '1px solid #e2e8f0',
                        fontFamily: 'monospace',
                        fontVariantNumeric: 'tabular-nums',
                        color: '#1e293b',
                        padding: 0,
                      }}
                    >
                      <div
                        className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-2 text-right"
                        title={row.tienTangCa > 0 ? `+${money(row.tienTangCa)}` : '0 đ'}
                      >
                        {row.tienTangCa > 0 ? `+${money(row.tienTangCa)}` : '—'}
                      </div>
                    </td>

                    {/* PHỤ CẤP */}
                    <td
                      style={{
                        height: rHeight,
                        verticalAlign: 'middle',
                        borderRight: '1px solid #cbd5e1',
                        borderBottom: '1px solid #e2e8f0',
                        fontFamily: 'monospace',
                        fontVariantNumeric: 'tabular-nums',
                        color: '#1e293b',
                        padding: 0,
                      }}
                    >
                      <div
                        className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-2 text-right"
                        title={row.tongPhuCap > 0 ? `+${money(row.tongPhuCap)}` : '0 đ'}
                      >
                        {row.tongPhuCap > 0 ? `+${money(row.tongPhuCap)}` : '—'}
                      </div>
                    </td>

                    {/* THÙ LAO HIS */}
                    <td
                      style={{
                        height: rHeight,
                        verticalAlign: 'middle',
                        borderRight: '1px solid #cbd5e1',
                        borderBottom: '1px solid #e2e8f0',
                        fontFamily: 'monospace',
                        fontVariantNumeric: 'tabular-nums',
                        color: '#1e293b',
                        padding: 0,
                      }}
                    >
                      <div
                        className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-2 text-right"
                        title={hisTotal > 0 ? `+${money(hisTotal)} (Khám: ${money(row.tienThuLaoKham)} | CLS: ${money(row.tienHoaHongCls)})` : '0 đ'}
                      >
                        {hisTotal > 0 ? `+${money(hisTotal)}` : '—'}
                      </div>
                    </td>

                    {/* BẢO HIỂM (ROSE-700) */}
                    <td
                      style={{
                        height: rHeight,
                        verticalAlign: 'middle',
                        borderRight: '1px solid #cbd5e1',
                        borderBottom: '1px solid #e2e8f0',
                        fontFamily: 'monospace',
                        fontVariantNumeric: 'tabular-nums',
                        color: '#be123c',
                        padding: 0,
                      }}
                    >
                      <div
                        className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-2 text-right"
                        title={`-${money(row.tienBaoHiem)}`}
                      >
                        -{money(row.tienBaoHiem)}
                      </div>
                    </td>

                    {/* KHẤU TRỪ NGHỈ/TRỄ/KHÁC (ROSE-700) */}
                    <td
                      style={{
                        height: rHeight,
                        verticalAlign: 'middle',
                        borderRight: '1px solid #cbd5e1',
                        borderBottom: '1px solid #e2e8f0',
                        fontFamily: 'monospace',
                        fontVariantNumeric: 'tabular-nums',
                        color: '#be123c',
                        padding: 0,
                      }}
                    >
                      <div
                        className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-2 text-right"
                        title={deductTotal > 0 ? `-${money(deductTotal)}` : '0 đ'}
                      >
                        {deductTotal > 0 ? `-${money(deductTotal)}` : '—'}
                      </div>
                    </td>

                    {/* THỰC LĨNH (FONT-MONO FONT-BOLD TEXT-SLATE-900) */}
                    <td
                      style={{
                        height: rHeight,
                        verticalAlign: 'middle',
                        borderRight: '1px solid #cbd5e1',
                        borderBottom: '1px solid #e2e8f0',
                        fontFamily: 'monospace',
                        fontVariantNumeric: 'tabular-nums',
                        fontWeight: 700,
                        color: '#0f172a',
                        padding: 0,
                      }}
                    >
                      <div
                        className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-2 text-right"
                        title={debt > 0 ? `0 đ (Nợ: -${money(debt)})` : money(row.thucLinh)}
                      >
                        {debt > 0 ? (
                          <span>
                            0 đ <span style={{ color: '#be123c', fontSize: 11 }}>(Nợ: -{money(debt)})</span>
                          </span>
                        ) : (
                          money(row.thucLinh)
                        )}
                      </div>
                    </td>

                    {/* THAO TÁC: THU GỌN THÀNH NÚT ••• (DROPDOWN) */}
                    <td
                      style={{
                        height: rHeight,
                        verticalAlign: 'middle',
                        textAlign: 'center',
                        borderBottom: '1px solid #e2e8f0',
                        padding: 0,
                      }}
                    >
                      <Dropdown
                        menu={{
                          items: [
                            {
                              key: 'details',
                              icon: <FileText size={14} />,
                              label: 'Xem chi tiết phiếu lương',
                              onClick: () => {
                                setDrawerLine(row);
                                setDrawerOpen(true);
                              },
                            },
                            ...((detail.trangThai === 'NHAP' || detail.trangThai === 'DA_DUYET')
                              ? [
                                  {
                                    key: 'recalculate',
                                    icon: <RefreshCw size={14} />,
                                    label: 'Tính lại lương',
                                    onClick: () => handleRecalculateSingle(row.id),
                                  },
                                ]
                              : []),
                            {
                              key: 'lock',
                              icon: <Lock size={14} />,
                              label: detail.trangThai === 'DA_CHOT' ? 'Đã khóa sổ' : 'Khóa bảng lương',
                              disabled: detail.trangThai === 'DA_CHOT',
                              onClick: () => {
                                if (detail.trangThai !== 'DA_CHOT') {
                                  handlePeriodAction('close', 'Đã chốt sổ kỳ lương.');
                                }
                              },
                            },
                            {
                              type: 'divider',
                            },
                            {
                              key: 'print',
                              icon: <Printer size={14} />,
                              label: 'In phiếu lương A4',
                              onClick: () => {
                                setPrintLine(row);
                                setPrintModalOpen(true);
                              },
                            },
                          ],
                        }}
                        trigger={['click']}
                        placement="bottomRight"
                      >
                        <button
                          type="button"
                          className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-200 text-slate-600 font-bold text-sm tracking-widest mx-auto"
                          style={{
                            width: 28,
                            height: 28,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 4,
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            color: '#475569',
                            fontWeight: 700,
                            fontSize: 13,
                            letterSpacing: '0.12em',
                            cursor: 'pointer',
                            margin: '0 auto',
                            lineHeight: 1,
                          }}
                          title="Tùy chọn thao tác"
                        >
                          •••
                        </button>
                      </Dropdown>
                    </td>

                    {/* TAY NẮM RESIZE CHIỀU CAO HÀNG (TẦNG 3) */}
                    <div
                      className="h-1.5 w-full absolute left-0 bottom-0 cursor-row-resize hover:bg-blue-600 active:bg-blue-700 z-10 select-none"
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: 5,
                        cursor: 'row-resize',
                        zIndex: 10,
                      }}
                      onMouseDown={(e) => handleRowResize(row.id, e)}
                    />
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PHÂN TRANG EXCEL GRID */}
      {filteredLines.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 12,
            padding: '8px 4px',
          }}
        >
          <div style={{ fontSize: 12, color: '#64748b' }}>
            Tổng số: <strong>{filteredLines.length}</strong> nhân sự • Trang{' '}
            <strong>{pagination.current}</strong> / {Math.ceil(filteredLines.length / pagination.pageSize)}
          </div>
          <Pagination
            size="small"
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={filteredLines.length}
            pageSizeOptions={['15', '20', '50', '100']}
            showSizeChanger
            onChange={(page, pageSize) => setPagination({ current: page, pageSize })}
          />
        </div>
      )}

      {/* KHU 4: DRAWER PHIẾU LƯƠNG & CHẤM CÔNG */}
      <PayslipDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerLine(null);
        }}
        line={drawerLine}
        periodStatus={detail.trangThai}
        onLineUpdated={handleLineUpdated}
      />

      {/* KHU 5: MẪU IN PHIẾU LƯƠNG A4/A5 */}
      <PayslipPrintModal
        open={printModalOpen}
        onClose={() => {
          setPrintModalOpen(false);
          setPrintLine(null);
        }}
        line={printLine}
        period={detail}
      />
    </div>
  );
};
