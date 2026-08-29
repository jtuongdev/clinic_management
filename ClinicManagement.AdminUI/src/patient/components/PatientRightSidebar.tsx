import { Card, Progress, Statistic, Row, Col } from 'antd';
import {
  PieChartOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { DepartmentStat, GenderStat, TodayStat } from '../type/patient.types';
import './style/PatientRightSidebar.css'

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 240 }}>
      <Card
        size="small"
        title={
          <span>
            <PieChartOutlined style={{ marginRight: 8, color: '#3b82f6' }} />
            Phân bố theo khoa
          </span>
        }
        style={{ borderRadius: 12 }}
      >
        {deptDistribution.map((dept) => (
          <div key={dept.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12 }}>
            <span style={{ color: '#64748b' }}>{dept.name}</span>
            <span style={{ fontWeight: 600 }}>
              {dept.count}
              <span style={{ display: 'inline-block', height: 6, borderRadius: 3, marginLeft: 6, background: '#3b82f6', width: Math.round((dept.count / maxDept) * 60) }} />
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
        style={{ borderRadius: 12 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12 }}>
          <span style={{ color: '#64748b' }}>Nam</span>
          <span style={{ fontWeight: 600 }}>
            {genderStats.male} ({genderStats.total > 0 ? Math.round((genderStats.male / genderStats.total) * 100) : 0}%)
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12 }}>
          <span style={{ color: '#64748b' }}>Nữ</span>
          <span style={{ fontWeight: 600 }}>
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
        style={{ borderRadius: 12 }}
      >
        <Row gutter={[8, 8]}>
          <Col span={12}>
            <Statistic title="Tổng" value={todayStats.today} styles={{ content: { fontSize: 16 } }} />
          </Col>
          <Col span={12}>
            <Statistic title="Đang khám" value={todayStats.treating} styles={{ content: { fontSize: 16 } }} />
          </Col>
          <Col span={24}>
            <Statistic title="Chờ khám" value={todayStats.waiting} styles={{ content: { fontSize: 16 } }} />
          </Col>
        </Row>
        <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 6 }}>
          {new Date().toLocaleDateString('vi-VN')}
        </div>
      </Card>
    </div>
  );
};
