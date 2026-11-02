import React from 'react';
import { Button, Modal, Space, Tag } from 'antd';
import { Printer, Download } from 'lucide-react';
import dayjs from 'dayjs';
import type { PayrollLine, PayrollPeriod } from '../payroll.api';

interface PayslipPrintModalProps {
  open: boolean;
  onClose: () => void;
  line: PayrollLine | null;
  period: PayrollPeriod | null;
}

const money = (val?: number) => `${Number(val || 0).toLocaleString('vi-VN')} đ`;

// Helper chuyển số tiền sang chữ tiếng Việt cơ bản
function docSoTienBangChu(soTien: number): string {
  if (!soTien || soTien <= 0) return 'Không đồng';
  const chuSo = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const lop = ['', 'nghìn', 'triệu', 'tỷ'];

  const docBaChuSo = (so: number): string => {
    let tram = Math.floor(so / 100);
    let chuc = Math.floor((so % 100) / 10);
    let donVi = so % 10;
    let res = '';

    if (tram > 0) res += `${chuSo[tram]} trăm `;
    if (chuc > 1) {
      res += `${chuSo[chuc]} mươi `;
      if (donVi === 1) res += 'mốt ';
      else if (donVi === 5) res += 'lăm ';
      else if (donVi > 0) res += `${chuSo[donVi]} `;
    } else if (chuc === 1) {
      res += 'mười ';
      if (donVi === 5) res += 'lăm ';
      else if (donVi > 0) res += `${chuSo[donVi]} `;
    } else if (tram > 0 && donVi > 0) {
      res += `lẻ ${chuSo[donVi]} `;
    } else if (donVi > 0) {
      res += `${chuSo[donVi]} `;
    }
    return res;
  };

  let str = '';
  let i = 0;
  let s = Math.round(soTien);

  while (s > 0) {
    let baChuSo = s % 1000;
    if (baChuSo > 0) {
      let chu = docBaChuSo(baChuSo);
      str = `${chu}${lop[i]} ${str}`;
    }
    s = Math.floor(s / 1000);
    i++;
  }
  const trimmed = str.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1) + ' đồng';
}

export const PayslipPrintModal: React.FC<PayslipPrintModalProps> = ({
  open,
  onClose,
  line,
  period,
}) => {
  if (!line || !period) return null;

  const handlePrint = () => {
    window.print();
  };

  const tongThuNhap = Number(line.tongThuNhap || 0);
  const tongKhauTru = Number(line.tongGiamTru || 0);

  const hasDebt = Number(line.tienNoKyNay || 0) > 0;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={780}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button onClick={onClose}>Đóng</Button>
          <Button type="primary" icon={<Printer size={16} />} onClick={handlePrint} style={{ background: '#0b4f6c' }}>
            In phiếu lương
          </Button>
        </div>
      }
    >
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-payslip, #printable-payslip * {
              visibility: visible;
            }
            #printable-payslip {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 24px;
              box-shadow: none !important;
            }
          }
        `}
      </style>

      <div
        id="printable-payslip"
        style={{
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          color: '#1e293b',
          padding: '16px 20px',
        }}
      >
        {/* HEADER PHÒNG KHÁM */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0b4f6c', textTransform: 'uppercase' }}>
              HỆ THỐNG PHÒNG KHÁM ĐA KHOA CLINIC MANAGEMENT
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Địa chỉ: 123 Đường Y Tế, Phường Trung Tâm, TP. Hồ Chí Minh
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Hotline: (028) 3888 9999 • Email: hr@clinicmanagement.vn
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>MẪU SỐ: 02-LĐTL</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>(Ban hành theo Thông tư BTC)</div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
              Số: PL-{period.thang}{period.nam}/NV{line.maNhanVien}
            </div>
          </div>
        </div>

        {/* TIÊU ĐỀ PHIẾU LƯƠNG */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            PHIẾU LƯƠNG NHÂN VIÊN
          </div>
          <div style={{ fontSize: 13, color: '#475569', marginTop: 4, fontWeight: 500 }}>
            Kỳ tính lương: Tháng {period.thang}/{period.nam} ({dayjs(period.tuNgay).format('DD/MM/YYYY')} - {dayjs(period.denNgay).format('DD/MM/YYYY')})
          </div>
        </div>

        {/* THÔNG TIN NHÂN SỰ */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 16 }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 8px', width: '18%', color: '#64748b' }}>Họ và tên:</td>
                <td style={{ padding: '4px 8px', width: '32%', fontWeight: 700, fontSize: 14 }}>{line.tenNhanVien}</td>
                <td style={{ padding: '4px 8px', width: '18%', color: '#64748b' }}>Mã nhân viên:</td>
                <td style={{ padding: '4px 8px', width: '32%', fontWeight: 600 }}>#{line.maNhanVien}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 8px', color: '#64748b' }}>Khoa / Phòng:</td>
                <td style={{ padding: '4px 8px', fontWeight: 600 }}>{line.tenKhoa || 'Phòng khám tổng quát'}</td>
                <td style={{ padding: '4px 8px', color: '#64748b' }}>Chức danh:</td>
                <td style={{ padding: '4px 8px', fontWeight: 600 }}>{line.chucDanh || 'Bác sĩ / Nhân viên'}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 8px', color: '#64748b' }}>Lương cơ bản:</td>
                <td style={{ padding: '4px 8px', fontWeight: 600 }}>{money(line.luongCoBan)}</td>
                <td style={{ padding: '4px 8px', color: '#64748b' }}>Công làm việc:</td>
                <td style={{ padding: '4px 8px', fontWeight: 600 }}>
                  <span style={{ color: '#2563eb' }}>{line.soNgayCong} ngày</span> (Nghỉ không lương: {line.soNgayNghiKhongLuong} ngày)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* BẢNG THU NHẬP & KHẤU TRỪ 2 CỘT */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }}>
          <thead>
            <tr style={{ background: '#0b4f6c', color: '#ffffff' }}>
              <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', width: '50%', textAlign: 'left' }}>
                I. CÁC KHOẢN THU NHẬP (CỘNG)
              </th>
              <th style={{ border: '1px solid #cbd5e1', padding: '8px 10px', width: '50%', textAlign: 'left' }}>
                II. CÁC KHOẢN KHẤU TRỪ (TRỪ)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {/* CỘT THU NHẬP */}
              <td style={{ border: '1px solid #e2e8f0', verticalAlign: 'top', padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '6px 10px', borderBottom: '1px solid #f1f5f9' }}>1. Lương theo ngày công ({line.soNgayCong} ngày)</td>
                      <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>
                        {money(line.luongTheoNgayCong)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 10px', borderBottom: '1px solid #f1f5f9' }}>2. Làm thêm giờ (Tăng ca OT)</td>
                      <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600, borderBottom: '1px solid #f1f5f9', color: '#d97706' }}>
                        +{money(line.tienTangCa)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 10px', borderBottom: '1px solid #f1f5f9' }}>3. Phụ cấp cố định & trách nhiệm</td>
                      <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>
                        +{money(line.tongPhuCap)}
                      </td>
                    </tr>
                    {/* Liệt kê các phụ cấp chi tiết nếu có */}
                    {(line.chiTiets || [])
                      .filter((x) => x.loaiKhoan === 'PHU_CAP')
                      .map((item, idx) => (
                        <tr key={idx} style={{ background: '#f8fafc' }}>
                          <td style={{ padding: '4px 10px 4px 20px', fontSize: 12, color: '#475569' }}>
                            • {item.tenKhoan} {item.ghiChu ? `(${item.ghiChu})` : ''}
                          </td>
                          <td style={{ padding: '4px 10px', textAlign: 'right', fontSize: 12, color: '#16a34a' }}>
                            +{money(item.soTien)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </td>

              {/* CỘT KHẤU TRỪ */}
              <td style={{ border: '1px solid #e2e8f0', verticalAlign: 'top', padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '6px 10px', borderBottom: '1px solid #f1f5f9' }}>1. Bảo hiểm bắt buộc (10.5%)</td>
                      <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600, borderBottom: '1px solid #f1f5f9', color: '#6366f1' }}>
                        -{money(line.tienBaoHiem)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 10px', borderBottom: '1px solid #f1f5f9' }}>2. Trừ nghỉ không lương</td>
                      <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600, borderBottom: '1px solid #f1f5f9', color: '#dc2626' }}>
                        -{money(line.khauTruNghiKhongLuong)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 10px', borderBottom: '1px solid #f1f5f9' }}>3. Phạt đi muộn (50k/lượt)</td>
                      <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600, borderBottom: '1px solid #f1f5f9', color: '#ea580c' }}>
                        -{money(line.khauTruDiMuonVeSom)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 10px', borderBottom: '1px solid #f1f5f9' }}>4. Khấu trừ khác</td>
                      <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600, borderBottom: '1px solid #f1f5f9', color: '#dc2626' }}>
                        -{money(line.tongKhauTru)}
                      </td>
                    </tr>
                    {(line.chiTiets || [])
                      .filter((x) => x.loaiKhoan === 'KHAU_TRU')
                      .map((item, idx) => (
                        <tr key={idx} style={{ background: '#fef2f2' }}>
                          <td style={{ padding: '4px 10px 4px 20px', fontSize: 12, color: '#991b1b' }}>
                            • {item.tenKhoan} {item.ghiChu ? `(${item.ghiChu})` : ''}
                          </td>
                          <td style={{ padding: '4px 10px', textAlign: 'right', fontSize: 12, color: '#dc2626' }}>
                            -{money(item.soTien)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </td>
            </tr>

            {/* DÒNG TỔNG CỘNG 2 BÊN */}
            <tr style={{ background: '#f1f5f9', fontWeight: 700 }}>
              <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', display: 'flex', justifyContent: 'space-between' }}>
                <span>TỔNG THU NHẬP (I):</span>
                <span style={{ color: '#15803d' }}>{money(tongThuNhap)}</span>
              </td>
              <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>TỔNG KHẤU TRỪ (II):</span>
                  <span style={{ color: '#b91c1c' }}>-{money(tongKhauTru)}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* THỰC LĨNH & SỐ TIỀN BẰNG CHỮ */}
        <div style={{ border: '2px solid #0b4f6c', borderRadius: 8, padding: '12px 16px', background: '#f0fdf4', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#0b4f6c' }}>SỐ TIỀN THỰC LĨNH KỲ NÀY:</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: hasDebt ? '#d97706' : '#15803d' }}>
              {hasDebt ? '0 đ' : money(line.thucLinh)}
            </span>
          </div>
          <div style={{ fontSize: 13, color: '#334155', marginTop: 4 }}>
            Bằng chữ: <em>{docSoTienBangChu(hasDebt ? 0 : line.thucLinh)}</em>
          </div>
          {hasDebt && (
            <div style={{ fontSize: 12, color: '#b45309', marginTop: 4, fontWeight: 600 }}>
              * Nhân viên phát sinh dư nợ khấu trừ: -{money(line.tienNoKyNay)}. Số tiền này sẽ được cấn trừ vào kỳ lương tháng tiếp theo.
            </div>
          )}
        </div>

        {/* KHU VỰC KÝ TÊN 3 BÊN */}
        <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', marginTop: 32 }}>
          <div style={{ width: '30%' }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>NGƯỜI LẬP BIỂU</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>(Ký, ghi rõ họ tên)</div>
            <div style={{ height: 60 }} />
            <div style={{ fontWeight: 600, fontSize: 13 }}>Kế toán lương</div>
          </div>
          <div style={{ width: '30%' }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>KẾ TOÁN TRƯỞNG</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>(Ký, duyệt chi)</div>
            <div style={{ height: 60 }} />
            <div style={{ fontWeight: 600, fontSize: 13 }}>Trưởng phòng Tài chính</div>
          </div>
          <div style={{ width: '30%' }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>NGƯỜI NHẬN TIỀN</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>(Ký, ghi rõ ngày nhận)</div>
            <div style={{ height: 60 }} />
            <div style={{ fontWeight: 600, fontSize: 13 }}>{line.tenNhanVien}</div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
