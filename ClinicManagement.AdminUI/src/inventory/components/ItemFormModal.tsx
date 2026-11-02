import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Space,
  Button,
  Divider,
  Checkbox,
  Typography,
  Row,
  Col,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { ItemDto, CreateItemRequest } from '../types/inventory.types';

const { Text } = Typography;

interface ExtendedCreateItemRequest extends CreateItemRequest {
  activeIngredient?: string;
  registrationNumber?: string;
  insuranceCode?: string;
  insuranceCoverageRate?: number;
  routeOfAdministration?: string;
}

interface ItemFormModalProps {
  open: boolean;
  editingItem: ItemDto | null;
  lockedFields?: string[];
  loading: boolean;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const ItemFormModal: React.FC<ItemFormModalProps> = ({
  open,
  editingItem,
  lockedFields = [],
  loading,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const isEdit = editingItem !== null;

  useEffect(() => {
    if (open) {
      if (editingItem) {
        form.setFieldsValue({
          code: editingItem.code,
          name: editingItem.name,
          itemType: editingItem.itemType,
          dosageForm: editingItem.dosageForm,
          strength: editingItem.strength,
          baseUnit: editingItem.baseUnit,
          salePrice: editingItem.salePrice,
          minimumStock: editingItem.minimumStock,
          canPrescribe: editingItem.canPrescribe,
          activeIngredient: (editingItem as any).activeIngredient || '',
          registrationNumber: (editingItem as any).registrationNumber || '',
          insuranceCode: (editingItem as any).insuranceCode || '',
          insuranceCoverageRate: (editingItem as any).insuranceCoverageRate ?? 100,
          routeOfAdministration: (editingItem as any).routeOfAdministration || 'Uống',
          conversions: editingItem.conversions ?? [],
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ 
          itemType: 'THUOC', 
          canPrescribe: true, 
          routeOfAdministration: 'Uống',
          insuranceCoverageRate: 100,
          conversions: [] 
        });
      }
    }
  }, [open, editingItem, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    onSubmit({
      ...values,
      conversions: values.conversions ?? [],
    });
  };

  return (
    <Modal
      open={open}
      title={isEdit ? 'Chỉnh sửa mặt hàng Dược / Vật tư' : 'Thêm mới Thuốc & Vật tư y tế'}
      okText={isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
      cancelText="Hủy"
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={loading}
      width={780}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" size="middle">
        {/* Hàng 1: Mã + Loại + Số đăng ký */}
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item
              label="Mã hàng (Code)"
              name="code"
              tooltip={lockedFields.includes('code') ? 'Không thể đổi mã khi đã có giao dịch' : undefined}
            >
              <Input
                placeholder="Tự động tạo nếu để trống"
                disabled={lockedFields.includes('code')}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Loại"
              name="itemType"
              rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
            >
              <Select
                disabled={isEdit}
                options={[
                  { value: 'THUOC', label: 'Thuốc (Dược phẩm)' },
                  { value: 'VA_TU', label: 'Vật tư y tế' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Số đăng ký (SĐK/GPNK)" name="registrationNumber">
              <Input placeholder="VD: VD-28491-17" allowClear />
            </Form.Item>
          </Col>
        </Row>

        {/* Tên thương mại */}
        <Form.Item
          label="Tên biệt dược / Tên thương mại"
          name="name"
          rules={[
            { required: true, message: 'Vui lòng nhập tên mặt hàng' },
            { max: 200, message: 'Tên không vượt quá 200 ký tự' },
          ]}
        >
          <Input placeholder="Nhập tên thuốc (VD: Paracetamol Haphacol 500mg)" allowClear />
        </Form.Item>

        {/* Hàng 2: Hoạt chất + Hàm lượng + Dạng bào chế */}
        <Row gutter={12}>
          <Col span={10}>
            <Form.Item 
              label="Hoạt chất chính (Dùng cho kiểm tra dị ứng & tương tác)" 
              name="activeIngredient"
              tooltip="Rất quan trọng: Hệ thống dùng tên hoạt chất để cảnh báo tương tác thuốc và dị ứng"
            >
              <Input placeholder="VD: Paracetamol, Amoxicillin" allowClear />
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item label="Hàm lượng / Nồng độ" name="strength">
              <Input placeholder="500mg, 250ml/chai..." allowClear />
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item label="Đường dùng" name="routeOfAdministration">
              <Select
                options={[
                  { value: 'Uống', label: 'Uống' },
                  { value: 'Tiêm bắp', label: 'Tiêm bắp' },
                  { value: 'Tiêm tĩnh mạch', label: 'Tiêm tĩnh mạch' },
                  { value: 'Bôi ngoài da', label: 'Bôi ngoài da' },
                  { value: 'Nhỏ mắt/tai', label: 'Nhỏ mắt/tai' },
                  { value: 'Khí dung', label: 'Khí dung' },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Hàng 3: BHYT Mapping + Tỷ lệ thanh toán */}
        <Row gutter={12} style={{ background: '#f8fafc', padding: '10px 6px', borderRadius: '6px', marginBottom: '14px' }}>
          <Col span={12}>
            <Form.Item label="Mã ánh xạ BHYT (Cổng 4210)" name="insuranceCode" style={{ marginBottom: 0 }}>
              <Input placeholder="Mã thuốc theo TT 20/2022/TT-BYT (VD: 40.123)" allowClear />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Tỷ lệ BHYT chi trả (%)" name="insuranceCoverageRate" style={{ marginBottom: 0 }}>
              <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="100" />
            </Form.Item>
          </Col>
        </Row>

        {/* Hàng 4: Đơn vị cơ bản + Giá bán lẻ + Tồn tối thiểu */}
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item
              label="Đơn vị cơ bản"
              name="baseUnit"
              rules={[{ required: true, message: 'Nhập đơn vị cơ bản' }]}
              tooltip={lockedFields.includes('baseUnit') ? 'Không thể thay đổi khi đã có giao dịch' : undefined}
            >
              <Input
                placeholder="Viên, Ống, Gói..."
                disabled={lockedFields.includes('baseUnit')}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Giá bán lẻ (VNĐ)"
              name="salePrice"
              rules={[{ required: true, message: 'Nhập giá bán lẻ' }]}
            >
              <InputNumber
                min={0}
                step={500}
                style={{ width: '100%' }}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(v) => Number(v?.replace(/,/g, '') ?? 0)}
                placeholder="0"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Tồn tối thiểu (Cảnh báo)"
              name="minimumStock"
              rules={[{ required: true, message: 'Nhập tồn tối thiểu' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
            </Form.Item>
          </Col>
        </Row>

        {/* Checkbox kê đơn */}
        <Form.Item name="canPrescribe" valuePropName="checked" style={{ marginBottom: 8 }}>
          <Checkbox>Cho phép Bác sĩ tìm kiếm & kê đơn thuốc này</Checkbox>
        </Form.Item>

        <Divider style={{ margin: '8px 0 12px' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Đơn vị quy đổi & Đóng gói (VD: 1 Hộp = 10 Vỉ = 100 Viên)
          </Text>
        </Divider>

        {/* Form.List: đơn vị chuyển đổi */}
        <Form.List name="conversions">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  align="baseline"
                  style={{ display: 'flex', marginBottom: 8, gap: 8 }}
                >
                  <Form.Item
                    {...restField}
                    name={[name, 'unit']}
                    rules={[{ required: true, message: 'Nhập đơn vị quy đổi' }]}
                    style={{ width: 220 }}
                  >
                    <Input placeholder="Tên đơn vị (Hộp, Vỉ...)" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'factor']}
                    rules={[{ required: true, message: 'Nhập hệ số' }]}
                    style={{ width: 180 }}
                  >
                    <InputNumber min={1} placeholder="Hệ số quy đổi" style={{ width: '100%' }} />
                  </Form.Item>
                  <Button
                    type="text"
                    danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => remove(name)}
                  />
                </Space>
              ))}
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                style={{ marginTop: 4 }}
              >
                Thêm đơn vị quy đổi
              </Button>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
};

export default ItemFormModal;
