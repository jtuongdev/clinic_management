import React from 'react';
import { Card, Row, Col, Form, Select, DatePicker, Switch, Input } from 'antd';
import { ShopOutlined } from '@ant-design/icons';
import type { SupplierDto } from '../../types/inventory.types';

interface ImportGeneralInfoBlockProps {
  suppliers: SupplierDto[];
  loadingLookups: boolean;
}

export const ImportGeneralInfoBlock: React.FC<ImportGeneralInfoBlockProps> = ({
  suppliers,
  loadingLookups,
}) => {
  return (
    <Card
      size="small"
      title={
        <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
          <ShopOutlined style={{ marginRight: 6, color: '#0284c7' }} />
          BLOCK 1: THÔNG TIN HÀNH CHÍNH & CHỨNG TỪ NHẬP
        </span>
      }
      style={{
        background: '#f8fafc',
        borderColor: '#e2e8f0',
        marginBottom: 16,
      }}
    >
      <Row gutter={16}>
        {/* Kho nhận */}
        <Col span={6}>
          <Form.Item
            name="warehouseId"
            label="Kho tiếp nhận"
            rules={[{ required: true, message: 'Vui lòng chọn kho nhận' }]}
          >
            <Select
              options={[
                { value: 1, label: 'Kho Dược chính (Kho tổng)' },
                { value: 2, label: 'Tủ trực cấp cứu' },
                { value: 3, label: 'Quầy thuốc ngoại trú' },
              ]}
            />
          </Form.Item>
        </Col>

        {/* Nhà cung cấp */}
        <Col span={10}>
          <Form.Item
            name="supplierId"
            label="Nhà cung cấp"
            rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
          >
            <Select
              showSearch
              placeholder="Tìm theo tên, mã hoặc SĐT nhà cung cấp..."
              loading={loadingLookups}
              filterOption={(input, option) =>
                ((option?.label as string) ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={suppliers.map((s) => {
                const code = s.ma || (s as any).code || `NCC-${s.id}`;
                const name = s.ten || (s as any).name || 'Nhà cung cấp';
                const phone = s.dienThoai || (s as any).phone;
                return {
                  value: s.id,
                  label: `[${code}] ${name}${phone ? ` - SĐT: ${phone}` : ''}`,
                };
              })}
            />
          </Form.Item>
        </Col>

        {/* Ngày nhập */}
        <Col span={4}>
          <Form.Item
            name="importDate"
            label="Ngày nhập kho"
            rules={[{ required: true, message: 'Vui lòng chọn ngày nhập' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY HH:mm"
              showTime={{ format: 'HH:mm' }}
            />
          </Form.Item>
        </Col>

        {/* Chế độ lưu phiếu */}
        <Col span={4}>
          <Form.Item
            name="saveDraft"
            label="Chế độ nhập kho"
            valuePropName="checked"
            tooltip="Bật để lưu phiếu ở trạng thái Chờ duyệt. Tắt để nhập kho và cập nhật tồn tức thì."
          >
            <Switch checkedChildren="Chờ duyệt" unCheckedChildren="Nhập ngay" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* Số hóa đơn / Chứng từ NCC */}
        <Col span={6}>
          <Form.Item
            name="referenceCode"
            label="Số hóa đơn / Chứng từ NCC"
            tooltip="Số hóa đơn GTGT hoặc số phiếu giao hàng của NCC"
          >
            <Input placeholder="VD: HĐ-VAT-001239" />
          </Form.Item>
        </Col>

        {/* Ghi chú */}
        <Col span={18}>
          <Form.Item name="note" label="Ghi chú hóa đơn & kiểm nhận">
            <Input placeholder="Lưu ý về bao bì, điều kiện bảo quản, nhiệt độ lúc nhận..." />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};
