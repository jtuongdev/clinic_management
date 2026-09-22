import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Table,
  Tag,
  Input,
  Select,
  Button,
  Space,
  Typography,
  Tooltip,
  Modal,
  Badge,
  message,
} from 'antd';
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  SearchOutlined,
  ExperimentOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  EyeOutlined,
  ApartmentOutlined,
  ReloadOutlined,
  PrinterOutlined,
  EditOutlined,
  CloseCircleOutlined,
  CheckOutlined,
  InfoCircleOutlined,
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

  // State bộ lọc cục bộ
  const [searchKeyword, setSearchKeyword] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [khoaFilter, setKhoaFilter] = useState<number | undefined>(undefined);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // State modals
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

  // Hàm tải dữ liệu
  const reloadData = useCallback(() => {
    fetchChiDinhDichVuList({
      pageIndex,
      pageSize,
      maKhoa: khoaFilter,
      loaiDichVu: serviceTypeFilter || undefined,
      trangThai: statusFilter || undefined,
    });
    fetchThongKeChiDinhDichVu({ maKhoa: khoaFilter });
  }, [
    pageIndex,
    pageSize,
    khoaFilter,
    serviceTypeFilter,
    statusFilter,
    fetchChiDinhDichVuList,
    fetchThongKeChiDinhDichVu,
  ]);

  // Tải danh sách khi bộ lọc hoặc phân trang thay đổi
  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Xây dựng KPI Ribbon
  const kpis = useMemo(() => {
    return [
      {
        label: 'Tổng chỉ định',
        value: thongKeChiDinhDichVu?.tongChiDinh ?? 0,
        color: '#0b4f6c',
        bgColor: '#e8f4f7',
        icon: <ExperimentOutlined style={{ fontSize: 18, color: '#0b4f6c' }} />,
      },
      {
        label: 'Đang xử lý',
        value: thongKeChiDinhDichVu?.dangXuLy ?? 0,
        color: '#0284c7',
        bgColor: '#e0f2fe',
        icon: <ClockCircleOutlined style={{ fontSize: 18, color: '#0284c7' }} />,
      },
      {
        label: 'Đã hoàn thành',
        value: thongKeChiDinhDichVu?.hoanThanh ?? 0,
        color: '#10b981',
        bgColor: '#ecfdf5',
        icon: <CheckCircleOutlined style={{ fontSize: 18, color: '#10b981' }} />,
      },
      {
        label: 'TB trả kết quả',
        value: `${thongKeChiDinhDichVu?.tbTraKetQua ?? 0} phút`,
        color: '#f59e0b',
        bgColor: '#fffbeb',
        icon: <ClockCircleOutlined style={{ fontSize: 18, color: '#f59e0b' }} />,
        isText: true,
      },
      {
        label: 'KQ bất thường',
        value: thongKeChiDinhDichVu?.batThuong ?? 0,
        color: '#ef4444',
        bgColor: '#fef2f2',
        icon: <AlertOutlined style={{ fontSize: 18, color: '#ef4444' }} />,
      },
      {
        label: 'Khoa yêu cầu',
        value: thongKeChiDinhDichVu?.khoaYeuCau ?? 0,
        color: '#8b5cf6',
        bgColor: '#f3e8ff',
        icon: <ApartmentOutlined style={{ fontSize: 18, color: '#8b5cf6' }} />,
      },
    ];
  }, [thongKeChiDinhDichVu]);

  // Mở modal tiếp nhận
  const handleOpenTiepNhan = (item: ChiDinhDichVuListDto) => {
    setTiepNhanItem(item);
    setIsTiepNhanOpen(true);
  };

  // Điều hướng sang trang nhập kết quả full màn hình
  const handleOpenNhapKetQua = (chiDinhId: number) => {
    navigate(`/examination/cls/nhap-ket-qua/${chiDinhId}`);
  };

  // Mở modal in phiếu kết quả
  const handleOpenInPhieu = (chiDinhId: number) => {
    setInPhieuId(chiDinhId);
    setIsInPhieuOpen(true);
  };

  // Hủy chỉ định
  const handleHuyChiDinh = (item: ChiDinhDichVuListDto) => {
    let lyDoHuy = '';
    Modal.confirm({
      title: `Xác nhận hủy chỉ định: ${item.tenDichVu}`,
      content: (
        <div style={{ marginTop: 12 }}>
          <p>Bệnh nhân: <strong>{item.tenBenhNhan}</strong></p>
          <Input.TextArea
            rows={2}
            placeholder="Nhập lý do hủy (bệnh nhân từ chối, mẫu lỗi...)"
            onChange={(e) => {
              lyDoHuy = e.target.value;
            }}
          />
        </div>
      ),
      okText: 'Xác nhận hủy',
      okType: 'danger',
      cancelText: 'Đóng',
      onOk: async () => {
        try {
          const res = await examinationApi.huyChiDinh(item.id, { lyDo: lyDoHuy });
          if (res.data?.success) {
            message.success('Đã hủy chỉ định dịch vụ');
            reloadData();
          } else {
            message.error(res.data?.message || 'Hủy chỉ định thất bại');
          }
        } catch (err: any) {
          message.error(err?.message || 'Lỗi khi hủy chỉ định');
        }
      },
    });
  };

  // Cấu hình cột bảng dữ liệu
  const columns: ColumnsType<ChiDinhDichVuListDto> = [
    {
      title: '#',
      key: 'idx',
      width: 50,
      align: 'center',
      render: (_, __, index) => (pageIndex - 1) * pageSize + index + 1,
    },
    {
      title: 'Mã BN',
      dataIndex: 'maBenhNhanNoiBo',
      key: 'maBenhNhanNoiBo',
      width: 100,
      render: (code, record) => (
        <Text strong style={{ color: '#475569', fontSize: 12 }}>
          {code || `BN-${record.maBenhNhan}`}
        </Text>
      ),
    },
    {
      title: 'Bệnh nhân',
      dataIndex: 'tenBenhNhan',
      key: 'tenBenhNhan',
      render: (text) => (
        <Text strong style={{ color: '#0b4f6c' }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Dịch vụ / Xét nghiệm',
      dataIndex: 'tenDichVu',
      key: 'tenDichVu',
      render: (text, record) => {
        let tagColor = 'blue';
        const type = (record.loaiDichVu || '').toLowerCase();
        if (type.includes('xetnghiem')) tagColor = 'cyan';
        else if (type.includes('chandoan')) tagColor = 'purple';
        else if (type.includes('kythuat')) tagColor = 'orange';

        return (
          <div>
            <Text strong>{text || 'Dịch vụ CLS'}</Text>
            {record.loaiDichVu && (
              <div style={{ marginTop: 2 }}>
                <Tag color={tagColor} style={{ fontSize: 11, padding: '0 6px', margin: 0 }}>
                  {record.loaiDichVu}
                </Tag>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'BS chỉ định',
      dataIndex: 'tenBacSiChiDinh',
      key: 'tenBacSiChiDinh',
      width: 150,
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>{record.tenKhoa}</div>
        </div>
      ),
    },
    {
      title: 'Thời gian chỉ định',
      dataIndex: 'ngayChiDinh',
      key: 'ngayChiDinh',
      width: 135,
      render: (dateStr: string) =>
        dateStr
          ? new Date(dateStr).toLocaleString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '--',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 130,
      render: (status: string) => {
        switch (status) {
          case 'DaChiDinh':
            return (
              <Badge status="warning" text={<span style={{ color: '#d97706', fontWeight: 600 }}>Chờ tiếp nhận</span>} />
            );
          case 'DaTiepNhan':
            return (
              <Badge status="processing" text={<span style={{ color: '#0284c7', fontWeight: 600 }}>Đã tiếp nhận</span>} />
            );
          case 'ChoKetQua':
            return (
              <Badge status="processing" text={<span style={{ color: '#8b5cf6', fontWeight: 600 }}>Đang thực hiện</span>} />
            );
          case 'DaCoKetQua':
            return (
              <Badge status="success" text={<span style={{ color: '#059669', fontWeight: 600 }}>Đã có kết quả</span>} />
            );
          case 'DaHuy':
            return (
              <Badge status="default" text={<span style={{ color: '#94a3b8' }}>Đã hủy</span>} />
            );
          default:
            return <Tag color="default">{status || 'Chờ'}</Tag>;
        }
      },
    },
    {
      title: 'Thao tác nghiệp vụ',
      key: 'action',
      width: 240,
      align: 'center',
      render: (_, record) => {
        const isPending = record.trangThai === 'DaChiDinh';
        const isProcessing = record.trangThai === 'DaTiepNhan' || record.trangThai === 'ChoKetQua';
        const isDone = record.trangThai === 'DaCoKetQua';
        const isCancelled = record.trangThai === 'DaHuy';

        return (
          <Space size="small">
            {/* Chi tiết CLS & Vật tư */}
            <Tooltip title="Xem chi tiết đợt CLS & vật tư tiêu hao">
              <Button
                size="small"
                icon={<InfoCircleOutlined />}
                style={{ color: '#0b4f6c', borderColor: '#b8e2ec' }}
                onClick={() => handleOpenChiTiet(record.id)}
              >
                Chi tiết
              </Button>
            </Tooltip>

            {/* Tiếp nhận */}
            {isPending && (
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                style={{ background: '#0284c7', borderColor: '#0284c7' }}
                onClick={() => handleOpenTiepNhan(record)}
              >
                Tiếp nhận
              </Button>
            )}

            {/* Nhập kết quả */}
            {isProcessing && (
              <Button
                type="primary"
                size="small"
                icon={<EditOutlined />}
                style={{ background: '#10b981', borderColor: '#10b981' }}
                onClick={() => handleOpenNhapKetQua(record.id)}
              >
                Nhập KQ
              </Button>
            )}

            {/* Đã có kết quả: Sửa / In */}
            {isDone && (
              <>
                <Tooltip title="Xem & Chỉnh sửa kết quả">
                  <Button
                    type="default"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handleOpenNhapKetQua(record.id)}
                  />
                </Tooltip>
                <Tooltip title="In phiếu kết quả">
                  <Button
                    type="primary"
                    size="small"
                    icon={<PrinterOutlined />}
                    style={{ background: '#0b4f6c', borderColor: '#0b4f6c' }}
                    onClick={() => handleOpenInPhieu(record.id)}
                  >
                    In phiếu
                  </Button>
                </Tooltip>
              </>
            )}

            {/* Hủy chỉ định */}
            {!isDone && !isCancelled && (
              <Tooltip title="Hủy chỉ định">
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleHuyChiDinh(record)}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  // Lọc tìm kiếm cục bộ nhanh theo từ khóa
  const filteredList = useMemo(() => {
    if (!searchKeyword) return chiDinhDichVuList;
    const kw = searchKeyword.toLowerCase();
    return chiDinhDichVuList.filter(
      (item) =>
        item.tenBenhNhan?.toLowerCase().includes(kw) ||
        item.maBenhNhanNoiBo?.toLowerCase().includes(kw) ||
        item.tenDichVu?.toLowerCase().includes(kw) ||
        item.tenBacSiChiDinh?.toLowerCase().includes(kw)
    );
  }, [chiDinhDichVuList, searchKeyword]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        background: '#ffffff',
      }}
    >
      {/* Metric Ribbon / Stat Bar */}
      {!isFullscreen && (
        <div
          style={{
            height: 42,
            minHeight: 42,
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            overflowX: 'auto',
            flexShrink: 0,
          }}
        >
          {kpis.map((kpi, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <div style={{ width: 1, height: 16, background: '#cbd5e1' }} />}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>{kpi.icon}</span>
                <span style={{ fontSize: 12, color: '#64748b' }}>{kpi.label}:</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: kpi.color }}>
                  {kpi.value}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Control Toolbar */}
      <div
        style={{
          minHeight: 46,
          padding: '6px 16px',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <Space size="middle">
          <Space size="small">
            <ExperimentOutlined style={{ color: '#0b4f6c', fontSize: 18 }} />
            <Text strong style={{ fontSize: 14, color: '#0f172a' }}>
              Quản lý Cận Lâm Sàng & Trả Kết Quả
            </Text>
          </Space>
          <Tag color="blue" style={{ borderRadius: 4, margin: 0 }}>
            {chiDinhDichVuTotal} chỉ định
          </Tag>
        </Space>

        <Space wrap size="small">
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Tìm theo tên BN, mã BN, xét nghiệm..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            allowClear
            style={{ width: 220 }}
            size="middle"
          />
          <Select
            placeholder="Loại dịch vụ"
            value={serviceTypeFilter || undefined}
            onChange={(val) => {
              setServiceTypeFilter(val || '');
              setPageIndex(1);
            }}
            allowClear
            style={{ width: 155 }}
            size="middle"
            options={[
              { value: 'XetNghiem', label: '🧪 Xét nghiệm' },
              { value: 'ChanDoanHinhAnh', label: '🩻 Chẩn đoán hình ảnh' },
              { value: 'DichVuKyThuat', label: '🩺 Thủ thuật / Kỹ thuật' },
            ]}
          />
          <Select
            placeholder="Tất cả trạng thái"
            value={statusFilter || undefined}
            onChange={(val) => {
              setStatusFilter(val || '');
              setPageIndex(1);
            }}
            allowClear
            style={{ width: 145 }}
            size="middle"
            options={[
              { value: 'DaChiDinh', label: 'Chờ tiếp nhận' },
              { value: 'DaTiepNhan', label: 'Đã tiếp nhận' },
              { value: 'ChoKetQua', label: 'Đang thực hiện' },
              { value: 'DaCoKetQua', label: 'Đã có kết quả' },
              { value: 'DaHuy', label: 'Đã hủy' },
            ]}
          />
          <Select
            placeholder="Tất cả khoa"
            value={khoaFilter}
            onChange={(val) => {
              setKhoaFilter(val);
              setPageIndex(1);
            }}
            allowClear
            style={{ width: 160 }}
            size="middle"
            options={khoas.map((k) => ({ value: k.id, label: k.ten }))}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={reloadData}
            size="middle"
          >
            Tải lại
          </Button>
          <Button
            icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            onClick={() => setIsFullscreen(!isFullscreen)}
            size="middle"
          >
            {isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
          </Button>
        </Space>
      </div>

      {/* Edge-to-Edge Data Grid */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <Table<ChiDinhDichVuListDto>
          rowKey="id"
          columns={columns}
          dataSource={filteredList}
          loading={loadingChiDinhDichVu}
          size="middle"
          pagination={{
            current: pageIndex,
            pageSize: pageSize,
            total: chiDinhDichVuTotal,
            onChange: (page, size) => {
              setPageIndex(page);
              setPageSize(size);
            },
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `Hiển thị ${range[0]} - ${range[1]} / ${total} chỉ định`,
            style: { padding: '8px 16px', margin: 0 },
          }}
          scroll={{ y: 'calc(100vh - 235px)' }}
        />
      </div>

      {/* Modal Tiếp nhận */}
      <TiepNhanChiDinhModal
        visible={isTiepNhanOpen}
        item={tiepNhanItem}
        onClose={() => {
          setIsTiepNhanOpen(false);
          setTiepNhanItem(null);
        }}
        onSuccess={reloadData}
      />

      {/* Modal In phiếu kết quả */}
      <InPhieuKetQuaModal
        visible={isInPhieuOpen}
        chiDinhId={inPhieuId}
        onClose={() => {
          setIsInPhieuOpen(false);
          setInPhieuId(null);
        }}
      />

      {/* Modal Chi tiết đợt CLS & Vật tư tiêu hao */}
      <ChiTietChiDinhModal
        visible={isChiTietOpen}
        chiDinhId={chiTietId}
        onClose={() => {
          setIsChiTietOpen(false);
          setChiTietId(null);
        }}
        onOpenNhapKetQua={(id) => {
          setIsChiTietOpen(false);
          handleOpenNhapKetQua(id);
        }}
        onOpenInPhieu={(id) => {
          setIsChiTietOpen(false);
          handleOpenInPhieu(id);
        }}
      />
    </div>
  );
};

export default ExaminationCLS;