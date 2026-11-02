import { useState, useEffect, useMemo } from 'react';
import { Alert, Button, Select, Tag } from 'antd';
import { Clock, LogIn, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';

export const AttendanceQuickClock = ({
  employees = [],
  schedules = [],
  checkIn,
  checkOut,
}) => {
  const [now, setNow] = useState(dayjs());
  useEffect(() => {
    const timer = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  const employeeOptions = useMemo(() => {
    if (employees?.length) {
      return employees.map((e) => ({
        value: e.id,
        label: `${e.hoTen || e.name} (${e.maNhanVien || e.username || ''}) - ${e.chucVu || e.chuyenKhoa || e.vaiTro || 'Nhân viên'}`,
      }));
    }
    return Array.from(
      new Map(
        schedules.map((s) => [s.maNhanVien, { value: s.maNhanVien, label: s.tenNhanVien }])
      ).values()
    );
  }, [employees, schedules]);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employeeOptions[0]?.value || null);
  const [actionLoading, setActionLoading] = useState(false);
  const [recentMatch, setRecentMatch] = useState(null);

  useEffect(() => {
    if (!selectedEmployeeId && employeeOptions.length > 0) {
      setSelectedEmployeeId(employeeOptions[0].value);
    }
  }, [employeeOptions, selectedEmployeeId]);

  const handleQuickCheckIn = async () => {
    if (!selectedEmployeeId || !checkIn) return;
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
    if (!selectedEmployeeId || !checkOut) return;
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

  return (
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
              background: '#0284c7',
              borderColor: '#0284c7',
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
  );
};
