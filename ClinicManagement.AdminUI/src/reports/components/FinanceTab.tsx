import React from 'react';
import { Card, Row, Col, Typography, Table, Tag, Empty, Space, Progress } from 'antd';
import {
  DollarCircleOutlined,
  CreditCardOutlined,
  WalletOutlined,
  BankOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { SystemReportsFinanceDto } from '../types/systemReports.types';

const { Title, Text } = Typography;

interface FinanceTabProps {
  data: SystemReportsFinanceDto | null;
  loading: boolean;
}

const formatCurrency = (val: number) => {
  return (val || 0).toLocaleString('vi-VN') + ' đ';
};

export const FinanceTab: React.FC<FinanceTabProps> = ({ data, loading }) => {
  if (!data && !loading) {
    return <Empty description="Chưa có dữ liệu báo cáo tài chính" style={{ padding: 40 }} />;
  }

  const revenue = data?.revenue;
  const cashflow = data?.cashflow;

  const revenueTableColumns: ColumnsType<any> = [
    {
      title: 'Kỳ / Thời gian',
      dataIndex: 'thoiGian',
      key: 'thoiGian',
      render: (t) => <Text strong>{t}</Text>,
    },
    {
      title: 'Số hóa đơn',
      dataIndex: 'soHoaDon',
      key: 'soHoaDon',
      align: 'right',
      render: (c) => `${c} HĐ`,
    },
    {
      title: 'Doanh thu phát sinh',
      dataIndex: 'doanhThu',
      key: 'doanhThu',
      align: 'right',
      render: (val) => <span style={{ fontWeight: 600, color: '#0b4f6c' }}>{formatCurrency(val)}</span>,
    },
    {
      title: 'Đã thực thu',
      dataIndex: 'daThu',
      key: 'daThu',
      align: 'right',
      render: (val) => <span style={{ fontWeight: 600, color: '#059669' }}>{formatCurrency(val)}</span>,
    },
    {
      title: 'Còn nợ / Chưa thu',
      dataIndex: 'conNo',
      key: 'conNo',
      align: 'right',
      render: (val) => (
        <span style={{ fontWeight: 600, color: val > 0 ? '#ef4444' : '#64748b' }}>
          {formatCurrency(val)}
        </span>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 4 Thẻ KPI Tài chính & Viện phí */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Tổng doanh thu viện phí</Text>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#0b4f6c', marginTop: 4 }}>
              {formatCurrency(revenue?.tongDoanhThu || 0)}
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>{revenue?.soHoaDon || 0} hóa đơn</Text>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10, border: '1px solid #e2e8f0', background: '#f0fdf4' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Thực thu bệnh nhân</Text>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#059669', marginTop: 4 }}>
              {formatCurrency(revenue?.daThanhToan || 0)}
            </div>
            <Tag color="success" style={{ marginTop: 2 }}>Đã vào quỹ</Tag>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10, border: '1px solid #e2e8f0', background: '#eff6ff' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Bảo hiểm Y tế chi trả</Text>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#0284c7', marginTop: 4 }}>
              {formatCurrency(revenue?.baoHiemChiTra || 0)}
            </div>
            <Tag color="blue" style={{ marginTop: 2 }}>Thanh toán BHYT</Tag>
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card size="small" style={{ borderRadius: 10, border: '1px solid #e2e8f0', background: '#fef2f2' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Công nợ viện phí chưa thu</Text>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#ef4444', marginTop: 4 }}>
              {formatCurrency(revenue?.chuaThanhToan || 0)}
            </div>
            <Tag color="error" style={{ marginTop: 2 }}>Cần thu hồi</Tag>
          </Card>
        </Col>
      </Row>

      {/* Dòng tiền Thu - Chi - Lợi nhuận gộp & Phương thức thanh toán */}
      <Row gutter={[16, 16]}>
        {/* Dòng tiền thu chi */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <WalletOutlined style={{ color: '#059669' }} />
                <span>Báo cáo Dòng tiền (Sổ quỹ & Lợi nhuận)</span>
              </Space>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
          >
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <div style={{ padding: 12, background: '#f0fdf4', borderRadius: 8, textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Tổng thu ({cashflow?.soPhieuThu || 0} phiếu)</Text>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#059669', marginTop: 4 }}>
                    {formatCurrency(cashflow?.tongThu || 0)}
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ padding: 12, background: '#fef2f2', borderRadius: 8, textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Tổng chi ({cashflow?.soPhieuChi || 0} phiếu)</Text>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#ef4444', marginTop: 4 }}>
                    {formatCurrency(cashflow?.tongChi || 0)}
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ padding: 12, background: '#eff6ff', borderRadius: 8, textAlign: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Lợi nhuận ròng</Text>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#0284c7', marginTop: 4 }}>
                    {formatCurrency(cashflow?.loiNhuanGop || 0)}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Phương thức thanh toán */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <CreditCardOutlined style={{ color: '#0284c7' }} />
                <span>Cơ cấu Phương thức thanh toán</span>
              </Space>
            }
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}
          >
            {data?.paymentMethods && data.paymentMethods.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.paymentMethods.map((pm, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: 6 }}>
                    <div>
                      <Text strong>{pm.method}</Text>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{pm.count} giao dịch</div>
                    </div>
                    <Text style={{ fontWeight: 700, color: '#0f172a' }}>{formatCurrency(pm.amount)}</Text>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="Chưa có dữ liệu thanh toán" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Bảng chi tiết doanh thu theo kỳ */}
      <Card
        title="Bảng phân tích doanh thu viện phí theo kỳ"
        bordered={false}
        style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <Table
          columns={revenueTableColumns}
          dataSource={revenue?.doanhThuTheoKy || []}
          rowKey={(r) => r.thoiGian}
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
};
