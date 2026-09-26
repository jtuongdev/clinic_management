import React, { useEffect, useState } from 'react';
import {
  App,
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  PlusCircle,
  Trash2,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowLeft,
  Maximize2,
  Minimize2,
  X,
  FileSpreadsheet,
  CalendarCheck,
  Receipt,
  User,
  Building,
  ShieldCheck,
} from 'lucide-react';
import dayjs from 'dayjs';
import { payrollApi, type AttendanceDrillDownItem, type PayrollLine } from '../payroll.api';

const { Text } = Typography;

interface PayslipDrawerProps {
  open: boolean;
  onClose: () => void;
  line: PayrollLine | null;
  periodStatus: string;
  onLineUpdated: (updatedLine: PayrollLine) => void;
}

const money = (val?: number) => `${Number(val || 0).toLocaleString('vi-VN')} đ`;

export const PayslipDrawer: React.FC<PayslipDrawerProps> = ({
  open,
  onClose,
  line,
  periodStatus,
  onLineUpdated,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [drillDownLoading, setDrillDownLoading] = useState(false);
  const [drillDownItems, setDrillDownItems] = useState<AttendanceDrillDownItem[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(true);

  const isEditable = periodStatus === 'NHAP' || periodStatus === 'DA_DUYET';

  useEffect(() => {
    if (open) {
      setIsFullScreen(true);
    }
  }, [open]);

  useEffect(() => {
    if (open && line) {
      setDrillDownLoading(true);
      payrollApi
        .getAttendanceDrillDown(line.id)
        .then((res) => {
          setDrillDownItems(res.data.data || []);
        })
        .catch((err) => {
          message.error(err?.response?.data?.message || 'Không thể tải chi tiết chấm công.');
        })
        .finally(() => {
          setDrillDownLoading(false);
        });
    } else {
      setDrillDownItems([]);
    }
  }, [open, line, message]);

  if (!line) return null;

  const handleAddItem = async (values: any) => {
    setSubmitting(true);
    try {
      const res = await payrollApi.addItem(line.id, {
        loaiKhoan: values.loaiKhoan,
        tenKhoan: values.tenKhoan.trim(),
        soTien: values.soTien,
        ghiChu: values.ghiChu?.trim() || '',
      });
      message.success('Đã thêm khoản điều chỉnh thành công.');
      form.resetFields();
      if (res.data.data) {
        onLineUpdated(res.data.data);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Thêm khoản điều chỉnh thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      const res = await payrollApi.removeItem(line.id, itemId);
      message.success('Đã xóa khoản điều chỉnh.');
      if (res.data.data) {
        onLineUpdated(res.data.data);
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Xóa khoản điều chỉnh thất bại.');
    }
  };

  const attendanceColumns = [
    {
      title: 'STT',
      width: 55,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => (
        <span style={{ fontFamily: 'monospace', color: '#64748b', fontWeight: 600 }}>
          {index + 1}
        </span>
      ),
    },
    {
      title: 'Ngày làm việc',
      dataIndex: 'ngay',
      width: 140,
      render: (val: string) => {
        const d = dayjs(val);
        const dayOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][d.day()];
        return (
          <div>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{d.format('DD/MM/YYYY')}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{dayOfWeek}</div>
          </div>
        );
      },
    },
    {
      title: 'Ca phân công',
      dataIndex: 'tenCa',
      width: 150,
      render: (val: string) => (
        <span style={{ fontWeight: 500, color: '#1e293b' }}>{val || 'Ca chuẩn'}</span>
      ),
    },
    {
      title: 'Giờ quẹt thẻ (Vào / Ra)',
      width: 170,
      render: (_: any, row: AttendanceDrillDownItem) => (
        <div style={{ fontFamily: 'monospace', fontSize: 13 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: '#64748b', width: 28 }}>Vào:</span>
            <strong style={{ color: row.gioVao ? '#0f172a' : '#94a3b8' }}>
              {row.gioVao ? dayjs(row.gioVao).format('HH:mm:ss') : '--:--:--'}
            </strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: '#64748b', width: 28 }}>Ra:</span>
            <strong style={{ color: row.gioRa ? '#0f172a' : '#94a3b8' }}>
              {row.gioRa ? dayjs(row.gioRa).format('HH:mm:ss') : '--:--:--'}
            </strong>
          </div>
        </div>
      ),
    },
    {
      title: 'Độ lệch giờ',
      width: 150,
      render: (_: any, row: AttendanceDrillDownItem) => (
        <Space direction="vertical" size={2}>
          {row.phutDiMuon > 0 && (
            <Tag color="volcano" style={{ fontWeight: 600, fontSize: 11 }}>
              Trễ {row.phutDiMuon} phút
            </Tag>
          )}
          {row.phutVeSom > 0 && (
            <Tag color="warning" style={{ fontWeight: 600, fontSize: 11 }}>
              Sớm {row.phutVeSom} phút (tính giờ)
            </Tag>
          )}
          {row.phutDiMuon === 0 && row.phutVeSom === 0 && (
            <Tag color="success" style={{ fontSize: 11 }}>
              ✓ Đúng giờ
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Thời lượng làm việc',
      width: 150,
      render: (_: any, row: AttendanceDrillDownItem) => (
        <div>
          <div style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>
            {Number(row.soGioLamThucTe || 0).toFixed(1)} giờ
          </div>
          {row.soGioOT > 0 ? (
            <Tag color="purple" style={{ fontSize: 11, fontWeight: 600, marginTop: 2 }}>
              OT: +{Number(row.soGioOT).toFixed(1)}h (x150%)
            </Tag>
          ) : (
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Không có OT</span>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái chấm công',
      dataIndex: 'loaiCong',
      width: 160,
      render: (val: string, row: AttendanceDrillDownItem) => {
        let color = 'blue';
        if (row.trangThai === 'DI_DUNG_GIO') color = 'green';
        else if (row.trangThai === 'DI_MUON' || row.trangThai === 'VE_SOM' || row.trangThai === 'DI_MUON_VE_SOM') color = 'orange';
        else if (row.trangThai === 'VANG_MAT') color = 'red';
        else if (row.trangThai === 'NGHI_PHEP') color = 'gold';
        return <Tag color={color} style={{ fontWeight: 600 }}>{val}</Tag>;
      },
    },
    {
      title: 'Ghi chú đối soát',
      dataIndex: 'ghiChu',
      render: (val: string) => (
        <span style={{ color: val ? '#334155' : '#94a3b8', fontSize: 12 }}>
          {val || '—'}
        </span>
      ),
    },
  ];

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          {/* Cụm trái: Nút thoát an toàn & Thông tin nhân sự */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              icon={<ArrowLeft size={15} />}
              onClick={onClose}
              style={{
                fontWeight: 600,
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                borderColor: '#cbd5e1',
                borderRadius: 6,
                height: 34,
              }}
            >
              Quay lại bảng lương
            </Button>
            <Divider type="vertical" style={{ height: 28, margin: '0 4px', borderColor: '#e2e8f0' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                  {line.tenNhanVien}
                </span>
                <Tag color="blue" style={{ fontSize: 12, fontWeight: 600, padding: '1px 8px', borderRadius: 4 }}>
                  #{line.maNhanVien}
                </Tag>
                {line.chucDanh && (
                  <Tag color="cyan" style={{ fontSize: 12, borderRadius: 4 }}>
                    {line.chucDanh}
                  </Tag>
                )}
                {line.tenKhoa && (
                  <Tag color="default" style={{ fontSize: 12, borderRadius: 4, background: '#f1f5f9' }}>
                    {line.tenKhoa}
                  </Tag>
                )}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                Chi tiết phiếu thu nhập, định mức lương & nhật ký chấm công trong kỳ
              </div>
            </div>
          </div>

          {/* Cụm phải: Thẻ KPI mini & Nút phóng to / thu nhỏ / đóng */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '6px 16px',
                borderRadius: 8,
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Tổng thu nhập</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#16a34a', fontFamily: 'monospace' }}>
                  +{money(line.tongThuNhap)}
                </div>
              </div>
              <Divider type="vertical" style={{ height: 22, borderColor: '#cbd5e1' }} />
              <div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Tổng giảm trừ</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#dc2626', fontFamily: 'monospace' }}>
                  -{money(line.tongGiamTru)}
                </div>
              </div>
              <Divider type="vertical" style={{ height: 22, borderColor: '#cbd5e1' }} />
              <div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Thực lĩnh kỳ này</div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: Number(line.tienNoKyNay || 0) > 0 ? '#d97706' : '#0f172a',
                    fontFamily: 'monospace',
                  }}
                >
                  {Number(line.tienNoKyNay || 0) > 0 ? '0 đ' : money(line.thucLinh)}
                </div>
              </div>
            </div>

            <Tooltip title={isFullScreen ? 'Thu nhỏ cửa sổ' : 'Mở rộng toàn màn hình'}>
              <Button
                type="text"
                icon={isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                onClick={() => setIsFullScreen(!isFullScreen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 34,
                  height: 34,
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                }}
              />
            </Tooltip>

            <Button
              type="text"
              icon={<X size={18} />}
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 34,
                height: 34,
                borderRadius: 6,
                color: '#64748b',
              }}
            />
          </div>
        </div>
      }
      closeIcon={null}
      placement="right"
      width={isFullScreen ? '100vw' : 880}
      styles={{
        wrapper: { maxWidth: '100vw' },
        header: { padding: '12px 24px', borderBottom: '1px solid #e2e8f0', background: '#ffffff' },
        body: { padding: isFullScreen ? '20px 32px' : '16px 20px', background: '#f8fafc' },
      }}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      <Tabs
        defaultActiveKey="breakdown"
        style={{ height: '100%' }}
        items={[
          {
            key: 'breakdown',
            label: (
              <span style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Receipt size={16} />
                Bảng kê Thu nhập & Khấu trừ chi tiết
              </span>
            ),
            children: (
              <div>
                {/* 1. THÔNG TIN ĐỊNH MỨC & NGÀY CÔNG (3 CỘT RỘNG RÃI TRÊN FULL-SCREEN) */}
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  <Col xs={24} md={8}>
                    <Card
                      size="small"
                      title={
                        <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>
                          1. Định mức lương hợp đồng
                        </span>
                      }
                      style={{ borderRadius: 8, background: '#ffffff', borderColor: '#e2e8f0', height: '100%' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ color: '#64748b', fontSize: 12 }}>Lương cơ bản tháng:</span>
                        <strong style={{ fontSize: 14, fontFamily: 'monospace' }}>{money(line.luongCoBan)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ color: '#64748b', fontSize: 12 }}>Đơn giá công chuẩn (26 ngày):</span>
                        <strong style={{ fontSize: 13, fontFamily: 'monospace', color: '#475569' }}>
                          {money(Math.round(line.luongCoBan / 26))}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b', fontSize: 12 }}>Đơn giá giờ chuẩn (8h/ngày):</span>
                        <strong style={{ fontSize: 13, fontFamily: 'monospace', color: '#475569' }}>
                          {money(Math.round(line.luongCoBan / 26 / 8))}
                        </strong>
                      </div>
                    </Card>
                  </Col>

                  <Col xs={24} md={8}>
                    <Card
                      size="small"
                      title={
                        <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>
                          2. Tổng hợp công & Chuyên cần
                        </span>
                      }
                      style={{ borderRadius: 8, background: '#ffffff', borderColor: '#e2e8f0', height: '100%' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ color: '#64748b', fontSize: 12 }}>Số công thực tế:</span>
                        <strong style={{ fontSize: 14, fontFamily: 'monospace', color: '#2563eb' }}>
                          {line.soNgayCong} công / 26 ngày
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ color: '#64748b', fontSize: 12 }}>Nghỉ không lương:</span>
                        <strong
                          style={{
                            fontSize: 13,
                            fontFamily: 'monospace',
                            color: line.soNgayNghiKhongLuong > 0 ? '#dc2626' : '#64748b',
                          }}
                        >
                          {line.soNgayNghiKhongLuong} ngày
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b', fontSize: 12 }}>Phạt vi phạm đi muộn:</span>
                        <strong
                          style={{
                            fontSize: 13,
                            fontFamily: 'monospace',
                            color: line.khauTruDiMuonVeSom > 0 ? '#ea580c' : '#16a34a',
                          }}
                        >
                          {line.khauTruDiMuonVeSom > 0 ? `-${money(line.khauTruDiMuonVeSom)}` : 'Đúng giờ'}
                        </strong>
                      </div>
                    </Card>
                  </Col>

                  <Col xs={24} md={8}>
                    <Card
                      size="small"
                      title={
                        <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>
                          3. Quyết toán chi trả kỳ này
                        </span>
                      }
                      style={{ borderRadius: 8, background: '#ffffff', borderColor: '#e2e8f0', height: '100%' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ color: '#64748b', fontSize: 12 }}>Tổng thu nhập (+):</span>
                        <strong style={{ fontSize: 14, fontFamily: 'monospace', color: '#16a34a' }}>
                          +{money(line.tongThuNhap)}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ color: '#64748b', fontSize: 12 }}>Tổng các khoản giảm trừ (-):</span>
                        <strong style={{ fontSize: 14, fontFamily: 'monospace', color: '#dc2626' }}>
                          -{money(line.tongGiamTru)}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b', fontSize: 12, fontWeight: 600 }}>Thực nhận chuyển khoản:</span>
                        <strong style={{ fontSize: 15, fontFamily: 'monospace', color: '#0f172a' }}>
                          {money(line.thucLinh)}
                        </strong>
                      </div>
                    </Card>
                  </Col>
                </Row>

                {/* 2. BẢNG SO SÁNH SONG SONG THU NHẬP (+) vs GIẢM TRỪ (-) */}
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  {/* CỘT CỘNG (THU NHẬP) */}
                  <Col xs={24} lg={12}>
                    <Card
                      size="small"
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, color: '#15803d', fontSize: 14 }}>
                            A. Các khoản thu nhập ghi nhận (+)
                          </span>
                          <span style={{ fontSize: 11, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: 4 }}>
                            Theo công & định mức
                          </span>
                        </div>
                      }
                      style={{ borderRadius: 8, height: '100%', borderColor: '#bbf7d0', background: '#f0fdf4' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>Lương theo ngày công thực tế ({line.soNgayCong} công):</span>
                        <strong style={{ fontFamily: 'monospace', fontSize: 13 }}>{money(line.luongTheoNgayCong)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>Tiền làm thêm giờ (OT x150%):</span>
                        <strong style={{ color: '#d97706', fontFamily: 'monospace', fontSize: 13 }}>
                          +{money(line.tienTangCa)}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>Phụ cấp cố định / Thưởng chức vụ:</span>
                        <strong style={{ color: '#15803d', fontFamily: 'monospace', fontSize: 13 }}>
                          +{money(line.tongPhuCap)}
                        </strong>
                      </div>
                      {Number(line.tienThuLaoKham || 0) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span>Thù lao lượt khám bệnh HIS:</span>
                          <strong style={{ color: '#0891b2', fontFamily: 'monospace', fontSize: 13 }}>
                            +{money(line.tienThuLaoKham)}
                          </strong>
                        </div>
                      )}
                      {Number(line.tienHoaHongCls || 0) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span>Hoa hồng dịch vụ Cận lâm sàng (CLS):</span>
                          <strong style={{ color: '#0891b2', fontFamily: 'monospace', fontSize: 13 }}>
                            +{money(line.tienHoaHongCls)}
                          </strong>
                        </div>
                      )}

                      {/* Các khoản phụ cấp thủ công từ ChiTiets */}
                      {(line.chiTiets || [])
                        .filter((c) => c.loaiKhoan === 'PHU_CAP' && c.tenKhoan !== 'Phụ cấp cố định')
                        .map((c) => (
                          <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ color: '#047857' }}>+ {c.tenKhoan}:</span>
                            <strong style={{ color: '#15803d', fontFamily: 'monospace', fontSize: 13 }}>
                              +{money(c.soTien)}
                            </strong>
                          </div>
                        ))}

                      <Divider style={{ margin: '12px 0 8px 0', borderColor: '#bbf7d0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700 }}>
                        <span style={{ color: '#166534' }}>TỔNG THU NHẬP:</span>
                        <span style={{ color: '#15803d', fontFamily: 'monospace', fontSize: 16 }}>
                          +{money(line.tongThuNhap)}
                        </span>
                      </div>
                    </Card>
                  </Col>

                  {/* CỘT TRỪ (KHẤU TRỪ) */}
                  <Col xs={24} lg={12}>
                    <Card
                      size="small"
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, color: '#b91c1c', fontSize: 14 }}>
                            B. Các khoản giảm trừ nghĩa vụ (-)
                          </span>
                          <span style={{ fontSize: 11, color: '#dc2626', background: '#fee2e2', padding: '2px 8px', borderRadius: 4 }}>
                            Bảo hiểm & Chế tài
                          </span>
                        </div>
                      }
                      style={{ borderRadius: 8, height: '100%', borderColor: '#fecaca', background: '#fef2f2' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>Trích nộp BHXH, BHYT, BHTN (10.5%):</span>
                        <strong style={{ color: '#6366f1', fontFamily: 'monospace', fontSize: 13 }}>
                          -{money(line.tienBaoHiem)}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>Khấu trừ nghỉ không lương:</span>
                        <strong style={{ color: '#dc2626', fontFamily: 'monospace', fontSize: 13 }}>
                          -{money(line.khauTruNghiKhongLuong)}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>Phạt đi muộn (50.000 đ/lượt trễ):</span>
                        <strong style={{ color: '#ea580c', fontFamily: 'monospace', fontSize: 13 }}>
                          -{money(line.khauTruDiMuonVeSom)}
                        </strong>
                      </div>

                      {/* Các khoản khấu trừ thủ công từ ChiTiets */}
                      {(line.chiTiets || [])
                        .filter((c) => c.loaiKhoan === 'KHAU_TRU')
                        .map((c) => (
                          <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ color: '#b91c1c' }}>- {c.tenKhoan}:</span>
                            <strong style={{ color: '#dc2626', fontFamily: 'monospace', fontSize: 13 }}>
                              -{money(c.soTien)}
                            </strong>
                          </div>
                        ))}

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span>Khấu trừ khác:</span>
                        <strong style={{ color: '#dc2626', fontFamily: 'monospace', fontSize: 13 }}>
                          -{money(line.tongKhauTru)}
                        </strong>
                      </div>

                      <Divider style={{ margin: '12px 0 8px 0', borderColor: '#fecaca' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700 }}>
                        <span style={{ color: '#991b1b' }}>TỔNG GIẢM TRỪ:</span>
                        <span style={{ color: '#b91c1c', fontFamily: 'monospace', fontSize: 16 }}>
                          -{money(line.tongGiamTru)}
                        </span>
                      </div>
                    </Card>
                  </Col>
                </Row>

                {/* 3. DANH SÁCH CÁC KHOẢN ĐIỀU CHỈNH THỦ CÔNG */}
                <Card
                  size="small"
                  title={
                    <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>
                      4. Danh mục phụ cấp, thưởng & giảm trừ chi tiết ({line.chiTiets?.length || 0} mục)
                    </span>
                  }
                  style={{ marginBottom: 16, borderRadius: 8, background: '#ffffff', borderColor: '#e2e8f0' }}
                >
                  <Table
                    size="small"
                    rowKey="id"
                    pagination={false}
                    dataSource={line.chiTiets || []}
                    locale={{ emptyText: 'Chưa có khoản phụ cấp hoặc khấu trừ chi tiết nào.' }}
                    columns={[
                      {
                        title: 'STT',
                        width: 55,
                        align: 'center' as const,
                        render: (_: any, __: any, index: number) => (
                          <span style={{ fontFamily: 'monospace', color: '#64748b' }}>{index + 1}</span>
                        ),
                      },
                      {
                        title: 'Loại khoản',
                        dataIndex: 'loaiKhoan',
                        width: 120,
                        render: (val: string) => (
                          <Tag color={val === 'PHU_CAP' ? 'green' : 'red'} style={{ fontWeight: 600 }}>
                            {val === 'PHU_CAP' ? '+ Phụ cấp' : '- Khấu trừ'}
                          </Tag>
                        ),
                      },
                      {
                        title: 'Tên khoản mục',
                        dataIndex: 'tenKhoan',
                        render: (val: string) => <strong style={{ color: '#0f172a' }}>{val}</strong>,
                      },
                      {
                        title: 'Số tiền',
                        dataIndex: 'soTien',
                        align: 'right' as const,
                        width: 160,
                        render: (val: number, row: any) => (
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              fontSize: 13,
                              color: row.loaiKhoan === 'PHU_CAP' ? '#16a34a' : '#dc2626',
                            }}
                          >
                            {row.loaiKhoan === 'PHU_CAP' ? '+' : '-'}
                            {money(val)}
                          </span>
                        ),
                      },
                      {
                        title: 'Ghi chú giải trình',
                        dataIndex: 'ghiChu',
                        render: (val: string) => <span style={{ color: '#64748b', fontSize: 12 }}>{val || '—'}</span>,
                      },
                      {
                        title: 'Thao tác',
                        width: 80,
                        align: 'center' as const,
                        render: (_: any, row: any) =>
                          isEditable && (
                            <Tooltip title="Xóa khoản này">
                              <Button
                                type="text"
                                danger
                                size="small"
                                icon={<Trash2 size={15} />}
                                onClick={() => handleRemoveItem(row.id)}
                              />
                            </Tooltip>
                          ),
                      },
                    ]}
                  />
                </Card>

                {/* 4. FORM THÊM KHOẢN MỤC THỦ CÔNG */}
                {isEditable ? (
                  <Card
                    size="small"
                    title={
                      <span style={{ fontWeight: 600, color: '#2563eb', fontSize: 13 }}>
                        + Thêm khoản thưởng, phụ cấp hoặc giảm trừ thủ công cho nhân viên
                      </span>
                    }
                    style={{ borderRadius: 8, background: '#f8fafc', border: '1px dashed #93c5fd' }}
                  >
                    <Form
                      form={form}
                      layout="vertical"
                      initialValues={{ loaiKhoan: 'PHU_CAP', soTien: 100000 }}
                      onFinish={handleAddItem}
                    >
                      <Row gutter={16}>
                        <Col xs={24} md={6}>
                          <Form.Item name="loaiKhoan" label="Loại điều chỉnh" rules={[{ required: true }]}>
                            <Radio.Group buttonStyle="solid" style={{ width: '100%' }}>
                              <Radio.Button value="PHU_CAP" style={{ width: '50%', textAlign: 'center' }}>
                                + Phụ cấp
                              </Radio.Button>
                              <Radio.Button value="KHAU_TRU" style={{ width: '50%', textAlign: 'center' }}>
                                - Khấu trừ
                              </Radio.Button>
                            </Radio.Group>
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item
                            name="tenKhoan"
                            label="Tên khoản mục"
                            rules={[{ required: true, message: 'Nhập tên khoản (VD: Thưởng ca mổ, Trực đêm)' }]}
                          >
                            <Input placeholder="VD: Thưởng đột xuất, Phụ cấp thâm niên, Phạt vi phạm" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={5}>
                          <Form.Item
                            name="soTien"
                            label="Số tiền (VNĐ)"
                            rules={[{ required: true, message: 'Nhập số tiền' }]}
                          >
                            <InputNumber
                              min={1000}
                              step={50000}
                              style={{ width: '100%' }}
                              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={5} style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 24 }}>
                          <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting}
                            icon={<PlusCircle size={16} />}
                            style={{ width: '100%', background: '#2563eb', height: 36, fontWeight: 600 }}
                          >
                            Ghi nhận khoản
                          </Button>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={24}>
                          <Form.Item name="ghiChu" label="Ghi chú giải trình quyết toán" style={{ marginBottom: 0 }}>
                            <Input placeholder="Nhập lý do hoặc quyết định phê duyệt (không bắt buộc)" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Form>
                  </Card>
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', padding: 12 }}>
                    Kỳ lương đã chốt/thanh toán. Không thể bổ sung hoặc sửa đổi các khoản mục.
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'drilldown',
            label: (
              <span style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CalendarCheck size={16} />
                Nhật ký Chấm công đối soát ({drillDownItems.length} ca làm việc)
              </span>
            ),
            children: (
              <div style={{ background: '#ffffff', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ marginBottom: 14, color: '#475569', fontSize: 13 }}>
                  Dữ liệu quẹt thẻ thực tế và đối soát công chi tiết của nhân viên <strong>{line.tenNhanVien}</strong> trong kỳ chấm công nguồn đã khóa.
                </div>
                <Table
                  size="middle"
                  rowKey="ngay"
                  loading={drillDownLoading}
                  columns={attendanceColumns}
                  dataSource={drillDownItems}
                  pagination={{ pageSize: 20, showSizeChanger: true, pageSizeOptions: ['15', '20', '31', '50'] }}
                  locale={{ emptyText: 'Không tìm thấy dữ liệu quẹt thẻ trong kỳ này.' }}
                  style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}
                />
              </div>
            ),
          },
        ]}
      />
    </Drawer>
  );
};
