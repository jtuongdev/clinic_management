import { useEffect, useState } from 'react';
import { App, Button, Checkbox, DatePicker, Drawer, Form, Input, Modal, Popover, Select, Space, Spin, Tabs, Tag, Tooltip } from 'antd';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Plus, Printer, RefreshCw, Trash2, X, ChevronUp, ChevronDown, FileText, CalendarCheck, Maximize2, Minimize2, Filter } from 'lucide-react';
import dayjs from 'dayjs';
import { useScheduleManagement } from '../hooks/useScheduleManagement';
import { usePhongKhamOptions } from '../../../clinic/hook/usePhongKhamOptions';
import { FixedScheduleManagement } from './FixedScheduleManagement';
import './ScheduleManagement.css';
import { LeaveManagement } from './LeaveManagement';
import { AttendanceManagement } from './AttendanceManagement';

const dateFormat = 'YYYY-MM-DD';
const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const formatWeekRange = (days) => `${days[0].format('DD/MM/YYYY')} - ${days[6].format('DD/MM/YYYY')}`;

export const ScheduleManagement = ({ embedded = false }) => {
  const { modal } = App.useApp();
  const {
    activeCell, coSos, employees, editing, schedules, khoas, loadSchedules, loadSchedulesRange,
    loading, closeEditor, note, openCreate, openEdit, remove, saveSchedule, saving,
    selectedCoSo, selectedKhoa, setNote, roomId, setRoomId, dailyStatus, setDailyStatus,
    setSelectedCoSo, setSelectedKhoa,
    setWeekStart, weekStart, shifts, weekDays, goToday, fixedSchedules, fixedLoading,
    createFixed, bulkCreateFixed, updateFixed, removeFixed, generateSchedules, previewGenerate,
    markLeave,
    getAttendance, checkIn, checkOut,
    finalizeAbsent,
    attendance, attendanceKpi, attendanceAdjustments, attendancePeriods,
    statusCatalog, attendanceStatusCatalog, leaveStatusCatalog,
    leaves, createLeave, reviewLeave, cancelLeave, getAdjustments,
    requestAttendanceAdjustment, reviewAttendanceAdjustment, createAttendancePeriod, toggleAttendancePeriod, bulkCreate,
  } = useScheduleManagement();
  const { phongKhams, loading: roomsLoading } = usePhongKhamOptions(selectedKhoa);
  const [detailSchedule, setDetailSchedule] = useState(null);
  const [roomFilter, setRoomFilter] = useState();
  const [employeeFilter, setEmployeeFilter] = useState();
  const [shiftFilter, setShiftFilter] = useState();
  const [statusFilter, setStatusFilter] = useState();
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showKpi, setShowKpi] = useState(true);
  const [adjustments, setAdjustments] = useState([]);
  const [viewMode, setViewMode] = useState('week');
  const [activeScheduleTab, setActiveScheduleTab] = useState('daily');
  const [expandedTab, setExpandedTab] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkForm] = Form.useForm();
  const monthStart = weekStart.startOf('month');
  const monthEnd = weekStart.endOf('month');
  const monthDays = Array.from({ length: monthEnd.diff(monthStart, 'day') + 1 }, (_, index) => monthStart.add(index, 'day'));
  useEffect(() => {
    if (viewMode === 'month' && selectedKhoa) loadSchedulesRange(monthStart, monthEnd);
  }, [viewMode, selectedKhoa, monthStart.valueOf(), monthEnd.valueOf()]);

  const filteredSchedules = schedules.filter((schedule) => (
    (!roomFilter || schedule.maPhongKham === roomFilter)
      && (!employeeFilter || schedule.maNhanVien === employeeFilter)
      && (!shiftFilter || schedule.maCaTruc === shiftFilter)
      && (!statusFilter || (() => {
        const attendanceStatus = getAttendance(schedule.id)?.trangThai;
        if (statusFilter === 'NGHI') return schedule.trangThai === 'NGHI';
        if (statusFilter === 'VANG_MAT') return attendanceStatus === 'VANG_MAT';
        if (statusFilter === 'NGHI_PHEP') return attendanceStatus === 'NGHI_PHEP';
        if (statusFilter === 'CHECKED_IN') return Boolean(getAttendance(schedule.id)?.checkIn);
        if (statusFilter === 'NOT_CHECKED_IN') return schedule.trangThai === 'LAM_VIEC' && !attendanceStatus;
        return attendanceStatus === statusFilter;
      })())
      && (!search || schedule.tenNhanVien.toLowerCase().includes(search.toLowerCase()))
  ));
  const getFilteredSchedules = (shiftId, date) => filteredSchedules.filter(
    (schedule) => Number(schedule.maCaTruc) === Number(shiftId)
      && dayjs(schedule.ngayLam).isSame(date, 'day'),
  );
  const kpis = {
    employees: new Set(filteredSchedules.map((item) => item.maNhanVien)).size,
    shifts: filteredSchedules.length,
    working: filteredSchedules.filter((item) => item.trangThai === 'LAM_VIEC').length,
    leave: filteredSchedules.filter((item) => item.trangThai === 'NGHI').length,
    incomplete: attendanceKpi?.thieuCheckOut ?? filteredSchedules.filter((item) => item.trangThai === 'LAM_VIEC' && ['CHUA_CHAM_CONG', undefined].includes(getAttendance(item.id)?.trangThai)).length,
    absent: attendanceKpi?.vangMat ?? filteredSchedules.filter((item) => getAttendance(item.id)?.trangThai === 'VANG_MAT').length,
    late: attendanceKpi?.diMuon ?? filteredSchedules.filter((item) => ['DI_MUON', 'DI_MUON_VE_SOM'].includes(getAttendance(item.id)?.trangThai)).length,
    checkedIn: attendanceKpi?.daCheckIn ?? filteredSchedules.filter((item) => Boolean(getAttendance(item.id)?.checkIn)).length,
    checkedOut: attendanceKpi?.daCheckOut ?? filteredSchedules.filter((item) => Boolean(getAttendance(item.id)?.checkOut)).length,
    pending: attendanceKpi?.choXacNhan ?? filteredSchedules.filter((item) => getAttendance(item.id)?.trangThai === 'CHO_XAC_NHAN').length,
  };
  const statusMeta = (schedule) => {
    if (schedule.trangThai === 'NGHI') return { label: statusCatalog.NGHI || schedule.trangThai, color: 'red', icon: '●' };
    if (schedule.trangThai === 'HUY') return { label: statusCatalog.HUY || schedule.trangThai, color: 'default', icon: '×' };
    const attendanceStatus = getAttendance(schedule.id)?.trangThai;
    if (attendanceStatus === 'VANG_MAT') return { label: attendanceStatusCatalog.VANG_MAT || attendanceStatus, color: 'red', icon: '!' };
    if (attendanceStatus === 'THIEU_CHECK_OUT') return { label: attendanceStatusCatalog.THIEU_CHECK_OUT || attendanceStatus, color: 'volcano', icon: '!' };
    if (attendanceStatus === 'NGHI_PHEP') return { label: attendanceStatusCatalog.NGHI_PHEP || attendanceStatus, color: 'orange', icon: '●' };
    return { label: schedule.nguonLich, color: 'blue', icon: '✓' };
  };
  const exportSchedule = () => {
    const header = ['Ngày', 'Nhân viên', 'Ca', 'Phòng', 'Trạng thái', 'Ghi chú'];
    const lines = filteredSchedules.map((item) => {
      const meta = statusMeta(item);
      return [dayjs(item.ngayLam).format('DD/MM/YYYY'), item.tenNhanVien, item.tenCa, item.tenPhongKham || '', meta.label, item.ghiChu || '']
        .map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',');
    });
    const blob = new Blob([`\uFEFF${[header.join(','), ...lines].join('\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lich-lam-viec-${dayjs().format('YYYYMMDD-HHmm')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const shiftPicker = (title) => (
    <div className="schedule-popover-content">
      <div className="schedule-popover-header">
        <strong>{title}</strong>
        <Button type="text" size="small" icon={<X size={15} />} onClick={closeEditor} />
      </div>
      <div className="schedule-popover-body">
        <Input.TextArea
          rows={2}
          value={note}
          maxLength={500}
          placeholder="Ghi chú (không bắt buộc)"
          onChange={(event) => setNote(event.target.value)}
        />
        <Select
          allowClear
          value={roomId}
          loading={roomsLoading}
          placeholder="Phòng khám (không bắt buộc)"
          options={phongKhams.map((room) => ({ value: room.id, label: `${room.ma} - ${room.ten}` }))}
          onChange={setRoomId}
          style={{ width: '100%', marginTop: 8 }}
        />
        {editing && (
          <Select
            value={dailyStatus}
            options={Object.entries(statusCatalog).map(([value, label]) => ({ value, label }))}
            onChange={setDailyStatus}
            style={{ width: '100%', marginTop: 8 }}
          />
        )}
        <div className="schedule-shift-list">
          {shifts.map((shift) => (
            <Button
              key={shift.id}
              className="schedule-shift-option"
              loading={saving}
              onClick={() => saveSchedule(shift.id)}
            >
              <span>{shift.tenCa}</span>
              <small>{shift.thoiGianBatDau} - {shift.thoiGianKetThuc}</small>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  const employeePicker = (title) => (
    <div className="schedule-popover-content">
      <div className="schedule-popover-header">
        <strong>{title}</strong>
        <Button type="text" size="small" icon={<X size={15} />} onClick={closeEditor} />
      </div>
      <div className="schedule-popover-body">
        <Input.TextArea
          rows={2}
          value={note}
          maxLength={500}
          placeholder="Ghi chú (không bắt buộc)"
          onChange={(event) => setNote(event.target.value)}
        />
        <Select
          allowClear
          value={roomId}
          loading={roomsLoading}
          placeholder="Phòng khám (không bắt buộc)"
          options={phongKhams.map((room) => ({ value: room.id, label: `${room.ma} - ${room.ten}` }))}
          onChange={setRoomId}
          style={{ width: '100%', marginTop: 8 }}
        />
        <div className="schedule-shift-list">
          {employees.map((employee) => (
            <Button
              key={employee.id}
              className="schedule-shift-option"
              loading={saving}
              onClick={() => saveSchedule(employee.id)}
            >
              <span>{employee.hoTen}</span>
              <small>@{employee.username}</small>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`schedule-container ${embedded ? 'schedule-container-embedded' : ''} ${expandedTab && activeScheduleTab === 'daily' ? 'schedule-container-expanded' : ''}`}>
      {/* Header */}
      {!embedded && (
        <div className="schedule-header">
          <div className="schedule-header-left">
            <h1>Lịch làm việc</h1>
            <span>Phân công ca trực theo tuần cho nhân viên</span>
          </div>
          <div className="schedule-header-tabs" role="tablist" aria-label="Chức năng lịch làm việc">
            {[
              ['daily', <CalendarDays size={14} />, 'Lịch theo ngày'],
              ['attendance', <Clock3 size={14} />, 'Bảng chấm công'],
              ['leave', <FileText size={14} />, 'Đơn nghỉ phép'],
              ['fixed', <CalendarCheck size={14} />, 'Lịch cố định'],
            ].map(([key, icon, label]) => (
              <button
                type="button"
                role="tab"
                aria-selected={activeScheduleTab === key}
                className={`schedule-header-tab ${activeScheduleTab === key ? 'schedule-header-tab-active' : ''}`}
                key={key}
                onClick={() => {
                  setActiveScheduleTab(key);
                  setExpandedTab(false);
                }}
              >
                {icon}
                <span>{label}</span>
              </button>
            ))}
          </div>
          <div className="schedule-header-right">
            {showKpi && (
              <div className="schedule-inline-stats" aria-label="Tổng quan lịch làm việc">
                {[
                  ['Nhân viên', kpis.employees],
                  ['Ca làm', kpis.shifts],
                  ['Đã check-in', kpis.checkedIn],
                  ['Vắng', kpis.absent],
                  ['Đi muộn', kpis.late],
                ].map(([label, value]) => (
                  <span className="schedule-inline-stat" key={label}>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </span>
                ))}
              </div>
            )}
            <Button
              className="schedule-toggle-kpi"
              type="text"
              icon={showKpi ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              onClick={() => setShowKpi(!showKpi)}
              title={showKpi ? 'Thu nhỏ KPI' : 'Hiện KPI'}
            >
              KPI
            </Button>
          </div>
        </div>
      )}

      {/* Action / Context Bar */}
      <div
        className="schedule-action-bar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Space wrap>
          <Select
            placeholder="Chọn cơ sở"
            value={selectedCoSo}
            options={coSos.map((coSo) => ({ value: coSo.id, label: coSo.ten }))}
            onChange={(value) => {
              setSelectedCoSo(value);
              setSelectedKhoa(undefined);
            }}
            style={{ minWidth: 180, borderRadius: 8 }}
          />
          <Select
            placeholder="Chọn khoa"
            value={selectedKhoa}
            options={khoas.map((khoa) => ({ value: khoa.id, label: khoa.ten }))}
            onChange={setSelectedKhoa}
            disabled={!selectedCoSo}
            style={{ minWidth: 180, borderRadius: 8 }}
          />
          <Button onClick={goToday} style={{ borderRadius: 8 }}>
            Hôm nay
          </Button>
          <Button icon={<RefreshCw size={14} />} onClick={loadSchedules} style={{ borderRadius: 8 }}>
            Làm mới
          </Button>
        </Space>

        <Space wrap>
          <Button
            type={showFilters ? 'primary' : 'default'}
            icon={<Filter size={14} />}
            onClick={() => setShowFilters((value) => !value)}
            title={showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
          >
            Bộ lọc
          </Button>
          <Button icon={<Printer size={14} />} onClick={() => window.print()} style={{ borderRadius: 8 }}>
            In
          </Button>
          <Button onClick={exportSchedule} style={{ borderRadius: 8 }}>
            Xuất CSV
          </Button>
          <Button
            type="primary"
            icon={<CalendarDays size={14} />}
            onClick={() => setBulkOpen(true)}
            style={{ background: '#0b4f6c', borderColor: '#0b4f6c', borderRadius: 8 }}
          >
            Gán hàng loạt
          </Button>
          <Button
            danger
            onClick={() =>
              modal.confirm({
                title: 'Chốt ca vắng mặt?',
                content:
                  'Các ca đã kết thúc, chưa check-in và không có nghỉ phép đã duyệt sẽ được ghi nhận là Vắng mặt.',
                okText: 'Chốt vắng mặt',
                cancelText: 'Hủy',
                onOk: finalizeAbsent,
              })
            }
            style={{ borderRadius: 8 }}
          >
            Chốt vắng mặt
          </Button>
        </Space>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="schedule-filters">
          <Select allowClear placeholder="Phòng" value={roomFilter} onChange={setRoomFilter} options={phongKhams.map((room) => ({ value: room.id, label: room.ten }))} />
          <Select allowClear placeholder="Nhân viên" value={employeeFilter} onChange={setEmployeeFilter} options={employees.map((employee) => ({ value: employee.id, label: employee.hoTen }))} />
          <Select allowClear placeholder="Ca" value={shiftFilter} onChange={setShiftFilter} options={shifts.map((shift) => ({ value: shift.id, label: shift.tenCa }))} />
          <Select allowClear placeholder="Trạng thái" value={statusFilter} onChange={setStatusFilter} options={[
            { value: 'CHECKED_IN', label: 'Đã check-in' },
            { value: 'NOT_CHECKED_IN', label: 'Chưa chấm công' },
            ...Object.entries(attendanceStatusCatalog).map(([value, label]) => ({ value, label })),
            ...Object.entries(statusCatalog).map(([value, label]) => ({ value, label })),
          ]} />
          <Input.Search allowClear placeholder="Tìm nhân viên" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
      )}

      <Tabs
        className={`schedule-tabs ${expandedTab ? 'schedule-tabs-expanded' : ''}`}
        activeKey={activeScheduleTab}
        onChange={(key) => {
          setActiveScheduleTab(key);
          setExpandedTab(false);
        }}
        renderTabBar={embedded ? undefined : () => null}
        items={[
        {
          key: 'daily',
          label: (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CalendarDays size={15} /> Lịch theo ngày
            </span>
          ),
          children: (
            <>
              <div className="schedule-week-nav">
                <Button icon={<ChevronLeft size={17} />} onClick={() => setWeekStart((date) => date.subtract(viewMode === 'month' ? 1 : 7, viewMode === 'month' ? 'month' : 'day'))}>{viewMode === 'month' ? 'Tháng trước' : 'Tuần trước'}</Button>
                <Space>
                  <Button type={viewMode === 'week' ? 'primary' : 'default'} onClick={() => setViewMode('week')}>Tuần</Button>
                  <Button type={viewMode === 'month' ? 'primary' : 'default'} onClick={() => setViewMode('month')}>Tháng</Button>
                  <span className="week-range">{viewMode === 'month' ? weekStart.format('MM/YYYY') : formatWeekRange(weekDays)}</span>
                </Space>
                <Space>
                  <Button onClick={() => setWeekStart((date) => date.add(viewMode === 'month' ? 1 : 7, viewMode === 'month' ? 'month' : 'day'))}>{viewMode === 'month' ? 'Tháng sau' : 'Tuần sau'} <ChevronRight size={17} /></Button>
                  <Button
                    type="text"
                    className="schedule-expand-button"
                    icon={expandedTab ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                    onClick={() => setExpandedTab((value) => !value)}
                    title={expandedTab ? 'Thu nhỏ bảng ca trực' : 'Mở rộng bảng ca trực'}
                  >
                    {expandedTab ? 'Thu nhỏ' : 'Mở rộng'}
                  </Button>
                </Space>
              </div>

              {!selectedKhoa ? (
                <div className="schedule-selection-empty">Vui lòng chọn cơ sở và khoa để xem lịch làm việc.</div>
              ) : (
                viewMode === 'month' ? (
                  <div className="schedule-month-grid">
                    {monthDays.map((date) => {
                      const daySchedules = filteredSchedules.filter((item) => dayjs(item.ngayLam).isSame(date, 'day'));
                      return (
                        <div className={`schedule-month-day ${date.isSame(dayjs(), 'day') ? 'schedule-today' : ''}`} key={date.format(dateFormat)}>
                          <strong>{date.format('DD/MM')}</strong>
                          {daySchedules.length === 0 && <small className="schedule-month-empty">Không có lịch</small>}
                          {daySchedules.slice(0, 4).map((item) => {
                            const meta = statusMeta(item);
                            return <Tooltip key={item.id} title={`${meta.label} · ${item.tenCa}`}><button type="button" className={`schedule-month-item status-${meta.color}`} onClick={() => setDetailSchedule(item)}><span>{meta.icon}</span> {item.tenNhanVien}</button></Tooltip>;
                          })}
                          {daySchedules.length > 4 && <small>+{daySchedules.length - 4} lịch khác</small>}
                        </div>
                      );
                    })}
                  </div>
                ) : <div className="schedule-calendar-wrapper">
                  <div className="schedule-calendar">
                    <div className="schedule-calendar-corner">Ca trực</div>
                    {weekDays.map((date, index) => (
                      <div key={date.format(dateFormat)} className={`schedule-day-header ${date.isSame(dayjs(), 'day') ? 'schedule-today' : ''}`}>
                        <span className="day-name">{dayNames[index]}</span>
                        <span className="day-number">{date.format('DD/MM')}</span>
                      </div>
                    ))}

                    {shifts.map((shift) => (
                      <div className="schedule-row" key={shift.id}>
                        <div className="schedule-shift-label">
                          <strong>{shift.tenCa}</strong>
                          <small>{shift.thoiGianBatDau} - {shift.thoiGianKetThuc}</small>
                        </div>
                        {weekDays.map((date) => {
                          const cellSchedules = getFilteredSchedules(shift.id, date);
                          const cellKey = `${shift.id}-${date.format(dateFormat)}`;
                          const isActive = activeCell?.shift.id === shift.id && activeCell.date.isSame(date, 'day');
                          return (
                            <div className="schedule-cell" key={cellKey}>
                              {cellSchedules.length ? (
                                <>
                                  {cellSchedules.map((schedule) => (
                                    <Popover
                                      key={schedule.id}
                                      trigger="click"
                                      open={editing?.id === schedule.id}
                                      onOpenChange={(open) => !open && closeEditor()}
                                      content={shiftPicker(`Sửa lịch - ${schedule.tenNhanVien}`)}
                                    >
                                      <button type="button" className="schedule-card" onClick={() => setDetailSchedule(schedule)}>
                                        <span className="schedule-card-title"><Clock3 size={14} />{schedule.tenNhanVien}</span>
                                        <small>{schedule.tenCa}{schedule.tenPhongKham ? ` - ${schedule.tenPhongKham}` : ''}</small>
                                        {(() => {
                                          const attendance = getAttendance(schedule.id);
                                          return attendance ? (
                                            <small className="schedule-attendance">
                                              {attendance.checkIn ? `Vào ${dayjs(attendance.checkIn).format('HH:mm')}` : 'Chưa check-in'}
                                              {attendance.checkOut ? ` · Ra ${dayjs(attendance.checkOut).format('HH:mm')}` : ''}
                                            </small>
                                          ) : null;
                                        })()}
                                        <Tooltip title="Trạng thái lịch và nguồn phân công">
                                          <Tag color={schedule.trangThai === 'NGHI' ? 'red' : schedule.trangThai === 'HUY' ? 'default' : (schedule.nguonLich === 'CO_DINH' ? 'blue' : 'gold')}>
                                            {statusCatalog[schedule.trangThai] || schedule.trangThai}
                                          </Tag>
                                        </Tooltip>
                                        {getAttendance(schedule.id)?.trangThai && (
                                          <Tooltip title={`Chấm công: ${attendanceStatusCatalog[getAttendance(schedule.id).trangThai] || getAttendance(schedule.id).trangThai}`}>
                                          <Tag color={['VANG_MAT', 'THIEU_CHECK_OUT'].includes(getAttendance(schedule.id).trangThai) ? 'red' : 'green'}>
                                            {attendanceStatusCatalog[getAttendance(schedule.id).trangThai] || getAttendance(schedule.id).trangThai}
                                          </Tag>
                                          </Tooltip>
                                        )}
                                        {schedule.ghiChu && <em>{schedule.ghiChu}</em>}
                                        <span className="schedule-card-actions">
                                          <span>Sửa</span>
                                          {schedule.trangThai === 'LAM_VIEC' && !getAttendance(schedule.id)?.checkIn && <span role="button" tabIndex={0} onClick={(event) => { event.stopPropagation(); checkIn(schedule.id); }}>Check-in</span>}
                                          {getAttendance(schedule.id)?.checkIn && !getAttendance(schedule.id)?.checkOut && <span role="button" tabIndex={0} onClick={(event) => { event.stopPropagation(); checkOut(schedule.id); }}>Check-out</span>}
                                          {schedule.trangThai !== 'NGHI' && <span role="button" tabIndex={0} onClick={(event) => { event.stopPropagation(); markLeave(schedule); }} onKeyDown={(event) => event.key === 'Enter' && markLeave(schedule)}>Nghỉ</span>}
                                          <span role="button" tabIndex={0} onClick={(event) => { event.stopPropagation(); remove(schedule); }} onKeyDown={(event) => event.key === 'Enter' && remove(schedule)}><Trash2 size={13} /> Xóa</span>
                                        </span>
                                      </button>
                                    </Popover>
                                  ))}
                                  <Popover
                                    trigger="click"
                                    open={isActive}
                                    onOpenChange={(open) => !open && closeEditor()}
                                    content={employeePicker(`Thêm nhân viên - ${shift.tenCa}`)}
                                  >
                                    <button type="button" className="schedule-add-inline" onClick={() => openCreate(shift, date)}>
                                      <Plus size={14} /> Thêm
                                    </button>
                                  </Popover>
                                </>
                              ) : (
                                <Popover
                                  trigger="click"
                                  open={isActive}
                                  onOpenChange={(open) => !open && closeEditor()}
                                  content={employeePicker(`Thêm nhân viên - ${shift.tenCa}`)}
                                >
                                  <button type="button" className="schedule-empty-cell" onClick={() => openCreate(shift, date)}>
                                    <Plus size={17} />
                                    <span>Thêm nhân viên</span>
                                  </button>
                                </Popover>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  {loading && <div className="schedule-loading"><Spin /> Đang tải lịch...</div>}
                  {!loading && employees.length === 0 && <div className="schedule-empty-state">Chưa có nhân viên đang hoạt động.</div>}
                </div>
              )}
            </>
          )
        },
        {
          key: 'attendance',
          label: (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Clock3 size={15} /> Bảng chấm công
            </span>
          ),
          children: (
            <AttendanceManagement
              schedules={filteredSchedules}
              attendance={attendance}
              checkIn={checkIn}
              checkOut={checkOut}
              loading={loading}
              adjustments={attendanceAdjustments}
              attendanceLabels={attendanceStatusCatalog}
              attendanceKpi={attendanceKpi}
              periods={attendancePeriods}
              requestAdjustment={requestAttendanceAdjustment}
              reviewAdjustment={reviewAttendanceAdjustment}
              createPeriod={createAttendancePeriod}
              togglePeriod={toggleAttendancePeriod}
            />
          ),
        },
        {
          key: 'leave',
          label: (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <FileText size={15} /> Đơn nghỉ phép
            </span>
          ),
          children: <LeaveManagement employees={employees} leaves={leaves} createLeave={createLeave} reviewLeave={reviewLeave} cancelLeave={cancelLeave} statusLabels={leaveStatusCatalog} />,
        },
        {
          key: 'fixed',
          label: (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <CalendarCheck size={15} /> Lịch cố định
            </span>
          ),
          children: (
            <FixedScheduleManagement
              employees={employees}
              shifts={shifts}
              phongKhams={phongKhams}
              roomsLoading={roomsLoading}
              selectedKhoa={selectedKhoa}
              fixedSchedules={fixedSchedules}
              fixedLoading={fixedLoading}
              createFixed={createFixed}
              bulkCreateFixed={bulkCreateFixed}
              previewGenerate={previewGenerate}
              updateFixed={updateFixed}
              removeFixed={removeFixed}
              generateSchedules={generateSchedules}
            />
          )
        }
      ]} />

      <Modal
        title="Gán lịch hàng loạt"
        className="schedule-bulk-modal"
        open={bulkOpen}
        okText="Tạo lịch"
        cancelText="Hủy"
        onCancel={() => setBulkOpen(false)}
        onOk={async () => {
          const values = await bulkForm.validateFields();
          await bulkCreate({
            maNhanVien: values.maNhanVien,
            maKhoa: selectedKhoa,
            maCaTruc: values.maCaTruc,
            tuNgay: values.range[0].format(dateFormat),
            denNgay: values.range[1].format(dateFormat),
            thuTrongTuan: values.thuTrongTuan,
            ghiChu: values.ghiChu,
          });
          bulkForm.resetFields();
          setBulkOpen(false);
        }}
      >
        <Form form={bulkForm} layout="vertical">
          <Form.Item name="maNhanVien" label="Nhân viên" rules={[{ required: true, message: 'Chọn ít nhất một nhân viên.' }]}>
            <Select
              mode="multiple"
              getPopupContainer={() => document.body}
              listHeight={Math.max(240, window.innerHeight - 260)}
              options={employees.map((employee) => ({ value: employee.id, label: employee.hoTen }))}
            />
          </Form.Item>
          <Form.Item name="maCaTruc" label="Ca trực" rules={[{ required: true, message: 'Chọn ca trực.' }]}>
            <Select
              getPopupContainer={() => document.body}
              listHeight={Math.max(240, window.innerHeight - 260)}
              options={shifts.map((shift) => ({ value: shift.id, label: `${shift.tenCa} (${shift.thoiGianBatDau}-${shift.thoiGianKetThuc})` }))}
            />
          </Form.Item>
          <Form.Item name="range" label="Khoảng ngày" rules={[{ required: true, message: 'Chọn khoảng ngày.' }]}>
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="thuTrongTuan" label="Ngày trong tuần">
            <Checkbox.Group options={[['MONDAY', 'Thứ 2'], ['TUESDAY', 'Thứ 3'], ['WEDNESDAY', 'Thứ 4'], ['THURSDAY', 'Thứ 5'], ['FRIDAY', 'Thứ 6'], ['SATURDAY', 'Thứ 7'], ['SUNDAY', 'Chủ nhật']]} />
          </Form.Item>
          <Form.Item name="ghiChu" label="Ghi chú"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="Chi tiết lịch làm việc"
        open={!!detailSchedule}
        onClose={() => setDetailSchedule(null)}
        size="small"
        className="schedule-drawer"
      >
        {detailSchedule && (() => {
          const currentAttendance = getAttendance(detailSchedule.id);
          return (
            <div className="schedule-detail">
              <h3>{detailSchedule.tenNhanVien}</h3>
              <p>{dayjs(detailSchedule.ngayLam).format('DD/MM/YYYY')} · {detailSchedule.tenCa}</p>
              <p><strong>Thời gian:</strong> {detailSchedule.thoiGianBatDau} - {detailSchedule.thoiGianKetThuc}</p>
              <p><strong>Phòng:</strong> {detailSchedule.tenPhongKham || 'Chưa chỉ định'}</p>
              <Tag color={detailSchedule.trangThai === 'NGHI' ? 'red' : 'blue'}>
                {statusCatalog[detailSchedule.trangThai] || detailSchedule.trangThai}
              </Tag>
              <h4>Chấm công</h4>
              <p><strong>Trạng thái:</strong> {currentAttendance?.trangThai ? (attendanceStatusCatalog[currentAttendance.trangThai] || currentAttendance.trangThai) : '-'}</p>
              <p>Check-in: {currentAttendance?.checkIn ? dayjs(currentAttendance.checkIn).format('HH:mm') : 'Chưa check-in'}</p>
              <p>Check-out: {currentAttendance?.checkOut ? dayjs(currentAttendance.checkOut).format('HH:mm') : 'Chưa check-out'}</p>
              <p>Đi muộn: {currentAttendance?.phutDiMuon || 0} phút</p>
              <p>Về sớm: {currentAttendance?.phutVeSom || 0} phút</p>
              <p>Thực tế: {currentAttendance?.checkOut ? `${currentAttendance.gioLamThucTe} giờ` : 'Chưa có dữ liệu'}</p>
              <Space>
                <Button onClick={async () => setAdjustments(await getAdjustments(detailSchedule.id))}>Lịch sử điều chỉnh</Button>
                <Button onClick={() => { setDetailSchedule(null); openEdit(detailSchedule); }}>Điều chỉnh lịch</Button>
                {detailSchedule.trangThai === 'LAM_VIEC' && !currentAttendance?.checkIn && <Button type="primary" onClick={() => checkIn(detailSchedule.id)}>Check-in</Button>}
                {currentAttendance?.checkIn && !currentAttendance?.checkOut && <Button type="primary" onClick={() => checkOut(detailSchedule.id)}>Check-out</Button>}
              </Space>
              {adjustments.length > 0 && (
                <div className="schedule-adjustment-history">
                  <h4>Lịch sử điều chỉnh</h4>
                  {adjustments.map(item => (
                    <div className="schedule-adjustment-item" key={item.id}>
                      <strong>{dayjs(item.thoiDiem).format('DD/MM/YYYY HH:mm')}</strong>
                      <span>{item.trangThaiCu} → {item.trangThaiMoi}</span>
                      <small>{item.lyDo || 'Không có lý do'}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </Drawer>
    </div>
  );
};