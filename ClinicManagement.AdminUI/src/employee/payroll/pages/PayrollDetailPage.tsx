import React, { useMemo, useState } from 'react';
import {
  App,
  Button,
  Card,
  Col,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
  Steps,
  Table,
  Tag,
  Tooltip,
  Typography,
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
} from 'lucide-react';
import dayjs from 'dayjs';
import { payrollApi, type PayrollDetail, type PayrollLine, type PayrollPeriod } from '../payroll.api';
import { PayrollKpiDashboard } from '../components/PayrollKpiDashboard';
import { PayslipDrawer } from '../components/PayslipDrawer';
import { PayslipPrintModal } from '../components/PayslipPrintModal';

const { Title, Text } = Typography;

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

  // Drawer & Print Modal State
  const [drawerLine, setDrawerLine] = useState<PayrollLine | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [printLine, setPrintLine] = useState<PayrollLine | null>(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);

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

  const handlePeriodAction = async (actionName: 'generate' | 'approve' | 'close' | 'pay', successMsg: string) => {
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

      return true;
    });
  }, [detail.bangLuongs, searchKeyword, selectedKhoa, quickFilter]);

  const exportCsv = () => {
    if (!detail.bangLuongs?.length) return;
    const header = [
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
      'Bảo hiểm (10.5%)',
      'Khấu trừ nghỉ/trễ',
      'Khấu trừ khác',
      'Thực lĩnh',
      'Nợ kỳ này',
    ];

    const lines = filteredLines.map((row) => [
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
        return 3;
      case 'DA_THANH_TOAN':
        return 4;
      default:
        return 0;
    }
  }, [detail.trangThai, detail.bangLuongs.length]);

  const columns = [
    {
      title: 'Nhân viên',
      fixed: 'left' as const,
      width: 220,
      render: (_: any, row: PayrollLine) => (
        <div>
          <div style={{ fontWeight: 600, color: '#0f172a' }}>{row.tenNhanVien}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            #{row.maNhanVien} {row.tenKhoa ? `• ${row.tenKhoa}` : ''}
          </div>
          {row.chucDanh && <div style={{ fontSize: 11, color: '#94a3b8' }}>{row.chucDanh}</div>}
        </div>
      ),
    },
    {
      title: 'Công chuẩn & Cơ bản',
      children: [
        {
          title: 'Lương cơ bản',
          dataIndex: 'luongCoBan',
          width: 120,
          align: 'right' as const,
          render: (val: number) => money(val),
        },
        {
          title: 'Ngày công',
          width: 100,
          align: 'center' as const,
          render: (_: any, row: PayrollLine) => (
            <div>
              <span style={{ fontWeight: 600, color: '#2563eb' }}>{row.soNgayCong}</span>/26
              {row.soNgayNghiKhongLuong > 0 && (
                <div style={{ fontSize: 11, color: '#dc2626' }}>Nghỉ: {row.soNgayNghiKhongLuong}d</div>
              )}
            </div>
          ),
        },
      ],
    },
    {
      title: 'Thu nhập (+)',
      children: [
        {
          title: 'Lương theo công',
          dataIndex: 'luongTheoNgayCong',
          width: 130,
          align: 'right' as const,
          render: (val: number) => money(val),
        },
        {
          title: 'Tăng ca (OT)',
          dataIndex: 'tienTangCa',
          width: 110,
          align: 'right' as const,
          render: (val: number) => (
            <span style={{ color: val > 0 ? '#d97706' : '#94a3b8', fontWeight: val > 0 ? 600 : 400 }}>
              {val > 0 ? `+${money(val)}` : '-'}
            </span>
          ),
        },
        {
          title: 'Phụ cấp / Thưởng',
          dataIndex: 'tongPhuCap',
          width: 130,
          align: 'right' as const,
          render: (val: number) => (
            <span style={{ color: val > 0 ? '#15803d' : '#94a3b8', fontWeight: val > 0 ? 600 : 400 }}>
              {val > 0 ? `+${money(val)}` : '-'}
            </span>
          ),
        },
      ],
    },
    {
      title: 'Giảm trừ (-)',
      children: [
        {
          title: 'Bảo hiểm (10.5%)',
          dataIndex: 'tienBaoHiem',
          width: 130,
          align: 'right' as const,
          render: (val: number) => <span style={{ color: '#6366f1' }}>-{money(val)}</span>,
        },
        {
          title: 'Nghỉ & Đi muộn',
          width: 130,
          align: 'right' as const,
          render: (_: any, row: PayrollLine) => {
            const sum = Number(row.khauTruNghiKhongLuong || 0) + Number(row.khauTruDiMuonVeSom || 0);
            return (
              <span style={{ color: sum > 0 ? '#dc2626' : '#94a3b8' }}>
                {sum > 0 ? `-${money(sum)}` : '-'}
              </span>
            );
          },
        },
        {
          title: 'Khấu trừ khác',
          dataIndex: 'tongKhauTru',
          width: 110,
          align: 'right' as const,
          render: (val: number) => (
            <span style={{ color: val > 0 ? '#dc2626' : '#94a3b8' }}>
              {val > 0 ? `-${money(val)}` : '-'}
            </span>
          ),
        },
      ],
    },
    {
      title: 'Thực lĩnh',
      fixed: 'right' as const,
      width: 140,
      align: 'right' as const,
      render: (_: any, row: PayrollLine) => {
        const debt = Number(row.tienNoKyNay || 0);
        if (debt > 0) {
          return (
            <div>
              <div style={{ fontWeight: 700, color: '#dc2626' }}>0 đ</div>
              <Tag color="warning" style={{ fontSize: 11, marginTop: 2 }}>
                Nợ: -{money(debt)}
              </Tag>
            </div>
          );
        }
        return (
          <span style={{ fontWeight: 700, color: '#15803d', fontSize: 14 }}>
            {money(row.thucLinh)}
          </span>
        );
      },
    },
    {
      title: 'Thao tác',
      fixed: 'right' as const,
      width: 170,
      align: 'center' as const,
      render: (_: any, row: PayrollLine) => (
        <Space size={4}>
          <Tooltip title="Xem chi tiết, phụ cấp & chấm công">
            <Button
              size="small"
              icon={<FileText size={14} />}
              onClick={() => {
                setDrawerLine(row);
                setDrawerOpen(true);
              }}
            >
              Chi tiết
            </Button>
          </Tooltip>

          {(detail.trangThai === 'NHAP' || detail.trangThai === 'DA_DUYET') && (
            <Popconfirm
              title="Tính lại lương nhân viên này?"
              description="Hệ thống sẽ cập nhật lại dữ liệu chấm công thực tế và giữ nguyên các khoản phụ cấp thủ công."
              onConfirm={() => handleRecalculateSingle(row.id)}
              okText="Tính lại"
              cancelText="Hủy"
            >
              <Tooltip title="Tính lại cho nhân viên này">
                <Button size="small" icon={<RefreshCw size={13} />} />
              </Tooltip>
            </Popconfirm>
          )}

          <Tooltip title="In phiếu lương cá nhân (A4/A5)">
            <Button
              size="small"
              icon={<Printer size={14} />}
              onClick={() => {
                setPrintLine(row);
                setPrintModalOpen(true);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

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
          marginBottom: 18,
          background: '#ffffff',
          padding: '16px 20px',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Button
            icon={<ArrowLeft size={16} />}
            onClick={onBack}
            style={{ borderRadius: 8 }}
          >
            Quay lại danh sách
          </Button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                Kỳ Lương Tháng {detail.thang}/{detail.nam}
              </span>
              <Tag color={statusColors[detail.trangThai] || 'default'} style={{ fontSize: 13, padding: '2px 8px' }}>
                {statusLabels[detail.trangThai] || detail.trangThai}
              </Tag>
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              Chu kỳ công: {dayjs(detail.tuNgay).format('DD/MM/YYYY')} - {dayjs(detail.denNgay).format('DD/MM/YYYY')}
            </div>
          </div>
        </div>

        {/* CÁC NÚT THAO TÁC THEO MÁY TRẠNG THÁI */}
        <Space wrap>
          {detail.trangThai === 'NHAP' && (
            <Button
              type="primary"
              loading={actionLoading}
              icon={<RefreshCw size={15} />}
              onClick={() => handlePeriodAction('generate', 'Đã tính toán bảng lương từ kỳ chấm công.')}
              style={{ background: '#0284c7' }}
            >
              {detail.bangLuongs.length > 0 ? 'Tính lại toàn bộ' : 'Tính lương'}
            </Button>
          )}

          {detail.trangThai === 'NHAP' && detail.bangLuongs.length > 0 && (
            <Button
              type="primary"
              loading={actionLoading}
              icon={<CheckCircle2 size={15} />}
              onClick={() => handlePeriodAction('approve', 'Đã duyệt kỳ lương thành công.')}
              style={{ background: '#2563eb' }}
            >
              Duyệt kỳ lương
            </Button>
          )}

          {detail.trangThai === 'DA_DUYET' && (
            <Button
              type="primary"
              loading={actionLoading}
              icon={<Lock size={15} />}
              onClick={() => handlePeriodAction('close', 'Đã chốt kỳ lương. Dữ liệu được đóng băng.')}
              style={{ background: '#d97706' }}
            >
              Chốt kỳ lương
            </Button>
          )}

          {detail.trangThai === 'DA_CHOT' && (
            <Button
              type="primary"
              loading={actionLoading}
              icon={<CreditCard size={15} />}
              onClick={() => handlePeriodAction('pay', 'Đã đánh dấu hoàn tất thanh toán kỳ lương.')}
              style={{ background: '#16a34a' }}
            >
              Xác nhận thanh toán
            </Button>
          )}

          <Button icon={<FileSpreadsheet size={15} />} onClick={exportCsv} disabled={!detail.bangLuongs?.length}>
            Xuất Excel
          </Button>
        </Space>
      </div>

      {/* STEPPER TIẾN TRÌNH KỲ LƯƠNG */}
      <Card size="small" style={{ marginBottom: 18, borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <Steps
          size="small"
          current={stepCurrent}
          items={[
            { title: '1. Khởi tạo', description: 'Tạo kỳ nháp' },
            { title: '2. Tính lương', description: 'Tổng hợp công & OT' },
            { title: '3. Phê duyệt', description: 'Kế toán & Trưởng phòng' },
            { title: '4. Chốt số liệu', description: 'Đóng băng dữ liệu' },
            { title: '5. Thanh toán', description: 'Phát hành phiếu lương' },
          ]}
        />
      </Card>

      {/* KHU 1: KPI DASHBOARD */}
      <PayrollKpiDashboard kpi={detail.kpi} />

      {/* KHU 2: BỘ LỌC ĐA TIÊU CHÍ */}
      <Card size="small" style={{ marginBottom: 16, borderRadius: 10, border: '1px solid #e2e8f0' }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm kiếm theo Tên hoặc Mã nhân viên..."
              prefix={<Search size={15} style={{ color: '#94a3b8' }} />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              value={selectedKhoa}
              onChange={setSelectedKhoa}
              options={departmentOptions}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              value={quickFilter}
              onChange={setQuickFilter}
              options={[
                { value: 'ALL', label: 'Tất cả trạng thái công' },
                { value: 'HAS_OT', label: 'Nhân viên có làm thêm OT' },
                { value: 'HAS_LATE', label: 'Nhân viên bị trừ trễ/sớm' },
                { value: 'HAS_DEBT', label: 'Nhân viên phát sinh nợ lương' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={4} style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              Hiển thị: <strong>{filteredLines.length}</strong> / {detail.bangLuongs.length} nhân viên
            </span>
          </Col>
        </Row>
      </Card>

      {/* KHU 3: BẢNG LƯƠNG MASTER */}
      <Table
        rowKey="id"
        loading={loading}
        columns={columns as any}
        dataSource={filteredLines}
        scroll={{ x: 1380 }}
        pagination={{ pageSize: 20, showSizeChanger: true, pageSizeOptions: ['15', '20', '50', '100'] }}
        bordered
        locale={{ emptyText: 'Chưa có bảng lương. Hãy bấm nút "Tính lương" để hệ thống tính toán tự động.' }}
        style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0' }}
      />

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
