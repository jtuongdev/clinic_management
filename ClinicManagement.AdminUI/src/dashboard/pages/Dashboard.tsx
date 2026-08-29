import { User, Stethoscope, Wallet, Clock, HandCoins, Plus, Calendar, FileText, Bed, BarChart } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { ActivityItem } from '../components/ActivityItem';
import { QuickAction } from '../components/QuickAction';
import { useAuth } from '../../Auth/context/AuthProvider';
import { useThongKeBenhNhan } from '../../patient/hook/useThongKeBenhNhan';

export const Dashboard = () => {
  const { user } = useAuth();
  const { data: thongKe, loading } = useThongKeBenhNhan();


  const stats = [
    { prefix: <User size={20} />,
      color: '#1890ff',
      value: thongKe?.tongBenhNhan ?? 0,
      title: 'Tổng bệnh nhân',
      change: { value: 12.5, type: 'up' as const }, },
    { prefix: <Stethoscope size={20} />, color: '#2e8b57', value: '56', title: 'Lượt khám hôm nay', change: { value: 8.3, type: 'up' as const } },
    { prefix: <Wallet size={20} />, color: '#faad14', value: '1,2 tỷ', title: 'Doanh thu tháng', change: { value: 3.7, type: 'down' as const } },
    { prefix: <HandCoins size={20} />, color: '#ff4d4f', value: '280 tr', title: 'Công nợ quá hạn', change: { value: 5.2, type: 'up' as const } },
    { prefix: <Clock size={20} />, color: '#722ed1', value: '12', title: 'Chờ khám', change: { value: 2.1, type: 'down' as const } },
  ];

  const activities = [
    { dotColor: 'blue' as const, text: 'Bệnh nhân được tạo mới', highlight: 'Nguyễn Thị An', time: '10 phút trước · Khoa Nội' },
    { dotColor: 'green' as const, text: 'Đơn thuốc mới kê cho', highlight: 'BN-10234', time: '25 phút trước · Bs. Tuấn' },
    { dotColor: 'orange' as const, text: 'Hóa đơn đã thanh toán thành công', highlight: 'VP-001', time: '1 giờ trước · 12.500.000₫' },
    { dotColor: 'red' as const, text: 'Công nợ quá hạn 15 ngày', highlight: 'BN-10234', time: '2 giờ trước · 2.300.000₫' },
    { dotColor: 'blue' as const, text: 'Phiếu thu được xác nhận', highlight: 'PT-005', time: '3 giờ trước · 8.700.000₫' },
  ];

  const quickActions = [
    { icon: <Plus size={18} />, label: 'Thêm bệnh nhân' },
    { icon: <Calendar size={18} />, label: 'Tạo lượt khám' },
    { icon: <FileText size={18} />, label: 'Tạo hóa đơn' },
    { icon: <HandCoins size={18} />, label: 'Thu công nợ' },
    { icon: <Bed size={18} />, label: 'Nhập viện' },
    { icon: <BarChart size={18} />, label: 'Báo cáo nhanh' },
  ];

  const debts = [
    { debtor: 'Nguyễn Thị An', badge: 'Quá hạn 15d', badgeColor: 'danger' as const, amount: '-2.300.000₫', amountColor: 'overdue' as const },
    { debtor: 'Trần Văn Bình', badge: 'Sắp hạn', badgeColor: 'warning' as const, amount: '1.500.000₫', amountColor: 'pending' as const },
    { debtor: 'Công ty Dược ABC', badge: 'NCC', badgeColor: 'default' as const, amount: '4.200.000₫', amountColor: 'pending' as const },
    { debtor: 'Lê Thị Hoa', badge: 'Đã thanh toán', badgeColor: 'success' as const, amount: '0₫', amountColor: 'paid' as const },
  ];

  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#0b2a3c', letterSpacing: '-0.2px' }}>Tổng quan bệnh viện</h2>
          <p style={{ fontSize: 13, color: '#6a7f96', marginTop: 2 }}>
            Chào mừng <strong>{user?.fullName || 'Bác sĩ'}</strong>, hôm nay có <strong>5</strong> bệnh nhân đang chờ khám
          </p>
        </div>
        <div style={{ fontSize: 12, color: '#4a637a', background: '#fff', padding: '6px 14px', borderRadius: 6, border: '1px solid #e9edf4', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
          <span>📅</span> {new Date().toLocaleDateString('vi-VN')}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 24 }}>
        {stats.map((stat, idx) => (
          <StatCard key={idx} title={stat.title} value={stat.value} prefix={stat.prefix} color={stat.color} />
        ))}
      </div>

      {/* Grid 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Left: Activity */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e9edf4', padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #f0f4fa' }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#0b2a3c', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#0b4f6c' }}>⚡</span> Hoạt động gần đây
            </span>
            <span style={{ fontSize: 12, color: '#0b4f6c', cursor: 'pointer', fontWeight: 500 }}>Xem tất cả →</span>
          </div>
          {activities.map((item, idx) => (
            <ActivityItem key={idx} dotColor={item.dotColor} time={item.time} highlight={item.highlight}>
              {item.text}
            </ActivityItem>
          ))}
        </div>

        {/* Right: Quick Actions + Debts */}
        <div>
          {/* Quick Actions */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e9edf4', padding: '16px 18px', marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #f0f4fa' }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: '#0b2a3c', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#0b4f6c' }}>⚡</span> Tác vụ nhanh
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {quickActions.map((action, idx) => (
                <QuickAction key={idx} icon={action.icon} label={action.label} />
              ))}
            </div>
          </div>

          {/* Debts */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e9edf4', padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #f0f4fa' }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: '#0b2a3c', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#c0392b' }}>🤝</span> Công nợ cần xử lý
              </span>
              <span style={{ fontSize: 12, color: '#0b4f6c', cursor: 'pointer', fontWeight: 500 }}>Xem tất cả →</span>
            </div>
            {debts.map((debt, idx) => {
              const badgeStyles = {
                danger: { bg: '#fde8e8', color: '#c0392b' },
                warning: { bg: '#fdf0e0', color: '#d48a2c' },
                success: { bg: '#e2f0e6', color: '#2e8b57' },
                default: { bg: '#ecf3fa', color: '#0b4f6c' },
              };
              const amountStyles = {
                overdue: '#c0392b',
                pending: '#d48a2c',
                paid: '#2e8b57',
              };
              const style = badgeStyles[debt.badgeColor] || badgeStyles.default;
              return (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f4fa', fontSize: 13 }}>
                  <span style={{ fontWeight: 500 }}>
                    {debt.debtor}{' '}
                    <span style={{ fontSize: 10, padding: '1px 8px', borderRadius: 12, background: style.bg, color: style.color }}>
                      {debt.badge}
                    </span>
                  </span>
                  <span style={{ fontWeight: 600, color: amountStyles[debt.amountColor] || '#1e293b' }}>{debt.amount}</span>
                </div>
              );
            })}
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f0f4fa', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 500 }}>Tổng công nợ quá hạn</span>
              <span style={{ fontWeight: 700, color: '#c0392b' }}>8.000.000₫</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};