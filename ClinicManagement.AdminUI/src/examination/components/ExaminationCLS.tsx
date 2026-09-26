// ExaminationCLS.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Table, Tag, Input, Select, Button, Space, Typography, Tooltip,
  Modal, Badge, message, Dropdown,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  FullscreenOutlined, FullscreenExitOutlined, SearchOutlined,
  ExperimentOutlined, ClockCircleOutlined, CheckCircleOutlined,
  AlertOutlined, EyeOutlined, ApartmentOutlined, ReloadOutlined,
  PrinterOutlined, EditOutlined, CloseCircleOutlined, CheckOutlined,
  InfoCircleOutlined, MoreOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { useExamination } from '../hook/useExamination';
import { examinationApi } from '../api/examination.api';
import type { ChiDinhDichVuListDto } from '../type/examination.types';
import { TiepNhanChiDinhModal } from './cls/TiepNhanChiDinhModal';
import { InPhieuKetQuaModal } from './cls/InPhieuKetQuaModal';
import { ChiTietChiDinhModal } from './cls/ChiTietChiDinhModal';

const { Text } = Typography;

/* =========================================================
   CSS override: xoá hover dòng + đồng bộ chiều cao cell
   ========================================================= */
const tableNoHoverCss = `
  .cls-no-hover .ant-table-tbody > tr > td {
    background: #ffffff !important;
    transition: none !important;
  }
  .cls-no-hover .ant-table-tbody > tr:hover > td,
  .cls-no-hover .ant-table-tbody > tr.ant-table-row:hover > td,
  .cls-no-hover .ant-table-tbody > tr.ant-table-row-selected > td {
    background: #ffffff !important;
  }
  .cls-no-hover .ant-table-tbody > tr > td {
    padding-top: 8px !important;
    padding-bottom: 8px !important;
    vertical-align: middle !important;
  }
  .cls-no-hover .ant-table-thead > tr > th {
    padding-top: 10px !important;
    padding-bottom: 10px !important;
    vertical-align: middle !important;
    background: #f8fafc !important;
    color: #0f172a !important;
    font-weight: 700 !important;
    border-bottom: 1px solid #e2e8f0 !important;
  }
  .cls-no-hover .ant-table-cell-ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cls-no-hover .ant-dropdown-menu {
    padding: 6px !important;
    border-radius: 8px !important;
    box-shadow: 0 6px 20px rgba(15, 23, 42, 0.12) !important;
  }
  .cls-no-hover .ant-dropdown-menu-item {
    border-radius: 6px !important;
    font-size: 13px !important;
    padding: 8px 12px !important;
  }
  .cls-no-hover .ant-dropdown-menu-item-danger:hover {
    background: #fef2f2 !important;
  }
`;

const ExaminationCLS: React.FC = () => {
  const navigate = useNavigate();
  const {
    chiDinhDichVuList,
    chiDinhDichVuTotal,
    thongKeChiDinhDichVu,
    loadingChiDinhDichVu,
    fetchChiDinhDichVuList,
    fetchThongKeChiDinhDichVu,
    khoas,
  } = useExamination();

  const [searchKeyword, setSearchKeyword] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [khoaFilter, setKhoaFilter] = useState<number | undefined>(undefined);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [tiepNhanItem, setTiepNhanItem] = useState<ChiDinhDichVuListDto | null>(null);
  const [isTiepNhanOpen, setIsTiepNhanOpen] = useState(false);
  const [inPhieuId, setInPhieuId] = useState<number | null>(null);
  const [isInPhieuOpen, setIsInPhieuOpen] = useState(false);
  const [chiTietId, setChiTietId] = useState<number | null>(null);
  const [isChiTietOpen, setIsChiTietOpen] = useState(false);

  const handleOpenChiTiet = (id: number) => {
    setChiTietId(id);
    setIsChiTietOpen(true);
  };

  const reloadData = useCallback(() => {
    fetchChiDinhDichVuList({
      pageIndex, pageSize,
      maKhoa: khoaFilter,
      loaiDichVu: serviceTypeFilter || undefined,
      trangThai: statusFilter || undefined,
    });
    fetchThongKeChiDinhDichVu({ maKhoa: khoaFilter });
  }, [pageIndex, pageSize, khoaFilter, serviceTypeFilter, statusFilter,
      fetchChiDinhDichVuList, fetchThongKeChiDinhDichVu]);

  useEffect(() => { reloadData(); }, [reloadData]);

  const kpis = useMemo(() => ([
    { label: 'Tổng chỉ định', value: thongKeChiDinhDichVu?.tongChiDinh ?? 0, color: '#0b4f6c', icon: <ExperimentOutlined style={{ fontSize: 16, color: '#0b4f6c' }} /> },
    { label: 'Đang xử lý',    value: thongKeChiDinhDichVu?.dangXuLy ?? 0,     color: '#0284c7', icon: <ClockCircleOutlined style={{ fontSize: 16, color: '#0284c7' }} /> },
    { label: 'Đã hoàn thành', value: thongKeChiDinhDichVu?.hoanThanh ?? 0,    color: '#10b981', icon: <CheckCircleOutlined style={{ fontSize: 16, color: '#10b981' }} /> },
    { label: 'TB trả kết quả', value: `${thongKeChiDinhDichVu?.tbTraKetQua ?? 0} phút`, color: '#f59e0b', icon: <ClockCircleOutlined style={{ fontSize: 16, color: '#f59e0b' }} /> },
    { label: 'KQ bất thường', value: thongKeChiDinhDichVu?.batThuong ?? 0,    color: '#ef4444', icon: <AlertOutlined style={{ fontSize: 16, color: '#ef4444' }} /> },
    { label: 'Khoa yêu cầu',  value: thongKeChiDinhDichVu?.khoaYeuCau ?? 0,   color: '#8b5cf6', icon: <ApartmentOutlined style={{ fontSize: 16, color: '#8b5cf6' }} /> },
  ]), [thongKeChiDinhDichVu]);

  const handleOpenTiepNhan = (item: ChiDinhDichVuListDto) => {
    setTiepNhanItem(item); setIsTiepNhanOpen(true);
  };
  const handleOpenNhapKetQua = (chiDinhId: number) => {
    navigate(`/examination/cls/nhap-ket-qua/${chiDinhId}`);
  };
  const handleOpenInPhieu = (chiDinhId: number) => {
    setInPhieuId(chiDinhId); setIsInPhieuOpen(true);
  };

  const handleHuyChiDinh = (item: ChiDinhDichVuListDto) => {
    let lyDoHuy = '';
    Modal.confirm({
      title: `Xác nhận hủy chỉ định: ${item.tenDichVu}`,
      content: (
        <div style={{ marginTop: 12 }}>
          <p>Bệnh nhân: <strong>{item.tenBenhNhan}</strong></p>
          <Input.TextArea rows={2} placeholder="Nhập lý do hủy..."
            onChange={(e) => { lyDoHuy = e.target.value; }} />
        </div>
      ),
      okText: 'Xác nhận hủy', okType: 'danger', cancelText: 'Đóng',
      onOk: async () => {
        try {
          const res = await examinationApi.huyChiDinh(item.id, { lyDo: lyDoHuy });
          if (res.data?.success) { message.success('Đã hủy chỉ định'); reloadData(); }
          else message.error(res.data?.message || 'Hủy chỉ định thất bại');
        } catch (err: any) { message.error(err?.message || 'Lỗi khi hủy chỉ định'); }
      },
    });
  };

  /* =========================================================
     CỘT ĐÃ CĂN CHỈNH — width cố định + ellipsis + tooltip
     Tổng width ~ 1136px → bảng đủ rộng, không cán chữ
     ========================================================= */
  const columns: ColumnsType<ChiDinhDichVuListDto> = [
    {
      title: 'STT',
      key: 'idx',
      width: 56,
      align: 'center',
      fixed: 'left',
      render: (_, __, index) => (
        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
          {(pageIndex - 1) * pageSize + index + 1}
        </span>
      ),
    },
    {
      title: 'Mã BN',
      dataIndex: 'maBenhNhanNoiBo',
      key: 'maBenhNhanNoiBo',
      width: 110,
      align: 'left',
      ellipsis: { showTitle: false },
      render: (code, record) => {
        const val = code || `BN-${record.maBenhNhan}`;
        return (
          <Tooltip title={val} placement="topLeft">
            <Text strong style={{ color: '#475569', fontSize: 12 }}>{val}</Text>
          </Tooltip>
        );
      },
    },
    {
      title: 'Bệnh nhân',
      dataIndex: 'tenBenhNhan',
      key: 'tenBenhNhan',
      width: 180,
      align: 'left',
      ellipsis: { showTitle: false },
      render: (text: string) => (
        <Tooltip title={text} placement="topLeft">
          <Text strong style={{ color: '#0b4f6c', fontSize: 13 }}>{text}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Dịch vụ / Xét nghiệm',
      dataIndex: 'tenDichVu',
      key: 'tenDichVu',
      width: 260,
      align: 'left',
      ellipsis: { showTitle: false },
      render: (text, record) => {
        let tagColor = 'blue';
        const type = (record.loaiDichVu || '').toLowerCase();
        if (type.includes('xetnghiem')) tagColor = 'cyan';
        else if (type.includes('chandoan')) tagColor = 'purple';
        else if (type.includes('kythuat')) tagColor = 'orange';

        return (
          <Tooltip
            placement="topLeft"
            title={
              <div>
                <div style={{ fontWeight: 600 }}>{text || 'Dịch vụ CLS'}</div>
                {record.loaiDichVu && <div style={{ fontSize: 11, opacity: 0.85 }}>{record.loaiDichVu}</div>}
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <Text strong style={{ fontSize: 13 }} ellipsis>{text || 'Dịch vụ CLS'}</Text>
              {record.loaiDichVu && (
                <Tag color={tagColor} style={{ fontSize: 10, padding: '0 6px', margin: 0, lineHeight: '16px', width: 'fit-content' }}>
                  {record.loaiDichVu}
                </Tag>
              )}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: 'BS chỉ định',
      dataIndex: 'tenBacSiChiDinh',
      key: 'tenBacSiChiDinh',
      width: 160,
      align: 'left',
      ellipsis: { showTitle: false },
      render: (text: string, record) => (
        <Tooltip placement="topLeft" title={<div>{text}<br />{record.tenKhoa}</div>}>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Text style={{ fontSize: 13 }} ellipsis>{text}</Text>
            <Text style={{ fontSize: 11, color: '#64748b' }} ellipsis>{record.tenKhoa}</Text>
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Thời gian chỉ định',
      dataIndex: 'ngayChiDinh',
      key: 'ngayChiDinh',
      width: 140,
      align: 'center',
      render: (dateStr: string) => (
        <span style={{ fontSize: 12, color: '#475569', whiteSpace: 'nowrap' }}>
          {dateStr
            ? new Date(dateStr).toLocaleString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })
            : '--'}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 140,
      align: 'center',
      render: (status: string) => {
        switch (status) {
          case 'DaChiDinh':   return <Badge status="warning"    text={<span style={{ color: '#d97706', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>Chờ tiếp nhận</span>} />;
          case 'DaTiepNhan':  return <Badge status="processing" text={<span style={{ color: '#0284c7', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>Đã tiếp nhận</span>} />;
          case 'ChoKetQua':   return <Badge status="processing" text={<span style={{ color: '#8b5cf6', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>Đang thực hiện</span>} />;
          case 'DaCoKetQua':  return <Badge status="success"    text={<span style={{ color: '#059669', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>Đã có kết quả</span>} />;
          case 'DaHuy':       return <Badge status="default"    text={<span style={{ color: '#94a3b8', fontSize: 12, whiteSpace: 'nowrap' }}>Đã hủy</span>} />;
          default:            return <Tag color="default">{status || 'Chờ'}</Tag>;
        }
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 90,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        const isPending    = record.trangThai === 'DaChiDinh';
        const isProcessing = record.trangThai === 'DaTiepNhan' || record.trangThai === 'ChoKetQua';
        const isDone       = record.trangThai === 'DaCoKetQua';
        const isCancelled  = record.trangThai === 'DaHuy';

        // Build menu items theo trạng thái — giữ nguyên toàn bộ hành vi
        const items: MenuProps['items'] = [
          {
            key: 'chitiet',
            icon: <InfoCircleOutlined style={{ color: '#0b4f6c' }} />,
            label: 'Xem chi tiết CLS & vật tư',
            onClick: () => handleOpenChiTiet(record.id),
          },
        ];

        if (isPending) {
          items.push({ type: 'divider' });
          items.push({
            key: 'tiepnhan',
            icon: <CheckOutlined style={{ color: '#0284c7' }} />,
            label: 'Tiếp nhận chỉ định',
            onClick: () => handleOpenTiepNhan(record),
          });
        }

        if (isProcessing) {
          items.push({ type: 'divider' });
          items.push({
            key: 'nhapkq',
            icon: <EditOutlined style={{ color: '#10b981' }} />,
            label: 'Nhập kết quả',
            onClick: () => handleOpenNhapKetQua(record.id),
          });
        }

        if (isDone) {
          items.push({ type: 'divider' });
          items.push({
            key: 'xemkq',
            icon: <EyeOutlined style={{ color: '#0284c7' }} />,
            label: 'Xem / Sửa kết quả',
            onClick: () => handleOpenNhapKetQua(record.id),
          });
          items.push({
            key: 'inphieu',
            icon: <PrinterOutlined style={{ color: '#0b4f6c' }} />,
            label: 'In phiếu kết quả',
            onClick: () => handleOpenInPhieu(record.id),
          });
        }

        if (!isDone && !isCancelled) {
          items.push({ type: 'divider' });
          items.push({
            key: 'huy',
            danger: true,
            icon: <CloseCircleOutlined />,
            label: 'Hủy chỉ định',
            onClick: () => handleHuyChiDinh(record),
          });
        }

        return (
          <Dropdown
            menu={{ items }}
            trigger={['click']}
            placement="bottomRight"
            overlayStyle={{ minWidth: 220 }}
          >
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined style={{ fontSize: 18, color: '#0b4f6c' }} />}
              style={{
                width: 32, height: 32, padding: 0,
                borderRadius: 6,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          </Dropdown>
        );
      },
    },
  ];

  const filteredList = useMemo(() => {
    if (!searchKeyword) return chiDinhDichVuList;
    const kw = searchKeyword.toLowerCase();
    return chiDinhDichVuList.filter((item) =>
      item.tenBenhNhan?.toLowerCase().includes(kw) ||
      item.maBenhNhanNoiBo?.toLowerCase().includes(kw) ||
      item.tenDichVu?.toLowerCase().includes(kw) ||
      item.tenBacSiChiDinh?.toLowerCase().includes(kw)
    );
  }, [chiDinhDichVuList, searchKeyword]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: '#ffffff' }}>
      {/* Inject CSS xoá hover */}
      <style>{tableNoHoverCss}</style>

      {/* KPI Ribbon */}
      {!isFullscreen && (
        <div style={{
          height: 42, minHeight: 42, background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0', padding: '0 16px',
          display: 'flex', alignItems: 'center', gap: 18,
          overflowX: 'auto', flexShrink: 0,
        }}>
          {kpis.map((kpi, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <div style={{ width: 1, height: 16, background: '#cbd5e1' }} />}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                {kpi.icon}
                <span style={{ fontSize: 12, color: '#64748b' }}>{kpi.label}:</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: kpi.color }}>{kpi.value}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div style={{
        minHeight: 46, padding: '6px 16px', borderBottom: '1px solid #e2e8f0',
        background: '#ffffff', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, flexShrink: 0,
      }}>
        <Space size="middle">
          <Space size="small">
            <ExperimentOutlined style={{ color: '#0b4f6c', fontSize: 18 }} />
            <Text strong style={{ fontSize: 14, color: '#0f172a' }}>
              Quản lý Cận Lâm Sàng & Trả Kết Quả
            </Text>
          </Space>
          <Tag color="blue" style={{ borderRadius: 4, margin: 0 }}>{chiDinhDichVuTotal} chỉ định</Tag>
        </Space>

        <Space wrap size="small">
          <Input prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Tìm theo tên BN, mã BN, xét nghiệm..."
            value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)}
            allowClear style={{ width: 220 }} size="middle" />
          <Select placeholder="Loại dịch vụ" value={serviceTypeFilter || undefined}
            onChange={(val) => { setServiceTypeFilter(val || ''); setPageIndex(1); }}
            allowClear style={{ width: 155 }} size="middle"
            options={[
              { value: 'XetNghiem', label: '🧪 Xét nghiệm' },
              { value: 'ChanDoanHinhAnh', label: '🩻 Chẩn đoán hình ảnh' },
              { value: 'DichVuKyThuat', label: '🩺 Thủ thuật / Kỹ thuật' },
            ]} />
          <Select placeholder="Tất cả trạng thái" value={statusFilter || undefined}
            onChange={(val) => { setStatusFilter(val || ''); setPageIndex(1); }}
            allowClear style={{ width: 145 }} size="middle"
            options={[
              { value: 'DaChiDinh', label: 'Chờ tiếp nhận' },
              { value: 'DaTiepNhan', label: 'Đã tiếp nhận' },
              { value: 'ChoKetQua', label: 'Đang thực hiện' },
              { value: 'DaCoKetQua', label: 'Đã có kết quả' },
              { value: 'DaHuy', label: 'Đã hủy' },
            ]} />
          <Select placeholder="Tất cả khoa" value={khoaFilter}
            onChange={(val) => { setKhoaFilter(val); setPageIndex(1); }}
            allowClear style={{ width: 160 }} size="middle"
            options={khoas.map((k) => ({ value: k.id, label: k.ten }))} />
          <Button icon={<ReloadOutlined />} onClick={reloadData} size="middle">Tải lại</Button>
          <Button icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            onClick={() => setIsFullscreen(!isFullscreen)} size="middle">
            {isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
          </Button>
        </Space>
      </div>

      {/* Table — bọc className cls-no-hover để tắt hover */}
      <div className="cls-no-hover" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <Table<ChiDinhDichVuListDto>
          rowKey="id"
          columns={columns}
          dataSource={filteredList}
          loading={loadingChiDinhDichVu}
          size="middle"
          tableLayout="fixed"
          pagination={{
            current: pageIndex,
            pageSize: pageSize,
            total: chiDinhDichVuTotal,
            onChange: (page, size) => { setPageIndex(page); setPageSize(size); },
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `Hiển thị ${range[0]} - ${range[1]} / ${total} chỉ định`,
            style: { padding: '8px 16px', margin: 0 },
          }}
          scroll={{ x: 1136, y: 'calc(100vh - 235px)' }}
        />
      </div>

      <TiepNhanChiDinhModal
        visible={isTiepNhanOpen}
        item={tiepNhanItem}
        onClose={() => { setIsTiepNhanOpen(false); setTiepNhanItem(null); }}
        onSuccess={reloadData}
      />
      <InPhieuKetQuaModal
        visible={isInPhieuOpen}
        chiDinhId={inPhieuId}
        onClose={() => { setIsInPhieuOpen(false); setInPhieuId(null); }}
      />
      <ChiTietChiDinhModal
        visible={isChiTietOpen}
        chiDinhId={chiTietId}
        onClose={() => { setIsChiTietOpen(false); setChiTietId(null); }}
        onOpenNhapKetQua={(id) => { setIsChiTietOpen(false); handleOpenNhapKetQua(id); }}
        onOpenInPhieu={(id) => { setIsChiTietOpen(false); handleOpenInPhieu(id); }}
      />
    </div>
  );
};

export default ExaminationCLS;