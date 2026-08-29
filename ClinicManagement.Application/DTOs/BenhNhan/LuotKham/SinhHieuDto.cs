// Application/DTOs/BenhNhan/SinhHieuDto.cs
using System;

namespace ClinicManagement.Application.DTOs.BenhNhan
{
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
}