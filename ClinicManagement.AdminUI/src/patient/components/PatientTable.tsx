import { Table, Tag, Button, Space, Typography } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { Patient } from '../type/patient.types';
import './style/PatientTable.css';

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
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleView(record)}
          />
          <Button type="text" icon={<EditOutlined />} size="small" onClick={() => onEdit?.(record)} />
          <Button type="text" danger icon={<DeleteOutlined />} size="small" onClick={() => onDelete?.(record)} />
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      pagination={pagination || { showSizeChanger: true, showTotal: (total) => `Tổng ${total} bệnh nhân` }}
      scroll={{ x: 900 }}
      style={{ background: '#fff', borderRadius: 12 }}
    />
  );
};