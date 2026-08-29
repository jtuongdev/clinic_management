// Application/DTOs/BenhNhan/DonThuocDto.cs
using System;
using System.Collections.Generic;

namespace ClinicManagement.Application.DTOs.BenhNhan
{
    public class DonThuocDto
    {
        public int Id { get; set; }
        public DateTime NgayKe { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public string GhiChu { get; set; } = string.Empty;
        public List<ChiTietDonThuocDto> ChiTiet { get; set; } = new();
    }
}