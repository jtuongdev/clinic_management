import React from 'react';
import { Table, Tag, Space, Tooltip, Typography, Badge } from 'antd';
import { WarningOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { StockDto, BatchDto } from '../types/inventory.types';

const { Text } = Typography;

interface StockTableProps {
  items: StockDto[];
  loading: boolean;
  total: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number, size: number) => void;
}

/** Tính số ngày còn lại đến hạn sử dụng */
const daysRemaining = (hanSuDung: string | null): number | null => {
  if (!hanSuDung) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(hanSuDung);
  exp.setHours(0, 0, 0, 0);
  return Math.round((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/** Sub-table: các lô của mặt hàng */
const BatchSubTable: React.FC<{ batches: BatchDto[] }> = ({ batches }) => {
  const batchColumns: ColumnsType<BatchDto> = [
    {
      title: 'Số lô',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 130,
      render: (text: string) => <Text code style={{ fontSize: 12 }}>{text}</Text>,
    },
    {
      title: 'Hạn sử dụng',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
      render: (val: string | null) => {
        const days = daysRemaining(val);
        if (days === null) return <Text type="secondary">Không có HSD</Text>;
        let color = 'success';
        if (days < 0) color = 'error';
        else if (days < 30) color = 'warning';
        return (
          <Tag color={color}>{formatDate(val)}</Tag>
        );
      },
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right',
      render: (val: number | string | null | undefined) => Number(val ?? 0).toLocaleString('vi-VN'),
    },
    {
      title: 'Ngày còn lại',
      key: 'daysLeft',
      width: 130,
      render: (_, record) => {
        const days = daysRemaining(record.expiryDate);
        if (days === null) {
          return <Text type="secondary">Không áp dụng</Text>;
        }
        if (days < 0) {
          return (
            <Space size={4}>
              <Badge status="error" />
              <Text type="danger" style={{ fontSize: 12 }}>
                Đã hết hạn {Math.abs(days)} ngày
              </Text>
            </Space>
          );
        }
        if (days < 30) {
          return (
            <Space size={4}>
              <Badge status="warning" />
              <Text style={{ color: '#fa8c16', fontSize: 12 }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                Còn {days} ngày
              </Text>
            </Space>
          );
        }
        return (
          <Space size={4}>
            <Badge status="success" />
            <Text type="success" style={{ fontSize: 12 }}>
              Còn {days} ngày
            </Text>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '8px 16px', background: '#fafafa' }}>
      <Table<BatchDto>
        rowKey="stockId"
        columns={batchColumns}
        dataSource={batches}
        pagination={false}
        size="small"
        locale={{ emptyText: 'Chưa có lô nào' }}
        rowClassName={(record) => {
          const days = daysRemaining(record.expiryDate);
          if (days === null) return '';
          if (days < 0) return 'batch-expired';
          if (days < 30) return 'batch-expiring';
          return '';
        }}
      />
    </div>
  );
};

const StockTable: React.FC<StockTableProps> = ({
  items,
  loading,
  total,
  pageIndex,
  pageSize,
  onPageChange,
}) => {
  const columns: ColumnsType<StockDto> = [
    {
      title: 'Mã',
      dataIndex: 'itemCode',
      key: 'itemCode',
      width: 110,
      render: (text: string) => (
        <Text code style={{ fontSize: 12 }}>{text}</Text>
      ),
    },
    {
      title: 'Tên mặt hàng',
      dataIndex: 'itemName',
      key: 'itemName',
      ellipsis: true,
      render: (text: string, record) => (
        <Space size={6}>
          <Text strong style={{ color: '#0f172a' }}>{text}</Text>
          {record.totalStock <= 0 && (
            <Tooltip title="Hết hàng">
              <WarningOutlined style={{ color: '#f5222d' }} />
            </Tooltip>
          )}
          {record.totalStock > 0 && record.totalStock < record.minimumStock && (
            <Tooltip title="Tồn thấp hơn mức tối thiểu">
              <WarningOutlined style={{ color: '#fa8c16' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'itemType',
      key: 'itemType',
      width: 80,
      align: 'center',
      render: (loai: 'THUOC' | 'VA_TU') =>
        loai === 'THUOC' ? (
          <Tag color="blue">Thuốc</Tag>
        ) : (
          <Tag color="cyan">Vật tư</Tag>
        ),
    },
    {
      title: 'Đơn vị',
      dataIndex: 'baseUnit',
      key: 'baseUnit',
      width: 80,
      align: 'center',
    },
    {
      title: 'Tổng tồn',
      dataIndex: 'totalStock',
      key: 'totalStock',
      width: 110,
      align: 'right',
      render: (val: number | string | null | undefined) => (
        <Text strong style={{ color: Number(val ?? 0) > 0 ? '#0b2a3c' : '#8c8c8c' }}>
          {Number(val ?? 0).toLocaleString('vi-VN')}
        </Text>
      ),
    },
    {
      title: 'Tồn tối thiểu',
      dataIndex: 'minimumStock',
      key: 'minimumStock',
      width: 120,
      align: 'right',
      render: (val: number | string | null | undefined) => Number(val ?? 0).toLocaleString('vi-VN'),
    },
    {
      title: 'Trạng thái tồn',
      key: 'stockStatus',
      width: 120,
      align: 'center',
      render: (_, record) => {
        if (record.totalStock <= 0) {
          return <Tag color="error">Hết hàng</Tag>;
        }
        if (record.totalStock < record.minimumStock) {
          return <Tag color="warning">Tồn thấp</Tag>;
        }
        return <Tag color="success">Đủ hàng</Tag>;
      },
    },
  ];

  return (
    <Table<StockDto>
      rowKey="itemId"
      columns={columns}
      dataSource={items}
      loading={loading}
      size="middle"
      scroll={{ x: 800, y: 'calc(100vh - 360px)' }}
      expandable={{
        expandedRowRender: (record) => (
          <BatchSubTable batches={record.batches ?? []} />
        ),
        rowExpandable: (record) => (record.batches ?? []).length > 0,
      }}
      pagination={{
        current: pageIndex,
        pageSize,
        total,
        onChange: onPageChange,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50'],
        showTotal: (t, range) =>
          `Hiển thị ${range[0]} – ${range[1]} / ${t} mặt hàng`,
        style: { padding: '8px 16px', margin: 0 },
      }}
      locale={{ emptyText: 'Không có dữ liệu tồn kho' }}
    />
  );
};

export default StockTable;
