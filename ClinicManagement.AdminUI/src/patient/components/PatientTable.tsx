import { useState } from 'react';
import { Table, Tag, Button, Space, Typography, Modal, Input, Tooltip, message } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined, KeyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { Patient } from '../type/patient.types';
import { detailpatientApi } from '../api/detail.patient.api';

const tableStyles = `
.patient-table-container {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}
.patient-table-container .table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 8px;
  background: #fafcff;
}
.patient-table-container .table-header .title {
  font-weight: 600;
  font-size: 14px;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
}
.patient-table-container .table-header .title .count-badge {
  background: #e2e8f0;
  padding: 1px 10px;
  border-radius: 12px;
  font-size: 11px;
  color: #475569;
  font-weight: 400;
}
.patient-table-container .ant-table-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.patient-table-container .ant-table-wrapper .ant-spin-nested-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.patient-table-container .ant-table-wrapper .ant-spin-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.patient-table-container .ant-table {
  flex: 1;
}
.patient-table-container .ant-table-thead > tr > th {
  background: #f8fafc;
  font-weight: 600;
  color: #475569;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border-bottom: 2px solid #e2e8f0;
  padding: 8px 10px;
}
.patient-table-container .ant-table-tbody > tr > td {
  padding: 7px 10px;
  border-bottom: 1px solid #f1f5f9;
  color: #0f172a;
  font-size: 12px;
}
.patient-table-container .ant-table-tbody > tr:hover > td {
  background: #f8fafc;
}
.patient-table-container .ant-table-tbody > tr:last-child > td {
  border-bottom: none;
}
.patient-table-container .status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}
.patient-table-container .status-badge .dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  display: inline-block;
}
.patient-table-container .status-badge.dang-kham {
  background: #dbeafe;
  color: #1d4ed8;
}
.patient-table-container .status-badge.dang-kham .dot {
  background: #3b82f6;
}
.patient-table-container .status-badge.cho-kham {
  background: #fef3c7;
  color: #b45309;
}
.patient-table-container .status-badge.cho-kham .dot {
  background: #f59e0b;
}
.patient-table-container .status-badge.hoan-thanh {
  background: #d1fae5;
  color: #065f46;
}
.patient-table-container .status-badge.hoan-thanh .dot {
  background: #10b981;
}
.patient-table-container .row-actions {
  display: flex;
  gap: 2px;
  justify-content: center;
}
.patient-table-container .row-actions .ant-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.patient-table-container .row-actions .ant-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}
@media (max-width: 820px) {
  .patient-table-container .table-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 8px 12px;
  }
}
@media (max-width: 600px) {
  .patient-table-container .ant-table-thead > tr > th,
  .patient-table-container .ant-table-tbody > tr > td {
    padding: 4px 6px;
    font-size: 11px;
  }
  .patient-table-container .row-actions .ant-btn {
    width: 24px;
    height: 24px;
    font-size: 11px;
  }
}
`;
const { Text } = Typography;

interface PatientTableProps {
  data: Patient[];
  loading?: boolean;
  pagination?: { current?: number; pageSize?: number; total?: number; onChange?: (page: number, size: number) => void };
  onView?: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
  onDelete?: (patient: Patient) => void;
}

const statusMap: Record<string, { color: string; label: string }> = {
  'CHO_KHAM': { color: 'warning', label: 'Chờ khám' },
  'DANG_KHAM': { color: 'processing', label: 'Đang khám' },
  'DA_KHAM': { color: 'blue', label: 'Đã khám' },
  'KET_LUAN': { color: 'cyan', label: 'Kết luận' },
  'HOAN_THANH': { color: 'success', label: 'Hoàn thành' },
  'DA_HUY': { color: 'default', label: 'Đã hủy' },
};

export const PatientTable = ({ data, loading, pagination, onView, onEdit, onDelete }: PatientTableProps) => {
  const navigate = useNavigate();
  const [pwdTarget, setPwdTarget] = useState<Patient | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);

  const handleSavePassword = async () => {
    if (!pwdTarget) return;
    if (!newPassword || newPassword.length < 6) {
      message.warning('Mật khẩu mới phải từ 6 ký tự trở lên.');
      return;
    }
    if (newPassword !== confirmPassword) {
      message.warning('Mật khẩu xác nhận không khớp.');
      return;
    }
    setPwdSaving(true);
    try {
      const res = await detailpatientApi.changePassword(Number(pwdTarget.id), newPassword);
      if (res.data?.success !== false) {
        message.success(res.data?.message || `Đã đổi mật khẩu cho ${pwdTarget.name}.`);
        setPwdTarget(null);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        message.error(res.data?.message || 'Không thể đổi mật khẩu.');
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setPwdSaving(false);
    }
  };

  const handleView = (record: Patient) => {
    if (onView) {
      onView(record);
    } else {
      // Chuyển đến trang chi tiết với id
      navigate(`/patient/detail/${record.id}`);
    }
  };

  const columns: ColumnsType<Patient> = [
    {
      title: 'Mã BN',
      dataIndex: 'maBN',
      key: 'maBN',
      width: 120,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Họ tên',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      render: (gender) => gender === 'M' ? 'Nam' : 'Nữ',
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dob',
      key: 'dob',
      width: 120,
      render: (dob) => {
        const date = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - date.getFullYear();
        const m = today.getMonth() - date.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;
        return `${date.toLocaleDateString('vi-VN')} (${age} tuổi)`;
      },
    },
    {
      title: 'SĐT',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
    },
    {
      title: 'Khoa',
      dataIndex: 'dept',
      key: 'dept',
      width: 120,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const info = statusMap[status] || { color: 'default', label: status };
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 145,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Đổi mật khẩu trực tiếp">
            <Button
              type="text"
              icon={<KeyOutlined />}
              size="small"
              onClick={() => {
                setPwdTarget(record);
                setNewPassword('');
                setConfirmPassword('');
              }}
            />
          </Tooltip>
          <Button type="text" icon={<EditOutlined />} size="small" onClick={() => onEdit?.(record)} />
          <Button type="text" danger icon={<DeleteOutlined />} size="small" onClick={() => onDelete?.(record)} />
        </Space>
      ),
    },
  ];

  return (
    <>
      <style>{tableStyles}</style>
      <div className="patient-table-container">
        <div className="table-header">
          <div className="title">
            <span>Danh sách bệnh nhân</span>
            <span className="count-badge">{pagination?.total ?? data.length} bệnh nhân</span>
          </div>
        </div>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={pagination || { showSizeChanger: true, showTotal: (total) => `Tổng ${total} bệnh nhân` }}
        scroll={{ x: 900 }}
      />
      <Modal
        title={pwdTarget ? `Đổi mật khẩu bệnh nhân: ${pwdTarget.name} (${pwdTarget.maBN})` : 'Đổi mật khẩu bệnh nhân'}
        open={!!pwdTarget}
        onOk={handleSavePassword}
        onCancel={() => setPwdTarget(null)}
        confirmLoading={pwdSaving}
        okText="Lưu mật khẩu"
        cancelText="Hủy"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
          <div>
            <label
              htmlFor="table-direct-new-pwd"
              style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4, color: '#334155' }}
            >
              Mật khẩu mới (tối thiểu 6 ký tự) *
            </label>
            <Input.Password
              id="table-direct-new-pwd"
              name="newPassword"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới..."
            />
          </div>
          <div>
            <label
              htmlFor="table-direct-confirm-pwd"
              style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 4, color: '#334155' }}
            >
              Xác nhận mật khẩu mới *
            </label>
            <Input.Password
              id="table-direct-confirm-pwd"
              name="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới..."
            />
          </div>
        </div>
      </Modal>
    </div>
    </>
  );
};