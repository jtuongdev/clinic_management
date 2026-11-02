import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Table,
  Tag,
  Space,
  Typography,
  Divider,
  Descriptions,
  Spin,
  Checkbox,
  message,
  Card,
  Row,
  Col,
  Tooltip,
  Alert,
} from 'antd';
import {
  ExperimentOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  SaveOutlined,
  PictureOutlined,
  LinkOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { examinationApi } from '../../api/examination.api';
import type {
  ChiDinhDichVuChiTietDto,
  ChiTietKetQuaItemRequest,
  NhapKetQuaChiDinhRequest,
} from '../../type/examination.types';

const { Text } = Typography;

interface NhapKetQuaModalProps {
  visible: boolean;
  chiDinhId: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const NhapKetQuaModal: React.FC<NhapKetQuaModalProps> = ({
  visible,
  chiDinhId,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detail, setDetail] = useState<ChiDinhDichVuChiTietDto | null>(null);
  const [indicators, setIndicators] = useState<ChiTietKetQuaItemRequest[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Tải chi tiết chỉ định và kết quả hiện tại
  useEffect(() => {
    if (!visible || !chiDinhId) {
      setDetail(null);
      setIndicators([]);
      form.resetFields();
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await examinationApi.getChiDinhChiTiet(chiDinhId);
        if (res.data?.success && res.data.data) {
          const d = res.data.data;
          setDetail(d);
          form.setFieldsValue({
            ketLuan: d.ketLuan || '',
            urlKetQua: d.urlKetQua || '',
          });

          if (d.chiTietKetQuas && d.chiTietKetQuas.length > 0) {
            setIndicators(
              d.chiTietKetQuas.map((x) => ({
                tenChiSo: x.tenChiSo,
                giaTri: x.giaTri,
                donVi: x.donVi,
                khoangThamChieu: x.khoangThamChieu,
                batThuong: x.batThuong,
              }))
            );
          } else {
            // Khởi tạo 1 dòng trống mặc định nếu là xét nghiệm
            const isLab = (d.loaiDichVu || '').toLowerCase().includes('xetnghiem');
            if (isLab) {
              setIndicators([
                { tenChiSo: '', giaTri: '', donVi: '', khoangThamChieu: '', batThuong: false },
              ]);
            } else {
              setIndicators([]);
            }
          }
        } else {
          message.error('Không thể tải chi tiết chỉ định CLS');
        }
      } catch (err: any) {
        message.error(err?.message || 'Lỗi khi tải chi tiết chỉ định');
      } finally {
        setLoading(false);
      }
    };

    void fetchDetail();
  }, [visible, chiDinhId, form]);

  const isLab = (detail?.loaiDichVu || '').toLowerCase().includes('xetnghiem');

  // Thêm dòng chỉ số xét nghiệm
  const handleAddIndicator = () => {
    setIndicators((prev) => [
      ...prev,
      { tenChiSo: '', giaTri: '', donVi: '', khoangThamChieu: '', batThuong: false },
    ]);
  };

  // Cập nhật giá trị dòng chỉ số
  const handleIndicatorChange = (
    index: number,
    field: keyof ChiTietKetQuaItemRequest,
    val: any
  ) => {
    setIndicators((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };

      // Tự động kiểm tra bất thường nếu thay đổi giá trị và có khoảng tham chiếu dạng "min - max"
      if (field === 'giaTri' || field === 'khoangThamChieu') {
        const item = next[index];
        const numVal = parseFloat(item.giaTri);
        if (!isNaN(numVal) && item.khoangThamChieu) {
          const parts = item.khoangThamChieu.split('-').map((p) => parseFloat(p.trim()));
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            const isAbnormal = numVal < parts[0] || numVal > parts[1];
            next[index].batThuong = isAbnormal;
          }
        }
      }

      return next;
    });
  };

  // Xóa dòng chỉ số
  const handleRemoveIndicator = (index: number) => {
    setIndicators((prev) => prev.filter((_, i) => i !== index));
  };

  // Lưu kết quả (Hoàn thành hoặc Lưu nháp)
  const handleSubmit = async (isComplete: boolean) => {
    if (!chiDinhId) return;

    try {
      const values = await form.validateFields();
      if (isComplete && !values.ketLuan?.trim()) {
        message.warning('Vui lòng nhập kết luận trước khi duyệt hoàn thành kết quả.');
        return;
      }

      setSubmitting(true);

      const validIndicators = indicators
        .filter((x) => x.tenChiSo.trim())
        .map((x) => ({
          ...x,
          tenChiSo: x.tenChiSo.trim(),
          giaTri: x.giaTri.trim(),
          donVi: x.donVi.trim(),
          khoangThamChieu: x.khoangThamChieu.trim(),
          batThuong: !!x.batThuong,
        }));

      const payload: NhapKetQuaChiDinhRequest = {
        ketLuan: values.ketLuan,
        urlKetQua: values.urlKetQua,
        hoanThanh: isComplete,
        chiTietKetQuas: validIndicators,
      };

      const res = await examinationApi.nhapKetQuaChiDinh(chiDinhId, payload);
      if (res.data?.success) {
        message.success(
          isComplete
            ? 'Đã duyệt và hoàn thành trả kết quả cận lâm sàng!'
            : 'Đã lưu kết quả cận lâm sàng thành công!'
        );
        onSuccess();
        onClose();
      } else {
        message.error(res.data?.message || 'Không thể lưu kết quả');
      }
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || 'Có lỗi xảy ra khi lưu kết quả');
    } finally {
      setSubmitting(false);
    }
  };

  const indicatorColumns: ColumnsType<ChiTietKetQuaItemRequest> = [
    {
      title: '#',
      key: 'idx',
      width: 50,
      align: 'center',
      render: (_, __, idx) => idx + 1,
    },
    {
      title: 'Tên chỉ số xét nghiệm',
      dataIndex: 'tenChiSo',
      key: 'tenChiSo',
      render: (val, _, idx) => (
        <Input
          placeholder="VD: Glucose, Bạch cầu..."
          value={val}
          onChange={(e) => handleIndicatorChange(idx, 'tenChiSo', e.target.value)}
        />
      ),
    },
    {
      title: 'Kết quả đo',
      dataIndex: 'giaTri',
      key: 'giaTri',
      width: 130,
      render: (val, record, idx) => (
        <Input
          placeholder="VD: 5.6"
          value={val}
          style={{
            color: record.batThuong ? '#dc2626' : undefined,
            fontWeight: record.batThuong ? 700 : 400,
          }}
          onChange={(e) => handleIndicatorChange(idx, 'giaTri', e.target.value)}
        />
      ),
    },
    {
      title: 'Đơn vị',
      dataIndex: 'donVi',
      key: 'donVi',
      width: 110,
      render: (val, _, idx) => (
        <Input
          placeholder="mmol/L"
          value={val}
          onChange={(e) => handleIndicatorChange(idx, 'donVi', e.target.value)}
        />
      ),
    },
    {
      title: 'Khoảng tham chiếu',
      dataIndex: 'khoangThamChieu',
      key: 'khoangThamChieu',
      width: 140,
      render: (val, _, idx) => (
        <Input
          placeholder="VD: 3.9 - 6.4"
          value={val}
          onChange={(e) => handleIndicatorChange(idx, 'khoangThamChieu', e.target.value)}
        />
      ),
    },
    {
      title: 'Cảnh báo',
      dataIndex: 'batThuong',
      key: 'batThuong',
      width: 110,
      align: 'center',
      render: (val, _, idx) => (
        <Checkbox
          checked={val}
          onChange={(e) => handleIndicatorChange(idx, 'batThuong', e.target.checked)}
        >
          {val ? <Tag color="error">Bất thường</Tag> : <Text type="secondary">Bình thường</Text>}
        </Checkbox>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 50,
      align: 'center',
      render: (_, __, idx) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveIndicator(idx)}
        />
      ),
    },
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ExperimentOutlined style={{ color: '#0b4f6c', fontSize: 20 }} />
            <span>
              Nhập kết quả cận lâm sàng: <Text strong style={{ color: '#0b4f6c' }}>{detail?.tenDichVu}</Text>
            </span>
          </div>
          <Tooltip title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Mở toàn màn hình'}>
            <Button
              type="text"
              icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={() => setIsFullscreen(!isFullscreen)}
            />
          </Tooltip>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={isFullscreen ? '100vw' : 1000}
      style={
        isFullscreen
          ? { top: 0, maxWidth: '100vw', padding: 0, margin: 0 }
          : { top: 20 }
      }
      bodyStyle={{
        height: isFullscreen ? 'calc(100vh - 115px)' : 'calc(85vh - 120px)',
        overflowY: 'auto',
        padding: isFullscreen ? '16px 28px' : '16px',
      }}
      destroyOnClose
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {detail?.trangThai && (
              <Tag color={detail.trangThai === 'DaCoKetQua' ? 'success' : 'processing'}>
                Trạng thái: {detail.trangThai === 'DaCoKetQua' ? 'Đã có kết quả' : detail.trangThai}
              </Tag>
            )}
          </div>
          <Space>
            <Button onClick={onClose} disabled={submitting}>
              Đóng
            </Button>
            <Button
              icon={<SaveOutlined />}
              onClick={() => void handleSubmit(false)}
              loading={submitting}
            >
              Lưu nháp
            </Button>
            <Button
              type="primary"
              style={{ background: '#10b981', borderColor: '#10b981' }}
              icon={<CheckCircleOutlined />}
              onClick={() => void handleSubmit(true)}
              loading={submitting}
            >
              Duyệt & Trả kết quả (Hoàn thành)
            </Button>
          </Space>
        </div>
      }
    >
      <Spin spinning={loading}>
        {detail && (
          <div style={{ marginTop: 8 }}>
            {/* Patient & Order Header Strip */}
            <Card
              size="small"
              style={{ background: '#f8fafc', borderColor: '#e2e8f0', marginBottom: 16 }}
            >
              <Row gutter={[16, 8]}>
                <Col span={8}>
                  <Text type="secondary">Bệnh nhân: </Text>
                  <Text strong style={{ color: '#0b4f6c' }}>{detail.tenBenhNhan}</Text> (
                  {detail.gioiTinh}
                  {detail.tuoi ? `, ${detail.tuoi} tuổi` : ''})
                </Col>
                <Col span={8}>
                  <Text type="secondary">Mã y tế: </Text>
                  <Text strong>{detail.maBenhNhanNoiBo || `BN-${detail.maBenhNhan}`}</Text>
                </Col>
                <Col span={8}>
                  <Text type="secondary">Bác sĩ chỉ định: </Text>
                  <Text strong>{detail.tenBacSiChiDinh}</Text> ({detail.tenKhoa})
                </Col>
                <Col span={8}>
                  <Text type="secondary">Dịch vụ: </Text>
                  <Text strong>{detail.tenDichVu}</Text>
                </Col>
                <Col span={8}>
                  <Text type="secondary">Phân loại: </Text>
                  <Tag color="blue">{detail.loaiDichVu || 'Cận lâm sàng'}</Tag>
                </Col>
                <Col span={8}>
                  <Text type="secondary">Chẩn đoán sơ bộ: </Text>
                  <Text italic>{detail.chanDoanSoBo || 'Chưa ghi nhận'}</Text>
                </Col>
              </Row>
            </Card>

            {/* Banner hiển thị vật tư tiêu hao sẽ được xuất kho */}
            {detail.vatTuSuDungs && detail.vatTuSuDungs.length > 0 && (
              <Alert
                style={{ marginBottom: 16 }}
                type="info"
                showIcon
                icon={<MedicineBoxOutlined />}
                message={
                  <span>
                    <strong>Vật tư tiêu hao tự động: </strong>
                    Dịch vụ này gắn với {detail.vatTuSuDungs.length} mục vật tư định mức (
                    {detail.vatTuSuDungs
                      .map((x) => `${x.tenVatTu}: ${x.soLuongDinhMuc} ${x.donViTinh}`)
                      .join(', ')}
                    ). Hệ thống sẽ tự động xuất kho nội bộ (PX-VT) khi bấm Duyệt hoàn thành.
                  </span>
                }
              />
            )}

            <Form form={form} layout="vertical">
              {/* PHÂN NHÁNH 1: BẢNG CHỈ SỐ XÉT NGHIỆM */}
              {isLab ? (
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <Text strong style={{ fontSize: 14 }}>
                      <ExperimentOutlined style={{ marginRight: 6, color: '#0b4f6c' }} />
                      Bảng chỉ số đo lường xét nghiệm
                    </Text>
                    <Button
                      type="dashed"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={handleAddIndicator}
                    >
                      Thêm chỉ số
                    </Button>
                  </div>
                  <Table
                    dataSource={indicators.map((item, idx) => ({ ...item, key: idx }))}
                    columns={indicatorColumns}
                    pagination={false}
                    size="small"
                    bordered
                  />
                </div>
              ) : (
                /* PHÂN NHÁNH 2: CHẨN ĐOÁN HÌNH ẢNH / CẬN LÂM SÀNG KHÁC */
                <div style={{ marginBottom: 16 }}>
                  <Form.Item
                    name="urlKetQua"
                    label={
                      <span>
                        <PictureOutlined style={{ marginRight: 6, color: '#0b4f6c' }} />
                        Đường dẫn hình ảnh / File kết quả PACS (URL)
                      </span>
                    }
                  >
                    <Input
                      placeholder="https://pacs.clinic.com/viewer/study-12345..."
                      addonAfter={
                        form.getFieldValue('urlKetQua') ? (
                          <a
                            href={form.getFieldValue('urlKetQua')}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <LinkOutlined /> Mở xem
                          </a>
                        ) : null
                      }
                    />
                  </Form.Item>
                </div>
              )}

              <Divider style={{ margin: '12px 0' }} />

              {/* KẾT LUẬN CHUNG CỦA BÁC SĨ / KTV */}
              <Form.Item
                name="ketLuan"
                label={
                  <Text strong style={{ fontSize: 14 }}>
                    Kết luận cận lâm sàng & Lời dặn chuyên môn
                  </Text>
                }
                rules={[{ required: true, message: 'Vui lòng nhập kết luận cận lâm sàng' }]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Nhập kết luận đánh giá chuyên môn của xét nghiệm / chẩn đoán hình ảnh..."
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Spin>
    </Modal>
  );
};
