import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Table,
  Tag,
  Space,
  Typography,
  Divider,
  Spin,
  Checkbox,
  message,
  Card,
  Row,
  Col,
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
  MedicineBoxOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate, useParams } from 'react-router-dom';
import { examinationApi } from '../api/examination.api';
import type {
  ChiDinhDichVuChiTietDto,
  ChiTietKetQuaItemRequest,
  NhapKetQuaChiDinhRequest,
} from '../type/examination.types';

const { Text, Title } = Typography;

const NhapKetQuaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const chiDinhId = id ? parseInt(id, 10) : null;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detail, setDetail] = useState<ChiDinhDichVuChiTietDto | null>(null);
  const [indicators, setIndicators] = useState<ChiTietKetQuaItemRequest[]>([]);

  // Tải chi tiết chỉ định và kết quả hiện tại
  useEffect(() => {
    if (!chiDinhId) return;

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
            const isLab = (d.loaiDichVu || '').toLowerCase().includes('xetnghiem');
            if (isLab) {
              setIndicators([
                { tenChiSo: '', giaTri: '', donVi: '', khoangThamChieu: '', batThuong: false },
              ]);
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
  }, [chiDinhId, form]);

  const isLab = (detail?.loaiDichVu || '').toLowerCase().includes('xetnghiem');

  const handleAddIndicator = () => {
    setIndicators((prev) => [
      ...prev,
      { tenChiSo: '', giaTri: '', donVi: '', khoangThamChieu: '', batThuong: false },
    ]);
  };

  const handleIndicatorChange = (
    index: number,
    field: keyof ChiTietKetQuaItemRequest,
    val: any
  ) => {
    setIndicators((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };

      if (field === 'giaTri' || field === 'khoangThamChieu') {
        const item = next[index];
        const numVal = parseFloat(item.giaTri);
        if (!isNaN(numVal) && item.khoangThamChieu) {
          const parts = item.khoangThamChieu.split('-').map((p) => parseFloat(p.trim()));
          if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            next[index].batThuong = numVal < parts[0] || numVal > parts[1];
          }
        }
      }

      return next;
    });
  };

  const handleRemoveIndicator = (index: number) => {
    setIndicators((prev) => prev.filter((_, i) => i !== index));
  };

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
        navigate('/examination/cls');
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
      width: 150,
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
      width: 120,
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
      width: 160,
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
      width: 130,
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
      width: 52,
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        background: '#f8fafc',
      }}
    >
      {/* ── Top Header Bar ── */}
      <div
        style={{
          height: 52,
          minHeight: 52,
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        {/* Left: Back + Title */}
        <Space size="middle" align="center">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/examination/cls')}
            disabled={submitting}
          >
            Quay lại danh sách CLS
          </Button>
          <Divider type="vertical" style={{ height: 20, margin: 0 }} />
          <Space align="center" size={8}>
            <ExperimentOutlined style={{ color: '#0b4f6c', fontSize: 20 }} />
            <div>
              <Title level={5} style={{ margin: 0, lineHeight: 1.2, fontSize: 14 }}>
                Nhập kết quả cận lâm sàng
              </Title>
              {detail && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {detail.tenDichVu} — {detail.tenBenhNhan}
                </Text>
              )}
            </div>
          </Space>
        </Space>

        {/* Right: Status + Action Buttons */}
        <Space size="small">
          {detail?.trangThai && (
            <Tag
              color={detail.trangThai === 'DaCoKetQua' ? 'success' : 'processing'}
              style={{ fontSize: 12 }}
            >
              {detail.trangThai === 'DaCoKetQua' ? '✅ Đã có kết quả' : '🔄 Đang xử lý'}
            </Tag>
          )}
          <Button
            onClick={() => navigate('/examination/cls')}
            disabled={submitting}
          >
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
            Duyệt &amp; Trả kết quả
          </Button>
        </Space>
      </div>

      {/* ── Main Content Area ── */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 24px' }}>
        <Spin spinning={loading}>
          {detail && (
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              {/* Patient Info Card */}
              <Card
                size="small"
                style={{
                  background: '#fff',
                  borderColor: '#e2e8f0',
                  marginBottom: 16,
                  borderRadius: 8,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
                bodyStyle={{ padding: '12px 16px' }}
              >
                <Row gutter={[24, 8]} align="middle">
                  <Col span={8}>
                    <Space direction="vertical" size={0}>
                      <Text type="secondary" style={{ fontSize: 11 }}>Bệnh nhân</Text>
                      <Text strong style={{ color: '#0b4f6c', fontSize: 14 }}>
                        {detail.tenBenhNhan}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#64748b' }}>
                        {detail.gioiTinh}{detail.tuoi ? ` · ${detail.tuoi} tuổi` : ''}
                      </Text>
                    </Space>
                  </Col>
                  <Col span={5}>
                    <Space direction="vertical" size={0}>
                      <Text type="secondary" style={{ fontSize: 11 }}>Mã y tế</Text>
                      <Text strong style={{ fontSize: 13 }}>
                        {detail.maBenhNhanNoiBo || `BN-${detail.maBenhNhan}`}
                      </Text>
                    </Space>
                  </Col>
                  <Col span={6}>
                    <Space direction="vertical" size={0}>
                      <Text type="secondary" style={{ fontSize: 11 }}>Bác sĩ chỉ định</Text>
                      <Text strong style={{ fontSize: 13 }}>{detail.tenBacSiChiDinh}</Text>
                      <Text style={{ fontSize: 12, color: '#64748b' }}>{detail.tenKhoa}</Text>
                    </Space>
                  </Col>
                  <Col span={5}>
                    <Space direction="vertical" size={0}>
                      <Text type="secondary" style={{ fontSize: 11 }}>Dịch vụ</Text>
                      <Text strong style={{ fontSize: 13 }}>{detail.tenDichVu}</Text>
                      <Tag color="blue" style={{ fontSize: 11, marginTop: 2 }}>
                        {detail.loaiDichVu || 'Cận lâm sàng'}
                      </Tag>
                    </Space>
                  </Col>
                </Row>
                {detail.chanDoanSoBo && (
                  <>
                    <Divider style={{ margin: '10px 0' }} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Chẩn đoán sơ bộ:{' '}
                      <Text italic style={{ fontSize: 12 }}>{detail.chanDoanSoBo}</Text>
                    </Text>
                  </>
                )}
              </Card>

              {/* Vật tư tiêu hao banner */}
              {detail.vatTuSuDungs && detail.vatTuSuDungs.length > 0 && (
                <Alert
                  style={{ marginBottom: 16, borderRadius: 8 }}
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

              {/* Form nhập kết quả */}
              <Card
                style={{
                  borderRadius: 8,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  borderColor: '#e2e8f0',
                }}
                bodyStyle={{ padding: '20px 24px' }}
              >
                <Form form={form} layout="vertical">
                  {/* PHÂN NHÁNH 1: BẢNG CHỈ SỐ XÉT NGHIỆM */}
                  {isLab ? (
                    <div style={{ marginBottom: 20 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 12,
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
                      <Table<ChiTietKetQuaItemRequest>
                        dataSource={indicators.map((item, idx) => ({ ...item, key: idx }))}
                        columns={indicatorColumns}
                        pagination={false}
                        size="small"
                        bordered
                      />
                    </div>
                  ) : (
                    /* PHÂN NHÁNH 2: CHẨN ĐOÁN HÌNH ẢNH / CẬN LÂM SÀNG KHÁC */
                    <div style={{ marginBottom: 20 }}>
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

                  {/* KẾT LUẬN CHUNG */}
                  <Form.Item
                    name="ketLuan"
                    label={
                      <Text strong style={{ fontSize: 14 }}>
                        Kết luận cận lâm sàng &amp; Lời dặn chuyên môn
                      </Text>
                    }
                    rules={[{ required: true, message: 'Vui lòng nhập kết luận cận lâm sàng' }]}
                  >
                    <Input.TextArea
                      rows={5}
                      placeholder="Nhập kết luận đánh giá chuyên môn của xét nghiệm / chẩn đoán hình ảnh..."
                    />
                  </Form.Item>
                </Form>
              </Card>
            </div>
          )}

          {!detail && !loading && (
            <div style={{ textAlign: 'center', padding: 60, color: '#94a3b8' }}>
              Không tìm thấy chỉ định CLS hoặc ID không hợp lệ.
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
};

export default NhapKetQuaPage;
