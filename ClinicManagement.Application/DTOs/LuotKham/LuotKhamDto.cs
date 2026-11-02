using System;
using System.Collections.Generic;

namespace ClinicManagement.Application.DTOs.LuotKham
{
    public class LuotKhamDto
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
        public DateTime NgayKham { get; set; }
        public DateTime? ThoiGianBatDauKham { get; set; }
        public DateTime? ThoiGianKetThucKham { get; set; }
        public string LyDoKham { get; set; } = string.Empty;
        public string PhongKham { get; set; } = string.Empty;
        public int? MaLichHen { get; set; }
        public string? LichHenThoiGian { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsDeleted { get; set; }

        public List<ChanDoanDto> ChanDoans { get; set; } = new();
        public SinhHieuDto? SinhHieu { get; set; }
        public List<ChiDinhDichVuDto> ChiDinhDichVus { get; set; } = new();
        public List<DonThuocDto> DonThuocs { get; set; } = new();
    }
}