import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Typography, Spin, Space, Tag, message } from 'antd';
import { PrinterOutlined, FileTextOutlined } from '@ant-design/icons';
import { examinationApi } from '../../api/examination.api';
import type { ChiDinhDichVuChiTietDto } from '../../type/examination.types';

const { Title, Text } = Typography;

interface InPhieuKetQuaModalProps {
  visible: boolean;
  chiDinhId: number | null;
  onClose: () => void;
}

export const InPhieuKetQuaModal: React.FC<InPhieuKetQuaModalProps> = ({
  visible,
  chiDinhId,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<ChiDinhDichVuChiTietDto | null>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible || !chiDinhId) {
      setDetail(null);
      return;
    }

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await examinationApi.getChiDinhChiTiet(chiDinhId);
        if (res.data?.success && res.data.data) {
          setDetail(res.data.data);
        } else {
          message.error('Không thể tải chi tiết kết quả CLS để in');
        }
      } catch (err: any) {
        message.error(err?.message || 'Lỗi khi tải kết quả');
      } finally {
        setLoading(false);
      }
    };

    void fetchDetail();
  }, [visible, chiDinhId]);

  const handlePrint = () => {
    const printContent = printAreaRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=900,height=700');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Phiếu Kết Quả Cận Lâm Sàng - ${detail?.tenBenhNhan || ''}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; color: #111827; padding: 24px; line-height: 1.5; font-size: 14px; }
            .header-table { width: 100%; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px; }
            .title { text-align: center; text-transform: uppercase; font-size: 20px; font-weight: bold; margin: 16px 0; letter-spacing: 0.5px; }
            .info-table { width: 100%; margin-bottom: 16px; border-collapse: collapse; }
            .info-table td { padding: 4px 6px; }
            .result-table { width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 20px; }
            .result-table th, .result-table td { border: 1px solid #333; padding: 6px 10px; text-align: left; }
            .result-table th { background: #f3f4f6; text-align: center; font-weight: bold; }
            .abnormal { color: #dc2626; font-weight: bold; }
            .conclusion-box { border: 1px solid #4b5563; padding: 12px; border-radius: 4px; margin-bottom: 24px; }
            .footer-table { width: 100%; margin-top: 30px; text-align: center; }
            .footer-table td { width: 50%; vertical-align: top; }
            .sign-title { font-weight: bold; text-transform: uppercase; font-size: 13px; }
            .sign-space { height: 75px; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const isLab = (detail?.loaiDichVu || '').toLowerCase().includes('xetnghiem');

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined style={{ color: '#0b4f6c' }} />
          <span>Phiếu kết quả cận lâm sàng</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={860}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
        <Button
          key="print"
          type="primary"
          icon={<PrinterOutlined />}
          style={{ background: '#0b4f6c', borderColor: '#0b4f6c' }}
          onClick={handlePrint}
          disabled={!detail}
        >
          In phiếu kết quả
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        {detail && (
          <div
            ref={printAreaRef}
            style={{
              background: '#ffffff',
              padding: 24,
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              fontFamily: '"Times New Roman", Times, serif',
              color: '#1f2937',
              fontSize: '14px',
            }}
          >
            {/* Header phòng khám */}
            <div
              className="header-table"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '2px solid #111827',
                paddingBottom: 12,
                marginBottom: 16,
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold', fontSize: 15, textTransform: 'uppercase' }}>
                  HỆ THỐNG PHÒNG KHÁM ĐA KHOA CLINIC MANAGEMENT
                </div>
                <div>Khoa: {detail.tenKhoa || 'Xét nghiệm & Chẩn đoán hình ảnh'}</div>
                <div>Hotline: 1900 8888 | Địa chỉ: 123 Nguyễn Văn Cừ, Quận 5, TP.HCM</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>Mã y tế: <strong>{detail.maBenhNhanNoiBo || `BN-${detail.maBenhNhan}`}</strong></div>
                <div>Mã chỉ định: <strong>CLS-{detail.id}</strong></div>
              </div>
            </div>

            {/* Tên phiếu */}
            <div style={{ textAlign: 'center', margin: '16px 0 20px' }}>
              <Title level={3} style={{ margin: 0, textTransform: 'uppercase', color: '#0b4f6c', letterSpacing: 0.5 }}>
                {isLab ? 'PHIẾU KẾT QUẢ XÉT NGHIỆM' : 'PHIẾU KẾT QUẢ CHẨN ĐOÁN HÌNH ẢNH'}
              </Title>
              <Text italic style={{ fontSize: 13, color: '#6b7280' }}>
                (Dịch vụ: {detail.tenDichVu})
              </Text>
            </div>

            {/* Thông tin bệnh nhân */}
            <table style={{ width: '100%', marginBottom: 16, borderCollapse: 'collapse', lineHeight: 1.6 }}>
              <tbody>
                <tr>
                  <td style={{ width: '50%' }}>
                    Họ và tên bệnh nhân: <strong>{detail.tenBenhNhan}</strong>
                  </td>
                  <td style={{ width: '25%' }}>
                    Tuổi: <strong>{detail.tuoi ?? '--'}</strong>
                  </td>
                  <td style={{ width: '25%' }}>
                    Giới tính: <strong>{detail.gioiTinh}</strong>
                  </td>
                </tr>
                <tr>
                  <td colSpan={2}>
                    Địa chỉ: {detail.diaChi || 'Chưa ghi nhận'}
                  </td>
                  <td>
                    Điện thoại: {detail.dienThoai || '--'}
                  </td>
                </tr>
                <tr>
                  <td>
                    Bác sĩ chỉ định: <strong>{detail.tenBacSiChiDinh}</strong>
                  </td>
                  <td colSpan={2}>
                    Thời gian chỉ định: {detail.ngayChiDinh ? new Date(detail.ngayChiDinh).toLocaleString('vi-VN') : '--'}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3}>
                    Chẩn đoán sơ bộ: <em>{detail.chanDoanSoBo || 'Theo dõi chuyên khoa'}</em>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* BẢNG KẾT QUẢ CHI TIẾT */}
            {isLab ? (
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  marginTop: 12,
                  marginBottom: 16,
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'center', width: 45 }}>STT</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '6px 8px' }}>Tên xét nghiệm / Chỉ số</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'center', width: 140 }}>Kết quả đo</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'center', width: 100 }}>Đơn vị</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'center', width: 160 }}>Khoảng tham chiếu</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'center', width: 110 }}>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.chiTietKetQuas && detail.chiTietKetQuas.length > 0 ? (
                    detail.chiTietKetQuas.map((item, idx) => (
                      <tr key={idx} style={{ background: item.batThuong ? '#fef2f2' : undefined }}>
                        <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'center' }}>{idx + 1}</td>
                        <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', fontWeight: item.batThuong ? 600 : 400 }}>
                          {item.tenChiSo}
                        </td>
                        <td
                          style={{
                            border: '1px solid #d1d5db',
                            padding: '6px 8px',
                            textAlign: 'center',
                            color: item.batThuong ? '#dc2626' : undefined,
                            fontWeight: item.batThuong ? 700 : 500,
                          }}
                        >
                          {item.giaTri}
                        </td>
                        <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'center' }}>{item.donVi}</td>
                        <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'center' }}>{item.khoangThamChieu}</td>
                        <td style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'center' }}>
                          {item.batThuong ? <span style={{ color: '#dc2626', fontWeight: 'bold' }}>BẤT THƯỜNG</span> : 'Bình thường'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ border: '1px solid #d1d5db', padding: 12, textAlign: 'center', color: '#9ca3af' }}>
                        Chưa có bảng chi số chi tiết
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <div style={{ marginBottom: 16 }}>
                {detail.urlKetQua && (
                  <div style={{ marginBottom: 8 }}>
                    <strong>Đường dẫn hình ảnh / PACS: </strong>
                    <a href={detail.urlKetQua} target="_blank" rel="noreferrer">
                      {detail.urlKetQua}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Khung kết luận */}
            <div
              style={{
                border: '1px solid #9ca3af',
                padding: '10px 14px',
                borderRadius: 4,
                marginBottom: 24,
                background: '#fcfcfc',
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: 4, textTransform: 'uppercase', color: '#1f2937' }}>
                KẾT LUẬN CHUYÊN MÔN:
              </div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: 14 }}>
                {detail.ketLuan || 'Chưa có kết luận chính thức.'}
              </div>
            </div>

            {/* Chữ ký */}
            <table style={{ width: '100%', marginTop: 20, textAlign: 'center' }}>
              <tbody>
                <tr>
                  <td style={{ width: '50%' }}></td>
                  <td style={{ width: '50%' }}>
                    <em>
                      Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                    </em>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold', textTransform: 'uppercase', paddingTop: 6 }}>
                    KỸ THUẬT VIÊN THỰC HIỆN
                  </td>
                  <td style={{ fontWeight: 'bold', textTransform: 'uppercase', paddingTop: 6 }}>
                    BÁC SĨ CHUYÊN KHOA DUYỆT
                  </td>
                </tr>
                <tr>
                  <td style={{ height: 60 }}></td>
                  <td style={{ height: 60 }}></td>
                </tr>
                <tr>
                  <td>{detail.tenNguoiThucHien || 'KTV. Đã ký'}</td>
                  <td><strong>BS. {detail.tenBacSiChiDinh}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Spin>
    </Modal>
  );
};
