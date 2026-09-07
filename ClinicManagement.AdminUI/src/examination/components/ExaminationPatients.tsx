import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  App,
} from 'antd';
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  SearchOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useExamination } from '../hook/useExamination';
import ActionBar from '../../shared/components/layouts/components/ActionBar';
import { BenhNhanListDto } from '../type/examination.types';

const { Text } = Typography;

const ExaminationPatients: React.FC = () => {
  const { message } = App.useApp();
  const {
    benhNhanList,
    thongKeBenhNhan,
    benhNhanTotal,
    loadingBenhNhan,
    loadingThongKeBenhNhan,
    fetchBenhNhanList,
    fetchThongKeBenhNhan,
    filters,
    khoas,
  } = useExamination();

  // State bộ lọc và phân trang
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedKhoa, setSelectedKhoa] = useState<number | undefined>(undefined);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // State ActionBar
  const [selectedPatient, setSelectedPatient] = useState<BenhNhanListDto | null>(null);

  const handleRowClick = (record: BenhNhanListDto) => {
    setSelectedPatient(record);
  };

  const handleCloseActionBar = () => {
    setSelectedPatient(null);
  };

  // Định nghĩa actions cho bệnh nhân
  const patientActions = [
    {
      label: 'Xem chi tiết',
      icon: 'eye',
      color: 'primary' as const,
      onClick: (id: number | string) => {
        message.info(`Xem chi tiết bệnh nhân: ${id}`);
      },
    },
    {
      label: 'Chỉnh sửa',
      icon: 'edit',
      color: 'warning' as const,
      onClick: (id: number | string) => {
        message.info(`Sửa thông tin bệnh nhân: ${id}`);
      },
    },
    {
      label: 'Xóa',
      icon: 'trash',
      color: 'danger' as const,
      onClick: (id: number | string) => {
        Modal.confirm({
          title: 'Xác nhận xóa bệnh nhân?',
          content: `Bạn có chắc muốn xóa hồ sơ bệnh nhân ${id}?`,
          okText: 'Xóa',
          okType: 'danger',
          onOk: () => {
            message.success(`Đã xóa bệnh nhân: ${id}`);
          },
        });
      },
    },
  ];

  // Hàm tải dữ liệu
  const loadData = useCallback(() => {
    fetchBenhNhanList({
      pageIndex,
      pageSize,
      keyword: searchKeyword || undefined,
      trangThai: selectedStatus || undefined,
      maKhoa: selectedKhoa || filters.maKhoa || undefined,
      maCoSo: filters.maCoSo || undefined,
    });
    fetchThongKeBenhNhan({ maCoSo: filters.maCoSo, maKhoa: filters.maKhoa });
  }, [
    pageIndex,
    pageSize,
    searchKeyword,
    selectedStatus,
    selectedKhoa,
    filters.maCoSo,
    filters.maKhoa,
    fetchBenhNhanList,
    fetchThongKeBenhNhan,
  ]);

  // Reset trang khi thay đổi bộ lọc
  useEffect(() => {
    setPageIndex(1);
  }, [searchKeyword, selectedStatus, selectedKhoa, filters.maCoSo, filters.maKhoa]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // KPIs
  const kpis = useMemo(() => {
    return [
      {
        label: 'Tiếp nhận hôm nay',
        value: thongKeBenhNhan?.homNay ?? 0,
        color: '#0b4f6c',
        bgColor: '#e8f4f7',
        icon: <TeamOutlined style={{ fontSize: 20, color: '#0b4f6c' }} />,
      },
      {
        label: 'Chờ khám',
        value: thongKeBenhNhan?.cho ?? 0,
        color: '#f59e0b',
        bgColor: '#fffbeb',
        icon: <ClockCircleOutlined style={{ fontSize: 20, color: '#f59e0b' }} />,
      },
      {
        label: 'Đang khám',
        value: thongKeBenhNhan?.dangKham ?? 0,
        color: '#0284c7',
        bgColor: '#e0f2fe',
        icon: <MedicineBoxOutlined style={{ fontSize: 20, color: '#0284c7' }} />,
      },
      {
        label: 'Đã hoàn tất',
        value: thongKeBenhNhan?.hoanThanh ?? 0,
        color: '#10b981',
        bgColor: '#ecfdf5',
        icon: <CheckCircleOutlined style={{ fontSize: 20, color: '#10b981' }} />,
      },
    ];
  }, [thongKeBenhNhan]);

  const columns: ColumnsType<BenhNhanListDto> = [
    {
      title: 'Mã BN',
      dataIndex: 'maBenhNhanNoiBo',
      key: 'maBenhNhanNoiBo',
      width: 110,
      render: (text) => <Text code strong>{text}</Text>,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'hoTen',
      key: 'hoTen',
      render: (text, record) => (
        <div>
          <Text strong style={{ color: '#0b4f6c' }}>{text}</Text>
          <div style={{ fontSize: 12, color: '#6a7f96' }}>
            {record.tuoi} tuổi · {record.gioiTinh === 'M' ? 'Nam' : 'Nữ'}
          </div>
        </div>
      ),
    },
    {
      title: 'Điện thoại',
      dataIndex: 'dienThoai',
      key: 'dienThoai',
      width: 120,
    },
    {
      title: 'Lượt khám gần nhất',
      dataIndex: 'maLuotKhamGanNhat',
      key: 'maLuotKhamGanNhat',
      width: 150,
      render: (text) => text ? <Tag color="blue">{text}</Tag> : '--',
    },
    {
      title: 'Khoa',
      dataIndex: 'khoa',
      key: 'khoa',
      width: 130,
    },
    {
      title: 'Bác sĩ',
      dataIndex: 'bacSi',
      key: 'bacSi',
      width: 150,
    },
    {
      title: 'Bắt đầu khám',
      dataIndex: 'thoiGianBatDauKham',
      key: 'thoiGianBatDauKham',
      width: 120,
      render: (time) =>
        time ? new Date(time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThaiLuotKham',
      key: 'trangThaiLuotKham',
      width: 130,
      render: (status: string) => {
        switch (status) {
          case 'Cho':
          case 'CHO_KHAM':
            return <Tag color="warning">Chờ khám</Tag>;
          case 'DangKham':
          case 'DANG_KHAM':
            return <Tag color="processing">Đang khám</Tag>;
          case 'HoanThanh':
          case 'HOAN_THANH':
            return <Tag color="success">Hoàn tất</Tag>;
          default:
            return <Tag color="default">{status || 'Chờ'}</Tag>;
        }
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 110,
      align: 'center',
      render: (_, record) => (
        <Space size={4} onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleRowClick(record)}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => message.info(`Sửa thông tin ${record.hoTen}`)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: 'Xóa hồ sơ?',
                  content: `Xóa hồ sơ bệnh nhân ${record.hoTen}?`,
                  onOk: () => message.success(`Đã xóa ${record.hoTen}`),
                });
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

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
            <TeamOutlined style={{ color: '#0b4f6c', fontSize: 16 }} />
            <Text strong style={{ fontSize: 14, color: '#0f172a' }}>
              Hồ sơ & danh sách người bệnh
            </Text>
          </Space>
          <Tag color="blue" style={{ borderRadius: 4, margin: 0 }}>
            {benhNhanTotal} người bệnh
          </Tag>
        </Space>

        <Space wrap size="small">
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Tìm tên, mã BN, SĐT..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            allowClear
            style={{ width: 230 }}
            size="middle"
          />
          <Select
            placeholder="Tất cả trạng thái"
            value={selectedStatus || undefined}
            onChange={(val) => {
              setSelectedStatus(val || '');
              setPageIndex(1);
            }}
            allowClear
            style={{ width: 145 }}
            size="middle"
            options={[
              { value: 'Cho', label: 'Chờ khám' },
              { value: 'DangKham', label: 'Đang khám' },
              { value: 'HoanThanh', label: 'Hoàn tất' },
            ]}
          />
          <Select
            placeholder="Tất cả khoa"
            value={selectedKhoa}
            onChange={(val) => {
              setSelectedKhoa(val);
              setPageIndex(1);
            }}
            allowClear
            style={{ width: 160 }}
            size="middle"
            options={khoas.map((k) => ({ value: k.id, label: k.ten }))}
          />
          <Button icon={<ReloadOutlined />} onClick={loadData} size="middle">
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
        <Table<BenhNhanListDto>
          rowKey="id"
          columns={columns}
          dataSource={benhNhanList}
          loading={loadingBenhNhan}
          size="middle"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: {
              cursor: 'pointer',
              background: selectedPatient?.id === record.id ? '#e8f4f7' : undefined,
            },
          })}
          pagination={{
            current: pageIndex,
            pageSize: pageSize,
            total: benhNhanTotal,
            onChange: (page, size) => {
              setPageIndex(page);
              setPageSize(size);
            },
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `Hiển thị ${range[0]} - ${range[1]} / ${total} người bệnh`,
            style: { padding: '8px 16px', margin: 0 },
          }}
          scroll={{ y: 'calc(100vh - 235px)' }}
        />
      </div>

      {/* Modernized ActionBar */}
      <ActionBar
        isVisible={!!selectedPatient}
        onClose={handleCloseActionBar}
        selectedId={selectedPatient?.maBenhNhanNoiBo}
        actions={patientActions}
        title="Bệnh nhân đã chọn"
        entityName={selectedPatient?.hoTen || 'Người bệnh'}
      />
    </div>
  );
};

export default ExaminationPatients;