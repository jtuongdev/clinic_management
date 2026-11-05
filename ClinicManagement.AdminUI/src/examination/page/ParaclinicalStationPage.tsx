import React, { useState } from 'react';
import { Card, Table, Tag, Button, Space, Input, Select, Typography, Modal, message, Row, Col } from 'antd';
import {
  ExperimentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  PrinterOutlined,
  EditOutlined,
  FileDoneOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

export interface ParaclinicalOrderRecord {
  id: number;
  maPhieu: string;
  maBenhNhan: string;
  tenBenhNhan: string;
  namSinh: number;
  gioiTinh: string;
  tenDichVu: string;
  nhomDichVu: 'XET_NGHIEM' | 'CDHA';
  phongChiDinh: string;
  bacSiChiDinh: string;
  gioChiDinh: string;
  trangThai: 'CHO_TIEP_NHAN' | 'DANG_THUC_HIEN' | 'DA_CO_KET_QUA';
  ketQua?: string;
  giaTriBinhThuong?: string;
  donViTinh?: string;
}

export const ParaclinicalStationPage: React.FC = () => {
  const [filterNhom, setFilterNhom] = useState<'ALL' | 'XET_NGHIEM' | 'CDHA'>('ALL');
  const [filterTrangThai, setFilterTrangThai] = useState<string>('ALL');
  const [searchText, setSearchText] = useState('');

  const [orders, setOrders] = useState<ParaclinicalOrderRecord[]>([
    {
      id: 1,
      maPhieu: 'CLS-22001',
      maBenhNhan: '22000308',
      tenBenhNhan: 'NGUYỄN THỊ BÌNH AN',
      namSinh: 1995,
      gioiTinh: 'Nữ',
      tenDichVu: 'Tổng phân tích tế bào máu ngoại vi (bằng máy đếm laser 24 thông số)',
      nhomDichVu: 'XET_NGHIEM',
      phongChiDinh: 'Phòng 101 - Khám Nhi 1',
      bacSiChiDinh: 'BS. Sennv',
      gioChiDinh: '15:40 11/08/2022',
      trangThai: 'DA_CO_KET_QUA',
      ketQua: 'WBC: 11.2 (Tăng nhẹ), RBC: 4.5, HGB: 132, PLT: 245',
      giaTriBinhThuong: 'WBC: 4.0 - 10.0 G/L',
      donViTinh: 'G/L',
    },
    {
      id: 2,
      maPhieu: 'CLS-22002',
      maBenhNhan: '22000308',
      tenBenhNhan: 'NGUYỄN THỊ BÌNH AN',
      namSinh: 1995,
      gioiTinh: 'Nữ',
      tenDichVu: 'Định lượng C-Reactive Protein (CRP định lượng)',
      nhomDichVu: 'XET_NGHIEM',
      phongChiDinh: 'Phòng 101 - Khám Nhi 1',
      bacSiChiDinh: 'BS. Sennv',
      gioChiDinh: '15:40 11/08/2022',
      trangThai: 'DANG_THUC_HIEN',
      giaTriBinhThuong: '< 5.0 mg/L',
      donViTinh: 'mg/L',
    },
    {
      id: 3,
      maPhieu: 'CLS-22003',
      maBenhNhan: '22000306',
      tenBenhNhan: 'NGUYỄN ĐÌNH PHÓNG',
      namSinh: 1989,
      gioiTinh: 'Nam',
      tenDichVu: 'Chụp X-Quang ngực thẳng (Kỹ thuật số CR/DR)',
      nhomDichVu: 'CDHA',
      phongChiDinh: 'Phòng 103 - Nội Tổng Quát',
      bacSiChiDinh: 'ThS. BS. Trần Thị C',
      gioChiDinh: '15:45 11/08/2022',
      trangThai: 'CHO_TIEP_NHAN',
    },
    {
      id: 4,
      maPhieu: 'CLS-22004',
      maBenhNhan: '22000304',
      tenBenhNhan: 'NGUYỄN HOÀNG LONG',
      namSinh: 1990,
      gioiTinh: 'Nam',
      tenDichVu: 'Siêu âm ổ bụng tổng quát (màu Doppler)',
      nhomDichVu: 'CDHA',
      phongChiDinh: 'Phòng 103 - Nội Tổng Quát',
      bacSiChiDinh: 'ThS. BS. Trần Thị C',
      gioChiDinh: '15:48 11/08/2022',
      trangThai: 'DA_CO_KET_QUA',
      ketQua: 'Gan, mật, tụy, lách, hai thận kích thước bình thường. Chưa thấy hình ảnh sỏi hay khối u khu trú.',
    },
  ]);

  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ParaclinicalOrderRecord | null>(null);
  const [inputResult, setInputResult] = useState('');

  const handleOpenEnterResult = (record: ParaclinicalOrderRecord) => {
    setSelectedRecord(record);
    setInputResult(record.ketQua || '');
    setResultModalOpen(true);
  };

  const handleSaveResult = () => {
    if (!selectedRecord) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedRecord.id
          ? { ...o, ketQua: inputResult, trangThai: 'DA_CO_KET_QUA' }
          : o
      )
    );
    message.success(`Đã lưu và trả kết quả thành công cho phiếu ${selectedRecord.maPhieu}`);
    setResultModalOpen(false);
  };

  const handleStartExamining = (record: ParaclinicalOrderRecord) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === record.id ? { ...o, trangThai: 'DANG_THUC_HIEN' } : o))
    );
    message.info(`Đã tiếp nhận thực hiện mẫu cho phiếu ${record.maPhieu}`);
  };

  const filteredOrders = orders.filter((o) => {
    if (filterNhom !== 'ALL' && o.nhomDichVu !== filterNhom) return false;
    if (filterTrangThai !== 'ALL' && o.trangThai !== filterTrangThai) return false;
    if (searchText) {
      const match =
        o.tenBenhNhan.toLowerCase().includes(searchText.toLowerCase()) ||
        o.maBenhNhan.includes(searchText) ||
        o.maPhieu.toLowerCase().includes(searchText.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const columns: ColumnsType<ParaclinicalOrderRecord> = [
    {
      title: 'MÃ PHIẾU',
      dataIndex: 'maPhieu',
      key: 'maPhieu',
      width: 100,
      render: (val) => <Text strong style={{ color: '#0284c7' }}>{val}</Text>,
    },
    {
      title: 'BỆNH NHÂN',
      key: 'patient',
      width: 200,
      render: (_, r) => (
        <div>
          <Text strong>{r.tenBenhNhan}</Text>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            #{r.maBenhNhan} • {r.namSinh} ({r.gioiTinh})
          </div>
        </div>
      ),
    },
    {
      title: 'DỊCH VỤ CHỈ ĐỊNH',
      dataIndex: 'tenDichVu',
      key: 'tenDichVu',
      render: (val, r) => (
        <div>
          <Text>{val}</Text>
          <div style={{ marginTop: 2 }}>
            <Tag color={r.nhomDichVu === 'XET_NGHIEM' ? 'purple' : 'cyan'}>
              {r.nhomDichVu === 'XET_NGHIEM' ? 'XÉT NGHIỆM' : 'CĐ HÌNH ẢNH'}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'PHÒNG CHỈ ĐỊNH',
      key: 'source',
      width: 180,
      render: (_, r) => (
        <div style={{ fontSize: 12 }}>
          <div>{r.phongChiDinh}</div>
          <Text type="secondary" style={{ fontSize: 11 }}>{r.bacSiChiDinh} ({r.gioChiDinh})</Text>
        </div>
      ),
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 130,
      align: 'center',
      render: (val) => {
        switch (val) {
          case 'CHO_TIEP_NHAN':
            return <Tag color="warning" icon={<ClockCircleOutlined />}>Chờ lấy mẫu</Tag>;
          case 'DANG_THUC_HIEN':
            return <Tag color="processing" icon={<ExperimentOutlined />}>Đang thực hiện</Tag>;
          case 'DA_CO_KET_QUA':
            return <Tag color="success" icon={<CheckCircleOutlined />}>Đã có kết quả</Tag>;
          default:
            return <Tag>{val}</Tag>;
        }
      },
    },
    {
      title: 'KẾT QUẢ TÓM TẮT',
      dataIndex: 'ketQua',
      key: 'ketQua',
      render: (val) => (
        <span style={{ fontSize: 12, color: val ? '#0f172a' : '#94a3b8' }}>
          {val || 'Chưa nhập kết quả'}
        </span>
      ),
    },
    {
      title: 'THAO TÁC',
      key: 'actions',
      width: 170,
      align: 'center',
      render: (_, r) => (
        <Space size="small">
          {r.trangThai === 'CHO_TIEP_NHAN' && (
            <Button
              size="small"
              type="primary"
              style={{ background: '#0284c7' }}
              onClick={() => handleStartExamining(r)}
            >
              Tiếp nhận
            </Button>
          )}

          {r.trangThai === 'DANG_THUC_HIEN' && (
            <Button
              size="small"
              type="primary"
              style={{ background: '#16a34a' }}
              icon={<EditOutlined />}
              onClick={() => handleOpenEnterResult(r)}
            >
              Nhập KQ
            </Button>
          )}

          {r.trangThai === 'DA_CO_KET_QUA' && (
            <Button
              size="small"
              icon={<FileDoneOutlined />}
              onClick={() => handleOpenEnterResult(r)}
            >
              Sửa KQ
            </Button>
          )}

          <Button
            size="small"
            icon={<PrinterOutlined />}
            onClick={() => message.info(`Đang in phiếu kết quả cho ${r.tenBenhNhan}...`)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '16px', background: '#f8fafc', minHeight: '100%' }}>
      {/* Top title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0, color: '#0f172a' }}>
            <ExperimentOutlined style={{ marginRight: 8, color: '#0284c7' }} />
            Bàn Giao & Trả Kết Quả Cận Lâm Sàng (LIS / PACS Workstation)
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Tiếp nhận chỉ định từ phòng khám, chạy mẫu xét nghiệm / chẩn đoán hình ảnh và đẩy kết quả tự động về EMR
          </Text>
        </div>
      </div>

      {/* Filter toolbar */}
      <Card size="small" style={{ marginBottom: 12, borderRadius: 6 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Input
              prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Tìm theo tên BN, mã BN, mã phiếu..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Select
              style={{ width: '100%' }}
              value={filterNhom}
              onChange={(val) => setFilterNhom(val)}
              options={[
                { value: 'ALL', label: 'Tất cả nhóm dịch vụ' },
                { value: 'XET_NGHIEM', label: 'Xét nghiệm (Lab)' },
                { value: 'CDHA', label: 'CĐ Hình ảnh (XQ/Siêu âm)' },
              ]}
            />
          </Col>
          <Col xs={12} sm={8} md={4}>
            <Select
              style={{ width: '100%' }}
              value={filterTrangThai}
              onChange={(val) => setFilterTrangThai(val)}
              options={[
                { value: 'ALL', label: 'Tất cả trạng thái' },
                { value: 'CHO_TIEP_NHAN', label: 'Chờ lấy mẫu' },
                { value: 'DANG_THUC_HIEN', label: 'Đang thực hiện' },
                { value: 'DA_CO_KET_QUA', label: 'Đã có kết quả' },
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Main Table */}
      <Card size="small" style={{ borderRadius: 6 }}>
        <Table
          dataSource={filteredOrders}
          columns={columns}
          rowKey="id"
          size="small"
          bordered
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal Nhập kết quả CLS */}
      <Modal
        title={`Nhập kết quả CLS: ${selectedRecord?.tenDichVu || ''}`}
        open={resultModalOpen}
        onCancel={() => setResultModalOpen(false)}
        onOk={handleSaveResult}
        okText="Hoàn tất & Trả kết quả về EMR"
        cancelText="Đóng"
      >
        <div style={{ padding: '8px 0' }}>
          <div style={{ background: '#f1f5f9', padding: '8px 12px', borderRadius: 4, marginBottom: 12 }}>
            <div><b>Bệnh nhân:</b> {selectedRecord?.tenBenhNhan} (#{selectedRecord?.maBenhNhan})</div>
            <div><b>Chỉ định bởi:</b> {selectedRecord?.bacSiChiDinh} - {selectedRecord?.phongChiDinh}</div>
            {selectedRecord?.giaTriBinhThuong && (
              <div><b>Giá trị bình thường:</b> <span style={{ color: '#0284c7' }}>{selectedRecord?.giaTriBinhThuong}</span></div>
            )}
          </div>

          <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>
            Mô tả kết quả xét nghiệm / Kết luận hình ảnh:
          </label>
          <Input.TextArea
            rows={5}
            value={inputResult}
            onChange={(e) => setInputResult(e.target.value)}
            placeholder="Nhập thông số hoặc kết luận chi tiết..."
          />
        </div>
      </Modal>
    </div>
  );
};

export default ParaclinicalStationPage;
