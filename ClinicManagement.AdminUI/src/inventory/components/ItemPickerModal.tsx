import React, { useState, useMemo } from 'react';
import {
  Modal,
  Table,
  Input,
  Select,
  Tag,
  Badge,
  Space,
  Button,
  Row,
  Col,
  Typography,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  AppstoreOutlined,
  CheckOutlined,
  MedicineBoxOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ItemDto } from '../types/inventory.types';

const { Text } = Typography;

export interface ItemPickerModalProps {
  open: boolean;
  items: ItemDto[];
  loading?: boolean;
  alreadySelectedIds?: number[];
  onCancel: () => void;
  onSelectItems: (selectedItems: ItemDto[]) => void;
}

export const ItemPickerModal: React.FC<ItemPickerModalProps> = ({
  open,
  items,
  loading = false,
  alreadySelectedIds = [],
  onCancel,
  onSelectItems,
}) => {
  const [keyword, setKeyword] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState<'ALL' | 'THUOC' | 'VA_TU'>('ALL');
  const [quickGroupFilter, setQuickGroupFilter] = useState<string>('ALL');

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRowsMap, setSelectedRowsMap] = useState<Map<number, ItemDto>>(new Map());

  // Nhóm danh mục nhanh
  const quickGroups = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'KHANG_SINH', label: 'Kháng sinh', match: ['amox', 'cefo', 'cipro', 'azith', 'augmentin', 'kháng sinh'] },
    { key: 'GIAM_DAU', label: 'Hạ sốt - Giảm đau', match: ['para', 'ibu', 'efferalgan', 'hapacol', 'meloxicam'] },
    { key: 'DICH_TRUYEN', label: 'Dịch truyền', match: ['natri clorid', 'glucose', 'ringer', 'dịch truyền'] },
    { key: 'TIÊU_HÓA', label: 'Tiêu hóa - Dạ dày', match: ['omepra', 'esome', 'pantop', 'men vi sinh', 'smecta'] },
    { key: 'HO_HAP', label: 'Hô hấp - Dị ứng', match: ['loratadin', 'cetirizin', 'avamys', 'xịt mũi', 'khí dung'] },
    { key: 'VAT_TU', label: 'Bơm tiêm - Kim - Găng', match: ['kim', 'bơm', 'găng', 'băng', 'cồn', 'gạc'] },
  ];

  // Lọc danh sách mặt hàng
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Lọc theo loại
      if (itemTypeFilter !== 'ALL' && item.itemType !== itemTypeFilter) {
        return false;
      }

      // Lọc theo nhóm nhanh
      if (quickGroupFilter !== 'ALL') {
        const grp = quickGroups.find((g) => g.key === quickGroupFilter);
        if (grp?.match) {
          const itemText = `${item.name} ${item.dosageForm || ''} ${item.strength || ''}`.toLowerCase();
          const matches = grp.match.some((keyword) => itemText.includes(keyword.toLowerCase()));
          if (!matches) return false;
        }
      }

      // Lọc theo từ khóa tìm kiếm
      if (keyword.trim()) {
        const kw = keyword.toLowerCase();
        const code = (item.code || '').toLowerCase();
        const name = (item.name || '').toLowerCase();
        const strength = (item.strength || '').toLowerCase();
        const dosage = (item.dosageForm || '').toLowerCase();
        return (
          code.includes(kw) ||
          name.includes(kw) ||
          strength.includes(kw) ||
          dosage.includes(kw)
        );
      }

      return true;
    });
  }, [items, itemTypeFilter, quickGroupFilter, keyword]);

  const handleRowSelectChange = (newSelectedKeys: React.Key[], currentSelectedRows: ItemDto[]) => {
    setSelectedRowKeys(newSelectedKeys);

    setSelectedRowsMap((prev) => {
      const next = new Map(prev);
      // Xóa những key không còn được chọn
      for (const key of next.keys()) {
        if (!newSelectedKeys.includes(key)) {
          next.delete(key);
        }
      }
      // Thêm những item mới được chọn
      currentSelectedRows.forEach((row) => {
        if (row && row.id) {
          next.set(row.id, row);
        }
      });
      return next;
    });
  };

  const handleConfirm = () => {
    const selectedItemsList: ItemDto[] = [];
    selectedRowKeys.forEach((key) => {
      const item = selectedRowsMap.get(Number(key)) || items.find((i) => i.id === key);
      if (item) {
        selectedItemsList.push(item);
      }
    });

    onSelectItems(selectedItemsList);
    // Reset selection
    setSelectedRowKeys([]);
    setSelectedRowsMap(new Map());
    onCancel();
  };

  const handleClose = () => {
    setSelectedRowKeys([]);
    setSelectedRowsMap(new Map());
    onCancel();
  };

  const columns: ColumnsType<ItemDto> = [
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 110,
      render: (code: string) => <Text code>{code}</Text>,
    },
    {
      title: 'Tên biệt dược / Mặt hàng',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: ItemDto) => {
        const isAlreadyInReceipt = alreadySelectedIds.includes(record.id);
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Text strong style={{ color: '#0f172a' }}>{name}</Text>
              {isAlreadyInReceipt && (
                <Tag color="orange" style={{ fontSize: 10, lineHeight: '18px' }}>
                  Đang có trong phiếu
                </Tag>
              )}
            </div>
            {(record.strength || record.dosageForm) && (
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {record.strength && <span>HL: {record.strength}</span>}
                {record.strength && record.dosageForm && <span> • </span>}
                {record.dosageForm && <span>Dạng: {record.dosageForm}</span>}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Phân loại',
      dataIndex: 'itemType',
      key: 'itemType',
      width: 120,
      render: (type: string) => (
        <Tag color={type === 'THUOC' ? 'blue' : 'purple'}>
          {type === 'THUOC' ? 'Thuốc tân dược' : 'Vật tư y tế'}
        </Tag>
      ),
    },
    {
      title: 'Đơn vị cơ bản',
      dataIndex: 'baseUnit',
      key: 'baseUnit',
      width: 110,
      render: (unit: string, record: ItemDto) => (
        <div>
          <Tag color="cyan">{unit}</Tag>
          {record.conversions && record.conversions.length > 0 && (
            <div style={{ fontSize: 11, color: '#64748b' }}>
              +{record.conversions.map((c) => c.unit).join(', ')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Giá tham chiếu (₫)',
      dataIndex: 'salePrice',
      key: 'salePrice',
      width: 140,
      align: 'right',
      render: (price: number) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>
          {price > 0 ? Number(price).toLocaleString('vi-VN') : '--'}
        </span>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AppstoreOutlined style={{ color: '#0b4f6c', fontSize: 20 }} />
          <span>
            Chọn nhanh thuốc & vật tư y tế từ danh mục
          </span>
        </div>
      }
      open={open}
      onCancel={handleClose}
      width={980}
      destroyOnClose
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 13, color: '#334155' }}>
              Đã chọn:{' '}
              <Text strong style={{ color: '#0b4f6c', fontSize: 16 }}>
                {selectedRowKeys.length}
              </Text>{' '}
              mặt hàng
            </span>
            {selectedRowKeys.length > 0 && (
              <Button
                type="link"
                size="small"
                icon={<ClearOutlined />}
                onClick={() => {
                  setSelectedRowKeys([]);
                  setSelectedRowsMap(new Map());
                }}
                style={{ marginLeft: 8 }}
              >
                Bỏ chọn tất cả
              </Button>
            )}
          </div>
          <Space>
            <Button onClick={handleClose}>Hủy</Button>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              style={{ background: '#0b4f6c', borderColor: '#0b4f6c' }}
              disabled={selectedRowKeys.length === 0}
              onClick={handleConfirm}
            >
              Đưa vào phiếu nhập ({selectedRowKeys.length} mặt hàng)
            </Button>
          </Space>
        </div>
      }
    >
      <div style={{ marginBottom: 12 }}>
        {/* Bộ lọc thanh trên */}
        <Row gutter={[12, 10]} align="middle">
          <Col span={12}>
            <Input
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Tìm theo mã, tên biệt dược, hoạt chất, hàm lượng..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              value={itemTypeFilter}
              onChange={setItemTypeFilter}
              options={[
                { value: 'ALL', label: 'Tất cả phân loại' },
                { value: 'THUOC', label: 'Chỉ Thuốc tân dược' },
                { value: 'VA_TU', label: 'Chỉ Vật tư y tế' },
              ]}
            />
          </Col>
          <Col span={6} style={{ textAlign: 'right' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Tìm thấy: <strong>{filteredItems.length}</strong> / {items.length} mục
            </Text>
          </Col>
        </Row>

        {/* Thẻ lọc danh mục nhóm bệnh nhanh */}
        <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#64748b', marginRight: 4, alignSelf: 'center' }}>
            Nhóm nhanh:
          </span>
          {quickGroups.map((grp) => {
            const isSelected = quickGroupFilter === grp.key;
            return (
              <Tag.CheckableTag
                key={grp.key}
                checked={isSelected}
                onChange={() => setQuickGroupFilter(grp.key)}
                style={{
                  border: isSelected ? '1px solid #0b4f6c' : '1px solid #e2e8f0',
                  borderRadius: 4,
                  padding: '2px 8px',
                  fontSize: 12,
                }}
              >
                {grp.label}
              </Tag.CheckableTag>
            );
          })}
        </div>
      </div>

      {/* Bảng danh sách với Checkbox */}
      <Table<ItemDto>
        rowKey="id"
        dataSource={filteredItems}
        columns={columns}
        loading={loading}
        size="small"
        bordered
        scroll={{ y: 380 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} mặt hàng`,
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: handleRowSelectChange,
          preserveSelectedRowKeys: true,
        }}
      />
    </Modal>
  );
};

export default ItemPickerModal;
