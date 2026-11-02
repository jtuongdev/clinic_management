import React, { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, Typography, Alert, App, Tag, Space, Button, Card, Divider } from 'antd';
import {
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalculatorOutlined,
  ThunderboltOutlined,
  UndoOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { HoaDonListItemDto, HoaDonDetailDto } from '../types/billing.types';
import { billingApi } from '../api/billing.api';

const { Text } = Typography;

interface ApplyInsuranceModalProps {
  open: boolean;
  invoice: HoaDonListItemDto | HoaDonDetailDto | null;
  onClose: () => void;
  onSuccess: (updated: HoaDonDetailDto) => void;
}

export const ApplyInsuranceModal: React.FC<ApplyInsuranceModalProps> = ({
  open,
  invoice,
  onClose,
  onSuccess,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const watchedBaoHiem = Form.useWatch('soTienBaoHiem', form) ?? 0;
  const tongTien = invoice?.tongTien ?? 0;

  const hasInsurance = !!invoice?.soTheBHYT;
  const isExpired = invoice?.bhytConHan === false;
  const mucHuong = invoice?.mucHuongBHYT ?? 0;

  // Tính số tiền đề xuất theo % mức hưởng BHYT
  const suggestedAmount = hasInsurance && !isExpired && mucHuong > 0
    ? Math.round(tongTien * (mucHuong / 100))
    : 0;

  useEffect(() => {
    if (open && invoice) {
      // Nếu hóa đơn đã có tiền bảo hiểm thì dùng lại, nếu chưa mà có BHYT hợp lệ thì tự động đề xuất
      const initialAmount = invoice.soTienBaoHiemChiTra > 0
        ? invoice.soTienBaoHiemChiTra
        : (hasInsurance && !isExpired ? suggestedAmount : 0);

      form.setFieldsValue({
        soTienBaoHiem: initialAmount,
      });
    }
  }, [open, invoice, hasInsurance, isExpired, suggestedAmount, form]);

  const handleApplyCardRate = () => {
    form.setFieldsValue({ soTienBaoHiem: suggestedAmount });
  };

  const handleApplyFull = () => {
    form.setFieldsValue({ soTienBaoHiem: tongTien });
  };

  const handleResetZero = () => {
    form.setFieldsValue({ soTienBaoHiem: 0 });
  };

  const handleSubmit = async () => {
    if (!invoice) return;
    try {
      const values = await form.validateFields();
      setLoading(true);
      const res = await billingApi.applyInsurance(invoice.id, {
        soTienBaoHiem: values.soTienBaoHiem,
      });

      if (res.data.success && res.data.data) {
        message.success('Áp dụng khấu trừ BHYT / Bảo hiểm thành công');
        onSuccess(res.data.data);
        onClose();
      } else {
        message.error(res.data.message || 'Lỗi khi áp dụng bảo hiểm');
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

  const patientPay = Math.max(0, tongTien - (watchedBaoHiem || 0));

  return (
    <Modal
      open={open}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SafetyCertificateOutlined style={{ color: '#0284c7', fontSize: 18 }} />
          <span>Áp dụng BHYT & Giảm trừ viện phí ({invoice?.soHoaDon})</span>
        </div>
      }
      onCancel={onClose}
      onOk={handleSubmit}
      okText="Lưu & Khấu trừ BHYT"
      cancelText="Đóng"
      confirmLoading={loading}
      destroyOnHidden
      width={560}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Thông tin thẻ BHYT của bệnh nhân */}
        {hasInsurance ? (
          <Card
            size="small"
            style={{
              background: isExpired ? '#fff1f0' : '#f0fdf4',
              borderColor: isExpired ? '#ffa39e' : '#bbf7d0',
              borderRadius: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <Space align="center" style={{ marginBottom: 4 }}>
                  <IdcardOutlined style={{ color: isExpired ? '#cf1322' : '#15803d', fontSize: 16 }} />
                  <Text strong style={{ fontSize: 14 }}>
                    Thẻ BHYT: {invoice?.soTheBHYT}
                  </Text>
                  {isExpired ? (
                    <Tag color="error" icon={<CloseCircleOutlined />}>
                      Đã hết hạn
                    </Tag>
                  ) : (
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                      Còn hiệu lực
                    </Tag>
                  )}
                  <Tag color="processing" style={{ fontWeight: 600 }}>
                    Mức hưởng: {mucHuong}%
                  </Tag>
                </Space>
                <div style={{ fontSize: 12, color: '#4b5563' }}>
                  <span>Nhà cung cấp: <strong>{invoice?.tenNhaCungCapBHYT || 'Bảo hiểm Xã hội VN'}</strong></span>
                  {invoice?.ngayKetThucBHYT && (
                    <span style={{ marginLeft: 12 }}>
                      Hạn dùng:{' '}
                      <strong style={{ color: isExpired ? '#dc2626' : '#166534' }}>
                        {dayjs(invoice.ngayKetThucBHYT).format('DD/MM/YYYY')}
                      </strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {isExpired && (
              <Alert
                type="error"
                showIcon
                style={{ marginTop: 10, fontSize: 12, padding: '6px 12px' }}
                message="Thẻ BHYT của bệnh nhân đã hết hạn sử dụng. Không đủ điều kiện hưởng BHYT tự động theo quy định."
              />
            )}
          </Card>
        ) : (
          <Alert
            type="info"
            showIcon
            message="Bệnh nhân chưa có thẻ BHYT lưu trong hệ thống"
            description="Thu ngân có thể tự nhập số tiền bảo lãnh viện phí ngoài hoặc miễn giảm theo chính sách phòng khám."
          />
        )}

        {/* Nút bấm gán nhanh số tiền */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 6 }}>
            Công cụ tính nhanh viện phí BHYT:
          </div>
          <Space wrap>
            {hasInsurance && (
              <Button
                size="small"
                icon={<CalculatorOutlined />}
                disabled={isExpired || mucHuong <= 0}
                onClick={handleApplyCardRate}
                style={{ borderColor: '#0284c7', color: '#0284c7' }}
              >
                Theo thẻ ({mucHuong}% = {suggestedAmount.toLocaleString('vi-VN')} ₫)
              </Button>
            )}
            <Button
              size="small"
              icon={<ThunderboltOutlined />}
              onClick={handleApplyFull}
              style={{ borderColor: '#16a34a', color: '#16a34a' }}
            >
              100% Viện phí ({tongTien.toLocaleString('vi-VN')} ₫)
            </Button>
            <Button
              size="small"
              icon={<UndoOutlined />}
              onClick={handleResetZero}
            >
              Bỏ khấu trừ (0 ₫)
            </Button>
          </Space>
        </div>

        <Divider style={{ margin: '4px 0' }} />

        {/* Form nhập số tiền bảo hiểm */}
        <Form form={form} layout="vertical">
          <Form.Item
            label={
              <span style={{ fontWeight: 600 }}>
                Số tiền BHYT / Bảo hiểm chi trả (VNĐ)
              </span>
            }
            name="soTienBaoHiem"
            rules={[
              { required: true, message: 'Vui lòng nhập số tiền bảo hiểm' },
              {
                type: 'number',
                min: 0,
                max: tongTien,
                message: `Số tiền chi trả không được vượt quá tổng hóa đơn (${tongTien.toLocaleString('vi-VN')} ₫)`,
              },
            ]}
          >
            <InputNumber
              style={{ width: '100%', fontSize: 16 }}
              size="large"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number(value?.replace(/,/g, '') || 0)}
              addonAfter="₫"
              placeholder="Nhập số tiền BHYT chi trả"
            />
          </Form.Item>
        </Form>

        {/* Tóm tắt phân bổ chi phí trực quan */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: '#64748b' }}>Tổng chi phí dịch vụ & thuốc:</span>
            <Text strong>{tongTien.toLocaleString('vi-VN')} ₫</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: '#0284c7' }}>BHYT / Bảo lãnh chi trả (-):</span>
            <Text strong style={{ color: '#0284c7' }}>
              {(watchedBaoHiem || 0).toLocaleString('vi-VN')} ₫
            </Text>
          </div>
          <Divider style={{ margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15 }}>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>Bệnh nhân thực trả:</span>
            <Text strong style={{ color: patientPay > 0 ? '#dc2626' : '#16a34a', fontSize: 16 }}>
              {patientPay.toLocaleString('vi-VN')} ₫
            </Text>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ApplyInsuranceModal;
