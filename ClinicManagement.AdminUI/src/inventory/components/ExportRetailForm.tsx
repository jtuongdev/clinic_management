import React from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Row,
  Col,
  Typography,
  Divider,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { ExportRequest, ExportLineRequest } from '../types/inventory.types';

const { TextArea } = Input;
const { Text } = Typography;

interface ExportRetailFormProps {
  open: boolean;
  mode: 'retail' | 'internal';
  loading: boolean;
  onSubmit: (data: ExportRequest) => void;
  onCancel: () => void;
}

interface ExportFormValues {
  note?: string;
  visitId: number;
  paymentMethod?: string;
  paidAmount: number;
  lines: {
    itemId: number;
    quantity: number;
    unit?: string;
    salePrice?: number;
  }[];
}

const ExportRetailForm: React.FC<ExportRetailFormProps> = ({
  open,
  mode,
  loading,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm<ExportFormValues>();

  const isRetail = mode === 'retail';

  const handleFinish = (values: ExportFormValues) => {
    const lines: ExportLineRequest[] = values.lines.map((l) => ({
      itemId: l.itemId,
      quantity: l.quantity,
      unit: l.unit,
      salePrice: l.salePrice,
    }));

    const payload: ExportRequest = {
      visitId: values.visitId,
      note: values.note,
      paymentMethod: isRetail ? 'CASH' : undefined,
      paidAmount: isRetail ? (values.paidAmount ?? 0) : 0,
      idempotencyKey: `EXP-${Date.now()}`,
      items: lines,
    };

    onSubmit(payload);
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={isRetail ? 'Xuất bán lẻ' : 'Xuất thủ thuật / nội bộ'}
      open={open}
      onCancel={handleCancel}
      width={800}
      footer={null}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          lines: [{ itemId: undefined, quantity: 1, unit: '', salePrice: undefined }],
        }}
        onFinish={handleFinish}
      >
        {/* Trường theo mode */}
        {isRetail ? (
          <Form.Item           name="visitId" label="Mã lượt khám"
          rules={[{ required: true, message: 'Vui lòng nhập mã lượt khám' }]}>
          <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        ) : (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="visitId"
                label="Mã lượt khám"
                rules={[{ required: true, message: 'Vui lòng chọn phòng nhận' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="paidAmount"
                label="Số tiền thu"
                rules={[{ required: true, message: 'Vui lòng nhập tên người nhận' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        )}

        <Form.Item name="note" label="Ghi chú">
          <TextArea rows={2} placeholder="Ghi chú bổ sung..." />
        </Form.Item>

        <Divider style={{ margin: '8px 0 16px' }}>
          Danh sách mặt hàng xuất
        </Divider>

        <Form.List
          name="lines"
          rules={[
            {
              validator: async (_, value) => {
                if (!value || value.length < 1) {
                  return Promise.reject(new Error('Phải có ít nhất 1 mặt hàng'));
                }
              },
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Row key={key} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                  <Col span={5}>
                    <Form.Item
                      {...restField}
                      name={[name, 'itemId']}
                      label={name === 0 ? 'Mã mặt hàng' : ''}
                      rules={[{ required: true, message: 'Bắt buộc' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber style={{ width: '100%' }} min={1} placeholder="Mã MH" />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      label={name === 0 ? 'Số lượng' : ''}
                      rules={[{ required: true, message: 'Bắt buộc' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <InputNumber style={{ width: '100%' }} min={1} />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item
                      {...restField}
                      name={[name, 'unit']}
                      label={name === 0 ? 'Đơn vị' : ''}
                      style={{ marginBottom: 0 }}
                    >
                      <Input placeholder="viên, gói..." />
                    </Form.Item>
                  </Col>
                  {isRetail && (
                    <Col span={5}>
                      <Form.Item
                        {...restField}
                        name={[name, 'salePrice']}
                        label={name === 0 ? 'Giá bán (₫)' : ''}
                        style={{ marginBottom: 0 }}
                      >
                        <InputNumber<number>
                          style={{ width: '100%' }}
                          min={0}
                          formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={(v) => Number(v?.replace(/,/g, '') ?? '0')}
                          placeholder="Tùy chọn"
                        />
                      </Form.Item>
                    </Col>
                  )}
                  <Col span={2} style={{ display: 'flex', alignItems: name === 0 ? 'flex-end' : 'center' }}>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(name)}
                      disabled={fields.length === 1}
                    />
                  </Col>
                </Row>
              ))}

              <Form.ErrorList errors={errors} />

              <Button
                type="dashed"
                onClick={() => add({ itemId: undefined, quantity: 1, unit: '', salePrice: undefined })}
                icon={<PlusOutlined />}
                block
                style={{ marginTop: 4 }}
              >
                Thêm mặt hàng
              </Button>
            </>
          )}
        </Form.List>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={handleCancel} disabled={loading}>
            Hủy bỏ
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isRetail ? 'Xuất bán lẻ' : 'Xuất thủ thuật'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ExportRetailForm;
