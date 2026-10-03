import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  Tabs,
  Select,
  DatePicker,
  Button,
  Space,
  Typography,
  App,
  Spin,
  Row,
  Col,
} from 'antd';
import {
  ReloadOutlined,
  DownloadOutlined,
  FundOutlined,
  AccountBookOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';

import { useCoSoOptions } from '../../facility/hook/useCoSoOptions';
import { dateRangePresets } from '../../shared/utils/datePresets';
import { financeReportsApi } from '../api/financeReports.api';
import {
  BaoCaoDoanhThuResponseDto,
  BaoCaoCongNoResponseDto,
  BaoCaoThuChiResponseDto,
} from '../types/financeReports.types';

import RevenueReportView from '../components/RevenueReportView';
import DebtReportView from '../components/DebtReportView';
import CashflowReportView from '../components/CashflowReportView';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type ReportTabKey = 'revenue' | 'debt' | 'income';

export const FinanceReportsPage: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Xác định tab từ pathname URL
  const activeTab: ReportTabKey = useMemo(() => {
    if (location.pathname.includes('/finance-reports/debt')) return 'debt';
    if (location.pathname.includes('/finance-reports/income')) return 'income';
    return 'revenue';
  }, [location.pathname]);

  // Bộ lọc
  const { coSos, loading: loadingCoSos } = useCoSoOptions(0);
  const [facilityId, setFacilityId] = useState<number>(0);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('day'),
  ]);

  // Trạng thái dữ liệu từng tab
  const [revenueData, setRevenueData] = useState<BaoCaoDoanhThuResponseDto | null>(null);
  const [debtData, setDebtData] = useState<BaoCaoCongNoResponseDto | null>(null);
  const [cashflowData, setCashflowData] = useState<BaoCaoThuChiResponseDto | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);

  // Tải dữ liệu tương ứng tab hiện tại
  const loadData = useCallback(async () => {
    setLoading(true);
    const fromDateStr = dateRange[0]?.format('YYYY-MM-DD');
    const toDateStr = dateRange[1]?.format('YYYY-MM-DD');
    const fId = facilityId > 0 ? facilityId : undefined;

    try {
      if (activeTab === 'revenue') {
        const res = await financeReportsApi.getRevenueReport({
          facilityId: fId,
          fromDate: fromDateStr,
          toDate: toDateStr,
        });
        if (res.data?.success) {
          setRevenueData(res.data.data);
        } else {
          message.error(res.data?.message || 'Không thể tải báo cáo doanh thu');
        }
      } else if (activeTab === 'debt') {
        const res = await financeReportsApi.getDebtSummaryReport({
          facilityId: fId,
          asOfDate: toDateStr,
        });
        if (res.data?.success) {
          setDebtData(res.data.data);
        } else {
          message.error(res.data?.message || 'Không thể tải báo cáo công nợ');
        }
      } else if (activeTab === 'income') {
        const res = await financeReportsApi.getCashflowReport({
          facilityId: fId,
          fromDate: fromDateStr,
          toDate: toDateStr,
        });
        if (res.data?.success) {
          setCashflowData(res.data.data);
        } else {
          message.error(res.data?.message || 'Không thể tải báo cáo thu - chi');
        }
      }
    } catch (err: any) {
      console.error('Lỗi khi tải báo cáo tài chính:', err);
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  }, [activeTab, facilityId, dateRange, message]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Chuyển tab & đồng bộ URL
  const handleTabChange = (key: string) => {
    navigate(`/finance-reports/${key}`);
  };

  // Xuất file báo cáo
  const handleExport = async () => {
    setExporting(true);
    const reportType = activeTab === 'debt' ? 'debts' : activeTab === 'income' ? 'cashflow' : 'revenue';
    try {
      await financeReportsApi.exportReport(reportType, {
        facilityId: facilityId > 0 ? facilityId : undefined,
        fromDate: dateRange[0]?.format('YYYY-MM-DD'),
        toDate: dateRange[1]?.format('YYYY-MM-DD'),
      });
      message.success('Đã tải xuống file báo cáo thành công!');
    } catch (err: any) {
      console.error('Lỗi xuất báo cáo:', err);
      message.error(err.response?.data?.message || 'Xuất báo cáo thất bại');
    } finally {
      setExporting(false);
    }
  };

  // Tab items config
  const tabItems = [
    {
      key: 'revenue',
      label: (
        <span>
          <FundOutlined /> Doanh thu hệ thống
        </span>
      ),
      children: <RevenueReportView data={revenueData} loading={loading} />,
    },
    {
      key: 'debt',
      label: (
        <span>
          <AccountBookOutlined /> Công nợ tổng hợp (AR & AP)
        </span>
      ),
      children: <DebtReportView data={debtData} loading={loading} />,
    },
    {
      key: 'income',
      label: (
        <span>
          <LineChartOutlined /> Dòng tiền Thu - Chi & Lợi nhuận
        </span>
      ),
      children: <CashflowReportView data={cashflowData} loading={loading} />,
    },
  ];

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header bar */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Title level={4} style={{ margin: 0, color: '#0b4f6c' }}>
              Báo cáo Tài chính & Dòng tiền
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Phân tích doanh thu, cơ cấu công nợ và dòng tiền toàn hệ thống phòng khám
            </Text>
          </Col>

          {/* Action filters */}
          <Col xs={24} md={16} style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
            <Select
              style={{ minWidth: 200 }}
              value={facilityId}
              onChange={(val) => setFacilityId(val)}
              loading={loadingCoSos}
              placeholder="Chọn cơ sở"
              options={[
                { label: 'Tất cả cơ sở', value: 0 },
                ...coSos.map((c) => ({ label: c.ten, value: c.id })),
              ]}
            />

            <RangePicker
              value={dateRange}
              presets={dateRangePresets}
              format="DD/MM/YYYY"
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setDateRange([dates[0], dates[1]]);
                }
              }}
              allowClear={false}
              style={{ width: 260 }}
            />

            <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
              Làm mới
            </Button>

            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
              loading={exporting}
              style={{ background: '#0b4f6c', borderColor: '#0b4f6c' }}
            >
              Xuất Excel / CSV
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Main Tabs view */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          size="large"
          type="line"
        />
      </Card>
    </div>
  );
};

export default FinanceReportsPage;
