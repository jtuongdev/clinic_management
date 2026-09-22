import React from 'react';
import { Alert, Card, Col, Row, Statistic } from 'antd';
import { Wallet, Clock, ShieldCheck, Banknote, AlertTriangle } from 'lucide-react';
import type { PayrollSummaryKpi } from '../payroll.api';

interface PayrollKpiDashboardProps {
  kpi?: PayrollSummaryKpi;
}

const money = (val?: number) => `${Number(val || 0).toLocaleString('vi-VN')} đ`;

export const PayrollKpiDashboard: React.FC<PayrollKpiDashboardProps> = ({ kpi }) => {
  if (!kpi) return null;

  return (
    <div style={{ marginBottom: 20 }}>
      {kpi.soNhanVienPhatSinhNo > 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<AlertTriangle size={18} style={{ color: '#d97706' }} />}
          message={
            <span style={{ fontWeight: 600 }}>
              Cảnh báo phát sinh dư nợ khấu trừ ({kpi.soNhanVienPhatSinhNo} nhân viên)
            </span>
          }
          description={
            <div>
              Tổng số tiền khấu trừ vượt quá thu nhập tháng này là{' '}
              <strong style={{ color: '#b45309' }}>-{money(kpi.tongTienNoKyNay)}</strong>.
              Thực lĩnh của nhân viên đã được đưa về 0 đ và số nợ được bảo lưu để cấn trừ vào kỳ lương tiếp theo.
            </div>
          }
          style={{ marginBottom: 16, borderRadius: 8 }}
          closable
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 10,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
            styles={{ body: { padding: '16px 20px' } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>TỔNG QUỸ LƯƠNG</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>
                  {money(kpi.tongQuyLuong)}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  {kpi.soNhanVien} nhân viên được tính
                </div>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: '#e0f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284c7',
                }}
              >
                <Wallet size={22} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 10,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
            styles={{ body: { padding: '16px 20px' } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>LÀM THÊM GIỜ (OT)</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#d97706', marginTop: 4 }}>
                  {money(kpi.tongLamThemOT)}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Hệ số 150% ngoài giờ</div>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#d97706',
                }}
              >
                <Clock size={22} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 10,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
            styles={{ body: { padding: '16px 20px' } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>BẢO HIỂM TRÍCH NỘP</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#6366f1', marginTop: 4 }}>
                  {money(kpi.tongBaoHiem)}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Trích 10.5% từ LCB</div>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: '#e0e7ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6366f1',
                }}
              >
                <ShieldCheck size={22} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 10,
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
            styles={{ body: { padding: '16px 20px' } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, color: '#166534', fontWeight: 600 }}>TỔNG THỰC LĨNH</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#15803d', marginTop: 4 }}>
                  {money(kpi.tongThucLinh)}
                </div>
                <div style={{ fontSize: 12, color: '#16a34a', marginTop: 2 }}>Thực chi cho người lao động</div>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#15803d',
                }}
              >
                <Banknote size={22} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
