import React from 'react';
import { Row, Col, Card, Statistic, Progress, Table, Typography, Tag, Space } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  FundOutlined,
  PieChartOutlined,
  DollarCircleOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  BaoCaoThuChiResponseDto,
  PhanBoPhuongThucThuDto,
  CoCauChiPhiDto,
  ThuChiTheoThoiGianDto,
} from '../types/financeReports.types';

const { Text, Title } = Typography;

interface Props {
  data: BaoCaoThuChiResponseDto | null;
  loading: boolean;
}

export const CashflowReportView: React.FC<Props> = ({ data, loading }) => {
  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '0 ₫';
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  const tongQuan = data?.tongQuan;

  // Cột phương thức thanh toán
  const paymentColumns: ColumnsType<PhanBoPhuongThucThuDto> = [
    {
      title: 'Hình thức thanh toán',
      dataIndex: 'tenPhuongThuc',
      key: 'tenPhuongThuc',
      render: (t) => (
        <Space>
          <CreditCardOutlined style={{ color: '#0284c7' }} />
          <Text strong>{t}</Text>
        </Space>
      ),
    },
    {
      title: 'Số giao dịch',
      dataIndex: 'soGiaoDich',
      key: 'soGiaoDich',
      align: 'center',
      width: 120,
      render: (val) => val?.toLocaleString('vi-VN') || 0,
    },
    {
      title: 'Tổng số tiền',
      dataIndex: 'soTien',
      key: 'soTien',
      align: 'right',
      render: (val) => <Text strong style={{ color: '#16a34a' }}>{formatCurrency(val)}</Text>,
    },
    {
      title: 'Tỷ trọng',
      dataIndex: 'tyTrong',
      key: 'tyTrong',
      align: 'center',
      width: 150,
      render: (val) => (
        <Space style={{ width: '100%' }}>
          <Progress percent={val} size="small" strokeColor="#16a34a" style={{ width: 80 }} />
          <Text style={{ fontSize: 12 }}>{val}%</Text>
        </Space>
      ),
    },
  ];

  // Cột cơ cấu chi phí
  const expenseColumns: ColumnsType<CoCauChiPhiDto> = [
    {
      title: 'Khoản mục chi phí',
      dataIndex: 'khoanMuc',
      key: 'khoanMuc',
      render: (t) => <Text strong>{t}</Text>,
    },
    {
      title: 'Số tiền chi ra',
      dataIndex: 'soTien',
      key: 'soTien',
      align: 'right',
      render: (val) => <Text strong style={{ color: '#e11d48' }}>{formatCurrency(val)}</Text>,
    },
    {
      title: 'Tỷ trọng chi',
      dataIndex: 'tyTrong',
      key: 'tyTrong',
      align: 'center',
      width: 150,
      render: (val) => (
        <Space style={{ width: '100%' }}>
          <Progress percent={val} size="small" strokeColor="#e11d48" style={{ width: 80 }} />
          <Text style={{ fontSize: 12 }}>{val}%</Text>
        </Space>
      ),
    },
  ];

  // Cột dòng tiền theo mốc thời gian
  const timeSeriesColumns: ColumnsType<ThuChiTheoThoiGianDto> = [
    {
      title: 'Thời gian',
      dataIndex: 'mocThoiGian',
      key: 'mocThoiGian',
      render: (t) => <Text strong>{t}</Text>,
    },
    {
      title: 'Tiền thu thực tế (Vào)',
      dataIndex: 'tienThu',
      key: 'tienThu',
      align: 'right',
      render: (val) => <Text style={{ color: '#16a34a', fontWeight: 600 }}>+{formatCurrency(val)}</Text>,
    },
    {
      title: 'Tiền chi thực tế (Ra)',
      dataIndex: 'tienChi',
      key: 'tienChi',
      align: 'right',
      render: (val) => <Text style={{ color: '#e11d48', fontWeight: 600 }}>-{formatCurrency(val)}</Text>,
    },
    {
      title: 'Dòng tiền ròng (Net)',
      dataIndex: 'dongTienRong',
      key: 'dongTienRong',
      align: 'right',
      render: (val) => (
        <Tag color={val >= 0 ? 'green' : 'red'} style={{ fontSize: 13, padding: '2px 8px' }}>
          {val >= 0 ? '+' : ''}{formatCurrency(val)}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 4 KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 10, borderLeft: '4px solid #16a34a', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 13 }}>TỔNG TIỀN THỰC THU (CASH IN)</Text>}
              value={tongQuan?.tongThu || 0}
              formatter={(val) => (
                <span style={{ color: '#16a34a', fontWeight: 700, fontSize: 20 }}>
                  {formatCurrency(Number(val))}
                </span>
              )}
              prefix={<ArrowUpOutlined />}
            />
            <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
              Từ viện phí, bán lẻ thuốc & tạm ứng
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 10, borderLeft: '4px solid #e11d48', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 13 }}>TỔNG TIỀN THỰC CHI (CASH OUT)</Text>}
              value={tongQuan?.tongChi || 0}
              formatter={(val) => (
                <span style={{ color: '#e11d48', fontWeight: 700, fontSize: 20 }}>
                  {formatCurrency(Number(val))}
                </span>
              )}
              prefix={<ArrowDownOutlined />}
            />
            <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
              Bao gồm trả NCC thuốc & chi lương
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 10,
              borderLeft: `4px solid ${(tongQuan?.dongTienRong ?? 0) >= 0 ? '#0284c7' : '#ef4444'}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 13 }}>DÒNG TIỀN THUẦN (NET CASHFLOW)</Text>}
              value={tongQuan?.dongTienRong || 0}
              formatter={(val) => (
                <span
                  style={{
                    color: Number(val) >= 0 ? '#0284c7' : '#ef4444',
                    fontWeight: 700,
                    fontSize: 20,
                  }}
                >
                  {formatCurrency(Number(val))}
                </span>
              )}
              prefix={<DollarCircleOutlined />}
            />
            <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
              Chênh lệch dòng tiền vào - ra
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 10, borderLeft: '4px solid #8b5cf6', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 13 }}>LỢI NHUẬN GỘP ƯỚC TÍNH</Text>}
              value={tongQuan?.loiNhuanGopUocTinh || 0}
              formatter={(val) => (
                <span style={{ color: '#8b5cf6', fontWeight: 700, fontSize: 20 }}>
                  {formatCurrency(Number(val))}
                </span>
              )}
              prefix={<FundOutlined />}
            />
            <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
              Tỷ suất lợi nhuận gộp: <Text strong style={{ color: '#8b5cf6' }}>{tongQuan?.tySuatLoiNhuanGop || 0}%</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* P&L Breakdown Card */}
      <Card
        title={
          <Space>
            <PieChartOutlined style={{ color: '#0b4f6c' }} />
            <span>Chỉ số ước tính kết quả hoạt động kinh doanh (P&L Estimate)</span>
          </Space>
        }
        bordered={false}
        style={{ borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={8}>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 8 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>Doanh thu thuần</Text>
              <Title level={4} style={{ margin: '6px 0 0', color: '#0b4f6c' }}>
                {formatCurrency(tongQuan?.doanhThuThuan)}
              </Title>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Tổng viện phí thực hiện</div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ padding: '12px 16px', background: '#fef2f2', borderRadius: 8 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>Giá vốn hàng bán (COGS)</Text>
              <Title level={4} style={{ margin: '6px 0 0', color: '#dc2626' }}>
                -{formatCurrency(tongQuan?.giaVonHangBan)}
              </Title>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Giá vốn thuốc & vật tư nhập</div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ padding: '12px 16px', background: '#f0fdf4', borderRadius: 8 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>Chi phí nhân sự</Text>
              <Title level={4} style={{ margin: '6px 0 0', color: '#16a34a' }}>
                -{formatCurrency(tongQuan?.chiPhiNhanSu)}
              </Title>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Lương thực lĩnh theo kỳ</div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 2 Tables: Phân bổ phương thức thanh toán & Cơ cấu chi phí */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title="Phân bổ dòng tiền theo phương thức thanh toán"
            bordered={false}
            style={{ borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <Table<PhanBoPhuongThucThuDto>
              size="middle"
              rowKey="phuongThuc"
              columns={paymentColumns}
              dataSource={data?.phanBoThu || []}
              loading={loading}
              pagination={false}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Cơ cấu các khoản mục chi phí thực chi"
            bordered={false}
            style={{ borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <Table<CoCauChiPhiDto>
              size="middle"
              rowKey="khoanMuc"
              columns={expenseColumns}
              dataSource={data?.coCauChi || []}
              loading={loading}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      {/* Biến động dòng tiền theo thời gian */}
      <Card
        title="Biến động dòng tiền Thu - Chi theo mốc thời gian"
        bordered={false}
        style={{ borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <Table<ThuChiTheoThoiGianDto>
          size="middle"
          rowKey="mocThoiGian"
          columns={timeSeriesColumns}
          dataSource={data?.theoThoiGian || []}
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default CashflowReportView;
