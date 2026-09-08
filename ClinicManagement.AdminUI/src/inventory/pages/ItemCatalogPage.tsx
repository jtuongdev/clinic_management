import React, { useState, useEffect, useCallback } from 'react';
import { Space, Input, Select, Button, App, Typography, Modal } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { inventoryApi } from '../api/inventory.api';
import { ItemDto, CreateItemRequest } from '../types/inventory.types';
import ItemTable from '../components/ItemTable';
import ItemFormModal from '../components/ItemFormModal';

const { Text } = Typography;

const ItemCatalogPage: React.FC = () => {
  const { message } = App.useApp();

  // ─── State dữ liệu ──────────────────────────────────────────────────────────
  const [items, setItems] = useState<ItemDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // ─── State phân trang & lọc ─────────────────────────────────────────────────
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [inputKeyword, setInputKeyword] = useState('');
  const [itemType, setItemType] = useState<string | undefined>(undefined);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);

  // ─── State modal ────────────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemDto | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ─── State selection ────────────────────────────────────────────────────────
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  // ─── Fetch ──────────────────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getItems({
        pageIndex,
        pageSize,
        keyword: keyword || undefined,
        itemType: itemType || undefined,
        isActive: isActiveFilter,
      });
      if (res.data.success) {
        setItems(res.data.data.items ?? []);
        setTotal(res.data.data.total ?? 0);
      } else {
        message.error(res.data.message || 'Không tải được danh mục');
      }
    } catch {
      message.error('Lỗi kết nối – vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, keyword, itemType, isActiveFilter]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleSearch = () => {
    setKeyword(inputKeyword.trim());
    setPageIndex(1);
  };

  const handlePageChange = (page: number, size: number) => {
    setPageIndex(page);
    setPageSize(size);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item: ItemDto) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleToggleStatus = (item: ItemDto) => {
    const nextStatus = item.isActive ? 'ngừng dùng' : 'kích hoạt';
    Modal.confirm({
      title: `Xác nhận ${nextStatus} mặt hàng?`,
      content: `Mặt hàng "${item.name}" sẽ được ${nextStatus}.`,
      okText: 'Xác nhận',
      okType: item.isActive ? 'danger' : 'primary',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const res = await inventoryApi.toggleItemStatus(item.id);
          if (res.data.success) {
            message.success(`Đã ${nextStatus} mặt hàng "${item.name}"`);
            setItems((prev) =>
              prev.map((i) =>
                i.id === item.id ? { ...i, isActive: !i.isActive } : i,
              ),
            );
          } else {
            message.error(res.data.message || 'Thao tác thất bại');
          }
        } catch {
          message.error('Lỗi kết nối – vui lòng thử lại');
        }
      },
    });
  };

  const handleSubmit = async (data: CreateItemRequest) => {
    setSubmitting(true);
    try {
      if (editingItem) {
        const res = await inventoryApi.updateItem(editingItem.id, data);
        if (res.data.success) {
          message.success('Cập nhật mặt hàng thành công');
          setModalOpen(false);
          await fetchItems();
        } else {
          message.error(res.data.message || 'Cập nhật thất bại');
        }
      } else {
        const res = await inventoryApi.createItem(data);
        if (res.data.success) {
          message.success('Thêm mặt hàng thành công');
          setModalOpen(false);
          await fetchItems();
        } else {
          message.error(res.data.message || 'Thêm mới thất bại');
        }
      }
    } catch {
      message.error('Lỗi kết nối – vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#ffffff',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          padding: '10px 16px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          flexShrink: 0,
          background: '#f8fafc',
        }}
      >
        <Text strong style={{ fontSize: 14, color: '#0f172a' }}>
          Danh mục thuốc &amp; vật tư
        </Text>

        <Space wrap size="small">
          <Input
            placeholder="Tìm mã, tên mặt hàng..."
            value={inputKeyword}
            onChange={(e) => setInputKeyword(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            style={{ width: 220 }}
            allowClear
            onClear={() => {
              setInputKeyword('');
              setKeyword('');
              setPageIndex(1);
            }}
          />
          <Select
            placeholder="Tất cả loại"
            value={itemType}
            onChange={(val) => {
              setItemType(val);
              setPageIndex(1);
            }}
            allowClear
            style={{ width: 130 }}
            options={[
              { value: 'THUOC', label: 'Thuốc' },
              { value: 'VA_TU', label: 'Vật tư' },
            ]}
          />
          <Select
            placeholder="Tất cả trạng thái"
            value={isActiveFilter}
            onChange={(val) => {
              setIsActiveFilter(val);
              setPageIndex(1);
            }}
            allowClear
            style={{ width: 150 }}
            options={[
              { value: true, label: 'Đang dùng' },
              { value: false, label: 'Ngừng dùng' },
            ]}
          />
          <Button icon={<SearchOutlined />} onClick={handleSearch}>
            Tìm kiếm
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setInputKeyword('');
              setKeyword('');
              setItemType(undefined);
              setIsActiveFilter(undefined);
              setPageIndex(1);
            }}
          >
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm mới
          </Button>
        </Space>
      </div>

      {/* Bảng dữ liệu */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <ItemTable
          items={items}
          loading={loading}
          total={total}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          selectedRowKeys={selectedRowKeys}
          onSelectChange={(keys) => setSelectedRowKeys(keys)}
        />
      </div>

      {/* Modal thêm / sửa */}
      <ItemFormModal
        open={modalOpen}
        editingItem={editingItem}
        loading={submitting}
        onSubmit={handleSubmit}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
};

export default ItemCatalogPage;
