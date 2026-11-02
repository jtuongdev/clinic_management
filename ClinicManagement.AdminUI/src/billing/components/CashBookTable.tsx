import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Select,
  DatePicker,
  Card,
  Row,
  Col,
  Statistic,
  App,
  Segmented,
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
  FileExcelOutlined,
  SwapOutlined,
  DollarCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { useCoSoOptions } from '../../facility/hook/useCoSoOptions';
import { dateRangePresets } from '../../shared/utils/datePresets';
import { financeReportsApi } from '../../finance-reports/api/financeReports.api';
import { BaoCaoThuChiResponseDto } from '../../finance-reports/types/financeReports.types';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

interface CashBookItem {
  id: string;
  ngayGiaoDich: string;
  loaiGiaoDich: 'THU' | 'CHI';
  hangMuc: string;
  soChungTu: string;
  soTienThu: number;
  soTienChi: number;
  phuongThuc: string;
  doiTac: string;
  ghiChu: string;
}

export const CashBookTable: React.FC = () => {
  const { message } = App.useApp();

  const { coSos } = useCoSoOptions(0);
  const [facilityId, setFacilityId] = useState<number>(0);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('day'),
  ]);
  const [filterType, setFilterType] = useState<string>('ALL');

  const [data, setData] = useState<BaoCaoThuChiResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCashflow = useCallback(async () => {
    setLoading(true);
    try {
      const fromDateStr = dateRange[0]?.format('YYYY-MM-DD');
      const toDateStr = dateRange[1]?.format('YYYY-MM-DD');
      const fId = facilityId > 0 ? facilityId : undefined;

      const res = await financeReportsApi.getCashflowReport({
        facilityId: fId,
        fromDate: fromDateStr,
        toDate: toDateStr,
      });

      if (res.data?.success && res.data.data) {
        setData(res.data.data);
      } else {
        setData(null);
      }
    } catch {
      message.error('Lỗi khi tải dữ liệu sổ quỹ');
    } finally {
      setLoading(false);
    }
  }, [dateRange, facilityId, message]);

  useEffect(() => {
    fetchCashflow();
  }, [fetchCashflow]);

  // Xây dựng danh sách dòng tiền từ dữ liệu theo thời gian
  const cashBookItems: CashBookItem[] = useMemo(() => {
    if (!data?.theoThoiGian) return [];

    const items: CashBookItem[] = [];
    data.theoThoiGian.forEach((item, index) => {
      if (item.soTienThu > 0) {
        items.push({
          id: `THU_${index}_${item.ngay}`,
          ngayGiaoDich: item.ngay,
          loaiGiaoDich: 'THU',
          hangMuc: 'Thu viện phí, dịch vụ khám & đơn thuốc',
          soChungTu: `BK-THU-${item.ngay.replace(/\//g, '')}`,
          soTienThu: item.soTienThu,
          soTienChi: 0,
          phuongThuc: 'Tổng hợp (Tiền mặt / Chuyển khoản)',
          doiTac: 'Bệnh nhân nội & ngoại trú',
          ghiChu: 'Doanh thu phòng khám trong ngày',
        });
      }
      if (item.soTienChi > 0) {
        items.push({
          id: `CHI_${index}_${item.ngay}`,
          ngayGiaoDich: item.ngay,
          loaiGiaoDich: 'CHI',
          hangMuc: 'Chi mua hàng & thanh toán kho dược',
          soChungTu: `BK-CHI-${item.ngay.replace(/\//g, '')}`,
          soTienThu: 0,
          soTienChi: item.soTienChi,
          phuongThuc: 'Chuyển khoản / Tiền mặt',
          doiTac: 'Nhà cung cấp Dược & Vật tư tiêu hao',
          ghiChu: 'Thanh toán nhập kho định kỳ',
        });
      }
    });

    return items.sort((a, b) => {
      // Sắp xếp ngày giảm dần
      const [dA, mA, yA] = a.ngayGiaoDich.split('/');
      const [dB, mB, yB] = b.ngayGiaoDich.split('/');
      return new Date(+yB, +mB - 1, +dB).getTime() - new Date(+yA, +mA - 1, +dA).getTime();
    });
  }, [data]);

  const filteredItems = useMemo(() => {
    if (filterType === 'ALL') return cashBookItems;
    return cashBookItems.filter((i) => i.loaiGiaoDich === filterType);
  }, [cashBookItems, filterType]);

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '0 ₫';
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  const columns: ColumnsType<CashBookItem> = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Ngày ghi sổ',
      dataIndex: 'ngayGiaoDich',
      key: 'ngayGiaoDich',
      width: 120,
      render: (d) => <Text strong>{d}</Text>,
    },
    {
      title: 'Loại',
      dataIndex: 'loaiGiaoDich',
      key: 'loaiGiaoDich',
      width: 100,
      align: 'center',
      render: (type) =>
        type === 'THU' ? (
          <Tag color="green" icon={<ArrowUpOutlined />}>
            Thu quỹ
          </Tag>
        ) : (
          <Tag color="red" icon={<ArrowDownOutlined />}>
            Chi quỹ
          </Tag>
        ),
    },
    {
      title: 'Mã chứng từ',
      dataIndex: 'soChungTu',
      key: 'soChungTu',
      width: 150,
      render: (val) => <Text code>{val}</Text>,
    },
    {
      title: 'Hạng mục thu / chi',
      dataIndex: 'hangMuc',
      key: 'hangMuc',
      width: 250,
      render: (val) => <Text strong style={{ color: '#0b4f6c' }}>{val}</Text>,
    },
    {
      title: 'Số tiền thu (Vào)',
      dataIndex: 'soTienThu',
      key: 'soTienThu',
      align: 'right',
      width: 150,
      render: (val) =>
        val > 0 ? (
          <Text strong style={{ color: '#16a34a' }}>
            +{formatCurrency(val)}
          </Text>
        ) : (
          '--'
        ),
    },
    {
      title: 'Số tiền chi (Ra)',
      dataIndex: 'soTienChi',
      key: 'soTienChi',
      align: 'right',
      width: 150,
      render: (val) =>
        val > 0 ? (
          <Text strong style={{ color: '#e11d48' }}>
            -{formatCurrency(val)}
          </Text>
        ) : (
          '--'
        ),
    },
    {
      title: 'Đối tượng giao dịch',
      dataIndex: 'doiTac',
      key: 'doiTac',
      width: 220,
      render: (val) => val,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'ghiChu',
      key: 'ghiChu',
      render: (val) => <Text type="secondary">{val}</Text>,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ borderRadius: 8, borderLeft: '4px solid #16a34a' }}>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#64748b' }}>📈 Tổng Dòng Tiền Thu (Inflow)</span>}
              value={data?.tongQuan?.tongThu || 0}
              precision={0}
              suffix="₫"
              valueStyle={{ color: '#16a34a', fontWeight: 700 }}
              formatter={(v) => Number(v).toLocaleString('vi-VN')}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ borderRadius: 8, borderLeft: '4px solid #e11d48' }}>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#64748b' }}>📉 Tổng Dòng Tiền Chi (Outflow)</span>}
              value={data?.tongQuan?.tongChi || 0}
              precision={0}
              suffix="₫"
              valueStyle={{ color: '#e11d48', fontWeight: 700 }}
              formatter={(v) => Number(v).toLocaleString('vi-VN')}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ borderRadius: 8, borderLeft: '4px solid #0b4f6c' }}>
            <Statistic
              title={<span style={{ fontSize: 13, color: '#64748b' }}>⚖️ Dòng Tiền Ròng (Net Cashflow)</span>}
              value={data?.tongQuan?.dongTienRong || 0}
              precision={0}
              suffix="₫"
              valueStyle={{
                color: (data?.tongQuan?.dongTienRong || 0) >= 0 ? '#0b4f6c' : '#e11d48',
                fontWeight: 700,
              }}
              formatter={(v) => Number(v).toLocaleString('vi-VN')}
            />
          </Card>
        </Col>
      </Row>

      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          background: '#fff',
          padding: '12px 16px',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
        }}
      >
        <Space wrap size="middle">
          <RangePicker
            value={dateRange}
            onChange={(dates) => dates && setDateRange(dates as [Dayjs, Dayjs])}
            format="DD/MM/YYYY"
            presets={dateRangePresets}
            allowClear={false}
            style={{ width: 260 }}
          />
          {coSos.length > 1 && (
            <Select
              value={facilityId}
              onChange={setFacilityId}
              style={{ width: 170 }}
              options={[{ value: 0, label: 'Tất cả cơ sở' }, ...coSos.map((c) => ({ value: c.id, label: c.tenCoSo }))]}
            />
          )}
          <Segmented
            value={filterType}
            onChange={(v) => setFilterType(v as string)}
            options={[
              { label: 'Tất cả dòng tiền', value: 'ALL' },
              { label: 'Chỉ dòng thu (+)', value: 'THU' },
              { label: 'Chỉ dòng chi (-)', value: 'CHI' },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchCashflow} loading={loading}>
            Tải lại
          </Button>
        </Space>

        <Space>
          <Button
            icon={<FileExcelOutlined />}
            onClick={() => financeReportsApi.exportReport('cashflow', { facilityId: facilityId > 0 ? facilityId : undefined })}
          >
            Xuất Excel Sổ Quỹ
          </Button>
        </Space>
      </div>

      {/* Sổ cái bảng kê */}
      <Table<CashBookItem>
        rowKey="id"
        columns={columns}
        dataSource={filteredItems}
        loading={loading}
        size="middle"
        pagination={{ pageSize: 15, showTotal: (total) => `Tổng ${total} bút toán ghi sổ` }}
        locale={{
          emptyText: (
            <div style={{ padding: '32px 0', color: '#94a3b8' }}>
              Không có bút toán dòng tiền nào phát sinh trong kỳ báo cáo
            </div>
          ),
        }}
      />
    </div>
  );
};

export default CashBookTable;
