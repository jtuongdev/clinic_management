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
  App,
} from 'antd';
import {
  FullscreenOutlined,
  FullscreenExitOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  PlayCircleOutlined,
  StopOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useExamination } from '../hook/useExamination';
import ActionBar from '../../shared/components/layouts/components/ActionBar';
import { LuotKhamItemDto } from '../type/examination.types';
import { examinationApi } from '../api/examination.api';

const { Text } = Typography;

const ExaminationList: React.FC = () => {
  const { message } = App.useApp();
  const {
    luotKhamList,
    luotKhamTotal,
    thongKeKhamBenh,
    loadingLuotKham,
    loadingThongKeKhamBenh,
    fetchLuotKhamList,
    fetchThongKeKhamBenh,
    filters,
    khoas,
  } = useExamination();

  // State bộ lọc cục bộ
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [khoaFilter, setKhoaFilter] = useState<number | undefined>(undefined);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // State ActionBar
  const [selectedItem, setSelectedItem] = useState<LuotKhamItemDto | null>(null);

  // Tải danh sách lượt khám
  const loadList = useCallback(() => {
    fetchLuotKhamList({
      pageIndex,
      pageSize,
      maKhoa: khoaFilter || filters.maKhoa,
      trangThai: statusFilter || undefined,
    });
  }, [pageIndex, pageSize, khoaFilter, statusFilter, filters.maKhoa, fetchLuotKhamList]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  // Tải thống kê
  useEffect(() => {
    if (filters.maCoSo) {
      fetchThongKeKhamBenh({ maCoSo: filters.maCoSo, maKhoa: filters.maKhoa });
    }
  }, [filters.maCoSo, filters.maKhoa, fetchThongKeKhamBenh]);

  // Xây dựng KPI
  const kpis = useMemo(() => {
    const cho = thongKeKhamBenh?.cho ?? 0;
    const dangKham = thongKeKhamBenh?.dangKham ?? 0;
    const choCLS = thongKeKhamBenh?.choCLS ?? 0;
    const hoanThanh = thongKeKhamBenh?.hoanThanh ?? 0;
    const total = cho + dangKham + choCLS + hoanThanh;

    return [
      {
        title: 'Tổng lượt',
        value: total,
        color: '#0b4f6c',
        bgColor: '#e8f4f7',
        icon: <MedicineBoxOutlined style={{ fontSize: 20, color: '#0b4f6c' }} />,
      },
      {
        title: 'Chờ khám',
        value: cho,
        color: '#f59e0b',
        bgColor: '#fffbeb',
        icon: <ClockCircleOutlined style={{ fontSize: 20, color: '#f59e0b' }} />,
      },
      {
        title: 'Đang khám',
        value: dangKham,
        color: '#0284c7',
        bgColor: '#e0f2fe',
        icon: <MedicineBoxOutlined style={{ fontSize: 20, color: '#0284c7' }} />,
      },
      {
        title: 'Chờ kết quả CLS',
        value: choCLS,
        color: '#8b5cf6',
        bgColor: '#f3e8ff',
        icon: <ExperimentOutlined style={{ fontSize: 20, color: '#8b5cf6' }} />,
      },
      {
        title: 'Đã hoàn tất',
        value: hoanThanh,
        color: '#10b981',
        bgColor: '#ecfdf5',
        icon: <CheckCircleOutlined style={{ fontSize: 20, color: '#10b981' }} />,
      },
    ];
  }, [thongKeKhamBenh]);

  const handleRowClick = (item: LuotKhamItemDto) => {
    setSelectedItem(item);
  };

  const closeActionBar = () => {
    setSelectedItem(null);
  };

  // Action handlers
  const handleViewDetail = (item: LuotKhamItemDto) => {
    Modal.info({
      title: `Chi tiết lượt khám: ${item.maBenhNhanNoiBo}`,
      width: 500,
      content: (
        <div style={{ marginTop: 12 }}>
          <p><strong>Bệnh nhân:</strong> {item.tenBenhNhan} ({item.tuoi} tuổi, {item.gioiTinh === 'M' ? 'Nam' : 'Nữ'})</p>
          <p><strong>Bác sĩ phụ trách:</strong> {item.tenBacSi}</p>
          <p><strong>Khoa điều trị:</strong> {item.tenKhoa}</p>
          <p><strong>Phòng khám:</strong> {item.tenPhongKham}</p>
          <p><strong>Hình thức điều trị:</strong> {item.hinhThucDieuTri || 'Khám ngoại trú'}</p>
          <p><strong>BHYT:</strong> {item.coBHYT ? 'Có áp dụng BHYT' : 'Viện phí tự nguyện'}</p>
          <p><strong>Trạng thái:</strong> {item.trangThai}</p>
        </div>
      ),
    });
  };

  const handleStartExam = (item: LuotKhamItemDto) => {
    message.success(`Bắt đầu khám cho bệnh nhân ${item.tenBenhNhan}`);
  };

  const handleCompleteExam = (item: LuotKhamItemDto) => {
    Modal.confirm({
      title: 'Hoàn tất lượt khám và tạo hóa đơn?',
      content: `Hệ thống sẽ tạo hóa đơn và công nợ cho ${item.tenBenhNhan} nếu có dịch vụ hoặc thuốc phát sinh.`,
      okText: 'Hoàn tất',
      cancelText: 'Quay lại',
      onOk: async () => {
        try {
          await examinationApi.completeExam(item.id);
          message.success('Đã hoàn tất lượt khám và tạo hóa đơn/công nợ.');
          setSelectedItem(null);
          loadList();
          if (filters.maCoSo) {
            fetchThongKeKhamBenh({ maCoSo: filters.maCoSo, maKhoa: filters.maKhoa });
          }
        } catch {
          message.error('Không thể hoàn tất lượt khám.');
        }
      },
    });
  };

  const handleCancelExam = (item: LuotKhamItemDto) => {
    Modal.confirm({
      title: 'Xác nhận hủy lượt khám?',
      content: `Bạn có chắc muốn hủy lượt khám của bệnh nhân ${item.tenBenhNhan}?`,
      okText: 'Hủy lượt',
      okType: 'danger',
      cancelText: 'Quay lại',
      onOk: () => {
        message.info(`Đã hủy lượt khám ${item.maBenhNhanNoiBo}`);
      },
    });
  };

  // Định nghĩa actions cho ActionBar
  const examActions = [
    {
      label: 'Xem chi tiết',
      icon: 'eye',
      color: 'primary' as const,
      onClick: () => {
        if (selectedItem) handleViewDetail(selectedItem);
      },
    },
    {
      label: 'Bắt đầu khám',
      icon: 'play',
      color: 'success' as const,
      onClick: () => {
        if (selectedItem) handleStartExam(selectedItem);
      },
    },
    {
      label: 'Hoàn tất & lập HĐ',
      icon: 'check',
      color: 'primary' as const,
      onClick: () => {
        if (selectedItem) handleCompleteExam(selectedItem);
      },
    },
    {
      label: 'Hủy lượt',
      icon: 'ban',
      color: 'danger' as const,
      onClick: () => {
        if (selectedItem) handleCancelExam(selectedItem);
      },
    },
  ];

  // Table columns definition
  const columns: ColumnsType<LuotKhamItemDto> = [
    {
      title: 'Mã BN',
      dataIndex: 'maBenhNhanNoiBo',
      key: 'maBenhNhanNoiBo',
      width: 120,
      render: (text) => <Text code strong>{text}</Text>,
    },
    {
      title: 'Bệnh nhân',
      dataIndex: 'tenBenhNhan',
      key: 'tenBenhNhan',
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
      title: 'Khoa',
      dataIndex: 'tenKhoa',
      key: 'tenKhoa',
      width: 140,
    },
    {
      title: 'Bác sĩ phụ trách',
      dataIndex: 'tenBacSi',
      key: 'tenBacSi',
      width: 160,
    },
    {
      title: 'Phòng khám',
      dataIndex: 'tenPhongKham',
      key: 'tenPhongKham',
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Bắt đầu',
      dataIndex: 'thoiGianBatDauKham',
      key: 'thoiGianBatDauKham',
      width: 110,
      render: (time) =>
        time ? new Date(time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '--',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 130,
      render: (status: string) => {
        switch (status) {
          case 'Cho':
          case 'CHO_KHAM':
            return <Tag color="warning">Chờ khám</Tag>;
          case 'DangKham':
          case 'DANG_KHAM':
            return <Tag color="processing">Đang khám</Tag>;
          case 'ChoCLS':
          case 'CHO_CLS':
            return <Tag color="purple">Chờ CLS</Tag>;
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
      width: 130,
      align: 'center',
      render: (_, record) => (
        <Space size={4} onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Bắt đầu khám">
            <Button
              type="text"
              size="small"
              icon={<PlayCircleOutlined style={{ color: '#10b981' }} />}
              onClick={() => handleStartExam(record)}
            />
          </Tooltip>
          {record.trangThai === 'DANG_KHAM' && (
           <Tooltip title="Hoàn tất và lập hóa đơn">
             <Button
               type="text"
               size="small"
               icon={<CheckCircleOutlined style={{ color: '#2563eb' }} />}
               onClick={() => handleCompleteExam(record)}
             />
           </Tooltip>
          )}
          <Tooltip title="Hủy lượt khám">
            <Button
              type="text"
              size="small"
              danger
              icon={<StopOutlined />}
              onClick={() => handleCancelExam(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Filtered list client-side if search keyword entered
  const filteredList = useMemo(() => {
    if (!searchKeyword) return luotKhamList;
    const kw = searchKeyword.toLowerCase();
    return luotKhamList.filter(
      (item) =>
        item.tenBenhNhan?.toLowerCase().includes(kw) ||
        item.maBenhNhanNoiBo?.toLowerCase().includes(kw) ||
        item.tenBacSi?.toLowerCase().includes(kw)
    );
  }, [luotKhamList, searchKeyword]);

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
                <span style={{ fontSize: 12, color: '#64748b' }}>{kpi.title}:</span>
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
            <MedicineBoxOutlined style={{ color: '#0b4f6c', fontSize: 16 }} />
            <Text strong style={{ fontSize: 14, color: '#0f172a' }}>
              Danh sách lượt khám bệnh
            </Text>
          </Space>
          <Tag color="blue" style={{ borderRadius: 4, margin: 0 }}>
            {luotKhamTotal} lượt
          </Tag>
        </Space>

        <Space wrap size="small">
          <Input
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
            placeholder="Tìm mã BN, tên, bác sĩ..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            allowClear
            style={{ width: 230 }}
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
              { value: 'Cho', label: 'Chờ khám' },
              { value: 'DangKham', label: 'Đang khám' },
              { value: 'ChoCLS', label: 'Chờ CLS' },
              { value: 'HoanThanh', label: 'Hoàn tất' },
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
          <Button icon={<ReloadOutlined />} onClick={loadList} size="middle">
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
        <Table<LuotKhamItemDto>
          rowKey="id"
          columns={columns}
          dataSource={filteredList}
          loading={loadingLuotKham}
          size="middle"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: {
              cursor: 'pointer',
              background: selectedItem?.id === record.id ? '#e8f4f7' : undefined,
            },
          })}
          pagination={{
            current: pageIndex,
            pageSize: pageSize,
            total: luotKhamTotal,
            onChange: (page, size) => {
              setPageIndex(page);
              setPageSize(size);
            },
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `Hiển thị ${range[0]} - ${range[1]} / ${total} lượt khám`,
            style: { padding: '8px 16px', margin: 0 },
          }}
          scroll={{ y: 'calc(100vh - 235px)' }}
        />
      </div>

      {/* Modernized ActionBar */}
      <ActionBar
        isVisible={!!selectedItem}
        onClose={closeActionBar}
        selectedId={selectedItem?.maBenhNhanNoiBo}
        actions={examActions}
        title="Lượt khám đã chọn"
        entityName={selectedItem?.tenBenhNhan || 'Bệnh nhân'}
      />
    </div>
  );
};

export default ExaminationList;