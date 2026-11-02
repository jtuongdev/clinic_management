import React from 'react';
import { Row, Col, Card, Statistic, Progress, Table, Typography, Tag, Space } from 'antd';
import {
  DollarOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  ShopOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  BaoCaoDoanhThuResponseDto,
  DoanhThuTheoCoSoDto,
  DoanhThuTheoKhoaDto,
  TopDichVuDoanhThuDto,
} from '../types/financeReports.types';

const { Text, Title } = Typography;

interface Props {
  data: BaoCaoDoanhThuResponseDto | null;
  loading: boolean;
}

export const RevenueReportView: React.FC<Props> = ({ data, loading }) => {
  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '0 ₫';
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  const tongQuan = data?.tongQuan;
  const coCau = data?.coCau;

  const coSoColumns: ColumnsType<DoanhThuTheoCoSoDto> = [
    {
      title: 'Cơ sở khám chữa bệnh',
      dataIndex: 'tenCoSo',
      key: 'tenCoSo',
      render: (t) => (
        <Space>
          <ShopOutlined style={{ color: '#0b4f6c' }} />
          <Text strong>{t}</Text>
        </Space>
      ),
    },
    {
      title: 'Số hóa đơn',
      dataIndex: 'soHoaDon',
      key: 'soHoaDon',
      align: 'center',
      width: 110,
    },
    {
      title: 'Doanh thu phát sinh',
      dataIndex: 'doanhThu',
      key: 'doanhThu',
      align: 'right',
      render: (val) => formatCurrency(val),
    },
    {
      title: 'Đã thực thu',
      dataIndex: 'daThu',
      key: 'daThu',
      align: 'right',
      render: (val) => <Text style={{ color: '#16a34a' }}>{formatCurrency(val)}</Text>,
    },
    {
      title: 'Tỷ trọng',
      dataIndex: 'tyTrong',
      key: 'tyTrong',
      align: 'center',
      width: 140,
      render: (val) => (
        <Space style={{ width: '100%' }}>
          <Progress percent={val} size="small" strokeColor="#0b4f6c" style={{ width: 80 }} />
          <Text style={{ fontSize: 12 }}>{val}%</Text>
        </Space>
      ),
    },
  ];

  const khoaColumns: ColumnsType<DoanhThuTheoKhoaDto> = [
    {
      title: 'Khoa / Chuyên khoa',
      dataIndex: 'tenKhoa',
      key: 'tenKhoa',
      render: (t) => <Text strong>{t}</Text>,
    },
    {
      title: 'Số lượt',
      dataIndex: 'soLuotKham',
      key: 'soLuotKham',
      align: 'center',
      width: 100,
    },
    {
      title: 'Doanh thu',
      dataIndex: 'doanhThu',
      key: 'doanhThu',
      align: 'right',
      render: (val) => formatCurrency(val),
    },
    {
      title: 'Tỷ trọng',
      dataIndex: 'tyTrong',
      key: 'tyTrong',
      align: 'center',
      width: 130,
      render: (val) => <Tag color="blue">{val}%</Tag>,
    },
  ];

  const topDichVuColumns: ColumnsType<TopDichVuDoanhThuDto> = [
    {
      title: 'STT',
      key: 'stt',
      width: 55,
      align: 'center',
      render: (_, __, idx) => idx + 1,
    },
    {
      title: 'Mặt hàng / Dịch vụ kỹ thuật',
      key: 'tenDichVu',
      render: (_, r) => (
        <div>
          <Text strong>{r.tenDichVu}</Text>
          <div style={{ fontSize: 12, color: '#64748b' }}>Mã: {r.maDichVu}</div>
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'loai',
      key: 'loai',
      align: 'center',
      width: 120,
      render: (l) => {
        switch (l) {
          case 'THUOC':
            return <Tag color="green">Thuốc</Tag>;
          case 'VAT_TU':
            return <Tag color="orange">Vật tư</Tag>;
          default:
            return <Tag color="geekblue">Dịch vụ</Tag>;
        }
      },
    },
    {
      title: 'Số lượng',
      dataIndex: 'soLuong',
      key: 'soLuong',
      align: 'right',
      width: 100,
      render: (sl) => sl?.toLocaleString('vi-VN') || 0,
    },
    {
      title: 'Tổng doanh thu',
      dataIndex: 'doanhThu',
      key: 'doanhThu',
      align: 'right',
      width: 160,
      render: (val) => (
        <Text strong style={{ color: '#0b4f6c' }}>
          {formatCurrency(val)}
        </Text>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 10, borderLeft: '4px solid #0284c7', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 13 }}>TỔNG DOANH THU PHÁT SINH</Text>}
              value={tongQuan?.tongDoanhThu || 0}
              formatter={(val) => (
                <span style={{ color: '#0284c7', fontWeight: 700, fontSize: 20 }}>
                  {formatCurrency(Number(val))}
                </span>
              )}
              prefix={<DollarOutlined />}
            />
            <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
              Trung bình: <Text strong>{formatCurrency(tongQuan?.giaTriTrungBinhHoaDon)}</Text> / HĐ
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 10, borderLeft: '4px solid #16a34a', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 13 }}>THỰC THU TỪ BỆNH NHÂN</Text>}
              value={tongQuan?.doanhThuThucThu || 0}
              formatter={(val) => (
                <span style={{ color: '#16a34a', fontWeight: 700, fontSize: 20 }}>
                  {formatCurrency(Number(val))}
                </span>
              )}
              prefix={<CheckCircleOutlined />}
            />
            <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
              Đã thu trên <Text strong>{tongQuan?.soHoaDonDaThanhToan || 0}</Text> hóa đơn
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 10, borderLeft: '4px solid #8b5cf6', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 13 }}>BẢO HIỂM Y TẾ (BHYT)</Text>}
              value={tongQuan?.bhytChiTra || 0}
              formatter={(val) => (
                <span style={{ color: '#8b5cf6', fontWeight: 700, fontSize: 20 }}>
                  {formatCurrency(Number(val))}
                </span>
              )}
              prefix={<SafetyCertificateOutlined />}
            />
            <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
              Cơ quan BHYT thanh toán quyết toán
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 10, borderLeft: '4px solid #f59e0b', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 13 }}>CHƯA THU (NỢ TIỀN KHÁM)</Text>}
              value={tongQuan?.chuaThanhToan || 0}
              formatter={(val) => (
                <span style={{ color: '#d97706', fontWeight: 700, fontSize: 20 }}>
                  {formatCurrency(Number(val))}
                </span>
              )}
              prefix={<ClockCircleOutlined />}
            />
            <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
              Còn lại trên <Text strong>{tongQuan?.soHoaDonChuaThanhToan || 0}</Text> hóa đơn
            </div>
          </Card>
        </Col>
      </Row>

      {/* Revenue Structure Breakdown Card */}
      <Card
        title={
          <Space>
            <MedicineBoxOutlined style={{ color: '#0b4f6c' }} />
            <span>Cơ cấu tỷ trọng nguồn doanh thu</span>
          </Space>
        }
        bordered={false}
        style={{ borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: 4 }}>
              <Text type="secondary">Dịch vụ kỹ thuật / Cận lâm sàng</Text>
            </div>
            <Title level={4} style={{ margin: '4px 0', color: '#0b4f6c' }}>
              {formatCurrency(coCau?.doanhThuDichVu)}
            </Title>
            <Progress percent={coCau?.tyLeDichVu || 0} strokeColor="#0b4f6c" />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Chiếm {coCau?.tyLeDichVu || 0}% tổng doanh thu
            </Text>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: 4 }}>
              <Text type="secondary">Doanh thu Thuốc kê đơn / Bán lẻ</Text>
            </div>
            <Title level={4} style={{ margin: '4px 0', color: '#16a34a' }}>
              {formatCurrency(coCau?.doanhThuThuoc)}
            </Title>
            <Progress percent={coCau?.tyLeThuoc || 0} strokeColor="#16a34a" />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Chiếm {coCau?.tyLeThuoc || 0}% tổng doanh thu
            </Text>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: 4 }}>
              <Text type="secondary">Công khám bệnh lâm sàng</Text>
            </div>
            <Title level={4} style={{ margin: '4px 0', color: '#0284c7' }}>
              {formatCurrency(coCau?.doanhThuKham)}
            </Title>
            <Progress percent={coCau?.tyLeKham || 0} strokeColor="#0284c7" />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Chiếm {coCau?.tyLeKham || 0}% tổng doanh thu
            </Text>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: 4 }}>
              <Text type="secondary">Vật tư tiêu hao y tế</Text>
            </div>
            <Title level={4} style={{ margin: '4px 0', color: '#f59e0b' }}>
              {formatCurrency(coCau?.doanhThuVatTu)}
            </Title>
            <Progress percent={coCau?.tyLeVatTu || 0} strokeColor="#f59e0b" />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Chiếm {coCau?.tyLeVatTu || 0}% tổng doanh thu
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Tables: Theo Cơ Sở & Theo Khoa */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title="Doanh thu theo Cơ sở"
            bordered={false}
            style={{ borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <Table<DoanhThuTheoCoSoDto>
              size="small"
              rowKey="maCoSo"
              columns={coSoColumns}
              dataSource={data?.theoCoSo || []}
              loading={loading}
              pagination={false}
            />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title="Doanh thu theo Khoa / Chuyên khoa"
            bordered={false}
            style={{ borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <Table<DoanhThuTheoKhoaDto>
              size="small"
              rowKey="maKhoa"
              columns={khoaColumns}
              dataSource={data?.theoKhoa || []}
              loading={loading}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      {/* Top 10 Services */}
      <Card
        title="Top mặt hàng & dịch vụ mang lại doanh thu cao nhất"
        bordered={false}
        style={{ borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <Table<TopDichVuDoanhThuDto>
          size="middle"
          rowKey="id"
          columns={topDichVuColumns}
          dataSource={data?.topDichVu || []}
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default RevenueReportView;
