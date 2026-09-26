import { useMemo } from 'react';
import { Button, DatePicker, Form, Input, Modal, Table, Tag } from 'antd';
import { CalendarRange, Lock, Unlock, Plus, X, Calendar, CheckCircle2 } from 'lucide-react';
import dayjs from 'dayjs';
import { dateRangePresets } from '../../../../shared/utils/datePresets';

export const AttendancePeriodModal = ({
  open,
  periods = [],
  onClose,
  onCreatePeriod,
  onTogglePeriod,
}) => {
  const [periodForm] = Form.useForm();
  const formRange = Form.useWatch('range', periodForm);

  const durationDays = useMemo(() => {
    if (formRange && formRange[0] && formRange[1]) {
      return formRange[1].diff(formRange[0], 'day') + 1;
    }
    return 0;
  }, [formRange]);

  const activePeriodsCount = useMemo(
    () => periods.filter((p) => !p.daKhoa).length,
    [periods]
  );

  const handleFinish = async (values) => {
    if (!onCreatePeriod) return;
    await onCreatePeriod({
      tuNgay: values.range[0].format('YYYY-MM-DD'),
      denNgay: values.range[1].format('YYYY-MM-DD'),
      ghiChu: values.ghiChu,
    });
    periodForm.resetFields();
  };

  const currentMonthStr = dayjs().format('MM/YYYY');
  const prevMonthStr = dayjs().subtract(1, 'month').format('MM/YYYY');

  return (
    <Modal
      open={open}
      width="98vw"
      style={{ maxWidth: 1720, top: 12, paddingBottom: 12 }}
      styles={{
        content: {
          padding: 0,
          borderRadius: 12,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '94vh',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
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
      {/* CSS TOÀN CỤC CHO POPUP LỊCH MỞ RỘNG */}
      <style>{`
        .expanded-calendar-popup .ant-picker-panel-container {
          border-radius: 10px !important;
          box-shadow: 0 20px 45px -12px rgba(0, 0, 0, 0.25) !important;
          border: 1px solid #e5e7eb !important;
          overflow: hidden;
        }
        .expanded-calendar-popup .ant-picker-panels {
          padding: 8px 4px !important;
        }
        .expanded-calendar-popup .ant-picker-date-panel {
          width: 340px !important;
        }
        .expanded-calendar-popup .ant-picker-header {
          padding: 8px 12px !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .expanded-calendar-popup .ant-picker-header-view {
          font-size: 15px !important;
          font-weight: 700 !important;
          color: #0f172a !important;
        }
        .expanded-calendar-popup .ant-picker-header button {
          color: #2563eb !important;
        }
        .expanded-calendar-popup .ant-picker-content {
          font-size: 14px !important;
        }
        .expanded-calendar-popup .ant-picker-content th {
          color: #64748b !important;
          font-weight: 600 !important;
          padding: 6px 0 !important;
          font-size: 12px !important;
          text-transform: uppercase;
        }
        .expanded-calendar-popup .ant-picker-cell {
          padding: 3px 0 !important;
        }
        .expanded-calendar-popup .ant-picker-cell-inner {
          min-width: 38px !important;
          height: 34px !important;
          line-height: 34px !important;
          border-radius: 6px !important;
          font-size: 13px !important;
          font-weight: 500 !important;
        }
        .expanded-calendar-popup .ant-picker-cell-in-view.ant-picker-cell-today .ant-picker-cell-inner::before {
          border-color: #2563eb !important;
          border-radius: 6px !important;
        }
        .expanded-calendar-popup .ant-picker-cell-selected .ant-picker-cell-inner,
        .expanded-calendar-popup .ant-picker-cell-range-start .ant-picker-cell-inner,
        .expanded-calendar-popup .ant-picker-cell-range-end .ant-picker-cell-inner {
          background: #2563eb !important;
          color: #fff !important;
          font-weight: 700 !important;
          box-shadow: 0 2px 6px rgba(37,99,235,0.3) !important;
        }
        .expanded-calendar-popup .ant-picker-cell-in-range::before {
          background: #eff6ff !important;
        }
        .expanded-calendar-popup .ant-picker-cell-range-hover::before {
          background: #dbeafe !important;
        }
        .expanded-calendar-popup .ant-picker-presets {
          border-right: 1px solid #f1f5f9 !important;
          padding: 8px 0 !important;
        }
        .expanded-calendar-popup .ant-picker-presets ul li {
          padding: 6px 16px !important;
          font-size: 13px !important;
          color: #334155 !important;
        }
        .expanded-calendar-popup .ant-picker-presets ul li:hover {
          background: #eff6ff !important;
          color: #1d4ed8 !important;
        }
        .expanded-calendar-popup .ant-picker-footer {
          border-top: 1px solid #f1f5f9 !important;
        }
        .expanded-calendar-popup .ant-picker-ranges {
          padding: 8px 16px !important;
        }
      `}</style>

      {/* 1. HEADER CỐ ĐỊNH - ĐỒNG BỘ TONE SÁNG (WHITE + BLUE ACCENT) */}
      <div
        style={{
          height: 64,
          background: '#ffffff',
          color: '#0f172a',
          padding: '0 24px',
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
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb',
              flexShrink: 0,
            }}
          >
            <CalendarRange size={19} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
              Quản lý kỳ chấm công
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
              Thiết lập khoảng thời gian tính công chuẩn, khóa sổ đóng băng dữ liệu hoặc mở khóa kỳ phục vụ tính lương
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              padding: '4px 12px',
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 20,
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
            }}
          >
            Đang mở: {activePeriodsCount} / {periods.length} kỳ
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
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* 2. BODY CUỘN TOÀN MÀN HÌNH */}
      <div
        style={{
          flex: 1,
          maxHeight: 'calc(94vh - 64px)',
          overflowY: 'auto',
          background: '#f8fafc',
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          minHeight: 0,
        }}
      >
        {/* CARD 1: FORM THIẾT LẬP KỲ CÔNG MỚI */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            padding: '20px 24px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Plus size={16} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                1. Khởi tạo kỳ chấm công mới
              </span>
            </div>

            {durationDays > 0 && (
              <Tag
                style={{
                  fontSize: 12,
                  padding: '3px 10px',
                  borderRadius: 6,
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  background: '#ecfdf5',
                  color: '#047857',
                  borderColor: '#a7f3d0',
                }}
              >
                <CheckCircle2 size={14} />
                Thời lượng kỳ: <strong>{durationDays} ngày</strong>
                <span style={{ color: '#64748b', fontWeight: 400, marginLeft: 4 }}>
                  (Từ {formRange[0].format('DD/MM/YYYY')} đến {formRange[1].format('DD/MM/YYYY')})
                </span>
              </Tag>
            )}
          </div>

          <Form form={periodForm} layout="vertical" onFinish={handleFinish}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(420px, 4.5fr) minmax(320px, 4fr) minmax(200px, 2fr)',
                gap: 20,
                alignItems: 'flex-start',
              }}
            >
              {/* CỘT 1: DATERANGEPICKER MỞ RỘNG */}
              <div>
                <Form.Item
                  name="range"
                  label={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                        Khoảng thời gian kỳ công <span style={{ color: '#ef4444' }}>*</span>
                      </span>
                      <span style={{ fontSize: 11, color: '#64748b' }}>
                        Bấm để mở 2 cuốn lịch lớn
                      </span>
                    </div>
                  }
                  rules={[{ required: true, message: 'Vui lòng chọn khoảng thời gian kỳ công.' }]}
                  style={{ marginBottom: 6 }}
                >
                  <DatePicker.RangePicker
                    format="DD/MM/YYYY"
                    presets={dateRangePresets}
                    popupClassName="expanded-calendar-popup"
                    placeholder={['Ngày bắt đầu kỳ (Từ ngày)', 'Ngày kết thúc kỳ (Đến ngày)']}
                    style={{
                      width: '100%',
                      height: 42,
                      borderRadius: 6,
                      fontSize: 14,
                    }}
                  />
                </Form.Item>
                <div style={{ fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={13} style={{ color: '#2563eb' }} />
                  Hỗ trợ phím tắt chọn nhanh: Hôm nay, Tháng này, Tháng trước, Quý này.
                </div>
              </div>

              {/* CỘT 2: TÊN KỲ / GHI CHÚ */}
              <div>
                <Form.Item
                  name="ghiChu"
                  label={
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                      Tên kỳ chấm công / Ghi chú
                    </span>
                  }
                  style={{ marginBottom: 6 }}
                >
                  <Input
                    placeholder="VD: Kỳ công Tháng 09/2026, Kỳ phụ cấp trực lễ..."
                    style={{
                      height: 42,
                      borderRadius: 6,
                      fontSize: 13,
                    }}
                  />
                </Form.Item>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: '#64748b' }}>Gợi ý nhanh:</span>
                  <button
                    type="button"
                    style={{
                      cursor: 'pointer',
                      padding: '3px 10px',
                      fontSize: 11,
                      background: '#f8fafc',
                      border: '1px solid #e5e7eb',
                      borderRadius: 4,
                      color: '#1d4ed8',
                      fontWeight: 500,
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
                    onClick={() => periodForm.setFieldValue('ghiChu', `Kỳ công Tháng ${currentMonthStr}`)}
                  >
                    + Kỳ công Tháng {currentMonthStr}
                  </button>
                  <button
                    type="button"
                    style={{
                      cursor: 'pointer',
                      padding: '3px 10px',
                      fontSize: 11,
                      background: '#f8fafc',
                      border: '1px solid #e5e7eb',
                      borderRadius: 4,
                      color: '#475569',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f1f5f9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f8fafc';
                    }}
                    onClick={() => periodForm.setFieldValue('ghiChu', `Kỳ công Tháng ${prevMonthStr}`)}
                  >
                    + Kỳ công Tháng {prevMonthStr}
                  </button>
                </div>
              </div>

              {/* CỘT 3: NÚT TẠO KỲ */}
              <div>
                <div style={{ height: 26 }} />
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<Plus size={16} />}
                  style={{
                    width: '100%',
                    height: 42,
                    background: '#2563eb',
                    borderColor: '#2563eb',
                    fontWeight: 600,
                    fontSize: 14,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    boxShadow: '0 1px 2px rgba(37,99,235,0.2)',
                  }}
                >
                  Tạo kỳ chấm công
                </Button>
              </div>
            </div>
          </Form>
        </div>

        {/* CARD 2: BẢNG DANH MỤC CÁC KỲ CHẤM CÔNG */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            padding: '20px 24px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: '#f1f5f9',
                  border: '1px solid #e5e7eb',
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CalendarRange size={16} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                2. Danh mục kỳ chấm công trong hệ thống
              </span>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                ({periods.length} bản ghi)
              </span>
            </div>

            <div style={{ fontSize: 12, color: '#64748b' }}>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>Lưu ý:</span> Khóa sổ kỳ công sẽ ngăn chặn các thao tác chỉnh sửa chấm công thuộc kỳ đó để chuẩn bị tạo bảng lương.
            </div>
          </div>

          <Table
            rowKey="id"
            size="middle"
            dataSource={periods}
            pagination={periods.length > 10 ? { pageSize: 10, showSizeChanger: true } : false}
            className="excel-data-grid"
            locale={{ emptyText: 'Chưa có kỳ chấm công nào được thiết lập.' }}
            columns={[
              {
                title: 'STT',
                width: 60,
                align: 'center',
                className: 'excel-stt-cell',
                render: (_, __, idx) => (
                  <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#64748b' }}>
                    {idx + 1}
                  </span>
                ),
              },
              {
                title: 'Tên kỳ / Ghi chú',
                dataIndex: 'ghiChu',
                render: (val) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#0f172a', fontWeight: 600, fontSize: 13 }}>
                      {val || 'Kỳ chuẩn theo tháng'}
                    </span>
                  </div>
                ),
              },
              {
                title: 'Từ ngày',
                align: 'center',
                width: 140,
                className: 'excel-date-cell',
                render: (_, item) => (
                  <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#1e293b' }}>
                    {dayjs(item.tuNgay).format('DD/MM/YYYY')}
                  </span>
                ),
              },
              {
                title: 'Đến ngày',
                align: 'center',
                width: 140,
                className: 'excel-date-cell',
                render: (_, item) => (
                  <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#1e293b' }}>
                    {dayjs(item.denNgay).format('DD/MM/YYYY')}
                  </span>
                ),
              },
              {
                title: 'Số ngày trong kỳ',
                align: 'center',
                width: 140,
                className: 'excel-num-cell',
                render: (_, item) => {
                  const d = dayjs(item.denNgay).diff(dayjs(item.tuNgay), 'day') + 1;
                  return (
                    <Tag
                      style={{
                        margin: 0,
                        fontVariantNumeric: 'tabular-nums',
                        fontWeight: 600,
                        color: '#334155',
                        background: '#f8fafc',
                        borderColor: '#e5e7eb',
                      }}
                    >
                      {d} ngày
                    </Tag>
                  );
                },
              },
              {
                title: 'Trạng thái',
                width: 150,
                align: 'center',
                render: (_, item) => (
                  <Tag
                    style={{
                      margin: 0,
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: 4,
                      border: '1px solid',
                      ...(item.daKhoa
                        ? { background: '#fff1f2', color: '#be123c', borderColor: '#fecdd3' }
                        : { background: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' }),
                    }}
                  >
                    {item.daKhoa ? '🔒 Đã khóa sổ' : '✓ Đang mở'}
                  </Tag>
                ),
              },
              {
                title: 'Thao tác',
                width: 140,
                align: 'center',
                render: (_, item) => (
                  <Button
                    size="small"
                    icon={item.daKhoa ? <Unlock size={13} /> : <Lock size={13} />}
                    onClick={() => onTogglePeriod && onTogglePeriod(item)}
                    style={{
                      fontSize: 12,
                      height: 28,
                      borderRadius: 6,
                      fontWeight: 500,
                      ...(item.daKhoa
                        ? { borderColor: '#e5e7eb', color: '#334155', background: '#ffffff' }
                        : { borderColor: '#fecdd3', color: '#be123c', background: '#fff1f2' }),
                    }}
                  >
                    {item.daKhoa ? 'Mở khóa' : 'Khóa kỳ'}
                  </Button>
                ),
              },
            ]}
          />
        </div>
      </div>
    </Modal>
  );
};