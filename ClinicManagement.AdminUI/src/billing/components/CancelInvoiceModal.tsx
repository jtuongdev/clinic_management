import React, { useState } from 'react';
import { Modal, Form, Input, Alert, Typography, App } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { HoaDonListItemDto, HoaDonDetailDto } from '../types/billing.types';
import { billingApi } from '../api/billing.api';

const { Text } = Typography;

interface CancelInvoiceModalProps {
  open: boolean;
  invoice: HoaDonListItemDto | HoaDonDetailDto | null;
  onClose: () => void;
  onSuccess: (updated: HoaDonDetailDto) => void;
}

export const CancelInvoiceModal: React.FC<CancelInvoiceModalProps> = ({
  open,
  invoice,
  onClose,
  onSuccess,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const daThu = invoice?.daThanhToan ?? 0;
  const canCancel = daThu === 0 && invoice?.trangThai !== 'DA_HUY';

  const handleSubmit = async () => {
    if (!invoice) return;
    try {
      const values = await form.validateFields();
      setLoading(true);
      const res = await billingApi.cancelInvoice(invoice.id, {
        lyDoHuy: values.lyDoHuy?.trim(),
      });

      if (res.data.success && res.data.data) {
        message.success('Đã hủy hóa đơn thành công');
        onSuccess(res.data.data);
        onClose();
      } else {
        message.error(res.data.message || 'Không thể hủy hóa đơn');
      }
    } catch (err: any) {
      if (err?.response?.data?.message) {
        message.error(err.response.data.message);
      } else if (err?.message && !err?.errorFields) {
        message.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={
        <span style={{ color: '#cf1322' }}>
          <ExclamationCircleOutlined style={{ marginRight: 8 }} />
          Hủy hóa đơn {invoice?.soHoaDon}
        </span>
      }
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Xác nhận hủy"
      okButtonProps={{ danger: true, disabled: !canCancel }}
      cancelText="Đóng"
      confirmLoading={loading}
      destroyOnHidden
      width={480}
    >
      {!canCancel ? (
        <Alert
          type="error"
          showIcon
          message="Không thể hủy hóa đơn này"
          description={
            invoice?.trangThai === 'DA_HUY'
              ? 'Hóa đơn này đã được hủy trước đó.'
              : `Hóa đơn đã có phát sinh thanh toán (${daThu.toLocaleString('vi-VN')} ₫). Theo quy định tài chính, không thể hủy trực tiếp.`
          }
        />
      ) : (
        <>
          <Alert
            type="warning"
            showIcon
            message="Cảnh báo thao tác hủy hóa đơn"
            description={
              <div>
                Thao tác hủy hóa đơn <Text strong>{invoice?.soHoaDon}</Text> không thể hoàn tác.
              </div>
            }
            style={{ marginBottom: 16 }}
          />

          <Form form={form} layout="vertical">
            <Form.Item
              label="Lý do hủy hóa đơn"
              name="lyDoHuy"
              rules={[{ required: true, message: 'Vui lòng nhập lý do hủy hóa đơn' }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Nhập lý do bác sĩ hủy chỉ định, bệnh nhân không tiếp tục khám..."
              />
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
};

export default CancelInvoiceModal;
