using System;
using System.Collections.Generic;
using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Common.Enums;
using ClinicManagement.Domain.Examination;
using ClinicManagement.Domain.Facility;
using ClinicManagement.Domain.Patient;

namespace ClinicManagement.Domain.Billing
{
    public class HoaDon : BaseEntity, IAggregateRoot
    {
        public string SoHoaDon { get; private set; }
        public int MaLuotKham { get; private set; }
        public int MaBenhNhan { get; private set; }
        public int MaCoSo { get; private set; }
        public DateTime NgayLap { get; private set; }
        public decimal TongTien { get; private set; }
        public decimal SoTienBaoHiemChiTra { get; private set; }
        public decimal SoTienBenhNhanChiTra { get; private set; }
        public decimal DaThanhToan { get; private set; }
        public TrangThaiHoaDon TrangThai { get; private set; }
        public string GhiChu { get; private set; }
        public int? CreatedBy { get; private set; }

        // Navigation
        public virtual LuotKham LuotKham { get; set; }
        public virtual BenhNhan BenhNhan { get; set; }
        public virtual CoSo CoSo { get; set; }
        public virtual ICollection<ChiTietHoaDon> ChiTietHoaDons { get; private set; }
        public virtual ICollection<PhieuThu> PhieuThus { get; private set; }
        public virtual CongNoBenhNhan CongNoBenhNhan { get; set; }

        private HoaDon() { }

        public HoaDon(int maLuotKham, int maBenhNhan, int maCoSo, string soHoaDon, int createdBy)
        {
            MaLuotKham = maLuotKham;
            MaBenhNhan = maBenhNhan;
            MaCoSo = maCoSo;
            SoHoaDon = soHoaDon;
            CreatedBy = createdBy;
            NgayLap = DateTime.UtcNow;
            TrangThai = TrangThaiHoaDon.CHO_THANH_TOAN; 
            TongTien = 0;
            SoTienBaoHiemChiTra = 0;
            SoTienBenhNhanChiTra = 0;
            DaThanhToan = 0;

            ChiTietHoaDons = new List<ChiTietHoaDon>();
            PhieuThus = new List<PhieuThu>();
        }

        public void AddServiceOrDrug(string loaiDoiTuong, int maDoiTuong, string moTa, 
                                    decimal soLuong, decimal donGia)
        {
            if (TrangThai == TrangThaiHoaDon.DA_THANH_TOAN || TrangThai == TrangThaiHoaDon.DA_HUY)
                throw new InvalidOperationException("Không thể thêm dịch vụ/thuốc vào hóa đơn đã thanh toán hoặc đã hủy.");

            if (soLuong <= 0 || donGia < 0)
                throw new ArgumentException("Số lượng phải lớn hơn 0 và đơn giá không được âm.");

            var chiTiet = new ChiTietHoaDon
            {
                MaHoaDon = Id,
                LoaiDoiTuong = loaiDoiTuong,
                MaDoiTuong = maDoiTuong,
                MoTa = moTa,
                SoLuong = soLuong,
                DonGia = donGia,
                CreatedBy = CreatedBy
            };
            ChiTietHoaDons.Add(chiTiet);
            // Cập nhật tổng tiền
            TongTien += soLuong * donGia;
            SoTienBenhNhanChiTra = TongTien - SoTienBaoHiemChiTra; 
        }
        
        public void ApplyInsurance(decimal baoHiemChiTra)
        {
            if (TrangThai == TrangThaiHoaDon.DA_THANH_TOAN || TrangThai == TrangThaiHoaDon.DA_HUY)
                throw new InvalidOperationException("Không thể áp dụng bảo hiểm cho hóa đơn đã thanh toán hoặc đã hủy.");

            if (baoHiemChiTra < 0)
                throw new ArgumentException("Số tiền bảo hiểm chi trả không được âm.");

            if (baoHiemChiTra > TongTien)
                throw new InvalidOperationException("Số tiền bảo hiểm chi trả không thể vượt quá tổng tiền hóa đơn.");

            SoTienBaoHiemChiTra = baoHiemChiTra;
            SoTienBenhNhanChiTra = TongTien - baoHiemChiTra;
        }

        public void RecordPayment(decimal amount, PhuongThucThanhToan phuongThuc, int nguoiThu)
        {
            if (TrangThai == TrangThaiHoaDon.DA_HUY)
                throw new InvalidOperationException("Không thể thực hiện thanh toán cho hóa đơn đã bị hủy.");

            if (amount <= 0)
                throw new ArgumentException("Số tiền thanh toán phải lớn hơn 0.");

            if (DaThanhToan + amount > SoTienBenhNhanChiTra)
                throw new InvalidOperationException("Số tiền thanh toán vượt quá số tiền bệnh nhân phải trả.");

            DaThanhToan += amount;

            // Đồng bộ sang bảng công nợ bệnh nhân nếu có
            if (CongNoBenhNhan != null)
            {
                CongNoBenhNhan.UpdatePayment(amount);
            }

            // Tạo phiếu thu
            var phieuThu = new PhieuThu
            {
                SoPhieuThu = $"PT{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}",
                MaBenhNhan = MaBenhNhan,
                MaLuotKham = MaLuotKham,
                MaHoaDon = Id,
                SoTien = amount,
                NgayThu = DateTime.UtcNow,
                PhuongThuc = phuongThuc,
                MaNguoiThu = nguoiThu,
                CreatedBy = CreatedBy
            };
            PhieuThus.Add(phieuThu);

            // Cập nhật trạng thái hóa đơn dựa trên số tiền đã nộp
            if (DaThanhToan >= SoTienBenhNhanChiTra)
                TrangThai = TrangThaiHoaDon.DA_THANH_TOAN; // ĐÃ SỬA: Từ PAID sang DA_THANH_TOAN
            else if (DaThanhToan > 0)
                TrangThai = TrangThaiHoaDon.THANH_TOAN_MOT_PHAN; // ĐÃ SỬA: Từ PARTIAL sang THANH_TOAN_MOT_PHAN
        }

        /// <summary>
        /// Phương thức bổ sung nhằm hỗ trợ nghiệp vụ hủy hóa đơn sai sót
        /// </summary>
        public void HuyHoaDon()
        {
            if (TrangThai == TrangThaiHoaDon.DA_THANH_TOAN || TrangThai == TrangThaiHoaDon.THANH_TOAN_MOT_PHAN)
                throw new InvalidOperationException("Không thể hủy hóa đơn đã phát sinh giao dịch thanh toán.");

            TrangThai = TrangThaiHoaDon.DA_HUY;
        }

        public decimal SoTienConNo() => SoTienBenhNhanChiTra - DaThanhToan;
        public bool IsFullyPaid() => DaThanhToan >= SoTienBenhNhanChiTra;
    }
}
