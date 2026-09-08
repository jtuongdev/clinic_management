import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Input,
  DatePicker,
  App,
} from 'antd';
import {
  CheckCircleOutlined,
  ReloadOutlined,
  PrinterOutlined,
  SearchOutlined,
  ClearOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  DispensedPrescriptionDto,
  PrescriptionPrintDto,
} from '../types/inventory.types';
import { inventoryApi } from '../api/inventory.api';
import PrescriptionPrintModal from './PrescriptionPrintModal';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const DispensedPanel: React.FC = () => {
  const { message } = App.useApp();

  const [dispensedList, setDispensedList] = useState<DispensedPrescriptionDto[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [keyword, setKeyword] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  // Pagination
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Print modal state
  const [printData, setPrintData] = useState<PrescriptionPrintDto | null>(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);

  const fetchDispensed = useCallback(async () => {
    setLoading(true);
    try {
      const fromDate = dateRange?.[0] ? dateRange[0].startOf('day').toISOString() : undefined;
      const toDate = dateRange?.[1] ? dateRange[1].endOf('day').toISOString() : undefined;

      const res = await inventoryApi.getDispensedPrescriptions({
        keyword: keyword.trim() || undefined,
        fromDate,
        toDate,
        pageIndex,
        pageSize,
      });

      if (res.data.success && res.data.data) {
        setDispensedList(res.data.data.items ?? []);
        setTotal(res.data.data.total ?? 0);
      } else {
        message.error(res.data.message || 'Không thể tải danh sách đơn thuốc đã cấp phát');
      }
    } catch {
      message.error('Lỗi khi tải danh sách đơn thuốc đã cấp phát');
    } finally {
      setLoading(false);
    }
  }, [keyword, dateRange, pageIndex, pageSize, message]);

  useEffect(() => {
    fetchDispensed();
  }, [fetchDispensed]);

  const handleSearch = () => {
    setPageIndex(1);
    fetchDispensed();
  };

  const handleReset = () => {
    setKeyword('');
    setDateRange(null);
    setPageIndex(1);
  };

  const handleOpenPrint = async (prescriptionId: number) => {
    setPrintLoading(true);
    setPrintModalOpen(true);
    try {
      const res = await inventoryApi.getPrescriptionPrintData(prescriptionId);
      if (res.data.success && res.data.data) {
        setPrintData(res.data.data);
      } else {
        message.error(res.data.message || 'Không thể tải dữ liệu in đơn thuốc');
        setPrintModalOpen(false);
      }
    } catch {
      message.error('Lỗi khi tải thông tin in đơn thuốc');
      setPrintModalOpen(false);
    } finally {
      setPrintLoading(false);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '--';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return '--';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const columns: ColumnsType<DispensedPrescriptionDto> = [
    {
      title: 'Mã đơn',
      key: 'prescriptionCode',
      width: 130,
      render: (_, record) => (
        <Text strong style={{ color: '#0b4f6c' }}>
          {record.prescriptionCode || `#${record.prescriptionId}`}
        </Text>
      ),
    },
    {
      title: 'Lượt khám',
      key: 'maLuotKham',
      width: 100,
      render: (_, record) => `#${record.maLuotKham}`,
    },
    {
      title: 'Bệnh nhân',
      dataIndex: 'patientName',
      key: 'patientName',
      render: (name) => <Text strong>{name || '--'}</Text>,
    },
    {
      title: 'Bác sĩ kê',
      dataIndex: 'doctorName',
      key: 'doctorName',
      width: 140,
      render: (name) => name || <Text type="secondary">--</Text>,
    },
    {
      title: 'Dược sĩ cấp',
      dataIndex: 'dispenserName',
      key: 'dispenserName',
      width: 140,
      render: (name) => (
        <Space size={4}>
          <Tag color="cyan">{name || 'Dược sĩ quầy'}</Tag>
        </Space>
      ),
    },
    {
      title: 'Ngày kê',
      key: 'ngayKe',
      width: 110,
      render: (_, record) => formatDate(record.ngayKe),
    },
    {
      title: 'Thời gian cấp phát',
      key: 'ngayCapThuoc',
      width: 150,
      render: (_, record) => formatDateTime(record.ngayCapThuoc),
    },
    {
      title: 'Số món',
      dataIndex: 'soLuongDong',
      key: 'soLuongDong',
      width: 80,
      align: 'center',
      render: (val) => <Tag color="default">{val} thuốc</Tag>,
    },
    {
      title: 'Phiếu xuất kho',
      dataIndex: 'exportReceiptCode',
      key: 'exportReceiptCode',
      width: 160,
      render: (code) =>
        code ? (
          <Space size={4}>
            <FileTextOutlined style={{ color: '#0284c7' }} />
            <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>{code}</Text>
          </Space>
        ) : (
          <Text type="secondary">--</Text>
        ),
    },
    {
      title: 'Trạng thái',
      key: 'trangThai',
      width: 120,
      render: () => <Tag color="success">Đã cấp phát</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 110,
      align: 'center',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<PrinterOutlined />}
          onClick={() => handleOpenPrint(record.prescriptionId)}
        >
          In lại
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Search and Filters Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          background: '#fff',
          padding: '12px 16px',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
        }}
      >
        <Space wrap size="middle">
          <Input
            placeholder="Tìm theo mã đơn, bệnh nhân, bác sĩ..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 280 }}
            allowClear
            prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
          />
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null])}
            format="DD/MM/YYYY"
            placeholder={['Từ ngày cấp', 'Đến ngày cấp']}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            Tìm kiếm
          </Button>
          <Button icon={<ClearOutlined />} onClick={handleReset}>
            Đặt lại
          </Button>
        </Space>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchDispensed} loading={loading}>
            Làm mới
          </Button>
        </Space>
      </div>

      {/* Summary Tag */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <CheckCircleOutlined style={{ color: '#16a34a', fontSize: 16 }} />
          <Text strong>Lịch sử đơn thuốc đã cấp phát</Text>
          <Tag color="green">{total} đơn</Tag>
        </Space>
      </div>

      {/* Main Table */}
      <Table<DispensedPrescriptionDto>
        rowKey={(r) => String(r.prescriptionId)}
        columns={columns}
        dataSource={dispensedList}
        loading={loading}
        size="middle"
        pagination={{
          current: pageIndex,
          pageSize,
          total,
          onChange: (page, size) => {
            setPageIndex(page);
            setPageSize(size);
          },
          showSizeChanger: true,
          showTotal: (t, range) =>
            `Hiển thị ${range[0]}–${range[1]} / ${t} đơn`,
        }}
        locale={{
          emptyText: (
            <div style={{ padding: '32px 0', color: '#94a3b8' }}>
              Không tìm thấy đơn thuốc nào đã cấp phát phù hợp
            </div>
          ),
        }}
      />

      {/* Prescription Print Modal */}
      <PrescriptionPrintModal
        open={printModalOpen}
        data={printData}
        loading={printLoading}
        onClose={() => {
          setPrintModalOpen(false);
          setPrintData(null);
        }}
      />
    </div>
  );
};

export default DispensedPanel;
