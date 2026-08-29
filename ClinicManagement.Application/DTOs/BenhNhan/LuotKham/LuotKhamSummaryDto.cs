using System;

namespace ClinicManagement.Application.DTOs.BenhNhan
{
    public class LuotKhamSummaryDto
    {
        public int Id { get; set; }
        public DateTime NgayKham { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public string BacSi { get; set; } = string.Empty;
        public string Khoa { get; set; } = string.Empty;
        public string LyDoKham { get; set; } = string.Empty;
        public string ChanDoanChinh { get; set; } = string.Empty;
    }
}