// Application/DTOs/BenhNhan/PhieuThuDto.cs
using System;

namespace ClinicManagement.Application.DTOs.BenhNhan
{
    public class PhieuThuDto
    {
        public int Id { get; set; }
        public string SoPhieuThu { get; set; } = string.Empty;
        public decimal SoTien { get; set; }
        public DateTime NgayThu { get; set; }
        public string PhuongThuc { get; set; } = string.Empty;
        public string NguoiThu { get; set; } = string.Empty;
        public string GhiChu { get; set; } = string.Empty;
    }
}