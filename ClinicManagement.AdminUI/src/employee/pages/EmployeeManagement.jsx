import { useEffect, useState, useMemo } from 'react';
import {
  App,
  Button,
  Col,
  Drawer,
  Dropdown,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import {
  Plus,
  Search,
  UserRoundPen,
  UsersRound,
  RefreshCw,
  UserCheck,
  UserX,
  Stethoscope,
  Mail,
  Phone,
  RotateCcw,
  ShieldCheck,
  Shield,
  Briefcase,
  Trash2,
  MoreHorizontal,
  Building2,
  DoorOpen,
  Calendar,
  BadgeCheck,
  Lock,
  Filter,
  Hospital,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import {
  HolderOutlined,
  SearchOutlined as AntSearchOutlined,
  CloseOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons';
import { employeeApi } from '../api/employee.api';
import { coSoApi } from '../../facility/api/facility.api';
import { PayrollManagement } from '../payroll/PayrollManagement';
import { useExcelGridResizer } from '../../shared/hooks/useExcelGridResizer';
import '../../styles/excel-grid.css';
import './EmployeeManagement.css';

const PRIMARY = '#2563eb';
const PRIMARY_HOVER = '#1d4ed8';
const TEXT_DARK = '#0f172a';
const TEXT_MUTED = '#64748b';
const BORDER_LIGHT = '#e5e7eb';

const emptyForm = {
  maNhanVien: '',
  username: '',
  password: '',
  hoTen: '',
  ngaySinh: '',
  gioiTinh: 'M',
  email: '',
  dienThoai: '',
  maCoSo: undefined,
  maChucVu: undefined,
  maKhoa: undefined,
  maPhongKham: undefined,
  chuyenKhoa: '',
  soHanhNghe: '',
  ngayVaoLam: '',
  trangThaiLamViec: 'DANG_LAM',
  luongCoBan: undefined,
};

const getApiErrorMessage = (error, fallback) => {
  const response = error?.response?.data;
  const validationErrors = response?.errors
    ? Object.values(response.errors).flat().join(' ')
    : '';
  return validationErrors || response?.message || response?.detail || fallback;
};

const toEmployeePayload = (values, includeCredentials = true) => {
  const payload = {
    ...values,
    ngaySinh: values.ngaySinh || undefined,
    maChucVu:
      values.maChucVu === undefined || values.maChucVu === ''
        ? undefined
        : Number(values.maChucVu),
    maKhoa:
      values.maKhoa === undefined || values.maKhoa === ''
        ? undefined
        : Number(values.maKhoa),
    maPhongKham:
      values.maPhongKham === undefined || values.maPhongKham === ''
        ? undefined
        : Number(values.maPhongKham),
    luongCoBan:
      values.luongCoBan === undefined || values.luongCoBan === ''
        ? undefined
        : Number(values.luongCoBan),
  };

  if (!includeCredentials) {
    delete payload.username;
    delete payload.password;
  }

  return payload;
};

export const EmployeeManagement = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [coSoFilter, setCoSoFilter] = useState(undefined);
  const [deptFilter, setDeptFilter] = useState(undefined);
  const [positionFilter, setPositionFilter] = useState(undefined);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  // Drawer & Modals
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [drawerCoSo, setDrawerCoSo] = useState(undefined);
  const [roleModal, setRoleModal] = useState({ open: false, employee: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, employee: null });
  const [deleteForm] = Form.useForm();

  // Catalogs
  const [coSos, setCoSos] = useState([]);
  const [coSosLoading, setCoSosLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [roleLoading, setRoleLoading] = useState(false);
  const [positions, setPositions] = useState([]);
  const [positionsLoading, setPositionsLoading] = useState(false);
  const [khoas, setKhoas] = useState([]);
  const [khoasLoading, setKhoasLoading] = useState(false);

  // Cascading Rooms for Drawer
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const activeTab = ['payroll'].includes(searchParams.get('tab'))
    ? searchParams.get('tab')
    : 'employees';

  // Load Catalogs on Mount (No hardcoded maCoSo)
  useEffect(() => {
    let active = true;
    const fetchCatalogs = async () => {
      setPositionsLoading(true);
      setKhoasLoading(true);
      setCoSosLoading(true);
      try {
        const [posRes, khoaRes, coSoRes] = await Promise.all([
          employeeApi.getPositions(),
          employeeApi.getDepartments(), // Lấy toàn bộ Khoa, không ép mặc định cơ sở 1
          coSoApi.getDropdown(),
        ]);
        if (!active) return;
        setPositions(posRes.data?.data || []);
        setKhoas(khoaRes.data?.data || []);
        setCoSos(coSoRes.data?.data || []);
      } catch (err) {
        console.error('Không thể tải danh mục cơ sở, chức vụ hoặc khoa phòng:', err);
      } finally {
        if (active) {
          setPositionsLoading(false);
          setKhoasLoading(false);
          setCoSosLoading(false);
        }
      }
    };
    fetchCatalogs();
    return () => {
      active = false;
    };
  }, []);

  // Fetch Rooms when department changes in Drawer
  const loadRoomsForKhoa = async (maKhoa) => {
    if (!maKhoa) {
      setRooms([]);
      return;
    }
    setRoomsLoading(true);
    try {
      const res = await employeeApi.getRooms(maKhoa);
      const data = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi tải danh sách phòng:', err);
      setRooms([]);
    } finally {
      setRoomsLoading(false);
    }
  };

  // Main list fetch
  const loadEmployees = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    status = statusFilter,
    searchTerm = keyword,
    maKhoa = deptFilter,
    maChucVu = positionFilter
  ) => {
    setLoading(true);
    try {
      const isActiveParam =
        status === 'ACTIVE' ? true : status === 'INACTIVE' ? false : undefined;
      const response = await employeeApi.getPaged({
        pageIndex: page,
        pageSize,
        keyword: searchTerm || undefined,
        isActive: isActiveParam,
        maKhoa: maKhoa || undefined,
        maChucVu: maChucVu || undefined,
      });
      const result = response.data.data;
      setEmployees(result.items || []);
      setPagination({
        current: result.pageIndex,
        pageSize: result.pageSize,
        total: result.totalCount,
      });
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Không thể tải danh sách nhân viên.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'payroll') return;
    loadEmployees(1, pagination.pageSize, statusFilter, keyword, deptFilter, positionFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleSearch = () => {
    loadEmployees(1, pagination.pageSize, statusFilter, keyword, deptFilter, positionFilter);
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    loadEmployees(1, pagination.pageSize, val, keyword, deptFilter, positionFilter);
  };

  // Toolbar CoSo filter change
  const handleCoSoFilterChange = async (val) => {
    setCoSoFilter(val);
    setDeptFilter(undefined);
    setKhoasLoading(true);
    try {
      // Nếu chọn cơ sở cụ thể, fetch theo cơ sở đó; nếu bỏ chọn (undefined), fetch toàn bộ
      const res = await employeeApi.getDepartments(val);
      setKhoas(res.data?.data || []);
    } catch (err) {
      console.error('Không thể tải khoa theo cơ sở:', err);
    } finally {
      setKhoasLoading(false);
    }
    loadEmployees(1, pagination.pageSize, statusFilter, keyword, undefined, positionFilter);
  };

  const handleDeptFilterChange = (val) => {
    setDeptFilter(val);
    loadEmployees(1, pagination.pageSize, statusFilter, keyword, val, positionFilter);
  };

  const handlePositionFilterChange = (val) => {
    setPositionFilter(val);
    loadEmployees(1, pagination.pageSize, statusFilter, keyword, deptFilter, val);
  };

  const handleResetFilters = async () => {
    setKeyword('');
    setStatusFilter('ALL');
    setCoSoFilter(undefined);
    setDeptFilter(undefined);
    setPositionFilter(undefined);

    // Reset lại danh sách toàn bộ khoa
    try {
      const res = await employeeApi.getDepartments();
      setKhoas(res.data?.data || []);
    } catch {
      // ignore
    }

    loadEmployees(1, pagination.pageSize, 'ALL', '', undefined, undefined);
  };

  // Open Create Drawer
  const openCreate = () => {
    setEditing(null);
    setDrawerCoSo(undefined);
    form.resetFields();
    form.setFieldsValue({
      ...emptyForm,
      maNhanVien: `NV${String(Date.now()).slice(-4)}`,
    });
    setRooms([]);
    setDrawerOpen(true);
  };

  // Open Edit Drawer
  const openEdit = async (employee) => {
    try {
      const detailRes = await employeeApi.getById(employee.id);
      const detail = detailRes.data?.data || employee;
      const mainKhoa =
        detail.maKhoa ||
        detail.khoas?.find((k) => k.laKhoaChinh)?.maKhoa ||
        detail.khoas?.[0]?.maKhoa ||
        employee.maKhoa;

      setEditing(detail);

      // Xác định cơ sở tương ứng của khoa này
      const matchedKhoa = khoas.find((k) => k.id === mainKhoa);
      const effectiveCoSo = matchedKhoa?.maCoSo || undefined;
      setDrawerCoSo(effectiveCoSo);

      // Load cascading rooms for the employee's current department
      if (mainKhoa) {
        await loadRoomsForKhoa(mainKhoa);
      } else {
        setRooms([]);
      }

      form.setFieldsValue({
        ...detail,
        maCoSo: effectiveCoSo,
        maNhanVien: detail.maNhanVien || detail.username,
        maKhoa: mainKhoa,
        maPhongKham: detail.maPhongKham || undefined,
        password: undefined,
        ngaySinh: detail.ngaySinh?.slice(0, 10),
        ngayVaoLam: detail.ngayVaoLam?.slice(0, 10),
        trangThaiLamViec: detail.trangThaiLamViec || (detail.isActive ? 'DANG_LAM' : 'NGHI_VIEC'),
      });
      setDrawerOpen(true);
    } catch {
      setEditing(employee);
      if (employee.maKhoa) {
        loadRoomsForKhoa(employee.maKhoa);
      }
      form.setFieldsValue({
        ...employee,
        maNhanVien: employee.maNhanVien || employee.username,
        password: undefined,
        ngaySinh: employee.ngaySinh?.slice(0, 10),
        ngayVaoLam: employee.ngayVaoLam?.slice(0, 10),
        trangThaiLamViec: employee.isActive ? 'DANG_LAM' : 'NGHI_VIEC',
      });
      setDrawerOpen(true);
    }
  };

  // Handle CoSo change in Drawer
  const handleDrawerCoSoChange = (val) => {
    setDrawerCoSo(val);
    form.setFieldValue('maKhoa', undefined);
    form.setFieldValue('maPhongKham', undefined);
    setRooms([]);
  };

  // Handle Khoa selection change in Drawer
  const handleDrawerKhoaChange = (val) => {
    form.setFieldValue('maPhongKham', undefined);
    loadRoomsForKhoa(val);

    const selectedKhoa = khoas.find((k) => k.id === val);
    if (selectedKhoa) {
      if (selectedKhoa.maCoSo && !drawerCoSo) {
        setDrawerCoSo(selectedKhoa.maCoSo);
        form.setFieldValue('maCoSo', selectedKhoa.maCoSo);
      }
      if (!form.getFieldValue('chuyenKhoa')) {
        form.setFieldValue('chuyenKhoa', selectedKhoa.ten);
      }
    }
  };

  // Submit Drawer Form
  const submit = async (values) => {
    setSaving(true);
    try {
      if (editing) {
        const payload = toEmployeePayload(values, false);
        await employeeApi.update(editing.id, payload);
        message.success('Cập nhật nhân viên thành công.');
      } else {
        await employeeApi.create(toEmployeePayload(values));
        message.success('Tạo nhân viên mới thành công.');
      }
      setDrawerOpen(false);
      await loadEmployees();
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Thao tác nhân viên thất bại.'));
    } finally {
      setSaving(false);
    }
  };

  // Toggle Account Status
  const setStatus = async (employee, isActive) => {
    try {
      await employeeApi.setStatus(employee.id, isActive);
      message.success(
        isActive
          ? `Đã mở khóa tài khoản của ${employee.hoTen}.`
          : `Đã tạm khóa tài khoản của ${employee.hoTen}.`
      );
      await loadEmployees();
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Không thể cập nhật trạng thái.'));
    }
  };

  // Soft Delete Employee
  const openDelete = (employee) => {
    setDeleteModal({ open: true, employee });
    deleteForm.setFieldsValue({
      ngayNghiViec: new Date().toISOString().slice(0, 10),
      lyDo: '',
    });
  };

  const deleteEmployee = async () => {
    const values = await deleteForm.validateFields();
    try {
      await employeeApi.delete(deleteModal.employee.id, values);
      message.success(`Đã xoá mềm nhân viên ${deleteModal.employee.hoTen}.`);
      setDeleteModal({ open: false, employee: null });
      await loadEmployees();
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Không thể xoá nhân viên.'));
    }
  };

  // Roles & Permissions Modal
  const openRoles = async (employee) => {
    setRoleModal({ open: true, employee });
    setRoleLoading(true);
    try {
      const [roleResponse, employeeResponse, permissionResponse] = await Promise.all([
        employeeApi.getRoles(),
        employeeApi.getById(employee.id),
        employeeApi.getPermissions(employee.id),
      ]);
      const detail = employeeResponse.data.data;
      setRoles(roleResponse.data.data || []);
      setSelectedRoleIds((detail.vaiTros || []).map((role) => role.maVaiTro));
      setPermissions(permissionResponse.data.data || []);
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Không thể tải thông tin phân quyền.'));
    } finally {
      setRoleLoading(false);
    }
  };

  const saveRoles = async () => {
    if (!roleModal.employee) return;
    setRoleLoading(true);
    try {
      await employeeApi.updateRoles(roleModal.employee.id, selectedRoleIds);
      const permissionResponse = await employeeApi.getPermissions(roleModal.employee.id);
      setPermissions(permissionResponse.data.data || []);
      message.success('Cập nhật vai trò phân quyền thành công.');
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Không thể cập nhật phân quyền.'));
    } finally {
      setRoleLoading(false);
    }
  };

  // Safe Khoa Options for Drawer with optional Drawer CoSo filter and fallback mapping
  const safeKhoaOptions = useMemo(() => {
    let list = khoas;
    if (drawerCoSo) {
      list = list.filter((k) => !k.maCoSo || k.maCoSo === drawerCoSo);
    }

    const mapped = list.map((k) => ({
      value: k.id,
      label: k.ma ? `${k.ten} (${k.ma})` : k.ten,
    }));

    if (editing?.maKhoa && !mapped.some((item) => item.value === editing.maKhoa)) {
      mapped.unshift({
        value: editing.maKhoa,
        label: editing.tenKhoa || `Khoa #${editing.maKhoa}`,
      });
    }

    return mapped;
  }, [khoas, drawerCoSo, editing]);

  // Safe Position Options
  const positionOptions = useMemo(() => {
    return positions.map((p) => ({
      value: p.id,
      label: p.tenChucVu,
    }));
  }, [positions]);

  // CoSo Options
  const coSoOptions = useMemo(() => {
    return coSos.map((c) => ({
      value: c.id,
      label: c.ma ? `${c.ten} (${c.ma})` : c.ten,
    }));
  }, [coSos]);

  // KPI Calculations
  const activeCount = employees.filter((e) => e.isActive).length;
  const inactiveCount = employees.filter((e) => !e.isActive).length;
  const specialistCount = employees.filter((e) => e.chuyenKhoa || e.soHanhNghe).length;

  const ALL_COLUMNS = [
    { key: 'stt', label: 'STT', align: 'center', isFixed: true },
    { key: 'employee', label: 'NHÂN VIÊN', align: 'left' },
    { key: 'position', label: 'CHỨC VỤ & ĐƠN VỊ', align: 'left' },
    { key: 'contact', label: 'THÔNG TIN LIÊN HỆ', align: 'left' },
    { key: 'status', label: 'TRẠNG THÁI', align: 'center' },
    { key: 'actions', label: 'THAO TÁC', align: 'center', isFixed: true },
  ];

  const DEFAULT_COL_ORDER = [
    'stt',
    'employee',
    'position',
    'contact',
    'status',
    'actions',
  ];

  const [isFullscreen, setIsFullscreen] = useState(false);

  const { colWidths, startColResize } = useExcelGridResizer({
    stt: 55,
    employee: 250,
    position: 280,
    contact: 220,
    status: 140,
    actions: 130,
  });

  const [colOrder, setColOrder] = useState(DEFAULT_COL_ORDER);
  const [draggedCol, setDraggedCol] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const handleColDragStart = (e, colKey) => {
    if (colKey === 'stt' || colKey === 'actions') return;
    setDraggedCol(colKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColDragOver = (e, colKey) => {
    e.preventDefault();
    if (colKey === 'stt' || colKey === 'actions' || !draggedCol || draggedCol === colKey) return;
    setDragOverCol(colKey);
  };

  const handleColDrop = (e, targetCol) => {
    e.preventDefault();
    if (!draggedCol || draggedCol === targetCol || targetCol === 'stt' || targetCol === 'actions') {
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

  // Row reordering
  const [orderedEmployees, setOrderedEmployees] = useState([]);
  const [draggedRowId, setDraggedRowId] = useState(null);

  useEffect(() => {
    setOrderedEmployees(employees);
  }, [employees]);

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
    const current = [...orderedEmployees];
    const fromIdx = current.findIndex((i) => i.id === draggedRowId);
    const toIdx = current.findIndex((i) => i.id === targetId);
    if (fromIdx !== -1 && toIdx !== -1) {
      const [moved] = current.splice(fromIdx, 1);
      current.splice(toIdx, 0, moved);
      setOrderedEmployees(current);
    }
    setDraggedRowId(null);
  };

  const renderCellContent = (colKey, row, index) => {
    switch (colKey) {
      case 'stt': {
        const stt = (pagination.current - 1) * pagination.pageSize + index + 1;
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <span title="Kéo thả đổi vị trí dòng" style={{ cursor: 'grab', color: '#94a3b8' }}>
              <HolderOutlined style={{ fontSize: 11 }} />
            </span>
            <span
              style={{
                fontVariantNumeric: 'tabular-nums',
                fontWeight: 600,
                color: TEXT_MUTED,
                fontSize: 13,
              }}
            >
              {stt}
            </span>
          </div>
        );
      }

      case 'employee': {
        const initials = row.hoTen
          ? row.hoTen
              .trim()
              .split(' ')
              .map((n) => n[0])
              .slice(-2)
              .join('')
              .toUpperCase()
          : 'NV';
        const displayCode = row.maNhanVien || row.username;

        return (
          <div className="employee-identity-cell">
            <div className="employee-avatar-circle">{initials}</div>
            <div className="employee-name-info">
              <span className="employee-fullname" title={row.hoTen}>{row.hoTen}</span>
              <span className="employee-code-tag">
                Mã: {displayCode}
              </span>
            </div>
          </div>
        );
      }

      case 'position':
        return (
          <div className="dept-room-badge-group">
            <div className="dept-badge-row">
              <Tag
                color="geekblue"
                style={{
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 12,
                  padding: '1px 6px',
                  margin: 0,
                }}
              >
                {row.tenChucVu || 'Chưa phân công'}
              </Tag>
              {row.tenKhoa && (
                <Tag
                  color="cyan"
                  style={{
                    borderRadius: 6,
                    fontWeight: 500,
                    fontSize: 12,
                    padding: '1px 6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    margin: 0,
                  }}
                >
                  <Building2 size={12} />
                  {row.tenKhoa}
                </Tag>
              )}
              {row.tenPhongKham && (
                <Tag
                  color="green"
                  style={{
                    borderRadius: 6,
                    fontWeight: 500,
                    fontSize: 11.5,
                    padding: '1px 5px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    margin: 0,
                  }}
                >
                  <DoorOpen size={11} />
                  {row.tenPhongKham}
                </Tag>
              )}
            </div>
            {row.chuyenKhoa && (
              <div
                style={{
                  fontSize: 12,
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  marginTop: 2,
                }}
              >
                <Stethoscope size={13} color={PRIMARY} />
                <span>Chuyên khoa: <strong>{row.chuyenKhoa}</strong></span>
              </div>
            )}
            {row.soHanhNghe && (
              <div style={{ fontSize: 11, color: TEXT_MUTED, display: 'flex', alignItems: 'center', gap: 4 }}>
                <BadgeCheck size={12} color="#059669" />
                <span>CCHN: <code>{row.soHanhNghe}</code></span>
              </div>
            )}
          </div>
        );

      case 'contact':
        return (
          <div className="employee-contact-cell">
            <span className="employee-contact-item">
              <Mail size={13} color={TEXT_MUTED} />
              <span title={row.email}>{row.email || '—'}</span>
            </span>
            <span className="employee-contact-item">
              <Phone size={13} color={TEXT_MUTED} />
              <span>{row.dienThoai || '—'}</span>
            </span>
          </div>
        );

      case 'status':
        return (
          <Tag
            color={row.isActive ? 'success' : 'error'}
            style={{
              borderRadius: 12,
              padding: '2px 8px',
              fontWeight: 500,
              fontSize: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              margin: 0,
            }}
          >
            <span style={{ fontSize: 8 }}>{row.isActive ? '●' : '○'}</span>
            {row.isActive ? 'Đang hoạt động' : 'Đã khóa'}
          </Tag>
        );

      case 'actions':
        return (
          <div className="employee-quick-actions">
            <Tooltip title="Chỉnh sửa thông tin">
              <Button
                size="small"
                type="text"
                className="employee-action-btn"
                icon={<UserRoundPen size={15} />}
                onClick={() => openEdit(row)}
              />
            </Tooltip>

            <Tooltip title="Phân quyền vai trò">
              <Button
                size="small"
                type="text"
                className="employee-action-btn roles"
                icon={<ShieldCheck size={15} />}
                onClick={() => openRoles(row)}
              />
            </Tooltip>

            <Dropdown
              trigger={['click']}
              placement="bottomRight"
              menu={{
                items: [
                  {
                    key: 'toggle-status',
                    icon: row.isActive ? <UserX size={14} color="#e11d48" /> : <UserCheck size={14} color="#16a34a" />,
                    label: (
                      <Popconfirm
                        title={row.isActive ? 'Khóa tài khoản này?' : 'Mở khóa tài khoản?'}
                        description={`Xác nhận thay đổi trạng thái tài khoản của ${row.hoTen}?`}
                        onConfirm={() => setStatus(row, !row.isActive)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                        placement="left"
                      >
                        <span onClick={(e) => e.stopPropagation()} style={{ display: 'block' }}>
                          {row.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        </span>
                      </Popconfirm>
                    ),
                  },
                  { type: 'divider' },
                  {
                    key: 'delete',
                    danger: true,
                    icon: <Trash2 size={14} />,
                    label: 'Xoá mềm nhân viên',
                    onClick: () => openDelete(row),
                  },
                ],
              }}
            >
              <Button
                size="small"
                type="text"
                className="employee-action-btn"
                icon={<MoreHorizontal size={15} />}
              />
            </Dropdown>
          </div>
        );

      default:
        return null;
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.pageSize) || 1;
  const startItemIdx = pagination.total === 0 ? 0 : (pagination.current - 1) * pagination.pageSize + 1;
  const endItemIdx = Math.min(pagination.current * pagination.pageSize, pagination.total);

  const employeeContent = (
    <div
      className="employee-tab-content"
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
        padding: isFullscreen ? '16px' : undefined,
      }}
    >
      {/* Top Action Row */}
      <div className="employee-action-row" style={{ flexShrink: 0, marginBottom: 10 }}>
        <Space wrap>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={openCreate}
            style={{
              background: PRIMARY,
              borderColor: PRIMARY,
              fontWeight: 500,
              borderRadius: 8,
              height: 34,
            }}
          >
            Thêm nhân viên mới
          </Button>
        </Space>
        <Space wrap>
          <Button
            icon={<RefreshCw size={14} />}
            onClick={() => loadEmployees()}
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

      {/* Advanced Filter Bar */}
      <div className="employee-filter-bar" style={{ flexShrink: 0, marginBottom: 10 }}>
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
          <Input
            placeholder="Tìm theo họ tên, mã NV, username, email..."
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            onPressEnter={handleSearch}
            prefix={<AntSearchOutlined style={{ color: TEXT_MUTED }} />}
            allowClear
            style={{ width: 260, minWidth: 180, borderRadius: 6 }}
          />
        </div>

        {/* Lọc theo Cơ sở */}
        <Select
          value={coSoFilter}
          onChange={handleCoSoFilterChange}
          placeholder="Tất cả cơ sở"
          allowClear
          showSearch
          optionFilterProp="label"
          style={{ width: 180 }}
          loading={coSosLoading}
          options={coSoOptions}
        />

        {/* Lọc theo Khoa */}
        <Select
          value={deptFilter}
          onChange={handleDeptFilterChange}
          placeholder="Tất cả khoa / phòng"
          allowClear
          showSearch
          optionFilterProp="label"
          style={{ width: 210 }}
          loading={khoasLoading}
          options={safeKhoaOptions}
        />

        {/* Lọc theo Chức vụ */}
        <Select
          value={positionFilter}
          onChange={handlePositionFilterChange}
          placeholder="Tất cả chức vụ"
          allowClear
          showSearch
          optionFilterProp="label"
          style={{ width: 170 }}
          loading={positionsLoading}
          options={positionOptions}
        />

        {/* Lọc theo Trạng thái */}
        <Select
          value={statusFilter}
          onChange={handleStatusChange}
          style={{ width: 160 }}
          options={[
            { value: 'ALL', label: 'Tất cả trạng thái' },
            { value: 'ACTIVE', label: '🟢 Đang hoạt động' },
            { value: 'INACTIVE', label: '🔴 Đã khóa' },
          ]}
        />

        <Button
          type="primary"
          icon={<Filter size={14} />}
          onClick={handleSearch}
          style={{ background: PRIMARY, borderColor: PRIMARY, borderRadius: 6, height: 32 }}
        >
          Lọc
        </Button>
        <Button
          icon={<RotateCcw size={14} />}
          onClick={handleResetFilters}
          style={{ borderRadius: 6, height: 32 }}
        >
          Đặt lại
        </Button>
      </div>

      {/* ── EXCEL DATA GRID CONTAINER (RESIZE, REORDER) ───────────────────────── */}
      <div
        className="w-full flex-1 min-h-0 bg-white border border-slate-300 rounded-lg shadow-sm overflow-x-auto overflow-y-auto excel-grid-container"
        style={{ margin: 0 }}
      >
        <table className="excel-table w-full min-w-full">
          <colgroup>
            {colOrder.map((colKey) => (
              <col
                key={colKey}
                style={{
                  width: colWidths[colKey] || 100,
                  minWidth: colKey === 'actions' ? colWidths.actions : undefined,
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
                      borderLeft: isDragOver ? '2px solid #2563eb' : undefined,
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

          {/* Dữ liệu các dòng */}
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={colOrder.length} style={{ padding: 40, textAlign: 'center', background: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#64748b' }}>
                    <span style={{ fontSize: 18 }}>⏳</span>
                    <span>Đang nạp danh sách nhân sự...</span>
                  </div>
                </td>
              </tr>
            ) : orderedEmployees.length === 0 ? (
              <tr>
                <td colSpan={colOrder.length} style={{ padding: 40, textAlign: 'center', background: '#fff' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#64748b' }}>
                    <UsersRound size={28} color="#94a3b8" />
                    <span>Không có nhân viên nào phù hợp với điều kiện tìm kiếm.</span>
                  </div>
                </td>
              </tr>
            ) : (
              orderedEmployees.map((row, index) => {
                const isRowDragging = draggedRowId === row.id;
                return (
                  <tr
                    key={row.id}
                    className="h-9 hover:bg-slate-50 transition-colors"
                    style={{
                      opacity: isRowDragging ? 0.35 : 1,
                      backgroundColor: isRowDragging ? '#f1f5f9' : undefined,
                    }}
                    draggable
                    onDragStart={(e) => handleRowDragStart(e, row.id)}
                    onDragOver={handleRowDragOver}
                    onDrop={(e) => handleRowDrop(e, row.id)}
                  >
                    {colOrder.map((colKey) => {
                      const colDef = ALL_COLUMNS.find((c) => c.key === colKey);
                      if (!colDef) return null;
                      return (
                        <td
                          key={colKey}
                          className={`${colKey === 'stt' ? 'col-stt' : ''} text-${colDef.align}`}
                          style={{
                            width: colWidths[colKey] || 100,
                            padding: '4px 8px',
                            verticalAlign: 'middle',
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

      {/* ── FOOTER PAGINATION BAR ────────────────────────────────────────────── */}
      <div
        style={{
          height: 40,
          minHeight: 40,
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          padding: '0 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          marginTop: 8,
          borderRadius: 6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            Hiển thị <strong>{startItemIdx}</strong> - <strong>{endItemIdx}</strong> trên tổng{' '}
            <strong>{pagination.total}</strong> nhân sự
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>Cỡ trang:</span>
            <select
              value={pagination.pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                loadEmployees(1, newSize, statusFilter, keyword, deptFilter, positionFilter);
              }}
              style={{
                height: 26,
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: 12,
                color: '#334155',
                padding: '0 6px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value={10}>10 dòng</option>
              <option value={20}>20 dòng</option>
              <option value={50}>50 dòng</option>
              <option value={100}>100 dòng</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              disabled={pagination.current <= 1}
              onClick={() =>
                loadEmployees(
                  Math.max(1, pagination.current - 1),
                  pagination.pageSize,
                  statusFilter,
                  keyword,
                  deptFilter,
                  positionFilter
                )
              }
              style={{
                height: 26,
                padding: '0 8px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: 12,
                color: '#334155',
                cursor: pagination.current <= 1 ? 'not-allowed' : 'pointer',
                opacity: pagination.current <= 1 ? 0.4 : 1,
              }}
              title="Trang trước"
            >
              ‹ Trước
            </button>

            <span style={{ fontSize: 12, color: '#475569' }}>
              Trang <strong>{pagination.current}</strong> / <strong>{totalPages}</strong>
            </span>

            <button
              type="button"
              disabled={pagination.current >= totalPages}
              onClick={() =>
                loadEmployees(
                  Math.min(totalPages, pagination.current + 1),
                  pagination.pageSize,
                  statusFilter,
                  keyword,
                  deptFilter,
                  positionFilter
                )
              }
              style={{
                height: 26,
                padding: '0 8px',
                borderRadius: 4,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: 12,
                color: '#334155',
                cursor: pagination.current >= totalPages ? 'not-allowed' : 'pointer',
                opacity: pagination.current >= totalPages ? 0.4 : 1,
              }}
              title="Trang sau"
            >
              Sau ›
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Drawer Thêm / Sửa Nhân viên (Chuẩn HRM HIS 2 cột) */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={780}
        destroyOnClose
        className="employee-drawer"
        title={
          <div className="drawer-header-title">
            <div className="drawer-header-icon">
              {editing ? <UserRoundPen size={22} /> : <Plus size={22} />}
            </div>
            <div className="drawer-header-text">
              <h3>{editing ? 'Cập nhật hồ sơ nhân viên' : 'Tiếp nhận & Tạo mới nhân sự'}</h3>
              <p>
                {editing
                  ? `Mã: ${editing.maNhanVien || editing.username} • ${editing.hoTen}`
                  : 'Khai báo tài khoản hệ thống, định danh chuyên môn và đơn vị công tác'}
              </p>
            </div>
          </div>
        }
        footer={
          <div className="drawer-footer-bar">
            <span className="drawer-footer-note">
              <Shield size={14} color="#059669" />
              Dữ liệu nhân sự được đồng bộ với ca trực và phân quyền bệnh viện.
            </span>
            <Space>
              <Button onClick={() => setDrawerOpen(false)} style={{ borderRadius: 8 }}>
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                loading={saving}
                onClick={() => form.submit()}
                icon={<UserCheck size={16} />}
                style={{
                  background: PRIMARY,
                  borderColor: PRIMARY,
                  borderRadius: 8,
                  fontWeight: 500,
                }}
              >
                {editing ? 'Lưu cập nhật' : 'Tạo nhân viên'}
              </Button>
            </Space>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={submit}
          initialValues={emptyForm}
          scrollToFirstError
        >
          {/* Nhóm 1: Tài khoản & Thông tin cá nhân */}
          <div className="drawer-section-card">
            <div className="drawer-section-header">
              <span className="section-badge">Phần 1</span>
              <UsersRound size={16} color={PRIMARY} />
              <span>Tài khoản & Thông tin cá nhân</span>
            </div>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="maNhanVien"
                  label="Mã nhân viên (Staff Code)"
                  tooltip="Mã định danh nội bộ trong bệnh viện, có thể tự động sinh hoặc nhập mã thẻ nhân viên"
                >
                  <Input
                    placeholder="Ví dụ: NV001, BS012..."
                    style={{ borderRadius: 8, fontWeight: 500 }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="hoTen"
                  label="Họ và tên nhân viên"
                  rules={[
                    { required: true, message: 'Vui lòng nhập họ và tên' },
                    { min: 2, message: 'Họ tên tối thiểu 2 ký tự' },
                  ]}
                >
                  <Input placeholder="Ví dụ: Nguyễn Văn An" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  name="username"
                  label="Tên đăng nhập hệ thống"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên đăng nhập' },
                    { min: 3, message: 'Tên đăng nhập tối thiểu 3 ký tự' },
                    {
                      pattern: /^[a-zA-Z0-9._-]+$/,
                      message: 'Chỉ chứa chữ cái, số, dấu chấm, gạch dưới hoặc gạch ngang',
                    },
                  ]}
                >
                  <Input
                    disabled={!!editing}
                    placeholder="Ví dụ: bs_an, levanb"
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>

              {!editing && (
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="password"
                    label="Mật khẩu khởi tạo"
                    rules={[
                      { required: true, message: 'Vui lòng đặt mật khẩu ban đầu' },
                      { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
                    ]}
                  >
                    <Input.Password
                      placeholder="Mật khẩu ban đầu..."
                      style={{ borderRadius: 8 }}
                      prefix={<Lock size={14} color={TEXT_MUTED} />}
                    />
                  </Form.Item>
                </Col>
              )}

              <Col xs={12} sm={6}>
                <Form.Item name="gioiTinh" label="Giới tính">
                  <Select
                    options={[
                      { value: 'M', label: 'Nam' },
                      { value: 'F', label: 'Nữ' },
                      { value: 'O', label: 'Khác' },
                    ]}
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Item name="ngaySinh" label="Ngày sinh">
                  <Input type="date" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  name="email"
                  label="Địa chỉ Email"
                  rules={[{ type: 'email', message: 'Địa chỉ Email không đúng định dạng' }]}
                >
                  <Input
                    placeholder="bacsi@benhvien.com"
                    prefix={<Mail size={14} color={TEXT_MUTED} />}
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  name="dienThoai"
                  label="Số điện thoại"
                  rules={[
                    {
                      pattern: /^[0-9+() -]{9,15}$/,
                      message: 'Số điện thoại không hợp lệ (9-15 chữ số)',
                    },
                  ]}
                >
                  <Input
                    placeholder="0901234567"
                    prefix={<Phone size={14} color={TEXT_MUTED} />}
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Nhóm 2: Chuyên môn & Đơn vị công tác */}
          <div className="drawer-section-card">
            <div className="drawer-section-header">
              <span className="section-badge">Phần 2</span>
              <Stethoscope size={16} color={PRIMARY} />
              <span>Chuyên môn & Đơn vị công tác (HIS)</span>
            </div>
            <Row gutter={16}>
              {/* Chọn Cơ sở */}
              <Col xs={24} sm={12}>
                <Form.Item
                  name="maCoSo"
                  label="Cơ sở công tác"
                  tooltip="Chọn cơ sở làm việc để lọc khoa phòng phù hợp (không bắt buộc)"
                >
                  <Select
                    showSearch
                    allowClear
                    placeholder="Tất cả cơ sở / Chọn cơ sở"
                    loading={coSosLoading}
                    optionFilterProp="label"
                    options={coSoOptions}
                    onChange={handleDrawerCoSoChange}
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  name="maChucVu"
                  label="Chức vụ"
                  tooltip="Vị trí đảm nhiệm: Bác sĩ điều trị, Điều dưỡng trưởng, Dược sĩ..."
                >
                  <Select
                    showSearch
                    allowClear
                    placeholder="Chọn chức vụ"
                    loading={positionsLoading}
                    optionFilterProp="label"
                    options={positionOptions}
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>

              {/* Tách riêng Khoa và Phòng */}
              <Col xs={24} sm={12}>
                <Form.Item
                  name="maKhoa"
                  label="Khoa công tác"
                  rules={[{ required: true, message: 'Vui lòng chọn Khoa công tác' }]}
                  tooltip="Danh mục khoa/trung tâm chuyên môn phụ trách"
                >
                  <Select
                    showSearch
                    allowClear
                    placeholder="Chọn khoa công tác"
                    loading={khoasLoading}
                    optionFilterProp="label"
                    options={safeKhoaOptions}
                    onChange={handleDrawerKhoaChange}
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  name="maPhongKham"
                  label="Phòng chức năng / Khám"
                  tooltip="Phòng khám hoặc phòng chức năng trực thuộc khoa đã chọn (phục vụ phân ca làm việc)"
                >
                  <Select
                    showSearch
                    allowClear
                    placeholder={
                      form.getFieldValue('maKhoa')
                        ? 'Chọn phòng chức năng / phòng khám'
                        : 'Vui lòng chọn Khoa trước'
                    }
                    disabled={!form.getFieldValue('maKhoa')}
                    loading={roomsLoading}
                    optionFilterProp="label"
                    options={rooms.map((r) => ({
                      value: r.id,
                      label: `${r.ten} (${r.ma || r.id})`,
                    }))}
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  name="chuyenKhoa"
                  label="Chuyên khoa"
                  tooltip="Lĩnh vực y khoa chính, ví dụ: Khoa Nội, Ngoại tổng quát, Nhi, Mắt..."
                >
                  <Input
                    placeholder="Ví dụ: Khoa Nội, Tai Mũi Họng..."
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  name="soHanhNghe"
                  label="Số chứng chỉ hành nghề y tế (CCHN)"
                  tooltip="Bắt buộc đối với Bác sĩ, Dược sĩ ký hồ sơ bệnh án và đơn thuốc BHYT"
                >
                  <Input
                    placeholder="Ví dụ: 012345/BYT-CCHN hoặc 00892/HCM-CCHN"
                    prefix={<BadgeCheck size={15} color="#059669" />}
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Nhóm 3: Hợp đồng & Lương / Trạng thái */}
          <div className="drawer-section-card">
            <div className="drawer-section-header">
              <span className="section-badge">Phần 3</span>
              <Briefcase size={16} color={PRIMARY} />
              <span>Hợp đồng & Trạng thái làm việc</span>
            </div>
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="ngayVaoLam"
                  label="Ngày vào làm việc"
                  tooltip="Ngày ký hợp đồng hoặc bắt đầu công tác tại cơ sở"
                >
                  <Input type="date" style={{ borderRadius: 8 }} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={8}>
                <Form.Item
                  name="trangThaiLamViec"
                  label="Trạng thái làm việc"
                >
                  <Select
                    options={[
                      { value: 'DANG_LAM', label: '🟢 Đang làm việc' },
                      { value: 'TAM_HOAN', label: '🟡 Tạm hoãn hợp đồng' },
                      { value: 'NGHI_VIEC', label: '🔴 Đã nghỉ việc' },
                    ]}
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={8}>
                <Form.Item
                  name="luongCoBan"
                  label="Mức lương cơ bản (VNĐ)"
                  tooltip="Mức lương căn bản phục vụ tính công và trích nộp bảo hiểm y tế"
                >
                  <InputNumber
                    min={0}
                    step={500000}
                    formatter={(val) =>
                      val ? `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''
                    }
                    parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
                    placeholder="Ví dụ: 15,000,000"
                    style={{ width: '100%', borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Form>
      </Drawer>

      {/* Modal Xoá mềm nhân viên */}
      <Modal
        title={`Xoá mềm nhân viên: ${deleteModal.employee?.hoTen || ''}`}
        open={deleteModal.open}
        onCancel={() => setDeleteModal({ open: false, employee: null })}
        onOk={deleteEmployee}
        okText="Xác nhận xoá mềm"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        destroyOnClose
      >
        <div
          style={{
            marginBottom: 12,
            color: '#92400e',
            background: '#fffbeb',
            border: '1px solid #fde68a',
            padding: 12,
            borderRadius: 8,
          }}
        >
          Hồ sơ, chấm công, bảng lương và lịch sử giải trình sẽ được giữ lại. Lịch tương lai chưa chấm công sẽ bị huỷ, quyền truy cập và mẫu lịch sẽ bị thu hồi.
        </div>
        <Form form={deleteForm} layout="vertical">
          <Form.Item
            name="ngayNghiViec"
            label="Ngày nghỉ việc"
            rules={[{ required: true, message: 'Vui lòng chọn ngày nghỉ việc.' }]}
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item
            name="lyDo"
            label="Lý do nghỉ việc"
            rules={[
              { required: true, whitespace: true, message: 'Vui lòng nhập lý do nghỉ việc.' },
              { max: 500, message: 'Lý do không vượt quá 500 ký tự.' },
            ]}
          >
            <Input.TextArea rows={4} placeholder="Nhập lý do để lưu vào hồ sơ và nhật ký kiểm toán..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Phân quyền vai trò */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
            <ShieldCheck size={20} color={PRIMARY} />
            <span>Phân quyền vai trò: {roleModal.employee?.hoTen || ''}</span>
          </div>
        }
        open={roleModal.open}
        confirmLoading={roleLoading}
        onCancel={() => setRoleModal({ open: false, employee: null })}
        onOk={saveRoles}
        okText="Lưu vai trò"
        cancelText="Đóng"
        width={600}
        destroyOnClose
        okButtonProps={{ style: { background: PRIMARY, borderColor: PRIMARY } }}
      >
        <div className="role-modal-container" style={{ marginTop: 12 }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: TEXT_DARK,
                marginBottom: 6,
              }}
            >
              Chọn các vai trò áp dụng cho nhân sự:
            </label>
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="Chọn vai trò (Bác sĩ, Điều dưỡng, Thu ngân, Admin...)"
              value={selectedRoleIds}
              loading={roleLoading}
              onChange={setSelectedRoleIds}
              options={roles.map((role) => ({
                value: role.id,
                label: role.tenVaiTro,
              }))}
            />
          </div>

          <div className="role-permission-box">
            <div className="role-permission-box-title">
              <Briefcase size={14} color={PRIMARY} />
              <span>Quyền hiệu lực hiện thời theo các vai trò đã gán:</span>
            </div>
            <div className="role-permission-tags">
              {permissions.length > 0 ? (
                permissions.map((permission) => (
                  <Tag
                    key={permission.id}
                    color="blue"
                    style={{
                      borderRadius: 6,
                      fontSize: 12,
                      padding: '2px 8px',
                    }}
                  >
                    {permission.tenQuyen}
                  </Tag>
                ))
              ) : (
                <span style={{ color: '#94a3b8', fontSize: 12 }}>
                  Chưa có quyền hiệu lực nào được gán cho nhân viên này.
                </span>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );

  return (
    <div
      className={`employee-management ${activeTab === 'payroll' ? 'employee-management--payroll' : ''}`}
      style={activeTab === 'payroll' ? { padding: '8px 12px', height: '100%', overflow: 'hidden' } : undefined}
    >
      {/* Top Header & KPI Overview Cards - Chỉ hiển thị khi ở tab Quản lý nhân sự */}
      {activeTab !== 'payroll' && (
        <>
          <div className="employee-header">
            <div className="employee-header-left">
              <h1>
                <UsersRound size={22} color={PRIMARY} />
                Quản lý Nhân sự & Phân quyền
              </h1>
              <p>
                Quản lý hồ sơ nhân viên, mã định danh, đơn vị khoa phòng, vai trò hệ thống và chứng chỉ hành nghề y tế
              </p>
            </div>
          </div>

          {/* KPI Overview Cards */}
          <div className="employee-kpi-grid">
            <div className="employee-kpi-card">
              <div className="employee-kpi-icon" style={{ background: '#eff6ff', color: PRIMARY }}>
                <UsersRound size={22} />
              </div>
              <div className="employee-kpi-info">
                <div className="employee-kpi-label">Tổng nhân sự</div>
                <div className="employee-kpi-value">{pagination.total || employees.length}</div>
              </div>
            </div>

            <div className="employee-kpi-card">
              <div className="employee-kpi-icon" style={{ background: '#ecfdf5', color: '#047857' }}>
                <UserCheck size={22} />
              </div>
              <div className="employee-kpi-info">
                <div className="employee-kpi-label">Đang hoạt động</div>
                <div className="employee-kpi-value" style={{ color: '#047857' }}>
                  {activeCount}
                </div>
              </div>
            </div>

            <div className="employee-kpi-card">
              <div className="employee-kpi-icon" style={{ background: '#fff1f2', color: '#be123c' }}>
                <UserX size={22} />
              </div>
              <div className="employee-kpi-info">
                <div className="employee-kpi-label">Đã tạm khóa</div>
                <div className="employee-kpi-value" style={{ color: '#be123c' }}>
                  {inactiveCount}
                </div>
              </div>
            </div>

            <div className="employee-kpi-card">
              <div className="employee-kpi-icon" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                <Stethoscope size={22} />
              </div>
              <div className="employee-kpi-info">
                <div className="employee-kpi-label">Bác sĩ & Chuyên môn</div>
                <div className="employee-kpi-value" style={{ color: '#1d4ed8' }}>
                  {specialistCount}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div
        className="employee-tab-content"
        style={activeTab === 'payroll' ? { height: '100%', flex: 1, padding: 0, overflow: 'auto', display: 'flex', flexDirection: 'column' } : undefined}
      >
        {activeTab === 'payroll' ? <PayrollManagement /> : null}
        {activeTab === 'employees' ? employeeContent : null}
      </div>
    </div>
  );
};