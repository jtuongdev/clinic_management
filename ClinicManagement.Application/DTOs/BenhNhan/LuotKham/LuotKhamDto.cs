using System;
using System.Collections.Generic;

namespace ClinicManagement.Application.DTOs.BenhNhan
{
    public class LuotKhamDto
    {
        public int Id { get; set; }
        public DateTime NgayKham { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public string HinhThucDieuTri { get; set; } = string.Empty;
        public string LyDoKham { get; set; } = string.Empty;
        public string TenPhongKham { get; set; } = string.Empty; 
        public DateTime? ThoiGianBatDauKham { get; set; }
        public DateTime? ThoiGianKetThucKham { get; set; }

        public string BacSi { get; set; } = string.Empty;
        public string ChuyenKhoaBacSi { get; set; } = string.Empty;
        public string Khoa { get; set; } = string.Empty;

        public List<ChanDoanDto> ChanDoans { get; set; } = new();
        public SinhHieuDto? SinhHieu { get; set; }
        public List<ChiDinhDichVuDto> ChiDinhDichVus { get; set; } = new();
        public List<DonThuocDto> DonThuocs { get; set; } = new();
    }
}