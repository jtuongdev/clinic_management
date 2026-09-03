import { useEffect, useState } from 'react';
import { App, Button, Form, Input, Modal, Select, Space, Switch, Table, Tag } from 'antd';
import { Plus, Search, UserRoundPen } from 'lucide-react';
import { employeeApi } from '../api/employee.api';

const emptyForm = {
  username: '', password: '', hoTen: '', ngaySinh: '', gioiTinh: 'M',
  email: '', dienThoai: '', maChucVu: undefined, chuyenKhoa: '', soHanhNghe: '',
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
    maChucVu: values.maChucVu === undefined || values.maChucVu === ''
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
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [roleModal, setRoleModal] = useState({ open: false, employee: null });
  const [roles, setRoles] = useState([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [roleLoading, setRoleLoading] = useState(false);

  const loadEmployees = async (page = pagination.current, pageSize = pagination.pageSize) => {
    setLoading(true);
    try {
      const response = await employeeApi.getPaged({ pageIndex: page, pageSize, keyword: keyword || undefined });
      const result = response.data.data;
      setEmployees(result.items);
      setPagination({ current: result.pageIndex, pageSize: result.pageSize, total: result.totalCount });
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Không thể tải danh sách nhân viên.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchInitialEmployees = async () => {
      setLoading(true);
      try {
        const response = await employeeApi.getPaged({ pageIndex: 1, pageSize: pagination.pageSize });
        if (!active) return;
        const result = response.data.data;
        setEmployees(result.items);
        setPagination({ current: result.pageIndex, pageSize: result.pageSize, total: result.totalCount });
      } catch (error) {
        if (active) message.error(getApiErrorMessage(error, 'Không thể tải danh sách nhân viên.'));
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchInitialEmployees();
    return () => { active = false; };
  }, [message, pagination.pageSize]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (employee) => {
    setEditing(employee);
    form.setFieldsValue({ ...employee, password: undefined, ngaySinh: employee.ngaySinh?.slice(0, 10) });
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
        message.success('Tạo nhân viên thành công.');
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
      message.success(isActive ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.');
      await loadEmployees();
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Không thể cập nhật trạng thái.'));
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
      message.success('Cập nhật phân quyền thành công.');
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Không thể cập nhật phân quyền.'));
    } finally {
      setRoleLoading(false);
    }
  };

  const columns = [
    { title: 'Nhân viên', key: 'employee', render: (_, row) => <Space><strong>{row.hoTen}</strong><span style={{ color: '#718096' }}>@{row.username}</span></Space> },
    { title: 'Chức vụ', dataIndex: 'tenChucVu', key: 'role', render: (value) => value || 'Chưa phân công' },
    { title: 'Liên hệ', key: 'contact', render: (_, row) => <div>{row.email || '-'}<br />{row.dienThoai || '-'}</div> },
    { title: 'Chuyên môn', dataIndex: 'chuyenKhoa', key: 'specialty', render: (value) => value || '-' },
    { title: 'Trạng thái', dataIndex: 'isActive', key: 'status', render: (value) => <Tag color={value ? 'green' : 'red'}>{value ? 'Đang hoạt động' : 'Đã khóa'}</Tag> },
    { title: 'Thao tác', key: 'actions', render: (_, row) => <Space><Button icon={<UserRoundPen size={16} />} onClick={() => openEdit(row)}>Sửa</Button><Button onClick={() => openRoles(row)}>Phân quyền</Button><Switch checked={row.isActive} onChange={(checked) => setStatus(row, checked)} /></Space> },
  ];

  return <div style={{ padding: 24, height: '100%', overflow: 'auto' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
      <div><h1 style={{ margin: 0 }}>Quản lý nhân viên</h1><span style={{ color: '#718096' }}>Tài khoản, hồ sơ và trạng thái hoạt động</span></div>
      <Button type="primary" icon={<Plus size={16} />} onClick={openCreate}>Thêm nhân viên</Button>
    </div>
    <Space.Compact style={{ width: '100%', maxWidth: 480, marginBottom: 16 }}><Input placeholder="Tìm theo tên, username hoặc email" value={keyword} onChange={(event) => setKeyword(event.target.value)} onPressEnter={() => loadEmployees(1)} prefix={<Search size={16} />} /><Button onClick={() => loadEmployees(1)}>Tìm kiếm</Button></Space.Compact>
    <Table rowKey="id" columns={columns} dataSource={employees} loading={loading} pagination={{ ...pagination, showSizeChanger: true, onChange: (page, size) => loadEmployees(page, size) }} />
    <Modal title={editing ? 'Cập nhật nhân viên' : 'Thêm nhân viên'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} okText="Lưu" cancelText="Hủy" destroyOnHidden>
      <Form form={form} layout="vertical" onFinish={submit} initialValues={emptyForm}>
        <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, min: 3 }]}><Input disabled={!!editing} /></Form.Item>
        {!editing && <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 8 }]}><Input.Password /></Form.Item>}
        <Form.Item name="hoTen" label="Họ tên" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="gioiTinh" label="Giới tính"><Select options={[{ value: 'M', label: 'Nam' }, { value: 'F', label: 'Nữ' }, { value: 'O', label: 'Khác' }]} /></Form.Item>
        <Form.Item name="ngaySinh" label="Ngày sinh"><Input type="date" /></Form.Item>
        <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}><Input /></Form.Item>
        <Form.Item name="dienThoai" label="Điện thoại"><Input /></Form.Item>
        <Form.Item name="maChucVu" label="Mã chức vụ"><Input type="number" /></Form.Item>
        <Form.Item name="chuyenKhoa" label="Chuyên khoa"><Input /></Form.Item>
        <Form.Item name="soHanhNghe" label="Số hành nghề"><Input /></Form.Item>
      </Form>
    </Modal>
    <Modal title={`Phân quyền: ${roleModal.employee?.hoTen || ''}`} open={roleModal.open} confirmLoading={roleLoading} onCancel={() => setRoleModal({ open: false, employee: null })} onOk={saveRoles} okText="Lưu quyền" cancelText="Hủy" destroyOnHidden>
      <Select
        mode="multiple"
        style={{ width: '100%' }}
        placeholder="Chọn vai trò"
        value={selectedRoleIds}
        loading={roleLoading}
        onChange={setSelectedRoleIds}
        options={roles.map((role) => ({ value: role.id, label: role.tenVaiTro }))}
      />
      <div style={{ marginTop: 20 }}>
        <strong>Quyền hiệu lực hiện tại</strong>
        <div style={{ marginTop: 8 }}>{permissions.length ? permissions.map((permission) => <Tag key={permission.id} color="blue">{permission.tenQuyen}</Tag>) : <span style={{ color: '#718096' }}>Chưa có quyền hiệu lực</span>}</div>
      </div>
    </Modal>
  </div>;
};
