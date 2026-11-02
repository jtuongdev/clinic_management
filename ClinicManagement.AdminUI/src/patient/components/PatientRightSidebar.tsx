import { Card, Progress, Statistic, Row, Col } from 'antd';
import {
  PieChartOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { DepartmentStat, GenderStat, TodayStat } from '../type/patient.types';

const sidebarStyles = `
.patient-right-sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.patient-right-sidebar .ant-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  background: #fff;
}
.patient-right-sidebar .ant-card .ant-card-head {
  padding: 10px 16px;
  min-height: 40px;
  border-bottom: 1px solid #f1f5f9;
}
.patient-right-sidebar .ant-card .ant-card-head .ant-card-head-title {
  font-weight: 600;
  font-size: 13px;
  color: #0f172a;
}
.patient-right-sidebar .ant-card .ant-card-body {
  padding: 10px 16px 14px;
}
.patient-right-sidebar .stat-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 12px;
  border-bottom: 1px solid #f5f7fb;
}
.patient-right-sidebar .stat-item:last-child {
  border-bottom: none;
}
.patient-right-sidebar .stat-item .label {
  color: #64748b;
}
.patient-right-sidebar .stat-item .value {
  font-weight: 600;
  color: #0f172a;
}
.patient-right-sidebar .stat-item .value .bar {
  display: inline-block;
  height: 6px;
  border-radius: 3px;
  margin-left: 6px;
  background: #3b82f6;
  vertical-align: middle;
}
.patient-right-sidebar .ant-statistic .ant-statistic-title {
  font-size: 11px;
  color: #64748b;
}
.patient-right-sidebar .ant-statistic .ant-statistic-content {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}
@media (max-width: 1024px) {
  .patient-right-sidebar {
    display: none;
  }
}
@media (max-width: 820px) {
  .patient-right-sidebar {
    display: flex;
  }
}
`;

interface PatientRightSidebarProps {
  deptDistribution: DepartmentStat[];
  genderStats: GenderStat;
  todayStats: TodayStat;
}

export const PatientRightSidebar = ({
  deptDistribution,
  genderStats,
  todayStats,
}: PatientRightSidebarProps) => {
  const maxDept = Math.max(...deptDistribution.map(d => d.count), 1);

  return (
    <>
      <style>{sidebarStyles}</style>
      <div className="patient-right-sidebar">
      <Card
        size="small"
        title={
          <span>
            <PieChartOutlined style={{ marginRight: 8, color: '#3b82f6' }} />
            Phân bố theo khoa
          </span>
        }
      >
        {deptDistribution.map((dept) => (
          <div key={dept.name} className="stat-item">
            <span className="label">{dept.name}</span>
            <span className="value">
              {dept.count}
              <span className="bar" style={{ width: Math.round((dept.count / maxDept) * 60) }} />
            </span>
          </div>
        ))}
      </Card>

      <Card
        size="small"
        title={
          <span>
            <TeamOutlined style={{ marginRight: 8, color: '#3b82f6' }} />
            Giới tính
          </span>
        }
      >
        <div className="stat-item">
          <span className="label">Nam</span>
          <span className="value">
            {genderStats.male} ({genderStats.total > 0 ? Math.round((genderStats.male / genderStats.total) * 100) : 0}%)
          </span>
        </div>
        <div className="stat-item">
          <span className="label">Nữ</span>
          <span className="value">
            {genderStats.female} ({genderStats.total > 0 ? Math.round((genderStats.female / genderStats.total) * 100) : 0}%)
          </span>
        </div>
        <Progress
          percent={genderStats.total > 0 ? Math.round((genderStats.male / genderStats.total) * 100) : 0}
          status="active"
          strokeColor="#3b82f6"
          showInfo={false}
        />
      </Card>

      <Card
        size="small"
        title={
          <span>
            <ClockCircleOutlined style={{ marginRight: 8, color: '#3b82f6' }} />
            Hôm nay
          </span>
        }
      >
        <Row gutter={[8, 8]}>
          <Col span={12}>
            <Statistic title="Tổng" value={todayStats.today} valueStyle={{ fontSize: 16, fontWeight: 600 }} />
          </Col>
          <Col span={12}>
            <Statistic title="Đang khám" value={todayStats.treating} valueStyle={{ fontSize: 16, fontWeight: 600, color: '#0284c7' }} />
          </Col>
          <Col span={24}>
            <Statistic title="Chờ khám" value={todayStats.waiting} valueStyle={{ fontSize: 16, fontWeight: 600, color: '#d97706' }} />
          </Col>
        </Row>
        <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 6 }}>
          {new Date().toLocaleDateString('vi-VN')}
        </div>
      </Card>
    </div>
    </>
  );
};
