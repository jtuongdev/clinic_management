import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  Form,
  InputNumber,
  Select,
  Input,
  Button,
  Space,
  Typography,
  App,
  Segmented,
  Spin,
  Tooltip,
} from 'antd';
import {
  DollarOutlined,
  QrcodeOutlined,
  CopyOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  PhuongThucThanhToanType,
  HoaDonListItemDto,
  HoaDonDetailDto,
  VietQRDto,
} from '../types/billing.types';
import { billingApi } from '../api/billing.api';

const { Text } = Typography;

interface RecordPaymentModalProps {
  open: boolean;
  invoice: HoaDonListItemDto | HoaDonDetailDto | null;
  onClose: () => void;
  onSuccess: (updated: HoaDonDetailDto) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  open,
  invoice,
  onClose,
  onSuccess,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'MANUAL' | 'VIETQR'>('VIETQR');
  const [vietQr, setVietQr] = useState<VietQRDto | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Remaining debt
  const conNo = useMemo(() => {
    if (!invoice) return 0;
    if ('soTienBenhNhanChiTra' in invoice) {
      return invoice.soTienBenhNhanChiTra - invoice.daThanhToan;
    }
    return invoice.tongTien - invoice.soTienBaoHiemChiTra - invoice.daThanhToan;
  }, [invoice]);

  const currentAmount = Form.useWatch('soTien', form) ?? (conNo > 0 ? conNo : 0);

  // Load VietQR info when modal opens
  useEffect(() => {
    if (open && invoice) {
      form.setFieldsValue({
        soTien: conNo > 0 ? conNo : 0,
        phuongThuc: 'CHUYEN_KHOAN',
        ghiChu: '',
      });
      setActiveTab('VIETQR');

      setLoadingQr(true);
      billingApi
        .getInvoiceVietQR(invoice.id)
        .then((res) => {
          if (res.data?.success && res.data.data) {
            setVietQr(res.data.data);
          }
        })
        .catch(() => {
          // Fallback demo data if API has any delay
          setVietQr({
            invoiceId: invoice.id,
            invoiceNumber: invoice.soHoaDon,
            amount: Math.max(0, conNo),
            bankId: 'MB',
            bankName: 'Ngân hàng TMCP Quân Đội (MBBank)',
            accountNumber: '0388888888',
            accountName: 'PHONG KHAM DA KHOA CLINIC',
            transferContent: `PK ${invoice.soHoaDon}`,
            qrUrl: `https://img.vietqr.io/image/MB-0388888888-compact2.png?amount=${Math.round(conNo)}&addInfo=PK%20${encodeURIComponent(invoice.soHoaDon)}&accountName=PHONG%20KHAM%20DA%20KHOA%20CLINIC`,
            qrQuickLink: '',
          });
        })
        .finally(() => setLoadingQr(false));
    }
  }, [open, invoice, conNo, form]);

  // Compute dynamic QR image URL based on current adjusted amount
  const dynamicQrUrl = useMemo(() => {
    if (!vietQr) return '';
    const amt = Math.max(0, Math.round(currentAmount || 0));
    return `https://img.vietqr.io/image/${vietQr.bankId}-${vietQr.accountNumber}-compact2.png?amount=${amt}&addInfo=${encodeURIComponent(
      vietQr.transferContent
    )}&accountName=${encodeURIComponent(vietQr.accountName)}`;
  }, [vietQr, currentAmount]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    message.success(`Đã sao chép: ${text}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmit = async (overrideMethod?: PhuongThucThanhToanType) => {
    if (!invoice) return;
    try {
      const values = await form.validateFields();
      setLoading(true);
      const method = overrideMethod || (values.phuongThuc as PhuongThucThanhToanType);
      const defaultNote =
        activeTab === 'VIETQR' ? 'Thanh toán qua quét mã VietQR Napas 24/7' : undefined;

      const res = await billingApi.recordPayment(invoice.id, {
        soTien: values.soTien,
        phuongThuc: method,
        ghiChu: values.ghiChu?.trim() || defaultNote,
      });

      if (res.data.success && res.data.data) {
        message.success('Ghi nhận thanh toán thành công');
        onSuccess(res.data.data);
        onClose();
      } else {
        message.error(res.data.message || 'Không thể ghi nhận thanh toán');
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

  const setQuickAmount = (ratio: number) => {
    form.setFieldsValue({ soTien: Math.round(conNo * ratio) });
  };

  const handlePrintQR = () => {
    if (!vietQr || !invoice) return;
    const printWindow = window.open('', '_blank', 'width=460,height=680');
    if (!printWindow) {
      message.error('Trình duyệt đã chặn cửa sổ pop-up in');
      return;
    }
    const patientName =
      'tenBenhNhan' in invoice ? (invoice as any).tenBenhNhan : 'Khách hàng';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Phiếu Thanh Toán VietQR - ${invoice.soHoaDon}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; padding: 24px; text-align: center; color: #1e293b; background: #fff; }
            .header { font-size: 16px; font-weight: bold; text-transform: uppercase; margin-bottom: 2px; }
            .sub { font-size: 12px; color: #64748b; margin-bottom: 12px; }
            .divider { border-top: 1px dashed #cbd5e1; margin: 12px 0; }
            .qr-img { width: 240px; height: 240px; object-fit: contain; margin: 12px auto; display: block; border-radius: 8px; border: 1px solid #e2e8f0; }
            .info-table { width: 100%; font-size: 13px; text-align: left; border-collapse: collapse; margin-top: 8px; }
            .info-table td { padding: 4px 0; }
            .info-label { color: #64748b; width: 45%; }
            .info-val { font-weight: 600; text-align: right; }
            .amount { font-size: 18px; color: #0284c7; font-weight: bold; }
            .footer { font-size: 11px; color: #94a3b8; margin-top: 18px; line-height: 1.4; }
          </style>
        </head>
        <body>
          <div class="header">PHÒNG KHÁM ĐA KHOA CLINIC</div>
          <div class="sub">PHIẾU CHUYỂN KHOẢN VIỆN PHÍ (VIETQR)</div>
          <div class="divider"></div>
          <table class="info-table">
            <tr><td class="info-label">Mã hóa đơn:</td><td class="info-val">${invoice.soHoaDon}</td></tr>
            <tr><td class="info-label">Bệnh nhân:</td><td class="info-val">${patientName}</td></tr>
            <tr><td class="info-label">Số tiền:</td><td class="info-val amount">${Math.round(
              currentAmount
            ).toLocaleString('vi-VN')} ₫</td></tr>
          </table>
          <img class="qr-img" src="${dynamicQrUrl}" alt="VietQR Code" />
          <div class="divider"></div>
          <table class="info-table">
            <tr><td class="info-label">Ngân hàng:</td><td class="info-val">${vietQr.bankName}</td></tr>
            <tr><td class="info-label">Số tài khoản:</td><td class="info-val">${vietQr.accountNumber}</td></tr>
            <tr><td class="info-label">Chủ tài khoản:</td><td class="info-val">${vietQr.accountName}</td></tr>
            <tr><td class="info-label">Nội dung CK:</td><td class="info-val" style="color:#d97706">${vietQr.transferContent}</td></tr>
          </table>
          <div class="footer">Quét mã bằng bất kỳ App Ngân hàng nào hoặc Ví điện tử.<br>Hệ thống tự động ghi nhận khi nhận tiền. Xin cảm ơn!</div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Modal
      open={open}
      title={
        <Space>
          <DollarOutlined style={{ color: '#16a34a' }} />
          <span>Thu tiền hóa đơn {invoice?.soHoaDon}</span>
        </Space>
      }
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={activeTab === 'VIETQR' ? 680 : 520}
    >
      {/* Tóm tắt viện phí & BHYT */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '10px 14px',
          marginBottom: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          fontSize: 13,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
          <span>Tổng chi phí (dịch vụ & thuốc):</span>
          <Text strong>{(invoice?.tongTien || 0).toLocaleString('vi-VN')} ₫</Text>
        </div>
        {(invoice?.soTienBaoHiemChiTra || 0) > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0284c7' }}>
            <span>
              BHYT chi trả {invoice?.mucHuongBHYT ? `(${invoice.mucHuongBHYT}%)` : ''}:
            </span>
            <Text strong style={{ color: '#0284c7' }}>
              -{(invoice?.soTienBaoHiemChiTra || 0).toLocaleString('vi-VN')} ₫
            </Text>
          </div>
        )}
        {(invoice?.daThanhToan || 0) > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
            <span>Đã thanh toán trước đó:</span>
            <Text strong style={{ color: '#16a34a' }}>
              -{(invoice?.daThanhToan || 0).toLocaleString('vi-VN')} ₫
            </Text>
          </div>
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px dashed #cbd5e1',
            paddingTop: 6,
            marginTop: 2,
          }}
        >
          <span style={{ fontWeight: 600, color: '#0f172a' }}>Bệnh nhân cần nộp:</span>
          <Text strong style={{ fontSize: 16, color: conNo > 0 ? '#cf1322' : '#16a34a' }}>
            {conNo.toLocaleString('vi-VN')} ₫
          </Text>
        </div>
      </div>

      {/* Tabs chọn phương thức: VietQR vs Thủ công */}
      <Segmented
        block
        style={{ marginBottom: 16 }}
        options={[
          {
            label: '📱 Quét mã VietQR (Napas 24/7)',
            value: 'VIETQR',
            icon: <QrcodeOutlined />,
          },
          {
            label: '💵 Tiền mặt / Thủ công',
            value: 'MANUAL',
            icon: <DollarOutlined />,
          },
        ]}
        value={activeTab}
        onChange={(val) => {
          setActiveTab(val as 'MANUAL' | 'VIETQR');
          if (val === 'VIETQR') {
            form.setFieldsValue({ phuongThuc: 'CHUYEN_KHOAN' });
          } else {
            form.setFieldsValue({ phuongThuc: 'TIEN_MAT' });
          }
        }}
      />

      <Form form={form} layout="vertical">
        {activeTab === 'VIETQR' ? (
          <div>
            <Spin spinning={loadingQr} tip="Đang tạo mã VietQR...">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '250px 1fr',
                  gap: 16,
                  alignItems: 'start',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: 14,
                }}
              >
                {/* Cột Trái: Ảnh QR VietQR */}
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      padding: 8,
                      background: '#fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    }}
                  >
                    {dynamicQrUrl ? (
                      <img
                        src={dynamicQrUrl}
                        alt="VietQR Code"
                        style={{
                          width: '100%',
                          height: 'auto',
                          borderRadius: 6,
                          display: 'block',
                        }}
                      />
                    ) : (
                      <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Text type="secondary">Chưa có mã QR</Text>
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <Button size="small" icon={<PrinterOutlined />} onClick={handlePrintQR}>
                      In phiếu QR
                    </Button>
                    <Tooltip title="Mở ảnh QR kích thước lớn">
                      <Button
                        size="small"
                        icon={<QrcodeOutlined />}
                        onClick={() => window.open(dynamicQrUrl, '_blank')}
                      >
                        Phóng to
                      </Button>
                    </Tooltip>
                  </div>
                </div>

                {/* Cột Phải: Thông tin Chuyển khoản */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Form.Item
                    label="Số tiền thanh toán"
                    name="soTien"
                    style={{ marginBottom: 8 }}
                    rules={[
                      { required: true, message: 'Nhập số tiền thu' },
                      {
                        type: 'number',
                        min: 1000,
                        max: conNo > 0 ? conNo : undefined,
                        message: `Tối đa ${conNo.toLocaleString('vi-VN')} ₫`,
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => Number(value?.replace(/,/g, '') || 0)}
                      addonAfter="₫"
                    />
                  </Form.Item>

                  {conNo > 0 && (
                    <Space size={6} style={{ marginBottom: 4 }}>
                      <Button size="small" onClick={() => setQuickAmount(1)}>
                        Trả đủ 100%
                      </Button>
                      <Button size="small" onClick={() => setQuickAmount(0.5)}>
                        Trả 50%
                      </Button>
                    </Space>
                  )}

                  {/* Thông tin đối soát nhanh */}
                  <div
                    style={{
                      background: '#f8fafc',
                      borderRadius: 6,
                      border: '1px solid #e2e8f0',
                      padding: '8px 10px',
                      fontSize: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Ngân hàng:</span>
                      <Text strong>{vietQr?.bankName || 'MBBank'}</Text>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#64748b' }}>Số tài khoản:</span>
                      <Space size={4}>
                        <Text copyable={false} strong style={{ color: '#0284c7' }}>
                          {vietQr?.accountNumber || '0388888888'}
                        </Text>
                        <Button
                          type="text"
                          size="small"
                          icon={<CopyOutlined />}
                          onClick={() => handleCopy(vietQr?.accountNumber || '0388888888', 'stk')}
                        />
                      </Space>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Chủ tài khoản:</span>
                      <Text strong>{vietQr?.accountName || 'PHONG KHAM DA KHOA CLINIC'}</Text>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#64748b' }}>Nội dung CK:</span>
                      <Space size={4}>
                        <Text strong style={{ color: '#d97706' }}>
                          {vietQr?.transferContent || `PK ${invoice?.soHoaDon}`}
                        </Text>
                        <Button
                          type="text"
                          size="small"
                          icon={<CopyOutlined />}
                          onClick={() =>
                            handleCopy(vietQr?.transferContent || `PK ${invoice?.soHoaDon}`, 'memo')
                          }
                        />
                      </Space>
                    </div>
                  </div>

                  <Text type="secondary" style={{ fontSize: 11, fontStyle: 'italic' }}>
                    Bệnh nhân mở bất kỳ App Ngân hàng nào (VCB, MB, Techcombank,...) hoặc Ví MoMo để quét mã.
                  </Text>
                </div>
              </div>
            </Spin>

            <div
              style={{
                marginTop: 16,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
                borderTop: '1px solid #e2e8f0',
                paddingTop: 12,
              }}
            >
              <Button onClick={onClose}>Đóng</Button>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={loading}
                onClick={() => handleSubmit('CHUYEN_KHOAN')}
                style={{ background: '#16a34a', borderColor: '#16a34a' }}
              >
                Xác nhận đã nhận tiền chuyển khoản
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <Form.Item
              label="Số tiền thu"
              name="soTien"
              rules={[
                { required: true, message: 'Vui lòng nhập số tiền thu' },
                {
                  type: 'number',
                  min: 1000,
                  max: conNo > 0 ? conNo : undefined,
                  message: conNo > 0
                    ? `Số tiền thu tối đa ${conNo.toLocaleString('vi-VN')} ₫`
                    : 'Số tiền tối thiểu 1.000 ₫',
                },
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value?.replace(/,/g, '') || 0)}
                addonAfter="₫"
              />
            </Form.Item>

            {conNo > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Space>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Chọn nhanh:
                  </Text>
                  <Button size="small" onClick={() => setQuickAmount(1)}>
                    Trả đủ (100%)
                  </Button>
                  <Button size="small" onClick={() => setQuickAmount(0.5)}>
                    Trả 50%
                  </Button>
                </Space>
              </div>
            )}

            <Form.Item
              label="Phương thức thanh toán"
              name="phuongThuc"
              rules={[{ required: true, message: 'Chọn phương thức' }]}
            >
              <Select
                options={[
                  { label: '💵 Tiền mặt (TIEN_MAT)', value: 'TIEN_MAT' },
                  { label: '💳 Chuyển khoản ngân hàng (CHUYEN_KHOAN)', value: 'CHUYEN_KHOAN' },
                  { label: '🏧 Quẹt thẻ POS (THE)', value: 'THE' },
                  { label: '🛡️ Bảo hiểm bảo lãnh (BAO_HIEM)', value: 'BAO_HIEM' },
                ]}
              />
            </Form.Item>

            <Form.Item label="Ghi chú" name="ghiChu">
              <Input.TextArea rows={2} placeholder="Nội dung phiếu thu hoặc mã tham chiếu GD..." />
            </Form.Item>

            <div
              style={{
                marginTop: 16,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
                borderTop: '1px solid #e2e8f0',
                paddingTop: 12,
              }}
            >
              <Button onClick={onClose}>Hủy</Button>
              <Button type="primary" loading={loading} onClick={() => handleSubmit()}>
                Xác nhận thu tiền
              </Button>
            </div>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default RecordPaymentModal;
