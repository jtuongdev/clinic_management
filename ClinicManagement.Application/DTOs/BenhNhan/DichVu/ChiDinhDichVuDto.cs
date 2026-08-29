// Application/DTOs/BenhNhan/ChiDinhDichVuDto.cs
using System;
using System.Collections.Generic;

namespace ClinicManagement.Application.DTOs.BenhNhan
{
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

}