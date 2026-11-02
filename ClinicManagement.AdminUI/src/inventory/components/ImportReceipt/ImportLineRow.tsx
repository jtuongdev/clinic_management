import React from 'react';
import {
  Row,
  Col,
  Form,
  Select,
  Input,
  DatePicker,
  InputNumber,
  Button,
  Tooltip,
  Divider,
  Tag,
  Space,
} from 'antd';
import {
  DeleteOutlined,
  PlusOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ItemDto } from '../../types/inventory.types';
import type { ImportFormLineItem } from './types';
import { formatCurrency, getQuickQuantities } from './helpers';

interface ImportLineRowProps {
  name: number;
  restField: Record<string, any>;
  items: ItemDto[];
  itemMap: Map<number, ItemDto>;
  currentLine?: ImportFormLineItem;
  loadingLookups: boolean;
  canDelete: boolean;
  onRemove: () => void;
  onItemSelect: (itemId: number, fieldIndex: number) => void;
  onQuickAddItem: (lineIndex: number) => void;
  onGenerateLot: (fieldIndex: number) => void;
  onSetQuantity: (lineIndex: number, qty: number) => void;
  onAddQuantity: (lineIndex: number, delta: number) => void;
  onUnitChange: (lineIndex: number, newUnit: string) => void;
}

export const ImportLineRow: React.FC<ImportLineRowProps> = ({
  name,
  restField,
  items,
  itemMap,
  currentLine,
  loadingLookups,
  canDelete,
  onRemove,
  onItemSelect,
  onQuickAddItem,
  onGenerateLot,
  onSetQuantity,
  onAddQuantity,
  onUnitChange,
}) => {
  const selectedItem = currentLine?.itemId ? itemMap.get(currentLine.itemId) : undefined;
  const availableUnits = selectedItem
    ? [selectedItem.baseUnit, ...(selectedItem.conversions || []).map((c) => c.unit)]
    : [];
  const currentUnit = currentLine?.unit || selectedItem?.baseUnit;
  const selectedConversion = selectedItem?.conversions?.find((c) => c.unit === currentUnit);
  const lineTotal = (currentLine?.quantity ?? 0) * (currentLine?.purchasePrice ?? 0);

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: 8,
        padding: '12px 14px',
        marginBottom: 10,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <Row gutter={8} align="middle">
        {/* Chọn thuốc / vật tư */}
        <Col span={7}>
          <Form.Item
            {...restField}
            name={[name, 'itemId']}
            label={name === 0 ? 'Tên thuốc / Hoạt chất / Mã' : ''}
            rules={[{ required: true, message: 'Bắt buộc chọn mặt hàng' }]}
            style={{ marginBottom: 0 }}
          >
            <Select
              showSearch
              placeholder="Gõ mã, tên biệt dược, hoạt chất..."
              loading={loadingLookups}
              onChange={(val) => onItemSelect(val, name)}
              filterOption={(input, option) => {
                const label = (option?.label as string) ?? '';
                const searchLower = input.toLowerCase();
                return label.toLowerCase().includes(searchLower);
              }}
              options={items.map((i) => ({
                value: i.id,
                label: `[${i.code}] ${i.name}${i.strength ? ` - ${i.strength}` : ''} (ĐVT: ${i.baseUnit})`,
              }))}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '6px 0' }} />
                  <div style={{ padding: '4px 8px' }}>
                    <Button
                      type="primary"
                      ghost
                      size="small"
                      icon={<PlusOutlined />}
                      style={{ width: '100%' }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => onQuickAddItem(name)}
                    >
                      + Tạo thuốc mới vào danh mục
                    </Button>
                  </div>
                </>
              )}
            />
          </Form.Item>
        </Col>

        {/* Đơn vị nhập */}
        <Col span={2}>
          <Form.Item
            {...restField}
            name={[name, 'unit']}
            label={name === 0 ? 'Đơn vị' : ''}
            style={{ marginBottom: 0 }}
          >
            <Select
              placeholder="Đơn vị"
              options={availableUnits.map((u) => ({
                value: u,
                label: u,
              }))}
              disabled={!selectedItem}
            />
          </Form.Item>
        </Col>

        {/* Số lô */}
        <Col span={3}>
          <Form.Item
            {...restField}
            name={[name, 'lotNumber']}
            label={name === 0 ? 'Số lô (Batch)' : ''}
            rules={[
              { required: true, message: 'Bắt buộc nhập số lô' },
              {
                validator: (_, val) =>
                  val && val.trim().length > 0
                    ? Promise.resolve()
                    : Promise.reject(new Error('Số lô không được rỗng')),
              },
            ]}
            style={{ marginBottom: 0 }}
          >
            <Input
              placeholder="VD: L0124"
              suffix={
                <Tooltip title="Tự sinh số lô (Chuẩn y tế)">
                  <Button
                    type="text"
                    size="small"
                    icon={<ThunderboltOutlined style={{ color: '#0284c7', fontSize: 13 }} />}
                    onClick={() => onGenerateLot(name)}
                    style={{ padding: '0 2px', height: 20 }}
                  />
                </Tooltip>
              }
            />
          </Form.Item>
        </Col>

        {/* Hạn sử dụng - Chặn ngày quá khứ */}
        <Col span={3}>
          <Form.Item
            {...restField}
            name={[name, 'expiryDate']}
            label={name === 0 ? 'Hạn sử dụng' : ''}
            rules={[{ required: true, message: 'Bắt buộc nhập HSD' }]}
            style={{ marginBottom: 0 }}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="Hạn dùng"
              disabledDate={(current) =>
                Boolean(current && current <= dayjs().endOf('day'))
              }
            />
          </Form.Item>
        </Col>

        {/* Số lượng */}
        <Col span={2}>
          <Form.Item
            {...restField}
            name={[name, 'quantity']}
            label={name === 0 ? 'Số lượng' : ''}
            rules={[{ required: true, message: 'Nhập SL' }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber style={{ width: '100%' }} min={1} placeholder="SL" />
          </Form.Item>
        </Col>

        {/* Đơn giá */}
        <Col span={3}>
          <Form.Item
            {...restField}
            name={[name, 'purchasePrice']}
            label={name === 0 ? 'Đơn giá (₫)' : ''}
            rules={[{ required: true, message: 'Nhập giá' }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber<number>
              style={{ width: '100%' }}
              min={0}
              step={1000}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(v) => Number(v?.replace(/,/g, '') ?? '0')}
            />
          </Form.Item>
        </Col>

        {/* Thành tiền dòng */}
        <Col span={3} style={{ textAlign: 'right' }}>
          {name === 0 && (
            <div style={{ fontSize: 13, color: '#475569', marginBottom: 8 }}>
              Thành tiền (₫)
            </div>
          )}
          <div
            style={{
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: 6,
            }}
          >
            <span
              style={{
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: 14,
                color: '#0b4f6c',
              }}
            >
              {formatCurrency(lineTotal)}
            </span>
          </div>
        </Col>

        {/* Xóa dòng */}
        <Col
          span={1}
          style={{
            textAlign: 'center',
            paddingTop: name === 0 ? 28 : 0,
          }}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={onRemove}
            disabled={!canDelete}
          />
        </Col>
      </Row>

      {/* Dòng tóm tắt quy đổi, chọn số lượng nhanh và thành tiền */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          marginTop: 8,
          paddingTop: 8,
          borderTop: '1px dashed #e2e8f0',
        }}
      >
        {/* Khu vực chọn nhanh số lượng theo đơn vị của item */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 6,
          }}
        >
          <span style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>
            ⚡ SL nhanh ({currentUnit || 'ĐVT'}):
          </span>

          {/* Các nút tăng/giảm nhanh */}
          <Space size={2}>
            {[1, 5, 10, 50, 100].map((step) => (
              <Button
                key={`add-${step}`}
                size="small"
                style={{
                  height: 22,
                  padding: '0 6px',
                  fontSize: 11,
                  borderRadius: 4,
                  borderColor: '#cbd5e1',
                  background: '#f8fafc',
                  color: '#0369a1',
                }}
                onClick={() => onAddQuantity(name, step)}
              >
                +{step}
              </Button>
            ))}
          </Space>

          <Divider type="vertical" style={{ margin: '0 2px' }} />

          {/* Các mốc đặt nhanh số lượng theo quy cách */}
          <Space size={3}>
            {getQuickQuantities(selectedItem, currentUnit).map((preset) => (
              <Tag
                key={`preset-${preset.val}`}
                color={currentLine?.quantity === preset.val ? 'blue' : 'default'}
                style={{
                  cursor: 'pointer',
                  fontSize: 11,
                  lineHeight: '20px',
                  height: 22,
                  padding: '0 6px',
                  marginRight: 0,
                  userSelect: 'none',
                  fontWeight: currentLine?.quantity === preset.val ? 700 : 400,
                  borderColor:
                    currentLine?.quantity === preset.val ? '#0284c7' : '#cbd5e1',
                }}
                onClick={() => onSetQuantity(name, preset.val)}
              >
                {preset.label}
              </Tag>
            ))}
          </Space>

          {/* Chuyển đổi nhanh ĐVT nếu item có nhiều đơn vị */}
          {availableUnits.length > 1 && (
            <>
              <Divider type="vertical" style={{ margin: '0 2px' }} />
              <span style={{ fontSize: 11, color: '#64748b' }}>Đổi ĐVT:</span>
              <Space size={2}>
                {availableUnits.map((u) => (
                  <Tag
                    key={`unit-${u}`}
                    color={currentUnit === u ? 'cyan' : undefined}
                    style={{
                      cursor: 'pointer',
                      fontSize: 11,
                      lineHeight: '20px',
                      height: 22,
                      padding: '0 6px',
                      marginRight: 0,
                      fontWeight: currentUnit === u ? 600 : 400,
                    }}
                    onClick={() => onUnitChange(name, u)}
                  >
                    {u}
                  </Tag>
                ))}
              </Space>
            </>
          )}
        </div>

        {/* Thông tin quy đổi & Đơn vị chuẩn */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginLeft: 'auto',
          }}
        >
          {selectedConversion ? (
            <Tag
              color="geekblue"
              icon={<InfoCircleOutlined />}
              style={{ margin: 0, fontSize: 11 }}
            >
              Quy đổi: 1 {currentUnit} = {selectedConversion.factor}{' '}
              {selectedItem?.baseUnit} (Tương đương:{' '}
              {(currentLine?.quantity ?? 0) * selectedConversion.factor}{' '}
              {selectedItem?.baseUnit})
            </Tag>
          ) : selectedItem ? (
            <span style={{ fontSize: 11, color: '#64748b' }}>
              Đơn vị chuẩn:{' '}
              <strong style={{ color: '#0f172a' }}>{selectedItem.baseUnit}</strong>
            </span>
          ) : (
            <span style={{ fontStyle: 'italic', color: '#94a3b8', fontSize: 11 }}>
              Chọn mặt hàng để xem quy đổi
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
