import { useEffect, useState, useMemo } from 'react';
import { App, Button, Input, Select, Space, Tag, Tooltip, Pagination } from 'antd';
import {
  HolderOutlined,
  SearchOutlined as AntSearchOutlined,
  CloseOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons';
import { RefreshCw, Plus, Calendar, DollarSign } from 'lucide-react';
import dayjs from 'dayjs';
import { payrollApi } from './payroll.api';
import { PayrollDetailPage } from './pages/PayrollDetailPage';
import { CreatePayrollPeriodWorkspace } from './components/CreatePayrollPeriodWorkspace';
import { useExcelGridResizer } from '../../shared/hooks/useExcelGridResizer';
import '../../styles/excel-grid.css';

const statusLabels = {
  NHAP: 'Nháp',
  DA_DUYET: 'Đã duyệt',
  DA_CHOT: 'Đã chốt',
  DA_THANH_TOAN: 'Đã thanh toán',
};
const statusColors = { NHAP: 'default', DA_DUYET: 'blue', DA_CHOT: 'orange', DA_THANH_TOAN: 'green' };

const ALL_COLUMNS = [
  { key: 'stt', label: 'STT', align: 'center', isFixed: true },
  { key: 'kyLuong', label: 'KỲ LƯƠNG', align: 'left' },
  { key: 'khoangThoiGian', label: 'KHOẢNG THỜI GIAN', align: 'left' },
  { key: 'soBangLuong', label: 'SỐ BẢNG LƯƠNG', align: 'center' },
  { key: 'trangThai', label: 'TRẠNG THÁI', align: 'center' },
  { key: 'thaoTac', label: 'THAO TÁC', align: 'center', isFixed: true },
];

const DEFAULT_COL_ORDER = ['stt', 'kyLuong', 'khoangThoiGian', 'soBangLuong', 'trangThai', 'thaoTac'];

export const PayrollManagement = () => {
  const { message } = App.useApp();
  const [periods, setPeriods] = useState([]);
  const [attendancePeriods, setAttendancePeriods] = useState([]);
  const [detail, setDetail] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filters & Pagination
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Resizer
  const { colWidths, startColResize } = useExcelGridResizer({
    stt: 55,
    kyLuong: 160,
    khoangThoiGian: 230,
    soBangLuong: 130,
    trangThai: 160,
    thaoTac: 320,
  });

  // Column Reordering
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

  const load = async () => {
    setLoading(true);
    try {
      const response = await payrollApi.getPeriods();
      setPeriods(response.data.data || []);
    } catch (error) {
      message.error(error?.response?.data?.message || 'Không thể tải kỳ lương.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
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
      })
      .finally(() => {
        if (active) setLoading(false);
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

  // Filter periods
  const filteredPeriods = useMemo(() => {
    return periods.filter((item) => {
      if (statusFilter !== 'ALL' && item.trangThai !== statusFilter) {
        return false;
      }
      if (keyword.trim()) {
        const kw = keyword.toLowerCase().trim();
        const matchKy = `tháng ${item.thang}/${item.nam}`.toLowerCase().includes(kw) ||
          `${item.thang}/${item.nam}`.includes(kw);
        const matchStatus = (statusLabels[item.trangThai] || '').toLowerCase().includes(kw);
        if (!matchKy && !matchStatus) return false;
      }
      return true;
    });
  }, [periods, keyword, statusFilter]);

  // Row reordering
  const [orderedPeriods, setOrderedPeriods] = useState([]);
  const [draggedRowId, setDraggedRowId] = useState(null);

  useEffect(() => {
    setOrderedPeriods(filteredPeriods);
  }, [filteredPeriods]);

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
    const current = [...orderedPeriods];
    const fromIdx = current.findIndex((i) => i.id === draggedRowId);
    const toIdx = current.findIndex((i) => i.id === targetId);
    if (fromIdx !== -1 && toIdx !== -1) {
      const [moved] = current.splice(fromIdx, 1);
      current.splice(toIdx, 0, moved);
      setOrderedPeriods(current);
    }
    setDraggedRowId(null);
  };

  // Paginated items
  const paginatedData = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize;
    return orderedPeriods.slice(start, start + pagination.pageSize);
  }, [orderedPeriods, pagination]);

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

  const renderCellContent = (colKey, row, index) => {
    switch (colKey) {
      case 'stt': {
        const stt = (pagination.current - 1) * pagination.pageSize + index + 1;
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <span title="Kéo thả đổi vị trí dòng" style={{ cursor: 'grab', color: '#94a3b8' }}>
              <HolderOutlined style={{ fontSize: 11 }} />
            </span>
            <span className="font-mono" style={{ fontWeight: 600, color: '#64748b' }}>
              {stt}
            </span>
          </div>
        );
      }

      case 'kyLuong':
        return (
          <a
            onClick={() => openDetail(row.id)}
            style={{
              fontWeight: 600,
              color: '#0b4f6c',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            <Calendar size={14} color="#0b4f6c" />
            <span>Tháng {row.thang}/{row.nam}</span>
          </a>
        );

      case 'khoangThoiGian':
        return (
          <span className="font-mono text-slate-700" style={{ fontSize: 12 }}>
            {dayjs(row.tuNgay).format('DD/MM/YYYY')} - {dayjs(row.denNgay).format('DD/MM/YYYY')}
          </span>
        );

      case 'soBangLuong':
        return (
          <Tag color="geekblue" style={{ borderRadius: 10, fontWeight: 600, margin: 0 }}>
            {row.soBangLuong || 0} nhân sự
          </Tag>
        );

      case 'trangThai': {
        const value = row.trangThai;
        return (
          <Space size={3} direction="vertical" style={{ alignItems: 'center' }}>
            <Tag color={statusColors[value] || 'default'} style={{ margin: 0 }}>
              {statusLabels[value] || value}
            </Tag>
            {row.isPublished ? (
              <Tag color="cyan" style={{ fontSize: 10.5, margin: 0 }}>✓ Đã công bố</Tag>
            ) : value === 'DA_CHOT' || value === 'DA_THANH_TOAN' ? (
              <Tag color="default" style={{ fontSize: 10.5, color: '#94a3b8', margin: 0 }}>Chưa công bố</Tag>
            ) : null}
          </Space>
        );
      }

      case 'thaoTac':
        return (
          <Space wrap size={4}>
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
        );

      default:
        return null;
    }
  };

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
        padding: isFullscreen ? '16px' : '4px 0 16px 0',
      }}
    >
      {/* Top Action Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
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
        <Space wrap>
          <Button
            type="primary"
            icon={<Plus size={15} />}
            onClick={() => setOpen(true)}
            style={{ background: '#0b4f6c', borderColor: '#0b4f6c', borderRadius: 8, height: 34 }}
          >
            Tạo kỳ tính lương
          </Button>
          <Button
            icon={<RefreshCw size={14} />}
            onClick={load}
            loading={loading}
            style={{ borderRadius: 8, height: 34 }}
          >
            Làm mới
          </Button>
          <Button
            icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{ borderRadius: 8, height: 34 }}
          >
            {isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
          </Button>
        </Space>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 10,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          <Input
            placeholder="Tìm theo tháng/năm, trạng thái..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPagination((p) => ({ ...p, current: 1 }));
            }}
            prefix={<AntSearchOutlined style={{ color: '#94a3b8' }} />}
            allowClear
            style={{ width: 280, borderRadius: 6 }}
          />
        </div>

        <Select
          value={statusFilter}
          onChange={(val) => {
            setStatusFilter(val);
            setPagination((p) => ({ ...p, current: 1 }));
          }}
          style={{ width: 180 }}
          options={[
            { value: 'ALL', label: 'Tất cả trạng thái' },
            { value: 'NHAP', label: 'Nháp' },
            { value: 'DA_DUYET', label: 'Đã duyệt' },
            { value: 'DA_CHOT', label: 'Đã chốt' },
            { value: 'DA_THANH_TOAN', label: 'Đã thanh toán' },
          ]}
        />

        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#64748b' }}>
          Hiển thị: <strong>{filteredPeriods.length}</strong> / {periods.length} kỳ lương
        </div>
      </div>

      {/* Excel Data Grid Table */}
      <div className="excel-grid-container" style={{ flex: 1, minHeight: 280 }}>
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
                      borderLeft: isDragOver ? '2px solid #0b4f6c' : undefined,
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

          {/* Table Body */}
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={colOrder.length} style={{ padding: 40, textAlign: 'center', background: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#64748b' }}>
                    <span style={{ fontSize: 18 }}>⏳</span>
                    <span>Đang tải danh sách kỳ lương...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={colOrder.length} style={{ padding: 40, textAlign: 'center', background: '#fff', color: '#94a3b8' }}>
                  Chưa có kỳ lương nào phù hợp với bộ lọc tìm kiếm.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => {
                const isDraggingRow = draggedRowId === row.id;
                return (
                  <tr
                    key={row.id}
                    className="h-9"
                    style={{
                      opacity: isDraggingRow ? 0.4 : 1,
                      backgroundColor: isDraggingRow ? '#f0fdf4' : undefined,
                    }}
                    draggable
                    onDragStart={(e) => handleRowDragStart(e, row.id)}
                    onDragOver={handleRowDragOver}
                    onDrop={(e) => handleRowDrop(e, row.id)}
                  >
                    {colOrder.map((colKey) => {
                      const colDef = ALL_COLUMNS.find((c) => c.key === colKey);
                      return (
                        <td
                          key={colKey}
                          className={`${colKey === 'stt' ? 'col-stt' : ''} text-${colDef?.align || 'left'}`}
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
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

      {/* Footer Pagination Bar */}
      <div
        className="excel-grid-footer"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 10,
          padding: '6px 4px',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div style={{ fontSize: 12, color: '#64748b' }}>
          Tổng cộng: <strong>{filteredPeriods.length}</strong> kỳ lương • Trang{' '}
          <strong>{pagination.current}</strong> / {Math.max(1, Math.ceil(filteredPeriods.length / pagination.pageSize))}
        </div>
        <Pagination
          size="small"
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={filteredPeriods.length}
          showSizeChanger
          pageSizeOptions={['10', '20', '50', '100']}
          onChange={(current, pageSize) => setPagination({ current, pageSize })}
        />
      </div>

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

