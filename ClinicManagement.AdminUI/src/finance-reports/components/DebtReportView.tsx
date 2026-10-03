import React from 'react';
import { Row, Col, Card, Statistic, Progress, Table, Typography, Tag, Space } from 'antd';
import {
  UserOutlined,
  ShopOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CalculatorOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  BaoCaoCongNoResponseDto,
  PhanBoTuoiNoDto,
  TopBenhNhanNoDto,
  TopNhaCungCapNoDto,
} from '../types/financeReports.types';

const { Text } = Typography;

interface Props {
  data: BaoCaoCongNoResponseDto | null;
  loading: boolean;
}

export const DebtReportView: React.FC<Props> = ({ data, loading }) => {
  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '0 ₫';
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  const tongQuan = data?.tongQuan;

  // Cột bảng phân bổ tuổi nợ
  const agingColumns: ColumnsType<PhanBoTuoiNoDto> = [
    {
      title: 'Khoảng thời gian (Tuổi nợ)',
      dataIndex: 'nhomTuoi',
      key: 'nhomTuoi',
      render: (t) => <Text strong>{t}</Text>,
    },
    {
      title: 'Phải thu Bệnh nhân (AR)',
      dataIndex: 'soTienPhaiThu',
      key: 'soTienPhaiThu',
      align: 'right',
      render: (val) => <Text style={{ color: '#0284c7', fontWeight: 600 }}>{formatCurrency(val)}</Text>,
    },
    {
      title: 'Tỷ trọng AR',
      dataIndex: 'tyTrongPhaiThu',
      key: 'tyTrongPhaiThu',
      align: 'center',
      width: 140,
      render: (val) => (
        <Space style={{ width: '100%' }}>
          <Progress percent={val} size="small" strokeColor="#0284c7" style={{ width: 80 }} />
          <Text style={{ fontSize: 12 }}>{val}%</Text>
        </Space>
      ),
    },
    {
      title: 'Phải trả Nhà cung cấp (AP)',
      dataIndex: 'soTienPhaiTra',
      key: 'soTienPhaiTra',
      align: 'right',
      render: (val) => <Text style={{ color: '#d97706', fontWeight: 600 }}>{formatCurrency(val)}</Text>,
    },
    {
      title: 'Tỷ trọng AP',
      dataIndex: 'tyTrongPhaiTra',
      key: 'tyTrongPhaiTra',
      align: 'center',
      width: 140,
      render: (val) => (
        <Space style={{ width: '100%' }}>
          <Progress percent={val} size="small" strokeColor="#d97706" style={{ width: 80 }} />
          <Text style={{ fontSize: 12 }}>{val}%</Text>
        </Space>
      ),
    },
  ];

  // Cột bảng Top bệnh nhân nợ
  const patientDebtColumns: ColumnsType<TopBenhNhanNoDto> = [
    {
      title: 'STT',
      key: 'stt',
      width: 50,
      align: 'center',
      render: (_, __, idx) => idx + 1,
    },
    {
      title: 'Bệnh nhân',
      key: 'hoTen',
      render: (_, r) => (
        <div>
          <Space>
            <UserOutlined style={{ color: '#0284c7' }} />
            <Text strong>{r.hoTen}</Text>
          </Space>
          <div style={{ fontSize: 12, color: '#64748b', paddingLeft: 18 }}>
            SĐT: {r.soDienThoai || 'Chưa cập nhật'} | Mã: BN{r.maBenhNhan.toString().padStart(5, '0')}
          </div>
        </div>
      ),
    },
    {
      title: 'Tổng viện phí',
      dataIndex: 'soTienNo',
      key: 'soTienNo',
      align: 'right',
      render: (val) => formatCurrency(val),
    },
    {
      title: 'Đã tạm ứng/trả',
      dataIndex: 'soTienDaTra',
      key: 'soTienDaTra',
      align: 'right',
      render: (val) => <Text style={{ color: '#16a34a' }}>{formatCurrency(val)}</Text>,
    },
    {
      title: 'Còn nợ lại',
      dataIndex: 'soTienConLai',
      key: 'soTienConLai',
      align: 'right',
      render: (val) => (
        <Text strong style={{ color: '#e11d48' }}>
          {formatCurrency(val)}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'trangThai',
      align: 'center',
      width: 130,
      render: (_, r) => {
        if (r.soNgayQuaHan > 0) {
          return <Tag color="error">Quá hạn {r.soNgayQuaHan} ngày</Tag>;
        }
        return <Tag color="processing">Trong hạn</Tag>;
      },
    },
  ];

  // Cột bảng Top nhà cung cấp nợ
  const supplierDebtColumns: ColumnsType<TopNhaCungCapNoDto> = [
    {
      title: 'STT',
      key: 'stt',
      width: 50,
      align: 'center',
      render: (_, __, idx) => idx + 1,
    },
    {
      title: 'Nhà cung cấp',
      key: 'tenNhaCungCap',
      render: (_, r) => (
        <div>
          <Space>
            <ShopOutlined style={{ color: '#d97706' }} />
            <Text strong>{r.tenNhaCungCap}</Text>
          </Space>
          <div style={{ fontSize: 12, color: '#64748b', paddingLeft: 18 }}>
            Mã NCC: {r.maNcc} {r.soDienThoai ? `| SĐT: ${r.soDienThoai}` : ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Tiền hàng',
      dataIndex: 'tongTienHang',
      key: 'tongTienHang',
      align: 'right',
      render: (val) => formatCurrency(val),
    },
    {
      title: 'Đã thanh toán',
      dataIndex: 'soTienDaTra',
      key: 'soTienDaTra',
      align: 'right',
      render: (val) => <Text style={{ color: '#16a34a' }}>{formatCurrency(val)}</Text>,
    },
    {
      title: 'Còn phải trả',
      dataIndex: 'soTienConLai',
      key: 'soTienConLai',
      align: 'right',
      render: (val) => (
        <Text strong style={{ color: '#b45309' }}>
          {formatCurrency(val)}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'trangThai',
      align: 'center',
      width: 130,
      render: (_, r) => {
        if (r.soNgayQuaHan > 0) {
          return <Tag color="error">Quá hạn {r.soNgayQuaHan} ngày</Tag>;
        }
        return <Tag color="blue">Trong hạn</Tag>;
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 4 KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 10, borderLeft: '4px solid #0284c7', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 13 }}>PHẢI THU BỆNH NHÂN (AR)</Text>}
              value={tongQuan?.tongPhaiThuBenhNhan || 0}
              formatter={(val) => (
                <span style={{ color: '#0284c7', fontWeight: 700, fontSize: 20 }}>
                  {formatCurrency(Number(val))}
                </span>
              )}
              prefix={<UserOutlined />}
            />
            <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
              Quá hạn: <Text style={{ color: '#e11d48' }}>{formatCurrency(tongQuan?.phaiThuQuaHan)}</Text> ({tongQuan?.soBenhNhanNo || 0} BN)
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 10, borderLeft: '4px solid #d97706', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 13 }}>PHẢI TRẢ NHÀ CUNG CẤP (AP)</Text>}
              value={tongQuan?.tongPhaiTraNhaCungCap || 0}
              formatter={(val) => (
                <span style={{ color: '#d97706', fontWeight: 700, fontSize: 20 }}>
                  {formatCurrency(Number(val))}
                </span>
              )}
              prefix={<ShopOutlined />}
            />
            <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
              Quá hạn: <Text style={{ color: '#b45309' }}>{formatCurrency(tongQuan?.phaiTraQuaHan)}</Text> ({tongQuan?.soNhaCungCapNo || 0} NCC)
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 10,
              borderLeft: `4px solid ${(tongQuan?.chenhLechCongNo ?? 0) >= 0 ? '#16a34a' : '#e11d48'}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 13 }}>CHÊNH LỆCH CÔNG NỢ RÒNG (AR - AP)</Text>}
              value={tongQuan?.chenhLechCongNo || 0}
              formatter={(val) => (
                <span
                  style={{
                    color: Number(val) >= 0 ? '#16a34a' : '#e11d48',
                    fontWeight: 700,
                    fontSize: 20,
                  }}
                >
                  {formatCurrency(Number(val))}
                </span>
              )}
              prefix={<CalculatorOutlined />}
            />
            <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
              {(tongQuan?.chenhLechCongNo ?? 0) >= 0 ? (
                <span style={{ color: '#16a34a' }}>
                  <CheckCircleOutlined /> Dư nợ thu lớn hơn nợ phải trả
                </span>
              ) : (
                <span style={{ color: '#e11d48' }}>
                  <WarningOutlined /> Áp lực thanh toán nhà cung cấp cao
                </span>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 10, borderLeft: '4px solid #ef4444', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          >
            <Statistic
              title={<Text style={{ color: '#64748b', fontSize: 13 }}>TỔNG NỢ QUÁ HẠN RỦI RO</Text>}
              value={(tongQuan?.phaiThuQuaHan || 0) + (tongQuan?.phaiTraQuaHan || 0)}
              formatter={(val) => (
                <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 20 }}>
                  {formatCurrency(Number(val))}
                </span>
              )}
              prefix={<AlertOutlined />}
            />
            <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
              Cần thu hồi viện phí & giải ngân đúng hạn
            </div>
          </Card>
        </Col>
      </Row>

      {/* Ma trận phân bổ tuổi nợ */}
      <Card
        title={
          <Space>
            <span>Phân bổ tuổi nợ theo thời gian (Aging Analysis)</span>
            <Tag color="cyan">Đối chiếu công nợ song phương</Tag>
          </Space>
        }
        bordered={false}
        style={{ borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <Table<PhanBoTuoiNoDto>
          size="middle"
          rowKey="nhomTuoi"
          columns={agingColumns}
          dataSource={data?.phanBoTuoiNo || []}
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* Top Bệnh nhân nợ & Top Nhà cung cấp nợ */}
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Card
            title="Top bệnh nhân có dư nợ viện phí cao nhất"
            bordered={false}
            style={{ borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <Table<TopBenhNhanNoDto>
              size="small"
              rowKey="maBenhNhan"
              columns={patientDebtColumns}
              dataSource={data?.topBenhNhanNo || []}
              loading={loading}
              pagination={false}
            />
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card
            title="Top nhà cung cấp còn nợ tiền nhập kho"
            bordered={false}
            style={{ borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <Table<TopNhaCungCapNoDto>
              size="small"
              rowKey="maNhaCungCap"
              columns={supplierDebtColumns}
              dataSource={data?.topNhaCungCapNo || []}
              loading={loading}
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DebtReportView;
