import React, { useEffect, useState } from 'react';
import { App, Button, Card, Col, Divider, Drawer, Form, Input, InputNumber, Radio, Row, Space, Table, Tabs, Tag, Typography } from 'antd';
import { PlusCircle, Trash2, Clock, Calendar, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
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

  const isEditable = periodStatus === 'NHAP' || periodStatus === 'DA_DUYET';

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
      title: 'Ngày',
      dataIndex: 'ngay',
      width: 110,
      render: (val: string) => (
        <span style={{ fontWeight: 500 }}>{dayjs(val).format('DD/MM/YYYY')}</span>
      ),
    },
    {
      title: 'Ca trực',
      dataIndex: 'tenCa',
      width: 130,
    },
    {
      title: 'Vào / Ra',
      render: (_: any, row: AttendanceDrillDownItem) => (
        <Space direction="vertical" size={2}>
          <span style={{ fontSize: 12 }}>
            Vào: <strong>{row.gioVao ? dayjs(row.gioVao).format('HH:mm:ss') : '--:--'}</strong>
          </span>
          <span style={{ fontSize: 12 }}>
            Ra: <strong>{row.gioRa ? dayjs(row.gioRa).format('HH:mm:ss') : '--:--'}</strong>
          </span>
        </Space>
      ),
    },
    {
      title: 'Muộn / Sớm',
      width: 120,
      render: (_: any, row: AttendanceDrillDownItem) => (
        <div>
          {row.phutDiMuon > 0 && <Tag color="volcano">Muộn {row.phutDiMuon}p</Tag>}
          {row.phutVeSom > 0 && <Tag color="warning">Sớm {row.phutVeSom}p</Tag>}
          {row.phutDiMuon === 0 && row.phutVeSom === 0 && <span style={{ color: '#10b981' }}>-</span>}
        </div>
      ),
    },
    {
      title: 'Giờ làm',
      width: 110,
      render: (_: any, row: AttendanceDrillDownItem) => (
        <div>
          <div>{Number(row.soGioLamThucTe || 0).toFixed(1)} giờ</div>
          {row.soGioOT > 0 && <Tag color="purple">OT: +{Number(row.soGioOT).toFixed(1)}h</Tag>}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'loaiCong',
      render: (val: string, row: AttendanceDrillDownItem) => {
        let color = 'blue';
        if (row.trangThai === 'DI_DUNG_GIO') color = 'green';
        else if (row.trangThai === 'DI_MUON' || row.trangThai === 'VE_SOM' || row.trangThai === 'DI_MUON_VE_SOM') color = 'orange';
        else if (row.trangThai === 'VANG_MAT') color = 'red';
        else if (row.trangThai === 'NGHI_PHEP') color = 'gold';
        return <Tag color={color}>{val}</Tag>;
      },
    },
  ];

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 24 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
              Phiếu Lương: {line.tenNhanVien}
            </div>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 400, marginTop: 2 }}>
              {line.tenKhoa || 'Chưa phân khoa'} {line.chucDanh ? `• ${line.chucDanh}` : ''} • Mã NV: #{line.maNhanVien}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#64748b' }}>Thực lĩnh kỳ này</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: Number(line.tienNoKyNay || 0) > 0 ? '#d97706' : '#16a34a' }}>
              {Number(line.tienNoKyNay || 0) > 0 ? '0 đ' : money(line.thucLinh)}
            </div>
          </div>
        </div>
      }
      placement="right"
      width={780}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      <Tabs
        defaultActiveKey="breakdown"
        items={[
          {
            key: 'breakdown',
            label: 'Bảng kê Thu nhập & Khấu trừ',
            children: (
              <div>
                {/* THÔNG TIN TỔNG HỢP CÔNG & LƯƠNG CƠ BẢN */}
                <Card
                  size="small"
                  title={<span style={{ fontWeight: 600, color: '#1e293b' }}>1. Định mức lương & Chấm công</span>}
                  style={{ marginBottom: 16, borderRadius: 8, background: '#f8fafc' }}
                >
                  <Row gutter={[16, 8]}>
                    <Col span={8}>
                      <span style={{ color: '#64748b', fontSize: 12 }}>Lương cơ bản:</span>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{money(line.luongCoBan)}</div>
                    </Col>
                    <Col span={8}>
                      <span style={{ color: '#64748b', fontSize: 12 }}>Số công thực tế:</span>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#2563eb' }}>
                        {line.soNgayCong} / 26 ngày
                      </div>
                    </Col>
                    <Col span={8}>
                      <span style={{ color: '#64748b', fontSize: 12 }}>Nghỉ không lương:</span>
                      <div style={{ fontWeight: 600, fontSize: 14, color: line.soNgayNghiKhongLuong > 0 ? '#dc2626' : '#64748b' }}>
                        {line.soNgayNghiKhongLuong} ngày
                      </div>
                    </Col>
                  </Row>
                </Card>

                {/* BẢNG SO SÁNH THU NHẬP VÀ GIẢM TRỪ */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  {/* CỘT CỘNG (THU NHẬP) */}
                  <Col span={12}>
                    <Card
                      size="small"
                      title={<span style={{ fontWeight: 600, color: '#15803d' }}>2. Các khoản thu nhập (+)</span>}
                      style={{ borderRadius: 8, height: '100%', borderColor: '#bbf7d0', background: '#f0fdf4' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span>Lương theo ngày công:</span>
                        <strong>{money(line.luongTheoNgayCong)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span>Làm thêm giờ (OT x150%):</span>
                        <strong style={{ color: '#d97706' }}>+{money(line.tienTangCa)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span>Tổng phụ cấp & thưởng:</span>
                        <strong style={{ color: '#15803d' }}>+{money(line.tongPhuCap)}</strong>
                      </div>
                      <Divider style={{ margin: '8px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}>
                        <span>TỔNG THU NHẬP:</span>
                        <span style={{ color: '#15803d' }}>
                          {money(Number(line.luongTheoNgayCong || 0) + Number(line.tienTangCa || 0) + Number(line.tongPhuCap || 0))}
                        </span>
                      </div>
                    </Card>
                  </Col>

                  {/* CỘT TRỪ (KHẤU TRỪ) */}
                  <Col span={12}>
                    <Card
                      size="small"
                      title={<span style={{ fontWeight: 600, color: '#b91c1c' }}>3. Các khoản khấu trừ (-)</span>}
                      style={{ borderRadius: 8, height: '100%', borderColor: '#fecaca', background: '#fef2f2' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span>Bảo hiểm bắt buộc (10.5%):</span>
                        <strong style={{ color: '#6366f1' }}>-{money(line.tienBaoHiem)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span>Trừ nghỉ không lương:</span>
                        <strong style={{ color: '#dc2626' }}>-{money(line.khauTruNghiKhongLuong)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span>Phạt đi muộn / về sớm:</span>
                        <strong style={{ color: '#ea580c' }}>-{money(line.khauTruDiMuonVeSom)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span>Khấu trừ khác:</span>
                        <strong style={{ color: '#dc2626' }}>-{money(line.tongKhauTru)}</strong>
                      </div>
                      <Divider style={{ margin: '8px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}>
                        <span>TỔNG KHẤU TRỪ:</span>
                        <span style={{ color: '#b91c1c' }}>
                          -{money(
                            Number(line.tienBaoHiem || 0) +
                            Number(line.khauTruNghiKhongLuong || 0) +
                            Number(line.khauTruDiMuonVeSom || 0) +
                            Number(line.tongKhauTru || 0)
                          )}
                        </span>
                      </div>
                    </Card>
                  </Col>
                </Row>

                {/* DANH SÁCH CÁC KHOẢN ĐIỀU CHỈNH THỦ CÔNG */}
                <Card
                  size="small"
                  title={<span style={{ fontWeight: 600, color: '#1e293b' }}>4. Danh mục phụ cấp, thưởng & phạt chi tiết</span>}
                  style={{ marginBottom: 16, borderRadius: 8 }}
                >
                  <Table
                    size="small"
                    rowKey="id"
                    pagination={false}
                    dataSource={line.chiTiets || []}
                    locale={{ emptyText: 'Chưa có khoản phụ cấp hoặc khấu trừ chi tiết nào.' }}
                    columns={[
                      {
                        title: 'Loại',
                        dataIndex: 'loaiKhoan',
                        width: 110,
                        render: (val: string) => (
                          <Tag color={val === 'PHU_CAP' ? 'green' : 'red'}>
                            {val === 'PHU_CAP' ? '+ Phụ cấp' : '- Khấu trừ'}
                          </Tag>
                        ),
                      },
                      { title: 'Tên khoản mục', dataIndex: 'tenKhoan', fontWeight: 600 },
                      {
                        title: 'Số tiền',
                        dataIndex: 'soTien',
                        align: 'right' as const,
                        render: (val: number, row: any) => (
                          <span style={{ fontWeight: 600, color: row.loaiKhoan === 'PHU_CAP' ? '#16a34a' : '#dc2626' }}>
                            {row.loaiKhoan === 'PHU_CAP' ? '+' : '-'}{money(val)}
                          </span>
                        ),
                      },
                      { title: 'Ghi chú', dataIndex: 'ghiChu' },
                      {
                        title: 'Thao tác',
                        width: 70,
                        align: 'center' as const,
                        render: (_: any, row: any) =>
                          isEditable && (
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<Trash2 size={15} />}
                              onClick={() => handleRemoveItem(row.id)}
                            />
                          ),
                      },
                    ]}
                  />
                </Card>

                {/* FORM THÊM KHOẢN MỤC THỦ CÔNG (NẾU KỲ CÒN MỞ HOẶC CHỜ DUYỆT) */}
                {isEditable ? (
                  <Card
                    size="small"
                    title={<span style={{ fontWeight: 600, color: '#2563eb' }}>+ Thêm khoản thưởng, phụ cấp hoặc giảm trừ thủ công</span>}
                    style={{ borderRadius: 8, background: '#f8fafc', border: '1px dashed #93c5fd' }}
                  >
                    <Form
                      form={form}
                      layout="vertical"
                      initialValues={{ loaiKhoan: 'PHU_CAP', soTien: 100000 }}
                      onFinish={handleAddItem}
                    >
                      <Row gutter={12}>
                        <Col span={8}>
                          <Form.Item name="loaiKhoan" label="Loại khoản" rules={[{ required: true }]}>
                            <Radio.Group buttonStyle="solid" style={{ width: '100%' }}>
                              <Radio.Button value="PHU_CAP" style={{ width: '50%', textAlign: 'center' }}>
                                Phụ cấp (+)
                              </Radio.Button>
                              <Radio.Button value="KHAU_TRU" style={{ width: '50%', textAlign: 'center' }}>
                                Khấu trừ (-)
                              </Radio.Button>
                            </Radio.Group>
                          </Form.Item>
                        </Col>
                        <Col span={10}>
                          <Form.Item
                            name="tenKhoan"
                            label="Tên khoản mục"
                            rules={[{ required: true, message: 'Nhập tên khoản (VD: Thưởng ca mổ, Trực đêm)' }]}
                          >
                            <Input placeholder="VD: Thưởng KPI, Phụ cấp trách nhiệm, Phạt trễ" />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
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
                      </Row>
                      <Row gutter={12}>
                        <Col span={18}>
                          <Form.Item name="ghiChu" label="Ghi chú giải trình">
                            <Input placeholder="Ghi chú lý do bổ sung (không bắt buộc)" />
                          </Form.Item>
                        </Col>
                        <Col span={6} style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 24 }}>
                          <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting}
                            icon={<PlusCircle size={16} />}
                            style={{ width: '100%', background: '#2563eb' }}
                          >
                            Thêm khoản
                          </Button>
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
            label: `Nguồn gốc Chấm công (${drillDownItems.length} ngày)`,
            children: (
              <div>
                <div style={{ marginBottom: 12, color: '#64748b', fontSize: 13 }}>
                  Đối chiếu toàn bộ dữ liệu quẹt thẻ thực tế của nhân viên <strong>{line.tenNhanVien}</strong> trong kỳ chấm công đã khóa.
                </div>
                <Table
                  size="small"
                  rowKey="ngay"
                  loading={drillDownLoading}
                  columns={attendanceColumns}
                  dataSource={drillDownItems}
                  pagination={{ pageSize: 15, showSizeChanger: false }}
                  locale={{ emptyText: 'Không tìm thấy dữ liệu quẹt thẻ trong kỳ này.' }}
                />
              </div>
            ),
          },
        ]}
      />
    </Drawer>
  );
};
