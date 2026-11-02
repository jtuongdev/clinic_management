using System;
using System.Collections.Generic;

namespace ClinicManagement.Application.DTOs.LuotKham
{
    public class LuotKhamStatsDto
    {
        public int TongLuotKham { get; set; }
        public int HomNay { get; set; }
        public int TuanNay { get; set; }
        public int ThangNay { get; set; }
        public List<TrangThaiCountDto> TheoTrangThai { get; set; } = new();
        public List<KhoaCountDto> TheoKhoa { get; set; } = new();
    }

    public class TrangThaiCountDto
    {
        public string TrangThai { get; set; } = string.Empty;
        public int SoLuong { get; set; }
    }

    public class KhoaCountDto
    {
        public int MaKhoa { get; set; }
        public string TenKhoa { get; set; } = string.Empty;
        public int SoLuong { get; set; }
    }
}