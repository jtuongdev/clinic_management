import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Tooltip,
  Empty,
  Spin,
  Tabs,
  Badge,
} from 'antd';
import {
  IdcardOutlined,
  CalendarOutlined,
  ReloadOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  SafetyCertificateOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import {
  BenhNhanProfileDto,
  LuotKhamSummaryDto,
  HoaDonSummaryDto,
  TienSuBenhDto,
  BaoHiemDto,
} from '../type/profile.patient.type';
import { detailpatientApi } from '../api/detail.patient.api';

export interface PatientDetailViewProps {
  patientId: number | null;
  onRefresh?: () => void;
}

export const PatientDetailView: React.FC<PatientDetailViewProps> = ({
  patientId,
}) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<BenhNhanProfileDto | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const res = await detailpatientApi.getProfile(id);
      if (res.data.success && res.data.data) {
        setProfile(res.data.data);
      } else {
        setProfile(null);
      }
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (patientId && patientId > 0) {
      void fetchProfile(patientId);
    } else {
      setProfile(null);
    }
  }, [patientId, fetchProfile]);

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '0 ₫';
    return val.toLocaleString('vi-VN') + ' ₫';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '--';
    try {
      const d = new Date(dateStr);
      return (
        d.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }) +
        ' ' +
        d.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    } catch {
      return dateStr;
    }
  };

  const calculateAge = (dobStr?: string) => {
    if (!dobStr) return '';
    try {
      const birth = new Date(dobStr);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--;
      }
      return age > 0 ? `${age} tuổi` : '';
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div
        className="patient-detail-panel"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Spin size="large" description="Đang tải dữ liệu hồ sơ bệnh nhân..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        className="patient-detail-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
        }}
      >
        <Empty
          image={<UserOutlined style={{ fontSize: 44, color: '#94a3b8' }} />}
          description={
            <div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13.5,
                  color: '#334155',
                  marginTop: 8,
                }}
              >
                Chưa chọn bệnh nhân
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#64748b',
                  marginTop: 4,
                  maxWidth: 320,
                }}
              >
                Chọn một dòng trong danh sách bên trái để xem hồ sơ bệnh án, lịch sử
                khám và hóa đơn viện phí.
              </div>
            </div>
          }
        />
      </div>
    );
  }

  const isFemale = profile.gioiTinh === 'F' || profile.gioiTinh === 'Nữ';
  const fullName = profile.hoTen || `${profile.ho || ''} ${profile.ten || ''}`.trim() || `Bệnh nhân #${profile.id}`;
  const patientCode = profile.maBenhNhanNoiBo || `BN-${profile.id}`;
  const age = calculateAge(profile.ngaySinh);

  // Columns for Visits Sub-Table
  const visitColumns: ColumnsType<LuotKhamSummaryDto> = [
    {
      title: 'STT',
      key: 'stt',
      width: 45,
      align: 'center',
      render: (_, __, i) => <span style={{ color: '#64748b', fontSize: 11.5 }}>{i + 1}</span>,
    },
    {
      title: 'Mã LK',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: number) => (
        <span
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontWeight: 700,
            fontSize: 11.5,
            color: '#0284c7',
          }}
        >
          LK-{id}
        </span>
      ),
    },
    {
      title: 'Thời gian khám',
      dataIndex: 'ngayKham',
      key: 'ngayKham',
      width: 120,
      render: (val) => (
        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11.5, color: '#334155' }}>
          {formatDateTime(val)}
        </span>
      ),
    },
    {
      title: 'Bác sĩ phụ trách',
      dataIndex: 'bacSi',
      key: 'bacSi',
      width: 130,
      render: (val) => <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 12 }}>{val || '--'}</span>,
    },
    {
      title: 'Khoa / Phòng',
      dataIndex: 'khoa',
      key: 'khoa',
      width: 110,
      render: (val) => <span style={{ color: '#475569', fontSize: 12 }}>{val || '--'}</span>,
    },
    {
      title: 'Lý do khám',
      dataIndex: 'lyDoKham',
      key: 'lyDoKham',
      render: (val) => <span style={{ color: '#334155', fontSize: 12 }}>{val || '--'}</span>,
    },
    {
      title: 'Chẩn đoán chính',
      dataIndex: 'chanDoanChinh',
      key: 'chanDoanChinh',
      render: (val) => (
        <span style={{ color: '#0f172a', fontWeight: 500, fontSize: 12 }}>
          {val || 'Chưa có chẩn đoán'}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 95,
      align: 'center',
      render: (status: string) => {
        let color = '#475569';
        let bg = '#f1f5f9';
        let border = '#cbd5e1';
        let text = status || 'Mới tiếp nhận';

        if (status === 'DANG_KHAM' || status === 'Đang khám') {
          color = '#0284c7';
          bg = '#e0f2fe';
          border = '#7dd3fc';
          text = 'Đang khám';
        } else if (status === 'HOAN_THANH' || status === 'Hoàn thành' || status === 'DA_KHAM') {
          color = '#16a34a';
          bg = '#dcfce7';
          border = '#86efac';
          text = 'Hoàn thành';
        } else if (status === 'CHO_KHAM' || status === 'Chờ khám') {
          color = '#d97706';
          bg = '#fef3c7';
          border = '#fde68a';
          text = 'Chờ khám';
        }

        return (
          <span
            style={{
              display: 'inline-block',
              padding: '1px 6px',
              borderRadius: 3,
              fontSize: 10.5,
              fontWeight: 600,
              color,
              background: bg,
              border: `1px solid ${border}`,
              whiteSpace: 'nowrap',
            }}
          >
            {text}
          </span>
        );
      },
    },
  ];

  // Columns for Invoices Sub-Table
  const invoiceColumns: ColumnsType<HoaDonSummaryDto> = [
    {
      title: 'STT',
      key: 'stt',
      width: 45,
      align: 'center',
      render: (_, __, i) => <span style={{ color: '#64748b', fontSize: 11.5 }}>{i + 1}</span>,
    },
    {
      title: 'Số HĐ',
      dataIndex: 'soHoaDon',
      key: 'soHoaDon',
      width: 90,
      render: (code: string) => (
        <span
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontWeight: 700,
            fontSize: 11.5,
            color: '#0f172a',
          }}
        >
          {code}
        </span>
      ),
    },
    {
      title: 'Ngày lập HĐ',
      dataIndex: 'ngayLap',
      key: 'ngayLap',
      width: 110,
      render: (d) => (
        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11.5, color: '#334155' }}>
          {formatDate(d)}
        </span>
      ),
    },
    {
      title: 'Tổng viện phí',
      dataIndex: 'tongTien',
      key: 'tongTien',
      width: 110,
      align: 'right',
      render: (val: number) => (
        <span
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 600,
            fontSize: 11.5,
            color: '#0f172a',
          }}
        >
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      title: 'Đã thanh toán',
      dataIndex: 'daThanhToan',
      key: 'daThanhToan',
      width: 110,
      align: 'right',
      render: (val: number) => (
        <span
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 600,
            fontSize: 11.5,
            color: '#16a34a',
          }}
        >
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      title: 'Còn nợ',
      dataIndex: 'conNo',
      key: 'conNo',
      width: 100,
      align: 'right',
      render: (val: number) => (
        <span
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 700,
            fontSize: 11.5,
            color: val > 0 ? '#dc2626' : '#64748b',
          }}
        >
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 100,
      align: 'center',
      render: (status: string) => {
        let color = '#374151';
        let bg = '#f3f4f6';
        let border = '#d1d5db';
        let text = status;

        if (status === 'DA_THANH_TOAN') {
          color = '#14532d';
          bg = '#f0fdf4';
          border = '#86efac';
          text = 'Đã thanh toán';
        } else if (status === 'CHO_THANH_TOAN') {
          color = '#713f12';
          bg = '#fefce8';
          border = '#eab308';
          text = 'Chờ thanh toán';
        } else if (status === 'THANH_TOAN_MOT_PHAN') {
          color = '#0369a1';
          bg = '#f0f9ff';
          border = '#bae6fd';
          text = 'TT 1 phần';
        }

        return (
          <span
            style={{
              display: 'inline-block',
              padding: '1px 6px',
              borderRadius: 3,
              fontSize: 10.5,
              fontWeight: 600,
              color,
              background: bg,
              border: `1px solid ${border}`,
              whiteSpace: 'nowrap',
            }}
          >
            {text}
          </span>
        );
      },
    },
  ];

  // Columns for Medical History Sub-Table
  const historyColumns: ColumnsType<TienSuBenhDto> = [
    {
      title: 'STT',
      key: 'stt',
      width: 45,
      align: 'center',
      render: (_, __, i) => <span style={{ color: '#64748b', fontSize: 11.5 }}>{i + 1}</span>,
    },
    {
      title: 'Phân loại',
      dataIndex: 'loaiTienSu',
      key: 'loaiTienSu',
      width: 130,
      render: (val: string) => {
        const isAllergy = val?.toLowerCase().includes('dị ứng') || val?.toLowerCase().includes('allergy');
        return (
          <Tag
            color={isAllergy ? 'error' : 'default'}
            style={{ fontSize: 11, borderRadius: 3, margin: 0 }}
          >
            {val || 'Tiền sử bệnh'}
          </Tag>
        );
      },
    },
    {
      title: 'Tên bệnh / Yếu tố nguy cơ',
      dataIndex: 'ten',
      key: 'ten',
      render: (val: string) => (
        <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 12 }}>{val}</span>
      ),
    },
    {
      title: 'Ghi chú & Chỉ định',
      dataIndex: 'ghiChu',
      key: 'ghiChu',
      render: (val: string) => <span style={{ color: '#475569', fontSize: 12 }}>{val || '--'}</span>,
    },
    {
      title: 'Ngày ghi nhận',
      dataIndex: 'ngayGhiNhan',
      key: 'ngayGhiNhan',
      width: 120,
      render: (d: string) => (
        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11.5, color: '#64748b' }}>
          {formatDate(d)}
        </span>
      ),
    },
  ];

  // Columns for Insurance Sub-Table
  const insuranceColumns: ColumnsType<BaoHiemDto> = [
    {
      title: 'STT',
      key: 'stt',
      width: 45,
      align: 'center',
      render: (_, __, i) => <span style={{ color: '#64748b', fontSize: 11.5 }}>{i + 1}</span>,
    },
    {
      title: 'Loại bảo hiểm',
      dataIndex: 'loaiBaoHiem',
      key: 'loaiBaoHiem',
      width: 120,
      render: (val: string) => (
        <span style={{ fontWeight: 600, color: '#0f172a', fontSize: 12 }}>{val || 'BHYT'}</span>
      ),
    },
    {
      title: 'Số thẻ BHYT',
      dataIndex: 'soThe',
      key: 'soThe',
      width: 150,
      render: (val: string) => (
        <span
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontWeight: 700,
            fontSize: 12,
            color: '#0284c7',
          }}
        >
          {val}
        </span>
      ),
    },
    {
      title: 'Đơn vị phát hành / KCB ban đầu',
      dataIndex: 'tenNhaCungCap',
      key: 'tenNhaCungCap',
      render: (val: string) => <span style={{ color: '#334155', fontSize: 12 }}>{val || '--'}</span>,
    },
    {
      title: 'Thời hạn thẻ',
      key: 'hanDung',
      width: 160,
      render: (_, r) => (
        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11.5, color: '#475569' }}>
          {formatDate(r.ngayBatDau)} - {formatDate(r.ngayKetThuc)}
        </span>
      ),
    },
    {
      title: 'Mức hưởng',
      dataIndex: 'mucHuong',
      key: 'mucHuong',
      width: 90,
      align: 'center',
      render: (val: number) => (
        <span
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontWeight: 700,
            fontSize: 12,
            color: '#16a34a',
          }}
        >
          {val ? `${val}%` : '100%'}
        </span>
      ),
    },
    {
      title: 'Hiệu lực',
      dataIndex: 'isValid',
      key: 'isValid',
      width: 90,
      align: 'center',
      render: (val: boolean) => (
        <Badge
          status={val !== false ? 'success' : 'error'}
          text={
            <span style={{ fontSize: 11, fontWeight: 500 }}>
              {val !== false ? 'Còn hạn' : 'Hết hạn'}
            </span>
          }
        />
      ),
    },
  ];

  const tabItems = [
    {
      key: 'visits',
      label: (
        <span style={{ fontSize: 12.5, fontWeight: 600 }}>
          <HistoryOutlined style={{ marginRight: 6 }} />
          Lượt khám ({profile.luotKhamGanNhat?.length ?? 0})
        </span>
      ),
      children: (
        <Table<LuotKhamSummaryDto>
          className="patient-sub-table"
          rowKey="id"
          columns={visitColumns}
          dataSource={profile.luotKhamGanNhat ?? []}
          pagination={false}
          size="small"
          locale={{
            emptyText: (
              <div style={{ padding: '24px 0', color: '#94a3b8', fontSize: 12 }}>
                Chưa có lịch sử lượt khám nào
              </div>
            ),
          }}
        />
      ),
    },
    {
      key: 'invoices',
      label: (
        <span style={{ fontSize: 12.5, fontWeight: 600 }}>
          <FileTextOutlined style={{ marginRight: 6 }} />
          Hóa đơn viện phí ({profile.hoaDonGanNhat?.length ?? 0})
        </span>
      ),
      children: (
        <Table<HoaDonSummaryDto>
          className="patient-sub-table"
          rowKey="id"
          columns={invoiceColumns}
          dataSource={profile.hoaDonGanNhat ?? []}
          pagination={false}
          size="small"
          locale={{
            emptyText: (
              <div style={{ padding: '24px 0', color: '#94a3b8', fontSize: 12 }}>
                Chưa có hóa đơn viện phí phát sinh
              </div>
            ),
          }}
        />
      ),
    },
    {
      key: 'medical-history',
      label: (
        <span style={{ fontSize: 12.5, fontWeight: 600 }}>
          <MedicineBoxOutlined style={{ marginRight: 6 }} />
          Tiền sử bệnh &amp; Dị ứng ({profile.tienSuBenhs?.length ?? 0})
        </span>
      ),
      children: (
        <Table<TienSuBenhDto>
          className="patient-sub-table"
          rowKey="id"
          columns={historyColumns}
          dataSource={profile.tienSuBenhs ?? []}
          pagination={false}
          size="small"
          locale={{
            emptyText: (
              <div style={{ padding: '24px 0', color: '#94a3b8', fontSize: 12 }}>
                Không ghi nhận tiền sử bệnh đặc biệt
              </div>
            ),
          }}
        />
      ),
    },
    {
      key: 'insurance',
      label: (
        <span style={{ fontSize: 12.5, fontWeight: 600 }}>
          <SafetyCertificateOutlined style={{ marginRight: 6 }} />
          Bảo hiểm Y tế ({profile.baoHiems?.length ?? 0})
        </span>
      ),
      children: (
        <Table<BaoHiemDto>
          className="patient-sub-table"
          rowKey="id"
          columns={insuranceColumns}
          dataSource={profile.baoHiems ?? []}
          pagination={false}
          size="small"
          locale={{
            emptyText: (
              <div style={{ padding: '24px 0', color: '#94a3b8', fontSize: 12 }}>
                Chưa có thông tin thẻ bảo hiểm y tế
              </div>
            ),
          }}
        />
      ),
    },
  ];

  return (
    <div className="patient-detail-panel">
      {/* Detail Header */}
      <div className="patient-detail-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span
            style={{
              fontWeight: 700,
              color: '#0f172a',
              fontSize: 15,
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            {patientCode}
          </span>
          <span style={{ color: '#94a3b8' }}>|</span>
          <span style={{ fontWeight: 700, color: '#1e293b', fontSize: 15 }}>
            {fullName}
          </span>
          <Tag
            color={isFemale ? 'magenta' : 'blue'}
            style={{ margin: 0, fontSize: 11.5, borderRadius: 3, fontWeight: 600 }}
          >
            {isFemale ? 'Nữ' : 'Nam'}
          </Tag>
          {age && (
            <Tag style={{ margin: 0, fontSize: 11.5, borderRadius: 3, background: '#f8fafc' }}>
              {age}
            </Tag>
          )}
          {profile.isDeleted && (
            <Tag color="error" style={{ margin: 0, fontSize: 11.5, borderRadius: 3 }}>
              Đã xóa
            </Tag>
          )}
        </div>

        {/* Corporate Action Buttons */}
        <Space size="small">
          <Tooltip title="Mở trang chi tiết hồ sơ bệnh nhân đầy đủ">
            <Button
              type="primary"
              size="small"
              icon={<IdcardOutlined />}
              onClick={() => navigate(`/patient/detail/${profile.id}`)}
              style={{
                fontSize: 12,
                height: 28,
                background: '#0284c7',
                borderColor: '#0284c7',
                fontWeight: 600,
              }}
            >
              Hồ sơ chi tiết (F2)
            </Button>
          </Tooltip>

          <Button
            size="small"
            icon={<CalendarOutlined />}
            onClick={() => navigate(`/examination`)}
            className="corporate-action-btn"
            style={{ fontSize: 12, height: 28 }}
          >
            Đăng ký khám
          </Button>

          <Tooltip title="Tải lại hồ sơ">
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => fetchProfile(profile.id)}
              className="corporate-action-btn"
              style={{ fontSize: 12, height: 28 }}
            />
          </Tooltip>
        </Space>
      </div>

      {/* Detail Body */}
      <div className="patient-detail-body">
        {/* KHỐI 1: THÔNG TIN HÀNH CHÍNH & ĐỊNH DANH (3-Column Grid) */}
        <div
          style={{
            background: '#ffffff',
            padding: '12px 14px',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>THÔNG TIN ĐỊNH DANH &amp; HÀNH CHÍNH</span>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 400, textTransform: 'none' }}>
              Mã hệ thống: <strong style={{ color: '#334155' }}>#{profile.id}</strong>
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              columnGap: 24,
              rowGap: 8,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: '10px 14px',
              fontSize: 12,
            }}
          >
            <div>
              <span style={{ color: '#64748b', marginRight: 6 }}>Mã bệnh nhân:</span>
              <span
                style={{
                  color: '#0F172A',
                  fontFamily: 'ui-monospace, monospace',
                  fontWeight: 700,
                }}
              >
                {patientCode}
              </span>
            </div>

            <div>
              <span style={{ color: '#64748b', marginRight: 6 }}>Họ và tên:</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{fullName}</span>
            </div>

            <div>
              <span style={{ color: '#64748b', marginRight: 6 }}>Ngày sinh / Tuổi:</span>
              <span style={{ color: '#1e293b', fontFamily: 'ui-monospace, monospace' }}>
                {formatDate(profile.ngaySinh)} {age && `(${age})`}
              </span>
            </div>

            <div>
              <span style={{ color: '#64748b', marginRight: 6 }}>Giới tính:</span>
              <span style={{ fontWeight: 600, color: isFemale ? '#be185d' : '#0369a1' }}>
                {isFemale ? 'Nữ' : 'Nam'}
              </span>
            </div>

            <div>
              <span style={{ color: '#64748b', marginRight: 6 }}>Số CCCD / CMND:</span>
              <span style={{ color: '#1e293b', fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>
                {profile.soCCCD || '--'}
              </span>
            </div>

            <div>
              <span style={{ color: '#64748b', marginRight: 6 }}>Số điện thoại:</span>
              <span style={{ color: '#0f172a', fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>
                {profile.dienThoai || '--'}
              </span>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <span style={{ color: '#64748b', marginRight: 6 }}>Địa chỉ thường trú:</span>
              <span style={{ color: '#334155' }}>{profile.diaChi || '--'}</span>
            </div>

            <div>
              <span style={{ color: '#64748b', marginRight: 6 }}>Email:</span>
              <span style={{ color: '#334155' }}>{profile.email || '--'}</span>
            </div>

            <div>
              <span style={{ color: '#64748b', marginRight: 6 }}>Người liên hệ:</span>
              <span style={{ color: '#334155', fontWeight: 500 }}>
                {profile.nguoiLienHeTen ? `${profile.nguoiLienHeTen} (${profile.nguoiLienHeDienThoai || 'kèm SĐT'})` : '--'}
              </span>
            </div>

            <div>
              <span style={{ color: '#64748b', marginRight: 6 }}>Cơ sở đăng ký:</span>
              <span style={{ color: '#334155', fontWeight: 500 }}>
                {profile.tenCoSo || `Cơ sở #${profile.maCoSo}`}
              </span>
            </div>

            <div>
              <span style={{ color: '#64748b', marginRight: 6 }}>Ngày tạo hồ sơ:</span>
              <span style={{ color: '#334155', fontFamily: 'ui-monospace, monospace' }}>
                {formatDate(profile.createdAt || profile.ngayDangKy)}
              </span>
            </div>
          </div>
        </div>

        {/* KHỐI 2: 4 MINI SUMMARY CARDS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 6,
                background: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              <MedicineBoxOutlined />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Tổng lượt khám</div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#0f172a',
                  fontFamily: 'ui-monospace, monospace',
                }}
              >
                {profile.thongTinTongQuan?.tongLuotKham ?? (profile.luotKhamGanNhat?.length || 0)} lượt
              </div>
            </div>
          </div>

          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 6,
                background: '#f0fdf4',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              <FileTextOutlined />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Tổng hóa đơn</div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#0f172a',
                  fontFamily: 'ui-monospace, monospace',
                }}
              >
                {profile.thongTinTongQuan?.tongHoaDon ?? (profile.hoaDonGanNhat?.length || 0)} HĐ
              </div>
            </div>
          </div>

          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 6,
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              <CheckCircleOutlined />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Đã thanh toán</div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#059669',
                  fontFamily: 'ui-monospace, monospace',
                }}
              >
                {formatCurrency(profile.thongTinTongQuan?.tongTienDaThanhToan)}
              </div>
            </div>
          </div>

          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 6,
                background: '#fff1f2',
                color: '#e11d48',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              <AlertOutlined />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Còn nợ viện phí</div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: (profile.thongTinTongQuan?.tongTienConNo || 0) > 0 ? '#e11d48' : '#64748b',
                  fontFamily: 'ui-monospace, monospace',
                }}
              >
                {formatCurrency(profile.thongTinTongQuan?.tongTienConNo)}
              </div>
            </div>
          </div>
        </div>

        {/* KHỐI 3: WORKSPACE TABS */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 6,
            border: '1px solid #e2e8f0',
            padding: '8px 12px 12px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 280,
          }}
        >
          <Tabs
            defaultActiveKey="visits"
            size="small"
            items={tabItems}
            tabBarStyle={{ marginBottom: 10 }}
          />
        </div>
      </div>
    </div>
  );
};

export default PatientDetailView;
