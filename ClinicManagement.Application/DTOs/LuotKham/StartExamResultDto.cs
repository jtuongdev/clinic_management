using System;

namespace ClinicManagement.Application.DTOs.LuotKham
{
    public class StartExamResultDto
    {
        public int Id { get; set; }
        public int MaBenhNhan { get; set; }
        public int? MaBacSi { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public DateTime? ThoiGianBatDauKham { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
