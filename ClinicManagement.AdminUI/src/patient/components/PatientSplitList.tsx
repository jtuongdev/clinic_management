import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  App,
  Tooltip,
  Tag,
} from 'antd';
import {
  ReloadOutlined,
  UserAddOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { BenhNhanDto } from '../type/patient.types';
import { patientApi } from '../api/patient.api';
import PatientDetailView from './PatientDetailView';
import '../styles/patient.css';

interface PatientSplitListProps {
  onAddPatient?: () => void;
}

export const PatientSplitList: React.FC<PatientSplitListProps> = ({ onAddPatient }) => {
  const { message } = App.useApp();

  const [patients, setPatients] = useState<BenhNhanDto[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [genderFilter, setGenderFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  // Pagination
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [total, setTotal] = useState(0);

  // Split-View selection
  const [selectedPatient, setSelectedPatient] = useState<BenhNhanDto | null>(null);

  const fetchPatients = useCallback(async (searchKw?: string) => {
    setLoading(true);
    try {
      const kw = searchKw !== undefined ? searchKw : keyword;
      const res = await patientApi.getPaged({
        pageIndex,
        pageSize,
        keyword: kw?.trim() || undefined,
      });

      if (res.data.success && res.data.data) {
        const rawItems = res.data.data.items ?? [];
        setPatients(rawItems);
        setTotal(res.data.data.totalCount ?? rawItems.length);

        // Auto select first patient or retain current selected
        setSelectedPatient((prev) => {
          if (!prev && rawItems.length > 0) {
            return rawItems[0];
          }
          if (prev) {
            const found = rawItems.find((p: BenhNhanDto) => p.id === prev.id);
            if (found) return found;
            if (rawItems.length > 0) return rawItems[0];
          }
          return null;
        });
      } else {
        message.error(res.data.message || 'Không thể tải danh sách bệnh nhân');
      }
    } catch {
      message.error('Lỗi kết nối khi tải danh sách bệnh nhân');
    } finally {
      setLoading(false);
    }
  }, [keyword, pageIndex, pageSize, message]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleSearch = () => {
    setPageIndex(1);
    fetchPatients(keyword);
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
      return age > 0 ? `${age}t` : '';
    } catch {
      return '';
    }
  };

  // Filtered patients for local gender/status dropdown if selected
  const displayPatients = useMemo(() => {
    return patients.filter((p) => {
      if (genderFilter) {
        const isF = p.gioiTinh === 'F' || p.gioiTinh === 'Nữ';
        if (genderFilter === 'F' && !isF) return false;
        if (genderFilter === 'M' && isF) return false;
      }
      if (statusFilter && p.trangThaiLuotKham !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [patients, genderFilter, statusFilter]);

  // Status strip stats
  const stripStats = useMemo(() => {
    let maleCount = 0;
    let femaleCount = 0;
    patients.forEach((p) => {
      const isF = p.gioiTinh === 'F' || p.gioiTinh === 'Nữ';
      if (isF) femaleCount++;
      else maleCount++;
    });
    return {
      totalCount: total,
      maleCount,
      femaleCount,
    };
  }, [patients, total]);

  // Master Table Columns - 5 compact columns fitting within 340px
  const masterColumns: ColumnsType<BenhNhanDto> = [
    {
      title: 'Mã BN',
      dataIndex: 'maBenhNhanNoiBo',
      key: 'maBenhNhanNoiBo',
      width: 76,
      render: (code: string, record) => {
        const displayCode = code || `BN-${record.id}`;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
            <span
              style={{
                fontFamily: 'ui-monospace, monospace',
                fontWeight: 700,
                fontSize: 11.5,
                color: '#0F172A',
              }}
            >
              {displayCode}
            </span>
            {record.trangThaiLuotKham === 'DANG_KHAM' && (
              <Tooltip title="Đang trong lượt khám">
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: '#0284c7',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: 'Họ và tên',
      key: 'hoTen',
      ellipsis: true,
      render: (_, r) => {
        const name = r.hoTen || `${r.ho || ''} ${r.ten || ''}`.trim() || `BN #${r.id}`;
        const subInfo = r.soCCCD ? `CCCD: ${r.soCCCD}` : r.dienThoai || `Mã #${r.id}`;
        return (
          <div style={{ lineHeight: 1.25, overflow: 'hidden' }}>
            <Tooltip title={name}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 11.5,
                  color: '#111827',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {name}
              </div>
            </Tooltip>
            <div
              style={{
                fontSize: 10.5,
                color: '#6B7280',
                fontFamily: 'ui-monospace, monospace',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                marginTop: 1,
              }}
            >
              {subInfo}
            </div>
          </div>
        );
      },
    },
    {
      title: 'GT/Tuổi',
      key: 'gtTuoi',
      width: 65,
      render: (_, r) => {
        const isF = r.gioiTinh === 'F' || r.gioiTinh === 'Nữ';
        const age = calculateAge(r.ngaySinh);
        return (
          <div style={{ whiteSpace: 'nowrap', fontSize: 11 }}>
            <span
              style={{
                color: isF ? '#be185d' : '#0369a1',
                fontWeight: 600,
                marginRight: 3,
              }}
            >
              {isF ? 'Nữ' : 'Nam'}
            </span>
            {age && <span style={{ color: '#64748b' }}>{age}</span>}
          </div>
        );
      },
    },
    {
      title: 'SĐT',
      dataIndex: 'dienThoai',
      key: 'dienThoai',
      width: 78,
      render: (val: string) => (
        <span
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontSize: 11,
            color: '#334155',
            whiteSpace: 'nowrap',
          }}
        >
          {val || '--'}
        </span>
      ),
    },
    {
      title: 'TT',
      dataIndex: 'trangThaiLuotKham',
      key: 'trangThaiLuotKham',
      width: 58,
      align: 'center',
      render: (status: string) => {
        let color = '#475569';
        let bg = '#f1f5f9';
        let border = '#cbd5e1';
        let text = 'Ổn định';

        if (status === 'DANG_KHAM' || status === 'Đang khám') {
          color = '#0284c7';
          bg = '#e0f2fe';
          border = '#7dd3fc';
          text = 'Khám';
        } else if (status === 'HOAN_THANH' || status === 'Hoàn thành' || status === 'DA_KHAM') {
          color = '#16a34a';
          bg = '#dcfce7';
          border = '#86efac';
          text = 'Xong';
        } else if (status === 'CHO_KHAM' || status === 'Chờ khám') {
          color = '#d97706';
          bg = '#fef3c7';
          border = '#fde68a';
          text = 'Chờ';
        }

        return (
          <span
            style={{
              display: 'inline-block',
              padding: '1px 4px',
              borderRadius: 3,
              fontSize: 10,
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

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
      {/* ── KHỐI 1: STATUS STRIP (flexShrink: 0) ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 4,
          padding: '6px 14px',
          flexWrap: 'wrap',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 12.5, color: '#475569' }}>
          <div>
            Tổng số: <strong style={{ color: '#0f172a', fontFamily: 'ui-monospace, monospace' }}>{stripStats.totalCount} bệnh nhân</strong>
          </div>
          <span style={{ color: '#d1d5db' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            Nam:
            <span style={{ fontWeight: 700, color: '#0369a1', background: '#f0f9ff', border: '1px solid #bae6fd', padding: '0 5px', borderRadius: 3, fontFamily: 'ui-monospace, monospace', fontSize: 11.5 }}>
              {stripStats.maleCount}
            </span>
          </div>
          <span style={{ color: '#d1d5db' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            Nữ:
            <span style={{ fontWeight: 700, color: '#be185d', background: '#fdf2f8', border: '1px solid #fbcfe8', padding: '0 5px', borderRadius: 3, fontFamily: 'ui-monospace, monospace', fontSize: 11.5 }}>
              {stripStats.femaleCount}
            </span>
          </div>
        </div>

        <Space size="small">
          {onAddPatient && (
            <Button
              type="primary"
              size="small"
              icon={<UserAddOutlined />}
              onClick={onAddPatient}
              style={{ height: 28, fontSize: 12, fontWeight: 600, background: '#0284c7', borderColor: '#0284c7' }}
            >
              Thêm bệnh nhân mới
            </Button>
          )}
        </Space>
      </div>

      {/* ── KHỐI 2: MASTER-DETAIL SPLIT CONTAINER ── */}
      <div className="patient-split-container">
        {/* ══ PHÂN VÙNG MASTER – BÊN TRÁI (~340px) ══ */}
        <div className="patient-master-panel">
          {/* Header & Filter Controls */}
          <div className="patient-master-header">
            <Input.Search
              placeholder="Tìm mã BN, họ tên, CCCD, SĐT..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={handleSearch}
              allowClear
              size="small"
            />
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Select
                placeholder="Giới tính"
                value={genderFilter}
                onChange={setGenderFilter}
                style={{ flex: 1 }}
                size="small"
                allowClear
                options={[
                  { label: 'Tất cả giới tính', value: '' },
                  { label: 'Nam', value: 'M' },
                  { label: 'Nữ', value: 'F' },
                ]}
              />
              <Select
                placeholder="Trạng thái"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ flex: 1.2 }}
                size="small"
                allowClear
                options={[
                  { label: 'Tất cả trạng thái', value: '' },
                  { label: 'Chờ khám', value: 'CHO_KHAM' },
                  { label: 'Đang khám', value: 'DANG_KHAM' },
                  { label: 'Hoàn thành', value: 'HOAN_THANH' },
                  { label: 'Đã hủy', value: 'DA_HUY' },
                ]}
              />
              <Tooltip title="Tải lại danh sách">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => fetchPatients()}
                  loading={loading}
                  size="small"
                  className="corporate-action-btn"
                />
              </Tooltip>
            </div>
          </div>

          {/* Master Table – compact, click row to select */}
          <div className="patient-master-table-wrapper">
            <Table<BenhNhanDto>
              className="patient-master-table"
              rowKey={(r) => String(r.id)}
              columns={masterColumns}
              dataSource={displayPatients}
              loading={loading}
              size="small"
              rowClassName={(record) =>
                selectedPatient?.id === record.id ? 'master-row-selected' : ''
              }
              onRow={(record) => ({
                onClick: () => setSelectedPatient(record),
                style: { cursor: 'pointer' },
              })}
              pagination={{
                current: pageIndex,
                pageSize,
                total,
                size: 'small',
                showSizeChanger: true,
                pageSizeOptions: ['15', '30', '50'],
                onChange: (page, size) => {
                  setPageIndex(page);
                  setPageSize(size);
                },
                showTotal: (t) => `${t} BN`,
              }}
              locale={{
                emptyText: (
                  <div style={{ padding: '32px 0', color: '#94a3b8' }}>
                    Không tìm thấy bệnh nhân nào
                  </div>
                ),
              }}
            />
          </div>
        </div>

        {/* ══ PHÂN VÙNG DETAIL – BÊN PHẢI (flex-1 min-w-0) ══ */}
        <PatientDetailView
          patientId={selectedPatient?.id ?? null}
          onRefresh={() => fetchPatients()}
        />
      </div>
    </div>
  );
};

export default PatientSplitList;
