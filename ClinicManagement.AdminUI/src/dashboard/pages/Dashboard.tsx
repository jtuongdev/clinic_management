import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Stethoscope, Wallet, Clock, HandCoins, Plus, 
  Calendar, FileText, Bed, BarChart, RefreshCw, AlertCircle 
} from 'lucide-react';
import { message, Empty, Alert, Button } from 'antd';
import { StatCard } from '../components/StatCard';
import { ActivityItem } from '../components/ActivityItem';
import { QuickAction } from '../components/QuickAction';
import { useAuth } from '../../Auth/context/AuthProvider';
import { dashboardApi, DashboardOverviewDto } from '../api/dashboard.api';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardOverviewDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tích hợp API Backend: GET /api/admin/dashboard/overview
  const fetchOverview = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // Không truyền facilityId để mặc định lấy toàn bộ hệ thống phòng khám
      const res = await dashboardApi.getOverview();
      if (res.data?.success && res.data.data) {
        setDashboardData(res.data.data);
      } else {
        const msg = (res.data as any)?.message || 'Không thể lấy dữ liệu thống kê tổng quan';
        setErrorMessage(msg);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể kết nối đến máy chủ hoặc lỗi tải dữ liệu';
      setErrorMessage(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const formatCurrency = (val?: number) => {
    if (!val) return '0 đ';
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)} tỷ`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(0)} tr`;
    return val.toLocaleString('vi-VN') + ' đ';
  };

  const isInitialLoading = loading && !dashboardData;

  const stats = [
    {
      prefix: <User size={20} />,
      color: '#1890ff',
      value: dashboardData?.totalPatients ?? 0,
      title: 'Tổng bệnh nhân',
    },
    {
      prefix: <Stethoscope size={20} />,
      color: '#2e8b57',
      value: dashboardData?.visitsToday ?? 0,
      title: 'Lượt khám hôm nay',
    },
    {
      prefix: <Wallet size={20} />,
      color: '#faad14',
      value: dashboardData ? formatCurrency(dashboardData.revenueMonth) : '0 đ',
      title: 'Doanh thu tháng',
    },
    {
      prefix: <HandCoins size={20} />,
      color: '#ff4d4f',
      value: dashboardData ? formatCurrency(dashboardData.overdueDebt) : '0 đ',
      title: 'Công nợ quá hạn',
    },
    {
      prefix: <Clock size={20} />,
      color: '#722ed1',
      value: dashboardData?.pendingVisits ?? 0,
      title: 'Chờ khám',
    },
  ];

  const activities = (dashboardData?.activities && dashboardData.activities.length > 0)
    ? dashboardData.activities
    : [];

  const quickActions = [
    { 
      icon: <Plus size={18} />, 
      label: 'Thêm bệnh nhân',
      onClick: () => navigate('/patients') 
    },
    { 
      icon: <Calendar size={18} />, 
      label: 'Tạo lượt khám',
      onClick: () => navigate('/examination') 
    },
    { 
      icon: <FileText size={18} />, 
      label: 'Tạo hóa đơn',
      onClick: () => navigate('/invoices') 
    },
    { 
      icon: <HandCoins size={18} />, 
      label: 'Thu công nợ',
      onClick: () => navigate('/debts') 
    },
    { 
      icon: <Bed size={18} />, 
      label: 'Nhập viện',
      onClick: () => navigate('/examination') 
    },
    { 
      icon: <BarChart size={18} />, 
      label: 'Báo cáo nhanh',
      onClick: () => navigate('/examination/reports') 
    },
  ];

  const debts = (dashboardData?.overdueDebts && dashboardData.overdueDebts.length > 0)
    ? dashboardData.overdueDebts
    : [];

  const formattedDate = dashboardData?.date 
    ? new Date(dashboardData.date).toLocaleDateString('vi-VN')
    : new Date().toLocaleDateString('vi-VN');

  return (
    <div style={{ padding: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#0b2a3c', letterSpacing: '-0.2px', margin: 0 }}>
            Tổng quan bệnh viện
          </h2>
          <p style={{ fontSize: 13, color: '#6a7f96', marginTop: 4, marginBottom: 0 }}>
            Chào mừng <strong>{user?.fullName || 'Quản trị viên'}</strong>, hôm nay có <strong>{dashboardData?.pendingVisits ?? 0}</strong> bệnh nhân đang chờ khám
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={fetchOverview}
            disabled={loading}
            style={{
              background: '#fff', 
              border: '1px solid #e9edf4', 
              borderRadius: 6,
              padding: '6px 14px', 
              fontSize: 12, 
              cursor: loading ? 'not-allowed' : 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6, 
              color: '#4a637a',
              transition: 'all 0.2s',
            }}
          >
            <RefreshCw size={14} className={loading ? 'fa-spin' : ''} /> Cập nhật
          </button>
          <div style={{ fontSize: 12, color: '#4a637a', background: '#fff', padding: '6px 14px', borderRadius: 6, border: '1px solid #e9edf4', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
            <span>📅</span> {formattedDate}
          </div>
        </div>
      </div>

      {/* Alert Error if any */}
      {errorMessage && (
        <Alert
          type="error"
          showIcon
          message="Lỗi tải dữ liệu bảng điều khiển"
          description={errorMessage}
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" type="primary" danger onClick={fetchOverview}>
              Thử lại
            </Button>
          }
        />
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 24 }}>
        {stats.map((stat, idx) => (
          <StatCard 
            key={idx} 
            title={stat.title} 
            value={stat.value} 
            prefix={stat.prefix} 
            color={stat.color} 
            loading={isInitialLoading} 
          />
        ))}
      </div>

      {/* Grid 2: Left Activities, Right Quick Actions & Debts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Left: Activity */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e9edf4', padding: '16px 18px', minHeight: 320, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #f0f4fa' }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#0b2a3c', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#0b4f6c' }}>⚡</span> Hoạt động gần đây
            </span>
            <span 
              onClick={() => navigate('/settings')}
              style={{ fontSize: 12, color: '#0b4f6c', cursor: 'pointer', fontWeight: 500 }}
            >
              Xem tất cả →
            </span>
          </div>

          <div style={{ flex: 1 }}>
            {activities.length > 0 ? (
              activities.map((item, idx) => (
                <ActivityItem key={idx} dotColor={item.dotColor} time={item.time} highlight={item.highlight}>
                  {item.text}
                </ActivityItem>
              ))
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 180 }}>
                <Empty 
                  image={Empty.PRESENTED_IMAGE_SIMPLE} 
                  description="Chưa có hoạt động gần đây" 
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Actions + Debts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quick Actions */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e9edf4', padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #f0f4fa' }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: '#0b2a3c', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#0b4f6c' }}>⚡</span> Tác vụ nhanh
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {quickActions.map((action, idx) => (
                <QuickAction 
                  key={idx} 
                  icon={action.icon} 
                  label={action.label} 
                  onClick={action.onClick} 
                />
              ))}
            </div>
          </div>

          {/* Debts */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e9edf4', padding: '16px 18px', flex: 1, minHeight: 200, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #f0f4fa' }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: '#0b2a3c', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#0b4f6c' }}>💳</span> Theo dõi công nợ
              </span>
              <span 
                onClick={() => navigate('/debts')}
                style={{ fontSize: 12, color: '#0b4f6c', cursor: 'pointer', fontWeight: 500 }}
              >
                Chi tiết →
              </span>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {debts.length > 0 ? (
                debts.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: idx < debts.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{item.debtor}</div>
                      <span style={{ 
                        fontSize: 11, padding: '1px 6px', borderRadius: 4, 
                        background: item.badgeColor === 'danger' ? '#fef2f2' : item.badgeColor === 'warning' ? '#fffbeb' : '#f0fdf4',
                        color: item.badgeColor === 'danger' ? '#dc2626' : item.badgeColor === 'warning' ? '#d97706' : '#16a34a' 
                      }}>
                        {item.badge}
                      </span>
                    </div>
                    <strong style={{ fontSize: 13, color: item.amountColor === 'overdue' ? '#dc2626' : '#0f172a' }}>
                      {item.amount}
                    </strong>
                  </div>
                ))
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 120 }}>
                  <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    description="Không có công nợ quá hạn" 
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
