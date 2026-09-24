import { useEffect, useState } from 'react';
import {
  App,
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Col,
  Select,
  Space,
  Switch,
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
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { employeeApi } from '../api/employee.api';
import { PayrollManagement } from '../payroll/PayrollManagement';
import './EmployeeManagement.css';

const emptyForm = {
  username: '',
  password: '',
  hoTen: '',
  ngaySinh: '',
  gioiTinh: 'M',
  email: '',
  dienThoai: '',
  maChucVu: undefined,
  chuyenKhoa: '',
  soHanhNghe: '',
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
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [roleModal, setRoleModal] = useState({ open: false, employee: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, employee: null });
  const [deleteForm] = Form.useForm();
  const [roles, setRoles] = useState([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [roleLoading, setRoleLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const activeTab = ['payroll'].includes(searchParams.get('tab'))
    ? searchParams.get('tab')
    : 'employees';

  const loadEmployees = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    status = statusFilter,
    searchTerm = keyword
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
    let active = true;
    const fetchInitial = async () => {
      setLoading(true);
      try {
        const response = await employeeApi.getPaged({
          pageIndex: 1,
          pageSize: pagination.pageSize,
        });
        if (!active) return;
        const result = response.data.data;
        setEmployees(result.items || []);
        setPagination({
          current: result.pageIndex,
          pageSize: result.pageSize,
          total: result.totalCount,
        });
      } catch (error) {
        if (active)
          message.error(getApiErrorMessage(error, 'Không thể tải danh sách nhân viên.'));
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchInitial();
    return () => {
      active = false;
    };
  }, [message, pagination.pageSize]);

  const handleSearch = () => {
    loadEmployees(1, pagination.pageSize, statusFilter, keyword);
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    loadEmployees(1, pagination.pageSize, val, keyword);
  };

  const handleResetFilters = () => {
    setKeyword('');
    setStatusFilter('ALL');
    loadEmployees(1, pagination.pageSize, 'ALL', '');
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (employee) => {
    setEditing(employee);
    form.setFieldsValue({
      ...employee,
      password: undefined,
      ngaySinh: employee.ngaySinh?.slice(0, 10),
    });
    setModalOpen(true);
  };

  const submit = async (values) => {
    try {
      if (editing) {
        const payload = toEmployeePayload(values, false);
        await employeeApi.update(editing.id, payload);
        message.success('Cập nhật nhân viên thành công.');
      } else {
        await employeeApi.create(toEmployeePayload(values));
        message.success('Tạo nhân viên mới thành công.');
      }
      setModalOpen(false);
      await loadEmployees();
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Thao tác nhân viên thất bại.'));
    }
  };

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

  // KPI Calculations
  const activeCount = employees.filter((e) => e.isActive).length;
  const inactiveCount = employees.filter((e) => !e.isActive).length;
  const specialistCount = employees.filter((e) => e.chuyenKhoa || e.soHanhNghe).length;

  const columns = [
    {
      title: 'Nhân viên',
      key: 'employee',
      width: 260,
      render: (_, row) => {
        const initials = row.hoTen
          ? row.hoTen
              .trim()
              .split(' ')
              .map((n) => n[0])
              .slice(-2)
              .join('')
              .toUpperCase()
          : 'NV';
        return (
          <div className="employee-identity-cell">
            <div className="employee-avatar-circle">{initials}</div>
            <div className="employee-name-info">
              <span className="employee-fullname">{row.hoTen}</span>
              <span className="employee-username-tag">@{row.username}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Chức vụ & Chuyên môn',
      key: 'position',
      width: 220,
      render: (_, row) => (
        <div>
          <Tag
            color="geekblue"
            style={{
              borderRadius: 6,
              fontWeight: 500,
              fontSize: 12,
              padding: '2px 8px',
            }}
          >
            {row.tenChucVu || 'Chưa phân công'}
          </Tag>
          {row.chuyenKhoa && (
            <div
              style={{
                fontSize: 12,
                color: '#4a637a',
                marginTop: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Stethoscope size={12} color="#0b4f6c" />
              <span>{row.chuyenKhoa}</span>
            </div>
          )}
          {row.soHanhNghe && (
            <div style={{ fontSize: 11, color: '#8a9fb0', marginTop: 2 }}>
              Số CCHN: <code>{row.soHanhNghe}</code>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Thông tin liên hệ',
      key: 'contact',
      width: 220,
      render: (_, row) => (
        <div className="employee-contact-cell">
          <span className="employee-contact-item">
            <Mail size={13} color="#6a7f96" />
            <span>{row.email || '—'}</span>
          </span>
          <span className="employee-contact-item">
            <Phone size={13} color="#6a7f96" />
            <span>{row.dienThoai || '—'}</span>
          </span>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'status',
      width: 160,
      render: (value) => (
        <Tag
          color={value ? 'success' : 'error'}
          style={{
            borderRadius: 12,
            padding: '3px 10px',
            fontWeight: 500,
            fontSize: 12,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <span style={{ fontSize: 8 }}>{value ? '●' : '○'}</span>
          {value ? 'Đang hoạt động' : 'Đã khóa'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, row) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa thông tin">
            <Button
              size="small"
              icon={<UserRoundPen size={14} />}
              onClick={() => openEdit(row)}
            >
              Sửa
            </Button>
          </Tooltip>
          <Tooltip title="Phân quyền vai trò">
            <Button
              size="small"
              icon={<ShieldCheck size={14} />}
              onClick={() => openRoles(row)}
            >
              Quyền
            </Button>
          </Tooltip>
          <Tooltip title={row.isActive ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}>
            <Popconfirm
              title={row.isActive ? 'Khóa tài khoản này?' : 'Mở khóa tài khoản?'}
              description={`Xác nhận thay đổi trạng thái tài khoản của ${row.hoTen}?`}
              onConfirm={() => setStatus(row, !row.isActive)}
              okText="Xác nhận"
              cancelText="Hủy"
              placement="left"
            >
              <Switch size="small" checked={row.isActive} />
            </Popconfirm>
          </Tooltip>
          <Tooltip title="Xoá mềm nhân viên">
            <Button
              size="small"
              danger
              icon={<Trash2 size={14} />}
              onClick={() => openDelete(row)}
            >
              Xoá
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const employeeContent = (
    <div className="employee-tab-content">
      {/* Top Action Row */}
      <div className="employee-action-row">
        <Space wrap>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={openCreate}
            style={{
              background: '#0b4f6c',
              borderColor: '#0b4f6c',
              fontWeight: 500,
              borderRadius: 8,
              height: 36,
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
            style={{ borderRadius: 8, height: 36 }}
          >
            Làm mới
          </Button>
        </Space>
      </div>

      {/* Filter Bar */}
      <div className="employee-filter-bar">
        <Input
          placeholder="Tìm theo họ tên, username, email..."
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onPressEnter={handleSearch}
          prefix={<Search size={16} color="#6a7f96" />}
          allowClear
          style={{ width: 320, minWidth: 200 }}
        />
        <Select
          value={statusFilter}
          onChange={handleStatusChange}
          style={{ width: 180 }}
          options={[
            { value: 'ALL', label: 'Tất cả trạng thái' },
            { value: 'ACTIVE', label: '🟢 Đang hoạt động' },
            { value: 'INACTIVE', label: '🔴 Đã khóa' },
          ]}
        />
        <Button
          type="primary"
          onClick={handleSearch}
          style={{ background: '#0b4f6c', borderColor: '#0b4f6c', borderRadius: 8 }}
        >
          Tìm kiếm
        </Button>
        <Button
          icon={<RotateCcw size={14} />}
          onClick={handleResetFilters}
          style={{ borderRadius: 8 }}
        >
          Đặt lại
        </Button>
      </div>

      {/* Table */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={employees}
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} trên tổng ${total} nhân sự`,
          onChange: (page, size) => loadEmployees(page, size),
        }}
        scroll={{ x: 980 }}
        style={{
          border: '1px solid #e9edf4',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      />

      {/* Create / Edit Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
            <UsersRound size={20} color="#0b4f6c" />
            <span>{editing ? 'Cập nhật thông tin nhân viên' : 'Thêm nhân sự mới'}</span>
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText={editing ? 'Lưu cập nhật' : 'Tạo nhân viên'}
        cancelText="Hủy"
        width={720}
        destroyOnHidden
        okButtonProps={{ style: { background: '#0b4f6c', borderColor: '#0b4f6c' } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={submit}
          initialValues={emptyForm}
          style={{ marginTop: 16 }}
        >
          {/* Section 1: Account Credentials */}
          <div className="form-section-title">
            <Shield size={15} /> Thông tin tài khoản đăng nhập
          </div>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên đăng nhập' },
                  { min: 3, message: 'Tối thiểu 3 ký tự' },
                ]}
              >
                <Input
                  disabled={!!editing}
                  placeholder="Ví dụ: bs_an, levanb..."
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
                    { min: 8, message: 'Tối thiểu 8 ký tự' },
                  ]}
                >
                  <Input.Password
                    placeholder="Mật khẩu bảo mật..."
                    style={{ borderRadius: 8 }}
                  />
                </Form.Item>
              </Col>
            )}
          </Row>

          {/* Section 2: Personal Information */}
          <div className="form-section-title">
            <UsersRound size={15} /> Thông tin cá nhân & Liên hệ
          </div>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="hoTen"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              >
                <Input placeholder="Ví dụ: Nguyễn Văn An" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
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
                rules={[{ type: 'email', message: 'Email không đúng định dạng' }]}
              >
                <Input placeholder="bacsi@benhvien.com" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="dienThoai" label="Số điện thoại">
                <Input placeholder="0901234567" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>

          {/* Section 3: Specialty & Profession */}
          <div className="form-section-title">
            <Stethoscope size={15} /> Chuyên môn & Chức danh
          </div>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item name="maChucVu" label="Mã chức vụ">
                <Input
                  type="number"
                  placeholder="Ví dụ: 1, 2, 3..."
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="chuyenKhoa" label="Chuyên khoa">
                <Input
                  placeholder="Ví dụ: Khoa Nội, Tai Mũi Họng..."
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item name="soHanhNghe" label="Số chứng chỉ hành nghề">
                <Input placeholder="Ví dụ: 012345/BYT-CCHN" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title={`Xoá mềm nhân viên: ${deleteModal.employee?.hoTen || ''}`}
        open={deleteModal.open}
        onCancel={() => setDeleteModal({ open: false, employee: null })}
        onOk={deleteEmployee}
        okText="Xác nhận xoá mềm"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        destroyOnHidden
      >
        <div style={{ marginBottom: 12, color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', padding: 12, borderRadius: 8 }}>
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

      {/* Role / Permission Assignment Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
            <ShieldCheck size={20} color="#0b4f6c" />
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
        destroyOnHidden
        okButtonProps={{ style: { background: '#0b4f6c', borderColor: '#0b4f6c' } }}
      >
        <div className="role-modal-container" style={{ marginTop: 12 }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 600,
                color: '#0b2a3c',
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
              <Briefcase size={14} color="#0b4f6c" />
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
    <div className="employee-management">
      {/* Top Header */}
      <div className="employee-header">
        <div className="employee-header-left">
          <h1>
            <UsersRound size={22} color="#0b4f6c" />
            Quản lý Nhân sự & Lịch làm việc
          </h1>
          <p>
            Quản lý hồ sơ nhân viên, phân công vai trò, lịch trực ca và đồng bộ tính lương
          </p>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="employee-kpi-grid">
        <div className="employee-kpi-card">
          <div className="employee-kpi-icon" style={{ background: '#ecf3fa', color: '#0b4f6c' }}>
            <UsersRound size={22} />
          </div>
          <div className="employee-kpi-info">
            <div className="employee-kpi-label">Tổng nhân sự</div>
            <div className="employee-kpi-value">{pagination.total || employees.length}</div>
          </div>
        </div>

        <div className="employee-kpi-card">
          <div className="employee-kpi-icon" style={{ background: '#e8f5ee', color: '#16834f' }}>
            <UserCheck size={22} />
          </div>
          <div className="employee-kpi-info">
            <div className="employee-kpi-label">Đang hoạt động</div>
            <div className="employee-kpi-value" style={{ color: '#16834f' }}>
              {activeCount}
            </div>
          </div>
        </div>

        <div className="employee-kpi-card">
          <div className="employee-kpi-icon" style={{ background: '#fcecec', color: '#bd3f3f' }}>
            <UserX size={22} />
          </div>
          <div className="employee-kpi-info">
            <div className="employee-kpi-label">Đã tạm khóa</div>
            <div className="employee-kpi-value" style={{ color: '#bd3f3f' }}>
              {inactiveCount}
            </div>
          </div>
        </div>

        <div className="employee-kpi-card">
          <div className="employee-kpi-icon" style={{ background: '#edf4ff', color: '#2a64ad' }}>
            <Stethoscope size={22} />
          </div>
          <div className="employee-kpi-info">
            <div className="employee-kpi-label">Bác sĩ & Chuyên môn</div>
            <div className="employee-kpi-value" style={{ color: '#2a64ad' }}>
              {specialistCount}
            </div>
          </div>
        </div>
      </div>

      <div className="employee-tab-content">
        {activeTab === 'payroll' ? <PayrollManagement /> : null}
        {activeTab === 'employees' ? employeeContent : null}
      </div>
    </div>
  );
};
