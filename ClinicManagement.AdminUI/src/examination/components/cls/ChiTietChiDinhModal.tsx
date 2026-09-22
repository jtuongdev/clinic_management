import React, { useState, useEffect } from 'react';
import {
  Modal,
  Spin,
  Button,
  Tag,
  Descriptions,
  Table,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Tabs,
  Badge,
  Tooltip,
  Alert,
  message,
} from 'antd';
import {
  ExperimentOutlined,
  PrinterOutlined,
  EditOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ApartmentOutlined,
  FileTextOutlined,
  InboxOutlined,
  LinkOutlined,
  PictureOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { examinationApi } from '../../api/examination.api';
import type {
  ChiDinhDichVuChiTietDto,
  ChiTietKetQuaXetNghiemDto,
  VatTuSuDungDto,
} from '../../type/examination.types';

const { Text, Title } = Typography;

interface ChiTietChiDinhModalProps {
  visible: boolean;
  chiDinhId: number | null;
  onClose: () => void;
  onOpenNhapKetQua?: (id: number) => void;
  onOpenInPhieu?: (id: number) => void;
}

export const ChiTietChiDinhModal: React.FC<ChiTietChiDinhModalProps> = ({
  visible,
  chiDinhId,
  onClose,
  onOpenNhapKetQua,
  onOpenInPhieu,
}) => {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<ChiDinhDichVuChiTietDto | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  useEffect(() => {
    if (!visible || !chiDinhId) {
      setDetail(null);
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await examinationApi.getChiDinhChiTiet(chiDinhId);
        if (res.data?.success && res.data.data) {
          setDetail(res.data.data);
        } else {
          message.error('Không thể tải chi tiết chỉ định cận lâm sàng');
        }
      } catch (err: any) {
        message.error(err?.message || 'Lỗi khi tải chi tiết chỉ định');
      } finally {
        setLoading(false);
      }
    };

    void fetchDetail();
  }, [visible, chiDinhId]);

  // Cột bảng chỉ số xét nghiệm
  const indicatorColumns: ColumnsType<ChiTietKetQuaXetNghiemDto> = [
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
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Kết quả đo',
      dataIndex: 'giaTri',
      key: 'giaTri',
      width: 140,
      render: (val, record) => (
        <span
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: record.batThuong ? '#dc2626' : '#0f172a',
          }}
        >
          {val}
        </span>
      ),
    },
    {
      title: 'Đơn vị tính',
      dataIndex: 'donVi',
      key: 'donVi',
      width: 110,
      render: (val) => <Text type="secondary">{val || '--'}</Text>,
    },
    {
      title: 'Khoảng tham chiếu',
      dataIndex: 'khoangThamChieu',
      key: 'khoangThamChieu',
      width: 150,
      render: (val) => <Text code>{val || '--'}</Text>,
    },
    {
      title: 'Đánh giá',
      dataIndex: 'batThuong',
      key: 'batThuong',
      width: 120,
      align: 'center',
      render: (isAbnormal) =>
        isAbnormal ? (
          <Tag color="error">Bất thường</Tag>
        ) : (
          <Tag color="success">Bình thường</Tag>
        ),
    },
  ];

  // Cột bảng vật tư sử dụng & hao phí
  const supplyColumns: ColumnsType<VatTuSuDungDto> = [
    {
      title: '#',
      key: 'idx',
      width: 50,
      align: 'center',
      render: (_, __, idx) => idx + 1,
    },
    {
      title: 'Mã VT',
      dataIndex: 'maVatTu',
      key: 'maVatTu',
      width: 110,
      render: (code) => <Text code>{code || '--'}</Text>,
    },
    {
      title: 'Tên vật tư y tế / hóa chất',
      dataIndex: 'tenVatTu',
      key: 'tenVatTu',
      render: (text, record) => (
        <div>
          <Text strong style={{ color: '#0f172a' }}>
            {text}
          </Text>
          {record.ghiChu && (
            <div style={{ fontSize: 12, color: '#64748b' }}>{record.ghiChu}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Định mức CLS',
      key: 'dinhMuc',
      width: 140,
      align: 'right',
      render: (_, record) => (
        <span>
          <Text strong>{record.soLuongDinhMuc}</Text>{' '}
          <Text type="secondary">{record.donViTinh}</Text>
        </span>
      ),
    },
    {
      title: 'Thực xuất kho',
      key: 'thucXuat',
      width: 150,
      align: 'right',
      render: (_, record) => (
        <span style={{ color: record.soLuongXuat > 0 ? '#059669' : '#64748b', fontWeight: 600 }}>
          {record.soLuongXuat > 0 ? `${record.soLuongXuat} ${record.donViTinhKho}` : '0'}
        </span>
      ),
    },
    {
      title: 'Số lô xuất',
      dataIndex: 'soLo',
      key: 'soLo',
      width: 120,
      render: (lot) => (lot ? <Tag color="geekblue">{lot}</Tag> : <Text type="secondary">--</Text>),
    },
    {
      title: 'Mã phiếu xuất nội bộ',
      dataIndex: 'maPhieuXuat',
      key: 'maPhieuXuat',
      width: 170,
      render: (code) =>
        code ? (
          <Tag color="cyan" style={{ fontFamily: 'monospace', fontWeight: 600 }}>
            {code}
          </Tag>
        ) : (
          <Text type="secondary">Chưa lập phiếu</Text>
        ),
    },
    {
      title: 'Tình trạng khấu trừ',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 170,
      render: (st) => {
        if (st.includes('Đã xuất')) {
          return <Tag color="success">{st}</Tag>;
        }
        if (st.includes('Miễn trừ')) {
          return <Tag color="orange">{st}</Tag>;
        }
        if (st.includes('Chờ')) {
          return <Tag color="processing">{st}</Tag>;
        }
        return <Tag color="default">{st}</Tag>;
      },
    },
  ];

  const supplies = detail?.vatTuSuDungs || [];
  const deductedSuppliesCount = supplies.filter((x) => x.soLuongXuat > 0).length;
  const sharedSuppliesCount = supplies.filter((x) => x.trangThai.includes('Miễn trừ')).length;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ExperimentOutlined style={{ color: '#0b4f6c', fontSize: 22 }} />
            <div>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#0b4f6c' }}>
                Chi tiết đợt cận lâm sàng: {detail?.tenDichVu || `#${chiDinhId}`}
              </span>
              <span style={{ marginLeft: 8 }}>
                <Tag color="blue">#{detail?.id}</Tag>
                {detail?.loaiDichVu && <Tag color="purple">{detail.loaiDichVu}</Tag>}
              </span>
            </div>
          </div>
          <Space>
            <Tooltip title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Mở toàn màn hình'}>
              <Button
                type="text"
                icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                onClick={() => setIsFullscreen(!isFullscreen)}
              />
            </Tooltip>
          </Space>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={isFullscreen ? '100vw' : 1050}
      style={
        isFullscreen
          ? { top: 0, maxWidth: '100vw', padding: 0, margin: 0 }
          : { top: 20 }
      }
      bodyStyle={{
        height: isFullscreen ? 'calc(100vh - 120px)' : 'calc(85vh - 120px)',
        overflowY: 'auto',
        padding: '16px 24px',
      }}
      destroyOnClose
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {detail?.trangThai && (
              <Badge
                status={detail.trangThai === 'DaCoKetQua' ? 'success' : 'processing'}
                text={
                  <span style={{ fontWeight: 600 }}>
                    Trạng thái: {detail.trangThai === 'DaCoKetQua' ? 'Đã có kết quả' : detail.trangThai}
                  </span>
                }
              />
            )}
          </div>
          <Space>
            <Button onClick={onClose}>Đóng</Button>
            {detail?.trangThai === 'DaCoKetQua' && onOpenInPhieu && (
              <Button
                type="primary"
                style={{ background: '#0b4f6c', borderColor: '#0b4f6c' }}
                icon={<PrinterOutlined />}
                onClick={() => onOpenInPhieu(detail.id)}
              >
                In phiếu kết quả
              </Button>
            )}
            {detail?.trangThai !== 'DaHuy' && onOpenNhapKetQua && (
              <Button
                type="primary"
                style={{ background: '#10b981', borderColor: '#10b981' }}
                icon={<EditOutlined />}
                onClick={() => onOpenNhapKetQua(detail?.id || 0)}
              >
                {detail?.trangThai === 'DaCoKetQua' ? 'Sửa kết quả' : 'Nhập kết quả CLS'}
              </Button>
            )}
          </Space>
        </div>
      }
    >
      <Spin spinning={loading}>
        {detail && (
          <div>
            {/* Thanh thông tin hành chính & bệnh nhân */}
            <Card size="small" style={{ background: '#f8fafc', borderColor: '#e2e8f0', marginBottom: 16 }}>
              <Row gutter={[16, 10]}>
                <Col span={8}>
                  <Text type="secondary">Bệnh nhân: </Text>
                  <Text strong style={{ color: '#0b4f6c', fontSize: 15 }}>
                    {detail.tenBenhNhan}
                  </Text>{' '}
                  ({detail.gioiTinh}{detail.tuoi ? `, ${detail.tuoi} tuổi` : ''})
                </Col>
                <Col span={8}>
                  <Text type="secondary">Mã hồ sơ: </Text>
                  <Text strong>{detail.maBenhNhanNoiBo || `BN-${detail.maBenhNhan}`}</Text>
                </Col>
                <Col span={8}>
                  <Text type="secondary">Số điện thoại: </Text>
                  <Text>{detail.dienThoai || '--'}</Text>
                </Col>
                <Col span={8}>
                  <Text type="secondary">Bác sĩ chỉ định: </Text>
                  <Text strong>{detail.tenBacSiChiDinh}</Text> ({detail.tenKhoa})
                </Col>
                <Col span={8}>
                  <Text type="secondary">Thời gian chỉ định: </Text>
                  <Text>
                    {detail.ngayChiDinh
                      ? new Date(detail.ngayChiDinh).toLocaleString('vi-VN')
                      : '--'}
                  </Text>
                </Col>
                <Col span={8}>
                  <Text type="secondary">Chẩn đoán sơ bộ: </Text>
                  <Text italic>{detail.chanDoanSoBo || 'Chưa ghi nhận'}</Text>
                </Col>
                <Col span={8}>
                  <Text type="secondary">Người thực hiện: </Text>
                  <Text strong style={{ color: '#059669' }}>
                    {detail.tenNguoiThucHien || 'Chưa phân công'}
                  </Text>
                </Col>
                <Col span={8}>
                  <Text type="secondary">Thời gian hoàn thành: </Text>
                  <Text>
                    {detail.ngayCoKetQua
                      ? new Date(detail.ngayCoKetQua).toLocaleString('vi-VN')
                      : 'Chưa có'}
                  </Text>
                </Col>
                <Col span={8}>
                  <Text type="secondary">Lượt khám: </Text>
                  <Tag color="cyan">#{detail.maLuotKham}</Tag>
                </Col>
              </Row>
            </Card>

            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              type="card"
              items={[
                {
                  key: '1',
                  label: (
                    <span>
                      <FileTextOutlined style={{ marginRight: 6 }} />
                      Kết quả chuyên môn & Chỉ số đo
                    </span>
                  ),
                  children: (
                    <div>
                      {/* Kết luận & Hình ảnh PACS */}
                      <Card
                        title="Đánh giá & Kết luận chuyên môn"
                        size="small"
                        style={{ marginBottom: 16 }}
                      >
                        <div style={{ background: '#f1f5f9', padding: '12px 16px', borderRadius: 8 }}>
                          <Text style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>
                            {detail.ketLuan || 'Chưa có kết luận thực hiện.'}
                          </Text>
                        </div>
                        {detail.urlKetQua && (
                          <div style={{ marginTop: 12 }}>
                            <Text type="secondary">File / Hình ảnh chẩn đoán: </Text>
                            <a
                              href={detail.urlKetQua}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontWeight: 600 }}
                            >
                              <PictureOutlined style={{ marginRight: 4 }} />
                              {detail.urlKetQua} <LinkOutlined />
                            </a>
                          </div>
                        )}
                      </Card>

                      {/* Bảng chỉ số xét nghiệm */}
                      {detail.chiTietKetQuas && detail.chiTietKetQuas.length > 0 && (
                        <Card
                          title={`Bảng chỉ số đo lường (${detail.chiTietKetQuas.length} chỉ số)`}
                          size="small"
                        >
                          <Table
                            dataSource={detail.chiTietKetQuas.map((x, idx) => ({ ...x, key: idx }))}
                            columns={indicatorColumns}
                            pagination={false}
                            size="small"
                            bordered
                          />
                        </Card>
                      )}
                    </div>
                  ),
                },
                {
                  key: '2',
                  label: (
                    <span>
                      <MedicineBoxOutlined style={{ marginRight: 6 }} />
                      Vật tư tiêu hao & Xuất kho nội bộ
                      <Badge
                        count={supplies.length}
                        style={{
                          backgroundColor: supplies.length > 0 ? '#0b4f6c' : '#94a3b8',
                          marginLeft: 8,
                        }}
                      />
                    </span>
                  ),
                  children: (
                    <div>
                      {/* Dải tổng quan tình trạng hao phí */}
                      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                        <Col span={8}>
                          <Card size="small" style={{ background: '#e8f4f7', borderColor: '#b8e2ec' }}>
                            <div style={{ fontSize: 12, color: '#0b4f6c' }}>Tổng vật tư định mức</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: '#0b4f6c' }}>
                              {supplies.length} mặt hàng
                            </div>
                          </Card>
                        </Col>
                        <Col span={8}>
                          <Card size="small" style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}>
                            <div style={{ fontSize: 12, color: '#059669' }}>Đã xuất kho nội bộ</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: '#059669' }}>
                              {deductedSuppliesCount} mặt hàng
                            </div>
                          </Card>
                        </Col>
                        <Col span={8}>
                          <Card size="small" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
                            <div style={{ fontSize: 12, color: '#d97706' }}>Miễn trừ (Dùng chung lượt khám)</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: '#d97706' }}>
                              {sharedSuppliesCount} mặt hàng
                            </div>
                          </Card>
                        </Col>
                      </Row>

                      {supplies.length === 0 ? (
                        <Alert
                          message="Dịch vụ này chưa cấu hình định mức vật tư tiêu hao (BOM)."
                          description="Khi dịch vụ không cấu hình định mức trong bảng DinhMucVatTuDichVu, hệ thống sẽ không tự động sinh phiếu xuất kho nội bộ khi duyệt kết quả."
                          type="info"
                          showIcon
                        />
                      ) : (
                        <Table
                          dataSource={supplies.map((item, idx) => ({ ...item, key: idx }))}
                          columns={supplyColumns}
                          pagination={false}
                          size="small"
                          bordered
                        />
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Spin>
    </Modal>
  );
};
