using System;
using System.Collections.Generic;

namespace ClinicManagement.Application.DTOs.LuotKham
{
    public class LuotKhamDetailDto
    {
        public int Id { get; set; }
        public int MaBenhNhan { get; set; }
        public string TenBenhNhan { get; set; } = string.Empty;
        public string MaBenhNhanNoiBo { get; set; } = string.Empty;
        public int? MaBacSi { get; set; }
        public string TenBacSi { get; set; } = string.Empty;
        public string ChuyenKhoaBacSi { get; set; } = string.Empty;
        public int MaKhoa { get; set; }
        public string TenKhoa { get; set; } = string.Empty;
        public int MaCoSo { get; set; }
        public string TenCoSo { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;
        public string HinhThucDieuTri { get; set; } = string.Empty;
        public int? SoThuTu { get; set; }
        public string TenPhongKham { get; set; } = string.Empty;
        public DateTime NgayKham { get; set; }
        public DateTime? ThoiGianBatDauKham { get; set; }
        public DateTime? ThoiGianKetThucKham { get; set; }
        public string LyDoKham { get; set; } = string.Empty;
        public string PhongKham { get; set; } = string.Empty;
        public int? MaLichHen { get; set; }
        public string? LichHenThoiGian { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsDeleted { get; set; }

        public TreatmentSummaryDto ToTreatmentSummary()
        {
            return new TreatmentSummaryDto
            {
                LuotKhamId = Id,
                MaLuotKham = Id.ToString(),
                Khoa = TenKhoa,
                Phong = TenPhongKham,
                TrangThai = TrangThai,
                NgayKham = NgayKham,
                SoThuTu = SoThuTu,
            };
        }

        // Danh sách chẩn đoán
        public List<ChanDoanDto> ChanDoans { get; set; } = new();

        // Sinh hiệu (lấy mới nhất)
        public SinhHieuDto? SinhHieu { get; set; }

        // Chỉ định dịch vụ
        public List<ChiDinhDichVuDto> ChiDinhDichVus { get; set; } = new();

        // Đơn thuốc
        public List<DonThuocDto> DonThuocs { get; set; } = new();
    }

    public class TreatmentSummaryDto
    {
        public int LuotKhamId { get; set; }
        public string MaLuotKham { get; set; } = string.Empty;
        public string Khoa { get; set; } = string.Empty;
        public string Phong { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;
        public DateTime NgayKham { get; set; }
        public int? SoThuTu { get; set; }
    }

    public class ChanDoanDto
    {
        public int Id { get; set; }
        public string MaICD { get; set; } = string.Empty;
        public string TenICD { get; set; } = string.Empty;
        public string TenChanDoan { get; set; } = string.Empty;
        public bool LaChanDoanChinh { get; set; }
        public string GhiChu { get; set; } = string.Empty;
    }

    public class SinhHieuDto
    {
        public int? HuyetApTamThu { get; set; }
        public int? HuyetApTamTruong { get; set; }
        public int? Mach { get; set; }
        public decimal? NhietDo { get; set; }
        public decimal? CanNang { get; set; }
        public decimal? ChieuCao { get; set; }
        public decimal? SpO2 { get; set; }
        public DateTime ThoiDiemDo { get; set; }
    }

    public class ChiDinhDichVuDto
    {
        public int Id { get; set; }
        public string TenDichVu { get; set; } = string.Empty;
        public string LoaiDichVu { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;
        public DateTime NgayChiDinh { get; set; }
        public DateTime? NgayThucHien { get; set; }
        public DateTime? NgayCoKetQua { get; set; }
        public string KetLuan { get; set; } = string.Empty;
        public string UrlKetQua { get; set; } = string.Empty;
        public List<ChiTietKetQuaXetNghiemDto> KetQuaChiTiet { get; set; } = new();
    }

    public class ChiTietKetQuaXetNghiemDto
    {
        public string TenChiSo { get; set; } = string.Empty;
        public string GiaTri { get; set; } = string.Empty;
        public string DonVi { get; set; } = string.Empty;
        public string KhoangThamChieu { get; set; } = string.Empty;
        public bool? BatThuong { get; set; }
    }

    public class DonThuocDto
    {
        public int Id { get; set; }
        public DateTime NgayKe { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public string GhiChu { get; set; } = string.Empty;
        public List<ChiTietDonThuocDto> ChiTiet { get; set; } = new();
    }

    public class ChiTietDonThuocDto
    {
        public string TenThuoc { get; set; } = string.Empty;
        public string DonViTinh { get; set; } = string.Empty;
        public decimal SoLuongKe { get; set; }
        public decimal SoLuongDaXuat { get; set; }
        public string LieuDung { get; set; } = string.Empty;
        public string TanSuat { get; set; } = string.Empty;
        public int? SoNgay { get; set; }
        public string HuongDan { get; set; } = string.Empty;
        public decimal DonGia { get; set; }
        public decimal ThanhTien => SoLuongKe * DonGia;
    }
}