import React from 'react';
import { Alert, Card, Col, Row } from 'antd';
import { Wallet, Clock, ShieldCheck, Banknote, AlertTriangle } from 'lucide-react';
import type { PayrollSummaryKpi } from '../payroll.api';

interface PayrollKpiDashboardProps {
  kpi?: PayrollSummaryKpi;
}

const money = (val?: number) => `${Number(val || 0).toLocaleString('vi-VN')} đ`;

export const PayrollKpiDashboard: React.FC<PayrollKpiDashboardProps> = ({ kpi }) => {
  if (!kpi) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      {kpi.soNhanVienPhatSinhNo > 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<AlertTriangle size={16} style={{ color: '#b45309' }} />}
          message={
            <span style={{ fontWeight: 600, fontSize: 13, color: '#92400e' }}>
              Cảnh báo phát sinh dư nợ khấu trừ ({kpi.soNhanVienPhatSinhNo} nhân viên)
            </span>
          }
          description={
            <div style={{ fontSize: 12, color: '#78350f' }}>
              Tổng số tiền khấu trừ vượt quá thu nhập tháng này là{' '}
              <strong style={{ fontFamily: 'monospace' }}>-{money(kpi.tongTienNoKyNay)}</strong>.
              Thực lĩnh đã được đưa về 0 đ và số nợ được bảo lưu cấn trừ vào kỳ sau.
            </div>
          }
          style={{
            marginBottom: 14,
            borderRadius: 6,
            background: '#fffbeb',
            border: '1px solid #fde68a',
            padding: '8px 14px',
          }}
          closable
        />
      )}

      {/* 4 THẺ CHỈ SỐ KPI CHUẨN KẾ TOÁN (NỀN TRẮNG, VIỀN XÁM MỎNG, FONT-MONO FONT-BOLD) */}
      <Row gutter={[14, 14]}>
        {/* THẺ 1: TỔNG QUỸ LƯƠNG */}
        <Col xs={24} sm={12} md={6}>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: '14px 18px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 11.5, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Tổng quỹ lương
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#0f172a',
                  fontFamily: 'monospace',
                  fontVariantNumeric: 'tabular-nums',
                  marginTop: 4,
                }}
              >
                {money(kpi.tongQuyLuong)}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                {kpi.soNhanVien} nhân sự được tính
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#334155',
                border: '1px solid #e2e8f0',
              }}
            >
              <Wallet size={19} />
            </div>
          </div>
        </Col>

        {/* THẺ 2: LÀM THÊM GIỜ (OT) */}
        <Col xs={24} sm={12} md={6}>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: '14px 18px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 11.5, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Làm thêm giờ (OT)
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#0f172a',
                  fontFamily: 'monospace',
                  fontVariantNumeric: 'tabular-nums',
                  marginTop: 4,
                }}
              >
                {money(kpi.tongLamThemOT)}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                Hệ số ×1.5 ngoài giờ
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#334155',
                border: '1px solid #e2e8f0',
              }}
            >
              <Clock size={19} />
            </div>
          </div>
        </Col>

        {/* THẺ 3: BẢO HIỂM TRÍCH NỘP */}
        <Col xs={24} sm={12} md={6}>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: '14px 18px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 11.5, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Bảo hiểm trích nộp
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#be123c',
                  fontFamily: 'monospace',
                  fontVariantNumeric: 'tabular-nums',
                  marginTop: 4,
                }}
              >
                -{money(kpi.tongBaoHiem)}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                Trích 10.5% từ lương cơ bản
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#334155',
                border: '1px solid #e2e8f0',
              }}
            >
              <ShieldCheck size={19} />
            </div>
          </div>
        </Col>

        {/* THẺ 4: TỔNG THỰC LĨNH */}
        <Col xs={24} sm={12} md={6}>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: '14px 18px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 11.5, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Tổng thực lĩnh
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#0f172a',
                  fontFamily: 'monospace',
                  fontVariantNumeric: 'tabular-nums',
                  marginTop: 4,
                }}
              >
                {money(kpi.tongThucLinh)}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                Tổng thực chi chuyển khoản
              </div>
            </div>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#334155',
                border: '1px solid #e2e8f0',
              }}
            >
              <Banknote size={19} />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};
