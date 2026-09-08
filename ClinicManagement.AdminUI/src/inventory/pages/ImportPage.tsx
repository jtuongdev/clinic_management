import React, { useEffect, useState } from 'react';
import { Button, Table, Tag, Space, Typography, Alert, App, Tooltip } from 'antd';
import { PlusOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { inventoryApi } from '../api/inventory.api';
import { ImportReceiptDto, ImportReceiptRequest, ImportReceiptStatus } from '../types/inventory.types';
import ImportForm from '../components/ImportForm';

const { Title, Text } = Typography;

const statusLabel: Record<ImportReceiptStatus, { color: string; text: string }> = {
  CHO_DUYET: { color: 'warning', text: 'Chờ duyệt' },
  DA_NHAP: { color: 'success', text: 'Đã nhập' },
  DA_HUY: { color: 'default', text: 'Đã hủy' },
  TAM: { color: 'processing', text: 'Tạm' },
};

const ImportPage: React.FC = () => {
  const { message } = App.useApp();

  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [receipts, setReceipts] = useState<ImportReceiptDto[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const loadReceipts = async (pageIndex = 1, pageSize = 10) => {
    setListLoading(true);
    try {
      const res = await inventoryApi.getImportReceipts({ pageIndex, pageSize });
      if (res.data.success) {
        setReceipts(res.data.data.items);
        setTotal(res.data.data.total);
      } else {
        message.error(res.data.message || 'Không tải được danh sách phiếu nhập');
      }
    } catch {
      message.error('Có lỗi khi tải danh sách phiếu nhập');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    void loadReceipts();
  }, []);

  const handleSubmit = async (data: ImportReceiptRequest) => {
    setFormLoading(true);
    try {
      const res = await inventoryApi.createImportReceipt(data);
      if (res.data.success) {
        const newReceipt = res.data.data;
        await loadReceipts();
        message.success(
          data.saveDraft
            ? `Đã lưu nháp phiếu nhập #${newReceipt.id}`
            : `Đã nhập kho thành công cho phiếu #${newReceipt.id}`,
        );
        setFormOpen(false);
      } else {
        message.error(res.data.message || 'Tạo phiếu nhập thất bại');
      }
    } catch {
      message.error('Có lỗi xảy ra khi tạo phiếu nhập');
    } finally {
      setFormLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setApprovingId(id);
    try {
      const res = await inventoryApi.approveImport(id);
      if (res.data.success) {
        setReceipts((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'DA_NHAP' as const } : r)),
        );
        message.success(`Đã duyệt phiếu nhập #${id}`);
      } else {
        message.error(res.data.message || 'Duyệt phiếu thất bại');
      }
    } catch {
      message.error('Có lỗi khi duyệt phiếu nhập');
    } finally {
      setApprovingId(null);
    }
  };

  const formatCurrency = (amount: number) =>
    (amount ?? 0).toLocaleString('vi-VN') + ' ₫';

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const columns: ColumnsType<ImportReceiptDto> = [
    {
      title: 'Mã phiếu',
      dataIndex: 'id',
      key: 'id',
      width: 90,
      render: (id: number) => (
        <Text strong style={{ color: '#0b4f6c' }}>
          #{id}
        </Text>
      ),
    },
    {
      title: 'Mã NCC',
      dataIndex: ['supplier', 'name'],
      key: 'supplier',
      width: 100,
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'receivedAt',
      key: 'receivedAt',
      width: 120,
      render: formatDate,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 140,
      align: 'right',
      render: (val: number) => <Text strong>{formatCurrency(val)}</Text>,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
      render: (note?: string) => note || '--',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: ImportReceiptDto['status']) => {
        const cfg = statusLabel[status] ?? { color: 'default', text: status };
        return <Tag color={cfg.color}>{cfg.text}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) =>
        record.status === 'CHO_DUYET' ? (
          <Tooltip title="Duyệt phiếu nhập">
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              loading={approvingId === record.id}
              onClick={() => handleApprove(record.id)}
            >
              Duyệt
            </Button>
          </Tooltip>
        ) : null,
    },
  ];

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Title level={4} style={{ margin: 0, color: '#0b4f6c' }}>
          Nhập kho
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setFormOpen(true)}
        >
          Tạo phiếu nhập
        </Button>
      </div>

      {/* Hướng dẫn workflow */}
      <Alert
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        title={
          <Space separator="  |  ">
            <Text>
              <Text strong>Dược sĩ thường:</Text> Tạo nháp → Quản lý duyệt
            </Text>
            <Text>
              <Text strong>Dược sĩ trưởng:</Text> Nhập ngay (tắt "Lưu nháp")
            </Text>
          </Space>
        }
        style={{ borderRadius: 6 }}
      />

      {/* Bảng danh sách phiếu nháp */}
      <Table<ImportReceiptDto>
        rowKey="id"
        columns={columns}
        dataSource={receipts}
        loading={listLoading}
        size="middle"
        locale={{
          emptyText: (
            <div style={{ padding: '32px 0', color: '#94a3b8' }}>
              Chưa có phiếu nhập nào. Nhấn "Tạo phiếu nhập" để bắt đầu.
            </div>
          ),
        }}
        pagination={{
          total,
          pageSize: 10,
          showSizeChanger: true,
          onChange: (page, pageSize) => void loadReceipts(page, pageSize),
          showTotal: (total, range) =>
            `Hiển thị ${range[0]}–${range[1]} / ${total} phiếu`,
        }}
      />

      {/* Modal tạo phiếu */}
      <ImportForm
        open={formOpen}
        loading={formLoading}
        onSubmit={handleSubmit}
        onCancel={() => setFormOpen(false)}
      />
    </div>
  );
};

export default ImportPage;
