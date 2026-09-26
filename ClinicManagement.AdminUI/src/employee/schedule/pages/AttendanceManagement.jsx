import { useState, useEffect, useMemo } from 'react';
import { Alert, Button, DatePicker, Form, Input, Modal, Select, Space, Table, Tag } from 'antd';
import { Clock, LogIn, LogOut, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import dayjs from 'dayjs';
import { dateRangePresets } from '../../../shared/utils/datePresets';

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
  const [now, setNow] = useState(dayjs());
  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [adjustmentRow, setAdjustmentRow] = useState(null);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [adjustmentForm] = Form.useForm();
  const [periodForm] = Form.useForm();

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

  const employeeOptions = employees?.length
    ? employees.map((e) => ({ value: e.id, label: `${e.hoTen || e.name} (${e.chuyenKhoa || 'Nhân viên'})` }))
    : Array.from(new Map(schedules.map((s) => [s.maNhanVien, { value: s.maNhanVien, label: s.tenNhanVien }])).values());

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employeeOptions[0]?.value || null);
  const [actionLoading, setActionLoading] = useState(false);
  const [recentMatch, setRecentMatch] = useState(null);

  useEffect(() => {
    if (!selectedEmployeeId && employeeOptions.length > 0) {
      setSelectedEmployeeId(employeeOptions[0].value);
    }
  }, [employeeOptions]);

  const handleQuickCheckIn = async () => {
    if (!selectedEmployeeId) return;
    setActionLoading(true);
    try {
      const result = await checkIn({ maNhanVien: selectedEmployeeId });
      if (result) {
        setRecentMatch({
          type: 'check-in',
          success: true,
          tenNhanVien: result.tenNhanVien || employeeOptions.find((e) => e.value === selectedEmployeeId)?.label || '',
          tenCa: result.tenCa,
          thoiGianBatDau: result.thoiGianBatDau,
          thoiGianKetThuc: result.thoiGianKetThuc,
          trangThai: result.trangThai,
          time: dayjs().format('HH:mm:ss DD/MM/YYYY'),
        });
      }
    } catch (err) {
      setRecentMatch({
        type: 'check-in',
        success: false,
        message: err?.response?.data?.message || err?.message || 'Bạn không có lịch làm việc trong khung giờ này. Vui lòng liên hệ quản trị phòng khám.',
        time: dayjs().format('HH:mm:ss DD/MM/YYYY'),
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickCheckOut = async () => {
    if (!selectedEmployeeId) return;
    setActionLoading(true);
    try {
      const result = await checkOut({ maNhanVien: selectedEmployeeId });
      if (result) {
        setRecentMatch({
          type: 'check-out',
          success: true,
          tenNhanVien: result.tenNhanVien || employeeOptions.find((e) => e.value === selectedEmployeeId)?.label || '',
          tenCa: result.tenCa,
          thoiGianBatDau: result.thoiGianBatDau,
          thoiGianKetThuc: result.thoiGianKetThuc,
          trangThai: result.trangThai,
          time: dayjs().format('HH:mm:ss DD/MM/YYYY'),
          gioLamThucTe: result.gioLamThucTe,
        });
      }
    } catch (err) {
      setRecentMatch({
        type: 'check-out',
        success: false,
        message: err?.response?.data?.message || err?.message || 'Không tìm thấy ca làm việc đang chờ check-out.',
        time: dayjs().format('HH:mm:ss DD/MM/YYYY'),
      });
    } finally {
      setActionLoading(false);
    }
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

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'ngayLam',
      width: 110,
      render: (value) => (value ? dayjs(value).format('DD/MM/YYYY') : '-'),
    },
    {
      title: 'Nhân viên',
      dataIndex: 'tenNhanVien',
      render: (text, row) => (
        <div>
          <strong style={{ color: '#0f172a' }}>{text}</strong>
          {(row.chucDanh || row.tenKhoa) && (
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              {row.chucDanh ? `${row.chucDanh}` : ''}
              {row.chucDanh && row.tenKhoa ? ' • ' : ''}
              {row.tenKhoa ? <Tag color="blue" style={{ fontSize: 11, padding: '0 4px', margin: 0 }}>{row.tenKhoa}</Tag> : null}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Ca làm việc',
      render: (_, row) => (
        <span>
          {row.tenCa}
          {row.thoiGianBatDau && row.thoiGianKetThuc ? (
            <span style={{ color: '#64748b', marginLeft: 4 }}>
              ({row.thoiGianBatDau.substring(0, 5)} - {row.thoiGianKetThuc.substring(0, 5)})
            </span>
          ) : null}
        </span>
      ),
    },
    {
      title: 'Check-in',
      render: (_, row) =>
        row.attendance?.checkIn ? (
          <span style={{ fontWeight: 600, color: '#059669' }}>
            {dayjs(row.attendance.checkIn).format('HH:mm:ss')}
          </span>
        ) : (
          <span style={{ color: '#94a3b8' }}>-</span>
        ),
    },
    {
      title: 'Check-out',
      render: (_, row) =>
        row.attendance?.checkOut ? (
          <span style={{ fontWeight: 600, color: '#2563eb' }}>
            {dayjs(row.attendance.checkOut).format('HH:mm:ss')}
          </span>
        ) : (
          <span style={{ color: '#94a3b8' }}>-</span>
        ),
    },
    {
      title: 'Trạng thái',
      render: (_, row) => {
        const status = row.attendance?.trangThai || (row.trangThaiLich === 'NGHI' ? 'NGHI_PHEP' : 'CHUA_CHAM_CONG');
        const colors = {
          DI_DUNG_GIO: 'green',
          DI_MUON: 'orange',
          VE_SOM: 'orange',
          DI_MUON_VE_SOM: 'orange',
          THIEU_CHECK_OUT: 'orange',
          THIEU_CHECKOUT: 'orange',
          CHO_XAC_NHAN: 'purple',
          NGHI_PHEP: 'gold',
          VANG_MAT: 'red',
          CHUA_CHAM_CONG: 'default',
        };
        const label = attendanceLabels[status] || (status === 'CHUA_CHAM_CONG' ? 'Chưa chấm công' : status);
        const isMissingCheckout = status === 'THIEU_CHECK_OUT' || status === 'THIEU_CHECKOUT';
        const violationMinutes = (row.attendance?.phutDiMuon || 0) + (row.attendance?.phutVeSom || 0);
        return (
          <Space size={4} wrap>
            <Tag
              color={colors[status] || 'blue'}
              style={isMissingCheckout ? {
                background: '#fffbeb',
                color: '#92400e',
                borderColor: '#fde68a',
              } : undefined}
            >
              {isMissingCheckout ? 'Thiếu check-out' : label}
            </Tag>
            {status === 'DI_MUON_VE_SOM' && violationMinutes > 0 && (
              <span style={{ color: '#92400e', fontFamily: 'monospace', fontSize: 12 }}>
                {violationMinutes} phút
              </span>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Đi muộn',
      width: 90,
      render: (_, row) =>
        row.attendance?.phutDiMuon > 0 ? (
          <span style={{ color: '#d97706', fontWeight: 600 }}>{row.attendance.phutDiMuon}p</span>
        ) : (
          <span style={{ color: '#94a3b8' }}>0p</span>
        ),
    },
    {
      title: 'Về sớm',
      width: 90,
      render: (_, row) =>
        row.attendance?.phutVeSom > 0 ? (
          <span style={{ color: '#d97706', fontWeight: 600 }}>{row.attendance.phutVeSom}p</span>
        ) : (
          <span style={{ color: '#94a3b8' }}>0p</span>
        ),
    },
    {
      title: 'Giờ thực tế',
      width: 100,
      render: (_, row) =>
        row.attendance?.checkOut ? `${row.attendance.gioLamThucTe} giờ` : (
          row.attendance?.trangThai === 'THIEU_CHECK_OUT' || row.attendance?.trangThai === 'THIEU_CHECKOUT'
            ? <span style={{ color: '#b45309', fontWeight: 600 }}>0.0 (Chưa chốt)</span>
            : '-'
        ),
    },
    {
      title: 'Điều chỉnh',
      render: (_, row) => {
        if (!row.attendance) return '-';
        const request = adjustments.find((item) => item.maChamCong === row.attendance?.id);
        if (request?.trangThai === 'CHO_DUYET') return <Tag color="gold">Chờ duyệt</Tag>;
        const missingCheckout = row.attendance.trangThai === 'THIEU_CHECK_OUT'
          || row.attendance.trangThai === 'THIEU_CHECKOUT';
        return (
          <Button
            size="small"
            onClick={() => {
              adjustmentForm.setFieldsValue({
                checkIn: row.attendance.checkIn ? dayjs(row.attendance.checkIn) : null,
                checkOut: row.attendance.checkOut ? dayjs(row.attendance.checkOut) : null,
                lyDo: '',
              });
              setAdjustmentRow(row);
            }}
          >
            {missingCheckout ? 'Giải trình giờ' : 'Điều chỉnh'}
          </Button>
        );
      },
    },
    {
      title: 'Thao tác',
      render: (_, row) => {
        const item = row.attendance;
        if (row.trangThaiLich === 'NGHI' || item?.trangThai === 'NGHI_PHEP' || item?.trangThai === 'VANG_MAT') return '-';
        return (
          <Space>
            {!item?.checkIn && (
              <Button size="small" type="primary" onClick={() => checkIn({ maNhanVien: row.maNhanVien })}>
                Check-in
              </Button>
            )}
            {item?.checkIn && !item?.checkOut && (
              <Button size="small" onClick={() => checkOut({ maNhanVien: row.maNhanVien })}>
                Check-out
              </Button>
            )}
          </Space>
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

      {/* BẢNG QUÉT CHẤM CÔNG TỰ ĐỘNG KHỚP CA */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          {/* Đồng hồ số thời gian thực */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: '#e0f2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284c7',
              }}
            >
              <Clock size={24} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'monospace', color: '#0f172a', letterSpacing: 1 }}>
                {now.format('HH:mm:ss')}
              </div>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                {now.format('dddd, DD/MM/YYYY')}
              </div>
            </div>
          </div>

          {/* Chọn nhân viên & 2 Nút Check-in / Check-out */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
            <Select
              style={{ width: 260 }}
              placeholder="Chọn nhân viên chấm công"
              value={selectedEmployeeId}
              onChange={setSelectedEmployeeId}
              options={employeeOptions}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
            <Button
              type="primary"
              size="middle"
              loading={actionLoading}
              icon={<LogIn size={16} />}
              onClick={handleQuickCheckIn}
              style={{
                background: '#10b981',
                borderColor: '#10b981',
                fontWeight: 600,
                borderRadius: 8,
              }}
            >
              Check-in
            </Button>
            <Button
              type="primary"
              size="middle"
              loading={actionLoading}
              icon={<LogOut size={16} />}
              onClick={handleQuickCheckOut}
              style={{
                background: '#2563eb',
                borderColor: '#2563eb',
                fontWeight: 600,
                borderRadius: 8,
              }}
            >
              Check-out
            </Button>
          </div>
        </div>

        {/* Thông báo kết quả khớp ca tự động hoặc báo lỗi ngoài giờ */}
        {recentMatch && (
          <div style={{ marginTop: 14 }}>
            {recentMatch.success ? (
              <Alert
                type="success"
                showIcon
                icon={<CheckCircle2 size={18} style={{ color: '#10b981' }} />}
                message={
                  <span style={{ fontWeight: 600 }}>
                    {recentMatch.type === 'check-in' ? 'Check-in thành công' : 'Check-out thành công'} ({recentMatch.time})
                  </span>
                }
                description={
                  <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span>Nhân viên: <strong>{recentMatch.tenNhanVien}</strong></span>
                    {recentMatch.tenCa ? (
                      <Tag color="green" style={{ fontSize: 13, padding: '2px 8px' }}>
                        {recentMatch.type === 'check-in'
                          ? `Đã vào ${recentMatch.tenCa}: ${recentMatch.thoiGianBatDau || ''} - ${recentMatch.thoiGianKetThuc || ''} (${recentMatch.trangThai === 'DI_MUON' || recentMatch.trangThai === 'DI_MUON_VE_SOM' ? 'Đi muộn' : 'Đúng giờ'})`
                          : `Đã hoàn thành ${recentMatch.tenCa} (Giờ thực tế: ${recentMatch.gioLamThucTe || 0} giờ)`}
                      </Tag>
                    ) : (
                      <Tag color="blue">Tự động khớp ca</Tag>
                    )}
                  </div>
                }
                closable
                onClose={() => setRecentMatch(null)}
              />
            ) : (
              <Alert
                type="error"
                showIcon
                icon={<AlertCircle size={18} style={{ color: '#ef4444' }} />}
                message={<span style={{ fontWeight: 600 }}>Chấm công không thành công ({recentMatch.time})</span>}
                description={recentMatch.message}
                closable
                onClose={() => setRecentMatch(null)}
              />
            )}
          </div>
        )}
      </div>

      {/* THANH BỘ LỌC NỘI BỘ TAB CHẤM CÔNG & NÚT THAO TÁC */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Input
            placeholder="Tìm theo tên nhân viên, ca..."
            prefix={<Search size={15} style={{ color: '#94a3b8' }} />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            allowClear
            style={{ width: 220, borderRadius: 8 }}
          />
          <Select
            placeholder="Khoa phòng"
            allowClear
            value={deptFilter}
            onChange={setDeptFilter}
            style={{ width: 200 }}
            options={[
              { value: undefined, label: 'Tất cả khoa phòng' },
              ...khoas.map((k) => ({ value: k.id, label: k.ten })),
            ]}
          />
          <Select
            placeholder="Trạng thái"
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 170 }}
            options={[
              { value: undefined, label: 'Tất cả trạng thái' },
              { value: 'DA_CHECK_IN', label: 'Đã check-in' },
              { value: 'DA_CHECK_OUT', label: 'Đã check-out' },
              { value: 'DI_DUNG_GIO', label: 'Đúng giờ' },
              { value: 'DI_MUON', label: 'Đi muộn' },
              { value: 'DI_MUON_VE_SOM', label: 'Đi muộn & về sớm' },
              { value: 'THIEU_CHECK_OUT', label: 'Thiếu check-out' },
              { value: 'CHUA_CHAM_CONG', label: 'Chưa chấm công' },
              { value: 'VANG_MAT', label: 'Vắng mặt' },
              { value: 'NGHI_PHEP', label: 'Nghỉ phép' },
            ]}
          />
          <Button
            type={statusFilter === 'ABNORMAL' ? 'primary' : 'default'}
            onClick={() => setStatusFilter(statusFilter === 'ABNORMAL' ? undefined : 'ABNORMAL')}
            style={statusFilter === 'ABNORMAL' ? { background: '#b45309', borderColor: '#b45309' } : undefined}
          >
            Ca bất thường cần xử lý ({abnormalCount})
          </Button>
          <span style={{ fontSize: 13, color: '#64748b', marginLeft: 4 }}>
            Hiển thị <strong>{rows.length}</strong> bản ghi
          </span>
        </div>

        <Space wrap>
          <Button onClick={() => setPeriodOpen(true)} style={{ borderRadius: 8 }}>
            Quản lý kỳ chấm công
          </Button>
          <Button onClick={exportCsv} disabled={!rows.length} style={{ borderRadius: 8 }}>
            Xuất báo cáo CSV
          </Button>
        </Space>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={rows}
        columns={columns}
        pagination={{ pageSize: 15, showSizeChanger: true }}
        locale={{ emptyText: 'Chưa có dữ liệu chấm công hoặc ca làm việc phù hợp.' }}
        style={{ border: '1px solid #e9edf4', borderRadius: 10, overflow: 'hidden' }}
      />

      <Modal
        title={`Điều chỉnh chấm công - ${adjustmentRow?.tenNhanVien || ''}`}
        open={!!adjustmentRow}
        okText="Gửi yêu cầu"
        cancelText="Hủy"
        onCancel={() => setAdjustmentRow(null)}
        onOk={async () => {
          const values = await adjustmentForm.validateFields();
          await requestAdjustment({
            maChamCong: adjustmentRow.attendance.id,
            checkIn: values.checkIn?.toISOString() || null,
            checkOut: values.checkOut?.toISOString() || null,
            lyDo: values.lyDo,
          });
          setAdjustmentRow(null);
        }}
      >
        <Form form={adjustmentForm} layout="vertical">
          <Form.Item name="checkIn" label="Check-in mới">
            <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="checkOut" label="Check-out mới">
            <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="lyDo" label="Lý do" rules={[{ required: true, message: 'Vui lòng nhập lý do.' }]}>
            <Input.TextArea rows={3} maxLength={500} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Kỳ chấm công"
        open={periodOpen}
        footer={null}
        onCancel={() => setPeriodOpen(false)}
        width={720}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Form form={periodForm} layout="inline" onFinish={async (values) => {
            await createPeriod({
              tuNgay: values.range[0].startOf('day').toISOString(),
              denNgay: values.range[1].endOf('day').toISOString(),
              ghiChu: values.ghiChu,
            });
            periodForm.resetFields();
          }}>
            <Form.Item name="range" rules={[{ required: true, message: 'Chọn khoảng kỳ.' }]}>
              <DatePicker.RangePicker format="DD/MM/YYYY" presets={dateRangePresets} />
            </Form.Item>
            <Form.Item name="ghiChu"><Input placeholder="Ghi chú" /></Form.Item>
            <Button type="primary" htmlType="submit">Tạo kỳ</Button>
          </Form>
          <Table
            rowKey="id"
            size="small"
            dataSource={periods}
            pagination={false}
            columns={[
              { title: 'Từ ngày', render: (_, item) => dayjs(item.tuNgay).format('DD/MM/YYYY') },
              { title: 'Đến ngày', render: (_, item) => dayjs(item.denNgay).format('DD/MM/YYYY') },
              { title: 'Trạng thái', render: (_, item) => <Tag color={item.daKhoa ? 'red' : 'green'}>{item.daKhoa ? 'Đã khóa' : 'Đang mở'}</Tag> },
              { title: 'Thao tác', render: (_, item) => <Button size="small" onClick={() => togglePeriod(item)}>{item.daKhoa ? 'Mở khóa' : 'Khóa kỳ'}</Button> },
            ]}
          />
          {adjustments.length > 0 && (
            <Table
              rowKey="id"
              size="small"
              dataSource={adjustments}
              pagination={{ pageSize: 5 }}
              title={() => 'Yêu cầu điều chỉnh gần đây'}
              columns={[
                { title: 'Mã chấm công', dataIndex: 'maChamCong' },
                { title: 'Lý do', dataIndex: 'lyDo' },
                { title: 'Trạng thái', dataIndex: 'trangThai' },
                { title: 'Thao tác', render: (_, item) => item.trangThai === 'CHO_DUYET' ? <Space><Button size="small" type="primary" onClick={() => reviewAdjustment(item.id, true)}>Duyệt</Button><Button size="small" danger onClick={() => reviewAdjustment(item.id, false)}>Từ chối</Button></Space> : '-' },
              ]}
            />
          )}
        </Space>
      </Modal>
    </>
  );
};
