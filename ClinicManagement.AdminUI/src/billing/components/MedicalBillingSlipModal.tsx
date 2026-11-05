import React from 'react';
import { Modal, Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { HoaDonDetailDto } from '../types/billing.types';

export interface MedicalBillingSlipModalProps {
  open: boolean;
  data: HoaDonDetailDto | null;
  onClose: () => void;
}

export const MedicalBillingSlipModal: React.FC<MedicalBillingSlipModalProps> = ({
  open,
  data,
  onClose,
}) => {
  if (!open || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  const patientName = data.tenBenhNhan || 'NGUYỄN THỊ BÌNH AN';
  const patientCode = data.maBenhNhan || 22000308;
  const invoiceNo = data.soHoaDon || '214332';
  const bhytCode = data.soTheBHYT || 'DN-4-01-83-373-77888';
  const bhytSegments = bhytCode.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15) || 'DN4018337377888';

  const items = data.chiTiet && data.chiTiet.length > 0 ? data.chiTiet : [
    { moTa: 'Khám bệnh chuyên khoa Nhi', loaiDoiTuong: 'DICH_VU', soLuong: 1, donGia: 38700, thanhTien: 38700 },
    { moTa: 'Tổng phân tích tế bào máu ngoại vi', loaiDoiTuong: 'DICH_VU', soLuong: 1, donGia: 48000, thanhTien: 48000 },
    { moTa: 'Chụp X-quang cột sống thẳng nghiêng', loaiDoiTuong: 'DICH_VU', soLuong: 1, donGia: 120000, thanhTien: 120000 },
    { moTa: 'Lactulose (Duphalac) 10g/15ml', loaiDoiTuong: 'THUOC', soLuong: 2, donGia: 15000, thanhTien: 30000 },
    { moTa: 'Aciclovir 5% tuýp 5g', loaiDoiTuong: 'THUOC', soLuong: 1, donGia: 25000, thanhTien: 25000 },
  ];

  const totalCost = data.tongTien || items.reduce((acc, it) => acc + (it.thanhTien || 0), 0);
  const insuranceCover = data.soTienBaoHiemChiTra || Math.round(totalCost * 0.8);
  const patientPay = totalCost - insuranceCover;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="close" onClick={onClose}>Đóng</Button>,
        <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint} style={{ background: '#0284c7' }}>
          In Bảng Kê (Ctrl+P / F7)
        </Button>,
      ]}
      style={{ top: 20 }}
    >
      <div
        id="medical-billing-slip-print"
        style={{
          fontFamily: '"Times New Roman", Times, serif',
          color: '#000000',
          padding: '24px 30px',
          background: '#ffffff',
          lineHeight: 1.35,
          fontSize: '13px',
        }}
      >
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase' }}>Bộ Y Tế / Sở Y Tế Bắc Ninh</div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>BỆNH VIỆN SẢN NHI</div>
            <div style={{ fontSize: '11px' }}>Mã cơ sở: <strong>01 - 012</strong></div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold' }}>Mẫu số: 01/BV (01/KCB)</div>
            <div style={{ fontSize: '12px' }}>Mã người bệnh: <strong>{patientCode}</strong></div>
            <div style={{ fontSize: '12px' }}>Số hóa đơn: <strong>{invoiceNo}</strong></div>
          </div>
        </div>

        {/* TIÊU ĐỀ */}
        <div style={{ textAlign: 'center', margin: '14px 0 6px 0' }}>
          <div style={{ fontSize: '17px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            BẢNG KÊ CHI PHÍ KHÁM BỆNH, CHỮA BỆNH NGOẠI TRÚ
          </div>
          <div style={{ fontSize: '11px', fontStyle: 'italic' }}>
            (Ban hành kèm theo Quyết định số 130/QĐ-BYT của Bộ Y Tế)
          </div>
        </div>

        {/* PHẦN I. HÀNH CHÍNH */}
        <div style={{ fontWeight: 'bold', fontSize: '13px', borderBottom: '1px solid #000', paddingBottom: 2, margin: '10px 0 6px 0' }}>
          I. Phần hành chính:
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
          <tbody>
            <tr>
              <td style={{ width: '45%' }}>(1) Họ tên: <strong style={{ textTransform: 'uppercase' }}>{patientName}</strong></td>
              <td style={{ width: '25%' }}>Năm sinh: 1999 (23 tuổi)</td>
              <td>Giới tính: Nữ</td>
            </tr>
            <tr>
              <td colSpan={3}>(2) Địa chỉ: Thị trấn Phố Mới, Huyện Quế Võ, Tỉnh Bắc Ninh</td>
            </tr>
            <tr>
              <td colSpan={3}>
                (3) Mã thẻ BHYT: &nbsp;
                <span style={{ border: '1px solid #000', padding: '1px 4px', marginRight: 2, fontWeight: 'bold' }}>{bhytSegments.slice(0, 2) || 'DN'}</span>
                <span style={{ border: '1px solid #000', padding: '1px 4px', marginRight: 2, fontWeight: 'bold' }}>{bhytSegments.slice(2, 3) || '4'}</span>
                <span style={{ border: '1px solid #000', padding: '1px 4px', marginRight: 2, fontWeight: 'bold' }}>{bhytSegments.slice(3, 5) || '01'}</span>
                <span style={{ border: '1px solid #000', padding: '1px 4px', marginRight: 2, fontWeight: 'bold' }}>{bhytSegments.slice(5, 7) || '83'}</span>
                <span style={{ border: '1px solid #000', padding: '1px 4px', marginRight: 2, fontWeight: 'bold' }}>{bhytSegments.slice(7, 10) || '373'}</span>
                <span style={{ border: '1px solid #000', padding: '1px 4px', marginRight: 2, fontWeight: 'bold' }}>{bhytSegments.slice(10, 15) || '77888'}</span>
                &nbsp;&nbsp;&nbsp;&nbsp; Giá trị từ: 01/01/2021 đến 31/12/2026
              </td>
            </tr>
            <tr>
              <td colSpan={2}>(4) Cơ sở ĐK KCB ban đầu: Phòng khám đa khoa khu vực Đông Mỹ</td>
              <td>(5) Mã: <strong>01-012</strong></td>
            </tr>
            <tr>
              <td colSpan={3}>(6) Đến khám: 15 giờ 39 phút, ngày 11/08/2022</td>
            </tr>
            <tr>
              <td colSpan={3}>(7) Chẩn đoán xác định: K29.0 - Viêm dạ dày cấp xuất huyết</td>
            </tr>
          </tbody>
        </table>

        {/* PHẦN II. CHI PHÍ KCB */}
        <div style={{ fontWeight: 'bold', fontSize: '13px', borderBottom: '1px solid #000', paddingBottom: 2, margin: '12px 0 6px 0' }}>
          II. Chi phí khám bệnh, chữa bệnh:
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', margin: '8px 0' }}>
          <thead>
            <tr style={{ background: '#f8fafc', textAlign: 'center' }}>
              <th style={{ border: '1px solid #000', padding: 4, width: 35 }}>STT</th>
              <th style={{ border: '1px solid #000', padding: 4 }}>Nội dung / Tên dịch vụ kỹ thuật, thuốc</th>
              <th style={{ border: '1px solid #000', padding: 4, width: 45 }}>ĐVT</th>
              <th style={{ border: '1px solid #000', padding: 4, width: 40 }}>SL</th>
              <th style={{ border: '1px solid #000', padding: 4, width: 80 }}>Đơn giá</th>
              <th style={{ border: '1px solid #000', padding: 4, width: 85 }}>Thành tiền</th>
              <th style={{ border: '1px solid #000', padding: 4, width: 50 }}>Tỷ lệ %</th>
              <th style={{ border: '1px solid #000', padding: 4, width: 85 }}>Quỹ BHYT (đ)</th>
              <th style={{ border: '1px solid #000', padding: 4, width: 85 }}>BN cùng chi trả</th>
              <th style={{ border: '1px solid #000', padding: 4, width: 75 }}>BN tự trả</th>
            </tr>
            <tr style={{ textAlign: 'center', fontStyle: 'italic', background: '#f1f5f9', fontSize: '10px' }}>
              <td style={{ border: '1px solid #000' }}>(1)</td>
              <td style={{ border: '1px solid #000' }}>(2)</td>
              <td style={{ border: '1px solid #000' }}>(3)</td>
              <td style={{ border: '1px solid #000' }}>(4)</td>
              <td style={{ border: '1px solid #000' }}>(5)</td>
              <td style={{ border: '1px solid #000' }}>(6)</td>
              <td style={{ border: '1px solid #000' }}>(7)</td>
              <td style={{ border: '1px solid #000' }}>(8)</td>
              <td style={{ border: '1px solid #000' }}>(9)</td>
              <td style={{ border: '1px solid #000' }}>(10)</td>
            </tr>
          </thead>
          <tbody>
            <tr style={{ fontWeight: 'bold', background: '#fafafa' }}>
              <td style={{ border: '1px solid #000', textAlign: 'center' }}>A</td>
              <td colSpan={9} style={{ border: '1px solid #000', padding: 4 }}>CHI PHÍ TRONG DANH MỤC BHYT</td>
            </tr>
            {items.map((it: any, idx: number) => {
              const itemTotal = it.thanhTien || (it.soLuong * it.donGia);
              const bhytPay = Math.round(itemTotal * 0.8);
              const patientCopay = itemTotal - bhytPay;
              return (
                <tr key={idx}>
                  <td style={{ border: '1px solid #000', textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ border: '1px solid #000', padding: '3px 6px' }}>{it.moTa || it.tenDichVu}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'center' }}>{it.donViTinh || (it.loaiDoiTuong === 'THUOC' ? 'Viên' : 'Lần')}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'center' }}>{it.soLuong}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'right' }}>{(it.donGia || 0).toLocaleString('vi-VN')}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'right' }}>{itemTotal.toLocaleString('vi-VN')}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'center' }}>80%</td>
                  <td style={{ border: '1px solid #000', textAlign: 'right' }}>{bhytPay.toLocaleString('vi-VN')}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'right' }}>{patientCopay.toLocaleString('vi-VN')}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'right' }}>0</td>
                </tr>
              );
            })}
            <tr style={{ fontWeight: 'bold', background: '#f8fafc' }}>
              <td colSpan={5} style={{ border: '1px solid #000', textAlign: 'right', padding: 4 }}>TỔNG CỘNG (VNĐ):</td>
              <td style={{ border: '1px solid #000', textAlign: 'right', padding: 4 }}>{totalCost.toLocaleString('vi-VN')}</td>
              <td style={{ border: '1px solid #000' }}></td>
              <td style={{ border: '1px solid #000', textAlign: 'right', padding: 4, color: '#0369a1' }}>{insuranceCover.toLocaleString('vi-VN')}</td>
              <td style={{ border: '1px solid #000', textAlign: 'right', padding: 4, color: '#b91c1c' }}>{patientPay.toLocaleString('vi-VN')}</td>
              <td style={{ border: '1px solid #000', textAlign: 'right', padding: 4 }}>0</td>
            </tr>
          </tbody>
        </table>

        {/* TỔNG KẾT BẰNG CHỮ */}
        <div style={{ fontSize: '12px', marginTop: 8 }}>
          <div>- Số tiền Quỹ BHYT thanh toán: <strong>{insuranceCover.toLocaleString('vi-VN')} đồng</strong></div>
          <div>- Số tiền Người bệnh phải chi trả: <strong>{patientPay.toLocaleString('vi-VN')} đồng</strong></div>
        </div>

        {/* 3 CHỮ KÝ THEO QUY ĐỊNH BỘ Y TẾ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center', marginTop: 24, fontSize: '12px' }}>
          <div>
            <div style={{ fontWeight: 'bold' }}>NGƯỜI BỆNH / ĐẠI DIỆN</div>
            <div style={{ fontStyle: 'italic', fontSize: '11px' }}>(Ký, ghi rõ họ tên)</div>
          </div>
          <div>
            <div style={{ fontWeight: 'bold' }}>NGƯỜI LẬP BẢNG KÊ</div>
            <div style={{ fontStyle: 'italic', fontSize: '11px' }}>(Ký, ghi rõ họ tên)</div>
          </div>
          <div>
            <div style={{ fontStyle: 'italic', fontSize: '11px' }}>Ngày 11 tháng 08 năm 2022</div>
            <div style={{ fontWeight: 'bold' }}>KẾ TOÁN VIỆN PHÍ</div>
            <div style={{ fontStyle: 'italic', fontSize: '11px' }}>(Ký, đóng dấu)</div>
            <div style={{ height: 40 }}></div>
            <div style={{ fontWeight: 'bold' }}>Lê Văn Thu Ngân</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
export default MedicalBillingSlipModal;
