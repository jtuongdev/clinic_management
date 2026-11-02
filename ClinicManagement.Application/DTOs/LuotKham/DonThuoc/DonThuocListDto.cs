
using System;

namespace ClinicManagement.Application.DTOs.LuotKham
{
    public class DonThuocListDto
    {
        public int Id { get; set; }
        public string MaBenhNhanNoiBo { get; set; } = string.Empty;
        public string TenBenhNhan { get; set; } = string.Empty;
        public string TenBacSi { get; set; } = string.Empty;
        public string TenKhoa { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;
        public int SoLuongThuoc { get; set; }
        public decimal TongTien { get; set; }
        public DateTime NgayKe { get; set; }
        public DateTime? NgayCapThuoc { get; set; }
        public int MaLuotKham { get; set; }
        public int MaBenhNhan { get; set; }
        public int MaBacSi { get; set; }
        public int MaCoSo { get; set; }
    }

    public class ThongKeDonThuocDto
    {
        public int TongDonThuoc { get; set; }
        public int DaDuyet { get; set; }
        public int DaXuatHet { get; set; }
        public int DaHuy { get; set; }
        public int Tam { get; set; }
    }
}