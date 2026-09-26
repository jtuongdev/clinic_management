import { useEffect, useMemo } from 'react';
import { Alert, DatePicker, Form, Input, Modal, Space } from 'antd';
import { Clock3, X, Check, FileSpreadsheet, UserCheck } from 'lucide-react';
import dayjs from 'dayjs';

export const AttendanceAdjustmentModal = ({
  open,
  adjustmentRow,
  adjustmentDefaults,
  attendanceLabels = {},
  onClose,
  onSubmit,
}) => {
  const [adjustmentForm] = Form.useForm();
  const formCheckIn = Form.useWatch('checkIn', adjustmentForm);
  const formCheckOut = Form.useWatch('checkOut', adjustmentForm);

  useEffect(() => {
    if (adjustmentRow) {
      const att = adjustmentRow.attendance;
      const parseSafe = (val) => {
        if (!val) return null;
        const d = dayjs(val);
        return d.isValid() ? d : null;
      };

      const checkInVal = adjustmentDefaults?.checkIn !== undefined
        ? adjustmentDefaults.checkIn
        : parseSafe(att?.checkIn);
      const checkOutVal = adjustmentDefaults?.checkOut !== undefined
        ? adjustmentDefaults.checkOut
        : parseSafe(att?.checkOut);

      adjustmentForm.setFieldsValue({
        checkIn: checkInVal,
        checkOut: checkOutVal,
        lyDo: adjustmentDefaults?.lyDo || '',
      });
    } else {
      adjustmentForm.resetFields();
    }
  }, [adjustmentRow, adjustmentDefaults, adjustmentForm]);

  const liveComparison = useMemo(() => {
    if (!adjustmentRow) return null;
    const att = adjustmentRow.attendance;
    const curCheckIn = att?.checkIn && dayjs(att.checkIn).isValid() ? dayjs(att.checkIn) : null;
    const curCheckOut = att?.checkOut && dayjs(att.checkOut).isValid() ? dayjs(att.checkOut) : null;
    const curHours = att?.gioLamThucTe ?? 0;
    const curLate = att?.phutDiMuon ?? 0;
    const curEarly = att?.phutVeSom ?? 0;

    const newIn = formCheckIn && dayjs(formCheckIn).isValid() ? dayjs(formCheckIn) : null;
    const newOut = formCheckOut && dayjs(formCheckOut).isValid() ? dayjs(formCheckOut) : null;

    let newHours = 0;
    let newLate = 0;
    let newEarly = 0;

    if (newIn && newOut && newOut.isAfter(newIn)) {
      newHours = Math.round((newOut.diff(newIn, 'minute') / 60) * 10) / 10;
    }

    if (adjustmentRow.ngayLam && adjustmentRow.thoiGianBatDau && newIn) {
      const datePart = dayjs(adjustmentRow.ngayLam).format('YYYY-MM-DD');
      const schedStart = dayjs(`${datePart}T${adjustmentRow.thoiGianBatDau.substring(0, 5)}:00`);
      if (schedStart.isValid() && newIn.isAfter(schedStart)) {
        newLate = Math.max(0, Math.round(newIn.diff(schedStart, 'minute')));
      }
    }

    if (adjustmentRow.ngayLam && adjustmentRow.thoiGianKetThuc && newOut) {
      const datePart = dayjs(adjustmentRow.ngayLam).format('YYYY-MM-DD');
      let schedEnd = dayjs(`${datePart}T${adjustmentRow.thoiGianKetThuc.substring(0, 5)}:00`);
      if (adjustmentRow.thoiGianBatDau && adjustmentRow.thoiGianKetThuc <= adjustmentRow.thoiGianBatDau) {
        schedEnd = schedEnd.add(1, 'day');
      }
      if (schedEnd.isValid() && newOut.isBefore(schedEnd)) {
        newEarly = Math.max(0, Math.round(schedEnd.diff(newOut, 'minute')));
      }
    }

    return {
      curCheckIn,
      curCheckOut,
      curHours,
      curLate,
      curEarly,
      newIn,
      newOut,
      newHours,
      newLate,
      newEarly,
    };
  }, [adjustmentRow, formCheckIn, formCheckOut]);

  if (!open || !adjustmentRow) return null;

  const handleSave = async () => {
    const values = await adjustmentForm.validateFields();
    const formatLocalIso = (d) => {
      if (!d || !dayjs(d).isValid()) return null;
      return dayjs(d).format('YYYY-MM-DDTHH:mm:ss');
    };
    await onSubmit({
      maChamCong: adjustmentRow.attendance.id,
      checkIn: formatLocalIso(values.checkIn),
      checkOut: formatLocalIso(values.checkOut),
      lyDo: values.lyDo?.trim() || '',
    });
  };

  const status = adjustmentRow?.attendance?.trangThai;
  const isMissingCheckout = status === 'THIEU_CHECK_OUT' || status === 'THIEU_CHECKOUT';
  const statusLabel = attendanceLabels[status] || status || 'Chưa chốt công';

  return (
    <Modal
      open={open}
      width="94vw"
      style={{ maxWidth: 1240, top: 20, paddingBottom: 20 }}
      styles={{
        content: {
          padding: 0,
          borderRadius: 12,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        },
        body: {
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          minHeight: 0,
        },
      }}
      destroyOnClose
      footer={null}
      closable={false}
      onCancel={onClose}
    >
      {/* 1. HEADER CỐ ĐỊNH - ĐỒNG BỘ TONE SÁNG (WHITE + BLUE ACCENT) */}
      <div
        style={{
          height: 64,
          background: '#ffffff',
          color: '#0f172a',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e5e7eb',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb',
              flexShrink: 0,
              border: '1px solid #bfdbfe',
            }}
          >
            <Clock3 size={18} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
              Điều chỉnh chấm công ca làm việc
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
              Nhân viên: <strong style={{ color: '#2563eb' }}>{adjustmentRow?.tenNhanVien}</strong>
              <span style={{ color: '#cbd5e1', margin: '0 6px' }}>•</span>
              Ngày làm: <strong style={{ color: '#0f172a' }}>{adjustmentRow?.ngayLam ? dayjs(adjustmentRow.ngayLam).format('DD/MM/YYYY') : '-'}</strong>
              <span style={{ color: '#cbd5e1', margin: '0 6px' }}>•</span>
              Ca trực: <strong style={{ color: '#0f172a' }}>{adjustmentRow?.tenCa}</strong>
              {adjustmentRow?.thoiGianBatDau && adjustmentRow?.thoiGianKetThuc && (
                <span style={{ marginLeft: 4, color: '#64748b' }}>
                  ({adjustmentRow.thoiGianBatDau.substring(0, 5)} - {adjustmentRow.thoiGianKetThuc.substring(0, 5)})
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              padding: '3px 10px',
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 4,
              border: '1px solid',
              ...(isMissingCheckout
                ? { background: '#fffbeb', color: '#b45309', borderColor: '#fde68a' }
                : { background: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' }),
            }}
          >
            {isMissingCheckout ? 'Thiếu check-out' : statusLabel}
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #e5e7eb',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 6,
              borderRadius: 6,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* 2. BODY */}
      <div
        style={{
          flex: 1,
          maxHeight: '75vh',
          overflowY: 'auto',
          background: '#f8fafc',
          padding: '24px',
          display: 'flex',
          gap: 20,
          minHeight: 0,
        }}
      >
        {/* CỘT TRÁI: THÔNG TIN & ĐỐI SOÁT (460px) */}
        <div style={{ width: 460, minWidth: 420, maxWidth: 480, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* THẺ 1: THÔNG TIN GỐC */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              padding: '14px 16px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6 }}>
              <UserCheck size={15} style={{ color: '#2563eb' }} />
              <span>1. Thông tin ca làm việc & hồ sơ</span>
            </div>
            <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: 110 }} />
                <col />
              </colgroup>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6px 0', color: '#64748b' }}>Mã nhân viên:</td>
                  <td style={{ padding: '6px 0', fontWeight: 600, color: '#0f172a' }}>
                    #{adjustmentRow?.maNhanVien}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6px 0', color: '#64748b' }}>Họ và tên:</td>
                  <td
                    style={{
                      padding: '6px 0',
                      fontWeight: 700,
                      color: '#0f172a',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={adjustmentRow?.tenNhanVien}
                  >
                    {adjustmentRow?.tenNhanVien}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6px 0', color: '#64748b' }}>Khoa / Phòng:</td>
                  <td
                    style={{
                      padding: '6px 0',
                      color: '#0f172a',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={adjustmentRow?.tenKhoa || 'Chung'}
                  >
                    {adjustmentRow?.tenKhoa ? (
                      <span
                        style={{
                          fontSize: 11,
                          padding: '1px 6px',
                          borderRadius: 3,
                          border: '1px solid #bfdbfe',
                          background: '#eff6ff',
                          color: '#1d4ed8',
                        }}
                      >
                        {adjustmentRow.tenKhoa}
                      </span>
                    ) : (
                      'Chung'
                    )}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6px 0', color: '#64748b' }}>Ca làm việc:</td>
                  <td
                    style={{
                      padding: '6px 0',
                      fontWeight: 600,
                      color: '#2563eb',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={adjustmentRow?.tenCa}
                  >
                    {adjustmentRow?.tenCa}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6px 0', color: '#64748b' }}>Khung ca chuẩn:</td>
                  <td style={{ padding: '6px 0', fontWeight: 600, color: '#334155' }}>
                    {adjustmentRow?.thoiGianBatDau?.substring(0, 5)} — {adjustmentRow?.thoiGianKetThuc?.substring(0, 5)}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 0', color: '#64748b' }}>Ngày làm việc:</td>
                  <td style={{ padding: '6px 0', fontWeight: 600, color: '#0f172a' }}>
                    {adjustmentRow?.ngayLam ? dayjs(adjustmentRow.ngayLam).format('DD/MM/YYYY') : '-'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* THẺ 2: BẢNG MA TRẬN ĐỐI SOÁT */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              padding: '14px 16px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileSpreadsheet size={15} style={{ color: '#2563eb' }} />
              <span>2. Ma trận đối soát Trước / Sau</span>
            </div>
            <table
              style={{
                width: '100%',
                fontSize: 12,
                borderCollapse: 'collapse',
                border: '1px solid #e5e7eb',
                tableLayout: 'fixed',
              }}
            >
              <colgroup>
                <col style={{ width: '35%' }} />
                <col style={{ width: '32%' }} />
                <col style={{ width: '33%' }} />
              </colgroup>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', color: '#334155', fontWeight: 700, borderRight: '1px solid #e5e7eb' }}>
                    Chỉ tiêu
                  </th>
                  <th style={{ padding: '8px 6px', textAlign: 'center', color: '#64748b', fontWeight: 700, borderRight: '1px solid #e5e7eb' }}>
                    Dữ liệu gốc
                  </th>
                  <th style={{ padding: '8px 6px', textAlign: 'center', color: '#1d4ed8', fontWeight: 700, background: '#eff6ff' }}>
                    Sau điều chỉnh
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '7px 10px', fontWeight: 600, color: '#334155', borderRight: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                    Check-in
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', color: '#64748b', borderRight: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                    {liveComparison?.curCheckIn ? liveComparison.curCheckIn.format('HH:mm:ss') : '--:--'}
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {liveComparison?.newIn ? (
                      <span style={{ fontWeight: 600, color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: 4, border: '1px solid #a7f3d0' }}>
                        {liveComparison.newIn.format('HH:mm')}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>--:--</span>
                    )}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '7px 10px', fontWeight: 600, color: '#334155', borderRight: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                    Check-out
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', color: '#64748b', borderRight: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                    {liveComparison?.curCheckOut ? liveComparison.curCheckOut.format('HH:mm:ss') : '--:--'}
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {liveComparison?.newOut ? (
                      <span style={{ fontWeight: 600, color: '#1d4ed8', background: '#eff6ff', padding: '2px 8px', borderRadius: 4, border: '1px solid #bfdbfe' }}>
                        {liveComparison.newOut.format('HH:mm')}
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>--:--</span>
                    )}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '7px 10px', fontWeight: 600, color: '#334155', borderRight: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                    Giờ làm thực tế
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', color: '#64748b', borderRight: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                    {liveComparison?.curHours ?? 0}h
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                    {liveComparison?.newHours ?? 0}h
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '7px 10px', fontWeight: 600, color: '#334155', borderRight: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                    Đi muộn (phút)
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', color: liveComparison?.curLate ? '#b45309' : '#64748b', borderRight: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                    {liveComparison?.curLate ?? 0}p
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', fontWeight: 600, color: liveComparison?.newLate ? '#b45309' : '#047857', whiteSpace: 'nowrap' }}>
                    {liveComparison?.newLate ?? 0}p
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '7px 10px', fontWeight: 600, color: '#334155', borderRight: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                    Về sớm (phút)
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', color: liveComparison?.curEarly ? '#b45309' : '#64748b', borderRight: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                    {liveComparison?.curEarly ?? 0}p
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', fontWeight: 600, color: liveComparison?.newEarly ? '#b45309' : '#047857', whiteSpace: 'nowrap' }}>
                    {liveComparison?.newEarly ?? 0}p
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* THẺ 3: GỢI Ý THAO TÁC NHANH */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              padding: '14px 16px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock3 size={15} style={{ color: '#2563eb' }} />
              <span>3. Gợi ý thao tác nhanh</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                type="button"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#eff6ff';
                  e.currentTarget.style.borderColor = '#bfdbfe';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
                onClick={() => {
                  if (adjustmentRow?.ngayLam && adjustmentRow.thoiGianBatDau && adjustmentRow.thoiGianKetThuc) {
                    const datePart = dayjs(adjustmentRow.ngayLam).format('YYYY-MM-DD');
                    const start = dayjs(`${datePart}T${adjustmentRow.thoiGianBatDau.substring(0, 5)}:00`);
                    let end = dayjs(`${datePart}T${adjustmentRow.thoiGianKetThuc.substring(0, 5)}:00`);
                    if (adjustmentRow.thoiGianKetThuc <= adjustmentRow.thoiGianBatDau) {
                      end = end.add(1, 'day');
                    }
                    adjustmentForm.setFieldsValue({
                      checkIn: start,
                      checkOut: end,
                      lyDo: 'Điền đúng theo khung giờ ca trực chuẩn.',
                    });
                  }
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1d4ed8' }}>
                  Điền chuẩn theo giờ ca trực
                </span>
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  Tự động gán giờ vào = bắt đầu ca, giờ ra = kết thúc ca
                </span>
              </button>

              <button
                type="button"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#eff6ff';
                  e.currentTarget.style.borderColor = '#bfdbfe';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
                onClick={() => {
                  if (adjustmentRow?.attendance?.checkIn && dayjs(adjustmentRow.attendance.checkIn).isValid()) {
                    adjustmentForm.setFieldValue('checkIn', dayjs(adjustmentRow.attendance.checkIn));
                  }
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                  Giữ nguyên Check-in gốc
                </span>
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  Chỉ chỉnh sửa hoặc bổ sung giờ Check-out
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: FORM NHẬP LIỆU */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileSpreadsheet size={16} style={{ color: '#2563eb' }} />
              <span>BIỂU MẪU ĐIỀU CHỈNH CHẤM CÔNG</span>
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
              Vui lòng nhập chính xác thời gian và lý do. Hệ thống sẽ ghi nhận lịch sử thay đổi để phục vụ kiểm toán và tính lương.
            </div>
          </div>

          <Form form={adjustmentForm} layout="vertical" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
                marginBottom: 6,
              }}
            >
              <Form.Item
                name="checkIn"
                label={<span style={{ fontWeight: 600, fontSize: 12, color: '#1e293b' }}>Thời gian Check-in mới (*)</span>}
                rules={[{ required: true, message: 'Vui lòng chọn thời gian check-in mới.' }]}
                extra={<span style={{ fontSize: 11, color: '#94a3b8' }}>Định dạng: Ngày/Tháng/Năm Giờ:Phút (24h)</span>}
              >
                <DatePicker
                  showTime={{ format: 'HH:mm' }}
                  format="DD/MM/YYYY HH:mm"
                  defaultPickerValue={adjustmentRow?.ngayLam ? dayjs(adjustmentRow.ngayLam) : dayjs()}
                  placeholder="Chọn ngày và giờ vào"
                  style={{ width: '100%', height: 38, borderRadius: 6 }}
                />
              </Form.Item>

              <Form.Item
                name="checkOut"
                label={<span style={{ fontWeight: 600, fontSize: 12, color: '#1e293b' }}>Thời gian Check-out mới (*)</span>}
                dependencies={['checkIn']}
                rules={[
                  { required: true, message: 'Vui lòng chọn thời gian check-out mới.' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const checkIn = getFieldValue('checkIn');
                      if (value && checkIn && dayjs(value).isBefore(dayjs(checkIn))) {
                        return Promise.reject(new Error('Thời gian check-out không thể trước thời gian check-in!'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
                extra={<span style={{ fontSize: 11, color: '#94a3b8' }}>Định dạng: Ngày/Tháng/Năm Giờ:Phút (24h)</span>}
              >
                <DatePicker
                  showTime={{ format: 'HH:mm' }}
                  format="DD/MM/YYYY HH:mm"
                  defaultPickerValue={adjustmentRow?.ngayLam ? dayjs(adjustmentRow.ngayLam) : dayjs()}
                  placeholder="Chọn ngày và giờ ra"
                  style={{ width: '100%', height: 38, borderRadius: 6 }}
                />
              </Form.Item>
            </div>

            {/* LÝ DO ĐIỀU CHỈNH */}
            <Form.Item
              name="lyDo"
              label={<span style={{ fontWeight: 600, fontSize: 12, color: '#1e293b' }}>Lý do điều chỉnh (*)</span>}
              rules={[{ required: true, message: 'Vui lòng nhập lý do giải trình điều chỉnh chấm công.' }]}
              style={{ marginTop: 4 }}
            >
              <Input.TextArea
                rows={3}
                maxLength={500}
                showCount
                placeholder="Nhập lý do chi tiết (Ví dụ: Nhân viên quên dập thẻ khi tan ca, máy quét vân tay tại tầng 2 mất kết nối, v.v.)..."
                style={{ borderRadius: 6 }}
              />
            </Form.Item>

            {/* CHIPS GỢI Ý LÝ DO NHANH */}
            <div style={{ marginTop: -8, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>Gợi ý lý do phổ biến:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[
                  'Quên dập thẻ ra khi tan ca',
                  'Máy chấm công không nhận vân tay',
                  'Điều động công tác / cấp cứu ngoài viện',
                  'Dập thẻ bổ sung theo xác nhận Trưởng khoa',
                  'Sự cố mất điện / mất mạng cục bộ',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    style={{
                      cursor: 'pointer',
                      padding: '4px 10px',
                      fontSize: 11.5,
                      background: '#f8fafc',
                      border: '1px solid #e5e7eb',
                      color: '#334155',
                      borderRadius: 4,
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#eff6ff';
                      e.currentTarget.style.borderColor = '#bfdbfe';
                      e.currentTarget.style.color = '#1d4ed8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.color = '#334155';
                    }}
                    onClick={() => adjustmentForm.setFieldValue('lyDo', preset)}
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* HỘP QUY TRÌNH DUYỆT HIS/HRM */}
            <Alert
              type="info"
              showIcon
              message={<span style={{ fontWeight: 600, color: '#1e40af' }}>Quy trình phê duyệt & Đồng bộ bảng lương</span>}
              description={
                <span style={{ color: '#475569', fontSize: 11.5 }}>
                  Sau khi gửi yêu cầu, số liệu điều chỉnh sẽ hiển thị tại danh sách <strong>Đơn duyệt điều chỉnh</strong> với trạng thái <em>Chờ duyệt</em>. Khi được phê duyệt, hệ thống sẽ tự động tính lại giờ công thực tế, số phút trễ/sớm và cập nhật trực tiếp vào kỳ lương của nhân viên.
                </span>
              }
              style={{
                borderRadius: 8,
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                marginTop: 'auto',
                padding: '10px 14px',
              }}
            />
          </Form>
        </div>
      </div>

      {/* 3. FOOTER ACTION */}
      <div
        style={{
          height: 64,
          background: '#ffffff',
          borderTop: '1px solid #e5e7eb',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: 12, color: '#64748b' }}>
          <span style={{ color: '#1e293b', fontWeight: 600 }}>Lưu ý:</span> Thao tác điều chỉnh được lưu vết vào hệ thống Audit Log phục vụ thanh tra.
        </div>

        <Space size={12}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              background: '#ffffff',
              border: '1px solid #d1d5db',
              color: '#334155',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f8fafc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
            }}
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '8px 22px',
              background: '#2563eb',
              border: '1px solid #2563eb',
              color: '#ffffff',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1d4ed8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#2563eb';
            }}
          >
            <Check size={16} />
            Lưu điều chỉnh
          </button>
        </Space>
      </div>
    </Modal>
  );
};