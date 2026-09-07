import React, { useState, useEffect, useMemo } from 'react';
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
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useExamination } from '../hook/useExamination';
import { ChiDinhDichVuListDto } from '../type/examination.types';

const { Text } = Typography;

const ExaminationCLS: React.FC = () => {
  const {
    chiDinhDichVuList,
    chiDinhDichVuTotal,
    thongKeChiDinhDichVu,
    loadingChiDinhDichVu,
    loadingThongKeChiDinhDichVu,
    fetchChiDinhDichVuList,
    fetchThongKeChiDinhDichVu,
    khoas,
  } = useExamination();

  // State bộ lọc cục bộ
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [khoaFilter, setKhoaFilter] = useState<number | undefined>(undefined);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Tải danh sách khi bộ lọc hoặc phân trang thay đổi
  useEffect(() => {
    fetchChiDinhDichVuList({
      pageIndex,
      pageSize,
      maKhoa: khoaFilter,
      trangThai: statusFilter || undefined,
    });
  }, [pageIndex, pageSize, khoaFilter, statusFilter, fetchChiDinhDichVuList]);

  // Tải thống kê
  useEffect(() => {
    fetchThongKeChiDinhDichVu({ maKhoa: khoaFilter });
  }, [khoaFilter, fetchThongKeChiDinhDichVu]);

  // Xây dựng KPI
  const kpis = useMemo(() => {
    return [
      {
        label: 'Tổng chỉ định',
        value: thongKeChiDinhDichVu?.tongChiDinh ?? 0,
        color: '#0b4f6c',
        bgColor: '#e8f4f7',
        icon: <ExperimentOutlined style={{ fontSize: 20, color: '#0b4f6c' }} />,
      },
      {
        label: 'Đang xử lý',
        value: thongKeChiDinhDichVu?.dangXuLy ?? 0,
        color: '#0284c7',
        bgColor: '#e0f2fe',
        icon: <ClockCircleOutlined style={{ fontSize: 20, color: '#0284c7' }} />,
      },
      {
        label: 'Đã hoàn thành',
        value: thongKeChiDinhDichVu?.hoanThanh ?? 0,
        color: '#10b981',
        bgColor: '#ecfdf5',
        icon: <CheckCircleOutlined style={{ fontSize: 20, color: '#10b981' }} />,
      },
      {
        label: 'TB trả kết quả',
        value: `${thongKeChiDinhDichVu?.tbTraKetQua ?? 0} phút`,
        color: '#f59e0b',
        bgColor: '#fffbeb',
        icon: <ClockCircleOutlined style={{ fontSize: 20, color: '#f59e0b' }} />,
        isText: true,
      },
      {
        label: 'KQ bất thường',
        value: thongKeChiDinhDichVu?.batThuong ?? 0,
        color: '#ef4444',
        bgColor: '#fef2f2',
        icon: <AlertOutlined style={{ fontSize: 20, color: '#ef4444' }} />,
      },
      {
        label: 'Khoa yêu cầu',
        value: thongKeChiDinhDichVu?.khoaYeuCau ?? 0,
        color: '#8b5cf6',
        bgColor: '#f3e8ff',
        icon: <ApartmentOutlined style={{ fontSize: 20, color: '#8b5cf6' }} />,
      },
    ];
  }, [thongKeChiDinhDichVu]);

  const handleViewDetail = (item: ChiDinhDichVuListDto) => {
    Modal.info({
      title: `Chi tiết chỉ định: ${item.tenDichVu}`,
      width: 500,
      content: (
        <div style={{ marginTop: 12 }}>
          <p><strong>Bệnh nhân:</strong> {item.tenBenhNhan}</p>
          <p><strong>Loại dịch vụ:</strong> {item.loaiDichVu || 'Xét nghiệm'}</p>
          <p><strong>Bác sĩ chỉ định:</strong> {item.tenBacSiChiDinh}</p>
          <p><strong>Khoa:</strong> {item.tenKhoa}</p>
          <p><strong>Ngày chỉ định:</strong> {item.ngayChiDinh ? new Date(item.ngayChiDinh).toLocaleString('vi-VN') : '--'}</p>
          <p><strong>Trạng thái:</strong> {item.trangThai}</p>
        </div>
      ),
    });
  };

  const columns: ColumnsType<ChiDinhDichVuListDto> = [
    {
      title: '#',
      key: 'idx',
      width: 60,
      align: 'center',
      render: (_, __, index) => (pageIndex - 1) * pageSize + index + 1,
    },
    {
      title: 'Bệnh nhân',
      dataIndex: 'tenBenhNhan',
      key: 'tenBenhNhan',
      render: (text) => <Text strong style={{ color: '#0b4f6c' }}>{text}</Text>,
    },
    {
      title: 'Dịch vụ / Xét nghiệm',
      dataIndex: 'tenDichVu',
      key: 'tenDichVu',
      render: (text, record) => (
        <div>
          <Text strong>{text || 'Dịch vụ CLS'}</Text>
          {record.loaiDichVu && (
            <div style={{ fontSize: 12, color: '#6a7f96' }}>{record.loaiDichVu}</div>
          )}
        </div>
      ),
    },
    {
      title: 'BS chỉ định',
      dataIndex: 'tenBacSiChiDinh',
      key: 'tenBacSiChiDinh',
      width: 160,
    },
    {
      title: 'Khoa',
      dataIndex: 'tenKhoa',
      key: 'tenKhoa',
      width: 140,
    },
    {
      title: 'Thời gian chỉ định',
      dataIndex: 'ngayChiDinh',
      key: 'ngayChiDinh',
      width: 140,
      render: (dateStr: string) =>
        dateStr ? new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '--',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 130,
      render: (status: string) => {
        switch (status) {
          case 'DaChiDinh':
            return <Tag color="warning">Chờ xử lý</Tag>;
          case 'DaTiepNhan':
            return <Tag color="processing">Đang xử lý</Tag>;
          case 'ChoKetQua':
            return <Tag color="purple">Chờ kết quả</Tag>;
          case 'DaCoKetQua':
            return <Tag color="success">Hoàn thành</Tag>;
          case 'DaHuy':
            return <Tag color="default">Đã hủy</Tag>;
          default:
            return <Tag color="default">{status || 'Chờ'}</Tag>;
        }
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 90,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          />
        </Tooltip>
      ),
    },
  ];

  const filteredList = useMemo(() => {
    if (!searchKeyword) return chiDinhDichVuList;
    const kw = searchKeyword.toLowerCase();
    return chiDinhDichVuList.filter(
      (item) =>
        item.tenBenhNhan?.toLowerCase().includes(kw) ||
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

      {/* Integrated Control Toolbar */}
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
            <ExperimentOutlined style={{ color: '#0b4f6c', fontSize: 16 }} />
            <Text strong style={{ fontSize: 14, color: '#0f172a' }}>
              Danh sách chỉ định cận lâm sàng
            </Text>
          </Space>
          <Tag color="blue" style={{ borderRadius: 4, margin: 0 }}>
            {chiDinhDichVuTotal} chỉ định
          </Tag>
        </Space>

        <Space wrap size="small">
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Tìm bệnh nhân, xét nghiệm..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            allowClear
            style={{ width: 220 }}
            size="middle"
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
              { value: 'DaChiDinh', label: 'Chờ xử lý' },
              { value: 'DaTiepNhan', label: 'Đang xử lý' },
              { value: 'ChoKetQua', label: 'Chờ kết quả' },
              { value: 'DaCoKetQua', label: 'Hoàn thành' },
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
            onClick={() =>
              fetchChiDinhDichVuList({
                pageIndex,
                pageSize,
                maKhoa: khoaFilter,
                trangThai: statusFilter || undefined,
              })
            }
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
    </div>
  );
};

export default ExaminationCLS;