import React from 'react';
import { Table, Tag, Space, Button, Tooltip, Typography } from 'antd';
import { EditOutlined, PoweroffOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ItemDto } from '../types/inventory.types';

const { Text } = Typography;

interface ItemTableProps {
  items: ItemDto[];
  loading: boolean;
  total: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number, size: number) => void;
  onEdit: (item: ItemDto) => void;
  onToggleStatus: (item: ItemDto) => void;
  selectedRowKeys: number[];
  onSelectChange: (keys: number[], rows: ItemDto[]) => void;
}

const formatCurrencyVND = (value: number): string =>
  (value ?? 0).toLocaleString('vi-VN') + ' đ';

const ItemTable: React.FC<ItemTableProps> = ({
  items,
  loading,
  total,
  pageIndex,
  pageSize,
  onPageChange,
  onEdit,
  onToggleStatus,
  selectedRowKeys,
  onSelectChange,
}) => {
  const columns: ColumnsType<ItemDto> = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 110,
      render: (text: string) => (
        <Text code style={{ fontSize: 12 }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Tên thuốc / vật tư',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (text: string) => (
        <Text strong style={{ color: '#0f172a' }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'itemType',
      key: 'itemType',
      width: 90,
      align: 'center',
      render: (loai: 'THUOC' | 'VA_TU') =>
        loai === 'THUOC' ? (
          <Tag color="blue">Thuốc</Tag>
        ) : (
          <Tag color="cyan">Vật tư</Tag>
        ),
    },
    {
      title: 'Dạng bào chế',
      dataIndex: 'dosageForm',
      key: 'dosageForm',
      width: 120,
      render: (val?: string) => val || <Text type="secondary">—</Text>,
    },
    {
      title: 'Hàm lượng',
      dataIndex: 'strength',
      key: 'strength',
      width: 110,
      render: (val?: string) => val || <Text type="secondary">—</Text>,
    },
    {
      title: 'Đơn vị',
      dataIndex: 'baseUnit',
      key: 'baseUnit',
      width: 80,
      align: 'center',
    },
    {
      title: 'Giá bán lẻ',
      dataIndex: 'salePrice',
      key: 'salePrice',
      width: 130,
      align: 'right',
      render: (val: number) => (
        <Text strong style={{ color: '#0b4f6c' }}>
          {formatCurrencyVND(val)}
        </Text>
      ),
    },
    {
      title: 'Tồn tối thiểu',
      dataIndex: 'minimumStock',
      key: 'minimumStock',
      width: 110,
      align: 'right',
      render: (val: number) => (val ?? 0).toLocaleString('vi-VN'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 110,
      align: 'center',
      render: (active: boolean) =>
        active ? (
          <Tag color="success">Đang dùng</Tag>
        ) : (
          <Tag color="default">Ngừng dùng</Tag>
        ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size={4} onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined style={{ color: '#1677ff' }} />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title={record.isActive ? 'Tắt hoạt động' : 'Bật hoạt động'}>
            <Button
              type="text"
              size="small"
              danger={record.isActive}
              icon={
                <PoweroffOutlined
                  style={{ color: record.isActive ? '#f5222d' : '#52c41a' }}
                />
              }
              onClick={() => onToggleStatus(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table<ItemDto>
      rowKey="id"
      columns={columns}
      dataSource={items}
      loading={loading}
      size="middle"
      scroll={{ x: 1100, y: 'calc(100vh - 310px)' }}
      rowSelection={{
        type: 'checkbox',
        selectedRowKeys,
        onChange: (keys, rows) => onSelectChange(keys as number[], rows),
      }}
      pagination={{
        current: pageIndex,
        pageSize,
        total,
        onChange: onPageChange,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showTotal: (t, range) =>
          `Hiển thị ${range[0]} – ${range[1]} / ${t} mặt hàng`,
        style: { padding: '8px 16px', margin: 0 },
      }}
      locale={{ emptyText: 'Không có mặt hàng nào' }}
    />
  );
};

export default ItemTable;
